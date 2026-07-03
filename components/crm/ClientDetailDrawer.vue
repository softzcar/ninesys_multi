<template>
  <b-sidebar
    id="client-detail-sidebar"
    v-model="visible"
    title="Detalles del Cliente"
    right
    shadow
    backdrop
    width="50%"
    lazy
    @change="handleVisibilityChange"
  >
    <div class="px-3 py-2" v-if="client">
      <!-- Info General -->
      <b-card class="mb-3 border-info">
        <h4 class="text-info mb-1">
          {{ client.first_name }} {{ client.last_name }}
        </h4>
        <p class="text-muted mb-2" v-if="client.cedula">
          <b-icon icon="card-text" class="mr-1"></b-icon> Cédula/RIF: {{ client.cedula }}
        </p>
        <b-row class="small">
          <b-col md="6" class="mb-1">
            <b-icon icon="envelope" class="mr-1"></b-icon>
            <strong>Email:</strong> {{ client.email || 'N/A' }}
          </b-col>
          <b-col md="6" class="mb-1">
            <b-icon icon="telephone" class="mr-1"></b-icon>
            <strong>Teléfono:</strong> {{ client.phone || 'N/A' }}
          </b-col>
          <b-col md="6" class="mb-1">
            <b-icon icon="geo-alt" class="mr-1"></b-icon>
            <strong>Ciudad:</strong> {{ client.billing_city || 'N/A' }}
          </b-col>
          <b-col md="6" class="mb-1">
            <b-icon icon="map" class="mr-1"></b-icon>
            <strong>Dirección:</strong> {{ client.address || 'N/A' }}
          </b-col>
        </b-row>
        
        <!-- Accion WhatsApp -->
        <b-button
          v-if="client.phone"
          variant="success"
          size="sm"
          class="mt-2"
          @click="openWhatsApp"
        >
          <b-icon icon="whatsapp" class="mr-1"></b-icon> Enviar Mensaje de WhatsApp
        </b-button>
      </b-card>

      <!-- Tabs de Gestión -->
      <b-tabs content-class="mt-3" justified>
        
        <!-- Tab 1: Historial de Compras -->
        <b-tab title="Historial" active>
          <b-overlay :show="loadingHistory" spinner-small>
            <!-- Filtro de Estatus de Orden Dinámico -->
            <div v-if="orders.length > 0" class="mb-3 px-1">
              <span class="small text-muted font-weight-bold d-block mb-1">Filtrar por estatus de orden:</span>
              <b-form-radio-group
                id="crm-filter-status"
                v-model="selectedStatus"
                :options="statusOptions"
                button-variant="outline-info"
                size="sm"
                name="crm-radio-btn-status"
                buttons
              ></b-form-radio-group>
            </div>

            <div v-if="filteredOrders.length === 0" class="text-center py-4 text-muted">
              {{ orders.length === 0 ? 'Este cliente no posee historial de compras en el sistema.' : 'No hay compras registradas con el filtro seleccionado.' }}
            </div>
            <div v-else>
              <b-card v-for="order in filteredOrders" :key="order._id" no-body class="mb-2 shadow-sm overflow-hidden">
                <div 
                  v-b-toggle="'collapse-order-' + order._id" 
                  class="p-3 d-flex justify-content-between align-items-center"
                  style="cursor: pointer; user-select: none;"
                >
                  <div class="d-flex align-items-center">
                    <strong class="text-dark">Orden #{{ order._id }}</strong>
                    <b-badge :variant="getStatusVariant(order.status)" class="ml-2">
                      {{ order.status }}
                    </b-badge>
                  </div>
                  <div class="d-flex align-items-center">
                    <span class="mr-3 small text-secondary">
                      Total: <strong class="text-dark">${{ order.pago_total }}</strong>
                      <span class="mx-1">|</span>
                      Abonado: <strong class="text-dark">${{ order.pago_abono }}</strong>
                    </span>
                    <b-icon class="when-opened text-muted" icon="chevron-up" />
                    <b-icon class="when-closed text-muted" icon="chevron-down" />
                  </div>
                </div>
                
                <b-collapse :id="'collapse-order-' + order._id">
                  <div class="p-3 border-top bg-light">
                    <div class="small text-muted mb-2">
                      Fecha: {{ formatDate(order.moment || order.fecha_creacion) }}
                    </div>
                    
                    <!-- Lista de Productos en la orden -->
                    <div class="pl-2 border-left border-info">
                      <div v-for="(prod, index) in order.productos" :key="index" class="small text-dark mb-1">
                        {{ prod.cantidad }}x <strong>{{ prod.name }}</strong> 
                        <span v-if="prod.talla">({{ prod.talla }})</span> - 
                        ${{ prod.precio_unitario }} c/u
                      </div>
                    </div>
                  </div>
                </b-collapse>
              </b-card>
            </div>
          </b-overlay>
        </b-tab>

        <!-- Tab 2: Bitácora de Notas -->
        <b-tab title="Notas (Bitácora)">
          <!-- Formulario Agregar Nota -->
          <b-form-group label="Nueva Nota" label-for="new-note" class="mb-2">
            <b-form-textarea
              id="new-note"
              v-model="newNote"
              placeholder="Escribe un comentario sobre el cliente..."
              rows="3"
              size="sm"
            ></b-form-textarea>
            <b-button
              variant="info"
              size="sm"
              class="mt-2 float-right"
              :disabled="!newNote.trim() || savingNote"
              @click="saveNote"
            >
              <b-spinner small v-if="savingNote"></b-spinner> Guardar Nota
            </b-button>
          </b-form-group>
          <div class="clearfix mb-3"></div>

          <!-- Feed de notas -->
          <b-overlay :show="loadingNotes" spinner-small>
            <div v-if="notes.length === 0" class="text-center py-4 text-muted">
              No hay notas registradas para este cliente.
            </div>
            <div v-else class="notes-timeline">
              <div v-for="note in notes" :key="note._id" class="note-item mb-3 p-2 bg-light rounded border-left border-info">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span><b-icon icon="person" class="mr-1"></b-icon> {{ note.creador_nombre }}</span>
                  <span>{{ formatDateTime(note.moment) }}</span>
                </div>
                <div class="small" style="white-space: pre-line;">{{ note.nota }}</div>
              </div>
            </div>
          </b-overlay>
        </b-tab>

        <!-- Tab 3: Soporte / Postventa -->
        <b-tab title="Soporte">
          <!-- Formulario ticket soporte -->
          <b-card class="bg-light mb-3" border-variant="secondary">
            <h6 class="mb-2 text-secondary">Registrar Incidencia de Soporte</h6>
            <b-form-group label="Título" label-for="support-title" label-size="sm" class="mb-2">
              <b-form-input
                id="support-title"
                v-model="newTicket.titulo"
                size="sm"
                placeholder="Ej: Costura rota en el puño derecho"
              ></b-form-input>
            </b-form-group>
            <b-form-group label="Detalle" label-for="support-desc" label-size="sm" class="mb-2">
              <b-form-textarea
                id="support-desc"
                v-model="newTicket.descripcion"
                rows="2"
                size="sm"
                placeholder="Especifica el reclamo o incidencia del cliente..."
              ></b-form-textarea>
            </b-form-group>
            <b-button
              variant="secondary"
              size="sm"
              class="w-100 mt-1"
              :disabled="!newTicket.titulo.trim() || !newTicket.descripcion.trim() || savingTicket"
              @click="saveTicket"
            >
              <b-spinner small v-if="savingTicket"></b-spinner> Registrar Ticket
            </b-button>
          </b-card>

          <!-- Listado de incidencias -->
          <b-overlay :show="loadingSupport" spinner-small>
            <div v-if="tickets.length === 0" class="text-center py-4 text-muted">
              Este cliente no posee reportes de soporte activos.
            </div>
            <div v-else>
              <b-card v-for="ticket in tickets" :key="ticket._id" class="mb-2 shadow-sm" border-variant="warning">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="mb-0 text-dark">{{ ticket.titulo }}</h6>
                  <b-badge :variant="ticket.estado === 'abierto' ? 'warning' : 'success'">
                    {{ ticket.estado }}
                  </b-badge>
                </div>
                <p class="small text-muted mb-2">{{ ticket.descripcion }}</p>
                <div class="d-flex justify-content-between align-items-center small text-muted border-top pt-2">
                  <span>{{ formatDateTime(ticket.moment) }}</span>
                  <b-button
                    v-if="ticket.estado === 'abierto'"
                    variant="link"
                    size="sm"
                    class="p-0 text-success"
                    @click="resolveTicket(ticket._id)"
                  >
                    Marcar Resuelto
                  </b-button>
                </div>
              </b-card>
            </div>
          </b-overlay>
        </b-tab>

        <!-- Tab 4: Presupuestos / Cotizaciones -->
        <b-tab title="Cotizaciones">
          <b-overlay :show="loadingBudgets" spinner-small>
            <div v-if="filteredBudgets.length === 0" class="text-center py-4 text-muted">
              {{ budgets.length === 0 ? 'No hay cotizaciones registradas para este cliente.' : 'No hay cotizaciones con el producto seleccionado.' }}
            </div>
            <div v-else>
              <b-card v-for="budget in filteredBudgets" :key="budget._id" no-body class="mb-2 shadow-sm overflow-hidden">
                <div 
                  v-b-toggle="'collapse-budget-' + budget._id" 
                  class="p-3 d-flex justify-content-between align-items-center"
                  style="cursor: pointer; user-select: none;"
                >
                  <div class="d-flex align-items-center">
                    <strong class="text-dark">Cotización #{{ budget._id }}</strong>
                    <b-badge :variant="getStatusVariant(budget.status)" class="ml-2">
                      {{ budget.status || 'pendiente' }}
                    </b-badge>
                  </div>
                  <div class="d-flex align-items-center">
                    <span class="mr-3 small text-secondary">
                      Total Proyectado: <strong class="text-dark">${{ budget.pago_total }}</strong>
                    </span>
                    <b-icon class="when-opened text-muted" icon="chevron-up" />
                    <b-icon class="when-closed text-muted" icon="chevron-down" />
                  </div>
                </div>

                <b-collapse :id="'collapse-budget-' + budget._id">
                  <div class="p-3 border-top bg-light">
                    <div class="small text-muted mb-2">
                      Fecha: {{ formatDate(budget.moment || budget.fecha_creacion) }}
                    </div>
                    
                    <!-- Productos -->
                    <div class="pl-2 border-left border-secondary">
                      <div v-for="(prod, index) in budget.productos" :key="index" class="small text-dark mb-1">
                        {{ prod.cantidad }}x <strong>{{ prod.name }}</strong> 
                        <span v-if="prod.talla">({{ prod.talla }})</span> - 
                        ${{ prod.precio_unitario }} c/u
                      </div>
                    </div>
                  </div>
                </b-collapse>
              </b-card>
            </div>
          </b-overlay>
        </b-tab>

      </b-tabs>
    </div>
  </b-sidebar>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  props: {
    client: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
    filterProduct: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      visible: false,
      orders: [],
      notes: [],
      tickets: [],
      budgets: [],
      newNote: "",
      newTicket: {
        titulo: "",
        descripcion: "",
      },
      loadingHistory: false,
      loadingNotes: false,
      loadingSupport: false,
      loadingBudgets: false,
      savingNote: false,
      savingTicket: false,
      selectedStatus: "todas",
    };
  },
  computed: {
    ...mapState("login", ["dataUser"]),
    filteredOrders() {
      let filtered = this.orders;
      if (this.filterProduct) {
        const pId = parseInt(this.filterProduct);
        filtered = filtered.filter(order => {
          return order.productos && order.productos.some(prod => parseInt(prod.id_woo) === pId);
        });
      }
      if (this.selectedStatus && this.selectedStatus !== "todas") {
        filtered = filtered.filter(order => {
          return order.status && order.status.trim() === this.selectedStatus;
        });
      }
      return filtered;
    },
    statusOptions() {
      if (!this.orders || this.orders.length === 0) {
        return [];
      }
      const uniqueStatuses = new Set();
      this.orders.forEach(order => {
        if (order.status) {
          uniqueStatuses.add(order.status.trim());
        }
      });
      const options = [...uniqueStatuses].map(status => ({
        text: status,
        value: status
      }));
      options.sort((a, b) => a.text.localeCompare(b.text));
      return [
        { text: "Todas", value: "todas" },
        ...options
      ];
    },
    filteredBudgets() {
      if (!this.filterProduct) {
        return this.budgets;
      }
      const pId = parseInt(this.filterProduct);
      return this.budgets.filter(budget => {
        return budget.productos && budget.productos.some(prod => parseInt(prod.id_woo) === pId);
      });
    },
  },
  watch: {
    show(newVal) {
      this.visible = newVal;
    },
    client(newVal) {
      if (newVal) {
        this.selectedStatus = "todas";
        this.fetchClientCRMData();
      }
    },
  },
  methods: {
    handleVisibilityChange(val) {
      if (!val) {
        this.$emit("close");
      }
    },
    fetchClientCRMData() {
      if (!this.client) return;
      const id = this.client.id || this.client._id;
      
      let queryParam = "";
      if (this.dataUser && this.dataUser.departamento === 'Comercialización') {
        const sellerId = this.dataUser.id_usuario || this.dataUser.id_empleado;
        if (sellerId) {
          queryParam = `?id_vendedor=${sellerId}`;
        }
      }
      
      // 1. Cargar Historial de Órdenes
      this.loadingHistory = true;
      this.$axios.get(`${this.$config.API}/customers/orders-local/${id}${queryParam}`)
        .then(res => {
          this.orders = res.data;
        })
        .catch(err => console.error("Error cargando órdenes:", err))
        .finally(() => { this.loadingHistory = false; });

      // 2. Cargar Bitácora de Notas
      this.loadingNotes = true;
      this.$axios.get(`${this.$config.API}/crm/notas/${id}`)
        .then(res => {
          this.notes = res.data;
        })
        .catch(err => console.error("Error cargando notas:", err))
        .finally(() => { this.loadingNotes = false; });

      // 3. Cargar Soporte
      this.loadingSupport = true;
      this.$axios.get(`${this.$config.API}/crm/soporte/${id}`)
        .then(res => {
          this.tickets = res.data;
        })
        .catch(err => console.error("Error cargando soporte:", err))
        .finally(() => { this.loadingSupport = false; });

      // 4. Cargar Cotizaciones
      this.loadingBudgets = true;
      this.$axios.get(`${this.$config.API}/customers/presupuestos-local/${id}${queryParam}`)
        .then(res => {
          this.budgets = res.data;
        })
        .catch(err => console.error("Error cargando presupuestos:", err))
        .finally(() => { this.loadingBudgets = false; });
    },
    saveNote() {
      if (!this.newNote.trim()) return;
      const id = this.client.id || this.client._id;
      this.savingNote = true;

      const payload = {
        id_customer: id,
        id_usuario_creador: this.dataUser.id_usuario,
        nota: this.newNote,
      };

      this.$axios.post(`${this.$config.API}/crm/notas/nueva`, payload)
        .then(() => {
          this.newNote = "";
          this.fetchClientCRMData();
          this.$fire({
            title: "Nota Guardada",
            text: "La nota se ha añadido a la bitácora del cliente.",
            type: "success",
          });
        })
        .catch(err => {
          console.error("Error guardando nota:", err);
          this.$fire({
            title: "Error",
            text: "No se pudo guardar la nota.",
            type: "error",
          });
        })
        .finally(() => { this.savingNote = false; });
    },
    saveTicket() {
      if (!this.newTicket.titulo.trim() || !this.newTicket.descripcion.trim()) return;
      const id = this.client.id || this.client._id;
      this.savingTicket = true;

      const payload = {
        id_customer: id,
        titulo: this.newTicket.titulo,
        descripcion: this.newTicket.descripcion,
        estado: "abierto",
      };

      this.$axios.post(`${this.$config.API}/crm/soporte/nueva`, payload)
        .then(() => {
          this.newTicket.titulo = "";
          this.newTicket.descripcion = "";
          this.fetchClientCRMData();
          this.$fire({
            title: "Ticket Registrado",
            text: "El reporte de soporte se ha guardado exitosamente.",
            type: "success",
          });
        })
        .catch(err => {
          console.error("Error guardando ticket:", err);
          this.$fire({
            title: "Error",
            text: "No se pudo registrar la incidencia.",
            type: "error",
          });
        })
        .finally(() => { this.savingTicket = false; });
    },
    resolveTicket(ticketId) {
      this.$confirm("¿Estás seguro de marcar esta incidencia como resuelta?", "Resolver Incidencia", "question")
        .then(() => {
          // Cambiar estado localmente llamando al endpoint del crm/soporte
          // Usaremos el mismo endpoint de crear pero pasando estado='resuelto' en una API POST simplificada o PUT si la tuviéramos
          // Pero para hacerlo simple, crearemos un endpoint rápido en el backend si lo deseamos, o podemos actualizarlo con un POST general.
          // En rutas definimos POST /crm/soporte/nueva que registra. Vamos a agregar una forma rápida de resolver incidencias.
          // Por simplicidad, agregamos una actualización rápida en la base de datos simulada del frontend,
          // o creamos un endpoint PUT /crm/soporte/estado. Espera, podemos llamar a un PUT /crm/soporte/estado o similar.
          // Como no definimos un PUT /crm/soporte/estado en backend, vamos a escribir un post rápido de estado.
          // Wait! In order to resolve this ticket in the DB, we can write a quick update. Let's make an endpoint.
          // Oh, wait, in routes/crm.php we don't have a resolve endpoint, but we can call a general endpoint or we can add it.
          // Actually, let's look at crm.php. We only have: POST /crm/soporte/nueva.
          // Let's add a quick route in crm.php for resolving support tickets:
          // PUT /crm/soporte/estado
          // Wait, let's write it in this method or let's create it. We can just add it in crm.php!
          const payload = {
            id_incidencia: ticketId,
            estado: 'resuelto'
          };
          // We can write PUT /crm/soporte/estado in crm.php later, or call it directly. Let's write the axios call first.
          this.$axios.put(`${this.$config.API}/crm/soporte/estado`, payload)
            .then(() => {
              this.fetchClientCRMData();
              this.$fire({
                title: "Resuelto",
                text: "La incidencia se ha marcado como resuelta.",
                type: "success"
              });
            })
            .catch(err => {
              console.error("Error resolviendo ticket:", err);
              this.$fire({
                title: "Error",
                text: "No se pudo actualizar la incidencia.",
                type: "error"
              });
            });
        });
    },
    openWhatsApp() {
      if (!this.client || !this.client.phone) return;
      let phone = this.client.phone.trim();
      // Remover caracteres especiales, espacios y signos
      phone = phone.replace(/[^0-9]/g, "");
      
      // Si el número no tiene código de país (asumiendo Venezuela +58 si tiene 10 dígitos)
      if (phone.length === 10) {
        phone = "58" + phone;
      }
      
      const url = `https://wa.me/${phone}`;
      window.open(url, "_blank");
    },
    getStatusVariant(status) {
      if (!status) return "secondary";
      const s = status.toLowerCase();
      if (s === "activa" || s === "entregada" || s === "completado" || s === "resuelto") return "success";
      if (s === "en espera" || s === "pendiente" || s === "abierto") return "warning";
      if (s === "pausada") return "info";
      if (s === "cancelada" || s === "anulado" || s === "cliente_perdido") return "danger";
      return "secondary";
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
      } catch (e) {
        return dateStr;
      }
    },
    formatDateTime(dateStr) {
      if (!dateStr) return "N/A";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleString("es-ES", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        return dateStr;
      }
    },
  },
};
</script>

<style scoped>
.notes-timeline {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}
.note-item {
  border-left-width: 4px !important;
}
.collapsed .when-opened,
:not(.collapsed) .when-closed {
  display: none;
}
</style>
