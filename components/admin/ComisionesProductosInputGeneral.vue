<template>
  <campo-decimal
    :id="idInput"
    style="width: 100px"
    :value="valorMostrado"
    :decimals="3"
    @input="onInput"
    @change="onChange"
  />
</template>

<script>
import mixin from "~/mixins/mixins.js";

// El valor original y el "pendiente" (si hay un cambio sin guardar) los
// calcula el padre y los pasa por props -- este componente ya no deriva nada
// de item.comisiones por su cuenta. Así el valor mostrado sobrevive a que la
// fila se remonte (repintado de sección, filtro, etc.) sin perder lo que el
// usuario ya escribió pero no ha guardado.
//
// Escucha tanto @input (cada tecleo, con debounce corto) como @change (blur)
// de CampoDecimal -- antes solo escuchaba @change, así que si el usuario
// presionaba Enter o el blur no llegaba a dispararse, el cambio nunca se
// registraba y el botón "Guardar Todos los Cambios" quedaba deshabilitado.
export default {
  mixins: [mixin],

  props: {
    idProducto: {
      type: [Number, String],
      required: true,
    },
    idDepartamento: {
      type: [Number, String],
      required: true,
    },
    originalValue: {
      type: Number,
      default: 0,
    },
    pendingValue: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      idInput: null,
      debounceTimer: null,
    };
  },

  computed: {
    valorMostrado() {
      return this.pendingValue !== null && this.pendingValue !== undefined
        ? this.pendingValue
        : this.originalValue;
    },
  },

  methods: {
    onInput(newValue) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.emitirCambio(newValue), 350);
    },

    onChange(newValue) {
      clearTimeout(this.debounceTimer);
      this.emitirCambio(newValue);
    },

    emitirCambio(newValue) {
      if (newValue === null || newValue === undefined || newValue === "") return;
      const valor = parseFloat(newValue);
      if (Number.isNaN(valor)) return;

      this.$emit("update-comision", {
        id_producto: this.idProducto,
        id_departamento: this.idDepartamento,
        comision: valor,
      });
    },
  },

  beforeDestroy() {
    clearTimeout(this.debounceTimer);
  },

  mounted() {
    this.idInput = this.token();
  },
};
</script>

<style lang="scss" scoped></style>
