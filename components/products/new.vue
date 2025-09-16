<template>
  <div>
    <b-button
      id="show-btn"
      @click="$bvModal.show('bv-modal-example')"
    >Nuevo Producto</b-button>

    <b-modal
      id="bv-modal-example"
      hide-footer
      size="xl"
      no-enforce-focus
    >
      <template #modal-title>
        <span v-if="!assigningInsumos">Crear Nuevo Producto</span>
        <span v-else>Asignación de Insumos</span>
      </template>
      <b-overlay
        :show="overlay"
        spinner-small
      >

        <!-- Step 1: Product Creation Form -->
        <div v-if="!assigningInsumos">
          <b-form
            @submit.prevent="onSubmit"
            @reset="onReset"
            v-if="show"
          >
            <b-form-group
              label="Producto:"
              label-for="input-product"
            >
              <b-form-input
                id="input-product"
                v-model="form.product"
                type="text"
                placeholder="Nombre del producto"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group
              v-if="$store.state.login.dataUser.acceso"
              label="SKU:"
              label-for="input-sku"
            >
              <b-form-input
                id="input-sku"
                v-model="form.sku"
                type="text"
                placeholder="SKU del producto"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Categoría:"
              label-for="select-category"
            >
              <b-form-select
                requred
                id="select-category"
                v-model="form.category"
                :options="catagoriesSelect"
                size="sm"
                class="mt-3"
              ></b-form-select>
              <b-alert
                :show="showPriceError"
                variant="danger"
              >Seleccione una categoría</b-alert>
            </b-form-group>

            <b-form-group label-for="input-price">
              <admin-AsignacionDePrecios
                class="floatme"
                :precios="form.prices"
                @reload="updatePrices($event)"
              />
              <admin-AsignacionDeAtributos
                class="floatme"
                test="TEST PROPS"
                :attributescat="attributescat"
                :attributesval="form.attributes"
                @reload="updateAttributes($event)"
                @refresh-attributes="$emit('refresh-attributes')"
              />
            </b-form-group>

            <b-button
              type="submit"
              variant="success"
            >Guardar y Asignar Insumos</b-button>
          </b-form>
          
          <div v-if="form.prices.length > 0" class="mt-3">
            <h5>Precios</h5>
            <b-list-group>
              <b-list-group-item
                v-for="(item, index) in form.prices"
                :key="index"
              >
                {{ item.price }} - {{ item.descripcion }}
              </b-list-group-item>
            </b-list-group>
          </div>

          <div v-if="form.attributes.length > 0" class="mt-3">
            <h5>Atributos</h5>
            <b-list-group>
              <b-list-group-item
                v-for="(item, index) in form.attributes"
                :key="`attr-${index}`"
              >
                {{ getAttributeName(item.attribute) }}: {{ item.descripcion }}
              </b-list-group-item>
            </b-list-group>
          </div>
        </div>

        <!-- Step 2: Insumos Assignment -->
        <div v-if="assigningInsumos">
           <div class="mb-4">
            <p><strong>Producto:</strong> {{ form.product }}</p>
            <p><strong>SKU:</strong> {{ newlyCreatedProduct.sku }}</p>
          </div>
          <admin-AsignacionDeInsumosAProductos
            :item="newlyCreatedProduct"
            :departamentos="departamentos"
            :selectinsumos="selectInsumos"
            :insumosasignados="[]"
            :tiemposprod="[]"
            @reload="handleInsumosUpdate"
          />
          <b-button
            variant="primary"
            @click="finish"
            class="mt-3"
          >Finalizar</b-button>
        </div>

      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import AsignacionDeInsumosAProductos from "~/components/admin/AsignacionDeInsumosAProductos.vue";

