<template>
  <div>
    <b-alert
      v-if="status === 'terminado'"
      show
      variant="success"
    >TERMINADA</b-alert>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <div class="floatme">
        <b-progress
          :max="max"
          variant="success"
        >
          <b-progress-bar :value="miPorcentaje">
            <span><strong>{{ miPorcentaje }}%</strong>
              {{ this.departamento }}
            </span>
          </b-progress-bar>
        </b-progress>
      </div>
      <div class="floatme">
        <inventario-prioridad-switch :item="item" />
      </div>

      <div class="floatme">
        <produccion-asignar
          :reload="reload"
          :id="item.orden"
        />
      </div>
      <div class="floatme">
        <produccion-reposicion
          :departamento="
                        this.$store.state.login.dataUser.departamento
                    "
          :reload="reload"
          :item="item"
        />
      </div>
      <div>
        <!-- Selector de paso comentado -->
      </div>
    </b-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reload: false,
      overlay: false,
      max: 100,
    };
  },

  computed: {
    // Usa directamente el paso del item (ya viene calculado desde el backend)
    departamento() {
      return this.item.paso || 'Por asignar';
    },
    // Usa directamente el porcentaje del item (ya viene calculado desde el backend)
    miPorcentaje() {
      return this.item.progreso_porcentaje || 0;
    },
    status() {
      return this.item.estatus;
    }
  },

  methods: {
    reloadData() {
      this.$nuxt.$emit("loadOrdersProduction");
    },
  },

  props: ["item"],
};
</script>

<style scoped>
.floatme {
  float: left;
  margin-right: 4px;
}
</style>

