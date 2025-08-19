<template>
  <div>
    <b-alert
      v-if="proyeccion"
      :variant="proyeccion.variant"
      show
      class="small p-2 mb-0"
    >
      <h6 class="alert-heading mb-0">
        {{ proyeccion.variant_text }}
        <small>{{ proyeccion.fecha_estimada_entrega_formateada }}</small>
      </h6>
    </b-alert>
    <div v-else>
      <b-alert
        show
        variant="light"
        class="small p-2 mb-0"
      >
        <h6 class="alert-heading mb-0">
          Calculando...
        </h6>
      </b-alert>
    </div>
  </div>
</template>

<script>
import mixin from '~/mixins/mixin-proyeccion-entrega.js';

export default {
  mixins: [mixin],
  props: {
    // Este prop debe contener todos los items de departamento para UNA SOLA orden
    ordenItems: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      proyeccion: null,
    };
  },
  watch: {
    ordenItems: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.calcularProyeccion();
        }
      },
      immediate: true, // Ejecutar tan pronto el componente se monte
      deep: true, // Observar cambios profundos en el array
    },
  },
  methods: {
    calcularProyeccion() {
      if (!this.$store.state.login.dataEmpresa.horario_laboral) {
        console.error("Horario laboral no disponible en Vuex.");
        return;
      }
      const horarioLaboral = this.$store.state.login.dataEmpresa.horario_laboral;
      
      // El mixin espera un array de items, le pasamos los items de nuestra orden.
      const resultadoProyeccion = this.proyectarEntregaConCola(this.ordenItems, horarioLaboral);
      
      if (resultadoProyeccion && resultadoProyeccion.length > 0) {
        // El mixin devuelve un array de ordenes procesadas, tomamos la primera (y única).
        this.proyeccion = resultadoProyeccion[0];
      } else {
        console.error('Error al calcular la proyección para la orden.');
      }
    },
  },
};
</script>
