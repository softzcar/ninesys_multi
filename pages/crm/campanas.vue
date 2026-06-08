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
        <b-overlay :show="sending" spinner-small>
          <b-container fluid class="py-3">
            
            <!-- Encabezado -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 class="h3 mb-1 text-dark">Campañas de WhatsApp</h1>
                <p class="text-muted small mb-0">Envía promociones y ofertas masivas personalizadas por WhatsApp basándote en lo que compraron tus clientes.</p>
              </div>
              <b-button to="/crm" variant="outline-secondary" size="sm">
                <b-icon icon="arrow-left" class="mr-1"></b-icon> Volver al Embudo
              </b-button>
            </div>

            <b-row>
              <!-- Formulario de Envío de Campaña -->
              <b-col lg="6" class="mb-4">
                <b-card header="Crear Nueva Campaña" header-bg-variant="primary" header-text-variant="white" class="shadow-sm border-0">
                  <b-form @submit.prevent="triggerCampaign">
                    
                    <!-- Nombre de la campaña -->
                    <b-form-group label="Nombre de la Campaña *" label-for="camp-name">
                      <b-form-input
                        id="camp-name"
                        v-model="campaign.nombre"
                        placeholder="Ej: Oferta Día del Padre - Franelas"
                        required
                        size="sm"
                      ></b-form-input>
                    </b-form-group>

                    <!-- Redacción del Mensaje -->
                    <b-form-group label="Mensaje de WhatsApp *" label-for="camp-msg">
                      <!-- Placeholders Rápidos -->
                      <div class="mb-2">
                        <span class="small text-muted mr-2">Variables rápidas:</span>
                        <b-button size="xs" variant="outline-info" class="mr-1 py-0 px-1 text-xs" @click="insertVariable('{{first_name}}')">
                          Nombre
                        </b-button>
                        <b-button size="xs" variant="outline-info" class="py-0 px-1 text-xs" @click="insertVariable('{{last_name}}')">
                          Apellido
                        </b-button>
                      </div>

                      <b-form-textarea
                        id="camp-msg"
                        v-model="campaign.mensaje_plantilla"
                        :placeholder="'Escribe el mensaje aquí... Ej: ¡Hola {{first_name}}! Tenemos una promoción especial para ti...'"
                        rows="6"
                        required
                        size="sm"
                        ref="msgTextarea"
                      ></b-form-textarea>
                    </b-form-group>

                    <!-- Segmentación por Producto -->
                    <b-form-group label="Segmentación: Filtrar por Producto comprado" label-for="camp-product">
                      <b-form-select
                        id="camp-product"
                        v-model="campaign.selectedProduct"
                        size="sm"
                      >
                        <option :value="null">-- Todos los clientes registrados (Sin filtro) --</option>
                        <option
                          v-for="p in productsList"
                          :key="p.cod || p._id"
                          :value="p.cod || p._id"
                        >
                          {{ p.name }} (SKU: {{ p.sku || 'N/A' }})
                        </option>
                      </b-form-select>
                      
                      <!-- Info del segmento -->
                      <div class="mt-2 text-info small font-weight-bold" v-if="loadingSegment">
                        <b-spinner small class="mr-1"></b-spinner> Calculando tamaño del segmento...
                      </div>
                      <div class="mt-2 text-info small font-weight-bold" v-else>
                        <b-icon icon="people-fill" class="mr-1"></b-icon>
                        Esta campaña se enviará a: <strong>{{ segmentSize }}</strong> clientes.
                      </div>
                    </b-form-group>

                    <!-- Botón de Envío -->
                    <b-button
                      type="submit"
                      variant="primary"
                      size="sm"
                      class="w-100 mt-3"
                      :disabled="segmentSize === 0 || !campaign.nombre.trim() || !campaign.mensaje_plantilla.trim()"
                    >
                      <b-icon icon="telegram" class="mr-1"></b-icon> Lanzar Campaña de WhatsApp
                    </b-button>

                  </b-form>
                </b-card>
              </b-col>

              <!-- Historial de Campañas de Marketing -->
              <b-col lg="6" class="mb-4">
                <b-card header="Historial de Campañas Recientes" header-bg-variant="dark" header-text-variant="white" class="shadow-sm border-0">
                  <div v-if="campaignsHistory.length === 0" class="text-center py-5 text-muted">
                    No hay campañas registradas aún en el sistema.
                  </div>
                  <div v-else>
                    <b-table
                      small
                      striped
                      hover
                      :items="campaignsHistory"
                      :fields="historyFields"
                    >
                      <template #cell(fecha)="data">
                        {{ formatDate(data.item.fecha) }}
                      </template>
                      
                      <template #cell(envios)="data">
                        {{ data.item.total_envios }}
                      </template>
                      
                      <template #cell(conversiones)="data">
                        <b-badge variant="success" pill>
                          {{ data.item.ganadas }} ganados
                        </b-badge>
                      </template>

                      <template #cell(efectividad)="data">
                        <div class="font-weight-bold" :class="getEfectividadColor(data.item.efectividad)">
                          {{ data.item.efectividad }}%
                        </div>
                      </template>
                    </b-table>
                  </div>
                </b-card>
              </b-col>
            </b-row>

          </b-container>
        </b-overlay>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  data() {
    return {
      sending: false,
      loadingSegment: false,
      segmentSize: 0,
      productsList: [],
      campaignsHistory: [],
      
      campaign: {
        nombre: "",
        mensaje_plantilla: "",
        selectedProduct: null,
      },

      historyFields: [
        { key: "nombre", label: "Campaña", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "envios", label: "Envíos", class: "text-center" },
        { key: "conversiones", label: "Efecto ROI", class: "text-center" },
        { key: "efectividad", label: "Efectividad %", class: "text-center" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },
  watch: {
    "campaign.selectedProduct"(newVal) {
      this.calculateSegmentSize(newVal);
    }
  },
  methods: {
    fetchInitialData() {
      // 1. Cargar catálogo de productos
      axios.get(`${this.$config.API}/wp/products`)
        .then(res => {
          this.productsList = res.data.data || [];
        })
        .catch(err => console.error("Error cargando productos:", err));

      // 2. Cargar historial del dashboard (que incluye campañas)
      this.fetchCampaignsHistory();

      // Calcular tamaño inicial del segmento (sin filtros)
      this.calculateSegmentSize(null);
    },
    fetchCampaignsHistory() {
      axios.get(`${this.$config.API}/crm/reports/dashboard`)
        .then(res => {
          this.campaignsHistory = res.data.campanas_efectividad || [];
        })
        .catch(err => console.error("Error cargando historial de campañas:", err));
    },
    calculateSegmentSize(productId) {
      this.loadingSegment = true;
      if (productId) {
        axios.get(`${this.$config.API}/crm/clientes-por-producto/${productId}`)
          .then(res => {
            this.segmentSize = res.data.length;
          })
          .catch(err => {
            console.error("Error calculando segmento:", err);
            this.segmentSize = 0;
          })
          .finally(() => { this.loadingSegment = false; });
      } else {
        // Cargar total de clientes que tienen teléfono
        axios.get(`${this.$config.API}/customers`)
          .then(res => {
            const list = res.data.data || [];
            this.segmentSize = list.filter(c => c.phone && c.phone.trim() !== "").length;
          })
          .catch(err => {
            console.error("Error calculando todos los clientes:", err);
            this.segmentSize = 0;
          })
          .finally(() => { this.loadingSegment = false; });
      }
    },
    insertVariable(variable) {
      const textarea = this.$refs.msgTextarea.$el;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = this.campaign.mensaje_plantilla;
      
      this.campaign.mensaje_plantilla = text.substring(0, start) + variable + text.substring(end);
      
      // Enfocar de nuevo
      this.$nextTick(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      });
    },
    triggerCampaign() {
      if (!this.campaign.nombre.trim() || !this.campaign.mensaje_plantilla.trim() || this.segmentSize === 0) return;
      
      this.$confirm(
        `¿Confirmas el lanzamiento de la campaña a ${this.segmentSize} clientes? Se enviará un mensaje de WhatsApp secuencial a cada uno.`,
        "Lanzar Campaña",
        "question"
      ).then(() => {
        this.sending = true;
        
        const payload = {
          nombre: this.campaign.nombre,
          mensaje_plantilla: this.campaign.mensaje_plantilla,
          filtro_productos: this.campaign.selectedProduct ? [this.campaign.selectedProduct] : []
        };

        axios.post(`${this.$config.API}/crm/campanas/enviar`, payload)
          .then(res => {
            this.$fire({
              title: "Campaña Finalizada 🎉",
              html: `<p>Se procesó el envío masivo exitosamente.</p>
                     <ul>
                       <li>Total de envíos: <strong>${res.data.total_clientes}</strong></li>
                     </ul>`,
              type: "success"
            });
            
            // Limpiar formulario
            this.campaign.nombre = "";
            this.campaign.mensaje_plantilla = "";
            this.campaign.selectedProduct = null;
            
            // Recargar datos
            this.fetchCampaignsHistory();
            this.calculateSegmentSize(null);
          })
          .catch(err => {
            console.error("Error enviando campaña:", err);
            this.$fire({
              title: "Error",
              text: "Ocurrió un error al procesar el envío masivo.",
              type: "error"
            });
          })
          .finally(() => { this.sending = false; });
      });
    },
    getEfectividadColor(val) {
      const num = parseFloat(val);
      if (num === 0) return "text-muted";
      if (num < 10) return "text-secondary";
      if (num < 25) return "text-info";
      return "text-success font-weight-bold";
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
    this.fetchInitialData();
  }
};
</script>

<style scoped>
.text-xs {
  font-size: 0.75rem !important;
}
.xs {
  padding: 1px 5px !important;
}
</style>
