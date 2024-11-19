<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div
        v-if="
          dataUser.departamento === 'Administración' ||
          dataUser.departamento === 'Producción'
        "
      >
        <b-overlay :show="overlay" spinner-small>
          <b-container>
            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <admin-TelasNuevo @reload="getTelas" />
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-table responsive :fields="fields" :items="dataTable.data">
                  <template #cell(_id)="data">
                    <span class="floatme">
                      <AdminTelasEditar :item="data.item" @reload="getTelas" />
                    </span>
                    <span class="floatme">
                      <b-button
                        variant="danger"
                        v-on:click="deleteTela(data.item.tela, data.item._id)"
                      >
                        <b-icon icon="trash"></b-icon>
                      </b-button>
                    </span>
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else><accessDenied /></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import { urlToHttpOptions } from 'http'

export default {
  data() {
    return {
      titulo: 'Gestión de Telas',
      overlay: true,
      dataTable: [],
      fields: [
        {
          key: 'tela',
          label: 'Tela',
        },
        {
          key: '_id',
          label: 'Acciones',
        },
      ],
    }
  },
  computed: {
    ...mapState('login', ['dataUser', 'access']),
  },
  methods: {
    async getTelas() {
      await axios.get(`${this.$config.API}/telas`).then((resp) => {
        this.dataTable = resp.data
        this.overlay = false
      })
    },

    deleteTela(tela, idTela) {
      this.$confirm(
        `¿Desea Elimiar la tela ${tela} ?`,
        'Eliminar Tela',
        'warning'
      )
        .then(() => {
          this.overlay = true
          const data = new URLSearchParams()
          data.set('id', idTela)

          axios.post(`${this.$config.API}/telas/eliminar`, data).then((res) => {
            this.getTelas().then(() => (this.overlay = false))
          })
        })
        .catch((err) => {
          console.log('CATCH!!!', err)
          return false
        })
    },
  },
  mounted() {
    this.getTelas().then(() => {
      console.log('data', this.dataTable)
      this.overlay = false
    })
  },
}
</script>
