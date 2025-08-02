<template>
  <div>
    <b-button @click="showModal()" variant="primary">
      <b-icon icon="plus-lg"></b-icon> Insumos
    </b-button>

    <b-modal :id="modalId" :title="title" hide-footer size="xl">
      <b-overlay :show="overlay" spinner-small>
        <h3 class="mb-4 mt-4 pb-2">Producto: {{ item.name }}</h3>

        <b-tabs content-class="mt-3">
          <b-tab
            :title="dep.departamento"
            v-for="(dep, index) in filterDeps"
            :key="index"
            @click="loadDataTab(dep._id)"
          >
            <b-alert v-if="showDom === false" show variant="info"
              ><a href="#" class="alert-link"
                >Seleccione un departamento</a
              ></b-alert
            >
            <div v-else>
              <admin-AsignacionDeInsumosAProductosTab
                :key="dep._id"
                :form="form"
                :item="dep"
                :idprod="item.cod"
                :iddep="dep._id"
                :tiemposprod="tiemposprod"
                :insumosasignados="insumosasignados"
                :selectinsumos="selectinsumos"
                :selecttallas="selectTallas"
                @reload="reloadParent"
              />
            </div>
          </b-tab>
        </b-tabs>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDom: false,
      title: `Asignación De Insumos`,
      overlay: false,
      form: {},
      selectTallas: [],
      modalId: `modal-asignacion-${Math.random().toString(36).substring(2, 7)}`,
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
  },

  methods: {
    reloadParent() {
      this.$emit("reload");
    },
    loadDataTab(idDepartamento) {
      this.$emit("reload");
      this.showDom = true;
    },
    async loadTallas() {
      try {
        const response = await this.$axios.get(`${this.$config.API}/sizes`);
        // Asumiendo que el endpoint devuelve un objeto { data: [...] }
        // y cada talla tiene 'id' y 'name'
        const tallas = response.data.data.map((talla) => {
          return { value: talla._id, text: talla.name };
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
  },

  mounted() {
    this.loadTallas();
    this.$root.$on("bv::modal::show", (bvEvent, modal) => {
      if (modal === this.modalId && this.filterDeps.length > 0) {
        const tmpDep = this.filterDeps[0];
        this.loadDataTab(tmpDep._id);
        // PREPARAR FORMULARIO
        this.filterDeps.forEach((dep) => {
          this.form[dep._id] = [];
        });
        this.showDom = true;
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
