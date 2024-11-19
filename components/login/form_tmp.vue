<template>
  <div>
    <Loading :show="loading" :text="loadingText" />
    <b-container>
      <b-row class="text-center vh-100" align-v="center">
        <b-col align-v="center">
          <b-card style="max-width: 20rem" class="text-center" align-v="center">
            <h2>ninesys</h2>
            <hr />
            <b-form>
              <b-form-group
                id="input-group-1"
                label="Usuario:"
                label-for="user"
              >
                <b-form-input
                  id="user"
                  v-model="form.user"
                  type="text"
                  placeholder="Ingrese su usuario"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group
                id="input-group-2"
                label="Clave:"
                label-for="password"
              >
                <b-form-input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="Ingrese su clave"
                  required
                ></b-form-input>
              </b-form-group>

              <b-button type="submit" variant="primary" @click="letMeIn($event)"
                >Entrar</b-button
              >
            </b-form>
            <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import mixin from '~/mixins/mixins.js'
import axios from 'axios'

export default {
  data() {
    return {
      loading: false,
      loadingText: 'Validadndo sus datos, por favor espere...',
      form: {
        user: '',
        password: '',
      },
    }
  },
  computed: {
    ...mapState('login', ['access', 'dataUser']),
  },
  methods: {
    ...mapMutations('login', ['setDataUser', 'setAccess']),

    async letMeIn(event) {
      event.preventDefault()

      let ban = true
      let c = {}
      if (!this.form.user && !this.form.password) {
        ban = false
        c = {}
        this.$fire({
          type: 'error',
          title: 'Dato requerido',
          html: 'Introduzca su nombre de usuario y contraseña',
        })
      } else if (!this.form.user) {
        ban = false
        this.$fire({
          type: 'error',
          title: 'Dato requerido',
          html: 'Introduzca su nombre de usuario',
        })
      } else if (!this.form.password) {
        ban = false
        this.$fire({
          type: 'error',
          title: 'Dato requerido',
          html: 'Introduzca su contraseña',
        })
      }

      if (ban) {
        this.loading = true

        const data = new URLSearchParams()
        data.set('username', this.form.user)
        data.set('password', this.form.password)

        await axios
          .post(`${this.$config.API}/login`, data)
          .then((res) => {
            console.log(`Respuesta de login: `, res.data.data.access)
            if (res.data.data.access === true) {
              this.$store.commit('login/setDataUser', res.data.data)
              this.$store.commit('login/setAccess', res.data.data.access)
              // this.setDataUser(res.data.data.res)
              // console.log(`Store Login:`, this.$store.state.login)
            } else {
              this.loading = false
              this.$fire({
                type: 'warning',
                title: 'Datos incorrectos',
                html: 'Verifiquelos e intente de nuevo.',
              })
              this.loading = false
            }
          })
          .catch((err) => {
            this.$fire({
              type: 'error',
              title: 'Error',
              html: err,
            })
            this.loading = false
          })

        /* let conf = {
          url: '/login',
          method: 'post',
          data: data,
        }

        this.ozhttp(conf)
          .then(() => {
            if (this.json.data.access == true) {
              this.$store.commit('login/setDataUser', this.json.data.res)
              this.$store.commit('login/setAccess', this.json.data.access)
              this.setDataUser(this.json.data.res)
            } else {
              this.loading = false
              this.$fire({
                type: 'error',
                title: 'Error',
                html: 'Sus datos son incorrectos, verifiquelos e intente de nuevo.',
              })
              this.loading = false
            }
          })
          .then(() => {
            this.loading = false
          }) */
      }
    },

    letMeIn2() {
      const data = new URLSearchParams()
      data.set('username', 'Sara')
      data.set('password', '123')

      let conf = {
        url: '/login',
        method: 'post',
        data: data,
      }

      this.ozhttp(conf).then((data) => {
        console.dir(data)
        if (data.access == true) {
          console.log('Vamos a guardar los datos' + JSON.stringify(data))
          this.saveUserData(data)
        } else {
          console.log('El acceso es ' + data.access + ' :(')
        }
      })
    },
  },

  mixins: [mixin],
}
</script>

<style scoped>
.card {
  margin: 0 auto; /* Added */
  float: none; /* Added */
  margin-bottom: 10px; /* Added */
}
</style>
