<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            {{ btnText }}
        </b-button>

        <pre>{{ $props }}</pre>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                <b-container>
                    <b-row>
                        <b-col>
                            <b-form @submit="onSubmit" @reset="onReset">
                            </b-form>
                        </b-col>
                    </b-row>
                </b-container>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            empDep: this.$store.state.login.dataUser.departamento,
            title: "TITLE HERE",
            variant: "info",
            btnText: "Inicio",
            btnType: "text", // Estampado type: text, Impresion y corte type: number
            btnPressision: 0, // Estamapado 0 (el campo no aplica), Impresion y corte `2` decimales
            btnDisabld: false,
            form: {
                value: null, // Valor del input
            },
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        onSubmit(event) {
            event.preventDefault()
            alert(JSON.stringify(this.form))
            //this.guardarEmpleado().then(() => this.$emit('reload'))
        },

        reloadMe() {
            this.$emit("reload")
        },

        iniciarTodo(idOrden, items) {
            this.$confirm(
                ``,
                `¿Desea inicar todas las tareas de la Orden ${idOrden}?`,
                "question"
            )
                .then(() => {
                    items.forEach((item) => {
                        // enviar
                        this.registrarEstado(
                            "inicio",
                            item.id_lotes_detalles,
                            item.unidades
                        ).then(() => {
                            this.reloadMe()
                        })
                    })
                })
                .catch((err) => {
                    return false
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        terminarTodo(idOrden, items) {
            this.$confirm(
                ``,
                `¿Desea terminar todas las tareas de la Orden ${idOrden}?`,
                "question"
            )
                .then(() => {
                    items.forEach((item) => {
                        // enviar
                        this.registrarEstado(
                            "fin",
                            item.id_lotes_detalles,
                            item.unidades
                        ).then(() => {
                            this.reloadMe()
                        })
                    })
                })
                .catch((err) => {
                    return false
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        async registrarEstado(tipo, id_lotes_detalles, unidades) {
            // tipos: inicio, fin
            this.overlay = true
            if (this.ButtonText === "INICIAR TAREA") {
                // this.ButtonText = 'TERMINAR TAREA OLD'
                // this.ButtonVariant = 'success'
                this.ButtonDisabled = true
            }

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.dataUser.departamento}/${id_lotes_detalles}/${unidades}`
                )
                .then((resp) => {
                    console.log("emitimos aqui...")
                    this.overlay = false
                    // this.$emit('reload', 'true')
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error registrando la accion",
                        html: `<p>Por favor intetelo de nuevo</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    if (tipo === "fin") {
                        this.$emit("reload")
                    }
                })
        },
    },
    props: ["idorden", "items", "reload"],
}
</script>
