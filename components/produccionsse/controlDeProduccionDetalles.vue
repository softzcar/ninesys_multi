<template>
  <div>
    <div>
      <!-- <b-button v-b-modal.modalPopover>Ver detalles</b-button> -->
      <b-button variant="primary" @click="$bvModal.show(modal)">
        <b-icon icon="eye"></b-icon>
      </b-button>

      <b-modal :id="modal" title="Detalles de la orden" size="lg" ok-only>
        <diseno-viewImage :id="idorden" />
        <div v-html="sanitizeHtml(detalles)"></div>
      </b-modal>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],
  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)

      return `modal-${rand}`
    },
  },

  mounted() {},
  props: ['idorden', 'detalles'],
}
</script>
