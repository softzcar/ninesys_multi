<template>
  <div>
    <b-overlay :show="overlay" spinner-variant="primary">
      <b-container>
        <b-row class="mb-3">
          <b-col>
            <h3>Reporte de Costos de Producción</h3>
          </b-col>
        </b-row>

        <!-- Filtros -->
        <b-row class="mb-4 p-3 bg-light border rounded">
          <b-col md="5">
            <b-form-group label="Fecha de Inicio:">
              <b-form-datepicker
                v-model="filters.inicio"
                locale="es"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col md="5">
            <b-form-group label="Fecha de Fin:">
              <b-form-datepicker
                v-model="filters.fin"
                locale="es"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col md="2" class="d-flex align-items-end">
            <b-button variant="primary" @click="getReport" class="w-100">
              <b-icon-search></b-icon-search> Buscar
            </b-button>
          </b-col>
        </b-row>

        <!-- Tabla de Resultados -->
        <b-row>
          <b-col>
            <b-table
              striped
              hover
              :items="reportData"
              :fields="fields"
              responsive
            >
              <template #cell(costos_de_insumos)="data">
                $ {{ data.item.costos_de_insumos.toFixed(2) }}
              </template>
              <template #cell(costo_mano_de_obra)="data">
                $ {{ data.item.costo_mano_de_obra.toFixed(2) }}
              </template>
              <template #cell(eficiencia_del_corte)="data">
                {{ data.item.eficiencia_del_corte.toFixed(2) }} m
              </template>
              <template #cell(tiempo_de_produccion)="data">
                {{ data.item.tiempo_de_produccion.toFixed(2) }} hrs
              </template>
            </b-table>
          </b-col>
        </b-row>

        <!-- Costos Operativos -->
        <hr />
        <b-row class="mt-4" v-if="costosOperativos.total_gastos_semanales">
          <b-col>
            <h4>Costos Operativos Semanales</h4>
            <b-card no-body class="mt-3">
              <b-list-group flush>
                <b-list-group-item
                  class="d-flex justify-content-between align-items-center"
                >
                  Total Gastos Fijos Semanales:
                  <b-badge variant="info" pill
                    >$
                    {{
                      costosOperativos.total_gastos_semanales.toFixed(2)
                    }}</b-badge
                  >
                </b-list-group-item>
                <b-list-group-item
                  class="d-flex justify-content-between align-items-center"
                >
                  Costo Operativo por Producto (en este período):
                  <b-badge variant="success" pill
                    >$
                    {{
                      costosOperativos.costo_operativo_por_producto.toFixed(2)
                    }}</b-badge
                  >
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
      overlay: true,
      reportData: [],
      costosOperativos: {},
      filters: {
        inicio: null,
        fin: null,
      },
      fields: [
        { key: "id_orden", label: "Orden", sortable: true },
        { key: "vendedor", label: "Vendedor", sortable: true },
        { key: "total_productos", label: "Productos", sortable: true },
        { key: "costos_de_insumos", label: "Costo Insumos", sortable: true },
        { key: "costo_mano_de_obra", label: "Costo M.O.", sortable: true },
        {
          key: "eficiencia_del_corte",
          label: "Eficiencia Corte",
          sortable: true,
        },
        {
          key: "tiempo_de_produccion",
          label: "T. Producción",
          sortable: true,
        },
        { key: "reposiciones", label: "Reposiciones", sortable: true },
      ],
    };
  },
  methods: {
    setDefaultDates() {
      const today = new Date();
      // getDay() devuelve 0 para Domingo, 1 para Lunes, etc.
      const dayOfWeek = today.getDay();
      // Ajuste para que la semana comience en Lunes (1)
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));

      // Formato YYYY-MM-DD
      this.filters.inicio = monday.toISOString().split("T")[0];
      this.filters.fin = new Date().toISOString().split("T")[0];
    },

    async getReport() {
      this.overlay = true;
      if (!this.filters.inicio || !this.filters.fin) {
        this.$bvToast.toast("Por favor, seleccione un rango de fechas.", {
          title: "Faltan Datos",
          variant: "warning",
          solid: true,
        });
        this.overlay = false;
        return;
      }

      const url = `${this.$config.API}/reportes/costos-produccion/${this.filters.inicio}/${this.filters.fin}`;

      try {
        const { data } = await this.$axios.get(url);
        this.reportData = data.reporte_data;
        this.costosOperativos = data.costos_operativos;
      } catch (error) {
        console.error("Error al obtener el reporte:", error);
        this.$bvToast.toast("No se pudo cargar el reporte.", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      } finally {
        this.overlay = false;
      }
    },
  },
  mounted() {
    this.setDefaultDates();
    this.getReport();
  },
};
</script>