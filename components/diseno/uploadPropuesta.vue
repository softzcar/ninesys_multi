<template>
    <b-overlay :show="overlay" rounded="sm">
        <b-card :title="myTitle" img-alt="Image" tag="article" style="max-width: 100% !important"
            class="m-4 p-3 text-center" img-bottom bg-variant="default" text-variant="red">
            <b-card-img-lazy class="mt-4" :src="tmpImage"></b-card-img-lazy>

            <b-alert class="text-center" show style="
                    text-transform: uppercase;
                    font-size: 1.2rem;
                    font-weight: bold;
                " :variant="variantAlert">{{ miRevision }}</b-alert>
            <b-form-group id="input-group-1" label="Detalle:" label-for="input-1">
                <p>
                    {{ miDetalle }}
                </p>
                <hr />
            </b-form-group>

            <b-card-text v-if="showCard && checkImageUrl(tmpImage)" class="mt-4 mb-4">
                <b-form-group id="input-group-2" label="Tipo de diseño:" label-for="select-diseno">
                    <b-form-select id="select-diseno" v-model="tipoDiseno" :options="disenoOptions" required>
                    </b-form-select>
                </b-form-group>

                <!-- Styled -->
                <div class="mt-4 pt-3">
                    <b-form-group id="input-group-3" label="Imagen" :label-for="inputId">
                        <b-form-file :id="inputId" :disabled="disableForm" v-model="newImage" :state="Boolean(newImage)"
                            placeholder="Escoja o arrastre un archivo aquí..."
                            drop-placeholder="Arrasre la propuesta aquí..."></b-form-file>
                    </b-form-group>
                </div>

                <div class="text-center">
                    <b-button :disabled="disableForm" variant="primary" @click="postImage()">Enviar Diseño</b-button>
                </div>
            </b-card-text>
        </b-card>
        <template #overlay>
            <h3 class="text-center">{{ overlayText }}</h3>
        </template>
        <!-- <pre class="force" style="background-color: red">
        props->item {{ $props }}
    </pre
        > -->
    </b-overlay>
</template>

<script>
import mixin from "~/mixins/mixins.js"
import axios from "axios"

