<template>
  <div>
    <!-- <b-button id="show-btn" @click="$bvModal.show('bv-modal-example')"
      >Detalles</b-button
    > -->
    <b-button variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="eye"></b-icon>
    </b-button>

    <b-modal :id="modal" size="xl" hide-footer>
      <template #modal-title> Detalles </template>
      <div class="d-block text-center">
        <!-- <h3>Hello From This Modal!</h3> -->
        <p>
          <b-table striped hover :items="items"></b-table>
        </p>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)

      return `modal-${rand}`
    },
  },

  props: ['items'],
}
</script>
