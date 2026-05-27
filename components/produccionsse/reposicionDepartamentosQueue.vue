<template>
  <div>
    <!-- Botón que abre el popover -->
    <b-button
      :id="`repo-queue-btn-${id_reposicion}`"
      variant="outline-secondary"
      size="sm"
      :title="`Gestionar cola de departamentos`"
      @click="onOpen"
    >
      <b-icon icon="list-check" />
    </b-button>

    <!-- Popover con la lista de departamentos -->
    <b-popover
      :target="`repo-queue-btn-${id_reposicion}`"
      :id="`repo-queue-pop-${id_reposicion}`"
      triggers="click blur"
      placement="left"
      custom-class="repo-queue-popover"
      boundary="viewport"
    >
      <template #title>
        <div class="d-flex align-items-center justify-content-between">
          <span>
            <b-icon icon="list-check" class="mr-1" />
            Cola de departamentos
          </span>
          <b-button
            variant="link"
            size="sm"
            class="p-0 ml-2 text-white"
            @click="closePopover"
            title="Cerrar"
          >
            <b-icon icon="x" />
          </b-button>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-3">
        <b-spinner small variant="primary" />
        <small class="ml-2 text-muted">Cargando departamentos...</small>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-danger py-2">
        <b-icon icon="exclamation-triangle" />
        <small>{{ error }}</small>
      </div>

      <!-- Lista de departamentos -->
      <div v-else-if="departamentos.length">
        <small class="text-muted d-block mb-2">
          Desmarca los pasos que deseas omitir en la reposición.
        </small>

        <ul class="list-unstyled mb-0">
          <li
            v-for="dep in departamentos"
            :key="dep.id_departamento"
            class="repo-queue-item"
            :class="{
              'repo-queue-inicio': dep.es_inicio == 1,
              'repo-queue-destino': dep.es_destino == 1,
              'repo-queue-excluido': dep.excluido == 1 && !dep.es_inicio && !dep.es_destino,
            }"
          >
            <div class="d-flex align-items-center">
              <!-- Checkbox deshabilitado para inicio/destino -->
              <b-form-checkbox
                :checked="dep.excluido != 1"
                :disabled="dep.es_inicio == 1 || dep.es_destino == 1 || dep.saving"
                @change="(val) => toggleExclusion(dep, !val)"
                class="mr-2 mb-0"
                size="sm"
              />

              <!-- Nombre del departamento -->
              <div class="flex-grow-1">
                <span :class="{ 'text-muted text-decoration-line-through': dep.excluido == 1 && !dep.es_inicio && !dep.es_destino }">
                  {{ dep.departamento }}
                </span>
                <span v-if="dep.es_inicio == 1" class="badge badge-success ml-1" style="font-size:0.65em">inicio</span>
                <span v-if="dep.es_destino == 1" class="badge badge-primary ml-1" style="font-size:0.65em">destino</span>
              </div>

              <!-- Spinner por dep mientras guarda -->
              <b-spinner v-if="dep.saving" small variant="secondary" class="ml-1" />
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="text-muted py-2 text-center">
        <small>Sin departamentos intermedios.</small>
      </div>
    </b-popover>
  </div>
</template>

<script>
export default {
  name: 'ReposicionDepartamentosQueue',

  props: {
    id_reposicion: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      departamentos: [],
      loading: false,
      loaded: false,
      error: null,
    };
  },

  methods: {
    onOpen() {
      // Carga lazy: solo al abrir por primera vez
      if (!this.loaded && !this.loading) {
        this.fetchDepartamentos();
      }
    },

    closePopover() {
      this.$root.$emit('bv::hide::popover', `repo-queue-pop-${this.id_reposicion}`);
    },

    async fetchDepartamentos() {
      this.loading = true;
      this.error = null;
      try {
        const res = await this.$axios.get(
          `${this.$config.API}/reposicion/${this.id_reposicion}/departamentos-cola`
        );
        // Agregar campo 'saving' reactivo a cada departamento
        this.departamentos = (res.data || []).map(d => ({ ...d, saving: false }));
        this.loaded = true;
      } catch (e) {
        this.error = 'No se pudo cargar la cola de departamentos.';
        console.error('[ReposicionDepartamentosQueue] Error:', e);
      } finally {
        this.loading = false;
      }
    },

    async toggleExclusion(dep, excluir) {
      dep.saving = true;
      try {
        await this.$axios.post(
          `${this.$config.API}/reposicion/${this.id_reposicion}/excluir-departamento`,
          {
            id_departamento: dep.id_departamento,
            excluir: excluir,
          }
        );
        dep.excluido = excluir ? 1 : 0;
      } catch (e) {
        const msg = e?.response?.data?.error || 'Error al actualizar la exclusión.';
        this.$bvToast.toast(msg, {
          title: 'Error',
          variant: 'danger',
          solid: true,
          toaster: 'b-toaster-top-right',
        });
        console.error('[ReposicionDepartamentosQueue] toggleExclusion error:', e);
      } finally {
        dep.saving = false;
      }
    },
  },
};
</script>

<style>
/* Estilos globales para el popover (no scoped para que apliquen al portal) */
.repo-queue-popover .popover-header {
  background-color: #375a7f;
  color: #fff;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
}

.repo-queue-popover .popover-body {
  padding: 0.5rem 0.75rem;
  min-width: 220px;
  max-width: 280px;
}

.repo-queue-item {
  padding: 0.3rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.82rem;
}

.repo-queue-item:last-child {
  border-bottom: none;
}

.repo-queue-inicio {
  background-color: rgba(0, 188, 140, 0.06);
}

.repo-queue-destino {
  background-color: rgba(55, 90, 127, 0.06);
}

.repo-queue-excluido span:first-child {
  opacity: 0.55;
}

.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
