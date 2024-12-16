<template>
    <div>
        <b-alert :show="showMsg" :variant="variantMsg" fade>{{
            alertMsg
        }}</b-alert>
        <b-overlay :show="overlay" spinner-small>
            <div v-for="(emp, index) in revisionesPorDisenador" :key="index">
                <h2>{{ emp.disenador }}</h2>
                <b-card-group columns>
                    <b-card v-for="(rev, index2) in emp.revisiones" :key="index2" :img-alt="rev.cliente"
                        :title="rev.cliente" :sub-title="rev.disenador">
                        <div class="image-container">
                            <div @click="
                                zoomImage(
                                    generateURL(
                                        rev.id_orden,
                                        rev.id_diseno,
                                        rev.id_revision,
                                        rev.id_disenador
                                    )
                                )
                                " class="clickable-image">
                                <b-img-lazy :src="generateURL(
                                    rev.id_orden,
                                    rev.id_diseno,
                                    rev.id_revision,
                                    rev.id_disenador
                                )
                                    " fluid class="image-zoom"></b-img-lazy>
                            </div>
                        </div>

                        <b-card-text>
                            <b-list-group>
                                <b-list-group-item class="text-center text-uppercase" :variant="estatusRevision.color">
                                    {{ showStatus(rev.estatus) }}
                                </b-list-group-item>

                                <b-list-group-item>
                                    <strong>ORDEN {{ rev.id_orden }} </strong>
                                </b-list-group-item>

                                <b-list-group-item>
                                    <strong>DISEÑO {{ rev.id_revision }}</strong>
                                </b-list-group-item>

                                <b-list-group-item>
                                    <strong> {{ rev.tipo_diseno }}</strong>
                                </b-list-group-item>

                                <b-list-group-item>
                                    <strong>CLIENTE</strong> {{ rev.cliente }}
                                </b-list-group-item>

                                <b-list-group-item>
                                    <strong>DETALLES</strong><br />
                                    {{ validarDetalles(rev.detalles) }}
                                </b-list-group-item>
                            </b-list-group>

                            <b-form inline class="mt-4">
                                <b-button class="floatme" @click="disenoAprobar(rev)" variant="success">
                                    <b-icon icon="check-lg"></b-icon>
                                </b-button>
                                <b-button class="floatme" @click="disenoRechazar(rev)" variant="danger">
                                    <b-icon icon="x-lg"></b-icon>
                                </b-button>
                            </b-form>
                        </b-card-text>
                    </b-card>
                </b-card-group>
                <hr />
                <!-- <pre class="force">
                    {{ revisionesPorDisenador }}
                </pre>
                <pre class="force">
                    {{ revsionesTodas }}
                </pre> -->
            </div>
        </b-overlay>

        <b-modal id="zoom-modal" centered size="xl" hide-footer ref="zoomModal" class="zoom-modal">
            <div class="d-flex justify-content-center align-items-center zoom-modal-content">
                <img :src="zoomedImage" fluid class="zoomed-image" />
            </div>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
    data() {
        return {
            zoomedImage: null,
            showMsg: false,
            alertMsg: "Cargando diseños...",
            variantMsg: "info",
            overlay: false,
            estatusRevision: {},
            revsionesTodas: [],
            fields: [
                {
                    key: "moment",
                    label: "Fecha",
                },
                {
                    key: "id_orden",
                    label: "Orden",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
            ],
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        revisionesPorDisenador() {
            // Agrupar revisiones por diseñador usando reduce
            const agrupadasPorDisenador = this.revsionesTodas.reduce(
                (acc, revision) => {
                    const { id_disenador, disenador } = revision

                    // Si no existe el diseñador en el acumulador, agregarlo
                    if (!acc[id_disenador]) {
                        acc[id_disenador] = { disenador, revisiones: [] }
                    }

                    // Agregar la revisión al diseñador correspondiente
                    acc[id_disenador].revisiones.push(revision)
                    return acc
                },
                {}
            )
            // Convertir el objeto resultante en un array
            return Object.values(agrupadasPorDisenador)
        },
    },

    methods: {
        showStatus(estado, error = null) {
            switch (estado) {
                case "Esperando Respuesta":
                    this.estatusRevision.color = "secondary"
                    this.estatusRevision.text = "Pendiente"
                    break
                case "Aprobado":
                    this.estatusRevision.color = "success"
                    this.estatusRevision.text = "Aprobado"
                    break
                case "Rechazado":
                    this.estatusRevision.color = "warning"
                    this.estatusRevision.text = "Rechazado"
                    break
                case "Error":
                    this.estatusRevision.color = "danger"
                    this.estatusRevision.text = `Error asignado estado de la revisión: ${error}`
                    break
                default:
                    this.estatusRevision.color = "light"
                    this.estatusRevision = "Opción Invalida"
                    break
            }

            return this.estatusRevision.text
        },

        async enviarEstatus(estatus, id_revision, id_orden) {
            await this.$axios
                .post(
                    `${this.$config.API}/comercializacion/revisiones-estatus/${estatus}/${id_revision}/${id_orden}`
                )
                .then((res) => {
                    this.loadRevisiones().then(() => {
                        console.log(`El cdn respondio con una imagen`, res)
                        this.tmpImage = `${this.$config.CDN}/${res.data.url}?_=${token}`
                    })
                })
                .catch((err) => {
                    console.log(`El cdn respondio con un error`, err)
                    this.tmpImage = `${this.$config.CDN}/images/no-image.png`
                })
        },

        disenoAprobar(item) {
            this.$confirm(
                `¿Desea Arobar el diseño para la Orden Nro ${item.id_diseno} del cliente ${item.cliente}?`,
                "Aprobar Diseño",
                "question"
            )
                .then(() => {
                    this.overlay = true
                    console.log(`Vamos a APROBAR el diseno :)`, item.id_diseno)
                    this.enviarEstatus(
                        "Aprobado",
                        item.id_revision,
                        item.id_orden
                    ).then(() => {
                        this.showStatus("Aprobado")
                        this.overlay = false
                    })
                })
                .catch((err) => {
                    console.log(`Vamos a RECHAZAR el diseno :(`, item.id_diseno)
                    this.showStatus("Error", err)
                    return false
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        disenoRechazar(item) {
            this.$confirm(
                `¿Desea Rechazar el diseño para la Orden Nro ${item.id_diseno} del cliente ${item.cliente}?`,
                "Rechazar Diseño",
                "question"
            )
                .then(() => {
                    this.overlay = true
                    console.log(`Vamos a RECHAZAR el diseno :)`, item.id_diseno)

                    this.enviarEstatus(
                        "Rechazado",
                        item.id_revision,
                        item.id_orden
                    ).then(() => {
                        this.showStatus("Aprobado")
                        this.overlay = false
                    })

                })
                .catch(() => {
                    console.log(`Vamos a RECHAZAR el diseno :(`, item.id_diseno)
                    return false
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        zoomImage(image) {
            this.zoomedImage = image
            console.log("Zoomed Image:", this.zoomedImage) // Log para verificar el valor de zoomedImage
            this.$refs.zoomModal.show()
        },

        validarDetalles(detalles) {
            let misDetalles = detalles

            if (misDetalles === null) {
                misDetalles = "No hay detalles para este diseñno"
            }

            return misDetalles
        },

        generateURL(id_orden, id_diseno, id_revision, id_disenador) {
            return `${this.$config.CDN}/images/${this.$store.state.login.dataEmpresa.id}/${id_orden}/${id_orden}-${id_revision}-${id_disenador}.png`
        },

        openModal() {
            this.detallesItem().then(() => this.$bvModal.show(this.modal))
        },

        loadRevisiones() {
            this.getRevisiones().then(() => {
                if (!this.revsionesTodas.length) {
                    ; (this.showMsg = true),
                        (this.alertMsg = "No hay diseños por aprobar")
                }
            })
        },

        async getRevisiones() {
            this.overlay = true

            await this.$axios
                .get(`${this.$config.API}/diseno/revisiones`) // crear en la api
                .then((res) => {
                    this.revsionesTodas = res.data.revisiones
                    console.log(`respueta de /lotes/get-detalles`, res.data)
                    //   this.resetForm()
                    //   this.$bvModal.hide(this.modal)
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.loadRevisiones()
    },

    mixins: [mixin],
}
</script>

<style scoped>
.image-container {
    position: relative;
}

.delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
}

.image-zoom {
    cursor: pointer;
}

.clickable-image {
    cursor: pointer;
}

.zoom-modal-content {
    height: 80vh;
    /* Ajusta esto si es necesario */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.zoomed-image {
    max-height: 100%;
    max-width: 100%;
}
</style>
