<template>
  <b-form class="form-search" @submit.prevent="search">
    <b-form-input class="input-search" autocomplete="off" v-model="value" placeholder="Buscar orden" @keyup.enter="search" icon="search"></b-form-input>
  </b-form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
	data() {
		return {
			value: '',
		}
	},
	computed: {
		...mapState('buscar', ['id_orden']),
	},

	methods: {
		...mapMutations('buscar', ['setIdOrden']),

		search() {
			// e.preventDefault()
			console.log(`vamos a buscar: /buscar/${this.value}`)
			this.$router.push(`/buscar/${this.value}`)
			// this.$router.push({ path: '/buscar', query: { id: this.$route.params.id } })
			// this.$store.commit('buscar/setIdOrden', this.value)
		},
	},
}
</script>

<style scoped>
.form-search {
  float: right;
  margin: 0;
}

.input-search {
  width: 200px !important;
}
</style>
