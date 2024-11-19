<template>
  <div>
    <b-button variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="pencil"></b-icon>
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      cancel-disabled
      ok-disabled
      footerClass="d-none"
    >
      <b-container>
        <b-row>
          <b-col>
            <p>
              <b-overlay :show="overlay" spinner-small>
                <pre>
                  {{ form }}
                </pre>
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
                      placeholder="Apellidos"
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
                  <b-button type="submit" variant="primary">Guardar</b-button>
                  <b-button @click="resetForm" variant="danger"
                    >Limpiar</b-button
                  >
                </b-form>
              </b-overlay>
            </p>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      form: {
        filter: null,
        first_name: '',
        last_name: '',
        cedula: '',
        phone: '',
        email: '',
        address: '',
      },
      size: 'md',
      title: 'Editar Cliente',
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
    async guardarCustomer() {
      this.overlay = true
      const data = new URLSearchParams()
      data.set('id', this.item.id)
      data.set('first_name', this.form.first_name)
      data.set('last_name', this.form.last_name)
      data.set('cedula', this.form.cedula)
      data.set('phone', this.form.phone)
      data.set('email', this.form.email)
      data.set('address', this.form.address)

      await axios
        .post(`${this.$config.API}/customers/edit1`, data)
        .then((res) => {
          console.log('resultado customer editar', res)
          //   this.resetForm()
          this.$emit('reload')
          this.overlay = false
          this.$bvModal.hide(this.modal)
        })
        .catch((err) => {
          //   alert(`'error al guardar los datos' ${err}`)
          this.$fire({
            title: 'Error',
            html: `<p>No se guardó el registro</p><p>Verifique que el ha escrito un email válido</p>`,
            type: 'warning',
          })
        })
    },

    onSubmit(event) {
      event.preventDefault()
      this.guardarCustomer()
    },

    onReset(event) {
      event.preventDefault()
      // Reset our form values
      this.form = {
        insumo: '',
        unidad: '',
        cantidad: '',
        departamento: '',
      }
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },

    resetForm() {
      this.overlay = true
      this.form = {
        first_name: '',
        last_name: '',
        cedula: '',
        phone: '',
        email: '',
        address: '',
      }
      this.overlay = false
    },
  },
  mounted() {
    this.form = {
      first_name: this.item.first_name,
      last_name: this.item.last_name,
      cedula: this.item.cedula,
      phone: this.item.phone,
      email: this.item.email,
      address: this.item.address,
    }
  },

  props: ['item'],
}
</script>
