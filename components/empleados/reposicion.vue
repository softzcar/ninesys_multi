<template>
    <div>
        <b-button variant="warning" @click="$bvModal.show(modal)">
            <b-icon icon="skip-backward-fill"></b-icon>
        </b-button>
        <b-button variant="warning" @click="$bvModal.show(modal2)">
            <b-icon icon="eye"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal2" hide-footer>
            <p v-for="(producto, index) in filterDetallesReposicion" :key="index">
                {{ producto }}
            </p>
        </b-modal>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-container fluid class="p-3" style="width: 100%;">
                <!-- {{ $data.productos }} -->
                <b-row>
                    <b-col>
                        <h3>Datos de la orden</h3>
                        <b-list-group style="width: 100% !important;">
                            <b-list-group-item>
                                <span><strong>Orden:</strong>
                                    {{ id_orden }}</span>
                            </b-list-group-item>

                            <b-list-group-item>
                                <span><strong>Cliente:</strong>
                                    {{ item.cliente }}
                                </span>
                            </b-list-group-item>
                            <b-list-group-item>
                                <span>
                                    <strong>Paso actual:</strong>
                                    <span style="
                                            text-transform: uppercase;
                                            background-color: #fff3cd;
                                            font-weight: 700;
                                            padding: 4px;
                                        ">
                                        {{ item.paso }}
                                    </span>
                                </span>
                            </b-list-group-item>
                            <b-list-group-item>
                                <b-button class="mt-2" size="sm" v-b-toggle.collapse-1 variant="light">Ver
                                    Detalles</b-button>
                                <b-collapse id="collapse-1" class="mt-2">
                                    <span v-html="item.detalles"></span>
                                </b-collapse>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col class="mt-4">
                        <b-table hover :items="tablaProductos">
                            <template #cell(Reponer)="data">
                                <!-- {{ data }} -->
                                <empleados-reposicion-form-empleados :item="data"
                                    @reload_this="reloadTareasAsignadas" />
                            </template>
                        </b-table>
                    </b-col>
                </b-row>
            </b-container>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
export default {
    data() {
        return {
            size: "xl",
            title: "Reposición de piezas",
            overlay: false,
            productos: [],
            item: {
                orden: "",
                vinculada: "",
                cliente: "",
                prioridad: "0",
                paso: "",
                detalle_supervisor: null,
                detalle_emisor: null,
                inicio: "",
                entrega: "",
                detalles: "",
                acciones: "",
                estatus: "",
                id_diseno: null,
                disenador: ""
            },
            showError: false,
            dataReposicion: []
        }
    },

    computed: {
        filterDetallesReposicion() {
            return this.dataReposicion.map((el) => {
                return `${el.unidades} ${el.producto}, detalle: ${el.detalle_supervisor}`
            })
        },

        tablaProductos() {
            return this.productos.map((item) => ({
                Orden: item.id_orden,
                Producto: item.producto,
                Talla: item.talla,
                Cantidad: item.cantidad,
                Tela: item.tela,
                Corte: item.corte,
                Reponer: item._id,
            }))
        },

        modal() {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
        modal2() {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        async getReposicionData() {
            await this.$axios
                .get(
                    `${this.$config.API}/empleados/reposicion/${this.id_orden}`
                )
                .then((resp) => {
                    console.log("test mounted", resp.data)
                    this.productos = resp.data.reposicion_ordenes_productos
                    this.item = resp.data.item.data // Asegúrate de que item siempre sea un objeto
                    this.dataReposicion = resp.data.item.detalles_reposicion.filter((el) => el.id_empleado == this.$store.state.login.dataUser.id_empleado)
                })
        },

        reloadTareasAsignadas() {
            return false
        },
    },
    beforeMount() {
        this.getReposicionData()
    },

    mounted() {
    },

    props: ["id_orden", "reload_this"],
}
</script>
