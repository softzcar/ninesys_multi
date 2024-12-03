<template>
    <div>
        <h2>{{ title }}</h2>
        <b-overlay :show="overlay" spinner-small>
            <b-row v-if="error.show" class="mt-4">
                <b-col>
                    <b-alert show variant="danger"
                        >Danger Alert: {{ error.msg }}</b-alert
                    >
                </b-col>
            </b-row>

            <b-row class="mt-4">
                <b-col>
                    <b-table responsive :fields="fields" :items="items">
                        <template #cell(id)="data">
                            <linkSearch :id="data.item.id" />
                        </template>

                        <template #cell(imagen)="data">
                            <diseno-viewImage :id="data.item.imagen" />
                        </template>

                        <template #cell(inicio)="data">
                            {{ formatDate(data.item.inicio) }}
                        </template>

                        <template #cell(codigo_diseno)="data">
                            <diseno-codigoDiseno :item="data.item" />
                        </template>

                        <template #cell(linkdrive)="data">
                            <diseno-linkDrive :item="data.item" />
                        </template>

                        <template #cell(revision)="data">
                            <diseno-uploadImageRevision
                                :revisiones="revisiones"
                                :item="data.item"
                                :@reload="reloadDisenos"
                            />
                        </template>

                        <template #cell(id_orden)="data">
                            <ordenes-vinculadas
                                :id_orden="data.item.id_orden"
                            />
                        </template>

                        <template #cell(tallas_y_personalizacion)="data">
                            <diseno-tallasPersoalizacion
                                :revisiones="revisiones"
                                :item="data.item"
                                :@reload="reloadDisenos"
                            />
                        </template>
                    </b-table>
                </b-col>
            </b-row>
        </b-overlay>
        <!-- <pre>
      <h4>Asignados</h4>
      <h5>$data:</h5> {{ $data.revisiones }}
    </pre> -->
    </div>
</template>

<script>
// import { mapState } from 'vuex'
import axios from "axios"
import mixin from "~/mixins/mixins.js"

export default {
    mixins: [mixin],
    data() {
        return {
            title: "Diseños asignados",
            error: {
                show: false,
                msg: "",
            },
            revisiones: [],
            placeholder: "Número de orden",
            overlay: true,
            items: [],
            fields: [],
            reloadDisenos: false,
        }
    },

    watch: {
        reloadDisenos(val) {
            if (val) {
                this.overlay = true
                this.getDisenos().then(() => {
                    this.reloadDisenos = false
                    this.overlay = false
                })
            }
        },
    },

    methods: {
        onRevision(id_diseno) {
            let hasReview = []
            hasReview = this.revisiones.filter(
                (el) => el.id_diseno == id_diseno
            )
            return hasReview
        },

        async getDisenos() {
            // let userType = this.$store.state.login.dataUser.departamento
            // console.log('Departamento de usuario', userType)
            console.log(`recarguemos diseños...`)
            await this.$axios
                .get(
                    `${this.$config.API}/disenos/asignados/${this.$store.state.login.dataUser.id_empleado}`
                )
                .then((res) => {
                    this.fields = res.data.fields
                    this.revisiones = res.data.revisiones
                    // this.items = res.data.items

                    this.items = res.data.items.reduce((acc, obj) => {
                        let current = acc.find(
                            (o) => o.id_orden === obj.id_orden
                        )
                        if (!current) {
                            acc.push(obj)
                            return acc
                        }
                        if (obj.estatus === "Aprobado") {
                            current.estatus = "Aprobado"
                        } else if (
                            current.estatus !== "Aprobado" &&
                            obj.estatus === "Rechazado"
                        ) {
                            current.estatus = "Rechazado"
                        } else if (
                            current.estatus !== "Aprobado" &&
                            current.estatus !== "Rechazado" &&
                            obj.estatus === "Esperando Respuesta"
                        ) {
                            current.estatus = "Esperando Respuesta"
                        }
                        return acc
                    }, [])

                    // TODO vamos a filtrar el estatus de la revision y pasarselo al componenete `uploadImageRevision`
                })
        },
    },

    mounted() {
        // setInterval(this.getDisenos, 90000)
        this.getDisenos().then(() => (this.overlay = false))
    },
}
</script>

<style scoped>
.floarme {
    float: left;
}

.floatme:first-child {
    margin-right: 20px;
}
</style>
