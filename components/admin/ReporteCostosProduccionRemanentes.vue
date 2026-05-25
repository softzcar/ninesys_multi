<template>
  <div>
    <b-link @click="showModal" class="text-danger font-weight-bold">
      $ {{ (Number(valor) || 0).toFixed(2) }}
    </b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Pérdidas por Remanentes (Descartes) - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <!-- Panel de Prorrateo -->
      <b-row class="mb-4">
        <b-col md="12">
          <b-card bg-variant="light" border-variant="danger" class="shadow-sm">
            <h5 class="text-danger mb-3">
              <b-icon-calculator-fill class="mr-2"></b-icon-calculator-fill>
              Fórmula de Prorrateo Operativo
            </h5>
            <p class="text-muted mb-3">
              Las pérdidas por material dañado o descartado en el depósito representan una merma general en la utilidad de la empresa. Siguiendo el principio de prorrateo operativo, se calcula la pérdida por unidad en base al total de productos del periodo y se le asigna una porción correspondiente a cada orden según su cantidad de productos.
            </p>
            <b-row class="align-items-center">
              <b-col md="4" class="border-right">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Pérdida Total del Periodo:</span>
                  <b-badge variant="danger" pill class="px-3 py-2 font-weight-bold">
                    $ {{ (Number(totalRemanentesPeriodo) || 0).toFixed(2) }}
                  </b-badge>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Productos del Periodo:</span>
                  <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                    {{ Number(totalProductosPeriodo) || 0 }} und
                  </b-badge>
                </div>
                <hr class="my-2" />
                <div class="d-flex justify-content-between align-items-center text-primary font-weight-bold">
                  <span>Costo por Producto:</span>
                  <span>$ {{ costoPorUnidad.toFixed(4) }} / und</span>
                </div>
              </b-col>
              <b-col md="4" class="border-right">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Productos en esta Orden:</span>
                  <b-badge variant="info" pill class="px-3 py-2 font-weight-bold">
                    {{ Number(totalProductosOrden) || 0 }} und
                  </b-badge>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Costo Unitario de Pérdida:</span>
                  <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                    $ {{ costoPorUnidad.toFixed(4) }}
                  </b-badge>
                </div>
                <hr class="my-2" />
                <div class="d-flex justify-content-between align-items-center text-danger font-weight-bold">
                  <span>Pérdida Asignada a Orden:</span>
                  <span>$ {{ (Number(valor) || 0).toFixed(2) }}</span>
                </div>
              </b-col>
              <b-col md="4" class="text-center">
                <div class="p-3 bg-white border rounded">
                  <small class="text-muted d-block uppercase font-weight-bold mb-1">
                    CÁLCULO DEL PRORRATEO
                  </small>
                  <code class="d-block font-weight-bold text-dark mb-1" style="font-size: 1.1rem;">
                    $ {{ costoPorUnidad.toFixed(4) }} x {{ Number(totalProductosOrden) || 0 }}
                  </code>
                  <strong class="text-danger" style="font-size: 1.3rem;">
                    = $ {{ (Number(valor) || 0).toFixed(2) }}
                  </strong>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <!-- Tabla de Remanentes del Periodo -->
      <h4 class="text-secondary mb-3">Insumos y Materiales Descartados en el Periodo</h4>
      <b-table
        striped
        hover
        :items="remanentesDetalles"
        :fields="fieldsRemanentes"
        responsive
        foot-clone
        class="shadow-sm border rounded"
      >
        <template #cell(fecha)="data">
          {{ formatDate(data.item.fecha) }}
        </template>
        <template #cell(cantidad)="data">
          {{ (Number(data.item.cantidad) || 0).toFixed(2) }}
        </template>
        <template #cell(costo_unitario)="data">
          $ {{ (Number(data.item.costo_unitario) || 0).toFixed(4) }}
        </template>
        <template #cell(total_perdida)="data">
          <strong class="text-danger">$ {{ (Number(data.item.total_perdida) || 0).toFixed(2) }}</strong>
        </template>
        <template #cell(motivo)="data">
          <b-badge variant="warning">{{ data.item.motivo }}</b-badge>
        </template>
        <template #cell(observacion)="data">
          <span class="text-muted">{{ data.item.observacion || '—' }}</span>
        </template>

        <!-- Footer para Totales -->
        <template #foot(fecha)>
          <strong>Totales:</strong>
        </template>
        <template #foot(sku)>
          <span>&nbsp;</span>
        </template>
        <template #foot(nombre_insumo)>
          <span>&nbsp;</span>
        </template>
        <template #foot(cantidad)>
          <span>&nbsp;</span>
        </template>
        <template #foot(costo_unitario)>
          <span>&nbsp;</span>
        </template>
        <template #foot(total_perdida)>
          <strong class="text-danger">$ {{ (Number(totalRemanentesPeriodo) || 0).toFixed(2) }}</strong>
        </template>
        <template #foot(motivo)>
          <span>&nbsp;</span>
        </template>
        <template #foot(observacion)>
          <span>&nbsp;</span>
        </template>
      </b-table>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionRemanentes",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    valor: {
      type: Number,
      required: true,
      default: 0,
    },
    remanentesDetalles: {
      type: Array,
      required: true,
      default: () => [],
    },
    totalProductosPeriodo: {
      type: Number,
      required: true,
      default: 0,
    },
    totalRemanentesPeriodo: {
      type: Number,
      required: true,
      default: 0,
    },
    totalProductosOrden: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      fieldsRemanentes: [
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "sku", label: "SKU", sortable: true },
        { key: "nombre_insumo", label: "Insumo/Material", sortable: true },
        { key: "cantidad", label: "Cant. Descartada", sortable: true },
        { key: "costo_unitario", label: "Costo Unitario", sortable: true },
        { key: "total_perdida", label: "Pérdida ($)", sortable: true },
        { key: "motivo", label: "Motivo", sortable: true },
        { key: "observacion", label: "Observación" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-remanentes-${this.id_orden}`;
    },
    costoPorUnidad() {
      const units = Number(this.totalProductosPeriodo) || 0;
      if (units > 0) {
        return (Number(this.totalRemanentesPeriodo) || 0) / units;
      }
      return 0;
    },
  },
  methods: {
    showModal() {
      this.$bvModal.show(this.modalId);
    },
    formatDate(dateStr) {
      if (!dateStr) return "—";
      try {
        const parts = dateStr.split(" ");
        if (parts.length > 0) {
          const dateParts = parts[0].split("-");
          if (dateParts.length === 3) {
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
          }
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    },
  },
};
</script>
