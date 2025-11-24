<template>
  <div v-if="$store.state.login.dataEmpresa.id === 152">
    <b-button @click="$bvModal.show(modal)" variant="outline-info">
      Buscar en Histórico
    </b-button>

    <b-modal :id="modal" title="Búsqueda en Histórico" hide-footer size="xl" @hidden="onModalHidden">
      <div class="search-section mb-3">
        <b-input-group>
          <b-form-input
            v-model="searchId"
            placeholder="Ingrese número de orden"
            @keyup.enter="performSearch"
            autocomplete="off"
          />
          <b-input-group-append>
            <b-button @click="performSearch" variant="primary" :disabled="!searchId.trim() || loading">
              <b-spinner v-if="loading" small></b-spinner>
              <span v-else>Buscar</span>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>

      <div class="table-wrapper">
        <b-overlay :show="loading" spinner-small>
          <buscar-resultado v-if="searchResults" :customData="searchResults" :observacionesCargadas="observacionesLoaded" />
          <div v-else-if="searchPerformed && !loading">
            <b-alert variant="warning" show>
              No se encontró la orden con el número {{ searchId }}
            </b-alert>
          </div>
        </b-overlay>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Resultado from "~/components/buscar/resultado.vue";

export default {
  components: { "buscar-resultado": Resultado },
  data() {
    return {
      searchId: '',
      searchResults: null,
      loading: false,
      searchPerformed: false,
      observacionesLoaded: false
    }
  },

  computed: {
    modal() {
      const rand = Math.random().toString(36).substring(2, 7);
      return `historico-modal-${rand}`;
    }
  },

  methods: {
    performSearch() {
      if (!this.searchId.trim()) return;

      this.loading = true;
      this.searchResults = null;
      this.searchPerformed = true;
      this.observacionesLoaded = false;

      // Petición de orden
      this.$axios.get(
        `${this.$config.API}/buscar/${this.searchId}`,
        {
          headers: {
            Authorization: '1' // Forzar búsqueda en empresa 1
          }
        }
      )
      .then(response => {
        if (response.data) {
          this.searchResults = response.data;

          // Petición de observaciones (en paralelo, sin bloquear)
          this.$axios.get(
            `${this.$config.API}/ordenes-observaciones/${this.searchId}`,
            {
              headers: {
                Authorization: '1' // Forzar empresa 1 también para observaciones
              }
            }
          )
          .then(obsResponse => {
            if (obsResponse.data && obsResponse.data.length > 0) {
              this.$store.commit("buscar/setObservaciones", obsResponse.data[0].observaciones);
            }
            this.observacionesLoaded = true;
          })
          .catch(obsError => {
            console.error('Error cargando observaciones:', obsError);
            this.observacionesLoaded = true; // Desactivar overlay incluso en error
          });
        }
      })
      .catch(error => {
        console.error('Error en búsqueda histórica:', error);
        this.$bvToast.toast('Error al buscar la orden', {
          title: 'Error',
          variant: 'danger'
        });
      })
      .finally(() => {
        this.loading = false;
      });
    },

    formatDate(date) {
      if (!date) return '';
      const parts = date.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    onModalHidden() {
      this.searchId = '';
      this.searchResults = null;
      this.loading = false;
      this.searchPerformed = false;
      this.observacionesLoaded = false;
      // Limpiar observaciones del store
      this.$store.commit("buscar/setObservaciones", '');
    }
  }
}
</script>

<style scoped>
.search-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.results-section {
  max-height: 70vh;
  overflow-y: auto;
}

.order-header {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}
</style>