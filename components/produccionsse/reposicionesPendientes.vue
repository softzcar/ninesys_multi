<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="link">
            Orden {{ item.id_orden }} | {{ item.producto }}
            {{ item.unidades }} unidades
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <!-- <buscar-resultadoModal :id="id" /> -->
                <!-- <pre style="display: block !important">
             Hola {{ item }}
        </pre> -->

                <b-list-group class="mb-4">
                    <b-list-group-item
                        ><strong>Orden</strong>
                        {{ item.id_orden }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Enviada por</strong>
                        {{ item.empleado }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Fecha y Hora</strong> {{ item.fecha }},
                        {{ item.hora }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Detalle</strong>
                        {{ item.detalle_emisor }}</b-list-group-item
                    >
                    <b-list-group-item> </b-list-group-item>
                    <b-list-group-item
                        ><strong>Producto</strong>
                        {{ item.producto }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Unidades</strong>
                        {{ item.unidades }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Talla</strong>
                        {{ item.talla }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Corte</strong>
                        {{ item.corte }}</b-list-group-item
                    >
                    <b-list-group-item
                        ><strong>Tela</strong>
                        {{ item.tela }}</b-list-group-item
                    >
                </b-list-group>

                <b-form @submit="onSubmit">
                    <!-- <b-form-group
            id="input-group-1"
            label="Cantidad:"
            label-for="input-1"
            description="Cantidad de piezas a reponer."
          >
             <b-form-input
              style="width: 90px"
              id="input-1"
              step="1"
              min="0"
              v-model="form.cantidad"
              type="number"
            >
            </b-form-input>
          </b-form-group> -->

                    <b-form-group
                        id="input-group-2"
                        label="Empleado:"
                        label-for="select-empleado"
                        description="Empleado involucrado en la reposición."
                    >
                        <b-form-select
                            id="select-empleado"
                            v-model="form.emp"
                            :options="selectEmpleados"
                            :value="form.emp"
                            size="sm"
                            style="width: 45%"
                        ></b-form-select>
                    </b-form-group>
                    <b-form-group
                        id="input-group-2"
                        label="Detalle:"
                        label-for="input-2"
                        description="Describa el detalle de la reposición."
                    >
                        <b-form-textarea
                            id="textarea"
                            v-model="form.detalle"
                            no-auto-shrink
                            size="sm"
                            no-resize
                            rows="3"
                            max-rows="20"
                        >
                        </b-form-textarea>
                    </b-form-group>

                    <b-button type="submit" variant="primary">Aceptar</b-button>
                    <b-button @click="validarRechazo" variant="danger"
                        >Rechazar</b-button
                    >
                </b-form>
                item::: {{ item }}
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
export default {
    data() {
        return {
            title: `Reposicion orden ${this.item.id_orden}`,
            overlay: false,
            statusbutton: "outline-primary",
            form: {
                emp: 0,
                detalle: "",
                aprobada: null,
            },
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        selectEmpleados() {
            let tmp = this.empleados.map((item) => {
                return {
                    value: item._id,
                    text: item.nombre,
                }
            })

            tmp.unshift({ value: 0, text: "Seleccione un empleado" })

            return tmp
        },
    },

    methods: {
        onSubmit(event) {
            event.preventDefault()
            this.validarReposicion()
            //   alert(JSON.stringify(this.form));
            //this.guardarEmpleado().then(() => this.$emit('reload'))
        },

        async postReposicion() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("id_orden", this.item.id_orden)
            data.set("id_reposicion", this.item.id_reposicion)
            data.set("aprobada", this.form.aprobada)
            data.set("id_empleado", this.form.emp)
            data.set(
                "id_empleado_emisor",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set("detalle", this.form.detalle)
            data.set("detalle_emisor", this.item.detalle_emisor)
            data.set("cantidad", this.item.unidades)
            data.set("id_ordenes_productos", this.item.id_ordenes_productos)

            await this.$axios
                .post(`${this.$config.API}/produccion/reposicion/final`, data)
                .then((res) => {
                    this.overlay = false
                    // TODO recargar datos del componenete madre
                })
        },

        validarReposicion() {
            let ok = true
            let msg = ""

            if (this.form.emp === 0) {
                ok = false
                msg += "<p>Seleccione un empleado</p>"
            }

            if (this.form.detalle.trim() === "") {
                ok = false
                msg += "<p>Debe proporcioar el detalle de la reposición</p>"
            } else if (this.form.detalle.trim().length < 6) {
                ok = false
                msg +=
                    "<p>El detalle de la reposición es muy corto, por favor sea más explicito</p>"
            }

            if (ok) {
                this.aprobarReposicion()
            } else {
                this.$fire({
                    title: "Datos requeridos",
                    html: msg,
                    type: "warning",
                })
            }
        },

        validarRechazo() {
            let ok = true
            let msg = ""

            if (this.form.detalle.trim() === "") {
                ok = false
                msg += "<p>Debe proporcioar el detalle de la reposición</p>"
            } else if (this.form.detalle.trim().length < 6) {
                ok = false
                msg +=
                    "<p>El detalle de la reposición es muy corto, por favor sea más explicito</p>"
            }

            if (ok) {
                this.rechazarReposicion()
            } else {
                this.$fire({
                    title: "Datos requeridos",
                    html: msg,
                    type: "warning",
                })
            }
        },

        aprobarReposicion() {
            this.$confirm(
                `Va a aprobar esta reposición ¿Desea continuar?`,
                "Aprobar",
                "question"
            ).then(() => {
                this.form.aprobada = 1
                this.postReposicion()
            })
        },

        rechazarReposicion() {
            this.$confirm(
                `¿Desea rechazar esta reposición?`,
                "Rechazar",
                "question"
            ).then(() => {
                this.form.aprobada = 0
                this.postReposicion()
            })
        },
    },

    props: ["item", "empleados"],
}
</script>
