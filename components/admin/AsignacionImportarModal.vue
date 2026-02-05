<template>
  <b-modal :id="id" title="Importar Configuración de Producto" size="xl" hide-footer>
    <b-overlay :show="loading" rounded="sm">
      <div v-if="sourceProduct">
        <h4 class="mb-4">Origen: {{ sourceProduct.text }}</h4>

        <b-row>
          <b-col md="6">
            <b-card header="Tiempos de Producción" class="mb-4 shadow-sm">
              <b-table small striped :fields="timeFields" :items="sourceTimes" responsive>
                <template #cell(select)="data">
                  <b-form-checkbox v-model="selectedTimes" :value="data.item.id_tiempos_de_produccion" />
                </template>
                <template #cell(tiempo)="data">
                  {{ (data.item.tiempo / 60).toFixed(1) }} min
                </template>
              </b-table>
              <div v-if="sourceTimes.length === 0" class="text-muted text-center py-2">
                No hay tiempos registrados.
              </div>
            </b-card>
          </b-col>

          <b-col md="6">
            <b-card header="Insumos Asignados" class="mb-4 shadow-sm">
              <b-table small striped :fields="insumoFields" :items="sourceInsumos" responsive>
                <template #cell(select)="data">
                  <b-form-checkbox v-model="selectedInsumos" :value="data.item.id_product_insumos_asignados" />
                </template>
                <template #cell(cantidad)="data">
                  {{ data.item.cantidad }} {{ data.item.unidad }}
                </template>
              </b-table>
              <div v-if="sourceInsumos.length === 0" class="text-muted text-center py-2">
                No hay insumos asignados.
              </div>
            </b-card>
          </b-col>
        </b-row>

        <div class="d-flex justify-content-end mt-4">
          <b-button variant="secondary" @click="$bvModal.hide(id)" class="mr-2">Cancelar</b-button>
          <b-button variant="success" @click="confirmImport" :disabled="!hasSelection">
            Confirmar e Importar
          </b-button>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <b-spinner variant="primary"></b-spinner>
        <p class="mt-2">Cargando datos del producto...</p>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
export default {
  props: {
    id: String,
    sourceProduct: Object,
    destProductId: [String, Number],
    selectedDepartmentId: [String, Number, null],
  },
  data() {
    return {
      loading: false,
      sourceTimes: [],
      sourceInsumos: [],
      selectedTimes: [],
      selectedInsumos: [],
      timeFields: [
        { key: 'select', label: '' },
        { key: 'departamento', label: 'Departamento' },
        { key: 'tiempo', label: 'Tiempo' },
      ],
      insumoFields: [
        { key: 'select', label: '' },
        { key: 'insumo', label: 'Insumo' },
        { key: 'departamento', label: 'Depto' },
        { key: 'talla', label: 'Talla' },
        { key: 'cantidad', label: 'Cant' },
      ],
    };
  },
  computed: {
    hasSelection() {
      return this.selectedTimes.length > 0 || this.selectedInsumos.length > 0;
    },
  },
  watch: {
    sourceProduct: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchSourceData();
        }
      },
    },
  },
  methods: {
    async fetchSourceData() {
      this.loading = true;
      try {
        const [timesRes, insumosRes] = await Promise.all([
          this.$axios.get(`${this.$config.API}/tiempos-de-produccion`),
          this.$axios.get(`${this.$config.API}/insumos-productos-asignados`),
        ]);

        // Filter by product ID
        const sourceId = this.sourceProduct.value || this.sourceProduct.cod;
        
        this.sourceTimes = timesRes.data.filter(t => t.id_product == sourceId);
        this.sourceInsumos = insumosRes.data.filter(i => i.id_product == sourceId);

        // Filter by selected department if applicable
        if (this.selectedDepartmentId) {
          this.sourceTimes = this.sourceTimes.filter(t => t.id_departamento == this.selectedDepartmentId);
          this.sourceInsumos = this.sourceInsumos.filter(i => i.id_departamento == this.selectedDepartmentId);
        }

        // Auto-select all by default
        this.selectedTimes = this.sourceTimes.map(t => t.id_tiempos_de_produccion);
        this.selectedInsumos = this.sourceInsumos.map(i => i.id_product_insumos_asignados);

      } catch (error) {
        console.error("Error fetching source data:", error);
        this.$bvToast.toast("Error al cargar datos del producto origen.", { variant: 'danger' });
      } finally {
        this.loading = false;
      }
    },

    async confirmImport() {
      try {
        await this.$confirm(
          `¿Está seguro de importar los elementos seleccionados al producto actual?`,
          "Confirmar Importación",
          "question"
        );

        this.loading = true;
        let successCount = 0;
        let failCount = 0;

        // Import Tiempos
        for (const timeId of this.selectedTimes) {
          const time = this.sourceTimes.find(t => t.id_tiempos_de_produccion === timeId);
          if (time) {
            const data = new URLSearchParams();
            data.set("id_product", this.destProductId);
            data.set("id_departamento", time.id_departamento);
            data.set("tiempo", time.tiempo);
            try {
              await this.$axios.post(`${this.$config.API}/tiempos-de-produccion`, data);
              successCount++;
            } catch (err) { failCount++; }
          }
        }

        // Import Insumos
        for (const insumoId of this.selectedInsumos) {
          const insumo = this.sourceInsumos.find(i => i.id_product_insumos_asignados === insumoId);
          if (insumo) {
            const data = new URLSearchParams();
            data.set("id_product", this.destProductId);
            data.set("departamento", insumo.id_departamento); // The API expects 'departamento' field name
            data.set("insumo", insumo.id_catalogo_insumos_productos); // The API expects 'insumo' (catalog ID)
            data.set("cantidad", insumo.cantidad);
            data.set("unidad", insumo.unidad);
            data.set("id_size", insumo.id_talla);

            try {
              await this.$axios.post(`${this.$config.API}/insumos-productos`, data);
              successCount++;
            } catch (err) {
              if (err.response && err.response.status === 409) {
                // Ignore conflicts (already exists)
                successCount++;
              } else {
                failCount++;
              }
            }
          }
        }

        this.loading = false;
        if (failCount === 0) {
          this.$fire({ title: "Éxito", text: `Se importaron ${successCount} elementos correctamente.`, type: "success" });
          this.$emit("imported", true);
          this.$bvModal.hide(this.id);
        } else {
          this.$fire({ title: "Importación Parcial", text: `Se importaron ${successCount} elementos, pero ${failCount} fallaron.`, type: "warning" });
          this.$emit("imported", false);
          this.$bvModal.hide(this.id);
        }

      } catch (e) {
        // Canceled or confirmed elsewhere
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>
