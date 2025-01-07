<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon>
        </b-button>
        <!-- <pre class="force">
            switches {{ switches }}
        </pre> -->
        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <h5>Asignación de insumos Lote {{ id }}</h5>
                            <b-table ref="table" responsive small striped :size="size" :items="orden_productos"
                                :fields="fieldsProducts">
                                <template #cell(_id)="data">
                                    <produccion-guardar-cantidad :cantidadLote="data.item.cantidad_lote"
                                        :id="data.item._id" @reload="setReload" />
                                    <!-- {{ data.item }} -->
                                </template>
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
                                    <b-tab :title="`Impresión`" active>
                                        <b-row>
                                            <b-col>
                                                <h3>
                                                    Asignación General Impresión
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optImpresion
                                                        " :options="filterOptiosnEmp(
                                                            'Impresión'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo(
                                                            'Impresión'
                                                        )
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                </b-form>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                    <li>
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccionsse-asignar-empleado :item="item" :lote="lote_detalles"
                                                    ref="asignarEmpleado" :lotes_fisicos="lotes_fisicos"
                                                    @reload="setReload" :empleados="empleados"
                                                    departamento="Impresión" />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Estampado`">
                                        <b-row>
                                            <b-col>
                                                <h3>
                                                    Asignación General Estampado
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optEstampado
                                                        " :options="filterOptiosnEmp(
                                                            'Estampado'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo(
                                                            'Estampado'
                                                        )
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                    <b-form-checkbox v-model="switches.switchEstampado
                                                        " @change="
                                                            postSwitch(
                                                                'Estampado',
                                                                switches.switchEstampado
                                                            )
                                                            " calss="mt-2" switch size="lg">Habilitar selección de
                                                        insumos</b-form-checkbox>
                                                </b-form>
                                                <p v-if="
                                                    form.optImpresion !=
                                                    null
                                                ">
                                                    Asignar
                                                    {{ form.optImpresion }} a
                                                    todas las tareas
                                                </p>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccionsse-asignar-empleado :item="item" ref="asignarEmpleado"
                                                    :lote="lote_detalles" :lotes_fisicos="lotes_fisicos"
                                                    @reload="setReload" :empleados="empleados"
                                                    departamento="Estampado" />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Corte`">
                                        <b-row>
                                            <b-col>
                                                <h3>
                                                    Asignación General Corte
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optCorte"
                                                        :options="filterOptiosnEmp(
                                                            'Corte'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo('Corte')
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                    <b-form-checkbox v-model="switches.switchCorte
                                                        " @change="
                                                            postSwitch(
                                                                'Corte',
                                                                switches.switchCorte
                                                            )
                                                            " calss="mt-2" switch size="lg">Habilitar selección de
                                                        insumos</b-form-checkbox>
                                                </b-form>
                                                <p v-if="
                                                    form.optImpresion !=
                                                    null
                                                ">
                                                    ASignar
                                                    {{ form.optImpresion }} a
                                                    todas las tareas
                                                </p>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <!-- <pre>{{ item }}</pre> -->
                                                <hr />
                                                <pre>item {{ item }}</pre>
                                                <produccionsse-asignar-empleado :item="item" ref="asignarEmpleado"
                                                    :lote="lote_detalles" :lotes_fisicos="lotes_fisicos
                                                        " @reload="setReload" :empleados="empleados"
                                                    departamento="Corte" />
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
                                            <b-col>
                                                <h3>
                                                    Asignación General Costura
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optCostura
                                                        " :options="filterOptiosnEmp(
                                                            'Costura'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo(
                                                            'Costura'
                                                        )
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                    <b-form-checkbox v-model="switches.switchCostura
                                                        " @change="
                                                            postSwitch(
                                                                'Costura',
                                                                switches.switchCostura
                                                            )
                                                            " calss="mt-2" switch size="lg">Habilitar selección de
                                                        insumos</b-form-checkbox>
                                                </b-form>
                                                <p v-if="
                                                    form.optImpresion !=
                                                    null
                                                ">
                                                    ASignar
                                                    {{ form.optImpresion }} a
                                                    todas las tareas
                                                </p>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccionsse-asignar-empleado :item="item" ref="asignarEmpleado"
                                                    :lote="lote_detalles" :lotes_fisicos="lotes_fisicos
                                                        " @reload="setReload" :empleados="empleados"
                                                    departamento="Costura" />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Limpieza`">
                                        <b-row>
                                            <b-col>
                                                <h3>
                                                    Asignación General Limpieza
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optLimpieza
                                                        " :options="filterOptiosnEmp(
                                                            'Limpieza'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo(
                                                            'Limpieza'
                                                        )
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                    <b-form-checkbox v-model="switches.switchLimpieza
                                                        " @change="
                                                            postSwitch(
                                                                'Limpieza',
                                                                switches.switchLimpieza
                                                            )
                                                            " calss="mt-2" switch size="lg">Habilitar selección de
                                                        insumos</b-form-checkbox>
                                                </b-form>
                                                <p v-if="
                                                    form.optImpresion !=
                                                    null
                                                ">
                                                    ASignar
                                                    {{ form.optImpresion }} a
                                                    todas las tareas
                                                </p>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccionsse-asignar-empleado :item="item" ref="asignarEmpleado"
                                                    :lote="lote_detalles" :lotes_fisicos="lotes_fisicos
                                                        " :empleados="empleados" departamento="Limpieza"
                                                    @reload="setReload" />
                                            </b-col>
                                        </b-row>
                                    </b-tab>

                                    <b-tab :title="`Revisión`">
                                        <b-row>
                                            <b-col>
                                                <h3>
                                                    Asignación General Revisión
                                                </h3>
                                                <b-form inline>
                                                    <b-form-select id="select-emp1" class="mr-2" v-model="form.optRevision
                                                        " :options="filterOptiosnEmp(
                                                            'Revisión'
                                                        )
                                                            " required></b-form-select>
                                                    <b-button @click="
                                                        asignarTodo(
                                                            'Revisión'
                                                        )
                                                        " variant="success">
                                                        <b-icon icon="check"></b-icon>
                                                    </b-button>
                                                    <b-form-checkbox v-model="switches.switchRevision
                                                        " @change="
                                                            postSwitch(
                                                                'Revisión',
                                                                switches.switchRevision
                                                            )
                                                            " calss="mt-2" switch size="lg">Habilitar selección de
                                                        insumos</b-form-checkbox>
                                                </b-form>
                                                <p v-if="
                                                    form.optImpresion !=
                                                    null
                                                ">
                                                    ASignar
                                                    {{ form.optImpresion }} a
                                                    todas las tareas
                                                </p>
                                                <hr />
                                            </b-col>
                                        </b-row>
                                        <b-row>
                                            <b-col v-for="(
                                                    item, index
                                                ) in itemsProducts" :key="index" cols="6">
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
                                                        <strong>Cantidad:</strong>
                                                        {{ item.cantidad }}
                                                    </li>
                                                </ul>
                                                <hr />
                                                <produccionsse-asignar-empleado :item="item" ref="asignarEmpleado"
                                                    :lote="lote_detalles" :lotes_fisicos="lotes_fisicos
                                                        " departamento="Revisión" @reload="setReload"
                                                    :empleados="empleados" />
                                            </b-col>
                                        </b-row>
                                    </b-tab>
                                </b-tabs>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-container>
                <!-- <pre>
          {{ lote_detalles }}
        </pre> -->
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"

export default {
    mixins: [mixin],

    data() {
        return {
            switches: {
                switchImpresion: true,
                switchEstampado: true,
                switchCorte: true,
                switchCostura: true,
                switchLimpieza: true,
                switchRevision: true,
            },
            form: {
                optImpresion: null,
                optEstampado: null,
                optCorte: null,
                optCostura: null,
                optLimpieza: null,
                optRevision: null,
            },
            overlay: false,
            size: "xl",
            imageWidth: "100%",
            imageHeight: "auto",
            title: "Asignar",
            loteInfo: this.orden_productos,
            optionsEmpleados: this.asign,
            reload_old: false,
        }
    },

    watch: {
        reload() {
            if (this.reload) {
                this.overlay = true
                // this.getLotInfo().then(() => (this.overlay = false))
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
            return this.orden_productos
        },

        fieldsProducts() {
            //let arr = []

            //arr.push(this.loteInfo.fields_orden_productos)

            return [
                {
                    key: "name",
                    label: "Producto",
                    sortable: false,
                },
                {
                    key: "corte",
                    label: "Corte",
                    sortable: false,
                },
                {
                    key: "talla",
                    label: "Talla",
                    class: "text-center",
                    sortable: false,
                },
                {
                    key: "tela",
                    label: "Tela",
                    sortable: false,
                },
                {
                    key: "cantidad",
                    label: "Solicitada",
                    class: "text-center",
                    sortable: false,
                },
                {
                    key: "cantidad_lote",
                    label: "Existencia",
                    class: "text-center",
                    sortable: false,
                },
                {
                    key: "_id",
                    label: "GC",
                    sortable: false,
                },
            ]

            // return this.$store.state.produccion.loteDetalles.fields_orden_productos
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        async postSwitch(departamento, estado) {
            const data = new URLSearchParams()
            let miEstado = null
            if (estado) {
                miEstado = 1
            } else {
                miEstado = 0
            }

            data.set("estado", miEstado)
            data.set("departamento", departamento)

            await this.$axios
                .post(`${this.$config.API}/config/select-empleados`, data)
                .then((res) => {
                    this.getConfigData()
                })
        },

        async getConfigData() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/config`)
                .then((res) => {
                    console.log("datos de cnfiguración del sistema", res.data)
                    this.$store.commit("datasys/setDataSys", res.data)
                    const activo = parseInt(res.data.activo)

                    if (activo) {
                        this.acceso = true
                        this.msg = "Bienvenido"
                        this.alertType = "info"
                    } else {
                        this.acceso = false
                        this.alertType = "warning"
                        this.msg = "Su cuenta ha sido suspendida"
                    }
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>No se recibió la información de la configuración del sistema</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        async updateEmpleadoTodo(item, id_empleado, departamento) {
            // this.overlay = true;

            console.log("item en reasdingar empleado", item)
            const data = new URLSearchParams()
            data.set("id_orden", item.id_orden)
            data.set("id_ordenes_productos", item._id)
            data.set("id_empleado", id_empleado)
            data.set("id_woo", item.id_woo)
            data.set("departamento", departamento)
            data.set("cantidad", item.cantidad)
            data.set("cantidad_orden", item.cantidad)

            console.log("datos a guardar")
            console.dir(data)

            await this.$axios
                .post(`${this.$config.API}/lotes/empleados/reasignar`, data)
                .then((res) => {
                    this.$nuxt.$emit("reload")

                    // Llamar al método del componente hijo 
                    this.$nuxt.$emit("updateEmpleadoTodoCompleted"); // Emitir el evento personalizado

                    // this.reloadPorcentaje()
                    // this.overlay = false;
                    // this.$store.dispatch('produccion/getPorcentaje2', this.item.id_orden)
                    // console.log('resultado empleadoAsignar', res.data)
                })
        },

        asignarTodo(departamento) {
            // validar campo dependiendo del departamento
            let optVal = null
            switch (departamento) {
                case "Impresión":
                    optVal = this.form.optImpresion
                    break

                case "Estampado":
                    optVal = this.form.optEstampado
                    break

                case "Corte":
                    optVal = this.form.optCorte
                    break

                case "Costura":
                    optVal = this.form.optCostura
                    break

                case "Limpieza":
                    optVal = this.form.optLimpieza
                    break

                case "Revisión":
                    optVal = this.form.optRevision
                    break

                default:
                    optVal = null
                    break
            }

            if (optVal != null) {
                this.itemsProducts.forEach((item) => {
                    // console.log("Asignar tarea:::", item);
                    this.updateEmpleadoTodo(item, optVal, departamento)
                })
                // alert("emitamos reload aqui");
                this.$emit("reload")
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de ${departamento}</p>`,
                    type: "warning",
                })
            }
        },

        asignarTodo_v2(departamento) {
            if (
                departamento === "Impresión" &&
                this.form.optImpresion != null
            ) {
                this.itemsProducts.forEach((item) => {
                    console.log("Asignar tarea:::", item)
                    this.updateEmpleadoTodo(
                        item,
                        this.form.optImpresion,
                        "Impresión"
                    )
                })
                this.$emit("reload")
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Impresíon</p>`,
                    type: "warning",
                })
            }

            if (
                departamento === "Estampado" &&
                this.form.optEstampado != null
            ) {
                alert(
                    `Asignemos todas las tareas al empleado ID ${this.form.optEstampado}`
                )
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Estampado</p>`,
                    type: "warning",
                })
            }

            if (departamento === "Corte" && this.form.optCorte != null) {
                alert(
                    `Asignemos todas las tareas al empleado ID ${this.form.optCorte}`
                )
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Corte</p>`,
                    type: "warning",
                })
            }

            if (departamento === "Costura" && this.form.optCostura != null) {
                alert(
                    `Asignemos todas las tareas al empleado ID ${this.form.optCostura}`
                )
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Costura</p>`,
                    type: "warning",
                })
            }

            if (departamento === "Limpieza" && this.form.optLimpieza != null) {
                alert(
                    `Asignemos todas las tareas al empleado ID ${this.form.optLimpieza}`
                )
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Limpieza</p>`,
                    type: "warning",
                })
            }

            if (departamento === "Revisión" && this.form.optRevision != null) {
                alert(
                    `Asignemos todas las tareas al empleado ID ${this.form.optRevision}`
                )
            } else {
                this.$fire({
                    title: "Dato requerido",
                    html: `<p>Seleccione un empleado para la asignación de Revisión</p>`,
                    type: "warning",
                })
            } /**/
        },

        filterOptiosnEmp(departamento) {
            let options = this.empleados
                .filter((el) => el.departamento === departamento)
                .map((empleado) => {
                    return {
                        value: empleado._id,
                        text: empleado.nombre,
                        // text: empleado.nombre + " ID  " + empleado._id,
                    }
                })
            options.unshift({ value: null, text: "Seleccione un empleado" })
            return options
        },

        setReload() {
            this.$emit("reload")
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

        /* async getLotInfo() {
      await this.$axios
        .get(`${this.$config.API}/lotes/detalles/v2/${this.id}`)
        .then((res) => {
          console.log('LOTEINFO:::', res.data)
          this.loteInfo = res.data
        })
    }, */
    },

    props: [
        "asign",
        "id",
        "orden_productos",
        "lote_detalles",
        "lotes_fisicos",
        "empleados",
        "reload",
        "reloadtest",
    ],

    mounted() {
        this.switches.switchEstampado = this.evalTF(this.$store.state.datasys.dataSys.sys_mostrar_rollo_en_empleado_estampado)
        this.switches.switchCorte = this.evalTF(this.$store.state.datasys.dataSys.sys_mostrar_rollo_en_empleado_corte)
        this.switches.switchCostura = this.evalTF(this.$store.state.datasys.dataSys.sys_mostrar_insumo_en_empleado_costura)
        this.switches.switchLimpieza = this.evalTF(this.$store.state.datasys.dataSys.sys_mostrar_insumo_en_empleado_limpieza)
        this.switches.switchRevision = this.evalTF(this.$store.state.datasys.dataSys.sys_mostrar_insumo_en_empleado_revision)

        this.$root.$on("bv::modal::show", (bvEvent, modalId) => {
            // this.getLotInfo().then(() => (this.overlay = false))
            /* axios
      .get(`${this.$config.API}/empleados/produccion/asignacion`)
      .then((res) => {
        this.optionsEmpleados = res.data
      }) */
        })
    },
}
</script>

<style scoped>
.card-header {
    width: 160px !important;
}
</style>
