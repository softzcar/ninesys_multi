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
                 telas) desde linkSearch. -->
            <b-tabs>
              <b-tab
                v-for="orden in proyectarEntregaConCola(
                                    fechas,
                                    $store.state.login.dataEmpresa
                                        .horario_laboral
                                )"
                :key="orden.id_orden"
                :title="`Orden ${orden.id_orden} - Entrega: ${orden.fecha_estimada_finalizacion_orden_formateada}`"
              >
                <b-card>
                  <p class="card-text">
                    <linkSearch :id="orden.id_orden" />
                    <b-badge :variant="orden.variant" class="ml-2">{{ orden.variant_text }}</b-badge>
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
                </b-card>
                <p>
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
                </p>
              </b-tab>
            </b-tabs>
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