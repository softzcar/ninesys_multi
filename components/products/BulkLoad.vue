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
          En la hoja <strong>Productos</strong>, puede asignar un precio a
          un mismo producto usando su SKU.
        </li>
        <li>
          <strong>Departamento</strong> y <strong>Comisión</strong> son
          opcionales, pero si asigna uno debe asignar también el otro. La
          comisión admite hasta 3 decimales.
        </li>
      </ul>
      <b-overlay :show="loading" spinner-small>
        <b-button variant="primary" @click="downloadTemplate">
          <b-icon icon="download" class="mr-2"></b-icon>
          Descargar Plantilla
        </b-button>
      </b-overlay>

      <hr />

      <h5>Subir y Procesar Archivo</h5>
      <b-form-group
        label="Seleccione el archivo Excel con los productos:"
        label-for="file-upload"
      >
        <b-form-file
          id="file-upload"
          v-model="file"
          :state="Boolean(file)"
          placeholder="Elija un archivo o arrástrelo aquí..."
          drop-placeholder="Suelte el archivo aquí..."
          accept=".xlsx, .xls"
        ></b-form-file>
      </b-form-group>

      <b-button
        variant="success"
        @click="processFile"
        :disabled="!file || loading"
      >
        <b-icon icon="upload" class="mr-2"></b-icon>
        Subir y Procesar
      </b-button>

      <b-alert v-if="error" show variant="danger" class="mt-3">{{ error }}</b-alert>
    </b-modal>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

export default {
  name: 'ProductsBulkLoad',
  data() {
    return {
      loading: false,
      error: null,
      file: null,
    }
  },
  computed: {
    modalId() {
      return `modal-bulk-load-${this._uid}`
    },
  },
  methods: {
    async downloadTemplate() {
      this.loading = true
      this.error = null
      try {
        const response = await this.$axios.get(
          `${this.$config.API}/api/products/template-excel`
        )
        const fileUrl = response.data.file_url
        const link = document.createElement('a')
        link.href = `${this.$config.API}${fileUrl}`
        link.setAttribute('download', 'plantilla_productos.xlsx')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('Error al descargar la plantilla:', err)
        this.error =
          'Ocurrió un error al intentar generar la plantilla. Por favor, inténtelo de nuevo.'
      } finally {
        this.loading = false
      }
    },
    async processFile() {
      if (!this.file) {
        this.error = 'Por favor, seleccione un archivo.'
        return
      }
      this.loading = true
      this.error = null

      try {
        const { products: productsToUpload, errors: validationErrors } = await this.parseExcel(this.file)

        if (validationErrors.length > 0) {
          let errorString = 'Se encontraron errores en el archivo. Por favor, corríjalos antes de subirlo:\n'
          validationErrors.forEach(err => {
            errorString += `Fila ${err.row}: ${err.messages.join(', ')}\n`
          });
          this.error = errorString
          return;
        }

        if (productsToUpload.length === 0) {
          this.error = "El archivo no contiene productos válidos para procesar."
          return
        }

        const data = new URLSearchParams();
        data.set('products', JSON.stringify(productsToUpload));

        const response = await this.$axios.post(
          `${this.$config.API}/api/products/bulk-load`,
          data
        )

        // Mostramos un mensaje de éxito
        this.$bvToast.toast(response.data.message || "Productos procesados correctamente.", {
          title: "Carga Masiva Exitosa",
          variant: "success",
          solid: true,
        })

        // Opcional: cerrar el modal y refrescar la lista de productos
        this.$bvModal.hide(this.modalId)
        this.$emit("upload-success")
      } catch (err) {
        console.error("Error en la carga masiva:", err)
        const errorMessage = err.response?.data?.error
          ? err.response.data.error
          : `Error al procesar el archivo: ${err.message}`
        this.error = errorMessage
      } finally {
        this.loading = false
      }
    },
    parseExcel(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = e.target.result
            const workbook = XLSX.read(data, { type: 'array' })

            const productsSheet = workbook.Sheets['Productos']
            if (!productsSheet) {
              throw new Error('No se encontró la hoja "Productos" en el archivo.')
            }
            const productsRaw = XLSX.utils.sheet_to_json(productsSheet)

            const validatedProducts = []
            const validationErrors = []

            productsRaw.forEach((product, index) => {
              const rowNumber = index + 2; // +1 for 0-based index, +1 for header row
              const rowErrors = [];

              if (!product.SKU) rowErrors.push('El campo SKU es obligatorio.');
              if (!product.Nombre) rowErrors.push('El campo Nombre es obligatorio.');
              if (product.Precios === undefined || product.Precios === null) rowErrors.push('El campo Precios es obligatorio.');
              if (!product['Precio Descripción']) rowErrors.push('El campo "Precio Descripción" es obligatorio.');
              if (!product.Categoría) rowErrors.push('El campo Categoría es obligatorio.');

              // Departamento y Comisión son opcionales, pero deben venir juntos:
              // asignar una comisión sin departamento (o viceversa) no tiene sentido.
              const departamento = product.Departamento || null;
              const tieneComision = product['Comisión'] !== undefined && product['Comisión'] !== null && product['Comisión'] !== '';
              let comision = null;
              if (departamento && !tieneComision) {
                rowErrors.push('Asignó un Departamento pero no una Comisión.');
              } else if (!departamento && tieneComision) {
                rowErrors.push('Asignó una Comisión pero no un Departamento.');
              } else if (departamento && tieneComision) {
                comision = parseFloat(product['Comisión']);
                if (Number.isNaN(comision) || comision < 0) {
                  rowErrors.push('La Comisión debe ser un número mayor o igual a 0.');
                }
              }

              if (rowErrors.length > 0) {
                validationErrors.push({ row: rowNumber, messages: rowErrors });
              } else {
                validatedProducts.push({
                  SKU: product.SKU,
                  Nombre: product.Nombre,
                  Categoría: product.Categoría,
                  Atributos: product.Atributos || null,
                  Departamento: departamento,
                  Comision: comision,
                  precios: [{
                    valor: product.Precios,
                    descripcion: product['Precio Descripción'],
                  }],
                });
              }
            });

            resolve({ products: validatedProducts, errors: validationErrors });

          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = (err) => {
          reject(new Error('No se pudo leer el archivo. Asegúrese de que no esté dañado y que esté cerrado (no abierto en Excel u otra aplicación) antes de subirlo.'))
        }
        reader.readAsArrayBuffer(file)
      })
    }
  },
}
</script>
