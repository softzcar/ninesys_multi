<template>
  <div>
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <b-button variant="info" @click="$bvModal.show(modal)" size="lg">
      Ver Detalles
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container fluid>
          <b-row>
            <b-col>
              <div class="floatme" style="width: 100%; margin-bottom: 20px">
                <span v-if="showbutton != 'false'">
                  <b-button @click="imprimirReporte" variant="primary">Imprimir</b-button>
                </span>
                <div class="mt-3 text-right">
                  <p class="mb-1">Monto Comisiones: <strong>$ {{ formatNumber(item.monto_comision || 0) }}</strong></p>
                  <p class="mb-1">Monto Salario: <strong>$ {{ formatNumber(item.monto_salario || 0) }}</strong></p>
                  <h5>Total a Pagar: <strong>$ {{ item.pago }}</strong></h5>
                </div>
                <div v-if="item.pago === '0.00'" class="alert alert-info mt-2">
                  <small>Este empleado ya recibió su salario correspondiente al período actual.</small>
                </div>
              </div>
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center">
            <b-col>
              <b-table responsive small striped :items="detallesAgrupados" :fields="fields">
                <template #cell(pago)="data">
                  $ {{ formatNumber(data.item.pago) }}
                </template>

                <template #cell(comision_tipo)="data">
                  <div>{{ data.item.salario_tipo }}</div>
                  <small v-if="data.item.comision_tipo" class="text-muted">
                    ({{ data.item.comision_tipo }})
                  </small>
                </template>

                <template #cell(comision)="data">
                  <span v-if="data.item.comision_tipo === 'porcentaje'">
                    {{ data.item.comision }}%
                  </span>
                  <span v-else>
                    $ {{ formatNumber(data.item.comision) }}
                  </span>
                </template>

                <template #cell(cantidad_productos)="data">
                  {{ data.item.cantidad_productos || 0 }}
                </template>

                <template #cell(id_orden)="data">
                  <div v-if="tipoEmpleado === 'Diseñador'">
                    <span class="font-weight-bold">#{{ data.item.orden || data.item.id_orden }}</span>
                    <br>
                    <b-button v-if="data.item.url_image" size="sm" variant="outline-primary" class="mt-1" @click="verImagen(data.item.url_image)">
                      <b-icon icon="image"></b-icon> Ver Imagen
                    </b-button>
                  </div>
                  <div v-else>
                    <linkSearch v-if="data.item.orden || data.item.id_orden" class="floatme"
                      :id="data.item.orden || data.item.id_orden" />
                    <span v-if="data.item.id_reposicion && data.item.id_reposicion > 0" class="badge badge-warning ml-2">
                      Reposición
                    </span>
                    <diseno-viewImage v-if="data.item.orden || data.item.id_orden" class="floatme"
                      :id="data.item.orden || data.item.id_orden" />
                    <span v-else class="text-muted small">Sin orden</span>
                  </div>
                </template>

                <template #cell(id_revision)="data">
                   {{ data.item.id_revision }}
                </template>
              </b-table>
              <div v-if="tipoEmpleado !== 'Diseñador'" class="text-right mb-3">
                 <h5>Total Productos: <strong>{{ totalProductosCalculado }}</strong></h5>
              </div>
            </b-col>
          </b-row>

        </b-container>
      </b-overlay>
    </b-modal>

    <!-- Modal para ver imagen de diseño -->
    <b-modal :id="modalImagenId" title="Imagen de Diseño" size="lg" hide-footer>
      <div class="text-center">
        <b-img :src="imagenSeleccionada" fluid alt="Diseño"></b-img>
      </div>
    </b-modal>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <ReportePagoVendedor :datos-reporte="datosParaElReporte" ref="reporteParaImprimir" />
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import ReportePagoVendedor from "~/components/reportes/ReportePagoVendedor.vue";
import PrintService from '@/utils/PrintService'

