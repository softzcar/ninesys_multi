<template>
  <div>
    <b-table responsive :fields="dataTable.fields" :items="dataTable.items">
      <template #cell(orden)="data">
        <linkSearch :id="data.item.orden" />
      </template>

      <template #cell(asignar)="data">
        <produccion-asignar :id="data.item.orden" />
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  computed: {
    dataTable() {
      return this.$store.state.produccion.ordenesActivas
    },
  },

  mounted() {
    this.$store.dispatch('produccion/getOrdenesActivas')
  },
}
</script>
