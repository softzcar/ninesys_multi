<template>
  <div>
    <b-link @click="showModal" class="text-warning font-weight-bold">
      $ {{ (Number(valor) || 0).toFixed(2) }}
    </b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Mantenimiento de Impresoras - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <!-- Panel de Prorrateo -->
      <b-row class="mb-4">
        <b-col md="12">
          <b-card bg-variant="light" border-variant="warning" class="shadow-sm">
            <h5 class="text-warning mb-3">
              <b-icon-tools class="mr-2"></b-icon-tools>
              Fórmula de Prorrateo de Mantenimiento
            </h5>
            <p class="text-muted mb-3">
              El costo de servicios técnicos, afinaciones y reparaciones de impresoras representa un gasto de soporte indirecto necesario para la operatividad del taller. Se prorratea según la producción total, asignándole a cada orden su porción justa de acuerdo con los productos fabricados en ella.
            </p>
            <b-row class="align-items-center">
              <b-col md="4" class="border-right">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Mantenimiento Total Periodo:</span>
                  <b-badge variant="warning" pill class="px-3 py-2 font-weight-bold">
                    $ {{ (Number(totalMantenimientoPeriodo) || 0).toFixed(2) }}
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
                  <span>Tasa por Producto:</span>
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
                  <span>Tasa de Mantenimiento:</span>
                  <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                    $ {{ costoPorUnidad.toFixed(4) }}
                  </b-badge>
                </div>
                <hr class="my-2" />
                <div class="d-flex justify-content-between align-items-center text-warning font-weight-bold">
                  <span>Monto Asignado a Orden:</span>
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
                  <strong class="text-warning" style="font-size: 1.3rem;">
                    = $ {{ (Number(valor) || 0).toFixed(2) }}
                  </strong>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <!-- Tabla de Servicios del Periodo -->
      <h4 class="text-secondary mb-3">Servicios Técnicos Realizados en el Periodo</h4>
      <b-table
        striped
        hover
        :items="mantenimientoDetalles"
        :fields="fieldsMantenimiento"
        responsive
        foot-clone
        class="shadow-sm border rounded"
      >
        <template #cell(fecha_servicio)="data">
          {{ formatDate(data.item.fecha_servicio) }}
        </template>
        <template #cell(costo)="data">
          <strong class="text-warning">$ {{ (Number(data.item.costo) || 0).toFixed(2) }}</strong>
        </template>
        <template #cell(tipo_servicio)="data">
          <b-badge variant="info">{{ data.item.tipo_servicio }}</b-badge>
        </template>
        <template #cell(descripcion)="data">
          <span>{{ data.item.descripcion || '—' }}</span>
        </template>
        <template #cell(tecnico)="data">
          <span class="text-muted">{{ data.item.tecnico || 'Desconocido' }}</span>
        </template>

        <!-- Footer para Totales -->
        <template #foot(fecha_servicio)>
          <strong>Totales:</strong>
        </template>
        <template #foot(maquina_nombre)>
          <span>&nbsp;</span>
        </template>
        <template #foot(tipo_servicio)>
          <span>&nbsp;</span>
        </template>
        <template #foot(descripcion)>
          <span>&nbsp;</span>
        </template>
        <template #foot(tecnico)>
          <span>&nbsp;</span>
        </template>
        <template #foot(costo)>
          <strong class="text-warning">$ {{ (Number(totalMantenimientoPeriodo) || 0).toFixed(2) }}</strong>
        </template>
      </b-table>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionMantenimiento",
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
    mantenimientoDetalles: {
      type: Array,
      required: true,
      default: () => [],
    },
    totalProductosPeriodo: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMantenimientoPeriodo: {
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
      fieldsMsn: [],
      fieldsMantenimiento: [
        { key: "fecha_servicio", label: "Fecha", sortable: true },
        { key: "maquina_nombre", label: "Impresora / Máquina", sortable: true },
        { key: "tipo_servicio", label: "Tipo de Servicio", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
        { key: "descripcion", label: "Descripción" },
        { key: "costo", label: "Costo ($)", sortable: true },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-mantenimiento-${this.id_orden}`;
    },
    costoPorUnidad() {
      const units = Number(this.totalProductosPeriodo) || 0;
      if (units > 0) {
        return (Number(this.totalMantenimientoPeriodo) || 0) / units;
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
