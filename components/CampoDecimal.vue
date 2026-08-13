<template>
  <b-form-input
    ref="input"
    type="text"
    inputmode="decimal"
    autocomplete="off"
    v-bind="$attrs"
    v-on="listeners"
    :value="displayValue"
    :formatter="maskFormatter"
    :placeholder="effectivePlaceholder"
    @paste="onPaste"
    @focus="snapCursorToEnd"
    @click="snapCursorToEnd"
  />
</template>

<script>
// Input numérico estilo "bancario": el usuario solo escribe dígitos y el
// punto decimal se inserta automáticamente desde la derecha (máscara 0.00).
// Ej: escribir "150" produce "1.50". No se edita en medio del número, solo
// se agrega/borra desde la derecha (igual que los inputs de monto de apps
// bancarias).
//
// Usa el prop `formatter` NATIVO de <b-form-input> (BootstrapVue) en vez de
// un listener @input.native separado: <b-form-input> ya escucha el evento
// nativo "input" internamente y escribe su propio valor crudo al DOM -- un
// segundo listener nativo independiente compite por el mismo evento sin
// sincronizarse con ese mecanismo interno, y cuál de los dos "gana" depende
// del contexto (confirmado roto envuelto en <b-input-group>, 2026-08-13).
// El prop `formatter` es el único camino soportado por la librería para
// interceptar/reescribir el valor en el mismo ciclo que ya usa
// internamente, sin ninguna carrera.
export default {
  name: "CampoDecimal",
  inheritAttrs: false,
  props: {
    value: {
      type: [Number, String],
      default: null,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    maxIntegerDigits: {
      type: Number,
      default: 10,
    },
    placeholder: {
      type: String,
      default: null,
    },
  },
  computed: {
    listeners() {
      const { input, ...rest } = this.$listeners
      return rest
    },
    displayValue() {
      return this.formatDigits(this.numberToDigits(this.value))
    },
    effectivePlaceholder() {
      if (this.placeholder !== null) return this.placeholder
      return (0).toFixed(this.decimals)
    },
    maxDigits() {
      return this.maxIntegerDigits + this.decimals
    },
  },
  methods: {
    numberToDigits(val) {
      if (val === null || val === undefined || val === "") return ""
      const num = Number(val)
      if (isNaN(num)) return ""
      return Math.round(Math.abs(num) * Math.pow(10, this.decimals)).toString()
    },
    formatDigits(digits) {
      if (!digits) return ""
      const padded = digits.padStart(this.decimals + 1, "0")
      const integerPart = padded
        .slice(0, this.decimals > 0 ? -this.decimals : undefined)
        .replace(/^0+(?=\d)/, "")
      const decimalPart = padded.slice(-this.decimals)
      return this.decimals > 0 ? `${integerPart}.${decimalPart}` : integerPart
    },
    digitsToNumber(digits) {
      if (!digits) return null
      return parseInt(digits, 10) / Math.pow(10, this.decimals)
    },
    // Llamado por <b-form-input> en cada tecleo (evento nativo "input"
    // interno de la librería) -- recibe el valor crudo ya editado por el
    // navegador y devuelve el string formateado que la librería usará como
    // su propio localValue. Un único origen de verdad para el DOM.
    maskFormatter(rawValue) {
      const digits = String(rawValue).replace(/\D/g, "").slice(0, this.maxDigits)
      this.$emit("input", this.digitsToNumber(digits))
      this.$nextTick(() => this.snapCursorToEnd())
      return this.formatDigits(digits)
    },
    onPaste(event) {
      event.preventDefault()
      const clipboard = (event.clipboardData || window.clipboardData).getData("text")
      const normalized = this.normalizeDecimalString(clipboard)
      const parsed = parseFloat(normalized)
      if (isNaN(parsed)) return
      const digits = Math.round(Math.abs(parsed) * Math.pow(10, this.decimals))
        .toString()
        .slice(0, this.maxDigits)
      this.$emit("input", this.digitsToNumber(digits))
      this.$nextTick(() => this.snapCursorToEnd())
    },
    normalizeDecimalString(text) {
      let cleaned = text.trim().replace(/[^0-9.,]/g, "")
      const lastComma = cleaned.lastIndexOf(",")
      const lastDot = cleaned.lastIndexOf(".")
      const decimalSepIndex = Math.max(lastComma, lastDot)
      if (decimalSepIndex === -1) return cleaned
      const intPart = cleaned.slice(0, decimalSepIndex).replace(/[.,]/g, "")
      const decPart = cleaned.slice(decimalSepIndex + 1).replace(/[.,]/g, "")
      return `${intPart}.${decPart}`
    },
    snapCursorToEnd() {
      const el = this.$refs.input && this.$refs.input.$el
      if (!el) return
      const len = el.value.length
      el.setSelectionRange(len, len)
    },
  },
}
</script>
