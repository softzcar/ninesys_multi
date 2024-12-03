<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <!-- <pre>
          fieldsProducts {{ fieldsProducts }}
        </pre> -->
                <b-container>
                    <b-row>
                        <b-col>
                            <h5>Asignación de insumos Lote {{ id }}</h5>
                            <b-table
                                ref="table"
                                responsive
                                small
                                striped
                                :size="size"
                                :items="itemsProducts"
                                :fields="fieldsProducts"
                            >
                                <!--<template #cell(_id)="data">
                   <produccion-guardar-cantidad
                    :cantidadLote="data.item.cantidad_lote"
                    :id="data.item._id"
                    @reload="setReload" 
                  /> 
                  {{ data.item }}
                </template>-->
                            </b-table>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <h5 class="mt-4">
                                Asignación de personal Lote {{ id }}
                            </h5>
                            <b-card no-body>
                                <b-tabs card>
                                    <b-tab :title="`Impresión`">
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    @reload="setReload"
                                                    :options="optionsEmpleados"
                                                    departamento="Impresión"
                                                />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Estampado`">
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    @reload="setReload"
                                                    :options="optionsEmpleados"
                                                    departamento="Estampado"
                                                />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Corte`" active>
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <!-- <pre>{{ item }}</pre> -->
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    @reload="setReload"
                                                    :options="optionsEmpleados"
                                                    departamento="Corte"
                                                />
                                                <!-- <produccion-guardar-cantidad
                          :cantidadLote="item.cantidad_lote"
                          :id="item._id"
                          @reload="setReload" 
                        /> -->
                                                <!-- RELOAD::: <pre>{{ reload }}</pre> -->
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Costura`">
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    @reload="setReload"
                                                    :options="optionsEmpleados"
                                                    departamento="Costura"
                                                />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Limpieza`">
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    :options="optionsEmpleados"
                                                    departamento="Limpieza"
                                                    @reload="setReload"
                                                />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Revisión`">
                                        <b-row>
                                            <b-col
                                                v-for="(
                                                    item, index
                                                ) in itemsProducts"
                                                :key="index"
                                                cols="6"
                                            >
                                                <ul>
                                                    <li>
                                                        <strong>{{
                                                            item.name
                                                        }}</strong>
                                                    </li>
                                                    <li>
                                                        <strong>Corte:</strong>
                                                        {{ item.corte }}
                                                    </li>
                                                    <li>
                                                        <strong>Tela:</strong>
                                                        {{ item.tela }}
                                                    </li>
                                                    <li>
                                                        <strong>Talla:</strong>
                                                        {{ item.talla }}
                                                    </li>
                                                    <li>
                                                        <strong
                                                            >Cantidad:</strong
                                                        >
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccion-asignar-empleado
                                                    :item="item"
                                                    :lote="
                                                        loteInfo.lote_detalles
                                                    "
                                                    :options="optionsEmpleados"
                                                    departamento="Revisión"
                                                    @reload="setReload"
                                                />
                                            </b-col>
                                        </b-row>
                                    </b-tab>
                                </b-tabs>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-container>
                <pre>
          {{ loteInfo }}
        </pre
                >
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            overlay: true,
            size: "xl",
            imageWidth: "100%",
            imageHeight: "auto",
            title: "Asignar",
            loteInfo: [],
            optionsEmpleados: [],
            reload: false,
        }
    },

    watch: {
        reload() {
            if (this.reload) {
                this.overlay = true
                this.getLotInfo().then(() => (this.overlay = false))
            }
        },
    },

    computed: {
        itemsProducts() {
            /* const myId = toString(this.id)
      const tmpProd = this.$store.state.produccion.loteDetalles.orden_productos
      console.log(`PRoductos a filtrar`, tmpProd) */
            /* const products = tmpProd.filter((element) => {
        console.log(
          `¿Cargar id_orden ${myId} === ${parseInt(element.id_orden)}?`
        )
        return parseInt(element.id_orden) === myId
      }) */
            return this.loteInfo.orden_productos
        },

        fieldsProducts() {
            let arr = []

            arr.push(this.loteInfo.fields_orden_productos)

            return arr
            // return this.$store.state.produccion.loteDetalles.fields_orden_productos
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        setReload(val) {
            this.reload = val
        },
        token() {
            const length = 8
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                )
            var b = []
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0)
                b[i] = a[j]
            }
            return b.join("")
        },

        async getLotInfo() {
            await this.$axios
                .get(`${this.$config.API}/lotes/detalles/v2/${this.id}`)
                .then((res) => {
                    console.log("LOTEINFO:::", res.data)
                    this.loteInfo = res.data
                })
        },
    },

    props: ["id"],

    mounted() {
        axios
            .get(`${this.$config.API}/empleados/produccion/asignacion`)
            .then((res) => {
                this.optionsEmpleados = res.data
                this.getLotInfo().then(() => (this.overlay = false))
            })
    },
}
</script>

<style scoped>
.card-header {
    width: 160px !important;
}
</style>
