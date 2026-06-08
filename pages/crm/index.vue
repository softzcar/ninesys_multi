<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Comercialización'
                ">
        <b-overlay :show="loading" spinner-small>
          <b-container fluid class="crm-board-container py-3">
            
            <!-- Encabezado y Acción -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 class="h3 mb-1 text-dark">Embudo de Ventas</h1>
                <p class="text-muted small mb-0">Gestiona tus prospectos, negocios y mide la conversión en tiempo real.</p>
              </div>
              <div class="d-flex">
                <b-button
                  to="/crm/campanas"
                  variant="outline-primary"
                  size="sm"
                  class="mr-2"
                >
                  <b-icon icon="telegram" class="mr-1"></b-icon> Campañas de WhatsApp
                </b-button>
                <b-button
                  variant="primary"
                  size="sm"
                  @click="openNewOpportunityModal"
                >
                  <b-icon icon="plus-circle" class="mr-1"></b-icon> Nueva Oportunidad
                </b-button>
              </div>
            </div>

            <!-- Dashboard de Resumen Rápido -->
            <b-row class="mb-4">
              <b-col md="3" class="mb-2">
                <b-card bg-variant="light" class="text-center shadow-sm border-0 py-1">
                  <h6 class="text-muted mb-1 small text-uppercase">Leads Activos</h6>
                  <h4 class="mb-0 text-primary font-weight-bold">{{ activeLeadsCount }}</h4>
                </b-card>
              </b-col>
              <b-col md="3" class="mb-2">
                <b-card bg-variant="light" class="text-center shadow-sm border-0 py-1">
                  <h6 class="text-muted mb-1 small text-uppercase">Valor Proyectado</h6>
                  <h4 class="mb-0 text-info font-weight-bold">${{ activeLeadsValue.toFixed(2) }}</h4>
                </b-card>
              </b-col>
              <b-col md="3" class="mb-2">
                <b-card bg-variant="light" class="text-center shadow-sm border-0 py-1">
                  <h6 class="text-muted mb-1 small text-uppercase">Tasa de Conversión</h6>
                  <h4 class="mb-0 text-success font-weight-bold">{{ conversionRate }}%</h4>
                </b-card>
              </b-col>
              <b-col md="3" class="mb-2">
                <b-card bg-variant="light" class="text-center shadow-sm border-0 py-1">
                  <h6 class="text-muted mb-1 small text-uppercase">Campañas Ejecutadas</h6>
                  <h4 class="mb-0 text-secondary font-weight-bold">{{ campaignsCount }}</h4>
                </b-card>
              </b-col>
            </b-row>

            <!-- Columnas del Kanban -->
            <div class="kanban-board-scroll">
              <div class="kanban-wrapper">
                <div
                  v-for="col in columnsList"
                  :key="col.key"
                  class="kanban-column-card"
                >
                  <!-- Cabecera de Columna -->
                  <div class="column-header mb-3" :class="col.colorClass">
                    <div class="d-flex justify-content-between align-items-center">
                      <h5 class="h6 mb-0 font-weight-bold">
                        <b-icon :icon="col.icon" class="mr-1"></b-icon> {{ col.title }}
                      </h5>
                      <b-badge pill :variant="col.badgeColor">
                        {{ columns[col.key].length }}
                      </b-badge>
                    </div>
                    <div class="small text-muted mt-1">
                      Total: ${{ getColumnTotal(col.key) }}
                    </div>
                  </div>

                  <!-- Lista Draggable de Oportunidades -->
                  <draggable
                    v-model="columns[col.key]"
                    group="opportunities"
                    class="kanban-draggable-area"
                    ghost-class="ghost-card"
                    @change="onDragChange($event, col.key)"
                  >
                    <div
                      v-for="op in columns[col.key]"
                      :key="op._id"
                      class="opportunity-card p-3 mb-2 shadow-sm rounded bg-white border"
                    >
                      <!-- Título -->
                      <div class="font-weight-bold mb-1 card-title-text">{{ op.titulo }}</div>
                      
                      <!-- Cliente y Acción de Ficha -->
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="small text-muted text-truncate mr-2">
                          <b-icon icon="person" class="mr-1"></b-icon> {{ op.cliente_nombre }}
                        </span>
                        <b-button
                          variant="link"
                          size="sm"
                          class="p-0 text-info small-button-detail"
                          @click="openClientCRM(op)"
                        >
                          Ver Ficha
                        </b-button>
                      </div>

                      <!-- Monto y Vendedores -->
                      <div class="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                        <span class="font-weight-bold text-dark font-size-amount">
                          ${{ parseFloat(op.monto_estimado).toFixed(2) }}
                        </span>
                        
                        <!-- Iniciales de Vendedores -->
                        <div class="sellers-badges d-flex">
                          <span
                            v-for="v in op.vendedores"
                            :key="v.id_vendedor"
                            class="seller-badge-circle small"
                            v-b-tooltip.hover
                            :title="v.nombre"
                          >
                            {{ getInitials(v.nombre) }}
                          </span>
                          <span v-if="op.vendedores.length === 0" class="small text-muted text-italic font-size-vendedor">
                            Sin asignar
                          </span>
                        </div>
                      </div>

                      <!-- Detalle Pérdida (Si aplica) -->
                      <div v-if="col.key === 'cliente_perdido' && op.motivo_perdida" class="mt-2 p-1 bg-light rounded text-danger small text-italic">
                        Pérdida: {{ op.motivo_perdida }}
                      </div>
                    </div>
                  </draggable>
                </div>
              </div>
            </div>

          </b-container>
        </b-overlay>
      </div>
    </div>

    <!-- Modal: Nueva Oportunidad -->
    <b-modal
      id="new-opportunity-modal"
      title="Registrar Oportunidad"
      @ok="handleNewOpportunitySubmit"
      ok-title="Registrar"
      cancel-title="Cancelar"
      lazy
    >
      <b-form @submit.prevent>
        <!-- Selección de Cliente -->
        <b-form-group label="Cliente *" label-for="op-customer">
          <b-form-select
            id="op-customer"
            v-model="newOp.id_customer"
            required
          >
            <option :value="null">-- Seleccionar Cliente --</option>
            <option
              v-for="c in customersList"
              :key="c._id"
              :value="c._id"
            >
              {{ c.first_name }} {{ c.last_name }} (Cédula: {{ c.cedula || 'N/A' }})
            </option>
          </b-form-select>
        </b-form-group>

        <!-- Título -->
        <b-form-group label="Nombre del Trato / Negocio *" label-for="op-title">
          <b-form-input
            id="op-title"
            v-model="newOp.titulo"
            placeholder="Ej: Pedido 50 Uniformes Futbol"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Descripción -->
        <b-form-group label="Descripción / Requerimientos" label-for="op-desc">
          <b-form-textarea
            id="op-desc"
            v-model="newOp.descripcion"
            placeholder="Comentarios iniciales, productos de interés..."
            rows="2"
          ></b-form-textarea>
        </b-form-group>

        <!-- Monto Estimado -->
        <b-form-group label="Monto Estimado ($) *" label-for="op-amount">
          <b-form-input
            id="op-amount"
            v-model="newOp.monto_estimado"
            type="number"
            step="0.01"
            required
          ></b-form-input>
        </b-form-group>

        <!-- Asignación de Vendedores -->
        <b-form-group label="Asignar Vendedores (Pueden ser varios)">
          <div class="border rounded p-2 bg-light select-sellers-box">
            <b-form-checkbox
              v-for="emp in employeesList"
              :key="emp._id"
              v-model="newOp.vendedores"
              :value="emp._id"
              class="mb-1"
            >
              {{ emp.username }}
            </b-form-checkbox>
          </div>
        </b-form-group>

        <!-- Campaña origen (Opcional) -->
        <b-form-group label="Campaña Origen (Opcional)" label-for="op-campaign">
          <b-form-select
            id="op-campaign"
            v-model="newOp.id_campana"
          >
            <option :value="null">Ninguna campaña</option>
            <option
              v-for="camp in campaignsList"
              :key="camp.id_campana"
              :value="camp.id_campana"
            >
              {{ camp.nombre }} ({{ formatDate(camp.fecha) }})
            </option>
          </b-form-select>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Modal: Motivo de Pérdida -->
    <b-modal
      id="lost-reason-modal"
      title="Registrar Motivo de Pérdida"
      @ok="submitLostReason"
      @cancel="cancelLostMove"
      ok-title="Confirmar Pérdida"
      cancel-title="Cancelar"
      no-close-on-backdrop
      no-close-on-esc
      lazy
    >
      <b-form-group label="Especifica el motivo por el cual se perdió el cliente/trato:" label-for="lost-reason">
        <b-form-textarea
          id="lost-reason"
          v-model="lostReasonText"
          placeholder="Ej: Precio muy elevado, el cliente prefirió la competencia..."
          rows="3"
          required
        ></b-form-textarea>
      </b-form-group>
    </b-modal>

    <!-- Cajón de Ficha CRM del Cliente -->
    <crm-ClientDetailDrawer
      :client="selectedClient"
      :show="showClientDetail"
      @close="showClientDetail = false"
    />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import axios from "axios";
