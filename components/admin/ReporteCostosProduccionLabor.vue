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
          <!-- Panel de Fórmula de Mano de Obra -->
          <b-row class="mb-4">
            <b-col md="12">
              <b-card bg-variant="light" border-variant="info" class="shadow-sm">
                <h5 class="text-info mb-3">
                  <b-icon-people-fill class="mr-2"></b-icon-people-fill>
                  Estructura de Costos de Mano de Obra
                </h5>
                <p class="text-muted mb-3">
                  El costo de mano de obra de una orden representa la sumatoria total de las comisiones variables pagadas por la ejecución física de las tareas (Corte, Estampado, Costura, etc.) y la porción proporcional de los salarios fijos mensuales de los operarios directos y del personal de soporte prorrateado del periodo.
                </p>
                <b-row class="align-items-center">
                  <b-col md="4" class="border-right">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span>Comisiones de Fabricación:</span>
                      <b-badge variant="info" pill class="px-3 py-2 font-weight-bold">
                        $ {{ totalVariable.toFixed(2) }}
                      </b-badge>
                    </div>
                    <small class="text-muted d-block text-right">
                      Compensación por tareas físicas
                    </small>
                  </b-col>
                  <b-col md="4" class="border-right">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span>Salarios Asignados:</span>
                      <b-badge variant="secondary" pill class="px-3 py-2 font-weight-bold">
                        $ {{ totalSalarios.toFixed(2) }}
                      </b-badge>
                    </div>
                    <small class="text-muted d-block text-right">
                      Sueldos directos y prorrateados
                    </small>
                  </b-col>
                  <b-col md="4" class="text-center">
                    <div class="p-3 bg-white border rounded">
                      <small class="text-muted d-block uppercase font-weight-bold mb-1">
                        CÁLCULO TOTAL DE MANO DE OBRA
                      </small>
                      <code class="d-block font-weight-bold text-dark mb-1" style="font-size: 1.1rem;">
                        $ {{ totalVariable.toFixed(2) }} + $ {{ totalSalarios.toFixed(2) }}
                      </code>
                      <strong class="text-info" style="font-size: 1.3rem;">
                        = $ {{ totalGeneral.toFixed(2) }}
                      </strong>
                    </div>
                  </b-col>
                </b-row>
              </b-card>
            </b-col>
          </b-row>

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
              <strong>$ {{ (data.item.monto_pago || 0).toFixed(2) }}</strong>
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
              <span v-if="data.item.horas_trabajadas !== null && data.item.horas_trabajadas !== undefined">
                {{ data.item.horas_trabajadas.toFixed(2) }} h
              </span>
              <span v-else class="text-muted">—</span>
            </template>
            <template #cell(costo_por_hora)="data">
              <span v-if="data.item.costo_por_hora !== null && data.item.costo_por_hora !== undefined">
                $ {{ data.item.costo_por_hora.toFixed(4) }}
              </span>
              <span v-else class="text-muted">—</span>
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
    inicio: {
      type: String,
      required: false,
      default: "",
    },
    fin: {
      type: String,
      required: false,
      default: "",
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
        let url = `${this.$config.API}/reportes/mano-obra-por-orden/${this.id_orden}`;
        if (this.inicio && this.fin) {
          url += `?inicio=${this.inicio}&fin=${this.fin}`;
        }
        const { data } = await this.$axios.get(url);

        const pagos = Array.isArray(data.pagos) ? data.pagos : (Array.isArray(data) ? data : []);
        this.manoDeObraData = pagos.map(item => {
          const comisionPura = Number(item.monto_pago || 0);
          return {
            ...item,
            total_bonos: 0,
            total_descuentos: 0,
            total_salario_pagado: Number(item.total_salario_pagado || 0),
            monto_pago: comisionPura,
            comision_pura: comisionPura,
            subtotal_variable: comisionPura,
          };
        });

        const salarios = Array.isArray(data.salarios) ? [...data.salarios] : [];
        const idsConSalario = new Set(salarios.map(s => Number(s.id_empleado)));

        this.manoDeObraData.forEach(p => {
          const idEmp = Number(p.id_empleado);
          const salarioPagado = Number(p.total_salario_pagado || 0);
          
          if (salarioPagado > 0 && !idsConSalario.has(idEmp)) {
            const existingIndex = salarios.findIndex(s => Number(s.id_empleado) === idEmp);
            if (existingIndex > -1) {
              salarios[existingIndex].salario_proporcional += salarioPagado;
            } else {
              salarios.push({
                id_empleado: idEmp,
                nombre_empleado: p.nombre_empleado,
                horas_trabajadas: null,
                costo_por_hora: null,
                salario_proporcional: salarioPagado
              });
            }
          }
        });

        this.detallesSalarios = salarios;
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
