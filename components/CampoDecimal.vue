<template>
  <b-form-input
    ref="input"
    type="text"
    inputmode="decimal"
    autocomplete="off"
    v-bind="$attrs"
    v-on="listeners"
    :value="displayValue"
    :formatter="normalizeInput"
    :placeholder="effectivePlaceholder"
    @paste="onPaste"
  />
</template>

<script>
// Input numérico de escritura TRADICIONAL (el usuario escribe y edita
// libremente, en cualquier posición del texto -- no hay máscara de dígitos
// desde la derecha). Lo único que se automatiza es el separador decimal:
// si el usuario escribe coma, se reemplaza por punto de forma silenciosa
// (la API necesita el punto), en vez de bloquear la escritura o mostrar un
// error. Se descarta cualquier caracter que no sea dígito o separador, y
// si escribe más de un separador solo se respeta el primero.
//
// Reemplaza al enfoque "bancario" (máscara 0.00 desde la derecha) usado
// hasta 2026-09-08 -- el usuario pidió volver a la escritura tradicional
// manteniendo solo la conversión automática de coma a punto.
//
// Usa el prop `formatter` NATIVO de <b-form-input> (BootstrapVue) para
// interceptar/reescribir el valor en el mismo ciclo que la librería ya usa
// internamente, sin condiciones de carrera con un listener @input.native
// aparte (ver historial de este archivo para el detalle de ese problema).
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
      if (this.value === null || this.value === undefined || this.value === "") return ""
      return String(this.value)
    },
    effectivePlaceholder() {
      if (this.placeholder !== null) return this.placeholder
      return (0).toFixed(this.decimals)
    },
  },
  methods: {
    // Llamado por <b-form-input> en cada tecleo (evento nativo "input"
    // interno de la librería) -- recibe el valor crudo ya editado por el
    // navegador (con la edición del usuario ya aplicada en la posición del
    // cursor que sea) y devuelve el texto normalizado que la librería usará
    // como su propio localValue.
    normalizeInput(rawValue) {
      let text = String(rawValue).replace(/,/g, ".").replace(/[^0-9.]/g, "")

      // Si hay más de un punto, se respeta solo el primero (separador
      // decimal) y se descartan los demás.
      const primerPunto = text.indexOf(".")
      if (primerPunto !== -1) {
        text = text.slice(0, primerPunto + 1) + text.slice(primerPunto + 1).replace(/\./g, "")
      }

      // Recortar a la cantidad de decimales permitida, sin reformatear el
      // resto del texto (edición libre).
      if (primerPunto !== -1 && this.decimals >= 0) {
        const [parteEntera, parteDecimal = ""] = text.split(".")
        text = this.decimals > 0
          ? `${parteEntera}.${parteDecimal.slice(0, this.decimals)}`
          : parteEntera
      }

      const numero = text === "" || text === "." ? null : Number(text)
      this.$emit("input", Number.isNaN(numero) ? null : numero)
      return text
    },
    onPaste(event) {
      event.preventDefault()
      const clipboard = (event.clipboardData || window.clipboardData).getData("text")
      const normalizado = this.normalizeDecimalString(clipboard)
      const el = this.$refs.input && this.$refs.input.$el
      if (!el) return
      const inicio = el.selectionStart
      const fin = el.selectionEnd
      const actual = el.value
      const nuevoTexto = actual.slice(0, inicio) + normalizado + actual.slice(fin)
      const posicionCursor = inicio + normalizado.length
      // Reutiliza el mismo camino que un tecleo normal -- normalizeInput
      // se encarga de limpiar caracteres inválidos y emitir el valor.
      const textoFinal = this.normalizeInput(nuevoTexto)
      el.value = textoFinal
      this.$nextTick(() => el.setSelectionRange(posicionCursor, posicionCursor))
    },
    // Convierte texto pegado con separador de miles + decimal (ej.
    // "1.234,56" o "1,234.56") a un formato simple con punto decimal --
    // se asume que el ÚLTIMO separador presente es el decimal.
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
  },
}
</script>
