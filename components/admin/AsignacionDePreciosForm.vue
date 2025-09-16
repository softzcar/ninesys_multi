<template>
    <div>
        <b-overlay :show="overlay" spinner-small>

            <div class="mb-2" v-if="asignado">
                <b-alert variant="info" show>Precio Asignado {{ price }}</b-alert>
            </div>
            <div class="mb-2">
                <label for="input-precio">Precio </label>
                <b-form-input id="input-precio" style="width: 100px" type="number" min="0" step="0.10" v-model="price"
                    :disabled="inputDisabled" />

                <label for="input-descripción">Descripción </label>
                <b-form-input id="input-descripción" style="width: 100px" type="text" v-model="descripcion"
                    :disabled="inputDisabled" />

                <!-- <b-form-select :disabled="selectDisabled" v-model="emp" :options="options" :value="emp"
                    @change="sendIdEmpleado"></b-form-select> -->
            </div>

            <div class="mb-4">
                <b-button :disabled="inputDisabled" variant="success" @click="saveChange()" size="lg">
                    Asignar
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
            asignado: false,
            price: 0,
            descripcion: '',
            inputDisabled: false,
            overlay: false,
        }
    },

    computed: {
        dataSave() {
            return {
                id: this.item.id,
                item: this.item,
                price: this.price,
                descripcion: this.descripcion
            }
        }
    },

    methods: {
        asignarPrecio() {
            this.asignado = true
        },

        saveChange() {
            this.overlay = true

            let ok = true
            let msg = ""

            if (!this.price || this.price <= 0) {
                ok = false
                msg += "<p>El precio debe ser un número mayor a cero.</p>"
            }

            if (this.descripcion.trim() === '') {
                ok = false
                msg += "<p>Debe indicar la descripción</p>"
            }

            if (ok) {
                this.$emit("reload", this.dataSave)
                this.asignarPrecio()
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
        this.id = this.item.id
        this.price = this.item.price
        this.descripcion = this.item.descripcion || ""
    },

    // props: ["item", "options", "hashtags", "idempleado", "closemodal"],
    props: ["item", "index", "reload"],
}
</script>
