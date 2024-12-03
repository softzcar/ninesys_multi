<template>
    <div>
        <div>
            <!-- <b-button v-b-modal.modalPopover>Ver detalles</b-button> -->
            <b-button variant="primary" @click="$bvModal.show(modal)">
                <b-icon icon="eye"></b-icon>
            </b-button>

            <b-modal :id="modal" :title="title" size="lg" ok-only>
                <!-- <pre style="display: block !important">
          {{ $props }}
        </pre
                > -->
                <b-row class="mt-2">
                    <b-col>
                        <div class="floatme">
                            <diseno-viewImage :id="idorden" />
                        </div>

                        <div class="floatme">
                            <b-button v-b-toggle.collapse-1 variant="primary"
                                >Ver original</b-button
                            >
                            <b-collapse id="collapse-1" class="mt-2">
                                <b-card>
                                    <div v-html="detalles"></div>
                                </b-card>
                            </b-collapse>
                        </div>

                        <div class="floatme">
                            <b-button v-b-toggle.collapse-2 variant="primary"
                                >Productos</b-button
                            >
                            <!-- {{ $props }} -->
                            <b-collapse id="collapse-2" class="mt-2">
                                <b-card>
                                    <b-table
                                        striped
                                        hover
                                        :fields="fields"
                                        :items="misProductos"
                                    >
                                        <template #cell(terminado)="row">
                                            <empleados-check-tarea
                                                :id_lotes_detalles="
                                                    row.item.id_lotes_detalles
                                                "
                                                :terminado="row.item.terminado"
                                            />
                                        </template>

                                        <template
                                            #cell(detalle_reposicion)="row"
                                        >
                                            <produccion-control-de-produccion-detalle-reposicion
                                                :detalle="
                                                    row.item.detalle_reposicion
                                                "
                                            />
                                        </template>
                                    </b-table>
                                </b-card>
                            </b-collapse>
                        </div>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col>
                        <div style="border: red 1px; text-align: right">
                            {{ msg }}
                        </div>
                    </b-col>
                </b-row>

                <b-row class="mt-4">
                    <b-col>
                        <quill-editor
                            v-model="borrador"
                            @change="onEditorChange($event)"
                            :options="quillOptions"
                        ></quill-editor>
                    </b-col>
                </b-row>
            </b-modal>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import quillOptions from "~/plugins/nuxt-quill-plugin"

export default {
    data() {
        return {
            title: `Detalles de la orden ${this.idorden}`,
            quillOptions,
            msg: "",
            borrador: "",
            html2: "",
            fields_static: [
                {
                    key: "terminado",
                    label: "Terminado",
                },
                {
                    key: "name",
                    label: "Producto",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
                {
                    key: "talla",
                    label: "Talla",
                },
                {
                    key: "corte",
                    label: "Corte",
                },
                {
                    key: "tela",
                    label: "Tela",
                },
                {
                    key: "detalle_reposicion",
                    label: "Detalle",
                },
            ],
        }
    },

    computed: {
        misProductos() {
            let prods
            if (this.esreposicion == "true") {
                prods = this.productos
                    .filter((el) => el.reposicion_terminada === 0)
                    .map((el) => ({ ...el, cantidad: el.unidades_reposicion }))
            } else {
                prods = this.productos.filter(
                    (el) => el.reposicion_terminada === null
                )
            }
            return prods
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)

            return `modal-${rand}`
        },

        fields() {
            let fields

            if (this.esreposicion == "true") {
                if (this.$store.state.login.dataUser.departamento === "Corte") {
                    fields = [
                        {
                            key: "terminado",
                            label: "Terminado",
                        },
                        {
                            key: "name",
                            label: "Producto",
                        },
                        {
                            key: "cantidad_corte",
                            label: "Cantidad",
                        },
                        {
                            key: "talla",
                            label: "Talla",
                        },
                        {
                            key: "corte",
                            label: "Corte",
                        },
                        {
                            key: "tela",
                            label: "Tela",
                        },
                        {
                            key: "detalle_reposicion",
                            label: "Detalle",
                        },
                    ]
                } else {
                    fields = [
                        {
                            key: "terminado",
                            label: "Terminado",
                        },
                        {
                            key: "name",
                            label: "Producto",
                        },
                        {
                            key: "cantidad",
                            label: "Cantidad",
                        },
                        {
                            key: "talla",
                            label: "Talla",
                        },
                        {
                            key: "corte",
                            label: "Corte",
                        },
                        {
                            key: "tela",
                            label: "Tela",
                        },
                        {
                            key: "detalle_reposicion",
                            label: "Detalle",
                        },
                    ]
                }
            } else {
                if (this.$store.state.login.dataUser.departamento === "Corte") {
                    fields = [
                        {
                            key: "terminado",
                            label: "Terminado",
                        },
                        {
                            key: "name",
                            label: "Producto",
                        },
                        {
                            key: "cantidad_corte",
                            label: "Cantidad",
                        },
                        {
                            key: "talla",
                            label: "Talla",
                        },
                        {
                            key: "corte",
                            label: "Corte",
                        },
                        {
                            key: "tela",
                            label: "Tela",
                        },
                    ]
                } else {
                    fields = [
                        {
                            key: "terminado",
                            label: "Terminado",
                        },
                        {
                            key: "name",
                            label: "Producto",
                        },
                        {
                            key: "cantidad",
                            label: "Cantidad",
                        },
                        {
                            key: "talla",
                            label: "Talla",
                        },
                        {
                            key: "corte",
                            label: "Corte",
                        },
                        {
                            key: "tela",
                            label: "Tela",
                        },
                    ]
                }
            }

            return fields
        },
    },

    methods: {
        async postBorrador(borrador) {
            this.msg = "Guardando..."
            const data = new URLSearchParams()
            data.set("id_orden", this.idorden)
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set("borrador", borrador)

            await this.$axios
                .post(`${this.$config.API}/ordenes/borrador`, data)
                .then((res) => {
                    this.msg = "Se guardaron sus cambios"
                    this.$emit("reload")
                })
                .catch((error) => {
                    this.msg = "No se pudo guardar su borrador"
                })
        },

        onEditorChange({ editor, html, text }) {
            console.log("editor change!", editor, html, text)
            this.postBorrador(html)
            this.borrador = html
        },
    },

    mounted() {
        if (this.detalle_empleado === null) {
            this.borrador = this.detalles
        } else {
            this.borrador = this.detalle_empleado
        }
    },

    props: [
        "idorden",
        "item",
        "detalles",
        "detalle_empleado",
        "productos",
        "reload",
        "esreposicion",
        "en_reposiciones",
    ],
}
</script>
