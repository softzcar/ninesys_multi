<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon>
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <!-- <pre>
          {{ item }}
        </pre> -->
                <b-row>
                    <b-col>
                        <h4>TOTAL PIEZAS SOLICITADAS: {{ item.cantidad }}</h4>
                        <h4>
                            TOTAL PIEZAS EN LOTES: {{ item.piezas_en_lote }}
                        </h4>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <div class="floatme">
                            <b-form-select
                                v-model="selected"
                                :options="empleadosSelect"
                                size="md"
                            ></b-form-select>
                        </div>

                        <div class="floatme">
                            <b-form-input
                                v-model="cantidad"
                                size="md"
                                min="0"
                                step="1"
                                type="number"
                                style="width: 60px"
                            ></b-form-input>
                        </div>

                        <div class="floatme">
                            <b-button
                                variant="success"
                                id="show-btn"
                                @click="validateSelect()"
                            >
                                <b-icon-check2-all></b-icon-check2-all>
                            </b-button>
                        </div>
                    </b-col>
                </b-row>
                <p></p>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
export default {
    data() {
        return {
            title: "Asignar Corte",
            overlay: false,
            selected: null,
            cantidad: 0,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },

        empleadosSelect() {
            let opt = this.empleados.map((item) => {
                return { value: item.id_empleado, text: item.nombre }
            })
            opt.unshift({ value: null, text: "" })
            return opt
        },
    },

    mounted() {},

    methods: {
        validateSelect() {
            /* let ban = true
      let msg = ''
      
      if (this.selected === null) {
        msg += '<p>No ha seleccionado ningún empleado</p>'
      }

      if (this.cantidad <= 0) {
        ban = false
      } */

            if (this.cantidad <= 0 || this.cantidad === "") {
                this.$fire({
                    title: "Faltan datos",
                    html: "<p>La cantidad a cortar no puede ser Cero</p>",
                    type: "warning",
                })
            } else {
                if (this.selected === null) {
                    // Confirmar enviar datos sin empleado seleccionado
                    this.$confirm(
                        `¿Desea enviar las ordenes a cortar sin empleado seleccionado?`,
                        "Verifique los datos",
                        "question"
                    )
                        .then(() => {
                            this.asignarTodo().then(
                                () => (this.overlay = false)
                            )
                        })
                        .catch(() => {
                            return false
                        })
                } else {
                    // Enviar datos
                    this.asignarTodo().then(() => (this.overlay = false))
                }
            }
        },

        async asignarTodo() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("id_empleado", this.selected)
            data.set("data", JSON.stringify(this.item.cantidadIndividual))
            // data.set('ordenes', this.ordenes)
            // data.set('cantidad', this.cantidad)
            // data.set('id_lotes_detalles', this.item.id_lotes_detalles)

            await this.$axios
                .post(
                    `${this.$config.API}/produccion/asignar-varias-ordenes-a-corte`,
                    data
                )
                .then((res) => {
                    /*  this.overlay = false
        this.pagos = []
        this.pagos = res.data
        this.pagosEmpleados = res.data.data.empleados
        this.pagosDiseno = res.data.data.diseno */
                    // this.urlLink = res.data.linkdrive
                })
        },
    },

    props: ["ordenes", "empleados", "item"],
}
</script>
