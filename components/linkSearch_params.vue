<template>
  <div>
    <b-button :to="linkTo" variant="outline-primary">{{ id }}</b-button>
  </div>
</template>

<script>
export default {
  computed: {
    linkTo() {
      return `/buscar/${this.id}`
    },
  },

  props: ['id'],
}
</script>
