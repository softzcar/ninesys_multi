<template>
  <div class="search-container">
    <b-form class="form-search" @submit.prevent="search">
      <b-form-input class="input-search" autocomplete="off" v-model="value" placeholder="Buscar orden" @keyup.enter="search"></b-form-input>
    </b-form>

    <b-modal :id="modalId" hide-footer size="xl" @hidden="onModalHidden">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <span class="mr-2">Detalle de Orden: {{ orderToSearch }}</span>
          <span v-if="orderStatus" :class="['status-badge', 'status-' + orderStatus.toLowerCase().replace(/\s+/g, '-')]">
            {{ orderStatus }}
          </span>
        </div>
      </template>
      <div v-if="showResultado">
        <buscar-resultado :id="orderToSearch" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Resultado from "~/components/buscar/resultado.vue";

export default {
	components: {
		"buscar-resultado": Resultado,
	},
	data() {
		return {
			value: '',
			orderToSearch: '',
			showResultado: false,
			modalId: `modal-search-${Math.random().toString(36).substring(2, 9)}`
		}
	},
	computed: {
		...mapState('buscar', ['id_orden']),
		orderStatus() {
			if (this.showResultado && this.$store.state.buscar.orden?.orden?.[0]?._id == this.orderToSearch) {
				return this.$store.state.buscar.orden?.orden?.[0]?.status || '';
			}
			return '';
		}
	},

	methods: {
		...mapMutations('buscar', ['setIdOrden']),

		search() {
			if (!this.value.trim()) return
			
			this.orderToSearch = this.value
			this.showResultado = true
			this.$bvModal.show(this.modalId)
			// Limpiar el input después de buscar
			this.value = ''
		},
		onModalHidden() {
			this.showResultado = false
		}
	},
}
</script>

<style scoped>
.search-container {
	display: inline-block;
}
.form-search {
  float: right;
  margin: 0;
}

.input-search {
  width: 200px !important;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  vertical-align: middle;
  margin-left: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.status-activa {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}
.status-badge.status-activa::before {
  background-color: #28a745;
  box-shadow: 0 0 6px #28a745;
  animation: pulse-green 2s infinite;
}

.status-badge.status-en-espera,
.status-badge.status-espera {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}
.status-badge.status-en-espera::before,
.status-badge.status-espera::before {
  background-color: #ffc107;
  box-shadow: 0 0 6px #ffc107;
  animation: pulse-yellow 2s infinite;
}

.status-badge.status-pausada {
  background-color: rgba(108, 117, 125, 0.15);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}
.status-badge.status-pausada::before {
  background-color: #6c757d;
}

.status-badge.status-cancelada {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}
.status-badge.status-cancelada::before {
  background-color: #dc3545;
}

.status-badge.status-terminada {
  background-color: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
  border: 1px solid rgba(23, 162, 184, 0.3);
}
.status-badge.status-terminada::before {
  background-color: #17a2b8;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(40, 167, 69, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

@keyframes pulse-yellow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(255, 193, 7, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}
</style>
