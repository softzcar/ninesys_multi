<template>
    <div>
        <!-- <b-button @click="$bvModal.show(modal)" :variant="ButtonVariant">{{ -->
        <b-button @click="flujoDeTrabajo(item)" :variant="ButtonVariant">{{
            ButtonText
        }}</b-button>

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <b-overlay :show="overlay" spinner-small>
                <b-alert class="text-center pt-4" v-if="
                    dataTable2.length === 0 && item.progreso === 'en curso'
                " show variant="danger">
                    <h3 class="alert-heading">No ha seleccionado las telas</h3>
                    <p>
                        Seleccione los rollos de tela que utilizó antes de
                        terminar la tarea.
                    </p>
                </b-alert>

                <div v-else-if="item.progreso === 'en curso'">
                    <h3 class="text-center">
                        Llene los datos de el peso de las piezas
                    </h3>
                    <b-table class="mb-4" :fields="fields" striped :items="dataTable2">
                        <template #cell(cantidad)="data">
                            <empleados-BotonTerminarModalInput :item="data.item" :itemfather="itemfather"
                                :index="data.index" @reload="reloadMe" />
                        </template>
                    </b-table>
                    <div class="text-center mt-4 mb-4">
                        <b-button :variant="ButtonVariant" @click="terminarTrabajo(item)">{{ ButtonText }}</b-button>
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
            overlay: false,
            ButtonText: "TERMINAR NEW!",
            ButtonVariant: "success",
            currentTask: null,
            title: `Terminar Tarea`,
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
        mostrarInformacionActivo(item) {
            console.log("cargar informacion en el cuadro informativo", item)
        },

        flujoDeTrabajo(item) {
            this.overlay = true
            console.log("TERMINAR esta tarea")
            this.$confirm(
                `¿Terminó el trabajo con este producto?`,
                `${item.producto}`,
                "info"
            )
                .then(() => {
                    this.registrarEstado(
                        "fin",
                        item.id_lotes_detalles
                    ) /* .then(() => {
              this.terminarOrden(item.id_lotes_detalles)
            }) */
                })
                .finally(() => (this.overlay = false))

            /* // Verificar enq ue estado se encuetra el item
      if (!item.fecha_inicio) {
        console.log('iniciar esta tarea')
        this.$confirm(
          `¿Va a coemnzar a trabajar con éste producto?`,
          `${item.producto}`,
          'info'
        )
          .then(() => {
            // Mostrar informacion de trabajo activo
            // this.mostrarInformacionActivo(item)
            this.registrarEstado('inicio', item.id_lotes_detalles)
          })
          .finally(() => (this.overlay = false))
      } else {
        console.log('TERMINAR esta tarea')
        this.$confirm(
          `¿Terminó el trabajo con este producto?`,
          `${item.producto}`,
          'info'
        )
          .then(() => {
            this.registrarEstado('fin', item.id_lotes_detalles) 
          })
          .finally(() => (this.overlay = false))
      } */
        },

        terminarTrabajo(item) {
            this.$confirm(
                `¿Ha terminado con éste producto?`,
                `${item.producto}`,
                "info"
            )
                .then(() => {
                    this.terminarOrden(item.id_lotes_detalles)
                })
                .catch(() => {
                    return false
                })
        },

        async registrarEstado(tipo, id_lote_detalles) {
            // tipos: inicio, fin
            this.overlay = true
            if (this.ButtonText === "INICIAR") {
                this.ButtonText = "TERMINAR"
                this.ButtonVariant = "success"
            } else {
                tipo = "fin"
            }

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.dataUser.departamento}/${id_lote_detalles}`
                )
                .then((resp) => {
                    console.log("emitimos aqui...")
                    this.$emit("reload", "true")
                    this.overlay = false
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error registrando la accion",
                        html: "<p>Por favor intetelo de nuevo</p>",
                        type: "warning",
                    })
                })
        },
    },

    mounted() {
        /* if (this.item.progreso === 'en curso') {
      this.ButtonText = 'TERMINAR'
      this.ButtonVariant = 'success'
    } else {
      this.ButtonText = 'INICIAR'
      this.ButtonVariant = 'secondary'
    } */
        /* if (this.item.fecha_inicio) {
      this.ButtonText = 'TERMINAR'
      this.ButtonVariant = 'success'
    } else {
      this.ButtonText = 'INICIAR'
      this.ButtonVariant = 'secondary'
      console.log(
        'el trabajo esta por inicar asignar secondary iniciar',
        this.item.fecha_inicio
      )
    } */
    },

    props: ["item", "reload"],
}
</script>
