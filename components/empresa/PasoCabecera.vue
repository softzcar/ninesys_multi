<template>
  <div class="mb-4">
    <b-badge v-if="paso.noAplica" variant="secondary" class="mb-2">No aplica</b-badge>
    <b-badge v-else-if="paso.revisado" variant="success" class="mb-2">Revisado</b-badge>
    <p class="lead">{{ paso.descripcion }}</p>
    <b-alert v-if="paso.noAplica" show variant="light" class="small">
      No detectamos departamentos de impresión o estampado activos, así que este paso no aplica a
      tu negocio. Si más adelante lo necesitas, puedes configurarlo desde el menú normal.
    </b-alert>
  </div>
</template>

<script>
export default {
  name: "PasoCabecera",
  props: {
    paso: {
      type: Object,
      required: true,
    },
  },
};
</script>
