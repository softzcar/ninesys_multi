<template>
  <div class="container mt-4">
    <b-overlay :show="overlay" rounded="sm">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Reporte de Impresoras</h2>
        </div>
        <div class="card-body">
          <b-table striped hover :items="impresoras" :fields="fields">
            <template #cell(tintas_recargas)="row">
              <b-button size="sm" variant="primary" @click="row.toggleDetails" class="mr-2" :disabled="!row.item.tintas_recargas || row.item.tintas_recargas.length === 0 || (row.item.tintas_recargas.length === 1 && row.item.tintas_recargas[0].id === null)">
                {{ row.detailsShowing ? 'Ocultar' : 'Mostrar' }} Recargas
              </b-button>
            </template>
            <template #row-details="row">
              <b-card>
                <p><strong>Recargas de Tinta:</strong></p>
                <b-table striped hover :items="row.item.tintas_recargas" :fields="tintaRecargasFields"></b-table>
              </b-card>
            </template>
          </b-table>
        </div>
      </div>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: "ReporteImpresoras",
  data() {
    return {
      impresoras: [],
      overlay: false,
      fields: [
        { key: "codigo_interno", label: "Código Interno" },
        { key: "marca", label: "Marca" },
        { key: "modelo", label: "Modelo" },
        { key: "ubicacion", label: "Ubicación" },
        { key: "tipo_tecnologia", label: "Tipo Tecnología" },
        { key: "estado", label: "Estado" },
        { key: "notas", label: "Notas" },
        { key: "tintas_recargas", label: "Recargas", class: "text-center" },
      ],
      tintaRecargasFields: [
        { key: "id_catalogo_impresora", label: "ID Impresora" },
        { key: "id_insumo", label: "ID Insumo" },
        { key: "color", label: "Color" },
        { key: "cantidad", label: "Cantidad (ml)" },
        { key: "fecha_recarga", label: "Fecha Recarga", formatter: "formatDate" },
      ],
    };
  },
  methods: {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
    async fetchImpresoras() {
      this.overlay = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/impresoras`);
        this.impresoras = response.data;
      } catch (error) {
        console.error("Error al obtener las impresoras:", error);
        this.$fire({
          title: "Error",
          html: `<p>No se pudieron cargar las impresoras. ${error.message}</p>`,
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
    },
  },
  created() {
    this.fetchImpresoras();
  },
};
</script>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style>
