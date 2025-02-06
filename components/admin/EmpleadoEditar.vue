<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="pencil"></b-icon>
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                                <!-- <b-form-group
                                    id="input-group-1"
                                    label="Username:"
                                    label-for="input-username"
                                >
                                    <b-form-input
                                        id="input-username"
                                        v-model="form.username"
                                        placeholder="Ingrese el nombre de usuario"
                                        required
                                    ></b-form-input>
                                </b-form-group> -->

                                <b-form-group id="input-group-3" label="Nombre:" label-for="input-name">
                                    <b-form-input id="input-name" v-model="form.nombre" placeholder="Ingrese el nombre"
                                        required>
                                    </b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-4" label="Email:" label-for="input-email">
                                    <b-form-input id="input-email" v-model="form.email" placeholder="Ingrese el nombre"
                                        required>
                                    </b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-2" label="Contraseña:" label-for="input-password">
                                    <b-form-input id="input-password" v-model="form.password"
                                        placeholder="Ingrese la contraseña" type="password" required></b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-5" label="Comisión fija:" label-for="input-comision">
                                    <b-form-input id="input-comision" v-model="form.comision" min="0" type="number"
                                        step="0.01" placeholder="Ingrese comisión">
                                    </b-form-input>
                                </b-form-group>

                                <b-form-group id="input-group-8" label="Tipo de comisión:" label-for="input-access">
                                    <b-form-select id="input-access" v-model="form.comsionTipo"
                                        :options="comisionOptions" required>
                                    </b-form-select>
                                </b-form-group>

                                <b-form-group id="input-group-6" label="Tipo de acceso:" label-for="input-access">
                                    <b-form-select id="input-access" v-model="form.acceso" :options="accessOptions"
                                        required>
                                    </b-form-select>
                                </b-form-group>

                                <b-form-group stacked label="Seleccione los departamentos:"
                                    v-slot="{ ariaDescribedby }">
                                    <b-form-checkbox-group id="checkbox-group-1" v-model="form.departamentos"
                                        :options="depOptions" :aria-describedby="ariaDescribedby"
                                        name="options-1"></b-form-checkbox-group>
                                </b-form-group>
                                <b-button type="submit" variant="primary">Guardar</b-button>
                                <b-button @click="resetForm" variant="danger">Limpiar</b-button>
                            </b-form>
                        </b-col>
                    </b-row>
                </b-container>
                <pre class="force">
                    $props {{ form.departamentos }}
                </pre>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                username: "",
                password: "",
                nombre: "",
                email: "",
                comision: 0,
                comsionTipo: 'variable',
                acceso: null,
                departamentos: [],
            },
            accessOptions: [
                { value: 0, text: "Empleado" },
                { value: 1, text: "Administrador" },
            ],
            comisionOptions: [
                { value: 'variable', text: "Variable" },
                { value: 'fija', text: "Fija" },
            ],
            departamentOptions: this.depOptions,
            size: "md",
            title: "Editar Empleado",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        depOptions() {
            let options = this.departamentos.map((el) => {
                return {
                    value: el._id,
                    text: el.departamento
                }
            })
            return options
        },
    },

    methods: {
        resetForm() {
            this.overlay = true
            this.form = {
                password: "",
                nombre: "",
                email: "",
                comision: 0,
                comsionTipo: 'variable',
                acceso: null,
                departamentos: [],
            }
            this.overlay = false
        },
        async guardarEmpleado() {
            this.overlay = true

            const data = new URLSearchParams()
            data.set("_id", this.item._id)
            data.set("acceso", this.form.acceso)
            data.set("departamentos", this.form.departamentos)
            data.set("email", this.form.email)
            data.set("nombre", this.form.nombre)
            data.set("password", this.form.password)
            data.set("comision", this.form.comision)
            data.set("comision_tipo", this.form.comsionTipo)

            await this.$axios
                .post(`${this.$config.API}/empleados/editar`, data)
                .then((res) => {
                    // this.resetForm()
                    this.$emit("reload", "true")
                    this.$bvModal.hide(this.modal)
                    this.overlay = false
                })
        },
        onSubmit(event) {
            event.preventDefault()
            // alert(JSON.stringify(this.form))
            this.guardarEmpleado().then(() => this.$emit("reload"))
        },
        onReset(event) {
            event.preventDefault()
            // Reset our form values
            /* this.form.username = ""
            this.form.password = ""
            this.form.name = "" */
            this.resetForm()
            // Trick to reset/clear native browser form validation state
            this.show = false
            this.$nextTick(() => {
                this.show = true
            })
        },
    },

    mounted() {
        this.form = {
            username: this.item.username,
            password: this.item.password,
            nombre: this.item.nombre,
            email: this.item.email,
            acceso: this.item.acceso,
            comision: this.item.comision,
            comsionTipo: this.item.comision_tipo,
            departamentos: this.item.departamentos,
        }
    },

    props: ["item", "departamentos"],
}
</script>
