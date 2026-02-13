<template>
  <div>
    <b-button variant="info" @click="showModal" class="ml-2">
      <b-icon icon="people-fill"></b-icon> Asignación Masiva
    </b-button>

    <b-modal id="modal-asignacion-masiva" title="Asignación Masiva de Personal" size="xl" hide-footer
      @hidden="resetData">
      <b-overlay :show="isLoading" rounded="sm">
        <b-container fluid>
          <!-- Tabla de Órdenes Por Asignar -->
          <b-row class="mb-4">
            <b-col>
              <h5>Órdenes por asignar</h5>
              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <b-table striped hover small :fields="fieldsOrders" :items="unassignedOrders">
                  <template #cell(selected)="data">
                    <b-form-checkbox v-model="selectedOrders" :value="data.item.orden"></b-form-checkbox>
                  </template>
                  <template #cell(orden)="data">
                    <link-search :id="data.item.orden" :key="data.item.orden" />
                  </template>
                </b-table>
              </div>
            </b-col>
          </b-row>

          <hr />

          <!-- Configuración de Asignación por Departamentos -->
          <b-row v-if="selectedOrders.length > 0">
            <b-col>
              <h5>Configuración de Asignación ({{ selectedOrders.length }} órdenes seleccionadas)</h5>
              <b-card no-body>
                <b-tabs card v-model="activeTab">
                  <b-tab v-for="dep in tabsDeps" :key="dep._id" :title="dep.departamento">
                    <b-card-text>
                      <h3>Asignación General {{ dep.departamento }}</h3>

                      <b-form inline class="mb-3 mt-4">
                        <b-form-group label="Empleado" label-for="select-emp-bulk" class="mr-3">
                          <b-form-select id="select-emp-bulk" v-model="tempEmpleado"
                            :options="filterOptionsEmp(dep._id)" @change="addEmpleado(dep._id)"></b-form-select>
                        </b-form-group>

                        <b-form-checkbox v-model="calculoAutomatico" switch>
                          {{ calculoAutomatico ? "Porcentaje Automático" : "Porcentaje Manual" }}
                        </b-form-checkbox>

                        <span class="ml-auto font-weight-bold">
                          Total porcentaje: {{ totalPorcentaje(dep._id) }}%
                        </span>
                      </b-form>

                      <b-table striped hover small :fields="fieldsAssignment" :items="assignments[dep._id] || []">
                        <template #cell(empleado)="row">
                          {{ nombreEmpleado(row.item.id_empleado, dep._id) }}
                        </template>
                        <template #cell(porcentaje)="row">
                          <b-form-input type="number" v-model="row.item.porcentaje" size="sm" style="width: 80px"
                            @input="updatePorcentaje(dep._id, row.index)" :disabled="calculoAutomatico"></b-form-input>
                        </template>
                        <template #cell(actions)="row">
                          <b-button variant="danger" size="sm" @click="removeEmpleado(dep._id, row.index)">
                            <b-icon icon="trash"></b-icon>
                          </b-button>
                        </template>
                      </b-table>
                    </b-card-text>
                  </b-tab>
                </b-tabs>
              </b-card>
            </b-col>
          </b-row>

          <b-alert v-else show variant="warning" class="mt-3">
            Seleccione al menos una orden para configurar la asignación.
          </b-alert>

          <!-- Acciones Finales -->
          <b-row class="mt-4 border-top pt-3">
            <b-col class="text-right">
              <b-button variant="secondary" @click="$bvModal.hide('modal-asignacion-masiva')">Cancelar</b-button>
              <b-button variant="primary" :disabled="!canProcess" @click="processBulkAssignment">
                <b-spinner v-if="isProcessing" small></b-spinner>
                Procesar Asignación
              </b-button>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: {
    items: Array, // Todas las órdenes en curso
    empleados: Array, // Lista de todos los empleados
    ordenesProyectadas: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isLoading: false,
      isProcessing: false,
      selectedOrders: [],
      activeTab: 0,
      tempEmpleado: null,
      calculoAutomatico: true,
      assignments: {}, // { id_dep: [ { id_empleado, porcentaje } ] }
      fieldsOrders: [
        { key: 'selected', label: 'Sel.', thClass: 'text-center', tdClass: 'text-center' },
        { key: 'orden', label: 'Orden' },
        { key: 'cliente', label: 'Cliente' }
      ],
      fieldsAssignment: [
        { key: 'empleado', label: 'Empleado' },
        { key: 'porcentaje', label: 'Porcentaje %' },
        { key: 'actions', label: 'Eliminar', thClass: 'text-center', tdClass: 'text-center' }
      ]
    };
  },
  computed: {
    tabsDeps() {
      return this.$store.state.login.departamentos
        .filter((dep) => dep.asignar_numero_de_paso > 0)
        .sort((a, b) => a.orden_proceso - b.orden_proceso);
    },
    unassignedOrders() {
      // Filtrar órdenes que no tienen asignaciones de personal aún
      // Una orden está "por asignar" si NO existe en la proyección de tiempos (ordenesProyectadas)
      return this.items.filter(item => {
        const estaAsignada = this.ordenesProyectadas.some(o => o.id_orden === item.orden);
        return !estaAsignada;
      });
    },
    canProcess() {
      if (this.selectedOrders.length === 0) return false;
      // Verificar que al menos un departamento tenga el 100% de asignación
      const activeDepId = this.tabsDeps[this.activeTab]._id;
      return this.totalPorcentaje(activeDepId) === 100;
    }
  },
  methods: {
    showModal() {
      this.$bvModal.show('modal-asignacion-masiva');
    },
    resetData() {
      this.selectedOrders = [];
      this.assignments = {};
      this.tempEmpleado = null;
    },
    filterOptionsEmp(id_dep) {
      if (!this.empleados) return [];
      const options = this.empleados
        .filter((emp) => {
          // Algunos empleados vienen con un array de departamentos
          if (emp.departamentos && Array.isArray(emp.departamentos)) {
            return emp.departamentos.some(d => d.id == id_dep);
          }
          // Otros podrían venir con el campo id_departamento o departamento directamente
          return emp.id_departamento == id_dep || emp.departamento == id_dep;
        })
        .map((emp) => ({ value: emp._id || emp.id_usuario, text: emp.nombre }));

      options.unshift({ value: null, text: "Seleccione un empleado" });
      return options;
    },
    nombreEmpleado(id, id_dep) {
      const emp = this.empleados.find(e => {
        const matchesId = (e._id == id || e.id_usuario == id);
        if (!matchesId) return false;

        if (e.departamentos && Array.isArray(e.departamentos)) {
          return e.departamentos.some(d => d.id == id_dep);
        }
        return e.id_departamento == id_dep || e.departamento == id_dep;
      });
      return emp ? emp.nombre : 'Desconocido';
    },
    totalPorcentaje(id_dep) {
      const list = this.assignments[id_dep] || [];
      return list.reduce((sum, item) => sum + parseFloat(item.porcentaje || 0), 0);
    },
    addEmpleado(id_dep) {
      if (!this.tempEmpleado) return;

      if (!this.assignments[id_dep]) {
        this.$set(this.assignments, id_dep, []);
      }

      // Evitar duplicados
      if (this.assignments[id_dep].some(a => a.id_empleado === this.tempEmpleado)) {
        this.$fire({ title: 'Aviso', text: 'Este empleado ya está en la lista.', type: 'info' });
        this.tempEmpleado = null;
        return;
      }

      this.assignments[id_dep].push({
        id_empleado: this.tempEmpleado,
        porcentaje: 0
      });

      this.tempEmpleado = null;
      this.recalculatePorcentajes(id_dep);
    },
    removeEmpleado(id_dep, index) {
      this.assignments[id_dep].splice(index, 1);
      this.recalculatePorcentajes(id_dep);
    },
    recalculatePorcentajes(id_dep) {
      if (!this.calculoAutomatico) return;

      const list = this.assignments[id_dep];
      if (!list || list.length === 0) return;

      const base = 100 / list.length;
      list.forEach(item => {
        item.porcentaje = parseFloat(base.toFixed(2));
      });
    },
    updatePorcentaje(id_dep, index) {
      // Logic for manual update if needed
    },
    async processBulkAssignment() {
      const asignaciones = [];

      // Recorrer todos los departamentos en assignments
      for (const idDep in this.assignments) {
        if (this.assignments[idDep] && this.assignments[idDep].length > 0) {
          asignaciones.push({
            id_departamento: idDep,
            empleados: this.assignments[idDep]
          });
        }
      }

      if (asignaciones.length === 0) {
        this.$fire({
          title: 'Asignación incompleta',
          text: 'Debe asignar al menos un empleado en algún departamento.',
          type: 'warning'
        });
        return;
      }

      const data = new URLSearchParams();
      data.set('id_ordenes', JSON.stringify(this.selectedOrders));
      data.set('asignaciones', JSON.stringify(asignaciones));

      this.isProcessing = true;
      try {
        const res = await this.$axios.post(`${this.$config.API}/lotes/empleados/reasignar-masiva`, data);
        if (res.data.success) {
          this.$bvToast.toast(`Asignación completada para ${this.selectedOrders.length} órdenes en ${asignaciones.length} departamentos.`, {
            title: 'Éxito',
            variant: 'success',
            solid: true
          });
          this.$emit('reload');
          this.$nuxt.$emit('reload');
          this.$bvModal.hide('modal-asignacion-masiva');
        } else {
          throw new Error(res.data.error || 'Error desconocido');
        }
      } catch (error) {
        this.$fire({
          title: 'Error en la asignación',
          text: `Ocurrió un error: ${error.message}. Se realizó rollback de los cambios.`,
          type: 'error'
        });
      } finally {
        this.isProcessing = false;
      }
    }
  }
};
</script>

<style scoped>
.font-weight-bold {
  font-weight: bold;
}
</style>
