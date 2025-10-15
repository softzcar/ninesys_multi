<template>
  <div>
    <b-button variant="outline-primary" size="sm" @click="$bvModal.show(modalId)">
      Atributos ({{ selectedCount }})
    </b-button>

    <b-modal :id="modalId" :title="`Seleccionar Atributos para ${productName}`" hide-footer size="md">
      <b-overlay :show="overlay" spinner-small>
        <b-form-checkbox-group
          v-model="internalSelectedAttributeIds"
          :options="attributeOptions"
          stacked
        ></b-form-checkbox-group>

        <div class="d-flex justify-content-end mt-3">
          <b-button variant="primary" @click="saveSelection">Guardar</b-button>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: {
    availableAttributes: {
      type: Array,
      default: () => [],
    },
    initialSelectedAttributes: {
      type: Array,
      default: () => [],
    },
    productName: {
      type: String,
      default: 'Producto',
    },
  },
  data() {
    return {
      overlay: false,
      internalSelectedAttributeIds: [],
      modalId: 'attribute-selector-modal-' + Math.random().toString(36).substring(2, 7),
    };
  },
  computed: {
    attributeOptions() {
      return this.availableAttributes.map((attr) => ({
        value: attr._id,
        text: `${attr.name} ($${attr.precio.toFixed(2)})`,
      }));
    },
    selectedCount() {
      return this.internalSelectedAttributeIds.length;
    },
    selectedAttributesData() {
      return this.availableAttributes.filter((attr) =>
        this.internalSelectedAttributeIds.includes(attr._id)
      );
    },
    totalPrice() {
      return this.selectedAttributesData.reduce((sum, attr) => sum + parseFloat(attr.precio), 0);
    },
  },
  watch: {
    initialSelectedAttributes: {
      immediate: true,
      handler(newVal) {
        this.internalSelectedAttributeIds = newVal.map(attr => attr._id); // Assuming initialSelectedAttributes contains full objects
      },
    },
  },
  methods: {
    saveSelection() {
      this.$emit('selected', {
        selectedAttributes: this.selectedAttributesData,
        totalPrice: this.totalPrice,
      });
      this.$bvModal.hide(this.modalId);
    },
  },
};
</script>

<style scoped>
/* Puedes añadir estilos específicos si es necesario */
</style>