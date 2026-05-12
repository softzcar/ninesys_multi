<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>
    <div v-else>
      <menus-MenuLoader />
      <b-container class="mt-4">
        <b-row class="mb-3 align-items-center">
          <b-col>
            <h2 class="mb-0">Galería de Catálogo</h2>
            <small class="text-muted">Imágenes que el bot envía cuando el cliente pide ver modelos</small>
          </b-col>
          <b-col cols="auto">
            <b-button variant="success" @click="showNewCategory = true">
              <b-icon icon="folder-plus" /> Nueva categoría
            </b-button>
          </b-col>
        </b-row>

        <!-- Nueva categoría -->
        <b-collapse v-model="showNewCategory">
          <b-card class="mb-4 border-success">
            <b-row class="align-items-center">
              <b-col>
                <b-form-input
                  v-model="newCategoryName"
                  placeholder="Nombre de categoría (ej: camiseta, gorra, buzo)"
                  @keyup.enter="createCategory"
                  :state="newCategoryName.length > 1 ? true : null"
                />
                <b-form-text>Solo letras minúsculas y guiones. Debe coincidir con el término que usan los clientes.</b-form-text>
              </b-col>
              <b-col cols="auto">
                <b-button variant="success" :disabled="newCategoryName.length < 2" @click="createCategory">
                  Crear
                </b-button>
                <b-button variant="light" class="ml-2" @click="showNewCategory = false; newCategoryName = ''">
                  Cancelar
                </b-button>
              </b-col>
            </b-row>
          </b-card>
        </b-collapse>

        <!-- Cargando -->
        <div v-if="loading" class="text-center py-5">
          <b-spinner variant="primary" />
          <p class="mt-2 text-muted">Cargando categorías...</p>
        </div>

        <!-- Sin categorías -->
        <b-alert v-else-if="!loading && categories.length === 0" show variant="info">
          No hay categorías aún. Crea una para empezar a subir imágenes.
        </b-alert>

        <!-- Categorías -->
        <div v-else>
          <diseno-galeria-categoria
            v-for="cat in categories"
            :key="cat.name"
            :categoria="cat"
            :id-empresa="idEmpresa"
            :gallery-cdn="$config.GALLERY_CDN"
            @deleted="onCategoryImageDeleted(cat.name)"
            @uploaded="onImageUploaded(cat.name)"
            @category-deleted="onCategoryDeleted"
          />
        </div>
      </b-container>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import mixin from '~/mixins/mixin-login.js'
import axios from 'axios'

export default {
  mixins: [mixin],

  data() {
    return {
      categories: [],
      loading: true,
      showNewCategory: false,
      newCategoryName: '',
    }
  },

  computed: {
    ...mapState('login', ['access', 'idEmpresa']),
  },

  watch: {
    access(val) {
      if (val) this.fetchCategories()
    },
  },

  methods: {
    async fetchCategories() {
      if (!this.idEmpresa) return
      this.loading = true
      try {
        const { data } = await axios.get(`${this.$config.GALLERY_CDN}/`, {
          params: { action: 'gallery_categories', id_empresa: this.idEmpresa },
        })
        this.categories = data.categories || []
      } catch (e) {
        this.$bvToast.toast('No se pudieron cargar las categorías', { variant: 'danger', title: 'Error' })
      } finally {
        this.loading = false
      }
    },

    async createCategory() {
      const name = this.newCategoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      if (name.length < 2) return

      if (this.categories.find((c) => c.name === name)) {
        this.$bvToast.toast('Esa categoría ya existe', { variant: 'warning', title: 'Aviso' })
        return
      }

      try {
        const { data } = await axios.delete(`${this.$config.GALLERY_CDN}/`, {
          params: {
            action: 'gallery_create_category',
            id_empresa: this.idEmpresa,
            product: name,
          },
        })
        if (data.created) {
          this.categories.push({ name, count: 0 })
          this.newCategoryName = ''
          this.showNewCategory = false
          this.$bvToast.toast(`Categoría "${name}" creada. Sube imágenes para activarla.`, { variant: 'success', title: 'Listo' })
        } else {
          this.$bvToast.toast(data.msg || 'No se pudo crear la categoría', { variant: 'danger', title: 'Error' })
        }
      } catch (e) {
        this.$bvToast.toast('Error de conexión al crear la categoría', { variant: 'danger', title: 'Error' })
      }
    },

    onCategoryImageDeleted(catName) {
      this.fetchCategories()
    },

    onCategoryDeleted(catName) {
      this.categories = this.categories.filter((c) => c.name !== catName)
    },

    onImageUploaded(catName) {
      const cat = this.categories.find((c) => c.name === catName)
      if (cat) cat.count++
    },
  },

  mounted() {
    if (this.access) this.fetchCategories()
  },
}
</script>
