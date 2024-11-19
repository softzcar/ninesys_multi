<template>
  <vue-loading
    :active="show"
    spinner="bar-fade-scale"
    color="#17a2b8"
    background-color="rgba(255, 255, 255, .9)"
    :text="text"
  />
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('loader', ['loading']),
    msg() {
      let tmp
      if (!this.text) {
        tmp = 'Por favor espere...'
      } else {
        tmp = this.text
      }
      return tmp
    },
  },

  props: ['text', 'show'],
}
</script>
