<template>
  <!-- <b-form class="input-search"> -->
  <b-form-input class="input-search" autocomplete="off" v-model="value" placeholder="Buscar orden" v-on:keyup.enter="search" icon="search"></b-form-input>
  <!-- </b-form> -->
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
.input-search {
	width: 200px !important;
	float: right;
}
</style>
