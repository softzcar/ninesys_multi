<template>
  <div>
    <b-form-group
      label="Seleccione el tipo de insumo"
      v-slot="{ ariaDescribedby }"
    >
      <b-form-radio-group
        id="btn-radios-1"
        v-model="selected"
        :options="options"
        :aria-describedby="ariaDescribedby"
        name="radios-btn-default"
        buttons
        button-variant="outline-primary"
        @input="sendData"
      ></b-form-radio-group>
    </b-form-group>

  </div>
</template>

<script>
export default {
  data() {
    return {
      rendimiento: 0,
      insumos: [],
      selected: null,
    };
  },

  computed: {
    options() {
      return this.datainsumos.map((el) => {
        return {
          text: el.catalogo,
          value: el.id_catalogo_insumos_productos,
        };
      });
    },
  },

  methods: {
    sendData() {
      this.$emit("update_catalogo", this.selected);
    },
  },

  props: ["idorden", "idinsumo", "datainsumos", "update_catalogo"],
};
</script>
