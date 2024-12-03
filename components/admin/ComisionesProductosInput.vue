<template>
    <div>
        <pre>
      {{ $props }}
    </pre
        >
        <b-overlay :show="overlay" spinner-small>
            <div v-if="item.departamento === 'Costura'">
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
            </div>

            <div v-else>{{ item.comision }}</div>
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
            // data.set('id', this.item.cod)
            // data.set('comision', this.comision)

            await this.$axios
                .get(
                    `${this.$config.API}/product-set-comision/${this.item.cod}/${this.comision}`
                )
                .then((res) => {
                    this.overlay = false
                    this.$emit("reload")

                    // this.urlLink = res.data.linkdrive
                })
        },

        updateComision() {
            const comision = []
        },

        slugCreator(texto) {
            return texto.toLowerCase().replace(/\s+/g, "-")
        },
    },

    mounted() {
        this.comisionEmpleado = parseFloat(this.comision)
        if (this.item.fecha_pago != null) {
            this.inputDisabled = true
        }
        this.idInput = this.token()
        this.idProducto = parseInt(this.item.cod)
        // obtener comision:
        this.comision = this.item.comision
        /* if (this.item.attributes != undefined) {
      if (this.item.attributes[0] != undefined) {
        this.comision = this.item.attributes[0].options[0]
      }
    } */
        this.overlay = false
    },

    props: ["item", "reloadme"],
}
</script>

<style lang="scss" scoped></style>
