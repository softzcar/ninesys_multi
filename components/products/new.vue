<template>
  <div>
    <b-button id="show-btn" @click="$bvModal.show('bv-modal-example')">Nuevo Producto</b-button>

    <b-modal id="bv-modal-example" hide-footer>
      <template #modal-title> Crear Nuevo Producto </template>
      <b-overlay :show="overlay" spinner-small>
        <b-form @submit="onSubmit" @reset="onReset" v-if="show">
          <b-form-group id="input-group-1" label="Producto:" label-for="input-product">
            <b-form-input id="input-product" v-model="form.product" type="text" placeholder="Nombre del producto"
              required></b-form-input>
          </b-form-group>

          <b-form-group v-if="$store.state.login.dataUser.acceso" id="input-group-2" label="SKU:" label-for="input-sku">
            <b-form-input id="input-sku" v-model="form.sku" type="text" placeholder="SKU del producto"
              required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-3" label="Precio:" label-for="input-price">
            <b-form-input id="input-price" step="0.1" v-model="form.price" type="number"
              placeholder="Precio del producto" required></b-form-input>
            <b-alert :show="showPriceError" variant="danger">Asigne un precio al producto</b-alert>
          </b-form-group>

          <b-form-group v-if="$store.state.login.dataUser.acceso" id="input-group-4" label="Unidades:"
            label-for="input-unidades">
            <b-form-input id="input-unidades" v-model="form.unidades" type="number" min="0" step="1"
              placeholder="Unidades del producto" required></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-5" label="Categoría:" label-for="select-category">
            <b-form-select id="select-category" v-model="form.category" :options="catagoriesSelect" size="sm"
              class="mt-3" @change="updateCategory"></b-form-select>
            <b-alert :show="showPriceError" variant="danger">Seleccione una categoría</b-alert>
          </b-form-group>

          <b-button type="submit" variant="primary">Guardar</b-button>
          <!-- <b-button type="reset" variant="danger">Reset</b-button> -->
        </b-form>
      </b-overlay>
      <!-- <pre>
  {{ $store.state.comerce.dataCategories }}
  <hr>
  {{ catagoriesSelect }}
</pre> -->
      <!-- <b-button class="mt-3" block @click="$bvModal.hide('bv-modal-example')"
        >Cerrar</b-button
      > -->
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      overlay: false,
      showPriceError: false,
      show: true,
      form: {
        category: null,
        product: '',
        sku: null,
        price: 0.0,
        unidades: 0,
      },
    }
  },

  computed: {
    catagoriesSelect() {
      return this.$store.state.comerce.dataCategories
        /* .filter((el) => el.parent === 35 || el.id === 38 || el.id === 91) */
        .map((el) => {
          return {
            value: el.id,
            text: el.name,
          }
        })
    },

    catagoriesSelect_old() {
      return this.$store.state.comerce.dataCategories
        .filter((el) => el.parent === 35 || el.id === 38 || el.id === 91)
        .map((el) => {
          return {
            value: el.id,
            text: el.name,
          }
        })
    },
  },

  watch: {
    form: function (val) {
      console.log(val)
      if (val.price > 0) {
        this.showPriceError = false
      } else {
        this.showPriceError = true
      }
    },
  },

  methods: {
    updateCategory(val) {
      console.log('category selected', this.form.category)
    },

    onSubmit(event) {
      event.preventDefault()
      let ban = true
      let msg = ''

      if (this.form.product.trim() === '') {
        ban = false
        msg = msg + '<p>Asige un nombre</p>'
      }

      if (!this.form.price) {
        ban = false
        msg = msg + '<p>Asige un precio</p>'
      }

      if (this.form.category === null) {
        ban = false
        msg = msg + '<p>Seleccione una categoría</p>'
      }

      if (!ban) {
        this.showPriceError = true
        this.$fire({
          type: 'warning',
          title: 'Faltan datos',
          html: msg,
        }) /* .then(() => {
          this.$store.commit('login/setAccess', false)
          window.location.assign('/')
        }) */
      } else {
        this.postProduct().then(() => {
          // this.$emit('r', true)
          this.form = {
            category: null,
            product: '',
            sku: null,
            price: 0.0,
            unidades: 0,
          }
          this.$bvModal.hide('bv-modal-example')
        })
      }
    },

    async postProduct() {
      this.overlay = true
      const data = new URLSearchParams()
      data.set('product', this.form.product)
      data.set('price', this.form.price)
      data.set('category', this.form.category)
      data.set('sku', this.form.sku)
      data.set('unidades', this.form.unidades)

      await axios
        .post(
          // `${this.$config.API}/products/lite/${this.form.product}/${this.form.price}/${this.form.category}`,
          `${this.$config.API}/products/lite`,
          data
        )
        .then((res) => {
          this.$emit('r', true)
          this.reponse = res
          this.loading = false
          this.form = {
            category: null,
            product: '',
            sku: null,
            price: 0.0,
            unidades: 0,
          }
          // this.urlLink = res.data.linkdrive
        })
        .catch((err) => {
          this.$fire({
            title: 'Error creando el producto',
            html: `<p>${{ err }}</p>`,
            type: 'warning',
          })
        })
        .finally(() => {
          this.overlay = false
        })
    },

    onReset(event) {
      event.preventDefault()
      // Reset our form values
      this.form.email = ''
      this.form.name = ''
      this.form.food = null
      this.form.checked = []
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
  },

  props: ['reload'],
}
</script>
