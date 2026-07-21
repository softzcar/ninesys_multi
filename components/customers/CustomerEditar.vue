<template>
    <div>
        <b-button variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" cancel-disabled ok-disabled footerClass="d-none" lazy>
            <b-container>
                <b-row>
                    <b-col>
                        <p>
                            <b-overlay :show="overlay" spinner-small>
                                <b-form novalidate @submit="onSubmit" @reset="onReset">
                                    <b-form-group id="input-group-4" label="Teléfono:" label-for="input-phone">
                                        <b-form-input id="input-phone" v-model="form.phone" placeholder="Teléfono"
                                            required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-1" label="Nombres:" label-for="input-first_name">
                                        <b-form-input id="input-first_name" v-model="form.first_name"
                                            placeholder="Nombres" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-2" label="Apellidos:" label-for="input-last_name">
                                        <b-form-input id="input-last_name" v-model="form.last_name"
                                            placeholder="Apellidos" required></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-3" label="Cédula:" label-for="input-cedula">
                                        <b-form-input id="input-cedula" v-model="form.cedula" placeholder="Cédula"></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-5" label="Email:" label-for="input-email">
                                        <b-form-input id="input-email" v-model="form.email" placeholder="Email"></b-form-input>
                                    </b-form-group>

                                    <b-form-group id="input-group-6" label="Dirección:" label-for="input-address">
                                        <b-form-input id="input-address" v-model="form.address" placeholder="Dirección"></b-form-input>
                                    </b-form-group>

                                    <SelectorGeografico v-model="form.geografia" />

                                    <b-form-group id="input-group-7" label="Mensajes Automáticos:" label-for="input-recibir-notificaciones">
                                        <b-form-checkbox id="input-recibir-notificaciones" v-model="form.recibir_notificaciones" switch>
                                            {{ form.recibir_notificaciones ? 'Recibir Mensajes Automáticos' : 'NO Recibir Mensajes Automáticos' }}
                                        </b-form-checkbox>
                                    </b-form-group>

                                    <b-button type="submit" variant="primary">Guardar</b-button>
                                    <b-button @click="resetForm" variant="danger">Limpiar</b-button>
                                </b-form>
                            </b-overlay>
                        </p>
                    </b-col>
                </b-row>
            </b-container>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
import SelectorGeografico from "~/components/customers/SelectorGeografico.vue"
import phoneValidation from "~/mixins/phoneValidation.js"

export default {
    components: { SelectorGeografico },
    mixins: [phoneValidation],
    data() {
        return {
            form: {
                filter: null,
                first_name: "",
                last_name: "",
                cedula: "",
                phone: "",
                email: "",
                address: "",
                recibir_notificaciones: true,
                geografia: { idPais: null, idEstado: null, idCiudad: null },
            },
            size: "md",
            title: "Editar Cliente",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        async guardarCustomer() {
            if (!this.form.first_name || !this.form.first_name.trim() || !this.form.last_name || !this.form.last_name.trim()) {
                this.$fire({
                    title: "Datos requeridos",
                    html: "<p>Debe indicar el nombre y el apellido del cliente.</p>",
                    type: "warning",
                })
                return
            }

            if (!this.form.geografia.idPais || !this.form.geografia.idEstado || !this.form.geografia.idCiudad) {
                this.$fire({
                    title: "Datos requeridos",
                    html: "<p>Debe seleccionar el País, Estado y Ciudad del cliente.</p>",
                    type: "warning",
                })
                return
            }

            // Validar teléfono
            const phoneCheck = this.validateAndFormatPhone(this.form.phone);
            if (!phoneCheck.isValid) {
                this.$fire({
                    title: "Teléfono Inválido",
                    text: phoneCheck.error,
                    type: "warning"
                });
                return;
            }

            this.overlay = true
            const data = new URLSearchParams()
            data.set("id", this.item.id)
            data.set("first_name", this.form.first_name)
            data.set("last_name", this.form.last_name)
            data.set("cedula", this.form.cedula)
            data.set("phone", phoneCheck.formatted)
            data.set("email", this.form.email)
            data.set("address", this.form.address)
            data.set("recibir_notificaciones", this.form.recibir_notificaciones ? "1" : "0")
            if (this.form.geografia.idPais) data.set("id_catalogo_pais", this.form.geografia.idPais)
            if (this.form.geografia.idEstado) data.set("id_catalogo_estado", this.form.geografia.idEstado)
            if (this.form.geografia.idCiudad) data.set("id_catalogo_ciudad", this.form.geografia.idCiudad)

            await this.$axios
                .post(`${this.$config.API}/customers/edit1`, data)
                .then((res) => {
                    console.log("resultado customer editar", res)
                    //   this.resetForm()
                    this.$emit("reload")
                    this.overlay = false
                    this.$bvModal.hide(this.modal)
                })
                .catch((err) => {
                    this.overlay = false
                    let errorHtml = `<p>No se guardó el registro</p><p>Verifique que ha escrito un email válido</p>`;
                    if (err.response?.data?.error === 'phone_duplicate') {
                        const cust = err.response.data.customer;
                        errorHtml = `<p>El número de teléfono ya está registrado al cliente <strong>${cust.first_name} ${cust.last_name}</strong> (ID: ${cust.id}).</p>`;
                    }
                    this.$fire({
                        title: err.response?.data?.error === 'phone_duplicate' ? "Teléfono Duplicado" : "Error",
                        html: errorHtml,
                        type: "warning",
                    })
                })
        },

        onSubmit(event) {
            event.preventDefault()
            this.guardarCustomer()
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                insumo: "",
                unidad: "",
                cantidad: "",
                departamento: "",
            }
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },

        resetForm() {
            this.overlay = true
            this.form = {
                first_name: "",
                last_name: "",
                cedula: "",
                phone: "",
                email: "",
                address: "",
                recibir_notificaciones: true,
                geografia: { idPais: null, idEstado: null, idCiudad: null },
            }
            this.overlay = false
        },
    },
    mounted() {
        this.form = {
            first_name: this.item.first_name,
            last_name: this.item.last_name,
            cedula: this.item.cedula,
            phone: this.item.phone,
            email: this.item.email,
            address: this.item.address,
            recibir_notificaciones: this.item.recibir_notificaciones !== undefined ? (Number(this.item.recibir_notificaciones) === 1) : true,
            geografia: {
                idPais: this.item.id_catalogo_pais ? Number(this.item.id_catalogo_pais) : null,
                idEstado: this.item.id_catalogo_estado ? Number(this.item.id_catalogo_estado) : null,
                idCiudad: this.item.id_catalogo_ciudad ? Number(this.item.id_catalogo_ciudad) : null,
            },
        }
    },

    props: ["item"],
}
</script>
