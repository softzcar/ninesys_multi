<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Comercialización' ||
          dataUser.departamento === 'Administración'
        "
      >
        <b-container>
          <b-row>
            <b-col>
              <h1 class="mb-4">Otros Abonos</h1>
            </b-col>
          </b-row>
          <b-row>
            <b-col
              xs="12"
              sm="12"
              md="6"
              lg="4"
              xl="4"
              offset-md="6"
              offset-lg="8"
              offset-xl="8"
            >
              <h5>Tasas del día</h5>
              <b-form>
                <b-form-group label="Peso">
                  <b-form-input
                    type="number"
                    v-model="peso"
                    @change="guardarPeso"
                  />
                </b-form-group>
                <b-form-group label="Dólar">
                  <b-form-input
                    type="number"
                    class="mb-4"
                    v-model="dolar"
                    @change="guardarDolar"
                  />
                </b-form-group>
              </b-form>
            </b-col>
          </b-row>
        </b-container>

        <b-container v-if="tasasCargadas">
          <b-overlay :show="overlay" spinner-small>
            <b-row class="mb-4">
              <b-col>
                <b-alert show class="mb-4" variant="warning">
                  Desde aqui puede hacer abonos adicionales a los pagos de las
                  ordenes.
                  <strong
                    >si va a hacer un abono a una orden, hagalo desde el
                    siguiente link:
                    <router-link
                      class="nav-link"
                      to="/comercializacion/ordenes/activas"
                      custom
                      v-slot="{ navigate }"
                    >
                      <span
                        @click="navigate"
                        @keypress.enter="navigate"
                        style="display: inline; padding: 0"
                        class="blue-link"
                        role="link"
                      >
                        Ordenes En Curso
                      </span>
                    </router-link></strong
                  >
                </b-alert>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <h2 class="mb-4">
                  MONTO DEL ABONO {{ form.abono }}
                  <b-button
                    size="lg"
                    class="ml-4"
                    variant="success"
                    @click="enviarAbono"
                    >ABONAR</b-button
                  >
                </h2>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <h4>Detalle del abono</h4>
                <b-form-textarea v-model="form.detalle"></b-form-textarea>
              </b-col>
            </b-row>

            <b-row>
              <b-col xl="3" lg="3" md="3" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Tipo de abono</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-select
                      v-model="tipoAbono"
                      :options="options"
                      size="sm"
                      class="mt-3"
                    ></b-form-select>
                  </b-col>
                </b-row>
              </b-col>

              <b-col xl="3" lg="3" md="3" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Dólares {{ totalDolares }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-1"
                      label="EFECTIVO"
                      label-for="input-dolares-efectivo"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-dolares-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        @change="updateMontoAbono"
                        v-model="form.montoDolaresEfectivo"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-2"
                      label="ZELLE"
                      label-for="input-dolares-zelle"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-dolares-zelle"
                        type="number"
                        step="0.10"
                        min="0"
                        @change="updateMontoAbono"
                        v-model="form.montoDolaresZelle"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-3"
                      label="BANESCO PANAMA"
                      label-for="input-dolares-zelle"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-dolares-zelle"
                        type="number"
                        step="0.10"
                        min="0"
                        @change="updateMontoAbono"
                        v-model="form.montoDolaresPanama"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
              <b-col xl="3" lg="3" md="3" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Pesos {{ totalPesos }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-4"
                      label="EFECTIVO"
                      label-for="input-dolares-efectivo"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-pesos-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoPesosEfectivo"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-5"
                      label="TRANSFERENCIA"
                      label-for="input-dolares-zelle"
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-pesos-dolares-zelle"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoPesosTransferencia"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
              <b-col xl="3" lg="3" md="3" sm="12">
                <b-row>
                  <b-col>
                    <hr />
                    <h4>Bolívares {{ totalBolivares }}</h4>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-6"
                      label="PAGO MOVIL"
                      label-for="input-bolivares-pagomovil "
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-bolivares-pagomovil"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoBolivaresPagomovil"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-6"
                      label="PUNTO"
                      label-for="input-bolivares-punto "
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-bolivares-punto"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoBolivaresPunto"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-6"
                      label="EFECTIVO"
                      label-for="input-bolivares-efectivo "
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-bolivares-efectivo"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoBolivaresEfectivo"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>

                <b-row align-h="start">
                  <b-col>
                    <b-form-group
                      id="input-group-6"
                      label="TRANSFERENCIA"
                      label-for="input-bolivares-transferencia "
                      class="pl-2"
                    >
                      <b-form-input
                        id="input-bolivares-transferencia"
                        type="number"
                        step="0.10"
                        min="0"
                        v-model="form.montoBolivaresTransferencia"
                        @change="updateMontoAbono"
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-overlay>
        </b-container>

        <b-container v-else>
          <b-row>
            <b-col>
              <b-alert show variant="warning"
                >Por favor asigne las tasas del dólar y el peso</b-alert
              >
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      titulo: 'Otros Abonos',
      overlay: false,
      totalAbono: 0,
      dolar: this.$store.state.comerce.dolar,
      peso: this.$store.state.comerce.peso,
      options: [
        { value: null, text: 'Seleccione' },
        { value: 'Abonos', text: 'Abono a ordenes', disabled: true },
        { value: 'Otros', text: 'Otro motivo' },
      ],
      form: {
        abono: 0,
        detalle: '',
        montoDolaresEfectivo: 0,
        montoDolaresZelle: 0,
        montoDolaresPanama: 0,
        montoPesosEfectivo: 0,
        montoPesosTransferencia: 0,
        montoBolivaresEfectivo: 0,
        montoBolivaresPunto: 0,
        montoBolivaresPagomovil: 0,
        montoBolivaresTransferencia: 0,
      },
    }
  },

  computed: {
    ...mapState('login', ['dataUser', 'access']),

    tasasCargadas() {
      let cargadas = false
      if (this.dolar > 0 && this.peso > 0) {
        cargadas = true
      }
      return cargadas
    },

    totalDolares() {
      let totalDolares = 0
      let dolaresEfectivo = parseFloat(this.form.montoDolaresEfectivo)
      let dolaresZelle = parseFloat(this.form.montoDolaresZelle)
      let dolaresPanama = parseFloat(this.form.montoDolaresPanama)

      if (!dolaresEfectivo) {
        dolaresEfectivo = 0.0
      }
      if (!dolaresPanama) {
        dolaresPanama = 0.0
      }
      if (!dolaresZelle) {
        dolaresZelle = 0.0
      }

      totalDolares = dolaresEfectivo + dolaresPanama + dolaresZelle
      this.updateMontoAbono()
      return totalDolares.toFixed(2)
    },

    totalPesos() {
      let totalPesos = 0
      let pesosEfectivo = parseFloat(this.form.montoPesosEfectivo)
      let pesosTransferencia = parseFloat(this.form.montoPesosTransferencia)

      if (!pesosEfectivo) {
        pesosEfectivo = 0.0
      }
      if (!pesosTransferencia) {
        pesosTransferencia = 0.0
      }

      totalPesos = pesosEfectivo + pesosTransferencia
      return totalPesos.toFixed(2)
    },

    totalBolivares() {
      let totalBolivares = 0
      let bolivaresEfectivo = parseFloat(this.form.montoBolivaresEfectivo)
      let bolivaresPagomovil = parseFloat(this.form.montoBolivaresPagomovil)
      let bolivaresPunto = parseFloat(this.form.montoBolivaresPunto)
      let bolivaresTransferencia = parseFloat(
        this.form.montoBolivaresTransferencia
      )

      if (!bolivaresEfectivo) {
        bolivaresEfectivo = 0.0
      }

      if (!bolivaresPagomovil) {
        bolivaresPagomovil = 0.0
      }

      if (!bolivaresPunto) {
        bolivaresPunto = 0.0
      }

      if (!bolivaresTransferencia) {
        bolivaresTransferencia = 0.0
      }

      totalBolivares =
        bolivaresEfectivo +
        bolivaresPagomovil +
        bolivaresTransferencia +
        bolivaresPunto
      return totalBolivares.toFixed(2)
    },

    totalAbono() {
      // CALCULO DOLARES
      const montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle)

      // CALCULO EN PESOS
      const montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.peso)

      // CALCULO EN BOLIVARES
      const montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.dolar)

      let total = montoDolares + montoPesos + montoBolivares

      if (isNaN(total)) total = 0
      return total.toFixed(2)
    },
  },

  methods: {
    fechaActual() {
      let date = new Date()
      let day = `${date.getDate()}`.padStart(2, '0')
      let month = `${date.getMonth() + 1}`.padStart(2, '0')
      let year = date.getFullYear()

      return `${year}-${month}-${day}`
    },

    async enviarAbono() {
      let ok = true
      let msg = ''

      if (parseFloat(this.form.abono) === 0) {
        ok = false
        msg = msg + '<p>El Total del abono no puede ser Cero</p>'
      }

      if (this.form.detalle.trim().length === 0) {
        ok = false
        msg = msg + '<p>Debe escribir el detalle del abono</p>'
      }

      if (this.tipoAbono === null) {
        ok = false
        msg = msg + '<p>Debe seleccionar el tipo abono</p>'
      }

      if (ok) {
        this.overlay = true
        const data = new URLSearchParams()
        data.set('id_empleado', this.$store.state.login.dataUser.id_empleado)
        data.set('form', this.form)
        data.set('tasa_dolar', this.dolar)
        data.set('tasa_peso', this.peso)
        data.set('montoDolaresEfectivo', this.form.montoDolaresEfectivo)
        data.set('montoDolaresZelle', this.form.montoDolaresZelle)
        data.set('montoDolaresPanama', this.form.montoDolaresPanama)
        data.set('montoPesosEfectivo', this.form.montoPesosEfectivo)
        data.set('montoPesosTransferencia', this.form.montoPesosTransferencia)
        data.set('montoBolivaresEfectivo', this.form.montoBolivaresEfectivo)
        data.set('montoBolivaresPunto', this.form.montoBolivaresPunto)
        data.set('montoBolivaresPagomovil', this.form.montoBolivaresPagomovil)
        data.set(
          'montoBolivaresTransferencia',
          this.form.montoBolivaresTransferencia
        )
        data.set('abono', this.form.abono)
        data.set('detalle', this.form.detalle)
        data.set('tipoAbono', this.tipoAbono)

        console.log('data:', data)

        await axios.post(`${this.$config.API}/otro-abono`, data).then((res) => {
          this.form = {
            detalle: '',
            montoDolaresEfectivo: 0,
            montoDolaresZelle: 0,
            montoDolaresPanama: 0,
            montoPesosEfectivo: 0,
            montoPesosTransferencia: 0,
            montoBolivaresEfectivo: 0,
            montoBolivaresPunto: 0,
            montoBolivaresPagomovil: 0,
            montoBolivaresTransferencia: 0,
            abono: 0, // Pago total o parcial
          }
          this.overlay = false
          // this.getDataReport(this.fechaActual()).then(() => {
          // })
        })
      } else {
        this.$fire({
          title: 'Se requieren datos',
          type: 'error',
          html: msg,
        })
      }
    },

    updateMontoAbono() {
      let newVal
      let montoBolivares
      let montoDolares
      let montoPesos

      // LIMPIAR VALORES ERRONEOS
      if (this.form.montoBolivaresEfectivo === '')
        this.form.montoBolivaresEfectivo = 0
      if (this.form.montoBolivaresPagomovil === '')
        this.form.montoBolivaresPagomovil = 0
      if (this.form.montoBolivaresPunto === '')
        this.form.montoBolivaresPunto = 0
      if (this.form.montoBolivaresTransferencia === '')
        this.form.montoBolivaresTransferencia = 0
      if (this.form.montoDolaresEfectivo === '')
        this.form.montoDolaresEfectivo = 0
      if (this.form.montoDolaresPanama === '') this.form.montoDolaresPanama = 0
      if (this.form.montoDolaresZelle === '') this.form.montoDolaresZelle = 0
      if (this.form.montoPesosEfectivo === '') this.form.montoPesosEfectivo = 0
      if (this.form.montoPesosTransferencia === '')
        this.form.montoPesosTransferencia = 0

      // RESET MONTO ABONO
      this.form.abono = 0

      // CALCULO DOLARES
      montoDolares =
        parseFloat(this.form.montoDolaresEfectivo) +
        parseFloat(this.form.montoDolaresPanama) +
        parseFloat(this.form.montoDolaresZelle)

      // CALCULO EN PESOS
      montoPesos =
        (parseFloat(this.form.montoPesosEfectivo) +
          parseFloat(this.form.montoPesosTransferencia)) /
        parseFloat(this.peso)

      // CALCULO EN BOLIVARES
      montoBolivares =
        (parseFloat(this.form.montoBolivaresEfectivo) +
          parseFloat(this.form.montoBolivaresPagomovil) +
          parseFloat(this.form.montoBolivaresPunto) +
          parseFloat(this.form.montoBolivaresTransferencia)) /
        parseFloat(this.dolar)

      // SUMATOORIA DE TODAS LAS MONEDAS
      console.log('dolares', montoDolares)
      console.log('pesos', montoPesos)
      console.log('bolivares', montoBolivares)
      newVal = (montoDolares + montoPesos + montoBolivares).toFixed(2)
      this.form.abono = newVal
      console.log('this.form.abono = ', newVal)
      return newVal
    },

    guardarPeso(val) {
      // this.peso = val
      this.$store.commit('comerce/setPeso', val)
      // Realiza alguna otra acción, como enviar los datos al servidor
    },
    guardarDolar(val) {
      // this.dolar = val
      this.$store.commit('comerce/setDolar', val)
      // Realiza alguna otra acción, como enviar los datos al servidor
    },

    /* NUEVO DE CIERRE DE CAJA */
    async getDataCierre() {
      await axios.get(`${this.$config.API}/cierre-de-caja`).then((res) => {
        this.pagos = res.data.data
      })
    },
  },

  mounted() {
    this.overlay = true
    this.getDataCierre().then(() => (this.overlay = false))
  },
}
</script>
