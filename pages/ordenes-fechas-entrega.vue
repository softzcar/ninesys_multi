<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <b-container>
        <b-row>
          <b-col>
            <h2 class="mb-4">Detalles de Órdenes</h2>
            <!-- 2026-08-13: el backend ya no separa el tiempo por producto dentro
                 de cada departamento (consulta agregada por orden+departamento) --
                 este reporte muestra departamento en vez de producto > departamento.
                 El número de orden abre el detalle completo (productos, tallas,
                 telas) desde linkSearch.
                 2026-08-13: con decenas de órdenes, las pestañas (b-tabs) se
                 amontonaban en varias filas arriba y el detalle de la orden
                 elegida se renderizaba muy abajo, lejos del click. Se cambió a
                 un acordeón: el detalle aparece inmediatamente debajo de la
                 orden en la que se hace click, y solo una orden está expandida
                 a la vez (accordion group) para no perder el orden de la lista.
                 El título mostraba fecha_estimada_finalizacion_orden (proyección
                 de fin de producción) mientras la lista se ordena por
                 fecha_entrega_orden (fecha pactada) -- dos campos distintos, así
                 que al ordenar por fecha pactada el título dejaba de verse en
                 orden. Corregido para mostrar la misma fecha por la que se
                 ordena; la fecha estimada de finalización se movió al detalle. -->
            <b-card
              v-for="orden in ordenesProyectadas"
              :key="orden.id_orden"
              no-body
              class="mb-2"
            >
              <b-card-header
                v-b-toggle="`collapse-orden-${orden.id_orden}`"
                header-tag="header"
                role="tab"
                class="d-flex justify-content-between align-items-center"
                style="cursor: pointer"
              >
                <span>
                  Orden {{ orden.id_orden }} - Entrega:
                  {{ orden.fecha_entrega_formateada }}
                </span>
                <b-badge :variant="orden.variant">{{ orden.variant_text }}</b-badge>
              </b-card-header>
              <b-collapse
                :id="`collapse-orden-${orden.id_orden}`"
                accordion="ordenes-fechas-entrega-accordion"
                role="tabpanel"
                lazy
              >
                <b-card-body>
                  <p class="card-text">
                    <linkSearch :id="orden.id_orden" />
                  </p>
                  <p class="card-text">
                    <strong>Unidades Totales:</strong>
                    {{ orden.total_unidades }}
                  </p>
                  <p class="card-text">
                    <strong>Fecha de Entrega Pactada:</strong>
                    {{ orden.fecha_entrega_formateada }}
                  </p>
                  <p class="card-text">
                    <strong>Tiempo Total Estimado de la
                      Orden:</strong>
                    {{
                                            orden.tiempo_total_estimado_orden_formateado
                                        }}
                  </p>
                  <p class="card-text">
                    <strong>Fecha de Inicio de la
                      Orden:</strong>
                    {{
                                            orden.fecha_inicio_orden_formateada
                                        }}
                  </p>
                  <p class="card-text">
                    <strong>Fecha Estimada de Finalización:</strong>
                    {{ orden.fecha_estimada_finalizacion_orden_formateada }}
                  </p>
                  <b-table
                    striped
                    hover
                    :fields="fields"
                    :items="orden.departamentos"
                  >
                    <template #cell(estado)="row">
                      <b-badge :variant="row.item.fecha_terminado ? 'success' : 'secondary'">
                        {{ row.item.fecha_terminado ? 'Terminado' : 'Pendiente' }}
                      </b-badge>
                    </template>
                  </b-table>
                </b-card-body>
              </b-collapse>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixin-proyeccion-entrega.js";
import { mapState } from "vuex";

export default {
  mixins: [mixin],

  data() {
    return {
      fechas: [],
      // 2026-08-13: campos por departamento (ya no por producto, ver nota en
      // el template).
      fields: [
        {
          key: "nombre_departamento",
          label: "Departamento",
        },
        {
          key: "estado",
          label: "Estado",
        },
        {
          key: "cant_empleados",
          label: "Empleados Asignados",
        },
        {
          key: "fecha_inicio_original_item_formateada",
          label: "Inicio Real",
        },
        {
          key: "fecha_finalizacion_estimada_depto_formateada",
          label: "Fin (real o estimado)",
        },
        {
          key: "tiempo_estimado_depto_formateado",
          label: "Tiempo Estimado",
        },
      ],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),

    // Antes se llamaba proyectarEntregaConCola() directo en el v-for del
    // template -- se recalculaba en cada render (ej. al abrir/cerrar el
    // acordeón). Con decenas de órdenes eso es costoso; como computed solo
    // se recalcula si cambian this.fechas o el horario laboral.
    ordenesProyectadas() {
      return this.proyectarEntregaConCola(
        this.fechas,
        this.$store.state.login.dataEmpresa.horario_laboral
      );
    },
  },

  methods: {
    async getOrdenesFechas() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/ordenes/proyeccion-entrega`)
        .then((res) => {
          this.fechas = res.data;
        })
        .catch((err) => {
          this.$fire({
            title: "Error",
            html: `<P>No se recibieron las fechas</p><p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  mounted() {
    this.getOrdenesFechas();
  },
};
</script>

<style scoped>
.force {
  white-space: pre-wrap; /* Since CSS white-space property is not inherited in Vue */
}
</style>