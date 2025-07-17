<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <div
        v-if="departamento === 'Corte'"
        class="mb-2 mt-2"
        variant="info"
      >
        Cantidad en LOTE <strong>{{ loteCantidadExistencia }}</strong>
      </div>
      <b-row>
        <b-col>
          <span class="floatme">
          </span>
          <span class="floatme">
            <label>Empleado </label>
            <b-form-select
              v-model="selected"
              :options="select_options"
              size="md"
              class="mt-3"
              :disabled="inputControlsDisabled"
              @change="setDepEmpleado"
            ></b-form-select>
            <b-alert
              v-if="empleadoAsignado"
              show
              variant="success"
            ><strong>Empleado
                asignado</strong></b-alert>
            <b-alert
              v-else
              show
              variant="info"
            ><strong>Empleado por asignar</strong></b-alert>
          </span>

          <span
            class="floatme mt-3"
            v-if="departamento === 'Corte'"
          >
            <label>Cortar</label>
            <b-input
              v-model="cantidadCorte"
              min="0"
              size="md"
              style="width: 65px"
              type="number"
              :disabled="inputControlsDisabled"
            />
          </span>

          <span
            class="floatme mt-3"
            v-if="departamento === 'Corte'"
          >
            <label>Lote ({{ loteCantidadExistencia }})</label>
            <b-input
              v-model="loteCantidadSolicitada"
              min="0"
              size="md"
              style="width: 65px"
              type="number"
              :disabled="inputLoteDisabled"
            />
          </span>
          <span
            class="floatme"
            style="margin-top: 47px"
          >
            <b-button
              class="mb-4"
              variant="success"
              @click="changeCantidad"
            >
              <b-icon icon="check"></b-icon>
            </b-button>
          </span>
          <!-- MOVER ESTE COMPONENETE PARA ELMPLEADOS->CORTE -->
          <!-- <span class="floatme" style="margin-top: 47px">
            <inventario-InsumoAsignar
              :datos="item"
              :empleado="selected"
              :departamento="departamento"
            />
          </span> -->
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
      overlay: true,
      selected: null,
      depEmpleado: null,
      cantidadCorte: 0,
      nombreDepartamento: "",
      loteCantidadSolicitada: 0,
      lotesFisicos: [],
      inputLoteDisabled: true,
      inputControlsDisabled: false,
      tmp: null,
      tareaAsignada: false,
      empleadoAsignado: false,
    };
  },

  computed: {
    idLoteDetalles() {
      let cantidadActual = 0;

      if (!this.selected) {
        cantidadActual = this.cantidadCorte;
      } else {
        let tmp = this.lote.filter(
          (dato) => dato.id_ordenes_productos === this.item._id
        );
        // cantidadActual = tmp.unidades_solicitadas
        cantidadActual = tmp[0]._id;
      }
      return cantidadActual;
    },

    loteCantidadExistencia: {
      get() {
        const exist = this.lotesFisicos
          .filter(
            (lote) =>
              lote.talla === this.item.talla &&
              lote.tela === this.item.tela &&
              lote.corte === this.item.corte &&
              lote.id_category === this.item.categoria
          )
          .map((el) => {
            return el.piezas_actuales;
          });
        return exist[0] || "0"; // Devuelve 0 si no se encuentra ninguna coincidencia
      },
      set(newValue) {
        // Aquí puedes manejar el nuevo valor asignado
        // Ejemplo: Puedes actualizar una propiedad data o hacer alguna otra lógica
        console.log("Nuevo valor asignado a loteCantidadExistencia:", newValue);
      },
    },

    /* loteCantidadExistencia() {
            const exist = this.lotesFisicos
                .filter(
                    (lote) =>
                        lote.talla === this.item.talla &&
                        lote.tela === this.item.tela &&
                        lote.corte === this.item.corte &&
                        lote.id_category === this.item.categoria
                )
                .map((el) => {
                    return el.piezas_actuales
                })

            return exist[0]
        },
 */
    /*  empleadosSelect() {
             let opt = this.empleados
                 .filter((item) => item.departamento === this.departamento)
                 .map((item) => {
                     return { value: item._id, text: item.nombre }
                 })
             opt.unshift({ value: null, text: "" })
             return opt
         }, */
  },

  methods: {
    setDepEmpleado() {
      const dep = this.empleados
        .filter((item) => item._id === this.selected)
        .map((el) => {
          return el.departamento;
        });
      this.depEmpleado = dep[0];
    },

    changeCantidad() {
      this.overlay = true;

      let ban = true;

      if (this.cantidadCorte.toString().trim() === "") {
        this.cantidadCorte = 0;
      }
      if (this.loteCantidadExistencia === undefined) {
        this.loteCantidadExistencia === "0";
      }
      console.log("this.loteCantidadExistencia", this.loteCantidadExistencia);

      if (this.loteCantidadExistencia === undefined) {
        this.item.cantidad = 0;
      } else if (this.loteCantidadExistencia.toString().trim() === "") {
        this.item.cantidad = 0;
      }
      let solicitadas_orden = parseInt(this.item.cantidad);
      let solicitadas_lote = parseInt(this.loteCantidadSolicitada);
      let solicitadas_corte = parseInt(this.cantidadCorte);
      let total_a_producir = solicitadas_corte + solicitadas_lote;
      this.tmp = total_a_producir;
      let msg = '<p class="text-center"><ul>';

      // VALIDAR OPCIONES DEL FORMULARIO
      if (this.departamento === "Corte") {
        if (
          this.selected === null &&
          solicitadas_lote + solicitadas_corte === 0
        ) {
          ban = false;
          msg = msg + `<li>Todas las opciones no pueden estar vacias</li>`;
        } else if (parseInt(this.selected) > 0 && total_a_producir === 0) {
          ban = false;
          msg = msg + `<li>debe indicar la cantidad de piezas a cortar</li>`;
        } else if (this.selected === null && this.cantidadCorte > 0) {
          ban = false;
          msg = msg + "<li>Seleccione un empleado</li>";
        } else if (
          total_a_producir < solicitadas_orden &&
          this.depEmpleado === "Corte"
        ) {
          ban = false;
          msg =
            msg +
            `<li>La cantidad solicitada para producir (${total_a_producir}) no puede ser menor a la cantidad de la orden (${solicitadas_orden})</li>`;
        } else if (solicitadas_lote > parseInt(this.loteCantidadExistencia)) {
          ban = false;
          msg =
            msg +
            "<li>La cantidad solicitada del lote es mayor a la existencia</li>";
        } else if (this.selected != null && solicitadas_corte === 0) {
          ban = false;
          msg =
            msg +
            "<li>Si selecciona un empleado debe indicar la cantidad a cortar</li>";
        }
      }

      // ESTA VCALIDACION V AL REVÉS
      if (
        this.selected === null &&
        solicitadas_corte === 0 &&
        solicitadas_lote > 1 &&
        total_a_producir === solicitadas_lote
      ) {
        ban = true;
      }

      msg = msg + "</li></p>";

      if (ban) {
        if (this.departamento != "Corte") {
          this.updateEmpleado().then(() => {
            this.updateEmpleado().then(() => {
              this.getEmpleadoAsignado();
              this.overlay = false;
            });
          });
        } else {
          const data = new URLSearchParams();
          data.set("cantidad_a_cortar", this.cantidadCorte);
          data.set("cantidad_orden", this.item.cantidad);
          data.set("cantidad_existencia", this.loteCantidadExistencia);

          data.set("id", this.idLoteDetalles);
          data.set("tela", this.item.tela);
          data.set("talla", this.item.talla);
          data.set("corte", this.item.corte);
          data.set("id_orden", this.item.id_orden);
          data.set("id_woo", this.item.id_woo);
          data.set("id_category", this.item.id_category);

          this.$axios
            .post(`${this.$config.API}/lotes/update/cantidad`, data)
            .then((res) => {
              this.lotesFisicos = res.data.lotes_fisicos;
              // this.loteCantidadExistencia = parseInt(res.data.piezas_actuales)
              console.log("vamos a recargar lotes y porductos");
              // this.loteCantidadExistencia = this.$emit('reload', true)
              this.updateEmpleado().then(() => {
                this.getEmpleadoAsignado();
                this.overlay = false;
              });
            })
            .catch((err) => {
              this.$fire({
                title: "Error",
                type: "error",
                html: `Error al actaulizar la cantidad del lote: ${err}`,
              });
            });
          /* .finally(() => {
                        this.getEmpleadoAsignado()
                        this.overlay = false
                    }) */
        }
      } else {
        this.$fire({
          title: "Error en datos",
          html: msg,
          type: "warning",
        }).then(() => (this.overlay = false));
      }

      if (!this.overlay) {
        this.overlay = true;
      }
    },

    async updateEmpleado() {
      const data = new URLSearchParams();
      data.set("id_orden", this.item.id_orden);
      data.set("id_ordenes_productos", this.item._id);
      data.set("id_empleado", this.selected);
      data.set("id_woo", this.item.id_woo);
      data.set("id_departamento", this.departamento);
      data.set("departamento", this.nombreDepartamento);
      data.set("cantidad", this.cantidadCorte);
      data.set("cantidad_orden", this.item.cantidad);

      console.log("datos a guardar");
      console.dir(data);

      await this.$axios
        .post(`${this.$config.API}/lotes/empleados/reasignar`, data)
        .then((res) => {
          this.$nuxt.$emit("reload");
          // this.$store.dispatch('produccion/getPorcentaje2', this.item.id_orden)
          // console.log('resultado empleadoAsignar', res.data)
        });
    },

    async getEmpleadoAsignado() {
      await this.$axios
        .get(
          `${this.$config.API}/produccion/verificar-asignacion-empleado/${this.departamento}/${this.item.id_orden}/${this.item._id}`
        )
        .then((res) => {
          let empleado = res.data.id_empleado;
          const depEmp = res.data.emp_departamento;
          console.log("Data empleado asignado", res.data);

          if (depEmp === null) {
            console.log("empleado NO asignado", empleado);
            this.empleadoAsignado = false;
          } else {
            console.log("empleado asignado", empleado);
            this.selected = res.data.id_empleado;
            this.empleadoAsignado = true;
          }
        });
    },
  },

  mounted() {
    this.nombreDepartamento = this.$store.state.login.departamentos
      .filter((el) => el._id === this.departamento)
      .map((el) => {
        return el.departamento;
      });

    if (this.item.piezas_actuales === null) {
      this.loteCantidadExistencia = 0;
    } else {
      this.loteCantidadExistencia = parseInt(this.item.piezas_actuales);
    }

    this.getEmpleadoAsignado().then(() => (this.overlay = false));
    if (this.departamento === "Corte") {
      this.cantidadCorte = this.item.cantidad;
      this.cantidad = 0;
    } else {
      this.cantidad = parseInt(this.item.cantidad);
    }

    this.cantidad = parseInt(this.item.cantidad);
    this.lotesFisicos = this.lotes_fisicos;
    /* axios
      .get(
        `${this.$config.API}/empleado/asignado/${this.prepareDep(
          this.departamento
        )}/${this.item.id_orden}/${this.item._id}`
      )
      .then((res) => {
        if (!res.data.id_empleado.length) {
          // this.selected = null
          // this.empleadoAsignado = false
          // this.cantidad = this.item.cantidad
        } else {
          // this.selected = res.data.id_empleado[0].id_empleado
          // this.empleadoAsignado = true

          let tmp = this.lote.filter(
            (dato) => dato.id_ordenes_productos === this.item._id
          )
          // cantidadActual = tmp.unidades_solicitadas
          // this.cantidad = tmp[0].unidades_solicitadas
          this.overlay = false
        }
        this.overlay = false
      })
      .catch((err) => {
        console.log('ERROR!!!!', err)
        this.overlay = false
      }) */
  },

  created() {
    this.$nuxt.$on("updateEmpleadoTodoCompleted", this.getEmpleadoAsignado);
  },
  beforeDestroy() {
    this.$nuxt.$off("updateEmpleadoTodoCompleted", this.getEmpleadoAsignado);
  },

  mixins: [mixin],

  props: [
    "select_options",
    "id_empleado",
    "item",
    "reload",
    "empleados",
    "por_asignar",
    "departamento",
    "options",
    "lote",
    "lotes_fisicos",
    "prueba",
  ],
};
</script>
