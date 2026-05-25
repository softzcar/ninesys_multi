<template>
  <div>
    <b-link @click="showModal" :class="`text-${variant} font-weight-bold`">
      $ {{ (Number(valor) || 0).toFixed(2) }}
    </b-link>

    <b-modal
      :id="modalId"
      :title="modalTitle"
      hide-footer
      size="xl"
    >
      <!-- Panel de Prorrateo -->
      <b-row class="mb-4">
        <b-col md="12">
          <b-card bg-variant="light" :border-variant="variant" class="shadow-sm">
            <h5 :class="`text-${variant} mb-3`">
              <component :is="iconComponent" class="mr-2"></component>
              Fórmula de Prorrateo de Gasto {{ labelCapitalized }}
            </h5>
            <p class="text-muted mb-3">
              {{ description }}
            </p>
            <b-row class="align-items-center">
              <b-col md="4" class="border-right">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>Pool de Gastos {{ labelCapitalized }}s:</span>
                  <b-badge :variant="variant" pill class="px-3 py-2 font-weight-bold">
                    $ {{ (Number(totalGastosUSD) || 0).toFixed(2) }}
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
                  <span>Tasa Operativa Asignada:</span>
                  <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                    $ {{ costoPorUnidad.toFixed(4) }}
                  </b-badge>
                </div>
                <hr class="my-2" />
                <div class="d-flex justify-content-between align-items-center font-weight-bold" :class="`text-${variant}`">
                  <span>Gasto Asignado a Orden:</span>
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
                  <strong :class="`text-${variant}`" style="font-size: 1.3rem;">
                    = $ {{ (Number(valor) || 0).toFixed(2) }}
                  </strong>
                </div>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <!-- SECCIÓN ESPECIAL GASTOS FIJOS (Plantillas vs Reales) -->
      <div v-if="tipo === 'fijo'">
        <!-- Tabla de Plantillas Fijas -->
        <h4 class="text-secondary mb-3">Plantillas de Gastos Fijos (Prorrateo Mensual del Periodo)</h4>
        <b-table
          v-if="gastosPlantillasFijas && gastosPlantillasFijas.length"
          striped
          hover
          :items="gastosPlantillasFijas"
          :fields="fieldsPlantillasFijas"
          responsive
          foot-clone
          class="shadow-sm border rounded mb-4"
        >
          <template #cell(monto_mensual)="data">
            $ {{ (Number(data.item.monto_mensual) || 0).toFixed(2) }} {{ data.item.moneda }}
          </template>
          <template #cell(monto_prorrateado)="data">
            <strong class="text-primary">$ {{ (Number(data.item.monto_prorrateado) || 0).toFixed(2) }} {{ data.item.moneda }}</strong>
          </template>
          <template #cell(periodicidad)="data">
            <b-badge variant="light" class="border">{{ data.item.periodicidad.toUpperCase() }}</b-badge>
          </template>
          <template #cell(descripcion)="data">
            <span class="text-muted">{{ data.item.descripcion || '—' }}</span>
          </template>

          <template #foot(nombre)>
            <strong>Subtotal Plantillas:</strong>
          </template>
          <template #foot(descripcion)>
            <span>&nbsp;</span>
          </template>
          <template #foot(monto_mensual)>
            <span>&nbsp;</span>
          </template>
          <template #foot(periodicidad)>
            <span>&nbsp;</span>
          </template>
          <template #foot(monto_prorrateado)>
            <strong class="text-primary">$ {{ totalTemplatesProrrateado.toFixed(2) }} USD</strong>
          </template>
        </b-table>
        <p v-else class="text-center p-3 text-muted mb-4 border rounded">No hay plantillas fijas configuradas.</p>

        <!-- Tabla de Registros Fijos Reales -->
        <h4 class="text-secondary mb-3">Pagos de Gastos Fijos Registrados en el Periodo</h4>
        <b-table
          v-if="realesFiltrados && realesFiltrados.length"
          striped
          hover
          :items="realesFiltrados"
          :fields="fieldsReales"
          responsive
          foot-clone
          class="shadow-sm border rounded"
        >
          <template #cell(fecha_de_gasto)="data">
            {{ formatDate(data.item.fecha_de_gasto) }}
          </template>
          <template #cell(monto)="data">
            <strong class="text-primary">$ {{ (Number(data.item.monto) || 0).toFixed(2) }} {{ data.item.moneda }}</strong>
          </template>
          <template #cell(descripcion)="data">
            <span class="text-muted">{{ data.item.descripcion || '—' }}</span>
          </template>

          <template #foot(fecha_de_gasto)>
            <strong>Subtotal Reales:</strong>
          </template>
          <template #foot(nombre)>
            <span>&nbsp;</span>
          </template>
          <template #foot(descripcion)>
            <span>&nbsp;</span>
          </template>
          <template #foot(monto)>
            <strong class="text-primary">$ {{ totalRealesSum.toFixed(2) }} USD</strong>
          </template>
        </b-table>
        <p v-else class="text-center p-3 text-muted border rounded">No se registraron pagos de gastos fijos adicionales en este periodo.</p>

        <div class="mt-4 p-3 bg-light border rounded">
          <small class="text-muted d-block uppercase font-weight-bold mb-1">
            * NOTA DE AUDITORÍA (GASTOS FIJOS)
          </small>
          <span class="text-muted text-sm">
            Para evitar duplicidades en el cálculo del reporte de costos, el sistema totaliza el costo fijo del periodo tomando el valor <strong>máximo</strong> entre las plantillas mensuales prorrateadas ($ {{ totalTemplatesProrrateado.toFixed(2) }} USD) y los pagos reales registrados ($ {{ totalRealesSum.toFixed(2) }} USD).
          </span>
        </div>
      </div>

      <!-- SECCIÓN GENERAL GASTOS VARIABLES / ADICIONALES (Reales) -->
      <div v-else>
        <h4 class="text-secondary mb-3">Detalle de Egresos Reales Registrados</h4>
        <b-table
          v-if="realesFiltrados && realesFiltrados.length"
          striped
          hover
          :items="realesFiltrados"
          :fields="fieldsReales"
          responsive
          foot-clone
          class="shadow-sm border rounded"
        >
          <template #cell(fecha_de_gasto)="data">
            {{ formatDate(data.item.fecha_de_gasto) }}
          </template>
          <template #cell(monto)="data">
            <strong :class="`text-${variant}`">$ {{ (Number(data.item.monto) || 0).toFixed(2) }} {{ data.item.moneda }}</strong>
          </template>
          <template #cell(descripcion)="data">
            <span class="text-muted">{{ data.item.descripcion || '—' }}</span>
          </template>

          <template #foot(fecha_de_gasto)>
            <strong>Subtotal Egresos:</strong>
          </template>
          <template #foot(nombre)>
            <span>&nbsp;</span>
          </template>
          <template #foot(descripcion)>
            <span>&nbsp;</span>
          </template>
          <template #foot(monto)>
            <strong :class="`text-${variant}`">$ {{ totalRealesSum.toFixed(2) }} USD</strong>
          </template>
        </b-table>
        <p v-else class="text-center p-4 text-muted border rounded">No se encontraron pagos registrados para este tipo de gasto en el periodo solicitado.</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ReporteCostosProduccionGastos",
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    tipo: {
      type: String,
      required: true,
      validator: (val) => ["fijo", "variable", "adicional"].includes(val),
    },
    valor: {
      type: Number,
      required: true,
      default: 0,
    },
    totalProductosPeriodo: {
      type: Number,
      required: true,
      default: 0,
    },
    totalProductosOrden: {
      type: Number,
      required: true,
      default: 0,
    },
    totalGastosUSD: {
      type: Number,
      required: true,
      default: 0,
    },
    gastosPlantillasFijas: {
      type: Array,
      default: () => [],
    },
    gastosRealesDetalles: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      fieldsPlantillasFijas: [
        { key: "nombre", label: "Concepto Gasto Fijo", sortable: true },
        { key: "descripcion", label: "Descripción" },
        { key: "monto_mensual", label: "Monto Plantilla", sortable: true },
        { key: "periodicidad", label: "Periodicidad" },
        { key: "monto_prorrateado", label: "Prorrateado Periodo", sortable: true },
      ],
      fieldsReales: [
        { key: "fecha_de_gasto", label: "Fecha Pago", sortable: true },
        { key: "nombre", label: "Concepto / Nombre", sortable: true },
        { key: "descripcion", label: "Descripción / Comprobante" },
        { key: "monto", label: "Monto del Pago", sortable: true },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-gastos-operativos-${this.tipo}-${this.id_orden}`;
    },
    variant() {
      const map = {
        fijo: "primary",
        variable: "info",
        adicional: "secondary",
      };
      return map[this.tipo] || "primary";
    },
    iconComponent() {
      const map = {
        fijo: "b-icon-calendar2-check-fill",
        variable: "b-icon-lightning-charge-fill",
        adicional: "b-icon-plus-circle-fill",
      };
      return map[this.tipo] || "b-icon-calendar2-check-fill";
    },
    labelCapitalized() {
      const map = {
        fijo: "Fijo",
        variable: "Variable",
        adicional: "Adicional",
      };
      return map[this.tipo] || "";
    },
    modalTitle() {
      return `Detalle de Gastos ${this.labelCapitalized}s - Orden #${this.id_orden}`;
    },
    description() {
      const map = {
        fijo: "Los gastos fijos son costos operativos recurrentes e independientes de la actividad manufacturera (ej: alquiler, internet, sueldos fijos indirectos). Se prorrogan por día según la duración del periodo o se asocian de forma real.",
        variable: "Los gastos variables son costos corporativos que fluctúan directamente en base al volumen productivo global (ej: papelería, servicios medidos, comisiones de pasarelas). Se totalizan acumulando los pagos registrados.",
        adicional: "Los gastos adicionales representan egresos extraordinarios o imprevistos de caja ocurridos durante la operatividad del taller. Se calculan acumulando los registros de pago reales en las fechas de trabajo.",
      };
      return map[this.tipo] || "";
    },
    costoPorUnidad() {
      const units = Number(this.totalProductosPeriodo) || 0;
      if (units > 0) {
        return (Number(this.totalGastosUSD) || 0) / units;
      }
      return 0;
    },
    realesFiltrados() {
      return Array.isArray(this.gastosRealesDetalles) ? this.gastosRealesDetalles : [];
    },
    totalTemplatesProrrateado() {
      if (this.tipo !== "fijo") return 0;
      return this.gastosPlantillasFijas.reduce(
        (sum, item) => sum + (Number(item.monto_prorrateado) || 0),
        0
      );
    },
    totalRealesSum() {
      return this.realesFiltrados.reduce(
        (sum, item) => sum + (Number(item.monto) || 0),
        0
      );
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
