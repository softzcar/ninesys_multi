<template>
    <div>
        <!-- <b-button @click="$bvModal.show(modal)" :variant="ButtonVariant">{{ -->
        <pre style="background-color: chocolate">
       item::: {{ item }}
      </pre
        >
        <b-button @click="flujoDeTrabajo(item)" :variant="ButtonVariant">{{
            ButtonText
        }}</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <pre>
        {{ $props }}
    </pre
            >
            <pre> dataTable2 {{ dataTable2 }}</pre>
            <b-overlay :show="overlay" spinner-small>
                <b-alert
                    class="text-center pt-4"
                    v-if="
                        dataTable2.length === 0 &&
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

                <div v-else>
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
                            Va a terminar la terea en curso
                        </h3>
                    </div>

                    <div class="text-center mt-4 mb-4">
                        <b-button
                            :variant="ButtonVariant"
                            @click="terminarTrabajo(item)"
                            >{{ ButtonText }}</b-button
                        >
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
            ButtonText: "TERMINAR TAREA",
            ButtonVariant: "success",
            currentTask: null,
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
            this.$bvModal.show(this.modal)
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
                    this.registrarEstado("fin", item.id_lotes_detalles)
                })
                .catch(() => {
                    return false
                })
        },

        async registrarEstado(tipo, id_lote_detalles) {
            // tipos: inicio, fin
            this.overlay = true
            if (this.ButtonText === "INICIAR TAREA") {
                this.ButtonText = "TERMINAR TAREA"
                this.ButtonVariant = "success"
            }

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.dataUser.departamento}/${id_lote_detalles}/${this.item.unidades}`
                )
                .then((resp) => {
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
                    this.$emit("reload")
                    this.$bvModal.hide(this.modal)
                })
        },

        reloadMe() {
            console.log("ReloadMe() en BotonTerminarModalInput")
        },
    },

    props: ["item", "itemfather", "reload"],
}
</script>
