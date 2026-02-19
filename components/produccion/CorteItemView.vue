<template>
  <div>
    <!-- Modo Embedded -->
    <div v-if="embedded" class="mt-3">
        <b-overlay :show="loading" spinner-small>
            <div v-if="loading" class="text-center text-muted py-3">
                <b-spinner small></b-spinner> Cargando detalles...
            </div>
            <div v-else-if="productos.length === 0" class="text-center text-muted py-3">
                <b-icon icon="info-circle"></b-icon> No se encontraron productos para cortar en esta orden.
            </div>
            <div v-else>
                 <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Ajuste de Corte - Orden #{{ idOrden }}</h6>
                    <b-button size="sm" variant="primary" @click="guardarAjuste" :disabled="loading">
                        <b-icon icon="save"></b-icon> Guardar Cambios
                    </b-button>
                 </div>

                 <b-table-simple hover small responsive bordered class="mb-0">
                    <b-thead head-variant="light">
                        <b-tr>
                            <b-th>Producto</b-th>
                            <b-th class="text-center">Talla</b-th>
                            <b-th class="text-center">Solicitado</b-th>
                            <b-th class="text-center">Avance</b-th>
                            <b-th class="text-center" style="width: 120px;">Cortado</b-th>
                            <b-th class="text-center">Dif.</b-th>
                        </b-tr>
                    </b-thead>
                    <b-tbody>
                        <b-tr v-for="(prod, index) in productos" :key="prod.id_ordenes_productos">
                            <b-td>
                                <strong>{{ prod.name }}</strong><br>
                                <small class="text-muted">{{ prod.tela }}</small>
                            </b-td>
                            <b-td class="text-center">{{ prod.talla }}</b-td>
                            <b-td class="text-center">{{ prod.cantidad }}</b-td>
                            <b-td class="text-center">
                                <span :class="{'text-success': prod.cantidad_avance >= prod.cantidad, 'text-muted': prod.cantidad_avance === 0}">
                                    {{ prod.cantidad_avance }}
                                </span>
                            </b-td>
                            <b-td>
                                <b-form-input 
                                    type="number" 
                                    v-model.number="prod.cantidad_cortada" 
                                    min="0" 
                                    size="sm"
                                    :state="prod.cantidad_cortada >= prod.cantidad"
                                ></b-form-input>
                            </b-td>
                            <b-td class="text-center">
                                <span v-if="prod.cantidad_cortada > prod.cantidad" class="text-success font-weight-bold">
                                    +{{ prod.cantidad_cortada - prod.cantidad }}
                                </span>
                                <span v-else-if="prod.cantidad_cortada < prod.cantidad" class="text-danger font-weight-bold">
                                    {{ prod.cantidad_cortada - prod.cantidad }}
                                </span>
                                <span v-else class="text-muted">-</span>
                            </b-td>
                        </b-tr>
                    </b-tbody>
                </b-table-simple>
                
                <div v-if="hayExcedentes" class="mt-2 text-right">
                    <span class="text-success small font-weight-bold">
                        <b-icon icon="info-circle"></b-icon> {{ totalExcedentes }} excedentes detectados
                    </span>
                </div>
            </div>
        </b-overlay>
    </div>

    <!-- Modo Botón + Modal (Original) - Solo se muestra si NO está en modo embedded, aunque ahora parece que embedded será el principal -->
    <div v-else class="d-inline-flex align-items-center">
        <!-- ... (código existente) ... -->
        <!-- NOTA: Si este componente se usa fuera de embedded, deberíamos replicar la lógica. 
             Por ahora asumimos que la vista principal es embedded. -->
         <linkSearch :id="idOrden" />
         <!-- ... -->
    </div>

    <!-- New Stock Order Modal -->
    <NewStockOrderModal 
        :idOrdenOriginal="parseInt(idOrden)" 
        :tela="telaPrincipal"
        :show.sync="showStockModal"
    />

  </div>
</template>

<script>
import NewStockOrderModal from '~/components/produccion/NewStockOrderModal.vue';

export default {
  name: 'CorteItemView',
  components: { NewStockOrderModal },
  props: {
    idOrden: {
      type: [Number, String],
      required: true
    },
    initialItems: {
        type: Array,
        default: () => []
    },
    embedded: {
        type: Boolean,
        default: false
    }
  },
  mounted() {
    if (this.embedded) {
        this.fetchDetallesOrden()
    }
  },
  data() {
    return {
      productos: [],
      loading: false,
      showStockModal: false,
      modalId: `modal-ajuste-corte-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  computed: {
    hayExcedentes() {
        return this.productos.some(p => p.cantidad_cortada > p.cantidad)
    },
    totalExcedentes() {
        return this.productos.reduce((acc, p) => {
            const surplus = Math.max(0, p.cantidad_cortada - p.cantidad)
            return acc + surplus
        }, 0)
    },
    telaPrincipal() {
        // Retorna la tela del primer producto o 'General'
        if (this.productos.length > 0) return this.productos[0].tela;
        return 'General';
    }
  },
  methods: {
    async fetchDetallesOrden() {
        try {
            const res = await this.$axios.get(`${this.$config.API}/production/corte/orden-detalles/${this.idOrden}`)
            if (res.data && res.data.productos) {
                this.productos = res.data.productos.map(p => {
                    const cantidadDb = p.cantidad_cortada ? parseFloat(p.cantidad_cortada) : 0;
                    const cantidadSol = parseFloat(p.cantidad);
                    return {
                        ...p,
                        cantidad: cantidadSol,
                        cantidad_avance: cantidadDb,
                        cantidad_cortada: cantidadDb > 0 ? cantidadDb : cantidadSol,
                        id_ordenes_productos: p._id 
                    }
                })
            } else {
                this.productos = []
            }
        } catch (e) {
            console.error('Error cargando productos de orden:', e)
        }
    },

    async guardarAjuste() {
        this.loading = true
        try {
            const promesas = this.productos.map(p => {
                return this.$axios.post(`${this.$config.API}/production/corte/ajuste`, {
                    id_orden: this.idOrden,
                    id_ordenes_productos: p.id_ordenes_productos,
                    cantidad_solicitada: p.cantidad,
                    cantidad_ajustada: p.cantidad_cortada,
                    id_empleado_ajuste: this.$store.state.login.dataUser.id_empleado
                })
            })
            
            await Promise.all(promesas)
            
            this.$bvToast.toast('Ajustes guardados correctamente', {
                variant: 'success',
                solid: true
            })
            
            // Smart Save Logic
            if (this.hayExcedentes) {
                const confirm = await this.$bvModal.msgBoxConfirm(`Se detectaron ${this.totalExcedentes} piezas excedentes.\n¿Desea crear una orden interna con productos ADICIONALES para aprovechar el corte?`, {
                    title: 'Excedentes Detectados',
                    okTitle: 'SÍ, Agregar productos',
                    cancelTitle: 'NO, solo guardar',
                    okVariant: 'success',
                    cancelVariant: 'secondary',
                    centered: true
                })

                if (confirm) {
                    this.showStockModal = true
                }
            }

        } catch (e) {
             console.error('Error guardando ajustes:', e)
             this.$bvToast.toast('Error al guardar ajustes', { variant: 'danger' })
        } finally {
            this.loading = false
        }
    }
  }
}
</script>

<style scoped>
</style>
