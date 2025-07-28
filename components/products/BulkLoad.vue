<template>
  <div>
    <b-button @click="$bvModal.show(modalId)" variant="secondary">
      Carga Masiva
    </b-button>

    <b-modal :id="modalId" hide-footer size="lg">
      <template #modal-title>
        <h3>Carga Masiva de Productos</h3>
      </template>
      <p>
        Para agregar o actualizar productos de forma masiva, puede descargar
        nuestra plantilla de Excel. Rellene los datos siguiendo las
        instrucciones y luego suba el archivo para procesarlo.
      </p>
      <p>
        <strong>Instrucciones:</strong>
      </p>
      <ul>
        <li>No modifique los nombres de las columnas ni el de las hojas.</li>
        <li>
          La columna <strong>SKU</strong> es obligatoria y se usa para
          identificar si un producto es nuevo o si se debe actualizar uno
          existente.
        </li>
        <li>
          Para las columnas con listas desplegables (como Categoría),
          seleccione una de las opciones disponibles.
        </li>
        <li>
          En la hoja <strong>Precios</strong>, puede asignar múltiples precios a
          un mismo producto usando su SKU.
        </li>
      </ul>
      <b-overlay :show="loading" spinner-small>
        <b-button variant="primary" @click="downloadTemplate">
          <b-icon icon="download" class="mr-2"></b-icon>
          Descargar Plantilla
        </b-button>
      </b-overlay>
      <b-alert v-if="error" show variant="danger" class="mt-3">{{ error }}</b-alert>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ProductsBulkLoad",
  data() {
    return {
      loading: false,
      error: null,
    }
  },
  computed: {
    modalId() {
      // Genera un ID único para el modal para evitar colisiones
      return `modal-bulk-load-${this._uid}`
    },
  },
  methods: {
    async downloadTemplate() {
      this.loading = true
      this.error = null
      try {
        // La petición al backend ahora es un blob para manejar la descarga directamente
        const response = await this.$axios.get(
          `${this.$config.API}/api/products/template-excel`,
          { responseType: "blob" } // Importante: solicitar la respuesta como un blob
        )

        // Crear una URL para el blob
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "plantilla_productos.xlsx") // Nombre del archivo
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url) // Liberar memoria
      } catch (err) {
        console.error("Error al descargar la plantilla:", err)
        this.error =
          "Ocurrió un error al intentar generar la plantilla. Por favor, inténtelo de nuevo."
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
