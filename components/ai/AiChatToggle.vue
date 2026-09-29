<template>
  <b-button
    :variant="isOpen ? 'info' : 'outline-info'"
    size="sm"
    class="aichat-toggle"
    :aria-pressed="isOpen ? 'true' : 'false'"
    v-b-tooltip.hover.bottom
    :title="isOpen ? 'Cerrar Asistente IA' : 'Abrir Asistente IA'"
    @click="$store.commit('aichat/toggle')"
  >
    <b-icon icon="robot" class="mr-1" />
    <span class="d-none d-md-inline">Asistente IA</span>
  </b-button>
</template>

<script>
export default {
  name: 'AiChatToggle',
  computed: {
    isOpen() {
      return this.$store.state.aichat.isOpen
    },
  },
}
</script>

<style scoped>
.aichat-toggle {
  white-space: nowrap;
}
</style>
