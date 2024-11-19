<template>
  <div>
    <b-button @click="$bvModal.show(modal)" :variant="statusbutton">{{
      id
    }}</b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl">
      <b-overlay :show="overlay" spinner-small>
        <buscar-resultadoModal :id="id" />
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: `Orden ${this.id}`,
      overlay: false,
      statusbutton: 'outline-primary',
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  mounted() {
    if (this.progreso) {
      if (this.progreso === 'en curso') {
        this.statusbutton = 'outline-success'
      }
    }
  },

  props: ['id', 'progreso'],
}
</script>
