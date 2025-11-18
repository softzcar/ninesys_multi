<template>
  <div>
    <b-button variant="primary" size="sm" @click="showModal">
      Atributos ({{ (product.atributos_seleccionados || []).length }})
    </b-button>
    <b-modal :ref="modalRef" title="Seleccionar Atributos" @ok="handleOk" @hidden="resetSelection" size="lg">
      <AtributosNuevo @reload="reloadAttributes" />
      <hr />
      <b-form-group>
        <b-form-checkbox-group
          v-model="selectedAttributes"
          :options="attributeOptions"
          stacked
          value-field="value"
          text-field="text"
        ></b-form-checkbox-group>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import AtributosNuevo from "~/components/admin/AtributosNuevo.vue";

export default {
  components: {
    AtributosNuevo,
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
    attributes: {
      type: Array,
      required: true,
    },
    productIndex: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      selectedAttributes: [],
    };
  },
  computed: {
    modalRef() {
      // Create a unique ref for the modal to avoid conflicts
      return `attribute-modal-${this.productIndex}`;
    },
    attributeOptions() {
      return this.attributes.map(attr => ({
        value: attr, // Pass the whole object
        text: `${attr.text.split('(')[0]} (+$${attr.precio})`,
      }));
    },
  },
  watch: {
    // Watch for changes in the product's attributes from the parent
    'product.atributos_seleccionados': {
      immediate: true,
      handler(newVal) {
        // Clone the array to avoid direct mutation of the prop
        this.selectedAttributes = newVal ? [...newVal] : [];
      }
    }
  },
  methods: {
    showModal() {
      // When showing the modal, initialize the selection with the product's current attributes
      this.selectedAttributes = this.product.atributos_seleccionados ? [...this.product.atributos_seleccionados] : [];
      this.$refs[this.modalRef].show();
    },
    handleOk() {
      // When user clicks OK, emit the event with the new selection
      this.$emit('attributes-updated', {
        productIndex: this.productIndex,
        selectedAttributes: this.selectedAttributes,
      });
    },
    resetSelection() {
        // If the user cancels, reset the selection to the original state
        this.selectedAttributes = this.product.atributos_seleccionados ? [...this.product.atributos_seleccionados] : [];
    },
    reloadAttributes() {
      // Emit event to parent to reload attributes
      this.$emit('reload-attributes');
    }
  },
};
</script>