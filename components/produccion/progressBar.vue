<template>
  <div>
    <b-alert
      v-if="status === 'terminado'"
      show
      variant="success"
    >TERMINADA</b-alert>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <div class="floatme">
        <b-progress
          :max="max"
          variant="success"
        >
          <b-progress-bar :value="miPorcentaje">
            <span><strong>{{ miPorcentaje }}%</strong>
              {{ this.departamento }}
            </span>
          </b-progress-bar>
        </b-progress>
      </div>
      <div class="floatme">
        <inventario-prioridad-switch :item="item" />
      </div>

      <div class="floatme">
        <produccion-asignar
          :reload="reload"
          :id="item.orden"
        />
      </div>
      <div class="floatme">
        <produccion-reposicion
          :departamento="
                        this.$store.state.login.dataUser.departamento
                    "
          :reload="reload"
          :item="item"
        />
      </div>
      <div>
        <!-- <div class="floatme">
          <b-form-select
            v-model="selected"
            :options="options"
            size="sm"
            class="mt-3"
            style="width: 240px; margin-right: 6px"
            @change="setPaso"
          ></b-form-select>
        </div> -->
      </div>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      departamento: "",
      status: null,
      responseData: null,
      reload: false,
      overlay: true,
      paso: "",
      value: 0,
      max: 100,
      paso: this.$store.state.produccion.dataPorcentaje.paso,
      selected: this.$store.state.produccion.dataPorcentaje.paso,
      /* options: [
        { value: 'sin_asignar', text: 'Seleccione una opción' },
        { value: 'corte', text: 'Corte' },
        { value: 'impresion', text: 'Impresión' },
        { value: 'estampado', text: 'Estampado' },
        { value: 'costura', text: 'Costura' },
        { value: 'limpieza', text: 'Limpieza' },
        { value: 'revision', text: 'Revisión' },
      ], */
    };
  },

  computed: {
    miPorcentaje() {
      let porcentaje;

      if (this.departamento === "produccion") {
        porcentaje = 0;
      } else {
        let paso;

        switch (this.departamento) {
          case "Corte":
            paso = 1;
            break;

          case "Impresión":
            paso = 2;
            break;

          case "Estampado":
            paso = 3;
            break;

          case "Costura":
            paso = 4;
            break;

          case "Limpieza":
            paso = 5;
            break;

          case "Revisión":
            paso = 6;
            break;

          default:
            paso = 1;
            break;
        }
        porcentaje = parseInt((paso * 100) / 6);
      }

      return porcentaje;
    },
  },

  methods: {
    clickedSomething(val) {
      console.log(`clickedSomething`, val);
    },
    setPaso(val) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("paso", val);
      data.set("id_orden", this.item.orden);

      axios
        .post(`${this.$config.API}/produccion/update/paso`, data)
        .then((res) => {
          if (res.data.nodata) {
            if (this.selected != "sin_asignar") {
              this.$fire({
                type: "info",
                title: "Error en asignación",
                html: `El paso '${this.selected}' no está asignado a ningún empeado`,
              }).then(() => {
                this.selected = "sin_asignar";
              });
            } else {
              this.value = 0;
            }
          } else {
            this.getPorcentaje();
          }
          this.overlay = false;
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error",
            html: `No se pudo actualizar os datos: ${err}`,
          });
          this.overlay = false;
        });
    },
    pasoActual() {
      switch (this.item.paso) {
        case "comercializacion":
          this.paso = "Comercialización";
          break;

        case "jefe_diseno":
          this.paso = "Jefe de Diseño";
          break;

        case "diseno":
          this.paso = "Diseño";
          break;

        case "Corte":
          this.paso = "Corte";
          break;

        case "Impresión":
          this.departamento = "Impresión";
          break;

        case "Estampado":
          this.departamento = "Estampado";
          break;

        case "Costura":
          this.departamento = "Costura";
          break;

        case "Limpieza":
          this.departamento = "Limpieza";
          break;

        case "Revisión":
          this.departamento = "Revisión";
          break;

        default:
          this.departamento = this.item.paso;
          break;
      }
    },

    reloadData() {
      this.$nuxt.$emit("loadOrdersProduction");
    },

    async getPorcentaje() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/produccion/progressbar/${this.item.orden}`)
        .then((res) => {
          this.departamento = res.data.departamento;
          this.responseData = res.data;
          this.value = res.data.porcentaje;
          this.paso = res.data.paso;
          this.selected = res.data.paso;
          this.status = res.data.status;
          this.pasoActual();
          this.overlay = false;

          if (
            this.status != "activa" ||
            this.status != "pausada" ||
            this.status != "En espera"
          ) {
            this.$nuxt.$emit("loadOrdersProduction");
          }
        })
        .catch((err) => {
          console.error(
            "Error al obtener los datos del servidor para prgressBar",
            err
          );
          this.overlay = false;
        });
    },
  },

  mounted() {
    /* this.$nuxt.$on("reloadPorcentaje", () => {
            this.overlay = true
            this.getPorcentaje().then(() => (this.overlay = false))
        }) */
    /* this.$store
      .dispatch('produccion/getPorcentaje2', this..item.orden)
      .then(() => {
        this.pasoActual()
        this.overlay = false
      }) */
    this.getPorcentaje().then(() => {
      let x = this.$store.state.produccion.dataPorcentaje;
    });
  },

  props: ["item"],
};
</script>

<style scoped>
.floatme {
  float: left;
  margin-right: 4px;
}
</style>
