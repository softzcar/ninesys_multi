<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración' || dataUser.departamento === 'Producción'">
        <b-overlay :show="loading" spinner-small>
          <b-container fluid>
            <b-row class="mb-4">
              <b-col>
                <div class="d-flex justify-content-between align-items-center">
                  <h1 class="m-0 text-primary">
                    <b-icon icon="journal-richtext" class="mr-2"></b-icon>
                    Reporte de Movimientos e Historial
                  </h1>
                  <div class="d-flex">
                    <b-button variant="outline-primary" @click="loadReport" class="mr-2">
                      <b-icon icon="arrow-clockwise" class="mr-1"></b-icon>Actualizar
                    </b-button>
                  </div>
                </div>
              </b-col>
            </b-row>

            <!-- Filtros -->
            <b-card no-body class="mb-4 shadow-sm border-0 border-top-info">
              <b-card-body class="p-4">
                <b-row align-v="end">
                  <b-col md="3" class="mb-3 mb-md-0">
                    <label class="small font-weight-bold text-muted text-uppercase mb-2 d-block">Desde:</label>
                    <b-form-datepicker v-model="fechaInicio" size="sm" locale="es" @input="loadReport" class="border-info"></b-form-datepicker>
                  </b-col>
                  <b-col md="3" class="mb-3 mb-md-0">
                    <label class="small font-weight-bold text-muted text-uppercase mb-2 d-block">Hasta:</label>
                    <b-form-datepicker v-model="fechaFin" size="sm" locale="es" @input="loadReport" class="border-info"></b-form-datepicker>
                  </b-col>
                  <b-col md="3" class="mb-3 mb-md-0">
                    <label class="small font-weight-bold text-muted text-uppercase mb-2 d-block">Departamento:</label>
                    <b-form-select v-model="departamento" :options="opcionesDepartamentos" size="sm" @change="loadReport" class="border-info"></b-form-select>
                  </b-col>
                  <b-col md="3">
                    <label class="small font-weight-bold text-muted text-uppercase mb-2 d-block">Insumo (Nombre/SKU):</label>
                    <b-form-input v-model="searchInsumo" placeholder="Ej: Tela, Poliester..." size="sm" debounce="500" @input="loadReport" class="border-info"></b-form-input>
                  </b-col>
                </b-row>
              </b-card-body>
            </b-card>

            <b-row v-if="items.length > 0">
              <b-col>
                <div class="table-responsive shadow-sm rounded">
                  <b-table
                    hover
                    striped
                    :items="items"
                    :fields="fields"
                    head-variant="info"
                    class="bg-white m-0"
                    :busy="loading"
                  >
                    <template #cell(moment)="data">
                      <div class="small">
                        <b-icon icon="clock" class="mr-1 text-muted"></b-icon>
                        {{ formatDateTime(data.value) }}
                      </div>
                    </template>
                    
                    <template #cell(nombre_insumo)="data">
                      <div class="d-flex flex-column">
                        <span class="font-weight-bold text-dark">{{ data.value }}</span>
                        <small class="text-secondary font-code">{{ data.item.sku }}</small>
                      </div>
                    </template>

                    <template #cell(id_orden)="data">
                      <b-badge pill variant="light" class="border text-info p-2 px-3">
                        <b-icon icon="hash" class="mr-1"></b-icon>{{ data.value }}
                      </b-badge>
                    </template>

                    <template #cell(cantidad_consumida)="data">
                       <span class="font-weight-bold text-danger text-lg">{{ data.value }}</span>
                    </template>

                    <template #cell(usuario_nombre)="data">
                      <div class="d-flex align-items-center">
                        <b-avatar size="sm" variant="light" class="mr-2 text-info"></b-avatar>
                        <span class="small">{{ data.value || 'N/A' }}</span>
                      </div>
                    </template>

                    <template #cell(acciones)="data">
                      <inventario-ModalHistorialMovimiento 
                        :id-movimiento="data.item._id" 
                        :historial-count="data.item.historial_count"
                      />
                    </template>
                    
                    <template #table-busy>
                      <div class="text-center text-info my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Cargando...</strong>
                      </div>
                    </template>
                  </b-table>
                </div>
              </b-col>
            </b-row>

            <b-row v-else-if="!loading">
              <b-col>
                <div class="bg-white border rounded shadow-sm text-center py-5">
                  <b-icon icon="inbox" font-scale="4" class="mb-3 text-muted" opacity="0.5"></b-icon>
                  <h4 class="text-muted">Sin registros</h4>
                  <p class="text-secondary">No se encontraron movimientos registrados en este periodo con los filtros seleccionados.</p>
                  <b-button variant="info" size="sm" @click="resetFilters">Limpiar Filtros</b-button>
                </div>
              </b-col>
            </b-row>

          </b-container>
        </b-overlay>
      </div>
      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],
  data() {
    return {
      loading: false,
      items: [],
      fechaInicio: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      departamento: "Todas",
      searchInsumo: "",
      opcionesDepartamentos: [
        { text: "Todos los Departamentos", value: "Todas" },
        { text: "Impresión", value: "Impresión" },
        { text: "Estampado", value: "Estampado" },
        { text: "Corte", value: "Corte" },
        { text: "Costura", value: "Costura" },
        { text: "Diseño", value: "Diseño" },
        { text: "Administración", value: "Administración" }
      ],
      fields: [
        { key: "moment", label: "Fecha/Hora", sortable: true, thClass: 'text-white' },
        { key: "nombre_insumo", label: "Insumo", sortable: true, thClass: 'text-white' },
        { key: "id_orden", label: "Nº Órden", sortable: true, thClass: 'text-white' },
        { key: "departamento", label: "Dpto", sortable: true, thClass: 'text-white' },
        { key: "cantidad_consumida", label: "Consumo", sortable: true, thClass: 'text-white' },
        { key: "valor_inicial", label: "Inicial", sortable: true, thClass: 'text-white' },
        { key: "valor_final", label: "Final", sortable: true, thClass: 'text-white' },
        { key: "usuario_nombre", label: "Responsable", sortable: true, thClass: 'text-white' },
        { key: "acciones", label: "Auditoría", class: "text-center", thClass: 'text-white' }
      ]
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access"])
  },
  methods: {
    async loadReport() {
      this.loading = true;
      try {
        const response = await this.$axios.get(`${this.$config.API}/inventario/reportes/movimientos`, {
          params: {
            inicio: this.fechaInicio,
            fin: this.fechaFin,
            departamento: this.departamento,
            insumo: this.searchInsumo
          }
        });
        if (response.data.success) {
          this.items = response.data.items || [];
        } else {
          console.error("Error API:", response.data.message);
        }
      } catch (error) {
        console.error("Error cargando reporte de movimientos:", error);
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.fechaInicio = new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0];
      this.fechaFin = new Date().toISOString().split('T')[0];
      this.departamento = "Todas";
      this.searchInsumo = "";
      this.loadReport();
    },
    formatDateTime(val) {
      if (!val) return "-";
      return new Date(val).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  mounted() {
    this.loadReport();
  }
};
</script>

<style scoped>
.font-code { font-family: 'Courier New', Courier, monospace; }
.border-top-info { border-top: 5px solid #17a2b8 !important; }
.text-uppercase { letter-spacing: 0.5px; }
.text-lg { font-size: 1.1rem; }
</style>
