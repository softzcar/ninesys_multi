<template>
  <div>
    <b-button @click="$bvModal.show(modal)" variant="link">
      Orden {{ item.id_orden }} | {{ item.producto }}
      {{ item.unidades }} unidades
    </b-button>

    <b-modal :id="modal" :title="title" hide-footer size="lg" @show="onModalShow" @hidden="onModalHidden">
      <b-overlay :show="overlay" spinner-small>
        <!-- <buscar-resultadoModal :id="id" /> -->

        <b-list-group class="mb-4">
          <b-list-group-item
            ><strong>Orden</strong> {{ item.id_orden }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Enviada por</strong> {{ item.empleado }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Fecha y Hora</strong> {{ item.fecha }},
            {{ item.hora }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Detalle</strong>
            {{ item.detalle_emisor }}</b-list-group-item
          >
          <b-list-group-item> </b-list-group-item>
          <b-list-group-item
            ><strong>Producto</strong> {{ item.producto }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Unidades</strong> {{ item.unidades }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Talla</strong> {{ item.talla }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Corte</strong> {{ item.corte }}</b-list-group-item
          >
          <b-list-group-item
            ><strong>Tela</strong> {{ item.tela }}</b-list-group-item
          >
        </b-list-group>

        <b-form @submit="onSubmit">
          <!-- Visualizador y Gestor de la Cola de Departamentos -->
          <div v-if="loadingQueue" class="text-center py-3 mb-3 border rounded bg-light">
            <b-spinner small variant="primary" />
            <small class="ml-2 text-muted">Cargando cola de departamentos...</small>
          </div>

          <div v-else-if="queueError" class="text-danger py-2 mb-3 border rounded bg-light text-center">
            <b-icon icon="exclamation-triangle" />
            <small class="ml-2">{{ queueError }}</small>
          </div>

          <div v-else-if="queueDepartamentos.length > 0" class="mb-4">
            <label class="font-weight-bold d-block mb-1 text-muted">
              <b-icon icon="list-check" class="mr-1" />
              Cola de Departamentos para el Retrabajo:
            </label>
            <small class="text-muted d-block mb-2">
              Desmarca los pasos que deseas omitir en la reposición. Los pasos omitidos se deshabilitarán en la selección inferior.
            </small>

            <div class="d-flex flex-wrap p-2 border rounded bg-light" style="gap: 8px;">
              <div
                v-for="dep in queueDepartamentos"
                :key="dep.id_departamento"
                class="d-flex align-items-center p-1 px-2 border rounded bg-white"
                :class="{
                  'border-success': dep.es_inicio == 1,
                  'border-primary': dep.es_destino == 1,
                  'border-light text-muted': dep.excluido == 1 && dep.es_inicio == 0 && dep.es_destino == 0
                }"
                style="min-width: 160px;"
              >
                <!-- Checkbox deshabilitado para inicio/destino -->
                <b-form-checkbox
                  :checked="dep.excluido != 1"
                  :disabled="dep.es_inicio == 1 || dep.es_destino == 1 || dep.saving"
                  @change="(val) => toggleExclusion(dep, !val)"
                  class="mr-2 mb-0"
                  size="sm"
                />

                <!-- Nombre del departamento -->
                <div class="flex-grow-1 text-truncate" :title="dep.departamento">
                  <span :class="{ 'text-muted text-decoration-line-through': dep.excluido == 1 && dep.es_inicio == 0 && dep.es_destino == 0 }">
                    {{ dep.departamento }}
                  </span>
                  <b-badge v-if="dep.es_inicio == 1" variant="success" class="ml-1" style="font-size:0.65em">inicio</b-badge>
                  <b-badge v-if="dep.es_destino == 1" variant="primary" class="ml-1" style="font-size:0.65em">destino</b-badge>
                </div>

                <!-- Spinner por dep mientras guarda -->
                <b-spinner v-if="dep.saving" small variant="secondary" class="ml-1" />
              </div>
            </div>
          </div>

          <b-form-group
            id="input-group-empleado-reposicion"
            label="Empleado:"
            label-for="select-empleado"
            description="Empleado involucrado en la reposición."
          >
            <b-form-select
              id="select-empleado"
              v-model="form.emp"
              :options="selectEmpleados"
              size="sm"
              style="width: 45%"
            ></b-form-select>
          </b-form-group>

          <!-- Nuevo Selector de Departamento -->
          <b-form-group
            v-if="
              form.emp &&
              form.emp !== 0 &&
              selectedEmployeeDepartments.length > 0
            "
            id="input-group-departamento-reposicion"
            label="Departamento del Empleado:"
            label-for="select-departamento-reposicion"
            description="Departamento del empleado para la reposición."
          >
            <b-form-select
              id="select-departamento-reposicion"
              v-model="form.id_departamento"
              :options="selectDepartmentOptions"
              size="sm"
              style="width: 45%"
            ></b-form-select>
          </b-form-group>

          <b-form-group
            id="input-group-detalle-reposicion"
            label="Detalle:"
            label-for="textarea-detalle-reposicion"
            description="Describa el detalle de la reposición."
          >
            <b-form-textarea
              id="textarea-detalle-reposicion"
              v-model="form.detalle"
              no-auto-shrink
              size="sm"
              no-resize
              rows="3"
              max-rows="20"
            >
            </b-form-textarea>
          </b-form-group>

          <b-button type="submit" variant="primary">Aceptar</b-button>
          <b-button @click="validarRechazo" variant="danger">Rechazar</b-button>
        </b-form>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      title: `Reposiciones pendientes`,
      overlay: false,
      statusbutton: "outline-primary",
      form: {
        emp: 0,
        detalle: "",
        aprobada: null,
        id_departamento: null,
      },
      selectedEmployeeDepartments: [],
      queueDepartamentos: [],
      loadingQueue: false,
      queueError: null,
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    selectDepartmentOptions() {
      if (
        !this.selectedEmployeeDepartments ||
        this.selectedEmployeeDepartments.length === 0
      ) {
        return [{ value: null, text: "Seleccione un departamento" }];
      }
      let options = this.selectedEmployeeDepartments.map((dep) => {
        const depId = dep.id_departamento || dep.id;
        const queueDep = this.queueDepartamentos.find(q => q.id_departamento == depId);
        const isExcluded = queueDep && queueDep.excluido == 1;

        return {
          value: depId,
          text: (dep.departamento || dep.nombre_departamento || dep.nombre) + (isExcluded ? " (Omitido)" : ""),
          disabled: isExcluded ? true : false,
        };
      });
      options.unshift({ value: null, text: "Seleccione un departamento" });
      return options;
    },

    myIdOrden() {
      return this.item.id_orden;
    },

    selectEmpleados() {
      let tmp = this.empleados.map((item) => {
        return {
          value: item._id,
          text: item.nombre,
        };
      });

      tmp.unshift({ value: 0, text: "Seleccione un empleado" });

      return tmp;
    },
  },

  methods: {
    onModalShow() {
      this.fetchQueueDepartamentos();
    },

    onModalHidden() {
      this.form.emp = 0;
      this.selectedEmployeeDepartments = [];
      this.form.detalle = "";
      this.form.aprobada = null;
      this.form.id_departamento = null;
      this.queueDepartamentos = [];
      this.loadingQueue = false;
      this.queueError = null;
    },

    async fetchQueueDepartamentos() {
      this.loadingQueue = true;
      this.queueError = null;
      try {
        const res = await this.$axios.get(
          `${this.$config.API}/reposicion/${this.item.id_reposicion}/departamentos-cola`
        );
        this.queueDepartamentos = (res.data || []).map(d => ({ ...d, saving: false }));
      } catch (e) {
        this.queueError = 'No se pudo cargar la cola de departamentos.';
        console.error('[ReposicionesPendientes] Error fetching queue:', e);
      } finally {
        this.loadingQueue = false;
      }
    },

    async toggleExclusion(dep, excluir) {
      dep.saving = true;
      try {
        await this.$axios.post(
          `${this.$config.API}/reposicion/${this.item.id_reposicion}/excluir-departamento`,
          {
            id_departamento: dep.id_departamento,
            excluir: excluir,
          }
        );
        dep.excluido = excluir ? 1 : 0;
        
        // Si el departamento que acabamos de excluir es el seleccionado en el formulario, lo deseleccionamos
        if (excluir && this.form.id_departamento == dep.id_departamento) {
          this.form.id_departamento = null;
        }
      } catch (e) {
        const msg = e?.response?.data?.error || 'Error al actualizar la exclusión.';
        this.$bvToast.toast(msg, {
          title: 'Error',
          variant: 'danger',
          solid: true,
          toaster: 'b-toaster-top-right',
        });
        console.error('[ReposicionesPendientes] toggleExclusion error:', e);
      } finally {
        dep.saving = false;
      }
    },

    onSubmit(event) {
      event.preventDefault();
      this.validarReposicion();
    },

    async fetchEmployeeDepartments(employeeId) {
      if (!employeeId || employeeId === 0) {
        this.selectedEmployeeDepartments = [];
        this.form.id_departamento = null; // También reseteamos el departamento seleccionado
        return;
      }
      this.overlay = true;
      try {
        // Ajusta la URL del endpoint si es necesario. Asumo que tu $config.API ya está definido.
        const response = await this.$axios.get(
          `${this.$config.API}/departamentos-empleado/${employeeId}`
        );
        // La API podría devolver los departamentos directamente en response.data o en una propiedad como response.data.departamentos
        // Ajusta la siguiente línea según la estructura de tu respuesta de API.
        this.selectedEmployeeDepartments =
          response.data.departamentos || response.data || [];
        this.form.id_departamento = null; // Resetea la selección de departamento cuando cambian los departamentos
      } catch (error) {
        console.error("Error fetching employee departments:", error);
        this.selectedEmployeeDepartments = [];
        this.form.id_departamento = null;
        this.$fire({
          // Asumo que usas vue-sweetalert2 o similar para $fire
          title: "Error",
          html: "<p>No se pudieron cargar los departamentos del empleado.</p>",
          type: "warning",
        });
      } finally {
        this.overlay = false;
      }
    },

    async postReposicion() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_orden", this.item.id_orden);
      data.set("id_reposicion", this.item.id_reposicion);
      data.set("aprobada", this.form.aprobada);
      if (this.form.id_departamento) {
        // Enviar solo si se ha seleccionado un departamento y es aprobación
        data.set("id_departamento", this.form.id_departamento);
      }
      data.set("id_empleado", this.form.emp);
      data.set(
        "id_empleado_emisor",
        this.$store.state.login.dataUser.id_empleado
      );
      data.set("detalle", this.form.detalle);
      data.set("detalle_emisor", this.item.detalle_emisor);
      data.set("cantidad", this.item.unidades);
      data.set("id_ordenes_productos", this.item.id_ordenes_productos);

      await this.$axios
        .post(`${this.$config.API}/produccion/reposicion/final`, data)
        .then((res) => {
          this.overlay = false;
          this.$fire({
            title: this.form.aprobada
              ? "Reposición Aprobada"
              : "Reposición Rechazada",
            html: `<p>La operación se realizó correctamente.</p>`,
            type: "success",
          });
          this.$bvModal.hide(this.modal);
          this.$emit("reload"); // Emitir para recargar datos en el componente padre
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<p>No se pudo procesar la reposición.</p><p>${
              err.response?.data?.message || err.message
            }</p>`,
            type: "error",
          });
        })
        .finally(() => {
          this.overlay = false;
          // Resetear campos del formulario
          this.form.emp = 0;
          this.selectedEmployeeDepartments = []; // Limpiar explícitamente
          this.form.detalle = "";
          this.form.aprobada = null;
        });
    },

    validarReposicion() {
      let ok = true;
      let msg = "";

      if (this.form.emp === 0) {
        ok = false;
        msg += "<p>Seleccione un empleado</p>";
      }

      // Validar departamento si un empleado está seleccionado y tiene departamentos cargados
      // y si la reposición está siendo aprobada (aprobada = 1)
      if (
        this.form.emp &&
        this.form.emp !== 0 &&
        this.selectedEmployeeDepartments.length > 0 &&
        !this.form.id_departamento
      ) {
        ok = false;
        msg +=
          "<p>Seleccione un departamento para el empleado involucrado.</p>";
      }

      if (
        ok &&
        this.form.id_departamento &&
        this.item.id_departamento_solicitante
      ) {
        // Buscar objetos completos de departamento en el store global para obtener orden_proceso y asignar_numero_de_paso
        const deptoInicio = this.$store.state.login.departamentos.find(
          (d) => d._id == this.item.id_departamento_solicitante
        );
        const deptoFin = this.$store.state.login.departamentos.find(
          (d) => d._id == this.form.id_departamento
        );

        if (!deptoInicio || !deptoFin) {
          ok = false;
          msg += "<p>No se encontró la información detallada de los departamentos seleccionados.</p>";
        } else {
          // Verificar que pertenezcan a la cola de producción (pasos activos)
          if (
            parseInt(deptoInicio.asignar_numero_de_paso) !== 1 ||
            parseInt(deptoFin.asignar_numero_de_paso) !== 1
          ) {
            ok = false;
            msg += "<p>Las reposiciones solo pueden circular dentro de los departamentos de la cola de producción activos.</p>";
          } else {
            // Validar que tengamos los datos de orden_proceso
            if (
              deptoInicio.orden_proceso !== undefined && deptoInicio.orden_proceso !== null &&
              deptoFin.orden_proceso !== undefined && deptoFin.orden_proceso !== null
            ) {
              if (
                parseInt(deptoInicio.orden_proceso) <
                parseInt(deptoFin.orden_proceso)
              ) {
                ok = false;
                msg += `<p>Error de flujo: El departamento responsable (<b>${deptoInicio.departamento}</b>) tiene un paso anterior al departamento asignado (<b>${deptoFin.departamento}</b>).<br>La reposición debe regresar a una etapa anterior o permanecer en la misma.</p>`;
              }
            } else {
              ok = false;
              msg += "<p>No se pudo determinar el orden de proceso de los departamentos seleccionados. Por favor, verifique la configuración del flujo de producción.</p>";
            }
          }
        }
      }

      if (this.form.detalle.trim() === "") {
        ok = false;
        msg += "<p>Debe proporcioar el detalle de la reposición</p>";
      } else if (this.form.detalle.trim().length < 6) {
        ok = false;
        msg +=
          "<p>El detalle de la reposición es muy corto, por favor sea más explicito</p>";
      }

      if (ok) {
        this.aprobarReposicion();
      } else {
        this.$fire({
          title: "Datos requeridos",
          html: msg,
          type: "warning",
        });
      }
    },

    validarRechazo() {
      let ok = true;
      let msg = "";

      if (this.form.detalle.trim() === "") {
        ok = false;
        msg += "<p>Debe proporcioar el detalle de la reposición</p>";
      } else if (this.form.detalle.trim().length < 6) {
        ok = false;
        msg +=
          "<p>El detalle de la reposición es muy corto, por favor sea más explicito</p>";
      }

      if (ok) {
        this.rechazarReposicion();
      } else {
        this.$fire({
          title: "Datos requeridos",
          html: msg,
          type: "warning",
        });
      }
    },

    aprobarReposicion() {
      this.$confirm(
        `Va a aprobar esta reposición ¿Desea continuar?`,
        "Aprobar",
        "question"
      ).then(() => {
        this.form.aprobada = 1;
        this.postReposicion();
      });
    },

    rechazarReposicion() {
      this.$confirm(
        `¿Desea rechazar esta reposición?`,
        "Rechazar",
        "question"
      ).then(() => {
        this.form.aprobada = 0;
        this.postReposicion();
      });
    },
  },

  watch: {
    "form.emp": function (newEmpId, oldEmpId) {
      // Limpiar la selección de departamento y la lista de departamentos
      // cada vez que el empleado cambie, incluso si newEmpId es 0.
      this.form.id_departamento = null;
      this.selectedEmployeeDepartments = [];

      // Si se selecciona un empleado válido (no 0), entonces buscar sus departamentos.
      if (newEmpId && newEmpId !== 0) {
        this.fetchEmployeeDepartments(newEmpId);
      } else {
      }
    },

    // Observar cambios en el modal para resetear el estado cuando se cierra
    "$parent.$attrs.static": function (isStatic, oldStatic) {
      // Este es un truco, necesitas una forma más fiable de detectar el cierre del modal.
      // Podrías emitir un evento desde el modal cuando se oculta.
      if (!this.$refs[this.modal] || !this.$refs[this.modal].isModalOpen) {
        this.form.emp = 0; // Esto debería disparar el watch de form.emp
      }
    },
  },
  props: ["item", "empleados"],
};
</script>
