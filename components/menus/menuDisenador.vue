<template>
  <div>
    <b-row>
      <b-col>
        <b-navbar toggleable="lg" type="dark" variant="info">
          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

          <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
              <b-nav-item to="/">
                <b-icon-house-fill></b-icon-house-fill>
              </b-nav-item>

              <router-link
                class="nav-link"
                to="/diseno/disenos"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Diseños
                </span>
              </router-link>

              <b-nav-item to="/diseno/terminados"> </b-nav-item>
              <router-link
                class="nav-link"
                to="/diseno/terminados"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Diseños Terminados
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/relacion-de-pagos"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Relacion de pagos
                </span>
              </router-link>

              <router-link
                class="nav-link"
                to="/diseno/tallas-y-personalizacion"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Tallas y Personalización
                </span>
              </router-link>
              <router-link
                class="nav-link"
                to="/logout"
                custom
                v-slot="{ navigate }"
              >
                <span @click="navigate" @keypress.enter="navigate" role="link">
                  Salir
                </span>
              </router-link>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </b-col>
    </b-row>

    <b-row>
      <b-col class="text-right pr-4 pt-2">
        <!-- <diseno-revisiones /> -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import buscar from '~/components/buscar/BarraDeBusqueda.vue'

export default {
  computed: {
    ...mapState('login', ['dataUser']),
  },
  components: {
    buscar,
  },
  props: ['user', 'departamento'],
}
</script>

<style scoped>
.user-info {
  font-size: 1.2rem;
}

.buscar {
  margin-top: 2rem;
}
</style>
