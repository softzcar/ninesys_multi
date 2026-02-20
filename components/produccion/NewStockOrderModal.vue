<template>
  <b-modal
    id="new-stock-order-modal"
    title="Crear Orden de Stock (Productos Nuevos)"
    v-model="localShow"
    @ok="handleOk"
    @hidden="resetModal"
    ok-title="Crear Orden"
    cancel-title="Cancelar"
    size="xl"
  >
    <p class="text-muted">
      Estás creando una nueva orden interna vinculada a la Orden #{{ idOrdenOriginal }}.
      Agrega aquí los productos <b>diferentes</b> que aprovecharán el corte.
    </p>

    <b-form @submit.stop.prevent="handleSubmit">
      <div v-for="(item, index) in items" :key="index" class="mb-3 p-3 bg-light rounded relative border">
        <b-button 
            variant="danger" 
            size="sm" 
            class="eliminate-btn" 
            @click="removeItem(index)"
            v-if="items.length > 1"
        >
            X
        </b-button>
        
        <b-row align-v="center">
            <b-col md="4">
                <b-form-group label="Producto" label-size="sm" class="mb-1">
                    <vue-typeahead-bootstrap
                        class="w-100"
                        v-model="item.query"
                        :data="productsSelect"
                        :serializer="s => s"
                        placeholder="Buscar producto..."
                        @hit="loadProduct($event, item)"
                        showOnFocus
                    />
                </b-form-group>
                <small v-if="item.producto" class="text-success">
                    Seleccionado: <strong>{{ item.producto }}</strong> (Stock: {{ item.existencia }})
                </small>
            </b-col>
            
            <b-col md="2">
                <b-form-group label="Talla" label-size="sm" class="mb-1">
                     <b-form-select 
                        v-model="item.id_talla" 
                        :options="tallasOptions"
                        size="sm"
                        @change="updateTallaName(item)"
                     ></b-form-select>
                </b-form-group>
            </b-col>

            <b-col md="2">
                <b-form-group label="Corte" label-size="sm" class="mb-1">
                     <b-form-select v-model="item.corte" :options="cortesOptions" size="sm"></b-form-select>
                </b-form-group>
            </b-col>

            <b-col md="2">
                <b-form-group label="Cantidad" label-size="sm" class="mb-1">
                    <b-form-input
                        v-model.number="item.cantidad"
                        type="number"
                        min="1"
                        required
                    ></b-form-input>
                </b-form-group>
            </b-col>
            
            <b-col md="2" class="text-center">
                <label class="d-block small text-muted mb-1">Extras</label>
                <OrdenesAsignacionAtributos
                    :product="item"
                    :attributes="productAttributes"
                    :productIndex="index"
                    @attributes-updated="handleAttributesUpdate"
                    @reload="loadProductAttributes"
                />
            </b-col>
        </b-row>
        
        <b-row class="mt-2" align-v="center">
             <b-col md="6">
                <b-form-group label="Tela" label-size="sm" class="mb-0">
                    <b-form-select 
                        v-model="item.id_tela" 
                        :options="telasOptions"
                        size="sm"
                        @change="updateTelaName(item)"
                    ></b-form-select>
                </b-form-group>
             </b-col>
             <b-col md="6" class="text-right">
                <span class="text-muted small mr-2">Precio Base:</span>
                <strong>${{ item.precio || 0 }}</strong>
             </b-col>
        </b-row>
      </div>

      <b-button variant="outline-primary" size="sm" @click="addItem" class="mt-2">
        + Agregar otro producto
      </b-button>
    </b-form>
    
    <style>
        .eliminate-btn {
            position: absolute;
            top: -10px;
            right: -10px;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            padding: 0;
            line-height: 20px;
            z-index: 10;
        }
        .relative {
            position: relative;
        }
    </style>
  </b-modal>
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
import OrdenesAsignacionAtributos from '~/components/ordenes/AsignacionAtributos.vue'

