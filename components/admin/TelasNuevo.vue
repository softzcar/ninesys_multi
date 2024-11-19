<template>
  <div>
    <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="plus-lg"></b-icon> Nueva Tela
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col>
              <b-form @submit="onSubmit" @reset="onReset">
                <b-form-group
                  id="input-group-1"
                  label="Tela:"
                  label-for="input-tela"
                >
                  <b-form-input
                    id="input-tela"
                    v-model="form.tela"
                    placeholder="Ingrese el nombre de la tela"
                    required
                  ></b-form-input>
                </b-form-group>
                <b-button type="submit" variant="primary">Guardar</b-button>
                <b-button @click="resetForm" variant="danger">Limpiar</b-button>
              </b-form>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      form: {
        tela: '',
      },
      accessOptions: [
        { value: 0, text: 'Empleado' },
        { value: 1, text: 'Administrador' },
      ],
      departamentOptions: this.$config.DEPARTAMENT_OPTIONS,
      size: 'md',
      title: 'Nuevo Empleado',
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
    resetForm() {
      this.overlay = true
      this.form = {
        username: '',
        password: '',
        nombre: '',
        email: '',
        acceso: null,
        comision: 0,
        departamento: '',
      }
      this.overlay = false
    },
    async guardarTela() {
      if (this.form.tela.trim().length === 0) {
        this.$fire({
          title: 'Dato Requerido',
          html: '<p>Ingrese el nombre de la tela</p>',
          type: 'info',
        })
      } else {
        this.overlay = true

        const data = new URLSearchParams()
        data.set('tela', this.form.tela)

        await axios.post(`${this.$config.API}/telas`, data).then((res) => {
          this.resetForm()
          this.$bvModal.hide(this.modal)
        })
      }
    },
    onSubmit(event) {
      event.preventDefault()
      // alert(JSON.stringify(this.form))
      this.guardarTela().then(() => this.$emit('reload'))
    },
    onReset(event) {
      event.preventDefault()
      // Reset our form values
      this.form.username = ''
      this.form.password = ''
      this.form.name = ''
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
  },
}
</script>
