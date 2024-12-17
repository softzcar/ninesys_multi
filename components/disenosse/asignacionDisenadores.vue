<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="info">
            <b-icon icon="person-plus"></b-icon>
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="sm">
            <!-- <pre class="force" style="background-color: red">
                item: {{ item }} </pre>
            <pre class="force" style="background-color: blue">
                form: {{ form }}</pre> -->
            <b-overlay :show="overlay" spinner-small>
                <!-- Formulario de Impresión -->
                <b-button variant="light" @click="addItem" aria-label="Agregar Diseñador">
                    <b-icon icon="plus-lg"></b-icon>
                </b-button>
                <b-table responsive :primary-key="form.id" :fields="campos" :items="form" small>
                    <template #cell(input)="row">
                        <diseno-reasignacionSelect :idorden="row.item.idorden" :options="options" :item="row.item"
                            @reload="updateEmpId($event, row.index)" @closemodal="closeModal" />
                    </template>

                    <template #cell(id)="row">
                        <b-button variant="danger" @click="removeItem(row.index)" aria-label="Agregar insumo">
                            <b-icon icon="trash"></b-icon>
                        </b-button>
                    </template>
                </b-table>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
// import axios from "axios"

export default {
    data() {
        return {
            title: `Asignación De Diseñadores`,
            overlay: false,
            ButtonDisabled: false,
            form: [],
            showSelect: false,
            formEst: {
                input: 0,
            },
            formCor: {
                input: 0,
            },
            formImp: {
                colorCyan: "",
                colorMagenta: "",
                colorYellow: "",
                colorBlack: "",
            },
            campos: [
                { key: "input", label: "" },
                { key: "id", label: "" },
            ],
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        /* generateRandomId() {
            let id
            do {
                // Generar un número aleatorio entre 100000 y 9999999
                id = Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000
            } while (this.form.some((obj) => obj.id === id)) // Asegurarse de que el ID no esté repetido en el array
            return id
        }, */

        closeModal() {
            this.$bvModal.hide(this.modal)
        },

        /* updateEmpId(id_empleado, index) {
            console.log("registro anterior", this.form)
            this.form[index].select = id_empleado
            console.log("registro actualizado", this.form)
        }, */

        updateEmpId(id_empleado, index) {
            console.log("registro anterior", this.form);

            // Verificar si el id_empleado ya existe en el formulario
            const idExists = this.form.some((item) => item.select === id_empleado);

            if (idExists) {
                console.error(`El ID ${id_empleado} ya existe en el formulario.`);
                // Mostrar mensaje de error al usuario
                this.$bvToast.toast(`El diseñador ya fué asignado a esta Orden.`, {
                    title: 'Error',
                    variant: 'danger',
                    solid: true
                });

                // Eliminar el registro del formulario
                this.form.splice(index, 1);
                console.log("registro eliminado", this.form);
            } else {
                this.form[index].select = id_empleado;
                console.log("registro actualizado", this.form);
            }
        },


        generateRandomId() {
            // Generar un número aleatorio entre 100000 y 9999999
            return Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000
        },

        addItem() {
            // const dep = this.$store.state.login.dataUser.departamento
            const random_id = this.generateRandomId()
            const obj = {
                id: random_id,
                select: null,
                input: 0.0,
                idorden: this.idorden,
            }
            this.form.push(obj)
        },

        async deleteDisenador(index) {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("id_diseno", this.item.id_diseno)
            data.set("id_orden", this.item.id_orden)
            data.set("id_empleado", this.item.empleado)

            await this.$axios
                .post(`${this.$config.API}/disenador-asignado`, data)
                .then((res) => {
                    console.log("Respuesta de delete disenador", res)
                    this.form.splice(index, 1)
                    this.$fire({
                        title: "Diseñador",
                        html: `<p>La asiganción fué eliminada</p>`,
                        type: "success",
                    })
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se eliminó el registro</p><p>${err}</p>`,
                        type: "warning",
                    })
                })
                .finally(() => {
                    this.overlay = false
                })
        },

        removeItem(index) {
            if (this.form[index].select != null) {
                this.$confirm(
                    `Va a eliminar la asignación de un diseñador, esta acción cancellará todo registro de asignación de pagos para esta tarea.`,
                    "Eliminar Diseñador",
                    "info"
                ).then(() => {
                    this.deleteDisenador(index)
                })
            } else {
                this.form.splice(index, 1)
            }
        },

        clearForms() {
            this.form = []
            this.formImp = {
                colorCyan: "",
                colorMagenta: "",
                colorYellow: "",
                colorBlack: "",
            }

            this.formEst = {
                input: 0,
            }

            this.formCor = {
                input: 0,
            }
        },

        onReserForm(event) {
            event.preventDefault()
            this.clearForms()
        },

        validateForm() {
            let ok = true
            if (this.showSelect) {
                let msg = ""

                if (this.departamento === "Impresión") {
                    if (
                        parseFloat(this.formImp.colorCyan) <= 0 ||
                        this.formImp.colorCyan.trim() === ""
                    ) {
                        ok = false
                        msg = msg + "<p>Ingrese la cantidad de tinta Cyan</p>"
                    }

                    if (
                        parseFloat(this.formImp.colorMagenta) <= 0 ||
                        this.formImp.colorMagenta.trim() === ""
                    ) {
                        ok = false
                        msg =
                            msg + "<p>Ingrese la cantidad de tinta Magenta</p>"
                    }

                    if (
                        parseFloat(this.formImp.colorYellow) <= 0 ||
                        this.formImp.colorYellow.trim() === ""
                    ) {
                        ok = false
                        msg = msg + "<p>Ingrese la cantidad de tinta Yellow</p>"
                    }

                    if (
                        this.formImp.colorBlack.trim() === "" ||
                        parseFloat(this.formImp.colorBlack) <= 0
                    ) {
                        ok = false
                        msg = msg + "<p>Ingrese la cantidad de tinta Black</p>"
                    }
                }

                if (this.departamento === "Corte") {
                    // VALIDAR DESPERDICIO
                    if (this.formCor.input === 0) {
                        ok = false
                        msg = msg + "<p>Ingrese el peso del desperdicio</p>"
                    }
                }

                if (this.form.length === 0) {
                    ok = false
                    msg = msg + "<p>Debe asignar al menos un insumo</p>"
                }

                const formTmp = this.form

                const errors = formTmp.find(
                    (el) => el.input === 0 || el.select === null
                )

                if (errors) {
                    ok = false
                    msg =
                        msg +
                        "<p>Debe llenar todos los campos del formulario</p>"
                }

                if (!ok) {
                    this.$fire({
                        type: "info",
                        title: "Datos requeridos",
                        html: msg,
                    })

                    // ok = false;
                } else {
                    if (this.departamento === "Impresión") {
                        this.postImp()
                    }

                    if (this.departamento === "Corte") {
                        // Enviar desperdicio
                        this.rendimiento(this.formCor.input, this.idorden)
                    }
                    this.terminarTodo()
                }
            } else {
                // Enviar solo el formulario aqui
                this.terminarTodo()
            }

            return ok
        },

        async postImp() {
            // this.overlay = true
            const data = new URLSearchParams()
            data.set("id_orden", this.idorden)
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set("c", this.formImp.colorCyan)
            data.set("m", this.formImp.colorMagenta)
            data.set("y", this.formImp.colorYellow)
            data.set("k", this.formImp.colorBlack)

            await this.$axios
                .post(`${this.$config.API}/empleados/tintas`, data)
                .then((res) => {
                    // this.overlay = false
                    // this.clearForms();
                    this.$emit("reload", "true")
                    // this.urlLink = res.data.linkdrive
                })

            // this.terminarTodo()
        },

        async postForm() {
            const data = new URLSearchParams()
            data.set("id_orden", idOrden)
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set("terminar", 1)
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            )
            data.set(
                "departamento",
                this.$store.state.login.dataUser.departamento
            )

            await this.$axios
                .post(`${this.$config.API}/insumos/rendimiento`, data)
                .then((res) => {
                    console.log("Rendimienot enviado")
                    // this.resetForm()
                    // this.$bvModal.hide(this.modal)
                })
        },

        terminarTodo() {
            this.form.forEach((el) => {
                console.log("Enviamos elemento del formulario", el)

                this.postInventarioMovimientos(
                    // this.formImp.inputImp1,
                    el.input,
                    el.select,
                    this.item.id_woo
                )
            })

            if (this.items.length) {
                this.items.forEach((item) => {
                    // enviar estado
                    this.registrarEstado(
                        "fin",
                        item.id_lotes_detalles,
                        item.unidades
                    ).then(() => {
                        /* this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
                            // console.log('Modal is about to be shown', bvEvent, modal)
                            }); */
                    })
                })
            }
            // this.clearForms()
            this.$emit("reload")
            this.$bvModal.hide(this.modal)
        },
    },

    mounted() {
        const myForm = this.$store.state.disenos.disenos.asignados.filter(el => el.id_orden == this.item.id_orden).map((el) => {
            const rand_id = this.generateRandomId()
            return {
                id: rand_id,
                select: el.id_empleado,
                input: 0,
                idorden: el.id_orden,
            }
        })
        this.form = myForm
    },

    props: ["idorden", "item", "options", "hastags", "reload"],
}
</script>

<style scoped>
.cmyk {
    margin-top: 20px;
    padding: 2px !important;
    width: 30% !important;
}

.black-label {
    background-color: black;
    color: antiquewhite;
}

.cyan-label {
    background-color: cyan;
    color: black;
}

.yellow-label {
    background-color: yellow;
    color: black;
}

.magenta-label {
    background-color: magenta;
    color: black;
}
</style>
