<template>
  <div class="search-container">
    <b-form class="form-search" @submit.prevent="search">
      <b-form-input class="input-search" autocomplete="off" v-model="value" placeholder="Buscar orden" @keyup.enter="search"></b-form-input>
    </b-form>

    <b-modal :id="modalId" :title="'Detalle de Orden: ' + orderToSearch" hide-footer size="xl" @hidden="onModalHidden">
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
</style>
