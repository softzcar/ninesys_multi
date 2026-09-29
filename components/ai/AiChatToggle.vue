<template>
  <b-button
    variant="light"
    class="header-action-btn aichat-toggle d-inline-flex align-items-center justify-content-center"
    :class="{ 'aichat-toggle-active': isOpen }"
    :aria-pressed="isOpen ? 'true' : 'false'"
    v-b-tooltip.hover.bottom
    :title="isOpen ? 'Cerrar Asistente IA' : 'Abrir Asistente IA'"
    @click="$store.commit('aichat/toggle')"
  >
    <b-icon
      icon="stars"
      class="ai-icon"
      :class="{ 'ai-icon-active': isOpen, 'ai-icon-inactive': !isOpen, 'mr-md-1': true }"
      font-scale="1.15"
    />
    <span class="d-none d-md-inline font-weight-bold text-nowrap label-text">Asistente IA</span>
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
.header-action-btn {
  height: 38px;
  padding: 0 0.75rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.header-action-btn:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.label-text {
  font-size: 0.88rem;
  color: #333;
}

.ai-icon-inactive {
  color: #17a2b8;
}

.aichat-toggle-active {
  background-color: #17a2b8 !important;
  border-color: #17a2b8 !important;
  color: #fff !important;
  box-shadow: 0 2px 6px rgba(23, 162, 184, 0.35) !important;
}

.aichat-toggle-active .label-text {
  color: #fff !important;
}

.ai-icon-active {
  color: #fff !important;
}
</style>

