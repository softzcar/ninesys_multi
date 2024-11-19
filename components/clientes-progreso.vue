<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-row>
            <b-col class="mt-4 mb-4 text-center">
              <h2>Progreso de Trabajo</h2>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <div class="input-label">{{ msg }}</div>
            </b-col>
          </b-row>
          <b-overlay :show="overlay" spinner-small>
            <b-row>
              <b-col class="mb-4 text-center">
                <div>
                  <input
                    ref="inputOrden"
                    autocomplete="off"
                    id="search"
                    class="input-search mt-2"
                    type="number"
                    v-model="idOrden"
                    v-on:keyup.enter="handleInput"
                  />
                </div>
              </b-col>
            </b-row>

            <b-row v-if="showControl">
              <b-col style="text-center">
                <b-progress
                  :max="max"
                  variant="success"
                  style="width: 100% !important"
                >
                  <b-progress-bar :value="value">
                    <span
                      ><strong>{{ value.toFixed(0) }}%</strong>
                    </span>
                  </b-progress-bar>
                </b-progress>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <b-alert class="mt-4 text-left" :show="showControl">
                  <h3 class="text-center mb-3">
                    Su orden se encuentra en {{ departamento }}
                  </h3>
                  {{ msgPaso }}</b-alert
                >
              </b-col>
            </b-row>

            <b-row v-if="showControl">
              <b-col class="text-center">
                <!-- <b-button class="mt-3" @click="randomValue">Click me</b-button> -->
                <b-button class="mt-3" @click="cleanAll"
                  >Buscar otra orden</b-button
                >
              </b-col>
            </b-row>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import { log } from "console";

export default {
  data() {
    return {
      showControl: false,
      departamento: "",
      responseData: null,
      overlay: true,
      idOrden: null,
      paso: "",
      status: "",
      msg: "Indique el número de la orden",
      msgPaso: "",
      departamento: "Departamento",
      value: 0,
      max: 100,
    };
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
          this.pasoActual();
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

    pasoActual() {
      switch (this.paso) {
        case "producción":
          this.departamento = "Producción";
          this.msgPaso = `En este momento tu pedido de encuentra en diseño gráfico, o en cola para comenzar la siguiente etapa del proceso.`;
          break;

        case "Corte":
          this.departamento = "Corte de patronaje";
          this.msgPaso = `La tela se corta según los patrones diseñados para la prenda. Los patrones se hacen a partir de la talla del cliente, y se tienen en cuenta los tipos de tela, y especificaciones del cliente.`;
          break;

        case "Impresión":
          this.departamento = "Impresión";
          this.msgPaso = `El diseño se imprime en papel con tintas especiales. Las tintas se pueden imprimir de diferentes maneras, como con serigrafía, sublimación o impresión digital.`;
          break;

        case "Estampado":
          this.departamento = "Estampado";
          this.msgPaso = `El papel impreso se coloca sobre la tela cortada y se aplica calor con una calandra especial. El calor hace que las tintas se transfieran a la tela.`;
          break;

        case "Costura":
          this.departamento = "Confección de la prenda";
          this.msgPaso = `Las piezas de tela se unen para formar la prenda. Las prendas se cosen con máquinas especiales, y se utilizan diferentes tipos de puntadas para asegurar una costura fuerte y duradera.`;
          break;

        case "Limpieza":
          this.departamento = "Cortar los hilos sobrantes";
          this.msgPaso = `Una vez que la prenda está cosida, se cortan los hilos sobrantes con tijeras o con una máquina cortadora de hilos.`;
          break;

        case "Revisión":
          this.departamento = "Revisión y control de calidad";
          this.msgPaso = `La prenda se revisa cuidadosamente para comprobar que no tiene defectos. Si la prenda está en buenas condiciones, se empaqueta y se envía a la tienda donde se te notifcará que ya puedes pasar a retirar tu pedido.`;
          break;

        default:
          this.departamento = this.item.paso;
          this.msgPaso = `Su pedido está en proceso. (${this.departamento})`;
          break;
      }
    },

    randomValue() {
      this.value = Math.random() * this.max;
    },
    cleanAll() {
      this.departamento = "";
      this.responseData = null;
      this.overlay = false;
      this.idOrden = null;
      this.paso = "";
      this.status = "";
      this.msg = "Indique el número de la orden";
      this.msgPaso = "";
      this.departamento = "Departamento";
      this.value = 0;
      this.showControl = false;

      this.$nextTick(() => {
        this.$refs.inputOrden.focus();
      });
    },
    checkEnterKey(event) {
      if (event.key === "Enter") {
        // Ejecuta la función handleInput
        this.handleInput();
      }
    },
    handleInput() {
      // Aquí puedes realizar las acciones necesarias con this.inputValue
      this.overlay = true;
      this.msg = `Buscando orden número ${this.idOrden}`;
      this.getPorcentaje();
    },
  },

  beforeMount() {
    if (this.$route.params.progreso != undefined) {
      this.idOrden = this.$route.params.progreso;
      this.getPorcentaje();
    }
    console.log("this.$route.params.progreso", this.$route.params.progreso);
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
  font-weight: bold;
  font-size: 1.28rem !important;
  color: #525353;
}

@media (max-width: 768px) {
  .input-search {
    max-width: 40%;
    width: 40%;
  }
}
</style>
