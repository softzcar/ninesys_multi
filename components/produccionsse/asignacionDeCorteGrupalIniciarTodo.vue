<template>
  <div>
    <b-button @click="iniciarTodo()" size="sm" variant="success">
      <b-icon-caret-right-square-fill></b-icon-caret-right-square-fill>
    </b-button>
    <pre pre style="width: 350px">
       Cantidad individual :::{{ item.cantidadIndividual }}
    </pre>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      progreso: '',
      overlay: false,
      ButtonText: 'INICIAR',
      ButtonVariant: 'secondary',
    }
  },

  mounted() {},

  methods: {
    async administrarTareas() {
      // tipos: inicio, fin
      //   this.overlay = true
      /* let tipo = ''
      if (this.ButtonText === 'INICIAR') {
        tipo = 'inicio'
        this.ButtonText = 'TERMINAR'
        this.ButtonVariant = 'success'
      } else {
        tipo = 'fin'
      } */

      const data = new URLSearchParams()
      data.set('item', JSON.stringify(this.item.cantidadIndividual))
      // data.set('item', JSON.stringify(this.items))

      await axios
        .post(
          `${this.$config.API}/empleados/registrar-paso-por-lotes/${this.$store.state.login.dataUser.departamento}`,
          data
        )
        .then((resp) => {
          console.log('emitimos aqui...')
          this.$emit('reload', 'true')
          this.overlay = false
        })
        .catch((err) => {
          this.$fire({
            title: 'Error registrando la accion',
            html: '<p>Por favor intetelo de nuevo</p>',
            type: 'warning',
          })
        })
    },

    iniciarTodo() {
      this.$confirm(
        `¿DESEA INICIAR TODAS LAS TAREAS PARA ESTA PIEZA?`,
        'INICAR TAREAS',
        'question'
      )
        .then(() => {
          this.administrarTareas()
        })
        .catch(() => {
          alert('no hagamos nada entoyer....')
          return false
        })
    },
  },

  props: ['item', 'reload'],
}
</script>
