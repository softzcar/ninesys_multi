<template>
  <div>
    <div v-if="$nuxt.isOffline">
      <b-icon icon="wifi-off" variant="danger"></b-icon>
    </div>
    <div v-else>
      <b-icon icon="wifi" variant="success"></b-icon>
    </div>
  </div>
</template>

<script>
export default {
	data() {
		return {
			status: {
				icon: 'wifi',
				variant: 'success',
			},
		}
	},

	computed: {
		checkConnection() {
			let newStatus = window.addEventListener('offline', function(e) {
				console.log('offline')
			})

			window.addEventListener('online', function(e) {
				console.log('online')
			})
			return newStatus
		},
	},
}
</script>