import { mapState } from "vuex";

export default {
  components: {
    draggable,
  },
  data() {
    return {
      loading: false,
      columns: {
        nuevo_lead: [],
        en_negociacion: [],
        propuesta_enviada: [],
        cliente_ganado: [],
        cliente_perdido: [],
      },
      columnsList: [
        { key: "nuevo_lead", title: "Nuevo Lead", icon: "person-plus", colorClass: "border-primary-top", badgeColor: "primary" },
        { key: "en_negociacion", title: "En Negociación", icon: "chat-quote", colorClass: "border-warning-top", badgeColor: "warning" },
        { key: "propuesta_enviada", title: "Propuesta Enviada", icon: "file-earmark-text", colorClass: "border-info-top", badgeColor: "info" },
        { key: "cliente_ganado", title: "Cliente Ganado", icon: "check-circle", colorClass: "border-success-top", badgeColor: "success" },
        { key: "cliente_perdido", title: "Cliente Perdido", icon: "x-circle", colorClass: "border-danger-top", badgeColor: "danger" },
      ],
      customersList: [],
      employeesList: [],
      campaignsList: [],
      dashboardStats: {
        conversion: { ganados: 0, perdidos: 0, tasa_conversion: 0 },
        campanas_efectividad: []
      },

      // Formulario de nueva Oportunidad
      newOp: {
        id_customer: null,
        titulo: "",
        descripcion: "",
        monto_estimado: 0.00,
        vendedores: [],
        id_campana: null,
      },

      // Control de arrastre perdido
      draggedOp: null,
      lostReasonText: "",
      originalColKey: "",

      // Control del cajón de clientes
      selectedClient: null,
      showClientDetail: false,
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),

    activeLeadsCount() {
      return this.columns.nuevo_lead.length + this.columns.en_negociacion.length + this.columns.propuesta_enviada.length;
    },
    activeLeadsValue() {
      const sum = col => this.columns[col].reduce((acc, op) => acc + parseFloat(op.monto_estimado || 0), 0);
      return sum("nuevo_lead") + sum("en_negociacion") + sum("propuesta_enviada");
    },
    conversionRate() {
      return this.dashboardStats.conversion?.tasa_conversion || 0;
    },
    campaignsCount() {
      return this.dashboardStats.campanas_efectividad?.length || 0;
    }
  },
  methods: {
    fetchBoardData() {
      this.loading = true;
      this.$axios.get(`${this.$config.API}/crm/oportunidades`)
        .then(res => {
          // Limpiar columnas
          this.columns.nuevo_lead = [];
          this.columns.en_negociacion = [];
          this.columns.propuesta_enviada = [];
          this.columns.cliente_ganado = [];
          this.columns.cliente_perdido = [];

          // Agrupar oportunidades
          res.data.forEach(op => {
            const estado = op.estado;
            if (this.columns[estado]) {
              this.columns[estado].push(op);
            } else {
              this.columns.nuevo_lead.push(op);
            }
          });
        })
        .catch(err => console.error("Error cargando embudo:", err))
        .finally(() => { this.loading = false; });

      // Cargar métricas adicionales para el dashboard de arriba
      this.$axios.get(`${this.$config.API}/crm/reports/dashboard`)
        .then(res => {
          this.dashboardStats = res.data;
          this.campaignsList = res.data.campanas_efectividad || [];
        })
        .catch(err => console.error("Error cargando dashboard CRM:", err));
    },
    fetchAuxiliaryData() {
      // Cargar lista de clientes
      this.$axios.get(`${this.$config.API}/customers`)
        .then(res => {
          this.customersList = res.data.data || [];
        })
        .catch(err => console.error("Error cargando clientes:", err));

      // Cargar lista de empleados para la asignación
      this.$axios.get(`${this.$config.API}/empleados`)
        .then(res => {
          this.employeesList = res.data || [];
        })
        .catch(err => console.error("Error cargando empleados:", err));
    },
    getColumnTotal(colKey) {
      const total = this.columns[colKey].reduce((sum, op) => sum + parseFloat(op.monto_estimado || 0), 0);
      return total.toFixed(2);
    },
    getInitials(name) {
      if (!name) return "?";
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    },
    openNewOpportunityModal() {
      this.newOp = {
        id_customer: null,
        titulo: "",
        descripcion: "",
        monto_estimado: 0.00,
        vendedores: [],
        id_campana: null,
      };
      this.$bvModal.show("new-opportunity-modal");
    },
    handleNewOpportunitySubmit(bvEvent) {
      if (!this.newOp.id_customer || !this.newOp.titulo || this.newOp.monto_estimado <= 0) {
        bvEvent.preventDefault(); // Detener el modal
        this.$fire({
          title: "Campos Faltantes",
          text: "Por favor, completa los campos requeridos (*).",
          type: "warning",
        });
        return;
      }

      this.loading = true;
      this.$axios.post(`${this.$config.API}/crm/oportunidades/nueva`, this.newOp)
        .then(() => {
          this.fetchBoardData();
          this.$fire({
            title: "Oportunidad Creada",
            text: "El trato se ha agregado exitosamente al embudo.",
            type: "success",
          });
        })
        .catch(err => {
          console.error("Error creando oportunidad:", err);
          this.$fire({
            title: "Error",
            text: "No se pudo registrar la oportunidad.",
            type: "error",
          });
        })
        .finally(() => { this.loading = false; });
    },
    onDragChange(evt, colKey) {
      // Evaluamos el evento de agregado (cuando una tarjeta cae en esta columna)
      if (evt.added) {
        const op = evt.added.element;
        
        // Si cae en cliente_perdido, abrimos modal para registrar el motivo
        if (colKey === "cliente_perdido") {
          this.draggedOp = op;
          this.lostReasonText = "";
          this.originalColKey = this.findOriginalColumn(op._id, colKey);
          this.$bvModal.show("lost-reason-modal");
          return;
        }

        // Si cae en cliente_ganado, mostrar alerta y actualizar
        if (colKey === "cliente_ganado") {
          this.$fire({
            title: "¡Trato Ganado! 🎉",
            text: "¿Deseas crear una nueva cotización o pedido para este cliente?",
            type: "success",
          });
        }

        this.updateOpportunityState(op._id, colKey, null);
      }
    },
    findOriginalColumn(opId, currentColKey) {
      // Como VueDraggable muta las listas reactivas al arrastrar, podemos buscar en qué columna estaba antes
      // En este flujo simple, podemos guardar la columna anterior si la tuviéramos, o asumir "nuevo_lead" como fallback
      return "nuevo_lead";
    },
    updateOpportunityState(opId, estado, motivoPerdida) {
      this.loading = true;
      const payload = {
        id_oportunidad: opId,
        estado: estado,
        motivo_perdida: motivoPerdida,
      };

      this.$axios.put(`${this.$config.API}/crm/oportunidades/estado`, payload)
        .then(() => {
          this.fetchBoardData();
        })
        .catch(err => {
          console.error("Error actualizando estado:", err);
          this.fetchBoardData(); // Recargar para restaurar estado visual si falló
        })
        .finally(() => { this.loading = false; });
    },
    submitLostReason() {
      if (!this.lostReasonText.trim()) {
        this.$fire({
          title: "Motivo Requerido",
          text: "Por favor escribe un motivo de pérdida.",
          type: "warning"
        });
        return;
      }
      this.updateOpportunityState(this.draggedOp._id, "cliente_perdido", this.lostReasonText);
    },
    cancelLostMove() {
      // Si cancela, volvemos a cargar el tablero para retornar la tarjeta a su columna anterior
      this.fetchBoardData();
    },
    openClientCRM(op) {
      // Construir un objeto cliente con el formato que espera el drawer
      this.selectedClient = {
        _id: op.id_customer,
        first_name: op.cliente_nombre.split(" ")[0] || op.cliente_nombre,
        last_name: op.cliente_nombre.split(" ").slice(1).join(" ") || "",
        phone: op.cliente_telefono,
        email: op.cliente_email,
      };
      this.showClientDetail = true;
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      try {
        return new Date(dateStr).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
      } catch (e) {
        return dateStr;
      }
    }
  },
  mounted() {
    this.fetchBoardData();
    this.fetchAuxiliaryData();
  },
};
</script>

