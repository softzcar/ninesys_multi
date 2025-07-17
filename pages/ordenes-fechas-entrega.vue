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
                    :items="orden.productos"
                  >
                    <template #cell(departamentos)="row">
                      <b-list-group>
                        <b-list-group-item
                          v-for="(prod, index) in row
                                                        .item.departamentos"
                          :key="index"
                          class="d-flex justify-content-between align-items-center"
                        >
                          {{
                                                        prod.nombre_departamento
                                                    }}
                          <b-badge
                            variant="primary"
                            pill
                          >{{
                                                            (
                                                                prod.tiempo_estimado_segundos /
                                                                60
                                                            ).toFixed(1)
                                                        }}
                            Min</b-badge>
                        </b-list-group-item>
                      </b-list-group>
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
      fields: [
        {
          key: "nombre_producto",
          label: "Producto",
        },
        {
          key: "hora",
          label: "Hora",
        },
        {
          key: "tiempo_total_estimado_producto_formateado",
          label: "Tiempo estimado",
        },
        {
          key: "departamentos",
          label: "Departamentos",
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