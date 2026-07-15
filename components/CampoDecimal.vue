<template>
  <b-form-input
    ref="input"
    type="text"
    inputmode="decimal"
    autocomplete="off"
    v-bind="$attrs"
    v-on="listeners"
    :value="displayValue"
    :placeholder="effectivePlaceholder"
    @input="onInput"
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
  data() {
    return {
      digits: this.numberToDigits(this.value),
    }
  },
  computed: {
    listeners() {
      const { input, ...rest } = this.$listeners
      return rest
    },
    displayValue() {
      return this.formatDigits(this.digits)
    },
    effectivePlaceholder() {
      if (this.placeholder !== null) return this.placeholder
      return (0).toFixed(this.decimals)
    },
    maxDigits() {
      return this.maxIntegerDigits + this.decimals
    },
  },
  watch: {
    value(newVal) {
      const newDigits = this.numberToDigits(newVal)
      if (newDigits !== this.digits) {
        this.digits = newDigits
      }
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
      const integerPart = padded.slice(0, -this.decimals).replace(/^0+(?=\d)/, "")
      const decimalPart = padded.slice(-this.decimals)
      return this.decimals > 0 ? `${integerPart}.${decimalPart}` : integerPart
    },
    digitsToNumber(digits) {
      if (!digits) return null
      return parseInt(digits, 10) / Math.pow(10, this.decimals)
    },
    emitValue() {
      this.$emit("input", this.digitsToNumber(this.digits))
    },
    onInput(event) {
      const raw = event.target.value
      this.digits = raw.replace(/\D/g, "").slice(0, this.maxDigits)
      this.emitValue()
      this.$nextTick(() => this.snapCursorToEnd())
    },
    onPaste(event) {
      event.preventDefault()
      const clipboard = (event.clipboardData || window.clipboardData).getData("text")
      const normalized = this.normalizeDecimalString(clipboard)
      const parsed = parseFloat(normalized)
      if (isNaN(parsed)) return
      this.digits = Math.round(Math.abs(parsed) * Math.pow(10, this.decimals))
        .toString()
        .slice(0, this.maxDigits)
      this.emitValue()
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