<style scoped>
.crm-board-container {
  min-height: calc(100vh - 120px);
}
.kanban-board-scroll {
  overflow-x: auto;
  padding-bottom: 15px;
}
.kanban-wrapper {
  display: flex;
  gap: 15px;
  min-width: 1200px;
}
.kanban-column-card {
  flex: 1;
  background-color: #f7f9fa;
  border-radius: 6px;
  padding: 10px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}
.column-header {
  border-top-width: 4px !important;
  border-top-style: solid !important;
  padding-top: 8px;
}
.border-primary-top { border-top-color: #007bff !important; }
.border-warning-top { border-top-color: #ffc107 !important; }
.border-info-top { border-top-color: #17a2b8 !important; }
.border-success-top { border-top-color: #28a745 !important; }
.border-danger-top { border-top-color: #dc3545 !important; }

.kanban-draggable-area {
  flex-grow: 1;
  min-height: 400px;
}
.opportunity-card {
  cursor: grab;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.opportunity-card:hover {
  transform: translateY(-2px);
  border-color: #17a2b8 !important;
}
.ghost-card {
  opacity: 0.5;
  background-color: #e2e6ea !important;
  border: 2px dashed #007bff !important;
}
.seller-badge-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 1px solid #ced4da;
  margin-left: -6px;
  z-index: 1;
}
.seller-badge-circle:first-child {
  margin-left: 0;
}
.select-sellers-box {
  max-height: 150px;
  overflow-y: auto;
}
.card-title-text {
  font-size: 0.95rem;
}
.small-button-detail {
  font-size: 0.8rem;
}
.font-size-amount {
  font-size: 0.9rem;
}
.font-size-vendedor {
  font-size: 0.75rem;
}
</style>
