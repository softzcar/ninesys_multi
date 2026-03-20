<template>
  <div class="d-inline-block">
    <b-button variant="outline-primary" @click="$bvModal.show('modal-resumen-sku')" class="mr-2" title="Ver consolidado por SKU">
      <b-icon icon="layers-half" class="mr-1"></b-icon> Ver Resumen SKU
    </b-button>

    <b-modal id="modal-resumen-sku" title="Resumen de Inventario Agrupado por SKU" size="xl" hide-footer scrollable header-bg-variant="light">
      <div v-if="resumenData.length === 0" class="text-center py-5">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2 text-muted">Procesando datos de inventario...</p>
      </div>
      
      <div v-else>
        <b-row class="mb-3">
          <b-col md="6">
            <b-input-group size="sm">
              <b-form-input v-model="filter" placeholder="Buscar en resumen..."></b-form-input>
              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">Limpiar</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
          <b-col md="6" class="text-right">
            <span class="small text-muted">Mostrando {{ resumenData.length }} SKUs únicos</span>
          </b-col>
        </b-row>

        <b-table
          striped
          hover
          small
          responsive
          :items="resumenData"
          :fields="fields"
          :filter="filter"
          sort-icon-left
          head-variant="light"
          class="shadow-sm border"
        >
          <template #cell(cantidadTotal)="data">
            <div class="d-flex justify-content-between align-items-center">
              <span class="font-weight-bold text-dark">{{ data.value }}</span>
              <b-badge variant="light" class="ml-2">{{ data.item.unidad }}</b-badge>
            </div>
          </template>

          <template #cell(metrosTotal)="data">
            <div v-if="data.item.tipo_insumo === 'tela'" class="text-info font-weight-bold">
              {{ data.value }} <small>Mts</small>
            </div>
            <div v-else class="text-muted small">
              -
            </div>
          </template>

          <template #cell(conteo)="data">
            <b-badge pill variant="info">{{ data.value }}</b-badge>
          </template>
        </b-table>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'ResumenSkuModal',
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      filter: null,
      fields: [
        { key: 'sku', label: 'SKU', sortable: true, thClass: 'bg-light' },
        { key: 'insumo', label: 'Nombre del Insumo', sortable: true, thClass: 'bg-light' },
        { key: 'unidad', label: 'Unidad Base', sortable: true, thClass: 'bg-light' },
        { key: 'cantidadTotal', label: 'Stock Total', sortable: true, thClass: 'bg-light text-right', tdClass: 'text-right' },
        { key: 'metrosTotal', label: 'Equiv. Metros', sortable: true, thClass: 'bg-light text-right', tdClass: 'text-right' },
        { key: 'conteo', label: 'Ítems', sortable: true, thClass: 'bg-light text-center', tdClass: 'text-center' },
      ]
    }
  },
  computed: {
    resumenData() {
      if (!this.items || this.items.length === 0) return []

      const groups = this.items.reduce((acc, item) => {
        const sku = item.sku || 'N/A'
        if (!acc[sku]) {
          acc[sku] = {
            sku: sku,
            insumo: item.insumo || 'Sin nombre',
            unidad: item.unidad || '-',
            tipo_insumo: 'general',
            cantidadTotal: 0,
            metrosTotal: 0,
            conteo: 0
          }
        }
        
        // Determinar si este SKU es de tipo tela basándose estrictamente en tipo_insumo
        const tipoLimpio = (item.tipo_insumo || '').toLowerCase().trim();
        if (tipoLimpio === 'tela') {
          acc[sku].tipo_insumo = 'tela';
        }

        const cantidad = parseFloat(item.cantidad || 0);
        const rendimiento = parseFloat(item.rendimiento || 0);
        const metrosCalculados = cantidad * rendimiento;

        acc[sku].cantidadTotal += cantidad;
        acc[sku].metrosTotal += metrosCalculados;
        acc[sku].conteo += 1
        return acc
      }, {})

      return Object.values(groups).map(g => ({
        ...g,
        cantidadTotal: parseFloat(g.cantidadTotal.toFixed(2)),
        metrosTotal: parseFloat(g.metrosTotal.toFixed(2))
      }))
    }
  }
}
</script>

<style scoped>
.modal-xl {
  max-width: 90%;
}
</style>
