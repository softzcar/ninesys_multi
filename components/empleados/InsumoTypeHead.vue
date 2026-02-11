<template>
    <div class="insumo-typeahead">
        <vue-typeahead-bootstrap v-model="query" :data="formattedInsumos" :serializer="serializer" @hit="onHit"
            placeholder="Buscar por SKU, Nombre o ID..." :disabled="disabled">
            <template slot="suggestion" slot-scope="{ data, htmlText }">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                        <span v-html="htmlText"></span>
                        <br />
                        <small class="text-muted">
                            Stock: {{ data.cantidad }} {{ data.unidad }}
                            <span v-if="['Kg', 'Kilos', 'kg', 'kilos'].includes(data.unidad) && data.rendimiento > 0">
                                (~{{ (data.cantidad * data.rendimiento).toFixed(2) }} Mts)
                            </span>
                            | SKU: {{ data.sku || 'Sin SKU' }}
                        </small>
                    </div>
                    <b-badge v-if="data.rollo" variant="info">Rollo: {{ data.rollo }}</b-badge>
                </div>
            </template>
        </vue-typeahead-bootstrap>
    </div>
</template>

<script>
export default {
    props: {
        insumos: {
            type: Array,
            required: true,
            default: () => []
        },
        value: {
            type: [Number, String],
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            query: ''
        }
    },
    computed: {
        formattedInsumos() {
            // Nos aseguramos de incluir campos para búsqueda
            return this.insumos.map(insumo => ({
                ...insumo,
                searchText: `${insumo._id} | ${insumo.sku || ''} | ${insumo.insumo} | ${insumo.rollo || ''}`
            }))
        }
    },
    watch: {
        value: {
            handler(newVal) {
                if (!newVal) {
                    this.query = ''
                    return
                }
                const found = this.insumos.find(i => i._id === newVal)
                if (found) {
                    this.query = this.serializer(found)
                }
            },
            immediate: true
        }
    },
    methods: {
        serializer(insumo) {
            if (!insumo) return ''
            // Formato: ID | SKU | Nombre (Rollo) para permitir búsqueda por cualquier campo
            const skuText = insumo.sku ? ` | SKU: ${insumo.sku}` : ''
            return `${insumo._id}${skuText} | ${insumo.insumo} ${insumo.rollo ? '(Rollo: ' + insumo.rollo + ')' : ''}`
        },
        onHit(insumo) {
            this.$emit('input', insumo._id)
            this.$emit('selected', insumo)
        }
    }
}
</script>

<style scoped>
.insumo-typeahead {
    width: 100%;
}
</style>
