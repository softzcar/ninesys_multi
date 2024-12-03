<template>
    <b-overlay :show="overlay" spinner-small>
        <!-- <pre>
      {{ $data }}
    </pre> -->
        <b-row>
            <b-col cols="9">
                <admin-pagos-empleados-terminar @reload="reloadMe" />
            </b-col>
            <b-col cols="3">
                <b-form @submit="onSubmit">
                    <b-form-group
                        id="input-group-1"
                        label="Fecha inicio:"
                        label-for="fecha-1"
                    >
                        <b-form-datepicker
                            id="fecha-1"
                            v-model="form.fechaInicio"
                            class="mb-2"
                        ></b-form-datepicker>
                    </b-form-group>

                    <b-form-group
                        id="input-group-2"
                        label="Fecha fin:"
                        label-for="fecha-2"
                    >
                        <b-form-datepicker
                            v-model="form.fechaFin"
                            class="mb-2"
                        ></b-form-datepicker>
                    </b-form-group>
                    <b-button type="submit" variant="primary">Submit</b-button>
                </b-form>
            </b-col>
        </b-row>
        <b-row>
            <b-col class="mt-4">
                <b-table
                    responsive
                    small
                    striped
                    :items="pagos"
                    :fields="fields"
                >
                    <template #cell(porcentaje)="data">
                        <!-- <pre>
              {{ data.item }}
            </pre> -->
                        <admin-ComisionesProductosInput
                            :temx="data.item"
                            @reload="reloadMe"
                        />
                    </template>
                </b-table>
            </b-col>
        </b-row>

        <!-- <pre>products::: {{ products }}</pre> -->
    </b-overlay>
</template>

<script>
import axios from "axios"

export default {
    data() {
        return {
            form: {
                fechaInicio: "",
                fechaFin: "",
            },
            overlay: true,
            pagos: [],
            products: [],
            fields: [
                {
                    key: "orden",
                    label: "Orden",
                },
                {
                    key: "producto",
                    label: "Producto",
                },
                {
                    key: "talla",
                    label: "Talla",
                },
                {
                    key: "nombre",
                    label: "Empleado",
                },
                {
                    key: "departamento",
                    label: "Departamento",
                },
                {
                    key: "dia",
                    label: "Día",
                },
                {
                    key: "semana",
                    label: "Semana",
                },
                {
                    key: "fecha",
                    label: "Fecha",
                },
                {
                    key: "cantidad",
                    label: "Cantidad",
                },
                {
                    key: "porcentaje",
                    label: "Porcentaje",
                },
                {
                    key: "pago",
                    label: "Pago",
                },
            ],
        }
    },

    methods: {
        onSubmit(event) {
            event.preventDefault()
            const fechaInicio = this.form.fechaInicio
            const fechaFin = this.form.fechaFin

            if (!fechaInicio || !fechaFin) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>Por favor seleccione ambas fechas</p>`,
                    type: "warning",
                })
                return
            }

            if (new Date(fechaInicio) > new Date(fechaFin)) {
                this.$fire({
                    title: "Datos requeridos",
                    html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
                    type: "warning",
                })
                return
            }
            this.getFilteredData()
            // alert('Enviemos el formulario AQIO!!!!')
            // aquí puedes agregar el código para enviar el formulario, si corresponde
            // alert(JSON.stringify(this.form))
        },
        async getPagos() {
            await this.$axios
                .get(`${this.$config.API}/pagos/semana`)
                .then((res) => {
                    this.pagos = res.data.data
                })
        },

        async getFilteredData() {
            this.overlay = true
            const data = new URLSearchParams()
            data.set("fecha_inicio", this.form.fechaInicio)
            data.set("fecha_fin", this.form.fechaFin)

            await this.$axios
                .post(`${this.$config.API}/pagos/semana`, data)
                .then((res) => {
                    this.overlay = false
                    this.pagos = []
                    this.pagos = res.data.data
                    // this.urlLink = res.data.linkdrive
                })
        },

        filterProd(id_woo, campo) {
            // campo puede ser: cod, attributes ó categories
            /* let myProd = this.products
        .filter((el) => el.cod === parseInt(id_woo))
        .map((el) => {
          return {
            cod: el.cod,
            attributes: el.attributes,
            categories: el.categories,
          }
        })
      if (myProd.length === 0) {
        myProd.push({
          cod: 0,
          attributes: [],
          categories: [],
        })
      }
      console.log('filterProd', myProd) */
            let myProd = this.products.filter(
                (el) => el.cod === parseInt(id_woo)
            )

            return myProd[0][campo]
        },

        reloadMe() {
            this.overlay = true
            this.pagos = []
            this.getAttributes().then(() => {
                this.getPagos().then(() => (this.overlay = false))
            })
        },

        async getAttributes() {
            await this.$axios
                .get(`${this.$config.API}/atributos/comisiones`)
                .then((res) => {
                    this.products = res.data.data
                })
        },
    },

    mounted() {
        this.getAttributes().then(() => {
            this.getPagos().then(() => (this.overlay = false))
        })
    },
}
</script>
