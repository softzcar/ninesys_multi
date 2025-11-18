<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
        accessModule.accessData.id_modulo === 1 ||
        accessModule.accessData.id_modulo === 3 ||
        accessModule.accessData.id_modulo === 4 ||
        accessModule.accessData.id_modulo === 6
      ">
        <b-overlay :show="overlay" spinner-small>
          <b-container fluid>
            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <b-tabs v-model="activeTab">
                  <b-tab>
                    <template #title>
                      Empleados Activos <b-badge variant="success">{{ empleadosActivos.length }}</b-badge>
                    </template>
                    <b-table
                      :items="empleadosActivos"
                      :fields="fields"
                      striped
                      hover
                    >
                      <template #cell(switch)="data">
                        <b-form-checkbox
                          :checked="data.item.activo === 1"
                          @change="toggleActivo(data.item, $event)"
                          switch
                        >
                          Activo
                        </b-form-checkbox>
                      </template>
                      <template #cell(departamentos)="data">
                        <span>{{ data.item.departamentos.map(d => d.nombre).join(', ') }}</span>
                      </template>
                    </b-table>
                  </b-tab>
                  <b-tab>
                    <template #title>
                      Empleados Inactivos <b-badge variant="danger">{{ empleadosInactivos.length }}</b-badge>
                    </template>
                    <b-table
                      :items="empleadosInactivos"
                      :fields="fields"
                      striped
                      hover
                    >
                      <template #cell(switch)="data">
                        <b-form-checkbox
                          :checked="data.item.activo === 1"
                          @change="toggleActivo(data.item, $event)"
                          switch
                        >
                          {{ data.item.activo === 1 ? 'Activo' : 'Inactivo' }}
                        </b-form-checkbox>
                      </template>
                      <template #cell(departamentos)="data">
                        <span>{{ data.item.departamentos.map(d => d.nombre).join(', ') }}</span>
                      </template>
                    </b-table>
                  </b-tab>
                </b-tabs>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],

  data() {
    return {
      titulo: "Activación de Empleados",
      overlay: true,
      empleados: [],
      activeTab: 0,
      fields: [
        { key: 'switch', label: '' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'username', label: 'Usuario' },
        { key: 'departamentos', label: 'Departamentos' }
      ]
    }
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
    empleadosActivos() {
      return this.empleados ? this.empleados.filter(emp => emp.activo === 1) : []
    },
    empleadosInactivos() {
      return this.empleados ? this.empleados.filter(emp => emp.activo === 0) : []
    }
  },
  async mounted() {
    await this.cargarEmpleados()
  },
  methods: {
    async cargarEmpleados() {
      this.overlay = true
      try {
        const response = await this.$axios.get(`${this.$config.API}/empleados-todos`)
        this.empleados = response.data.items
      } catch (error) {
        console.error('Error al cargar empleados:', error)
        this.$fire({
          title: "Error cargando empleados",
          html: `<p>${error}</p>`,
          type: "warning",
        })
      } finally {
        this.overlay = false
      }
    },
    async toggleActivo(empleado, nuevoEstado) {
      const estadoAnterior = empleado.activo
      try {
        this.overlay = true
        // Actualizar el estado del empleado en el servidor
        const data = new URLSearchParams()
        data.set('id_empleado', empleado._id)
        data.set('activo', nuevoEstado ? 1 : 0)

        console.log('Empleado completo:', empleado)
        console.log('Nuevo estado:', nuevoEstado)
        console.log('Enviando datos:', { id_empleado: empleado._id, activo: nuevoEstado ? 1 : 0 })

        await this.$axios.post(`${this.$config.API}/empleados/activacion`, data)

        // Después de actualizar, recargar los datos desde cero
        this.empleados = []
        await this.cargarEmpleados()
        // Forzar actualización completa del componente
        await this.$nextTick()
        this.$forceUpdate()
        this.$fire({
          title: "Empleado actualizado",
          html: `<p>El estado del empleado ha sido actualizado correctamente</p>`,
          type: "success",
        })
      } catch (error) {
        console.error('Error al actualizar empleado:', error)
        // Revertir el cambio en caso de error
        empleado.activo = estadoAnterior
        // Forzar actualización del DOM después de revertir
        await this.$nextTick()
        this.$forceUpdate()
        this.$fire({
          title: "Error actualizando empleado",
          html: `<p>${error}</p>`,
          type: "danger",
        })
      } finally {
        this.overlay = false
      }
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>