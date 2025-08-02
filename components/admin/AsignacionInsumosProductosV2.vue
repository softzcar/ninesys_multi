<template>
  <b-container fluid>
    <b-overlay :show="loading" rounded="sm">
      <h2 class="mb-4">Asignación de insumos a productos</h2>

      <b-row class="mb-3 align-items-end">
        <b-col md="6">
          <b-form-group label="Buscar producto:" label-for="filter-input">
            <b-input-group>
              <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                placeholder="Escriba para buscar..."
              ></b-form-input>
              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">Limpiar</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6">
          <b-form-group label="Filtrar por departamento:">
            <b-form-radio-group
                v-model="selectedDepartment"
                :options="departmentOptions"
                button-variant="outline-primary"
                name="radio-btn-outline"
                buttons
            ></b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-row>

      <b-table
        :key="tableKey"
        :items="filteredProducts"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        striped
        hover
        responsive
        show-empty
        empty-text="No hay productos para mostrar."
        @filtered="onFiltered"
      >
        <template #cell(asignacion)="row">
          <admin-AsignacionDeInsumosAProductos
            :item="row.item"
            :departamentos="departamentos"
            :selectinsumos="selectInsumos"
            :insumosasignados="insumosAsignados"
            :tiemposprod="tiemposProduccion"
            :selected-department="selectedDepartment"
            @reload="fetchData"
          />
        </template>
      </b-table>

      <b-pagination
        v-if="totalRows > perPage"
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        aria-controls="my-table"
        align="center"
      ></b-pagination>
    </b-overlay>
  </b-container>
</template>

<script>
export default {
  name: "AsignacionInsumosProductosV2",
  data() {
    return {
      loading: true,
      tableKey: 0,
      products: [],
      departamentos: [],
      tiemposProduccion: [],
      insumosAsignados: [],
      selectInsumos: [],
      filter: "",
      selectedDepartment: null,
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [
          productsRes,
          depsRes,
          tiemposProdRes,
          insumosAsignadosRes,
          catalogoInsumosRes,
        ] = await Promise.all([
          this.$axios.get(`${this.$config.API}/products`),
          this.$axios.get(`${this.$config.API}/departamentos`),
          this.$axios.get(`${this.$config.API}/tiempos-de-produccion`),
          this.$axios.get(`${this.$config.API}/insumos-productos-asignados`),
          this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`),
        ]);

        this.products = productsRes.data;
        this.totalRows = this.products.length;
        this.departamentos = depsRes.data;
        this.tiemposProduccion = tiemposProdRes.data;
        this.insumosAsignados = insumosAsignadosRes.data;
        this.selectInsumos = this.formatInsumosForSelect(
          catalogoInsumosRes.data
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        this.$bvToast.toast("Error al cargar los datos. " + error.message, {
          variant: "danger",
        });
      } finally {
        this.loading = false;
      }
    },
    formatInsumosForSelect(insumos) {
      const options = insumos.map((insumo) => ({
        value: insumo._id,
        text: insumo.nombre,
      }));
      options.unshift({ value: null, text: "Seleccione un insumo" });
      return options;
    },
    getTiempo(product, depId) {
      const tiempos = this.tiemposProduccion.filter(
        (t) => t.id_product === product.cod && t.id_departamento === depId
      );
      const totalSegundos = tiempos.reduce(
        (acc, t) => acc + parseInt(t.tiempo || 0),
        0
      );

      if (totalSegundos > 0) {
        const minutos = totalSegundos / 60;
        return `${minutos.toFixed(1)} min`;
      }
      return "0 min";
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
  computed: {
    departmentOptions() {
      const options = this.departamentosConPaso.map(dep => ({
        text: dep.departamento,
        value: dep._id,
      }));
      options.unshift({ text: 'Todos', value: null });
      return options;
    },
    departamentosConPaso() {
      return this.departamentos.filter((d) => d.asignar_numero_de_paso > 0);
    },
    fields() {
      let dynamicFields = [];
      const departmentsToDisplay = this.selectedDepartment
        ? this.departamentosConPaso.filter(d => d._id === this.selectedDepartment)
        : this.departamentosConPaso;

      dynamicFields = departmentsToDisplay.map((dep) => ({
        key: dep._id.toString(),
        label: dep.departamento,
        sortable: true,
        class: "text-center",
      }));

      return [
        { key: "name", label: "Producto", sortable: true },
        ...dynamicFields,
        { key: "asignacion", label: "Asignación", class: "text-center" },
      ];
    },
    productsWithDepartmentData() {
      return this.products.map(product => {
        const productData = { ...product };
        this.departamentosConPaso.forEach(dep => {
          productData[dep._id.toString()] = this.getTiempo(product, dep._id);
        });
        return productData;
      });
    },
    filteredProducts() {
      const sourceData = this.productsWithDepartmentData;
      if (!this.filter) {
        this.totalRows = sourceData.length;
        return sourceData;
      }
      const lowerFilter = this.filter.toLowerCase();
      const filtered = sourceData.filter((p) =>
        p.name.toLowerCase().includes(lowerFilter)
      );
      this.totalRows = filtered.length;
      return filtered;
    },
  },
};
</script>

<style scoped>
/* Agrega aquí cualquier estilo específico que necesites para el nuevo componente */
</style>
