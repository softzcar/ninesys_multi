<template>
  <div>
    <b-form inline class="mb-4 mt-4">
      <b-form-group id="select-empleado" label-for="select-empleado">
        <b-form-select id="select-empleado" :disabled="inputDisabled" v-model="empleado" :options="options"
          :value="empleado" class="mr-2" @change="asignarEmpleado"></b-form-select>
      </b-form-group>

      <!-- <b-form-group id="button-group-1">
        <b-button
          class="mr-2"
          @click="asignarEmpleado"
          variant="success"
        >
          <b-icon icon="plus-lg"></b-icon> Añadir Empleado
        </b-button>
      </b-form-group> -->

      <b-form-group class="mr-2" id="button-group-2">
        <b-form-checkbox v-model="calculoAutomatico" switch>
          {{
            calculoAutomatico
              ? "Porcentaje Automático"
              : "Porcentaje Manual"
          }}
        </b-form-checkbox>
      </b-form-group>

      <b-form-group id="button-group-1">
        <span class="porcentaje">Total porcentaje {{ calculoPorcentaje }}%</span>
      </b-form-group>
    </b-form>

    <b-table striped hover :fields="fields" :items="form">
      <template #cell(empleado)="row">
        {{ nombreEmpleado(row.item.empleado) }}
      </template>

      <template #cell(comision)="row">
        <b-form-input id="input-comision" v-model="row.item.comision" type="number" min="0" step="1"
          style="width: 100px" @input="updateData($event, row.item)"></b-form-input>
      </template>

      <template #cell(id)="row">
        <b-button variant="danger" @click="deleteEmpleado(row.item.empleado, row.index)" aria-label="Agregar insumo">
          <b-icon icon="trash"></b-icon>
        </b-button>
      </template>
    </b-table>

  </div>
</template>

