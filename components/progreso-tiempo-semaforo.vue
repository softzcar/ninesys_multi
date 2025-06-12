<template>
  <div>
    <!-- El botón ahora se alimenta de las propiedades computadas reactivas -->
    <b-button :variant="variant" @click="$bvModal.show(modal)">
      {{ textButton }}
    </b-button>

    <b-modal
      :id="modal"
      :title="title"
      hide-footer
      size="xl"
      @show="$emit('modal-shown')"
      @hide="$emit('modal-hidden')"
    >
      <b-overlay :show="!ordenReactiva" spinner-small>
        <!-- El contenido del modal ahora depende de 'ordenReactiva' y 'textList' -->
        <div v-if="ordenReactiva">
          <h3 class="mb-4 mt-2">
            <b-badge :variant="ordenReactiva.variant">
              LA ORDEN {{ textList.idOrden }} ESTÁ
              {{ ordenReactiva.variant_text }}
            </b-badge>
          </h3>

          <b-list-group>
            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Fecha Entrega Original:</strong>
              <!-- Etiqueta cambiada para mayor claridad -->
              <span v-html="textList.fechaEntrega"></span>
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Entrega Estimada (Final):</strong>
              <!-- Etiqueta cambiada para mayor claridad -->
              {{ textList.fechaEntregaEstimada }}
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Tiempo Total Estimado:</strong>
              {{ textList.tiempoEstimado }}
            </b-list-group-item>

            <b-list-group-item :variant="ordenReactiva.variant">
              <strong>Tiempo Restante:</strong>
              {{ textList.tiempoRestante }}
            </b-list-group-item>
          </b-list-group>

          <h3 class="mt-4">Resumen de Tareas</h3>

          <!-- La tabla ahora usa 'ordenReactiva.tareas' -->
          <b-table-lite
            bordered
            responsive
            small
            striped
            :items="ordenReactiva.tareas"
            :fields="fieldsTareas"
          >
          </b-table-lite>
        </div>

        <div v-else>
          <b-alert show
            >La orden aún no tiene personal asignado o no se encuentra.</b-alert
          >
        </div>
      </b-overlay>
    </b-modal>
  </div>
</template>
    
  <script>
// Importa el mixin
import procesamientoOrdenesMixin from "~/mixins/procesamientoOrdenes.js"; // Asegúrate de que la ruta sea correcta

export default {
  // Registra el mixin
  mixins: [procesamientoOrdenesMixin],

  props: {
    // <-- MODIFICACIÓN: 'obj' ya no es necesario y se ha eliminado. -->
    ordenesProyectadas2: {
      type: Array,
      default: () => [],
    },
    id_orden: {
      type: [Number, String],
      required: true,
    },
    reload: {
      type: Function,
      default: () => {},
    },
  },

  data() {
    return {
      // El "reloj" reactivo
      ahora: new Date(),
      intervaloReloj: null,
      fieldsTareas: [
        { key: "nombre_departamento", label: "Departamento" },
        { key: "fecha_inicio_formateada", label: "Inicio Real" },
        { key: "fecha_terminado_formateada", label: "Terminado Real" },
        { key: "fecha_estimada_inicio_formateada", label: "Inicio Estimado" },
        { key: "fecha_estimada_fin_formateada", label: "Fin Estimado" },
        {
          key: "tiempo_total_orden_depto_formateado",
          label: "Tiempo Estimado",
        },
        { key: "tiempo_real_empleado_formateado", label: "Tiempo Real" },
      ],
    };
  },

  computed: {
    modal() {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    ordenReactiva() {
      if (!this.ordenesProyectadas2 || !this.ordenesProyectadas2.length) {
        return null;
      }
      const ordenBase = this.ordenesProyectadas2.find(
        (o) => o.id_orden === this.id_orden
      );

      if (!ordenBase) {
        return null;
      }

      const { variant, variant_text } = this._determinarVarianteOrden(
        ordenBase,
        this.ahora
      );
      const tareasActualizadas = ordenBase.tareas.map((tarea) => {
        const { variant: tareaVariant, variant_text: tareaVariantText } =
          this._determinarVarianteTarea(tarea, this.ahora);
        return {
          ...tarea,
          variant: tareaVariant,
          variant_text: tareaVariantText,
        };
      });

      return {
        ...ordenBase,
        variant,
        variant_text,
        tareas: tareasActualizadas,
      };
    },

    title() {
      return this.ordenReactiva
        ? `Orden ${this.ordenReactiva.id_orden}`
        : `Orden sin asignaciones`;
    },

    variant() {
      return this.ordenReactiva ? this.ordenReactiva.variant : "light";
    },

    textButton() {
      if (this.ordenReactiva && this.ordenReactiva.variant_text === "PAUSADA")
        return "PAUSADA";
      if (!this.ordenReactiva) return "Por asignar";
      if (this.ordenReactiva.variant === "light")
        return this.ordenReactiva.variant_text;

      const ultimaTarea =
        this.ordenReactiva.tareas[this.ordenReactiva.tareas.length - 1];
      return ultimaTarea
        ? ultimaTarea.fecha_estimada_fin_formateada
        : "Ver detalles";
    },

    textList() {
      if (!this.ordenReactiva) return {};

      // La fecha estimada de entrega final es la fecha de fin de la última tarea.
      const fechaEntregaEstimadaFinal =
        this.ordenReactiva.tareas.length > 0
          ? this.ordenReactiva.tareas[this.ordenReactiva.tareas.length - 1]
              .fecha_estimada_fin_formateada
          : "N/D";

      return {
        idOrden: this.ordenReactiva.id_orden,
        status: this.ordenReactiva.variant_text,
        tiempoEstimado: this.ordenReactiva.tiempo_neto_orden_formateado,
        tiempoRestante: this.ordenReactiva.tiempo_pendiente_orden_formateado,
        // <-- MODIFICACIÓN CLAVE: Ahora usamos la propiedad del objeto reactivo. -->
        fechaEntrega: this.ordenReactiva.fecha_entrega_orden || "N/D",
        fechaEntregaEstimada: fechaEntregaEstimadaFinal,
      };
    },
  },

  mounted() {
    this.intervaloReloj = setInterval(() => {
      //   this.$emit("reload");
      this.ahora = new Date();
    }, 60000);
  },

  beforeDestroy() {
    clearInterval(this.intervaloReloj);
  },
};
</script>