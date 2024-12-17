<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <!-- <pre class="force">
               DATA {{ $data }}
            </pre>
            <pre class="force">
               PROPS {{ $props }}
            </pre> -->
            <div class="mb-2">
                <b-form-select :disabled="selectDisabled" v-model="emp" :options="options" :value="emp"
                    @change="sendIdEmpleado"></b-form-select>
            </div>

            <div class="mb-4">
                <b-button :disabled="selectDisabled" variant="success" @click="saveChange(idorden, emp)" size="lg">
                    Guardar
                </b-button>
                <hr class="mt-4" />
            </div>
        </b-overlay>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectDisabled: true,
            overlay: false,
            emp: null,
            disenosAsignados: [],
        }
    },



    computed: {
        /* productsOptions() {
            let prods = []
            prods = this.$store.state.disenos.disenos.productos.map((el) => {
                return {
                    value: el.id_producto,
                    text: `${el.product}`,
                }
            })

            prods.unshift({
                value: null,
                text: "Seleccione un tipo de diseño",
            })
            return prods
        }, */
    },

    methods: {
        sendIdEmpleado() {
            this.$emit("reload", this.emp)
        },

        empleadoSelected() {
            return this.empleado
        },

        saveChange(id_orden, emp) {
            this.overlay = true

            let ok = true
            let msg = ""

            if (this.emp === null) {
                ok = false
                msg += "<p>Seleccione un diseñador</p>"
            }

            if (ok) {
                this.putDisenador(this.item.idorden, this.emp).then(() => {
                    this.overlay = false
                })
            } else {
                this.$fire({
                    title: "Datos requeridos",
                    html: msg,
                    type: "warning",
                })
            }
            this.overlay = false
        },

        async putDisenador(id_orden, empleado, tipo_diseno) {
            this.loading = true
            await this.$axios(
                `${this.$config.API}/disenos/asign/${id_orden}/${empleado}`,
                {
                    method: "PUT",
                }
            )
                .then((res) => {
                    this.$store.dispatch("disenos/getDisenos")
                    this.$fire({
                        title: "Asignado",
                        html: "El diseñador ha sido asignado correctamente",
                        type: "success",
                    }).then(() => {
                        this.$emit("closemodal")
                    })
                    return true
                })
                .catch((err) => {
                    this.$store.dispatch("disenos/getDisenos")
                    this.$fire({
                        title: "No asignado",
                        html: `<p>Ocurrió un error ala signar el diseñaador</p><p>${err}</p>`,
                        type: "danger",
                    })
                    return false
                })
                .finally(() => {
                    this.loading = false
                })
        },
    },

    mounted() {
        this.emp = this.item.select
        if (this.emp === null) {
            this.selectDisabled = false
        } else {
            this.selectDisabled = true
        }
    },

    props: ["item", "options", "hashtags", "idempleado", "closemodal"],
}
</script>
