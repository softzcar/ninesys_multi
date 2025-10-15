<template>
    <div>
        <b-button @click="$bvModal.show(modal)" variant="primary">
            <b-icon icon="plus-lg"></b-icon> Precios
        </b-button>

        <b-modal :id="modal" :title="title" size="md">
            <template #modal-footer>
                <b-button variant="primary" @click="asignarPrecios">Asignar</b-button>
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
    asignarPrecios() {
      // Simplemente emite la lista de precios creada y cierra el modal.
      this.$emit("reload", this.form);
      this.$bvModal.hide(this.modal);
    },
    addItem() {
      this.form.push({
        price: 0,
        description: "",
      });
    },
    removeItem(index) {
      // Solo elimina el item del array local.
      this.form.splice(index, 1);
    },
  },
  // No hay props ni mounted necesarios, el componente gestiona su propio estado.
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
