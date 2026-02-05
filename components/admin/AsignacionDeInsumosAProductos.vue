<template>
  <div>
    <b-button @click="showModal()" variant="primary">
      <b-icon icon="plus-lg"></b-icon> Insumos
    </b-button>

    <b-modal :id="modalId" :title="title" hide-footer size="xl">
      <b-overlay :show="overlay" spinner-small>
        <b-row class="mb-4">
          <b-col md="8">
            <label>Importar desde otro producto:</label>
            <vue-typeahead-bootstrap v-model="queryImport" :data="$store.state.comerce.dataProductosSelect"
              @hit="onProductSelected" placeholder="Nombre, SKU o ID de producto..." />
          </b-col>
          <b-col md="4" class="d-flex align-items-end">
            <b-button variant="info" :disabled="!productToImport" @click="openImportWizard" block>
              <b-icon icon="download"></b-icon> Importar
            </b-button>
          </b-col>
        </b-row>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="mb-0">Producto: {{ item.name }}</h3>
          <b-button v-if="!selectedDepartment" variant="success" @click="saveAllGlobal" :disabled="isFormEmpty">
            <b-icon icon="save"></b-icon> Guardar Todo (Todos los Depts)
          </b-button>
        </div>

        <b-tabs content-class="mt-3">
          <b-tab :title="dep.departamento" v-for="(dep, index) in filterDeps" :key="index"
            @click="loadDataTab(dep._id)">
            <b-alert v-if="showDom === false" show variant="info"><a href="#" class="alert-link">Seleccione un
                departamento</a></b-alert>
            <div v-else>
              <admin-AsignacionDeInsumosAProductosTab :key="dep._id" :form="form[dep._id]" :item="dep" :idprod="item.cod"
                :iddep="dep._id" :tiemposprod="tiemposprod" :insumosasignados="insumosasignados"
                :selectinsumos="selectinsumos" :selecttallas="selectTallas" :tiempoInicial="getTiempo(item, dep._id)"
                @reload="reloadParent" />
            </div>
          </b-tab>
        </b-tabs>
      </b-overlay>
    </b-modal>

    <admin-AsignacionImportarModal 
      :id="importModalId"
      :source-product="productToImport"
      :dest-product-id="item.cod"
      :selected-department-id="selectedDepartment"
      @imported="handleImported"
    />
  </div>
</template>

<script>
import AsignacionImportarModal from './AsignacionImportarModal.vue';

export default {
  components: {
    'admin-AsignacionImportarModal': AsignacionImportarModal
  },
  data() {
    return {
      showDom: false,
      title: `Asignación De Insumos`,
      overlay: false,
      form: {},
      selectTallas: [],
      queryImport: "",
      productToImport: null,
      modalId: `modal-asignacion-${Math.random().toString(36).substring(2, 7)}`,
      importModalId: `modal-import-wizard-${Math.random().toString(36).substring(2, 7)}`,
    };
  },

  computed: {
    filterDeps() {
      const filtered = this.departamentos.filter((dep) => dep.asignar_numero_de_paso > 0);
      if (this.selectedDepartment) {
        return filtered.filter(dep => dep._id === this.selectedDepartment);
      }
      return filtered;
    },

    modal: function () {
      // DEPRECATED: Se mueve a data como modalId para evitar re-cálculos.
      return this.modalId;
    },

    isFormEmpty() {
      return Object.values(this.form).every(arr => Array.isArray(arr) && arr.length === 0);
    }
  },

  methods: {
    reloadParent() {
      this.$emit("reload");
    },

    handleImported(allSuccess) {
      if (allSuccess) {
        this.queryImport = "";
        this.productToImport = null;
      }
      this.reloadParent();
    },
    loadDataTab(idDepartamento) {
      // this.$emit("reload"); // Eliminado para evitar recarga del padre al abrir modal/tab
      this.showDom = true;
    },
    getTiempo(product, depId) {
      const tiempos = this.tiemposprod.filter(
        (t) => t.id_product === product.cod && t.id_departamento === depId
      );
      const totalSegundos = tiempos.reduce(
        (acc, t) => acc + parseInt(t.tiempo || 0),
        0
      );

      return totalSegundos;
    },
    async loadTallas() {
      try {
        const response = await this.$axios.get(`${this.$config.API}/sizes`);
        // Asumiendo que el endpoint devuelve un objeto { data: [...] }
        // y cada talla tiene 'id' y 'name'
        const tallas = response.data.data.map((talla) => {
          return {
            value: talla._id,
            text: talla.name,
            variation_percentage: talla.variation_percentage
          };
        });
        this.selectTallas = [
          { value: null, text: "No aplica / Seleccione" },
          ...tallas,
        ];
      } catch (error) {
        console.error("Error cargando las tallas:", error);
        this.$bvToast.toast("No se pudieron cargar las tallas", {
          variant: "danger",
        });
      }
    },

    showModal() {
      this.$bvModal.show(this.modalId);
    },

    relodMe() {
      this.$emit("reload");
    },

    closeModal() {
      this.$bvModal.hide(this.modalId);
    },

    onProductSelected(hit) {
      if (hit && typeof hit === "string") {
        const exploited = hit.split("|");
        const id = exploited[0].trim();
        this.productToImport = { cod: id, text: hit };
      }
    },

    openImportWizard() {
      this.$bvModal.show(this.importModalId);
    },

    async saveAllGlobal() {
      try {
        await this.$confirm(
          `Se guardarán todas las asignaciones pendientes para TODOS los departamentos mostrados.`,
          "¿Confirmar guardado global?",
          "question"
        );

        this.overlay = true;
        let allSuccess = true;

        for (const depId in this.form) {
          const assignments = this.form[depId];
          if (assignments.length === 0) continue;

          for (const assignment of assignments) {
            const data = new URLSearchParams();
            data.set("insumo", assignment.insumo);
            data.set("departamento", depId);
            data.set("cantidad", assignment.cantidad);
            data.set("unidad", assignment.unidadDeMedida);
            data.set("id_size", assignment.miTalla);
            data.set("id_product", this.item.cod); // cod is the internal ID

            try {
              await this.$axios.post(`${this.$config.API}/insumos-productos`, data);
            } catch (err) {
              allSuccess = false;
              console.error("Error al guardar:", assignment, err);
            }
          }
        }

        if (allSuccess) {
          this.$fire({ title: "Éxito", text: "Todas las asignaciones se guardaron correctamente.", type: "success" });
          // Limpiar el form
          Object.keys(this.form).forEach(key => this.form[key] = []);
          this.$emit("reload");
        } else {
          this.$fire({ title: "Atención", text: "Algunas asignaciones fallaron. Revise la consola.", type: "warning" });
        }
      } catch (e) {
        // Cancelado
      } finally {
        this.overlay = false;
      }
    }
  },

  mounted() {
    this.loadTallas();
    this.$root.$on("bv::modal::show", (bvEvent, modal) => {
      if (modal === this.modalId && this.filterDeps.length > 0) {
        const tmpDep = this.filterDeps[0];
        this.loadDataTab(tmpDep._id);
        // PREPARAR FORMULARIO
        this.departamentos.forEach((dep) => {
          if (!this.form[dep._id]) {
            this.$set(this.form, dep._id, []);
          }
        });
        this.showDom = true;
        // LIMPIAR BUSCADOR AL ABRIR
        this.queryImport = "";
        this.productToImport = null;
      }
    });
  },

  props: [
    "insumosasignados",
    "tiemposprod",
    "departamentos",
    "selectinsumos",
    "item",
    "idprod",
    "nomdep",
    "reload",
    "selectedDepartment",
  ],
};
</script>
