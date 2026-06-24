<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon> {{ title }}
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer lazy>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                                <b-form-group
                                    id="input-group-1"
                                    label="Nombres:"
                                    label-for="input-first_name"
                                >
                                    <b-form-input
                                        id="input-first_name"
                                        v-model="form.first_name"
                                        placeholder="Nombres"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-2"
                                    label="Apellidos:"
                                    label-for="input-last_name"
                                >
                                    <b-form-input
                                        id="input-last_name"
                                        v-model="form.last_name"
                                        placeholder="Apellidos"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-3"
                                    label="Cédula:"
                                    label-for="input-cedula"
                                >
                                    <b-form-input
                                        id="input-cedula"
                                        v-model="form.cedula"
                                        placeholder="Cédula"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-4"
                                    label="Teléfono:"
                                    label-for="input-phone"
                                >
                                    <b-form-input
                                        id="input-phone"
                                        v-model="form.phone"
                                        placeholder="Teléfono"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-5"
                                    label="Email:"
                                    label-for="input-email"
                                >
                                    <b-form-input
                                        id="input-email"
                                        v-model="form.email"
                                        placeholder="Email"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <b-form-group
                                    id="input-group-6"
                                    label="Dirección:"
                                    label-for="input-address"
                                >
                                    <b-form-input
                                        id="input-address"
                                        v-model="form.address"
                                        placeholder="Apellidos"
                                        required
                                    ></b-form-input>
                                </b-form-group>

                                <SelectorGeografico v-model="form.geografia" />

                                <b-form-group
                                    id="input-group-7"
                                    label="Mensajes Automáticos:"
                                    label-for="input-recibir-notificaciones"
                                >
                                    <b-form-checkbox
                                        id="input-recibir-notificaciones"
                                        v-model="form.recibir_notificaciones"
                                        switch
                                    >
                                        {{ form.recibir_notificaciones ? 'Recibir Mensajes Automáticos' : 'NO Recibir Mensajes Automáticos' }}
                                    </b-form-checkbox>
                                </b-form-group>

                                <b-button type="submit" variant="primary"
                                    >Guardar</b-button
                                >
                                <b-button @click="resetForm" variant="danger"
                                    >Limpiar</b-button
                                >
                            </b-form>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
import SelectorGeografico from "~/components/customers/SelectorGeografico.vue"
export default {
    components: { SelectorGeografico },
    data() {
        return {
            form: {
                first_name: "",
                last_name: "",
                cedula: "",
                phone: "",
                email: "",
                address: "",
                recibir_notificaciones: true,
                geografia: { idPais: null, idEstado: null, idCiudad: null },
            },
            unidadesOptions: [
                { value: "Mts", text: "Metros" },
                { value: "Kg", text: "Kilos" },
                { value: "Und", text: "Unidades" },
            ],
            size: "md",
            title: "Nuevo Cliente",
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
        async guardarCustomer() {
            if (!this.form.geografia.idPais || !this.form.geografia.idEstado || !this.form.geografia.idCiudad) {
                this.$fire({
                    title: "Datos requeridos",
                    html: "<p>Debe seleccionar el País, Estado y Ciudad del cliente.</p>",
                    type: "warning",
                })
                return
            }

            this.overlay = true
            const data = new URLSearchParams()
            data.set("first_name", this.form.first_name)
            data.set("last_name", this.form.last_name)
            data.set("cedula", this.form.cedula)
            data.set("phone", this.form.phone)
            data.set("email", this.form.email)
            data.set("address", this.form.address)
            data.set("recibir_notificaciones", this.form.recibir_notificaciones ? "1" : "0")
            if (this.form.geografia.idPais) data.set("id_catalogo_pais", this.form.geografia.idPais)
            if (this.form.geografia.idEstado) data.set("id_catalogo_estado", this.form.geografia.idEstado)
            if (this.form.geografia.idCiudad) data.set("id_catalogo_ciudad", this.form.geografia.idCiudad)

            await this.$axios
                .post(`${this.$config.API}/customers/nuevo`, data)
                .then((res) => {
                    console.log("resultado customer editar", res)
                    //   this.resetForm()
                    this.$emit("reload")
                    this.overlay = false
                    this.$bvModal.hide(this.modal)
                })
                .catch((err) => {
                    //   alert(`'error al guardar los datos' ${err}`)
                    this.$fire({
                        title: "Error",
                        html: `<p>No se guardó el registro</p><p>Verifique que el ha escrito un email válido</p>`,
                        type: "warning",
                    })
                })
        },

        /* async guardarCustomer() {
      this.overlay = true
      let dataOk = true

      if (this.form.first_name.trim === '') {
        dataOk = false
      }

      if (!dataOk) {
        this.$fire({
          title: 'todos los datos son obligatorios',
          html: ``,
          type: 'warning',
        })
      } else {
        const data = new URLSearchParams()
        data.set('first_name', this.form.first_name)
        data.set('last_name', this.form.last_name)
        data.set('cedula', this.form.cedula)
        data.set('phone', this.form.phone)
        data.set('email', this.form.email)
        data.set('address', this.form.address)

        await this.$axios
          .post(`${this.$config.API}/customers/nuevo`, data)
          .then((res) => {
            console.log('resultado customer nuevo', res)
            this.resetForm()
            this.$bvModal.hide(this.modal)
          })
      }
    }, */

        onSubmit(event) {
            event.preventDefault()
            this.guardarCustomer().then(() => this.$emit("reload"))
        },

        onReset(event) {
            event.preventDefault()
            // Reset our form values
            this.form = {
                customer: "",
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
    },
}
</script>
