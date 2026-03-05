<template>
  <b-modal
    id="product-selector-modal"
    title="Explorar Catálogo de Productos"
    size="xl"
    hide-footer
    @shown="onModalShown"
  >
    <!-- Header with Filters -->
    <div class="mb-4">
      <b-row class="mb-3">
        <b-col md="6">
          <b-input-group size="lg">
            <b-input-group-prepend is-text>
              <b-icon icon="search"></b-icon>
            </b-input-group-prepend>
            <b-form-input
              v-model="searchQuery"
              placeholder="Buscar por Nombre o SKU..."
              @input="filterProducts"
            ></b-form-input>
          </b-input-group>
        </b-col>
        <b-col md="6">
          <b-form-group>
            <b-form-select
              v-model="selectedCategory"
              :options="categoryOptions"
              @change="filterProducts"
              size="lg"
            >
              <template #first>
                <b-form-select-option :value="null">Todas las Categorías</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      
      <b-row>
        <b-col class="d-flex flex-wrap gap-3" style="gap: 1.5rem;">
          <b-form-checkbox v-model="filters.inStock" :disabled="preferStoreMode" switch size="lg" @change="filterProducts">
            <strong>Solo con Stock (Tienda)</strong>
          </b-form-checkbox>
          <b-form-checkbox v-model="filters.isPhysical" switch size="lg" @change="filterProducts">
            <strong>Producto Físico</strong>
          </b-form-checkbox>
          <b-form-checkbox v-model="filters.isDesign" switch size="lg" @change="filterProducts">
            <strong>Departamento Diseño</strong>
          </b-form-checkbox>
        </b-col>
      </b-row>
    </div>

    <!-- Data Table -->
    <b-overlay :show="isLoading" rounded="sm">
      <b-table
        striped
        hover
        responsive
        :items="filteredProducts"
        :fields="fields"
        :per-page="perPage"
        :current-page="currentPage"
        show-empty
        empty-text="No se encontraron productos que coincidan con los filtros."
        class="mb-3"
      >
        <template #cell(stock_quantity)="data">
          <b-badge :variant="data.item.stock_quantity > 0 ? 'success' : 'danger'">
            {{ data.item.stock_quantity }}
          </b-badge>
        </template>
        
        <template #cell(categories)="data">
          <!-- Mostrar nombres de categorias concatenadas si es un array -->
          <span v-if="Array.isArray(data.item.categories)">
            {{ data.item.categories.map(c => c.name).join(', ') }}
          </span>
          <span v-else class="text-muted">N/A</span>
        </template>
        
        <template #cell(fisico)="data">
          <b-badge :variant="data.item.producto_fisico ? 'primary' : 'secondary'">
            {{ data.item.producto_fisico ? 'Sí' : 'No' }}
          </b-badge>
        </template>

        <template #cell(diseno)="data">
          <b-badge :variant="data.item.es_diseno ? 'info' : 'secondary'">
            {{ data.item.es_diseno ? 'Sí' : 'No' }}
          </b-badge>
        </template>

        <template #cell(actions)="data">
          <b-button size="sm" variant="primary" @click="selectProduct(data.item)">
            <b-icon icon="check2-circle" class="mr-1"></b-icon> Seleccionar
          </b-button>
        </template>
      </b-table>

      <!-- Pagination Controls -->
      <div v-if="filteredProducts.length > perPage" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted">Mostrando {{ filteredProducts.length }} productos</span>
        <b-pagination
          v-model="currentPage"
          :total-rows="filteredProducts.length"
          :per-page="perPage"
          aria-controls="my-table"
          class="mb-0"
        ></b-pagination>
      </div>
    </b-overlay>
  </b-modal>
</template>

