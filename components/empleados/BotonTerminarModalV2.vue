<template>
    <div>
        <!-- <b-button @click="$bvModal.show(modal)" :variant="ButtonVariant">{{ -->
        <b-button @click="flujoDeTrabajo(item)" :variant="ButtonVariant">{{
            ButtonText
        }}</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <pre>
        {{ $props }}
    </pre
            >
            <b-overlay :show="overlay" spinner-small>
                <b-alert
                    class="text-center pt-4"
                    v-if="
                        dataTable2.length === 0 &&
                        item.progreso === 'en curso' &&
                        this.$store.state.login.dataUser.departamento ===
                            'Corte'
                    "
                    show
                    variant="danger"
                >
                    <h3 class="alert-heading">No ha seleccionado las telas</h3>
                    <p>
                        Seleccione los rollos de tela que utilizó antes de
                        terminar la tarea.
                    </p>
                </b-alert>

                <div v-else-if="item.progreso === 'en curso'">
                    <div
                        v-if="
                            this.$store.state.login.dataUser.departamento ===
                            'Corte'
                        "
                    >
                        <h3 class="text-center">
                            Llene los datos de el peso de las piezas
                        </h3>
                        <b-table
                            class="mb-4"
                            :fields="fields"
                            striped
                            :items="dataTable2"
                        >
                            <template #cell(cantidad)="data">
                                <empleados-BotonTerminarModalInput
                                    :item="data.item"
                                    :itemfather="itemfather"
                                    :index="data.index"
                                    @reload="reloadMe"
                                />
                            </template>
                        </b-table>
                    </div>

                    <div v-else>
                        <h3 class="text-center">
                            Va a terminar la taraea en curso
                        </h3>
                    </div>

                    <div class="text-center mt-4 mb-4">
                        <b-button
                            :disabled="ButtonDisabled"
                            :variant="ButtonVariant"
                            @click="terminarTrabajo(item)"
                            >{{ ButtonText }}</b-button
                        >
                        <!-- <b-button :variant="ButtonVariant">{{ ButtonText }}</b-button> -->
                    </div>
                </div>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
import { mapState } from "vuex"

export default {
    data() {
        return {
            ButtonText: "INICIAR TAREA",
            ButtonVariant: "secondary",
            currentTask: null,
            ButtonDisabled: false,
            title: `Terminar Tarea`,
            overlay: false,
            fields: [
                {
                    key: "insumo",
                    label: "Insumo",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
            ],
        }
    },

    computed: {
        ...mapState("empleados", ["dataTable2"]),
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
    },

    methods: {
        flujoDeTrabajo(item) {
            //   this.overlay = true
            if (item.fecha_inicio) {
                this.$bvModal.show(this.modal)
            } else {
                // Verificar enq ue estado se encuetra el item
                console.log("iniciar esta tarea")
                this.$confirm(
                    `¿Va a coemnzar a trabajar con éste producto?`,
                    `${item.producto}`,
                    "info"
                )
                    .then(() => {
                        // Mostrar informacion de trabajo activo
                        // this.mostrarInformacionActivo(item)
                        this.registrarEstado("inicio", item.id_lotes_detalles)
                    })
                    .finally(() => (this.overlay = false))
            }
        },

        terminarTrabajo(item) {
            let msg
            if (this.$store.state.login.dataUser.departamento === "Corte") {
                msg = `¿Ha terminado con éste producto? RECUERDE INGRESAR EL PESO DE LAS PIEZAS CORTADAS ANTES DE TERMINAR`
            } else {
                msg = `¿Ha terminado con éste producto?`
            }

            this.$confirm(msg, `${item.producto}`, "info")
                .then(() => {
                    // this.terminarOrden(item.id_lotes_detalles)
                    this.registrarEstado("fin", item.id_lotes_detalles).then(
                        () => this.$bvModal.hide(this.modal)
                    )
                })
                .catch(() => {
                    return false
                })
        },

        async registrarEstado(tipo, id_lote_detalles) {
            // tipos: inicio, fin
            this.overlay = true
            if (this.ButtonText === "INICIAR TAREA") {
                // this.ButtonText = 'TERMINAR TAREA OLD'
                // this.ButtonVariant = 'success'
                this.ButtonDisabled = true
            }

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.dataUser.departamento}/${id_lote_detalles}/${this.item.unidades}`
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

        // piezas
        confirmTerminar() {
            this.$confirm(
                ``,
                "Al continuar confirma que ha ingresado el peso de los cortes correctamente",
                "question"
            )
                .then(() => {
                    alert("hagamos un $emit para terminar en el padre...?")
                })
                .catch(() => {
                    return false
                })
        },

        reloadMe() {
            console.log("ReloadMe() en BotonTerminarModalInput")
        },
    },

    mounted() {
        this.ButtonText = "INICIAR TAREA"
        this.ButtonVariant = "secondary"
        if (this.item.progreso === "en curso") {
            // this.ButtonText = 'TERMINAR TAREA'
            // this.ButtonVariant = 'success'
            this.ButtonDisabled = true
        }
    },

    props: ["item", "itemfather", "reload"],
}
</script>
