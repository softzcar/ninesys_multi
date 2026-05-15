<template>
  <div>
    <b-link @click="showModal">
      $ {{ Number(costoManoObra || 0).toFixed(2) }}
    </b-link>

    <b-modal
      :id="modalId"
      :title="`Detalle de Costos de Mano de Obra - Orden #${id_orden}`"
      hide-footer
      size="xl"
    >
      <b-overlay :show="isLoading" rounded="sm">
        <div v-if="!isLoading">
          <h4 class="mt-2">Comisiones</h4>
          <b-table
            v-if="manoDeObraData.length"
            striped
            hover
            :items="manoDeObraData"
            :fields="fieldsManoObra"
            responsive
            foot-clone
          >
            <template #cell(comision_pura)="data">
              $ {{ (data.item.comision_pura || 0).toFixed(2) }}
            </template>
            <template #cell(total_bonos)="data">
              <span class="text-success">+ $ {{ (data.item.total_bonos || 0).toFixed(2) }}</span>
            </template>
            <template #cell(total_descuentos)="data">
              <span class="text-danger">- $ {{ (data.item.total_descuentos || 0).toFixed(2) }}</span>
            </template>
            <template #cell(subtotal_variable)="data">
              <strong>$ {{ (data.item.monto_pago - data.item.total_salario_pagado || 0).toFixed(2) }}</strong>
            </template>

            <!-- Footer para Comisiones -->
            <template #foot(nombre_empleado)>
              <strong>Subtotal:</strong>
            </template>
            <template #foot(departamento)>
              <span>&nbsp;</span>
            </template>
            <template #foot(cantidad)>
              <span>&nbsp;</span>
            </template>
            <template #foot(comision_pura)>
              <strong>$ {{ sumaComisiones.toFixed(2) }}</strong>
            </template>
            <template #foot(total_bonos)>
              <strong>$ {{ sumaBonos.toFixed(2) }}</strong>
            </template>
            <template #foot(total_descuentos)>
              <strong>$ {{ sumaDescuentos.toFixed(2) }}</strong>
            </template>
            <template #foot(subtotal_variable)>
              <strong class="text-primary">$ {{ totalVariable.toFixed(2) }}</strong>
            </template>
          </b-table>
          <p v-else>No se encontraron comisiones para esta orden.</p>

          <h4 class="mt-4">Salarios</h4>
          <b-table
            v-if="detallesSalarios.length"
            striped
            hover
            :items="detallesSalarios"
            :fields="fieldsSalarios"
            responsive
            foot-clone
          >
            <template #cell(horas_trabajadas)="data">
              {{ data.item.horas_trabajadas.toFixed(2) }} h
            </template>
            <template #cell(costo_por_hora)="data">
              $ {{ data.item.costo_por_hora.toFixed(4) }}
            </template>
            <template #cell(salario_proporcional)="data">
              <strong>$ {{ data.item.salario_proporcional.toFixed(2) }}</strong>
            </template>

            <template #foot(nombre_empleado)>
              <strong>Subtotal:</strong>
            </template>
            <template #foot(horas_trabajadas)>
              <span>&nbsp;</span>
            </template>
            <template #foot(costo_por_hora)>
              <span>&nbsp;</span>
            </template>
            <template #foot(salario_proporcional)>
              <strong class="text-primary">$ {{ totalSalarios.toFixed(2) }}</strong>
            </template>
          </b-table>
          <p v-else>No se encontraron salarios proporcionales para esta orden.</p>

          <div class="mt-4 p-3 bg-light border rounded">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">TOTAL MANO DE OBRA (API)</h3>
              <h3 class="mb-0 text-primary">$ {{ Number(costoManoObra || 0).toFixed(2) }}</h3>
            </div>
            <hr />
            <div v-if="Math.abs(totalGeneral - costoManoObra) > 0.01" class="text-muted small">
              <p>Suma del desglose: $ {{ totalGeneral.toFixed(2) }}</p>
              <p>Diferencia de ajuste: $ {{ (costoManoObra - totalGeneral).toFixed(2) }}</p>
            </div>
            <small class="text-muted">
              * Este monto es el valor oficial retornado por la API para esta orden.
            </small>
          </div>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixintime from "~/mixins/mixin-time.js";

export default {
  name: "ReporteCostosProduccionLabor",
  mixins: [mixintime],
  props: {
    id_orden: {
      type: [Number, String],
      required: true,
    },
    costoManoObra: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      isLoading: false,
      manoDeObraData: [],
      detallesSalarios: [],
      fieldsManoObra: [
        { key: "nombre_empleado", label: "Empleado", sortable: true },
        { key: "departamento", label: "Depto.", sortable: true },
        { key: "cantidad", label: "Cant.", sortable: true },
        { key: "comision_pura", label: "Comisión", sortable: true },
        { key: "total_bonos", label: "Bonos", sortable: true },
        { key: "total_descuentos", label: "Desc.", sortable: true },
        { key: "subtotal_variable", label: "Subtotal", sortable: true },
      ],
      fieldsSalarios: [
        { key: "nombre_empleado", label: "Empleado" },
        { key: "horas_trabajadas", label: "Horas", class: "text-right" },
        { key: "costo_por_hora", label: "Costo/Hora", class: "text-right" },
        { key: "salario_proporcional", label: "Salario Proporcional", class: "text-right" },
      ],
    };
  },
  computed: {
    modalId() {
      return `modal-mano-obra-salarios-${this.id_orden}`;
    },
    totalSalarios() {
      return this.detallesSalarios.reduce((sum, item) => sum + (Number(item.salario_proporcional) || 0), 0);
    },
    sumaComisiones() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.comision_pura || 0), 0);
    },
    sumaBonos() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.total_bonos || 0), 0);
    },
    sumaDescuentos() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.total_descuentos || 0), 0);
    },
    totalVariable() {
      return this.manoDeObraData.reduce((sum, item) => sum + (item.subtotal_variable || 0), 0);
    },
    totalGeneral() {
      return this.totalVariable + this.totalSalarios;
    },
  },
  methods: {
    async getManoDeObra() {
      try {
        const url = `${this.$config.API}/reportes/mano-obra-por-orden/${this.id_orden}`;
        const { data } = await this.$axios.get(url);

        const pagos = Array.isArray(data.pagos) ? data.pagos : (Array.isArray(data) ? data : []);
        this.manoDeObraData = pagos.map(item => {
          const bonos = Number(item.total_bonos || 0);
          const descuentos = Number(item.total_descuentos || 0);
          const salarioPagado = Number(item.total_salario_pagado || 0);
          const montoPago = Number(item.monto_pago || 0);
          const comisionPura = montoPago - bonos + descuentos - salarioPagado;
          return {
            ...item,
            total_bonos: bonos,
            total_descuentos: descuentos,
            total_salario_pagado: salarioPagado,
            monto_pago: montoPago,
            comision_pura: comisionPura,
            subtotal_variable: comisionPura + bonos - descuentos,
          };
        });

        this.detallesSalarios = Array.isArray(data.salarios) ? data.salarios : [];
      } catch (error) {
        this.manoDeObraData = [];
        this.detallesSalarios = [];
      }
    },
    async showModal() {
      this.$bvModal.show(this.modalId);
      this.isLoading = true;
      try {
        await this.getManoDeObra();
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    this.getManoDeObra();
  },
};
</script>
