<template>
  <div>
    <b-modal :id="'modal-notas-' + id_orden" :title="'Notas de Empleados - Orden #' + id_orden" size="lg" ok-only @show="fetchNotas" scrollable>
      <b-overlay :show="loading" spinner-small>
        <div v-if="notas.length === 0 && !loading" class="text-center p-4">
          <p class="text-muted">No hay empleados asignados o notas registradas para esta orden.</p>
        </div>

        <b-list-group v-else>
          <div v-for="(item, index) in notas" :key="index" class="mb-2">
            <b-list-group-item 
              class="d-flex justify-content-between align-items-center"
              :class="item.tiene_nota ? 'list-group-item-action cursor-pointer bg-light' : ''"
              @click="item.tiene_nota ? toggleCollapse(index) : null"
              style="border-radius: 5px;"
            >
              <div>
                <strong>{{ item.empleado }}</strong>
                <b-badge variant="info" class="ml-2">{{ item.departamento }}</b-badge>
              </div>
              <div v-if="item.tiene_nota">
                <b-icon :icon="item.visible ? 'chevron-up' : 'chevron-down'" variant="primary"></b-icon>
              </div>
              <div v-else>
                <small class="text-muted">Sin notas</small>
              </div>
            </b-list-group-item>

            <b-collapse v-if="item.tiene_nota" :id="'collapse-nota-' + id_orden + '-' + index" v-model="item.visible" class="mt-2">
              <b-card border-variant="primary" class="shadow-sm">
                <div class="quill-content" v-html="item.nota"></div>
              </b-card>
            </b-collapse>
          </div>
        </b-list-group>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ModalNotasProduccion",
  props: {
    id_orden: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      notas: []
    };
  },
  methods: {
    async fetchNotas() {
      this.loading = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/ordenes/notas-por-empleado/${this.id_orden}`);
        this.notas = response.data.map(n => ({
          ...n,
          visible: false
        }));
      } catch (error) {
        console.error("Error fetching notes:", error);
        this.$fire({
          title: "Error",
          text: "No se pudieron cargar las notas de los empleados.",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    },
    toggleCollapse(index) {
      this.notas[index].visible = !this.notas[index].visible;
      // Forzar reactividad si es necesario, aunque Vue 2/3 lo manejan bien con objetos reactivos
      this.$set(this.notas, index, { ...this.notas[index] });
    }
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.quill-content {
  line-height: 1.5;
}
/* Estilos básicos para que el contenido de Quill se vea bien */
.quill-content >>> img {
  max-width: 100%;
  height: auto;
}
.quill-content >>> p {
  margin-bottom: 0.5rem;
}
</style>