<script>
export default {
  data() {
    return {
      calculoAutomatico: true,
      saveDisabled: false,
      inputDisabled: false,
      saveDisabled: true,
      empleado: null,
      comision: 0,
      form: [],
      saveTimer: null,
      fields: [
        {
          key: "empleado",
          label: "Empleado",
        },
        {
          key: "comision",
          label: "Procentaje Comisión",
        },
        {
          key: "id",
          label: "Eliminar",
        },
      ],
    };
  },

  computed: {
    calculoPorcentaje() {
      if (!this.form || this.form.length === 0) {
        return 0; // Si el array está vacío o no está definido, devolvemos 0
      }

      const total = this.form.reduce((acumulador, objeto) => {
        return parseFloat(acumulador) + parseFloat(objeto.comision);
      }, 0);

      if (total.toFixed(0) === 100) {
        this.saveDisabled = false;
      } else {
        this.saveDisabled = false;
      }

      return parseFloat(total).toFixed(0);
    },
    /* calculoPorcentaje() {
            if (!this.form || this.form.length === 0) {
                return 0; // Si el array está vacío o no está definido, devolvemos 0
            }

            const total = this.form.reduce((acumulador, objeto) => {
                let valor;
                if (
                    !objeto.comision ||
                    objeto.comision === NaN ||
                    objeto.comision === undefined
                ) {
                    valor = 0;
                } else {
                    valor = objeto.comision;
                }
                return parseFloat(acumulador) + parseFloat(valor);
            }, 0);

            if (
                parseFloat(total).toFixed(1) > 99.8 &&
                parseFloat(total).toFixed(1) < 100.1
            ) {
                this.saveDisabled = false;
            } else {
                this.saveDisabled = true;
            }

            if (!this.saveDisabled) {
                return 100;
            } else {
                return parseInt(total);
            }
        }, */

    sonComisionesIguales() {
      if (!this.form || this.form.length === 0) {
        return true; // Si el array está vacío o no está definido, consideramos que son iguales
      }

      const primeraComision = this.form[0].comision;

      return this.form.every((objeto) => objeto.comision === primeraComision);
    },
  },

  watch: {
    /* form() {
            if (this.sonComisionesIguales) {
                console.log(`Recalcular ${this.calculoPorcentaje}`);
                this.form.forEach((el) => {
                    el.comision = this.calculoPorcentaje;
                });
            } else {
                // Sumar las comisiones y verificar si la suma da mas de 100
                const total = this.form.reduce((acumulador, objeto) => {
                    return parseFloat(acumulador) + parseFloat(objeto.comision);
                }, 0);

                console.log("total sumatoria", total);

                if (total.toFixed(0) === 100) {
                    this.saveDisabled = false;
                } else {
                    this.saveDisabled = false;
                }
            }
        }, */
  },

  methods: {
    updateData(val, item) {
      if (this.calculoAutomatico) {
        console.group("calcular");
        const filas = this.form.length - 1;

        if (filas > 0) {
          console.log(`uinicio del cáclulo`);

          const id = item.id;
          const porcentaje = val;
          const nuevoPoecentajeGeneral = (100 - porcentaje) / filas;

          this.form.forEach((el) => {
            if (el.id != id) {
              el.comision = nuevoPoecentajeGeneral;
            }
          });
        } else {
          // Acciones si solo hay un registro. Deberiamos asignar porcentaje = 100%
          this.form.forEach((el) => {
            el.comision = 100;
          });
        }
        console.groupEnd("calcular");
      }

      // Guardar con debounce para esperar que el usuario termine de escribir
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.guararComisiones();
      }, 700);
    },

    nombreEmpleado(idEmpleado) {
      const empleado = this.options.find((emp) => emp.value == idEmpleado);
      return empleado ? empleado.text : "";
    },

    generateRandomId() {
      // Generar un número aleatorio entre 100000 y 9999999
      const myKey = Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
      return myKey.toString();
    },

    existEmpleado(idEmp) {
      let asignados = [];
      asignados = this.form.filter((el) => el.empleado == idEmp);
      return asignados.length;
    },

    async guararComisiones() {
      // Si no hay empleados, no hay nada que guardar ni validar
      if (this.form.length === 0) {
        return false;
      }

      const ceroVerify = this.form.find(
        (el) =>
          el.comision == 0 ||
          el.comision === NaN ||
          el.comision === undefined ||
          !el.comision
      );

      if (ceroVerify) {
        this.$fire({
          title: "El porcentaje no puede ser cero",
          html: `<p></p>`,
          type: "info",
        });
        return false;
      }

      if (this.calculoPorcentaje != 100) {
        this.$fire({
          title: "La suma de los porcentajes debe ser igual a 100",
          html: `<p></p>`,
          type: "info",
        });

        return false;
      }

      if (this.form.length > 0) {
        this.overlay = true;
        const updatePromises = this.form.map((empleado, index) =>
          this.updateEmpleado(empleado.empleado, empleado.comision, index)
        );

        try {
          await Promise.all(updatePromises);
          this.$bvToast.toast("Se guardaron las comisiones de los empleados.", {
            title: "Asignación Guardada",
            variant: "success",
            solid: true,
          });
          this.$emit("assignments-updated", this.form, this.item._id, this.idorden);
        } catch (error) {
          console.error("Una o más asignaciones fallaron", error);
        } finally {
          this.overlay = false;
        }
      }
    },

    asignarEmpleado(val) {
      if (val && typeof val !== 'object') {
        this.empleado = val
      }

      if (!this.empleado || this.empleado === null) {
        this.$fire({
          title: "Seleccione un empelado",
          html: `<p></p>`,
          type: "info",
        });
      } else if (this.existEmpleado(this.empleado) > 0) {
        this.$fire({
          title: "Este empleado ya ha sido seleccionado",
          html: `<p></p>`,
          type: "info",
        });
        // Reset selection if invalid
        this.empleado = null;
      } else {
        // Actualziar tabla en la interfáz de usuario
        const random_id = this.generateRandomId();
        const obj = {
          id: random_id,
          empleado: this.empleado,
          comision: 0,
        };
        let arr1 = this.form;
        arr1.push(obj);

        // Verificar sia ctualziamos automaticamente los porcentajes
        if (this.calculoAutomatico) {
          const porcent = (100 / this.form.length).toFixed(2);
          console.log("nuevo porcentaje", porcent);

          this.form.forEach((element) => {
            element.comision = porcent;
          });

          this.form = arr1;
          this.empleado = null;
        }
        // No guardar automáticamente al agregar — el usuario puede cambiar el porcentaje primero
        // La grabación ocurre con debounce desde updateData() cuando el usuario cambia el input
      }
    },

    async updateEmpleado(idEmpleado, porcentaje, index) {
      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      // data.set("id_ordenes_productos", producto._id);
      data.set("id_empleado", idEmpleado);
      data.set("porcentaje", porcentaje);
      // data.set("id_woo", producto.id_woo);
      data.set("id_departamento", this.item._id);
      // data.set("departamento", this.item.departamento);
      // data.set("cantidad", producto.cantidad);
      // data.set("cantidad_orden", producto.cantidad);

      await this.$axios
        .post(`${this.$config.API}/lotes/empleados/reasignar`, data)
        .then((res) => {
          // console.log("Asignación correcta para empleado:", idEmpleado); // Opcional: para depuración

          // this.$nuxt.$emit("reload")
          // this.$store.dispatch('produccion/getPorcentaje2', this.item.id_orden)
          // console.log('resultado empleadoAsignar', res.data)
        })
        .catch((err) => {
          console.error("No se asignó el empleado", idEmpleado);
          this.deleteEmpleado(idEmpleado).then(() => {
            this.removeItem(index);
          });
          console.error("Error al asignar el empleado:", idEmpleado, err);
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    async deleteEmpleado(idEmpleado, index) {
      this.$confirm(
        ``,
        `¿Desea eliminar el empleado ${this.nombreEmpleado(idEmpleado)}?`,
        "question"
      ).then(() => {
        this.removeEmpleado(idEmpleado, index).then(() => [
          this.guararComisiones(),
        ]);
      });
    },

    async removeEmpleado(idEmpleado, index) {
      const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", idEmpleado);
      data.set("id_departamento", this.item._id);
      data.set("porcentaje", this.calculoPorcentaje);

      // HACER UNA COPIA DE form
      const tmpForm = this.form;
      this.removeItem(index);

      await this.$axios
        .post(`${this.$config.API}/lotes/empleados/eliminar`, data)
        .then((res) => {
          // this.$nuxt.$emit("reload")
          // this.$store.dispatch('produccion/getPorcentaje2', this.item.id_orden)
          // console.log('resultado empleadoAsignar', res.data)
        })
        .catch((err) => {
          this.form = tmpForm;
          console.error("No se elininó el empleado", idEmpleado);
          this.$fire({
            title: "Error",
            html: `<p>No se pudo eliinar el empleado</p><p>${err}</p>`,
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },

    removeItem(index) {
      this.form.splice(index, 1);

      if (this.guararComisiones) {
        const reclacular = (100 / this.form.length).toFixed(2);
        this.form.forEach((item) => {
          console.log("nuevo porcentaje", reclacular);

          item.comision = reclacular;
        });
      }
    },
  },

  mounted() {
    // CARGAR DATOS EN LA TABLA DE EMPLEADOS ASIGNADOS
    this.emp_asignados.forEach((el) => {
      console.log(`Asignemos al empleado`, el);

      const rId = this.generateRandomId();
      const formItem = {
        id: rId,
        empleado: el.id_empleado,
        comision: el.procentaje_comision,
      };

      this.form.push(formItem);
    });
  },

  props: ["options", "idorden", "emp_asignados", "products", "item", "reload"],
};
</script>

<style>
.porcentaje {
  font-size: 1.4rem !important;
  color: darkslategray;
  font-weight: bold;
}
</style>