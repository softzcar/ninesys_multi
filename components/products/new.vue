<template>
  <div>
    <b-button id="show-btn" variant="primary" @click="$bvModal.show('bv-modal-example')">Nuevo Producto</b-button>

    <b-modal id="bv-modal-example" hide-footer size="md" no-enforce-focus>
      <template #modal-title>
        <span v-if="!assigningInsumos">Crear Nuevo Producto</span>
        <span v-else>Asignación de Insumos</span>
      </template>
      <b-overlay :show="overlay" spinner-small>

        <!-- Step 1: Product Creation Form -->
        <div v-if="!assigningInsumos">
          <b-form @submit.prevent="onSubmit" @reset="onReset" v-if="show">
            <b-form-group label="Producto:" label-for="input-product">
              <b-form-input id="input-product" v-model="form.product" type="text" placeholder="Nombre del producto"
                required></b-form-input>
            </b-form-group>

            <b-form-group v-if="$store.state.login.dataUser.acceso" label="SKU:" label-for="input-sku">
              <b-form-input id="input-sku" v-model="form.sku" type="text" placeholder="SKU del producto"
                required></b-form-input>
            </b-form-group>

            <b-form-group label="Categoría:" label-for="select-category">
              <b-form-select requred id="select-category" v-model="form.category" :options="catagoriesSelect" size="sm"
                class="mt-3"></b-form-select>
              <b-alert :show="showPriceError" variant="danger">Seleccione una categoría</b-alert>
            </b-form-group>

            <b-form-group label-for="input-price">
              <admin-AsignacionDePreciosNuevo class="floatme" @reload="updatePrices($event)" />
            </b-form-group>

            <div v-if="form.prices.length > 0" class="mt-3 mb-3">
              <h5>Precios</h5>
              <b-list-group>
                <b-list-group-item v-for="(item, index) in form.prices" :key="index">
                  {{ Number(item.price || 0).toFixed(2) }} - {{ item.description }}
                </b-list-group-item>
              </b-list-group>
            </div>

            <b-form-group>
              <b-form-checkbox v-model="form.es_diseno" :value="1" :unchecked-value="0"
                :disabled="form.producto_fisico === 1">
                Es un Diseño
              </b-form-checkbox>
              <small class="text-muted">
                Marque esta opción si el producto es un diseño (gráfico, logotipo, etc.)
              </small>
              <small v-if="form.producto_fisico === 1" class="text-warning">
                <br />Los productos físicos no pueden ser diseños
              </small>
            </b-form-group>

            <b-form-group>
              <b-form-checkbox v-model="form.producto_fisico" :value="1" :unchecked-value="0"
                @change="onProductoFisicoChange">
                Producto Físico
              </b-form-checkbox>
              <small class="text-muted">
                Indica si el producto se va a fabricar
              </small>
            </b-form-group>

            <b-form-group v-if="form.producto_fisico === 1" label="Cantidad de Stock:" label-for="input-stock">
              <b-form-input id="input-stock" v-model="form.stock_quantity" type="number"
                placeholder="Cantidad inicial de stock" required></b-form-input>
            </b-form-group>

            <b-form-group v-if="form.producto_fisico === 1">
              <b-form-checkbox v-model="form.requiere_talla_corte_tela" :value="1" :unchecked-value="0">
                Requiere Talla, Corte y Tela
              </b-form-checkbox>
              <small class="text-muted">
                Desmarque si el producto se entrega tal cual se imprime, sin confeccionarse como prenda (ej. impresión DTF standalone, sin talla/corte/tela).
              </small>
            </b-form-group>

            <b-button type="submit" variant="success">Guardar</b-button>
          </b-form>
        </div>

        <!-- Step 2: Insumos Assignment -->
        <div v-if="assigningInsumos">
          <div class="mb-4">
            <b-alert show variant="warning">
              <h3>Comisiones de productos</h3>
              <p>
                Para que el producto a crerar esté activo en el sistema debe asignar comisiones a los departamentos para
                este
                producto.
              </p>
              <hr>
              <p class="mb-0">
                También debe asignar los insumos necesarios para la fabricación de este producto.
              </p>
              <p class="text-center mt-3">
                <b-button variant="primary" @click="$refs.insumosAssignment.showModal()">
                  <b-icon icon="plus-lg"></b-icon> Insumos
                </b-button>
              </p>
            </b-alert>

            <p><strong>Producto:</strong> {{ form.product }}</p>
            <p><strong>SKU:</strong> {{ newlyCreatedProduct.sku }}</p>
          </div>
          <admin-AsignacionDeInsumosAProductos ref="insumosAssignment" :item="newlyCreatedProduct"
            :departamentos="departamentos" :selectinsumos="selectInsumos" :insumosasignados="insumosAsignados"
            :tiemposprod="tiemposProd" @reload="handleInsumosUpdate" style="display: none;" />
          <b-button variant="primary" @click="finish" class="mt-3">Finalizar</b-button>
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
        producto_fisico: 1, // Por defecto activado (físico)
        es_diseno: 0, // Por defecto desactivado (no es diseño)
        requiere_talla_corte_tela: 1, // Por defecto activado (comportamiento actual)
        stock_quantity: 0,
      },
      // New state for the two-step process
      assigningInsumos: false,
      newlyCreatedProduct: null,
      departamentos: [],
      selectInsumos: [],
      insumosAsignados: [],
      tiemposProd: [],
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
    updatePrices(newPrices) {
      this.form.prices = newPrices;
    },

    onProductoFisicoChange() {
      // Si se marca como producto físico, deshabilitar "Es un Diseño" y ponerlo en false
      if (this.form.producto_fisico === 1) {
        this.form.es_diseno = 0;
      } else {
        // Si se desactiva, poner stock en 0
        this.form.stock_quantity = 0;
      }
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

    async postProduct(reactivarId = null) {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("product", this.form.product);
      data.set("prices", JSON.stringify(this.form.prices));

      data.set("category", this.form.category);
      data.set("sku", this.form.sku);
      data.set("producto_fisico", this.form.producto_fisico);
      data.set("es_diseno", this.form.es_diseno);
      data.set("requiere_talla_corte_tela", this.form.requiere_talla_corte_tela);
      data.set("stock_quantity", this.form.stock_quantity);
      if (reactivarId) {
        data.set("reactivar_id", reactivarId);
      }

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

        // Mapear _id a cod para compatibilidad con AsignacionDeInsumosAProductos
        this.newlyCreatedProduct.cod = this.newlyCreatedProduct._id;

        await this.fetchEssentialData();
        await this.fetchInsumosAsignados();
        this.assigningInsumos = true;
        // --- End of new logic ---
      } catch (err) {
        // Ya existe un producto eliminado con este mismo nombre o SKU: ofrecer
        // reactivarlo en vez de crear un duplicado.
        const errData = err.response && err.response.data;
        if (err.response && err.response.status === 409 && errData && errData.eliminado_existente) {
          this.overlay = false;
          try {
            await this.$confirm(
              `Ya existe un producto eliminado llamado "${errData.product}". ¿Desea reactivarlo con la configuración indicada?`,
              "Producto ya existe",
              "question"
            );
            await this.postProduct(errData.id_product);
          } catch (e) {
            // El usuario canceló la reactivación
          }
          return;
        }

        this.$fire({
          title: "Error creando el producto",
          html: `<p>${(errData && errData.error) || err.message || err}</p>`,
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
      const options = insumos.data.map((insumo) => ({
        value: insumo._id,
        text: insumo.nombre,
      }));
      options.unshift({ value: null, text: "Seleccione un insumo" });
      return options;
    },

    // Trae los insumos y tiempos YA guardados para este producto. Antes se le
    // pasaba [] fijo a AsignacionDeInsumosAProductos, así que la tabla nunca
    // reflejaba lo que realmente había en la base de datos (ni antes ni
    // después de importar de otro producto).
    async fetchInsumosAsignados() {
      if (!this.newlyCreatedProduct || !this.newlyCreatedProduct.cod) return;
      try {
        const [insumosRes, tiemposRes] = await Promise.all([
          this.$axios.get(`${this.$config.API}/insumos-productos-asignados`),
          this.$axios.get(`${this.$config.API}/tiempos-de-produccion`),
        ]);
        const productId = this.newlyCreatedProduct.cod;
        this.insumosAsignados = insumosRes.data.filter((i) => i.id_product == productId);
        this.tiemposProd = tiemposRes.data.filter((t) => t.id_product == productId);
      } catch (error) {
        console.error("Error cargando insumos/tiempos ya asignados:", error);
      }
    },

    async handleInsumosUpdate() {
      await this.fetchInsumosAsignados();
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
        producto_fisico: 1, // Por defecto físico al resetear
        es_diseno: 0,
        stock_quantity: 0,
      };
      // Reset new state
      this.assigningInsumos = false;
      this.newlyCreatedProduct = null;
      this.departamentos = [];
      this.selectInsumos = [];
      this.insumosAsignados = [];
      this.tiemposProd = [];
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