export default {
  mixins: [mixin],
  components: {
    ReportePagoVendedor,
  },
  props: {
    item: {},
    detalles: {},
    products: {},
    reload: {},
    showbutton: {},
    tipoEmpleado: {
      type: String,
      default: 'Vendedor'
    },
    bonos: {
      type: Array,
      default: () => []
    },
    descuentos: {
      type: Array,
      default: () => []
    },
    salario: {
      type: [Number, String],
      default: 0
    },
    comision: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      size: "xl",
      title: `${this.tipoEmpleado}: ${this.item.nombre}`,
      overlay: false,
      dataTable: [],
      modalImagenId: `modal-imagen-${Math.random().toString(36).substring(7)}`,
      imagenSeleccionada: ''
    };
  },

  methods: {

    imprimirReporte() {
      const printContent = this.$refs.reporteParaImprimir.$el.innerHTML;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const reportDate = `${day}-${month}-${year}`;
      const employeeName = this.item.nombre;
      const reportTitle = `Reporte de Pago - ${employeeName} - ${reportDate}`;

      PrintService.imprimir(reportTitle, printContent);
    },

    verImagen(url) {
      if (!url) return;
      this.imagenSeleccionada = url;
      this.$bvModal.show(this.modalImagenId);
    },

    reloadMe() {
      this.$emit("reload");
    },

    filterProd(id_woo, campo) {
      // let myProd = this.products.filter((el) => el.cod === parseInt(id_woo));
      // return myProd[0][campo];
      return '';
    },
  },

  computed: {
    fields() {
      const baseFields = [
        {
          key: "id_orden",
          label: "Orden",
          thClass: "text-center",
          tdClass: "text-center",
        },
        {
          key: "comision_tipo",
          label: "Tipo Pago",
        },
        {
          key: "comision",
          label: "Comisión",
        },
        {
          key: "pago",
          label: "Monto Pagado",
          thClass: "text-right",
          tdClass: "text-right",
        },
      ];

      // Configuración específica para Diseñadores
      if (this.tipoEmpleado === 'Diseñador') {
        baseFields.splice(1, 0, {
          key: "id_revision",
          label: "ID Revisión",
          thClass: "text-center",
          tdClass: "text-center",
        });
      } else {
        baseFields.push({
          key: "cantidad_productos",
          label: "Cant. Productos",
          thClass: "text-center",
          tdClass: "text-center",
        });
      }

      return baseFields;
    },
    datosParaElReporte() {
      return {
        nombreEmpleado: this.item.nombre,
        totalPagar: this.totalFinalCalculado, // Usar el calculado para el reporte
        detalles: this.detallesAgrupados,
        bonos: this.bonos || [],
        descuentos: this.descuentos || [],
        salarioBase: this.salario || 0,
        comision: this.comision || 0,
        fechaPago: this.fechaPagoReporte
      };
    },
    detallesAgrupados() {
      if (!this.detalles || !Array.isArray(this.detalles)) return [];

      const agrupados = {};
      const sinOrden = [];

      const processedItems = new Set(); // Para evitar sumar duplicados (mismo id_orden o id_reposicion)

      this.detalles.forEach(detalle => {
        // Si no tiene orden, lo dejamos tal cual (ej. bonos, ajustes sin orden)
        const orderId = detalle.id_orden || detalle.orden;

        if (!orderId) {
          sinOrden.push({ ...detalle }); // Clonar para evitar side effects
          return;
        }

        let key = orderId;
        let uniqueItemId = orderId; // Identificador único para la 'cantidad de productos'

        // Si es reposición, crear una clave única para agrupar TODAS las reposiciones de esa orden
        if (detalle.id_reposicion && detalle.id_reposicion > 0) {
          key = `${orderId}_repos`;
          uniqueItemId = `repo_${detalle.id_reposicion}`;
        } else {
           // Normal Order: uniqueItemId is just orderId
           uniqueItemId = `orden_${orderId}`;
        }

        // Para diseñadores, NO agrupamos por orden si hay diferentes revisiones
        // Cada revisión es un pago distinto. Usar id_revision como parte de la clave si existe.
        if (this.tipoEmpleado === 'Diseñador' && detalle.id_revision) {
           key = `${orderId}_rev_${detalle.id_revision}`;
           uniqueItemId = `rev_${detalle.id_revision}`;
        }

        if (!agrupados[key]) {
          agrupados[key] = { ...detalle };
          agrupados[key].pago = parseFloat(detalle.pago) || 0;
          // Fallback para histórico (usa 'cantidad' en vez de 'cantidad_productos')
          const cant = parseInt(detalle.cantidad_productos) || parseInt(detalle.cantidad) || 0;
          agrupados[key].cantidad_productos = cant;
          
          // Aseguramos que id_orden esté presente para el template si faltaba
          agrupados[key].id_orden = orderId;
          
          processedItems.add(`${key}|${uniqueItemId}`);

        } else {
          agrupados[key].pago += parseFloat(detalle.pago) || 0;
          
          // Solo sumar la cantidad si NO hemos procesado este ítem (reposición o orden) para este grupo
          if (!processedItems.has(`${key}|${uniqueItemId}`)) {
             const cant = parseInt(detalle.cantidad_productos) || parseInt(detalle.cantidad) || 0;
             agrupados[key].cantidad_productos = (parseInt(agrupados[key].cantidad_productos) || 0) + cant;
             processedItems.add(`${key}|${uniqueItemId}`);
          }
           // Nota: Si es la misma orden normal repetida (mismo uniqueItemId), NO sumamos, lo cual es correcto (mostramos el total de la orden una sola vez)
           // Si son reposiciones distintas (repo_8, repo_9), SÍ sumamos.
        }
      });

      // Convertir de vuelta a array y formatear el pago a string para consistencia de visualización si es necesario
      // O mantenerlo numérico, pero el template usa formatNumber.
      // formatNumber espera string o numero, el sumatorio es numero.

      const listaAgrupada = Object.values(agrupados).map(item => {
        return {
          ...item,
          pago: item.pago.toFixed(2) // Convertir a string con 2 decimales para consistencia
        };
      });

      return [...listaAgrupada, ...sinOrden];
    },

    totalProductosCalculado() {
      return this.detallesAgrupados.reduce((acc, item) => {
        return acc + (parseInt(item.cantidad_productos) || 0);
      }, 0);
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    totalFinalCalculado() {
      // Si nos pasan un total ya calculado (implícitamente vía props si quisiéramos), podríamos usarlo.
      // Pero mejor recalculamos o usamos item.pago si no hay props extras.

      if (this.salario !== undefined) {
        // Estamos en contexto de ConfirmacionModal con datos frescos
        const s = parseFloat(this.salario) || 0;
        const c = parseFloat(this.comision) || 0;
        const b = (this.bonos || []).reduce((acc, el) => acc + parseFloat(el.monto || 0), 0);
        const d = (this.descuentos || []).reduce((acc, el) => acc + parseFloat(el.monto || 0), 0);
        return (s + c + b - d).toFixed(2);
      }

      return this.item.pago;
    },

    fechaPagoReporte() {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    }
  },
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
