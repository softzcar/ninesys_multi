<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="primary">
            <b-icon icon="plus-lg"></b-icon> Precios
        </b-button>

        <b-modal :id="modal" :title="title" size="md">
            <template #modal-footer>
                <b-button variant="primary" @click="saveChanges">Guardar y Cerrar</b-button>
            </template>
            <b-overlay :show="overlay" spinner-small>
                <!-- Formulario de Impresión -->
                <b-button
                    variant="light"
                    @click="addItem"
                    aria-label="Agregar Precio"
                >
                    <b-icon icon="plus-lg"></b-icon>
                </b-button>
                <b-table
                    responsive
                    
                    :fields="campos"
                    :items="form"
                    small
                >
                    <template #cell(input)="row">
                        <admin-AsignacionDePreciosForm
                            @reload="removeItemAndSave($event)"
                            :item="row.item"
                            :index="row.index"
                        />
                        <!-- <diseno-reasignacionSelect :idorden="row.item.idorden" :options="options" :item="row.item"
                            @reload="updateEmpId($event, row.index)" @closemodal="closeModal" /> -->
                    </template>

                    <template #cell(id)="row">
                        <b-button
                            variant="danger"
                            @click="removeItem(row.index)"
                            aria-label="Agregar insumo"
                        >
                            <b-icon icon="trash"></b-icon>
                        </b-button>
                    </template>
                </b-table>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
  data() {
    return {
      title: `Asignación De Precios`,
      overlay: false,
      form: [],
      campos: [
        { key: "input", label: "" },
        { key: "id", label: "" },
      ],
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },
  },

      methods: {
    async saveChanges() {
      this.overlay = true;
      const pricesToSave = this.form.map((p) => {
        return {
          id: p.id || p._id || null,
          price: p.price,
          description: p.description,
        };
      });

      const data = new URLSearchParams();
      data.set("product_id", this.product_id);
      data.set("prices", JSON.stringify(pricesToSave));

      try {
        const response = await this.$axios.post(
          `${this.$config.API}/editar-producto-precios`,
          data
        );
        const updatedPrices = response.data && response.data[0] ? response.data[0].prices : [];
        this.form = updatedPrices; // Actualizar el estado local
        this.$emit("reload", updatedPrices); // Emitir el estado actualizado
        this.$bvModal.hide(this.modal);
      } catch (err) {
        this.$fire({
          title: "Error",
          html: `<p>No se pudieron guardar los precios.</p><p>${err}</p>`,
          type: "warning",
        });
      } finally {
        this.overlay = false;
      }
    },    addItem() {
      // Añadir un nuevo precio sin ID, solo con la estructura base.
      this.form.push({
        price: 0,
        description: "",
      });
    },

    removeItem(index) {
      const priceToDelete = this.form[index];
      if (!priceToDelete) return;

      // Si el precio no tiene `id` o `_id`, es uno nuevo que no ha sido guardado.
      // Simplemente lo eliminamos del formulario local.
      if (!priceToDelete.id && !priceToDelete._id) {
        this.form.splice(index, 1);
        this.$emit("reload", this.form);
        return;
      }

      // Si el precio ya existe, pedimos confirmación y llamamos a la API.
      this.$confirm(
        `¿Está seguro de que desea eliminar el precio de ${priceToDelete.price} - ${priceToDelete.description}?`,
        "Confirmar Eliminación",
        "warning"
      )
        .then(async () => {
          this.overlay = true;
          const priceId = priceToDelete.id || priceToDelete._id;

          try {
            const response = await this.$axios.delete(
              `${this.$config.API}/products-prices/${priceId}`
            );

            const updatedPrices = response.data && response.data[0] ? response.data[0].prices : [];
            this.form = updatedPrices;
            this.$emit("reload", updatedPrices);

            this.$fire({
              title: "Precio Eliminado",
              html: "El precio ha sido eliminado correctamente.",
              type: "success",
            });
          } catch (err) {
            this.$fire({
              title: "Error",
              html: `<p>No se pudo eliminar el precio.</p><p>${err}</p>`,
              type: "error",
            });
          } finally {
            this.overlay = false;
          }
        })
        .catch(() => {
          // El usuario canceló la eliminación
        });
    },


  },

  mounted() {
    // Asignar la referencia directa para que los cambios se reflejen en el padre.
    this.form = this.precios || [];
  },

  props: ["precios", "product_id"],
};
</script>

<style scoped>
.cmyk {
    margin-top: 20px;
    padding: 2px !important;
    width: 30% !important;
}

.black-label {
    background-color: black;
    color: antiquewhite;
}

.cyan-label {
    background-color: cyan;
    color: black;
}

.yellow-label {
    background-color: yellow;
    color: black;
}

.magenta-label {
    background-color: magenta;
    color: black;
}
</style>
