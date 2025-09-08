<template>
  <div>
    <b-button @click="$bvModal.show(modalId)" variant="secondary">
      Carga Masiva
    </b-button>

    <b-modal :id="modalId" hide-footer size="lg">
      <template #modal-title>
        <h3>Carga Masiva de Inventario</h3>
      </template>
      <p>
        Para agregar o actualizar ítems de inventario de forma masiva, puede descargar
        nuestra plantilla de Excel. Rellene los datos siguiendo las
        instrucciones y luego suba el archivo para procesarlo.
      </p>
      <p>
        <strong>Instrucciones:</strong>
      </p>
      <ul>
        <li>No modifique los nombres de las columnas ni el de las hojas.</li>
        <li>
          La columna <strong>Rollo</strong> es obligatoria y se usa para
          identificar si un ítem de inventario es nuevo o si se debe actualizar uno
          existente.
        </li>
        <li>
          Para las columnas con listas desplegables, seleccione una de las opciones disponibles.
        </li>
        <li>
          En la hoja <strong>Inventario</strong>, asegúrese de que el campo 'Rollo' sea único para cada ítem.
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
        label="Seleccione el archivo Excel con los ítems de inventario:"
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
  name: 'InventoryBulkLoad',
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
          `${this.$config.API}/api/inventario/template-excel`
        )
        const fileUrl = response.data.file_url
        const link = document.createElement('a')
        link.href = `${this.$config.API}${fileUrl}`
        link.setAttribute('download', 'plantilla_inventario.xlsx')
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
        const { inventoryItems: inventoryItemsToUpload, errors: validationErrors } = await this.parseExcel(this.file)

        if (validationErrors.length > 0) {
          let errorString = 'Se encontraron errores en el archivo. Por favor, corríjalos antes de subirlo:\n'
          validationErrors.forEach(err => {
            errorString += `Fila ${err.row}: ${err.messages.join(', ')}\n`
          });
          this.error = errorString
          return;
        }

        if (inventoryItemsToUpload.length === 0) {
          this.error = "El archivo no contiene ítems de inventario válidos para procesar."
          return
        }

        const data = new URLSearchParams();
        data.set('inventoryItems', JSON.stringify(inventoryItemsToUpload));

        const response = await this.$axios.post(
          `${this.$config.API}/api/inventario/bulk-load`,
          data
        )

        // Mostramos un mensaje de éxito
        this.$bvToast.toast(response.data.message || "Ítems de inventario procesados correctamente.", {
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

            const inventorySheet = workbook.Sheets['Inventario']
            if (!inventorySheet) {
              throw new Error('No se encontró la hoja "Inventario" en el archivo.')
            }
            const inventoryRaw = XLSX.utils.sheet_to_json(inventorySheet)

            const validatedInventoryItems = []
            const validationErrors = []

            inventoryRaw.forEach((item, index) => {
              const rowNumber = index + 2; // +1 for 0-based index, +1 for header row
              const rowErrors = [];

              if (!item.SKU) rowErrors.push('El campo Rollo es obligatorio.');
              if (!item.Nombre) rowErrors.push('El campo Nombre es obligatorio.');
              if (!item.Insumo) rowErrors.push('El campo Insumo es obligatorio.');
              if (item.Cantidad === undefined || item.Cantidad === null) rowErrors.push('El campo Cantidad es obligatorio.');
              if (!item.Unidad) rowErrors.push('El campo "Unidad" es obligatorio.');
              if (item.Costo === undefined || item.Costo === null) rowErrors.push('El campo Costo es obligatorio.');
              if (!item.Departamento) rowErrors.push('El campo Departamento es obligatorio.');

              // Validación de unicidad del Rollo
              if (validatedInventoryItems.some(existingItem => existingItem.Rollo === item.SKU)) {
                rowErrors.push('El campo Rollo debe ser único.');
              }

              if (rowErrors.length > 0) {
                validationErrors.push({ row: rowNumber, messages: rowErrors });
              } else {
                validatedInventoryItems.push({
                  SKU: item.SKU,
                  Nombre: item.Nombre,
                  Insumo: item.Insumo, // InsumoCatalogo
                  Cantidad: item.Cantidad,
                  Unidad: item.Unidad,
                  Costo: item.Costo,
                  Departamento: item.Departamento,
                  Rendimiento: item.Rendimiento || 1,
                  Descripción: item.Descripción || null,
                });
              }
            });

            resolve({ inventoryItems: validatedInventoryItems, errors: validationErrors });

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
