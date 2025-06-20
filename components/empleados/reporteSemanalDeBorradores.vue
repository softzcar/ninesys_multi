<template>
  <div>
    <a href="#" @click.prevent="showModal" class="nav-link">
      <b-icon icon="journal-text" class="mr-1"></b-icon>
      Reporte de Borradores
    </a>

    <b-modal :id="modalId" :title="title" size="lg" hide-footer>
      <b-overlay :show="overlay" spinner-small rounded="sm">
        <!-- Date Filter Buttons -->
        <b-button-group size="sm" class="mb-3 d-flex flex-wrap">
          <b-button
            :variant="selectedDate === null ? 'primary' : 'outline-secondary'"
            @click="selectedDate = null"
          >
            Toda la semana
          </b-button>
          <b-button
            v-for="day in weekDays"
            :key="day.value"
            :variant="
              selectedDate === day.value ? 'primary' : 'outline-secondary'
            "
            @click="selectedDate = day.value"
          >
            {{ day.text }}
          </b-button>
        </b-button-group>

        <div v-if="filteredItems.length > 0">
          <b-card
            v-for="item in filteredItems"
            :key="item.id_ordenes_borador_empleado"
            class="mb-3"
            no-body
          >
            <b-card-header header-tag="header" class="p-3 bg-light">
              <h5 class="mb-0 d-flex align-items-center">
                <link-search :id="item.id_orden" />
                <span class="ml-2">{{ item.cliente_nombre }}</span>
              </h5>
            </b-card-header>
            <b-card-body>
              <div v-html="item.borrador"></div>
            </b-card-body>
          </b-card>
        </div>
        <div v-else>
          <b-alert show variant="secondary" class="text-center"
            ><span v-if="items.length === 0"
              >No se encontraron borradores para esta semana.</span
            ><span v-else>No hay borradores para el día seleccionado.</span>
          </b-alert>
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "Reporte Semanal de Borradores",
      overlay: false,
      items: [],
      weekDays: [],
      selectedDate: null,
    };
  },
  computed: {
    modalId() {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-reporte-borradores-${rand}`;
    },
    filteredItems() {
      if (!this.selectedDate) {
        return this.items;
      }
      return this.items.filter((item) => {
        // item.moment is 'YYYY-MM-DD HH:MM:SS'
        // this.selectedDate is 'YYYY-MM-DD'
        return item.moment && item.moment.startsWith(this.selectedDate);
      });
    },
  },
  methods: {
    showModal() {
      this.selectedDate = null; // Reset filter
      this.getWeekDays();
      this.fetchReport();
      this.$bvModal.show(this.modalId);
    },
    getWeekDays() {
      const diasLaborales =
        this.$store.state.login.dataEmpresa.horario_laboral?.diasLaborales;

      // Si no hay días laborales definidos, no mostrar ningún botón de día.
      if (!diasLaborales || !Array.isArray(diasLaborales)) {
        this.weekDays = [];
        return;
      }

      const days = [];
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const startOfWeek = new Date(today);
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lunes como inicio de semana
      startOfWeek.setDate(today.getDate() + diff);
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const currentDayOfWeek = currentDay.getDay();

        // Solo añadir el botón si el día está en la lista de días laborales
        if (diasLaborales.includes(currentDayOfWeek)) {
          const day = String(currentDay.getDate()).padStart(2, "0");
          const month = String(currentDay.getMonth() + 1).padStart(2, "0");
          const year = currentDay.getFullYear();
          days.push({
            text: `${dayNames[currentDayOfWeek]} ${day}`,
            value: `${year}-${month}-${day}`,
          });
        }
      }
      this.weekDays = days;
    },
    async fetchReport() {
      this.overlay = true;
      this.items = []; // Limpiar resultados previos

      const id_empleado = this.$store.state.login.dataUser.id_empleado;
      const id_departamento = this.$store.state.login.currentDepartamentId;

      try {
        const url = `${this.$config.API}/ordenes/borrador/reporte-semanal/${id_empleado}/${id_departamento}`;
        const response = await this.$axios.get(url);
        this.items = response.data;
      } catch (error) {
        console.error("Error al cargar el reporte de borradores:", error);
        this.$fire({
          title: "Error de Conexión",
          html: `<p>No se pudo cargar el reporte.</p><p>${error}</p>`,
          type: "error",
        });
      } finally {
        this.overlay = false;
      }
    },
  },
};
</script>

<style scoped>
/* Estilos para asegurar que el HTML renderizado se vea bien dentro de la tarjeta */
.card-body div >>> p,
.card-body div >>> ul,
.card-body div >>> ol {
  margin-bottom: 0.5rem;
}
.card-body div >>> ul,
.card-body div >>> ol {
  padding-left: 1.5rem;
}
</style>