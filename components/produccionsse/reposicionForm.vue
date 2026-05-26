<template>
  <div>
    <b-overlay :overlay="overlay" spinner-small>
      <div v-if="hideMe" class="floatme">
        <b-button :variant="myVariant" @click="$bvModal.show(modal)">
          <b-icon icon="skip-backward-fill"></b-icon>
        </b-button>
      </div>

      <div class="floatme">
        <produccionsse-reposicionChecker ref="repoControl" style="margin-top: 6px" :showControl="showControl"
          :item="item" />
      </div>
    </b-overlay>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :overlay="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col xl="12" lg="12" md="12" sm="12">
              <b-list-group style="margin: 20px 0">
                <b-list-group-item><strong class="mb-4">{{
                  item.item.Producto
                    }}</strong></b-list-group-item>
                <b-list-group-item><strong class="mb-4">Talla:</strong>
                  {{ item.item.Talla }}</b-list-group-item>
                <b-list-group-item><strong class="mb-4">Corte:</strong>
                  {{ item.item.Corte }}</b-list-group-item>
                <b-list-group-item><strong class="mb-4">Tela:</strong>
                  {{ item.item.Tela }}</b-list-group-item>
              </b-list-group>

              <b-form @submit="onSubmit">
                <b-form-group id="input-group-1" label="Cantidad:" label-for="input-1"
                  description="Cantidad de piezas a reponer.">
                  <b-form-input style="width: 90px" id="input-1" step="1" min="0" v-model="form.cantidad" type="number">
                  </b-form-input>
                </b-form-group>

                <hr />

                <!-- Selector de Departamento donde INICIA la Reposición -->
                <b-form-group id="input-group-departamento-visibilidad" label="Departamento Donde INICIA la Reposición:"
                  label-for="select-departamento-visibilidad"
                  description="Seleccione el departamento donde se cometió el error y donde la pieza debe regresar para iniciar la corrección.">
                  <b-form-select id="select-departamento-visibilidad" v-model="form.id_departamento_visibilidad"
                    :options="selectDepartamentosCola">
                  </b-form-select>
                </b-form-group>

                <hr />

                <!-- Selector de Departamento donde TERMINA la Reposición -->
                <b-form-group id="input-group-departamento-reposicion-form" label="Departamento Donde TERMINA la Reposición:"
                  label-for="select-departamento-reposicion-form"
                  description="Seleccione el departamento donde se completará el trabajo de reposición una vez corregido el error.">
                  <b-form-select id="select-departamento-reposicion-form" v-model="form.id_departamento_asignado"
                    :options="selectDepartamentosCola"></b-form-select>
                </b-form-group>

                <hr />

                <b-form-group id="input-group-2" label="Detalle:" label-for="input-2"
                  description="Describa el motivo de la reposición.">
                  <b-form-textarea id="textarea" v-model="form.detalle" no-auto-shrink size="sm" no-resize rows="3"
                    max-rows="20">
                  </b-form-textarea>
                </b-form-group>

                <b-button type="submit" variant="primary">Reponer Piezas</b-button>
              </b-form>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      size: "md",
      title: "Detalles de la reposición",
      overlay: false,
      myVariant: "warning",
      repos: null,
      hideMe: false,
      form: {
        id_departamento_asignado: null,
        id_departamento_visibilidad: null,
        cantidad: 0,
        detalle: "",
      },
    };
  },

  computed: {
    showControl: function () {
      let showMe;
      if (this.myVariant === "success") {
        showMe = true;
        this.hideMe = false;
      } else {
        showMe = false;
        this.hideMe = true;
      }
      return showMe;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    selectDepartamentosCola() {
      if (!this.$store.state.login.departamentos) return [];
      let activeDeps = this.$store.state.login.departamentos.filter(
        (dep) => parseInt(dep.asignar_numero_de_paso) === 1
      );
      // Clonamos y ordenamos
      let sortedDeps = [...activeDeps].sort(
        (a, b) => parseInt(a.orden_proceso) - parseInt(b.orden_proceso)
      );
      let options = sortedDeps.map((dep) => ({
        value: dep._id,
        text: dep.departamento || dep.nombre,
      }));
      options.unshift({ value: null, text: "Seleccione un departamento" });
      return options;
    },
  },

  methods: {
    async getRepositions() {
      await this.$axios
        .get(
          `${this.$config.API}/reposiciones/${this.item.item.Reponer}/${this.item.item.Orden}`
        )
        .then((res) => {
          this.repos = res.data.data;
        });
    },

    onSubmit(event) {
      event.preventDefault();
      this.validateForm();
    },

    validateForm() {
      let valido = true;
      let msg = "";

      if (parseInt(this.form.cantidad) === 0) {
        valido = false;
        msg = msg + "<p>Ingrese la cantidad de piezas a reponer</p>";
      }

      if (!this.form.detalle.trim()) {
        valido = false;
        msg = msg + "<p>Escriba el detalle de la reposición</p>";
      }

      if (!this.form.id_departamento_visibilidad) {
        valido = false;
        msg +=
          "<p>Debe seleccionar el <b>Departamento de Inicio</b> donde se originó el problema.</p>";
      }

      if (!this.form.id_departamento_asignado) {
        valido = false;
        msg +=
          "<p>Debe seleccionar el <b>Departamento de Finalización</b> donde terminará la reposición.</p>";
      }

      // Validación de Orden de Proceso (Lógica de "Retroceso")
      if (
        valido &&
        this.form.id_departamento_visibilidad &&
        this.form.id_departamento_asignado
      ) {
        // Buscar objetos completos de departamento en el store global para obtener orden_proceso y asignar_numero_de_paso
        const deptoInicio = this.$store.state.login.departamentos.find(
          (d) => d._id == this.form.id_departamento_visibilidad
        );
        const deptoFin = this.$store.state.login.departamentos.find(
          (d) => d._id == this.form.id_departamento_asignado
        );

        if (!deptoInicio || !deptoFin) {
          valido = false;
          msg += "<p>No se encontró la información detallada de los departamentos seleccionados.</p>";
        } else {
          // Verificar que pertenezcan a la cola de producción (pasos activos)
          if (
            parseInt(deptoInicio.asignar_numero_de_paso) !== 1 ||
            parseInt(deptoFin.asignar_numero_de_paso) !== 1
          ) {
            valido = false;
            msg += "<p>Las reposiciones solo pueden circular dentro de los departamentos de la cola de producción activos.</p>";
          } else {
            // Validar que tengamos los datos de orden_proceso
            if (
              deptoInicio.orden_proceso !== undefined && deptoInicio.orden_proceso !== null &&
              deptoFin.orden_proceso !== undefined && deptoFin.orden_proceso !== null
            ) {
              if (
                parseInt(deptoInicio.orden_proceso) >
                parseInt(deptoFin.orden_proceso)
              ) {
                valido = false;
                msg += `<p>Error de flujo: El departamento de inicio de la corrección (<b>${deptoInicio.departamento}</b>) tiene un paso posterior al departamento de finalización (<b>${deptoFin.departamento}</b>).<br>La reposición debe iniciar en una etapa anterior o permanecer en la misma.</p>`;
              }

              // Regla: El departamento de finalización no puede ser posterior al departamento actual de la orden principal
              if (this.pasoActual) {
                const deptoActual = this.$store.state.login.departamentos.find(
                  (d) => d.departamento.toLowerCase().trim() === this.pasoActual.toLowerCase().trim()
                );
                if (deptoActual) {
                  if (parseInt(deptoFin.orden_proceso) > parseInt(deptoActual.orden_proceso)) {
                    valido = false;
                    msg += `<p>Error de flujo: No se puede finalizar la reposición en <b>${deptoFin.departamento}</b> porque es un paso posterior al departamento actual de la orden principal (<b>${deptoActual.departamento}</b>).</p>`;
                  }
                }
              }
            } else {
              valido = false;
              msg += "<p>No se pudo determinar el orden de proceso de los departamentos seleccionados. Por favor, verifique la configuración del flujo de producción.</p>";
            }
          }
        }
      }

      if (valido) {
        this.createReposicion().then(() => {
          // this.$refs.repoControl.setReload(true)
        });
      } else {
        this.$fire({
          type: "error",
          title: "Se requieren datos",
          html: msg,
        });
      }
    },

    clearForm() {
      this.form = {
        cantidad: 0,
        detalle: "",
        id_departamento_asignado: null,
        id_departamento_visibilidad: null,
      };
    },

    async createReposicion() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_ordenes_productos", this.item.item.Reponer);
      data.set("id_orden", this.item.item.Orden);
      data.set("cantidad", this.form.cantidad);
      data.set("detalle", this.form.detalle);
      
      // Mapeo directo para creación por supervisor (opción A)
      // id_departamento: Paso activo inicial de la reposición
      data.set("id_departamento", this.form.id_departamento_visibilidad);
      // id_departamento_solicitante: Paso destino final de la reposición
      data.set("id_departamento_solicitante", this.form.id_departamento_asignado);

      // Agregamos id_empleado_emisor como el emisor de la petición (supervisor/usuario logueado)
      // para que el backend reconozca que es una solicitud desde producción y aplique auto-asignación
      const currentEmployeeId = this.$store.state.login.dataUser?.id_empleado;
      if (currentEmployeeId) {
        data.set("id_empleado_emisor", currentEmployeeId);
      }

      await this.$axios
        .post(`${this.$config.API}/produccion/reposicion`, data)
        .then((res) => {
          this.clearForm();
          this.$fire({
            title: "Reposición",
            html: `<p>La reposición se ha creado correctamente.</p>`,
            type: "success",
          }).then(() => {
            this.$emit("reload_this");
            this.getRepositions().then(() => {
              if (this.repos.length) {
                this.myVariant = "success";
              }
              this.clearForm();
              this.$bvModal.hide(this.modal);
            });
          });
        })
        .catch((err) => {
          this.$fire({
            title: "Error en la reposición",
            html: `<p>${err.response?.data?.message || err.message || err}</p>`,
            type: "danger",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  watch: {},

  props: ["item", "departamento", "empleados", "reload_this", "pasoActual"],

  mounted() {
    /* this.overlay = true
    this.getRepositions().then(() => {
      if (this.repos.length) {
        this.myVariant = 'success'
      }
      this.getEmpleados().then(() => (this.overlay = false))
    }) */
  },
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
