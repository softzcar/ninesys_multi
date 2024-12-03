<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-form-input
                :id="idInput"
                style="width: 100px"
                type="number"
                min="0"
                step="0.10"
                v-model="comision"
                @change="guardarComision"
                :disabled="inputDisabled"
            />
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "~/mixins/mixins.js"

export default {
    mixins: [mixin],
    data() {
        return {
            comision: 0,
            name: "Comisión",
            slug: "comision",
            orderBy: "name",
            idProducto: 0,
            test: 0,
            overlay: true,
            idInput: null,
            inputDisabled: false,
        }
    },

    methods: {
        async guardarComision() {
            this.overlay = true
            // const data = new URLSearchParams()
            // data.set('id', this.idprod)
            // data.set('comision', this.comision)

            await this.$axios
                .get(
                    `${this.$config.API}/product-set-comision/${this.idprod}/${this.comision}`
                )
                .then((res) => {
                    this.overlay = false
                    this.$emit("reload")

                    // this.urlLink = res.data.linkdrive
                })
        },

        slugCreator(texto) {
            return texto.toLowerCase().replace(/\s+/g, "-")
        },
    },

    mounted() {
        this.comisionEmpleado = parseFloat(this.comision)
        if (this.lock != null) {
            this.inputDisabled = true
        }
        this.idInput = this.token()
        this.idProducto = parseInt(this.idprod)
        // obtener comision:
        if (this.attributes[0] != undefined) {
            this.comision = this.attributes[0].options[0]
        }
        this.overlay = false
    },

    props: [
        "idprod",
        "attributes",
        "categories",
        "reloadme",
        "lock",
        "departamento",
        "comisionEmp",
    ],
}
</script>

<style lang="scss" scoped></style>
