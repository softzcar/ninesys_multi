<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-row>
                <b-col>
                    <b-form inline>
                        <b-form-input :id="idInput" style="width: 100px" type="number" min="0" step="0.01"
                            v-model="comision" :value="comision" :disabled="inputDisabled" />

                        <b-button :disabled="inputDisabled" size="sm" class="ml-2" variant="success"
                            @click="guardarComision()">
                            <b-icon-check-lg></b-icon-check-lg>
                        </b-button>

                        <!-- <pre class="force">
                            iddep {{ iddep }} <br />
                            this.item.comisiones {{ this.item.comisiones }} <br />
                        </pre> -->
                    </b-form>
                </b-col>
            </b-row>
        </b-overlay>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
    mixins: [mixin],

    data() {
        return {
            idInput: null,
            comision: 0,
            departamento: null,
            idProducto: 0,
            overlay: false,
            inputDisabled: false,
        }
    },

    watch: {
        iddep(val) {
            this.iddepChacker(val)
        },
    },

    methods: {
        async guardarComision() {
            this.overlay = true
            /* let typeQuery = ''
            if (this.item.comisiones[0].comision === null) {
                typeQuery = 'insert'
            } else {
                typeQuery = 'update'
            } */

            const data = new URLSearchParams()
            data.set('id_product', this.item.cod)
            data.set('id_departamento', this.iddep)
            data.set('comision', this.comision)
            // data.set('type', typeQuery)

            await this.$axios
                .post(
                    `${this.$config.API}/product-set-comision-producto`, data
                )
                .then((res) => {
                    this.$emit("reload")
                    this.$fire({
                        title: "Guardar Comisión",
                        html: `<p>La comisión se guardó correctamente</p>`,
                        type: "success",
                    })
                }).catch((err) => {
                    this.$fire({
                        title: "Guardar Comisión",
                        html: `<p>Courrió un error al guardar la comisión</p><p>${err}</p>`,
                        type: "error",
                    })
                }).finally(() => {
                    this.overlay = false
                })
        },

        iddepChacker(val) {
            if (!val || val === null || val < 1) {
                this.inputDisabled = true
                this.comision = 0
            } else {
                this.inputDisabled = false
            }

            const idExist = this.item.comisiones.find(el => el.id_departamento === val)
            console.log('idExist', idExist)

            if (idExist === undefined) {
                this.comision = 0
            } else {
                this.comision = idExist.comision
            }
        },
    },

    mounted() {
        this.idInput = this.token()
        this.iddepChacker(this.iddep)
        /* this.comisionEmpleado = parseFloat(this.comision)
        if (this.lock != null) {
            this.inputDisabled = true
        }
        this.idInput = this.token()
        this.idProducto = parseInt(this.idprod)
        // obtener comision:
        if (this.attributes[0] != undefined) {
            this.comision = this.attributes[0].options[0]
        }
        this.overlay = false */
    },

    props: [
        "item",
        "seldep",
        "iddep",
    ],
    /* props: [
        "idprod",
        "attributes",
        "categories",
        "reloadme",
        "lock",
        "departamento",
        "comisionEmp",
        "comisionprod",
    ], */
}
</script>

<style lang="scss" scoped></style>