export default {
  components: {
    VueTypeaheadBootstrap,
    OrdenesAsignacionAtributos
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    idOrdenOriginal: {
      type: Number,
      required: true,
    },
    tela: {
        type: String,
        default: 'General'
    }
  },
  data() {
    return {
      localShow: this.show,
      items: [],
      cortesOptions: [
        { value: "No aplica", text: "No aplica" },
        { value: "Damas", text: "Damas" },
        { value: "Caballeros", text: "Caballeros" },
        { value: "Niños", text: "Niños" },
      ],
      products: [], // Raw products
      productsSelect: [], // Formatted for typeahead
      productAttributes: [],
      telasOptions: [],
      tallasOptions: [],
    };
  },
  watch: {
    show(val) {
      this.localShow = val;
      if (val) {
          if (this.items.length === 0) this.addItem();
          this.loadData();
      }
    },
    localShow(val) {
      this.$emit('update:show', val);
    }
  },
  mounted() {
      // Preload data if needed, or wait for show
      this.loadData();
  },
  methods: {
    async loadData() {
        await Promise.all([
            this.getProducts(),
            this.loadProductAttributes(),
            this.loadTelas(),
            this.loadTallas()
        ]);
        
        // Initialize default tela if empty and options are loaded
        this.items.forEach(item => {
            if (!item.id_tela) {
               // Try to match the prop 'tela' with loaded options
               // Normalize for comparison
               const match = this.telasOptions.find(t => t.text.toLowerCase() === this.tela.toLowerCase());
               if (match) {
                   item.id_tela = match.value;
                   item.tela = match.text;
               }
            }
        });
    },

    async getProducts() {
      try {
          const res = await this.$axios.get(`${this.$config.API}/products`, {
            headers: { Authorization: this.$store.state.login.dataEmpresa.id }
          });
          this.products = res.data;
          this.productsSelect = res.data.map(p => `${p.cod} | ${p.name}`);
      } catch (e) {
          console.error("Error loading products", e);
      }
    },

    async loadProductAttributes() {
      try {
          const res = await this.$axios.get(`${this.$config.API}/products-attributes`);
          this.productAttributes = res.data.data.map(item => ({
             value: item._id, 
             _id: item._id,
             name: item.name,
             precio: item.precio,
             text: `${item.name} ($${item.precio})` 
          }));
      } catch (e) {
          console.error("Error loading attributes", e);
      }
    },

    async loadTelas() {
        try {
            const res = await this.$axios.get(`${this.$config.API}/telas`);
             this.telasOptions = res.data.data.map(item => ({
                value: item._id,
                text: item.tela
            }));
        } catch (e) {
            console.error("Error loading telas", e);
        }
    },

    async loadTallas() {
        try {
            const res = await this.$axios.get(`${this.$config.API}/sizes`);
            const data = res.data.data || res.data;
            this.tallasOptions = data.map(item => ({
                value: item._id,
                text: item.name
            }));
        } catch (e) {
            console.error("Error loading tallas", e);
        }
    },

    loadProduct(val, item) {
        if (!val) return;
        const cod = val.split(' | ')[0];
        const product = this.products.find(p => p.cod == cod);
        
        if (product) {
            item.cod = product.cod;
            item.producto = product.name;
            item.product_name = product.name;
            item.existencia = product.stock_quantity;
            item.precio = product.price;
            item.id_woo = product._id;
            item.atributos_seleccionados = []; // Reset attributes on product change
        }
    },

    updateTelaName(item) {
        const option = this.telasOptions.find(o => o.value === item.id_tela);
        if (option) item.tela = option.text;
    },

    updateTallaName(item) {
        const option = this.tallasOptions.find(o => o.value === item.id_talla);
        if (option) item.talla = option.text;
    },

    handleAttributesUpdate({ productIndex, selectedAttributes }) {
        this.$set(this.items[productIndex], 'atributos_seleccionados', selectedAttributes);
    },

    addItem() {
      // Find default tela ID if possible
      let defaultTelaId = null;
      let defaultTelaText = this.tela;
      
      if (this.telasOptions.length > 0) {
          const match = this.telasOptions.find(t => t.text.toLowerCase() === this.tela.toLowerCase());
          if (match) {
              defaultTelaId = match.value;
              defaultTelaText = match.text;
          }
      }

      this.items.push({ 
          query: '',
          cod: null,
          producto: '',
          id_talla: null,
          talla: '', 
          corte: 'No aplica', 
          cantidad: 1, 
          id_tela: defaultTelaId,
          tela: defaultTelaText,
          atributos_seleccionados: [],
          precio: 0,
          existencia: 0
      });
    },

    removeItem(index) {
        this.items.splice(index, 1);
    },
    
    resetModal() {
      this.items = [];
      this.addItem();
    },
    
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    
    async handleSubmit() {
        // Validar
        const isValid = this.items.every(item => item.cod && item.cantidad > 0 && item.id_talla);
        if (!isValid) {
            this.$toast.error('Por favor completa todos los campos (Producto, Talla, Cantidad > 0).');
            return;
        }

        const payload = {
            id_orden_original: this.idOrdenOriginal,
            items: this.items,
            id_empleado: this.$store.state.login.dataUser ? this.$store.state.login.dataUser.id_usuario : this.$store.state.login.data.id
        };

        try {
            this.$overlay = true; 
            const response = await this.$axios.post(`${this.$config.API}/production/corte/crear-orden-stock-manual`, payload, {
                headers: { Authorization: this.$store.state.login.dataEmpresa.id } 
            });

            if (response.data.status === 'success') {
                await this.$fire({
                    title: "¡Éxito!",
                    type: "success",
                    html: `<p>Orden de Stock enviada para aprobación. Ha sido guardada correctamente.</p>`,
                });
                this.$emit('success');
                this.localShow = false;
            } else {
                this.$fire({
                    title: "Error",
                    type: "error",
                    html: `<p>Error al crear orden: ${response.data.message || 'Desconocido'}</p>`,
                });
            }

        } catch (error) {
            console.error(error);
            this.$fire({
                title: "Error",
                type: "error",
                html: `<p>Error de conexión o servidor al crear orden de stock.</p>`,
            });
        } finally {
            this.$overlay = false;
        }
    },
  },
};
</script>
