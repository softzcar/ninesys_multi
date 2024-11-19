<template>
  <div>
    <b-button variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="basket-fill"></b-icon>
    </b-button>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :show="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col>
              <h1>{{ title }}</h1>
              <h3>Procesar los insumos aqui</h3>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'
import { timeout } from 'q'

export default {
  data() {
    return {
      newImage: null,
      size: 'lg',
      title: 'Asignación De Insumos',
      overlay: true,
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  methods: {},

  props: ['id'],

  mounted() {
    setInterval(() => {
      this.overlay = false
    }, 4000)
  },
}
</script>
