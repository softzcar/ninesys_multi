<template>
  <b-card class="mb-4">
    <!-- Header de categoría -->
    <template #header>
      <b-row class="align-items-center">
        <b-col>
          <h5 class="mb-0 text-capitalize">
            <b-icon icon="folder-fill" class="mr-2 text-warning" />
            {{ categoria.name }}
            <b-badge variant="secondary" class="ml-2">{{ categoria.count }} imagen{{ categoria.count !== 1 ? 'es' : '' }}</b-badge>
          </h5>
        </b-col>
        <b-col cols="auto" class="d-flex gap-2">
          <b-button size="sm" variant="outline-primary" @click="toggleUpload">
            <b-icon :icon="showUpload ? 'x' : 'upload'" />
            {{ showUpload ? 'Cancelar' : 'Subir imagen' }}
          </b-button>
          <b-button size="sm" variant="outline-danger" class="ml-2" @click="confirmDeleteCategory">
            <b-icon icon="trash" />
            Eliminar categoría
          </b-button>
        </b-col>
      </b-row>
    </template>

    <!-- Formulario de subida -->
    <b-collapse v-model="showUpload">
      <b-card class="mb-3 bg-light border-primary">
        <b-row class="align-items-center">
          <b-col>
            <b-form-file
              v-model="newFile"
              placeholder="Selecciona o arrastra una imagen..."
              drop-placeholder="Suelta aquí..."
              accept="image/jpeg,image/png,image/webp,image/gif"
              :disabled="uploading"
            />
            <b-form-text>Se comprime automáticamente a 800px de ancho. JPG, PNG, WEBP, GIF.</b-form-text>
          </b-col>
          <b-col cols="auto">
            <b-button
              variant="primary"
              :disabled="!newFile || uploading"
              @click="uploadImage"
            >
              <b-spinner v-if="uploading" small class="mr-1" />
              {{ uploading ? 'Subiendo...' : 'Subir' }}
            </b-button>
          </b-col>
        </b-row>
      </b-card>
    </b-collapse>

    <!-- Grid de imágenes -->
    <div v-if="loadingImages" class="text-center py-3">
      <b-spinner small variant="secondary" />
    </div>

    <div v-else-if="images.length === 0" class="text-center text-muted py-3">
      <b-icon icon="images" font-scale="2" />
      <p class="mt-2 mb-0">Sin imágenes. Sube la primera usando el botón de arriba.</p>
    </div>

    <b-row v-else class="mt-1">
      <b-col
        v-for="img in images"
        :key="img.url"
        cols="6" sm="4" md="3" lg="2"
        class="mb-3"
      >
        <div class="gallery-thumb">
          <b-img
            :src="img.url + '?_=' + ts"
            fluid
            rounded
            class="gallery-img"
            @click="openZoom(img.url)"
          />
          <div class="gallery-thumb-overlay">
            <b-button
              size="sm"
              variant="danger"
              @click.stop="confirmDelete(img)"
            >
              <b-icon icon="trash" />
            </b-button>
          </div>
          <small class="d-block text-truncate text-muted mt-1" style="font-size:0.7rem">{{ img.filename }}</small>
        </div>
      </b-col>
    </b-row>

    <!-- Modal zoom -->
    <b-modal v-model="zoomModal" size="lg" hide-footer centered>
      <b-img :src="zoomUrl" fluid class="w-100" />
    </b-modal>

    <!-- Modal confirmación eliminación de imagen -->
    <b-modal
      v-model="deleteModal"
      title="Eliminar imagen"
      ok-variant="danger"
      ok-title="Eliminar"
      cancel-title="Cancelar"
      @ok="deleteImage"
    >
      <p>¿Eliminar <strong>{{ deleteTarget?.filename }}</strong>?</p>
      <p class="text-muted small">Esta acción no se puede deshacer.</p>
    </b-modal>

    <!-- Modal confirmación eliminación de categoría -->
    <b-modal
      v-model="deleteCategoryModal"
      title="Eliminar categoría"
      ok-variant="danger"
      ok-title="Sí, eliminar todo"
      cancel-title="Cancelar"
      :ok-disabled="deletingCategory"
      @ok.prevent="deleteCategory"
    >
      <p>
        Vas a eliminar la categoría <strong class="text-capitalize">{{ categoria.name }}</strong>
        junto con
        <strong>{{ categoria.count }} imagen{{ categoria.count !== 1 ? 'es' : '' }}</strong>.
      </p>
      <b-alert show variant="warning" class="mb-0">
        Esta acción borra permanentemente el directorio y todas sus imágenes del CDN. No se puede deshacer.
      </b-alert>
    </b-modal>
  </b-card>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    categoria: { type: Object, required: true },
    idEmpresa: { type: [Number, String], required: true },
    galleryCdn: { type: String, required: true },
  },

  data() {
    return {
      images: [],
      loadingImages: false,
      showUpload: false,
      newFile: null,
      uploading: false,
      zoomModal: false,
      zoomUrl: '',
      deleteModal: false,
      deleteTarget: null,
      deleteCategoryModal: false,
      deletingCategory: false,
      ts: Date.now(),
    }
  },

  watch: {
    categoria: {
      immediate: true,
      handler() {
        this.fetchImages()
      },
    },
  },

  methods: {
    async fetchImages() {
      this.loadingImages = true
      try {
        const { data } = await axios.get(`${this.galleryCdn}/`, {
          params: { action: 'catalog', id_empresa: this.idEmpresa, product: this.categoria.name },
        })
        this.images = (data.images || []).map((url) => ({
          url,
          filename: url.split('/').pop(),
        }))
      } catch (e) {
        this.images = []
      } finally {
        this.loadingImages = false
      }
    },

    toggleUpload() {
      this.showUpload = !this.showUpload
      if (!this.showUpload) this.newFile = null
    },

    async uploadImage() {
      if (!this.newFile) return
      if (!this.idEmpresa) {
        this.$bvToast.toast('ID de empresa no disponible. Recarga la página.', { variant: 'danger', title: 'Error' })
        return
      }
      this.uploading = true
      try {
        const formData = new FormData()
        formData.append('file', this.newFile)

        const url = `${this.galleryCdn}/?action=gallery_upload&id_empresa=${this.idEmpresa}&product=${this.categoria.name}`
        const { data } = await axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (data.uploaded) {
          this.$bvToast.toast('Imagen subida correctamente', { variant: 'success', title: 'Listo' })
          this.newFile = null
          this.showUpload = false
          this.ts = Date.now()
          await this.fetchImages()
          this.$emit('uploaded')
        } else {
          this.$bvToast.toast(data.msg || 'Error al subir', { variant: 'danger', title: 'Error' })
        }
      } catch (e) {
        this.$bvToast.toast('Error de conexión', { variant: 'danger', title: 'Error' })
      } finally {
        this.uploading = false
      }
    },

    openZoom(url) {
      this.zoomUrl = url + '?_=' + this.ts
      this.zoomModal = true
    },

    confirmDelete(img) {
      this.deleteTarget = img
      this.deleteModal = true
    },

    confirmDeleteCategory() {
      this.deleteCategoryModal = true
    },

    async deleteCategory() {
      this.deletingCategory = true
      try {
        const { data } = await axios.delete(`${this.galleryCdn}/`, {
          params: {
            action: 'gallery_delete_category',
            id_empresa: this.idEmpresa,
            product: this.categoria.name,
          },
        })
        if (data.deleted) {
          this.$bvToast.toast(
            `Categoría "${this.categoria.name}" eliminada (${data.images_deleted} imagen${data.images_deleted !== 1 ? 'es' : ''})`,
            { variant: 'success', title: 'Listo' }
          )
          this.deleteCategoryModal = false
          this.$emit('category-deleted', this.categoria.name)
        } else {
          this.$bvToast.toast(data.msg || 'No se pudo eliminar la categoría', { variant: 'danger', title: 'Error' })
        }
      } catch (e) {
        this.$bvToast.toast('Error de conexión al eliminar la categoría', { variant: 'danger', title: 'Error' })
      } finally {
        this.deletingCategory = false
      }
    },

    async deleteImage() {
      if (!this.deleteTarget) return
      try {
        const { data } = await axios.delete(`${this.galleryCdn}/`, {
          params: {
            action: 'gallery_delete',
            id_empresa: this.idEmpresa,
            product: this.categoria.name,
            filename: this.deleteTarget.filename,
          },
        })

        if (data.deleted) {
          this.$bvToast.toast('Imagen eliminada', { variant: 'success', title: 'Listo' })
          this.ts = Date.now()
          await this.fetchImages()
          this.$emit('deleted')
        } else {
          this.$bvToast.toast(data.msg || 'No se pudo eliminar', { variant: 'warning', title: 'Aviso' })
        }
      } catch (e) {
        this.$bvToast.toast('Error al eliminar', { variant: 'danger', title: 'Error' })
      } finally {
        this.deleteTarget = null
      }
    },
  },
}
</script>

<style scoped>
.gallery-thumb {
  position: relative;
  cursor: pointer;
}
.gallery-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: opacity 0.2s;
}
.gallery-thumb:hover .gallery-img {
  opacity: 0.7;
}
.gallery-thumb-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.gallery-thumb:hover .gallery-thumb-overlay {
  opacity: 1;
}
</style>
