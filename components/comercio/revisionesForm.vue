<template>
    <div>
        <b-overlay :show="overlay" rounded="sm">
            <b-container>
                <b-row>
                    <b-col>
                        <b-card :title="item.cliente" :header="title" header-text-variant="white" header-tag="header"
                            header-bg-variant="dark" no-body style="max-width: 100% !important" class="overflow-hidden">
                            <b-row no-gutters>
                                <b-col md="6">
                                    <b-card-img-lazy class="mt-4" :src="tmpImage" loading="lazy"></b-card-img-lazy>
                                    <b-row>
                                        <b-col>
                                            <b-alert class="text-center" show style="
                                                    text-transform: uppercase;
                                                    font-size: 1.2rem;
                                                    font-weight: bold;
                                                " :variant="variantAlert">{{ item.estatus }}</b-alert>
                                        </b-col>
                                    </b-row>
                                </b-col>

                                <b-col md="6">
                                    <b-card-body :title="item.cliente">
                                        <b-container>
                                            <!-- <b-row class="mb-2">
                        <b-col>
                          <b-button variant="primary"
                            ><b-icon-link45deg></b-icon-link45deg> Copiar
                            Link</b-button
                          >
                        </b-col>
                      </b-row> -->
                                            <b-row class="mb-2">
                                                <b-col>
                                                    <b-button @click="
                                                        aprobarPropuesta()
                                                        " variant="success"><b-icon-check></b-icon-check>
                                                        Aprobar</b-button>
                                                </b-col>
                                            </b-row>
                                            <b-row class="mb-2">
                                                <b-col>
                                                    <b-button variant="warning" @click="
                                                        rechazarPropuesta()
                                                        "><b-icon-skip-backward-fill></b-icon-skip-backward-fill>
                                                        Rechazar</b-button>
                                                </b-col>
                                            </b-row>

                                            <b-row>
                                                <b-col>
                                                    <b-form-group id="input-group-1" label="Detalle:"
                                                        label-for="input-1"
                                                        description="Describa los cambios del diseño.">
                                                        <b-form-textarea id="textarea" v-model="detalles" no-auto-shrink
                                                            size="sm" no-resize rows="3" max-rows="20">
                                                        </b-form-textarea>
                                                    </b-form-group>
                                                </b-col>
                                            </b-row>
                                        </b-container>
                                    </b-card-body>
                                </b-col>
                            </b-row>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>
        </b-overlay>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"
import axios from "axios"

export default {
    mixins: [mixin],

    data() {
        return {
            tmpImage: null,
            overlay: false,
            detalles: this.item.detalles,
            variantAlert: "secondary",
        }
    },

    watch: {
        item(val) {
            if (val.estatus === "Rechazado") {
                this.variantAlert = "warning"
            }
            if (val.estatus === "Aprobado") {
                this.variantAlert = "success"
            }
            if (val.estatus === "Esperando Respuesta") {
                this.variantAlert = "info"
            }
        },
    },

    computed: {
        title() {
            return `ORDEN ${this.item.id_orden}, REVISIÓN ${this.item.revision}`
        },
    },

    methods: {
        aprobarPropuesta() {
            this.$confirm(
                `¿Desea aprobar la propuesta de diseño?`,
                "Aprobar Propuesta",
                "question"
            )
                .then(() => {
                    this.overlay = true
                    this.enviarEstatus("Aprobado").then(
                        () => (this.overlay = false)
                    )
                })
                .catch(() => {
                    return false
                })
        },

        rechazarPropuesta() {
            if (this.detalles === null || this.detalles.trim().length < 10) {
                this.$fire({
                    title: "El detalle es muy corto",
                    html: "<p>La información que ha proporcionado es muy corta, por favor sea más explicito.</p>",
                    type: "info",
                })
            } else {
                this.$confirm(
                    `¿Desea rechazar la propuesta de diseño?`,
                    "Rechazar Propuesta",
                    "question"
                )
                    .then(() => {
                        this.overlay = true
                        this.enviarDetalles().then(() => {
                            this.enviarEstatus("Rechazado").then(() => {
                                this.$fire({
                                    title: "Rechazar Propuesta",
                                    html: "<p>La información de los cambios han sido enviads al diseñador</p>",
                                    type: "info",
                                })
                            })
                        })
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Rechazar Propuesta",
                            html: `<p>Ocurrió un error al rechazar la propuesta, es posible que los cambios no se hayan guardado</p><p>${err}</p>`,
                            type: "danger",
                        })
                    })
                    .finally(() => (this.overlay = false))
            }
        },
        async enviarEstatus(estatus) {
            await this.$axios
                .post(
                    `${this.$config.API}/comercializacion/revisiones-estatus/${estatus}/${this.item.id_revision}/${this.item.id_orden}`
                )
                .then((res) => {
                    console.log(`El cdn respondio con una imagen`, res)
                    this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`
                })
                .catch((err) => {
                    console.log(`El cdn respondio con un error`, err)
                    this.tmpImage = `${this.$config.CDN}/images/no-image.png`
                })
        },

        async enviarDetalles() {
            //   this.overlay = true
            const data = new URLSearchParams()
            data.set("detalles", this.detalles)
            await this.$axios
                .post(
                    `${this.$config.API}/comercializacion/revisiones-detalles/${this.item.id_revision}`,
                    data
                )
                .then((res) => {
                    this.$emit("reload", true)
                })
                .catch((err) => { })
        },

        copyLink() {
            const el = document.createElement("textarea")
            el.value = this.tmpImage
            document.body.appendChild(el)
            el.select()
            document.execCommand("copy")
            document.body.removeChild(el)

            console.log("Enlace copiado al portapapeles: " + this.tmpImage)
        },

        findImage() {
            let token = this.token()
            axios
                .get(
                    `${this.$config.CDN}/?id_orden=${this.item.id_orden}&id_diseno=${this.item.id_diseno}&review=${this.item.revision}`
                )
                .then((res) => {
                    console.log(`El cdn respondio con una imagen`, res)
                    this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`
                })
                .catch((err) => {
                    console.log(`El cdn respondio con un error`, err)
                    this.tmpImage = `${this.$config.CDN}/images/no-image.png`
                })
        },
    },

    mounted() {
        this.findImage()
        if (this.item.estatus === "Rechazado") this.variantAlert = "warning"
        if (this.item.estatus === "Aprobado") this.variantAlert = "success"
        if (this.item.estatus === "Esperando Respuesta")
            this.variantAlert = "info"
    },

    props: ["item", "reload"],
}
</script>

<style scoped>
.card {
    border-top-width: 2px;
    border-right-width: 2px;
    border-bottom-width: 2px;
    border-left-width: 2px;
}

.card-header {
    font-size: 1.4rem;
}
</style>
