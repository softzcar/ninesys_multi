<template>
  <div>
    <b-button variant="info" @click="$bvModal.show(modal)">TEST</b-button>

    <b-modal :id="modal" :title="title" hide-footer size="xl">
      <b-overlay :show="overlay" spinner-small>
        <b-table-lite
          bordered
          responsive
          small
          :fields="fields"
          :items="resultORdenes"
        ></b-table-lite>

        <pre class="force">
                    <!-- <h3>resultORdenes</h3> -->
                    <!-- {{ resultORdenes }} -->
                    <hr />
                    <h3>ordenesProyectadas</h3>
                    {{ ordenesProyectadas }}
                </pre>
      </b-overlay>
    </b-modal>
  </div>
</template>


<script>
export default {
  data() {
    return {
      title: "Test",
      overlay: false,
      fields: [
        {
          key: "id_orden",
          label: "ORDEN",
        },
        {
          key: "nombre_departamento",
          label: "Departamento",
        },
        {
          key: "nombre_producto",
          label: "Producto",
        },
        {
          key: "tiempo_real_depto_formateado",
          label: "Tiempo Terminado",
        },
        {
          key: "fecha_inicio_original_item_formateada",
          label: "Inicio Empleado",
        },
        {
          key: "fecha_terminado_original_item_formateada",
          label: "Fin Empleado",
        },
        {
          key: "fecha_inicio_calculada_depto_formateada",
          label: "Inicio Calculado",
        },
        {
          key: "fecha_finalizacion_estimada_depto_formateada",
          label: "Fin Estimado",
        },
      ],
    };
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    resultORdenes() {
      if (!this.ordenesProyectadas || this.ordenesProyectadas.length === 0) {
        return [];
      }

      const allDepartmentItems = this.ordenesProyectadas.flatMap((order) => {
        return order.items_departamentos.map((deptItem) => {
          return {
            // Campos para identificación y ordenación
            id_orden: deptItem.id_orden, // Tomar del deptItem directamente si es idéntico a order.id_orden
            orden_fila_orden: order.orden_fila_orden, // Este viene de la orden padre
            id_departamento: deptItem.id_departamento,
            nombre_departamento: deptItem.nombre_departamento,
            nombre_producto: deptItem.nombre_producto,
            cantidad: deptItem.cantidad,
            orden_proceso: deptItem.orden_proceso,

            // *** LOS 5 CAMPOS ESPECÍFICOS SOLICITADOS ***
            fecha_inicio_calculada_depto_formateada:
              deptItem.fecha_inicio_calculada_depto_formateada,
            fecha_finalizacion_estimada_depto_formateada:
              deptItem.fecha_finalizacion_estimada_depto_formateada,
            tiempo_estimado_depto_formateado:
              deptItem.tiempo_estimado_depto_formateado,
            fecha_inicio_original_item_formateada:
              deptItem.fecha_inicio_original_item_formateada,
            fecha_terminado_original_item_formateada:
              deptItem.fecha_terminado_original_item_formateada,

            // Otros campos que podrían ser útiles en la tabla
            tiempo_real_depto_formateado: deptItem.tiempo_real_depto_formateado, // Mantengo este campo
          };
        });
      });

      // Ordenación principal por 'orden_proceso', secundaria por 'orden_fila_orden'
      allDepartmentItems.sort((a, b) => {
        if (a.orden_proceso !== b.orden_proceso) {
          return a.orden_proceso - b.orden_proceso;
        }
        return a.orden_fila_orden - b.orden_fila_orden;
      });

      return allDepartmentItems;
    },
  },

  methods: {
    joinDepartamentos() {
      if (this.ordenesProyectadas.length) {
        return [];
      } else {
        console.log(
          'Unir todos los items de "items_departamentos" para mostrarlos como quiere Ricardo'
        );
      }
    },
  },

  props: ["obj", "ordenes", "ordenesProyectadas"],
};
</script>