export default {
    mixins: [mixin],

    data() {
        return {
            disableForm: false,
            variantAlert: "secondary",
            newImage: null,
            overlay: false,
            overlayText: "",
            tmpImage: "",
            tipoDiseno: null,
            id_orden: "",
            showCard: true,
            miRevision: "",
            miDetalle: "",
        }
    },

    watch: {
        miRevision(val) {
            if (val === "Rechazado") {
                this.showCard = false
                this.variantAlert = "warning"
                // this.disableForm = true
            }
            if (val === "Aprobado") {
                this.showCard = false
                this.variantAlert = "success"
            }
            if (val === "Esperando Respuesta") this.variantAlert = "info"
        },

        item(val) {
            if (val.id_product === null) {
                this.tmpImage = `${this.$config.CDN}/images/no-image.png`
            }
        },
    },

    computed: {
        inputId() {
            return `input-imagen-${this.id}`
        },

        myTitle() {
            return "PROPUESTA " + this.revision
        },

        urlCDN() {
            // return `${this.$config.CDN}/?id_orden=${this.idorden}&id_diseno=${this.item.id_diseno}&review=${this.revision}&id_empresa=${this.$store.state.login.dataEmpresa.id}&id_empleado=${this.$store.state.login.dataUser.id_empleado}`
            return `${this.$config.CDN}/?id_orden=${this.idorden}&review=${this.item.id_revision}&id_empresa=${this.$store.state.login.dataEmpresa.id}&id_empleado=${this.$store.state.login.dataUser.id_empleado}`
        },

        disenoOptions() {
            let tmpOptions = this.productos.map((el) => {
                return {
                    value: el.id_producto,
                    text: `${el.product}`,
                }
            })

            tmpOptions.unshift({
                value: null,
                text: "Seleccione un diseño",
            })

            return tmpOptions
        },
    },

    methods: {
        checkImageUrl(url) {
            const splitUrl = url.split('?')
            if (splitUrl[0] != 'https://cdn.nineteengreen.com/images/no-image.png') {
                return false
            } else {
                return true
            }
        },

        hideMe() {
            this.$bvModal.hide(this.modal)
        },
        /* async getEstatus() {
            await this.$axios
                .get(
                    `${this.$config.API}/revisiones/estatus/${this.item.id_revision}`
                )
                .then((res) => {
                    this.miRevision = res.data.estatus
                    this.miDetalle = res.data.detalles
                    if (this.item.estatus === "Rechazado") {
                        this.showCard = false
                        this.variantAlert = "warning"
                        // this.disableForm = true
                    }
                    if (this.item.estatus === "Aprobado") {
                        this.showCard = false
                        this.variantAlert = "success"
                    }
                    if (this.item.estatus === "Esperando Respuesta")
                        this.variantAlert = "info"
                })
        }, */
        sendNewImage() {
            this.overlay = true

            if (this.newImage === null) {
                this.$fire({
                    title: "Imagen",
                    html: "<p>Seleccione una imagen...</p>",
                    type: "warning",
                })
            } else {
                this.postImage().then((res) => {
                    this.overlay = false
                    this.tmpImage = res.data.url
                })
            }
        },

        async enviarTipoDiseno() {
            const data = new URLSearchParams()
            data.set("id_diseno", this.item.id_diseno)
            data.set("id_revision", this.item.id_revision)
            data.set("id_product", this.tipoDiseno)

            await this.$axios
                .post(`${this.$config.API}/diseno/update-tipo`, data)
                .then((res) => {
                    this.$fire({
                        title: "Diseño Creado",
                        html: `<p>El diseño de tipo ${res.data} se guardó correctamente</p>`,
                        type: "success",
                    }).then(() => {
                        this.$emit("closemodal")
                    })
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se guardó el tipo de producto</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        // subir imagen
        async postImage() {
            this.overlay = true

            // VALIDAR FORMULARIO
            let ok = true
            let msg = ""

            if (this.tipoDiseno === null) {
                ok = false
                msg += "<p>Seleccione una tipo de diseño</p>"
            }

            if (!this.newImage) {
                ok = false
                msg += "<p>Seleccione una imagen</p>"
            }

            if (ok) {
                let formData = new FormData()
                formData.append("file", this.newImage)
                this.overlay = true
                await axios
                    .post(this.urlCDN, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
                    .then((res) => {
                        if (res.data.uploaded) {
                            // this.getEstatus()
                            this.tmpImage = res.data.url + "?_=" + this.token()
                            this.$emit("reload", "true")
                            this.$emit("button", false)
                            this.enviarTipoDiseno()
                            this.overlay = false
                        } else {
                            this.$fire({
                                title: "Error",
                                html: `<p>La imagen no se guardó.</p><p>${res.data.msg}</p>`,
                                type: "error",
                            })
                        }
                    })
                    .catch((err) => {
                        this.$fire({
                            title: "Error",
                            html: `No se guardó la imágen ${err}`,
                            type: "danger",
                        })
                    })
                    .finally(() => {
                        this.overlay = false
                    })
            } else {
                this.$fire({
                    title: "Faltan Datos",
                    html: msg,
                    type: "warniing",
                })
                this.overlay = false
            }
        },

        findImage() {
            let token = this.token()
            console.log("Vamos a buscar la imagen")

            fetch(this.urlCDN)
                .then((response) => response.json())
                .then((res) => {
                    console.log(`El CDN respondió con una imagen`, res)
                    this.tmpImage = `${this.$config.CDN}/${res.url}?_=${token}`
                })
                .catch((err) => {
                    console.log(`El CDN respondió con un error`, err)
                    this.tmpImage = `${this.$config.CDN}/images/no-image.png`
                })
        },

        findImage_axios() {
            let token = this.token()
            console.log("Vamos a buscar la imágen")
            axios
                .get(this.urlCDN)
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
        this.overlayText = "Procesando imágen..."

        this.miRevision = this.item.estatus

        if (this.item.id_product) {
            this.tipoDiseno = this.item.id_product
        }

        // this.getEstatus()
        // console.log('modal opn says item.estatus', this.item.estatus)
        this.findImage()
        if (this.miRevision === "Rechazado") {
            this.showCard = false
            this.variantAlert = "warning"
            // this.disableForm = true
        }
        if (this.miRevision === "Aprobado") {
            this.showCard = false
            this.variantAlert = "success"
        }
        if (this.miRevision === "Esperando Respuesta")
            this.variantAlert = "info"

        // this.getEstatus()
    },

    props: [
        "id",
        "revision",
        "item",
        "reload",
        "nextReview",
        "button",
        "idorden",
        "productos",
        "closemodal",
    ],
}
</script>

<style scoped>
.card {
    border-top-width: 2px;
    border-right-width: 2px;
    border-bottom-width: 2px;
    border-left-width: 2px;
}
</style>