export default {
  components: {
    "admin-AsignacionDeInsumosAProductos": AsignacionDeInsumosAProductos,
  },
  data() {
    return {
      overlay: false,
      showPriceError: false,
      show: true,
      form: {
        category: null,
        product: "",
        sku: null,
        prices: [],
        attributes: [],
      },
      // New state for the two-step process
      assigningInsumos: false,
      newlyCreatedProduct: null,
      departamentos: [],
      selectInsumos: [],
    };
  },

  computed: {
    catagoriesSelect() {
      return this.$store.state.comerce.dataCategories.map((el) => ({
        value: el.id,
        text: el.name,
      }));
    },
  },

  methods: {
    getAttributeName(attributeId) {
      if (!this.attributescat) return "";
      const attribute = this.attributescat.find(
        (attr) => attr.value === attributeId
      );
      return attribute ? attribute.text : "";
    },
    updatePrices(newPrices) {
      this.form.prices = newPrices;
    },
    updateAttributes(newAttributes) {
      this.form.attributes = newAttributes;
    },

    onSubmit() {
      let ban = true;
      let msg = "";

      if (this.form.product.trim() === "") {
        ban = false;
        msg += "<p>Asigne un nombre</p>";
      }
      if (this.form.prices.length === 0) {
        ban = false;
        msg +=
          "<p>Debe asignar al menos un precio. Utilice el botón '+ Precios' para agregarlo.</p>";
      }
      if (this.form.category === null) {
        ban = false;
        msg += "<p>Seleccione una categoría</p>";
      }

      if (!ban) {
        this.showPriceError = true;
        this.$fire({
          type: "warning",
          title: "Faltan datos",
          html: msg,
        });
      } else {
        this.postProduct();
      }
    },

    async postProduct() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("product", this.form.product);
      data.set("prices", JSON.stringify(this.form.prices));
      data.set("attributes", JSON.stringify(this.form.attributes));
      data.set("category", this.form.category);
      data.set("sku", this.form.sku);

      try {
        const res = await this.$axios.post(
          `${this.$config.API}/products/lite`,
          data
        );
        // --- Start of new logic ---
        // IMPORTANT: The API must return the newly created product object
        this.newlyCreatedProduct = res.data.product;

        if (!this.newlyCreatedProduct || !this.newlyCreatedProduct._id) {
          throw new Error(
            "La respuesta de la API no incluyó el producto creado con su ID."
          );
        }

        await this.fetchEssentialData();
        this.assigningInsumos = true;
        // --- End of new logic ---
      } catch (err) {
        this.$fire({
          title: "Error creando el producto",
          html: `<p>${err.message || err}</p>`,
          type: "warning",
        });
      } finally {
        this.overlay = false;
      }
    },

    async fetchEssentialData() {
      this.overlay = true;
      try {
        const [depsRes, catalogoInsumosRes] = await Promise.all([
          this.$axios.get(`${this.$config.API}/departamentos`),
          this.$axios.get(`${this.$config.API}/catalogo-insumos-productos`),
        ]);
        this.departamentos = depsRes.data;
        this.selectInsumos = this.formatInsumosForSelect(
          catalogoInsumosRes.data
        );
      } catch (error) {
        this.$fire({
          title: "Error al cargar datos para la asignación",
          html: `<p>${error.message || error}</p>`,
          type: "danger",
        });
      } finally {
        this.overlay = false;
      }
    },

    formatInsumosForSelect(insumos) {
      const options = insumos.map((insumo) => ({
        value: insumo._id,
        text: insumo.nombre,
      }));
      options.unshift({ value: null, text: "Seleccione un insumo" });
      return options;
    },

    handleInsumosUpdate() {
      // Optional: could be used to show a success message
      console.log("Insumos actualizados");
    },

    finish() {
      this.$emit("r", true); // Reload the main product list
      this.resetAllState();
      this.$bvModal.hide("bv-modal-example");
    },

    resetAllState() {
      // Reset form
      this.form = {
        category: null,
        product: "",
        sku: null,
        prices: [],
        attributes: [],
      };
      // Reset new state
      this.assigningInsumos = false;
      this.newlyCreatedProduct = null;
      this.departamentos = [];
      this.selectInsumos = [];
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },

    onReset(event) {
      event.preventDefault();
      this.resetAllState();
    },
  },

  props: ["attributesval", "attributescat", "reload"],
};
</script>
