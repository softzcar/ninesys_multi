<template>
  <div>
    <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="diamond-half"></b-icon>
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col>
              <b-form @submit="onSubmit">
                <b-form-group
                  id="input-group-1"
                  label="Ajustes:"
                  label-for="input-ajustes"
                >
                  <b-form-input
                    id="input-ajustes"
                    v-model="form.ajustes"
                    type="number"
                    min="0"
                    step="1"
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                  id="input-group-2"
                  label="Personalizaciones:"
                  label-for="input-personalizaciones"
                >
                  <b-form-input
                    id="input-personalizaciones"
                    v-model="form.personalizaciones"
                    type="number"
                    min="0"
                    step="1"
                  ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Guardar</b-button>
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
        ajustes: 0,
        personalizaciones: 0,
      },
      size: 'md',
      title: 'Ajustes y Personalizaciones',
      overlay: false,
      responseData: null,
      responseFull: null,
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  methods: {
    async guardarDatos() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('id_diseno', this.item.id_diseno)
      data.set('ajustes', this.form.ajustes)
      data.set('personalizaciones', this.form.personalizaciones)

      await axios
        .post(`${this.$config.API}/diseno/ajustes-y-personalizaciones`, data)
        .then((res) => {
          this.overlay = false
          this.$bvModal.hide(this.modal)
        })
        .catch((err) => {
          this.$fire({
            title: 'Error',
            html: `<p>No se guardaron los datos</p><p>${err}</p>`,
            type: 'warning',
          })
        })
        .finally(() => {
          this.overlay = false
        })
    },

    async getDatos() {
      this.overlay = true

      await axios
        .get(
          `${this.$config.API}/disenos/ajustes-y-personalizaciones/${this.item.id_diseno}`
        )
        .then((res) => {
          this.responseFull = res.data
          this.responseData = res.data.map((el) => {
            if (el.tipo === 'ajuste') {
              this.form.ajustes = el.cantidad
            }

            if (el.tipo === 'personalizacion') {
              this.form.personalizaciones = el.cantidad
            }
          })
          this.overlay = false
          // this.$bvModal.hide(this.modal)
        })
        .catch((err) => {
          this.$fire({
            title: 'Error',
            html: `<p>No se obtuvieron los datos de Ajustes y Personalizaciones</p><p>${err}</p>`,
            type: 'warning',
          })
        })
        .finally(() => {
          this.overlay = false
        })
    },

    onSubmit(event) {
      event.preventDefault()
      this.guardarDatos()
    },
  },

  mounted() {
    this.getDatos()
  },

  props: ['item', 'reload'],
}
</script>
