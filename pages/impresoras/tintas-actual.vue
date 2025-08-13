<template>
  <div>
    <menus-MenuLoader />
    <b-container fluid>
      <b-row>
        <b-col>
          <h2 class="mb-4">Reporte de Tintas Actuales</h2>
          <impresoras-TintasActualReporte :inkData="inkData" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

export default {
  data() {
    return {
      inkData: [],
      overlay: true,
    };
  },
  async fetch() {
    try {
      this.overlay = true;
      const response = await this.$axios.get(`${this.$config.API}/impresoras-tintas-actual`);
      this.inkData = response.data;
    } catch (error) {
      console.error("Error al obtener datos de tintas:", error);
      // Handle error, e.g., show a message to the user
    } finally {
      this.overlay = false;
    }
  },
  head() {
    return {
      title: 'Reporte de Tintas Actuales',
    };
  },
};
</script>

<style scoped>
/* Add any specific styles for the page here */
</style>