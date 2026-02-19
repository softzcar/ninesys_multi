<template>
  <b-modal
    id="new-stock-order-modal"
    title="Crear Orden de Stock (Productos Nuevos)"
    v-model="localShow"
    @ok="handleOk"
    @hidden="resetModal"
    ok-title="Crear Orden"
    cancel-title="Cancelar"
    size="lg"
  >
    <p class="text-muted">
      Estás creando una nueva orden interna vinculada a la Orden #{{ idOrdenOriginal }}.
      Agrega aquí los productos <b>diferentes</b> que aprovecharán el corte.
    </p>

    <b-form @submit.stop.prevent="handleSubmit">
      <div v-for="(item, index) in items" :key="index" class="mb-3 p-3 bg-light rounded relative">
        <b-button 
            variant="danger" 
            size="sm" 
            class="eliminate-btn" 
            @click="removeItem(index)"
            v-if="items.length > 1"
        >
            X
        </b-button>
        
        <b-row>
            <b-col md="4">
                <b-form-group label="Producto" label-size="sm">
                    <b-form-input
                        v-model="item.product_name"
                        placeholder="Ej: Short, Franela..."
                        required
                    ></b-form-input>
                </b-form-group>
            </b-col>
            <b-col md="2">
                <b-form-group label="Talla" label-size="sm">
                    <b-form-input
                        v-model="item.talla"
                        placeholder="S, M, L..."
                        required
                    ></b-form-input>
                </b-form-group>
            </b-col>
            <b-col md="3">
                <b-form-group label="Género/Corte" label-size="sm">
                     <b-form-select v-model="item.genero" :options="generoOptions"></b-form-select>
                </b-form-group>
            </b-col>
            <b-col md="3">
                <b-form-group label="Cantidad" label-size="sm">
                    <b-form-input
                        v-model.number="item.cantidad"
                        type="number"
                        min="1"
                        required
                    ></b-form-input>
                </b-form-group>
            </b-col>
        </b-row>
        <b-row>
             <b-col md="12">
                <small class="text-muted">Tela: <strong>{{ tela }}</strong> (Heredada)</small>
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
export default {
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
      items: [
        { product_name: '', talla: '', genero: 'Unisex', cantidad: 1, tela: this.tela }
      ],
      generoOptions: [
          { value: 'Dama', text: 'Dama' },
          { value: 'Caballero', text: 'Caballero' },
          { value: 'Unisex', text: 'Unisex' },
          { value: 'Niño', text: 'Niño' },
          { value: 'Niña', text: 'Niña' }
      ]
    };
  },
  watch: {
    show(val) {
      this.localShow = val;
    },
    localShow(val) {
      this.$emit('update:show', val);
    }
  },
  methods: {
    addItem() {
      this.items.push({ product_name: '', talla: '', genero: 'Unisex', cantidad: 1, tela: this.tela });
    },
    removeItem(index) {
        this.items.splice(index, 1);
    },
    resetModal() {
      this.items = [{ product_name: '', talla: '', genero: 'Unisex', cantidad: 1, tela: this.tela }];
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    async handleSubmit() {
        // Validar
        const isValid = this.items.every(item => item.product_name && item.talla && item.cantidad > 0);
        if (!isValid) {
            this.$toast.error('Por favor completa todos los campos requeridos.');
            return;
        }

        const payload = {
            id_orden_original: this.idOrdenOriginal,
            items: this.items
        };

        try {
            this.$overlay = true; // Si hay overlay global, o usar variable local loading
            const response = await this.$axios.post(`${this.$config.API}/production/corte/crear-orden-stock-manual`, payload, {
                headers: { Authorization: `Bearer ${this.$store.state.login.token}` } // Asumiendo auth store
            });

            if (response.data.status === 'success') {
                this.$toast.success(`Orden de Stock #${response.data.id_new_order} creada correctamente.`);
                this.$emit('success');
                this.localShow = false;
            } else {
                 this.$toast.error('Error al crear orden: ' + (response.data.message || 'Desconocido'));
            }

        } catch (error) {
            console.error(error);
            this.$toast.error('Error de conexión o servidor al crear orden de stock.');
        } finally {
            this.$overlay = false;
        }
    },
  },
};
</script>