<script>
export default {
  name: 'ProductSelectorModal',
  props: {
    // Para pre-marcar "Solo con stock" si el switch exterior estaba en Tienda
    preferStoreMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: null,
      filters: {
        inStock: false,
        isPhysical: false,
        isDesign: false
      },
      isLoading: false,
      filteredProducts: [],
      currentPage: 1,
      perPage: 10,
      fields: [
        { key: 'cod', label: 'ID', sortable: true },
        { key: 'sku', label: 'SKU', sortable: true },
        { key: 'name', label: 'Nombre', sortable: true, thClass: 'w-25' },
        { key: 'stock_quantity', label: 'Stock', sortable: true, class: 'text-center' },
        { key: 'categories', label: 'Categorías' },
        { key: 'fisico', label: 'Físico', class: 'text-center' },
        { key: 'diseno', label: 'Diseño', class: 'text-center' },
        { key: 'actions', label: 'Acción', class: 'text-center' }
      ]
    }
  },
  computed: {
    allProducts() {
      // Obtenemos directamente la lista completa de nuestro store local
      return this.$store.state.comerce.dataProductos || [];
    },
    categoryOptions() {
      // Extraer categorias unicas de los productos locales para no depender de llamadas externas innecesarias si es posible
      const categoriesSet = new Map();
      this.allProducts.forEach(prod => {
        if (Array.isArray(prod.categories)) {
          prod.categories.forEach(cat => {
            if (cat && cat.id) {
              categoriesSet.set(cat.id, cat.name);
            }
          });
        }
      });
      
      const options = [];
      categoriesSet.forEach((name, id) => {
        options.push({ value: id, text: name });
      });
      // Sort alphabetic
      return options.sort((a, b) => a.text.localeCompare(b.text));
    }
  },
  methods: {
    show() {
      this.$bvModal.show('product-selector-modal');
    },
    hide() {
       this.$bvModal.hide('product-selector-modal');
    },
    onModalShown() {
      // Sincronizar el filtro de stock con la prop del componente padre si deseado
      if (this.preferStoreMode) {
        this.filters.inStock = true;
      }
      
      // Limpiar texto de busqueda al abrir
      this.searchQuery = '';
      this.currentPage = 1;
      
      this.filterProducts();
    },
    
    filterProducts() {
      this.isLoading = true;
      
      // Simular un poquitico de latencia para UX e impedir locks
      setTimeout(() => {
        let result = this.allProducts;
        
        // 1. Filtro por Stock
        if (this.filters.inStock) {
          result = result.filter(p => parseInt(p.stock_quantity) > 0);
        }
        
        // 2. Filtro por producto fisico
        if (this.filters.isPhysical) {
          // Asumimos booleano o 1/0
          result = result.filter(p => p.producto_fisico === true || p.producto_fisico === 1);
        }
        
        // 3. Filtro por diseño
        if (this.filters.isDesign) {
           result = result.filter(p => p.es_diseno === true || p.es_diseno === 1);
        }
        
        // 4. Filtro por categoría
        if (this.selectedCategory) {
          result = result.filter(p => {
             if (!Array.isArray(p.categories)) return false;
             return p.categories.some(c => c.id === this.selectedCategory);
          });
        }
        
        // 5. Búsqueda por texto (Nombre o SKU)
        if (this.searchQuery.trim() !== '') {
          const query = this.searchQuery.toLowerCase();
          result = result.filter(p => {
            const nameMatch = p.name && p.name.toLowerCase().includes(query);
            const skuMatch = p.sku && p.sku.toLowerCase().includes(query);
            const idMatch = p.cod && p.cod.toString().includes(query);
            return nameMatch || skuMatch || idMatch;
          });
        }
        
        this.filteredProducts = result;
        this.currentPage = 1; // Volver a pagina 1 siempre que cambian filtros
        this.isLoading = false;
      }, 100);
    },
    
    selectProduct(product) {
      // Emitir el evento con el item completo tal cual form.productos lo espera, o delegar al padre construir el item.
      // El typeahead en el componente padre emite un string "ID | Nombre", pero es mas limpio pasar el objeto.
      // Emiitemos el string compatible temporalmente asi reutilizamos logica o pasamos objeto y adaptamos el padre.
      this.$emit('product-selected', product);
      this.hide();
    }
  }
}
</script>

<style scoped>
/* Optional modern styling */
.badge {
  font-size: 0.85em;
  padding: 0.4em 0.6em;
}
</style>
