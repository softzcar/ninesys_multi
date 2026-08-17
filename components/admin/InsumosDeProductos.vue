<template>
  <admin-AsignacionInsumosProductosV2 :tab-active="tabActive" />
</template>

<script>
export default {
  // El nuevo componente es auto-contenido y maneja su propia lógica.
  // Nuxt se encargará de la importación y registro del componente.
  props: {
    tabActive: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style scoped>
/* Estilos si son necesarios */
</style>
