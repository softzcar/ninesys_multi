<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <div class="input-label">{{ msg }}</div>
        </b-col>
      </b-row>
      <b-overlay :show="overlay" spinner-small>
        <b-row v-if="showControl">
          <b-col style="text-center">
            <p style="margin-top: -12px; text-transform: uppercase">
              {{ responseData.paso }}
            </p>
            <b-progress
              :max="max"
              variant="success"
              style="width: 100% !important; height: 20px; margin-top: -14px"
            >
              <b-progress-bar :value="miValue">
                <span class="floatme"
                  ><strong style="padding: 0 6px"
                    >{{ value.toFixed(0) }}%
                  </strong>
                </span>
                <span class="floatme">
                  {{ departamento }}
                </span>
              </b-progress-bar>
            </b-progress>
          </b-col>
        </b-row>
      </b-overlay>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      showControl: false,
      departamento: "",
      responseData: null,
      overlay: true,
      paso: "",
      status: "",
      msg: "",
      msgPaso: "",
      departamento: "Departamento",
      value: 0,
      max: 100,
    };
  },

  computed: {
    miValue() {
      if (this.value < 20) {
        return 25;
      } else {
        return this.value;
      }
    },
  },

  methods: {
    async getPorcentaje() {
      this.overlay = true;
      await axios
        .get(`${this.$config.API}/produccion/progressbar/${this.idOrden}`)
        .then((res) => {
          this.departamento = res.data.departamento;
          this.responseData = res.data;
          this.value = res.data.porcentaje;
          this.paso = res.data.paso;
          this.status = res.data.status;
          this.overlay = false;
          this.showControl = true;
          this.msg = ``;
        })
        .catch((err) => {
          this.msg = `La información de la orden ${this.idOrden} no está disponible`;
          console.error(
            "Error al obtener los datos del servidor para prgressBar",
            err
          );
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  props: ["idOrden"],

  beforeMount() {
    this.getPorcentaje();
    /* if (this.$route.params.progreso != undefined) {
      this.idOrden = this.$route.params.progreso
      this.getPorcentaje()
    } */
  },

  mounted() {},
};
</script>

<style scoped>
.input-search {
  max-width: 40%;
  width: 40%;
  margin: 0 auto;
  text-align: center;
  font-weight: bold;
  padding: 8px;
  font-size: 1.6rem !important;
  border: 1px solid green;
  border-radius: 5px;
  outline: none;
  color: #525353;
}

.input-search::-webkit-outer-spin-button,
.input-search::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-label {
  text-align: center;
  margin-bottom: 8px;
  font-size: 0.8rem !important;
  color: #525353;
}

@media (max-width: 768px) {
  .input-search {
    max-width: 40%;
    width: 40%;
  }
}
</style>
