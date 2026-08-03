<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
          accessModule.accessData.id_modulo === 2 ||
          accessModule.accessData.id_modulo === 1
        ">
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container v-if="
              this.accessModule.accessData.id_modulo === 2 ||
              accessModule.accessData.id_modulo === 1
            ">
            <b-row>
              <b-col>
                <h1 class="mb-4">{{ titulo }}</h1>
              </b-col>
            </b-row>

            <b-form
              class="mb-4"
              @submit="onSubmit"
            >
              <b-row>
                <b-col md="4" v-if="currentDepartamentId === 5">
                  <h3>Vendedor</h3>
                  <b-form-select
                    v-model="vendedorSeleccionado"
                    :options="vendedoresOptions"
                    class="mb-4"
                  >
                    <template #first>
                      <b-form-select-option :value="null" disabled>-- Seleccione un vendedor --</b-form-select-option>
                      <b-form-select-option :value="0">Todos los vendedores</b-form-select-option>
                    </template>
                  </b-form-select>
                </b-col>
                <b-col md="4">
                  <h3>Fecha Inicio</h3>
                  <b-form-datepicker
                    class="mb-4"
                    v-model="fechaConsultaInicio"
                  />
                </b-col>
                <b-col md="4">
                  <h3>Fecha Fin</h3>
                  <b-form-datepicker
                    class="mb-4"
                    v-model="fechaConsultaFin"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col class="text-center">
                  <b-button
                    type="submit"
                    variant="primary"
                    size="lg"
                    class="px-5 shadow-sm"
                  >
                    <b-icon icon="search" class="mr-2"></b-icon> GENERAR REPORTE
                  </b-button>
                </b-col>
              </b-row>
            </b-form>

            <div v-if="!reporteGenerado" class="py-5 text-center">
              <b-icon icon="info-circle" variant="info" font-scale="4" class="mb-4"></b-icon>
              <h2 class="text-muted">Seleccione un vendedor y un rango de fechas para generar el reporte</h2>
              <p class="text-muted small">Puede elegir un vendedor específico o visualizar los totales de toda la empresa.</p>
            </div>

            <div v-else>
              <b-card>
                <b-row>
                  <b-col>
                    <h3 class="mt-4">Efectivo</h3>

                    <template v-for="m in dataReport.efectivo">
                      <div :key="m.id_moneda">
                        <h3>{{ m.nombre.toUpperCase() }}</h3>

                        <b-alert
                          v-if="!m.items || m.items.length === 0"
                          variant="info"
                          show
                        >No hay {{ m.nombre.toLowerCase() }} en la caja</b-alert>

                        <div v-else>
                          <b-table
                            striped
                            small
                            :items="m.items"
                            :fields="fields"
                            foot-clone
                          >
                            <template #cell(moneda)="data">
                              {{ data.item.moneda }}
                              {{ data.item.metodo_pago }}
                            </template>

                            <template #cell(monto)="data">
                              <div class="text-right">
                                {{ formatNumber(data.item.monto) }}
                              </div>
                            </template>

                            <template #cell(tasa)="data">
                              <div class="text-right">
                                {{ formatNumber(data.item.tasa) }}
                              </div>
                            </template>

                            <template #cell(monto_base)="data">
                              <div class="text-right">
                                {{ formatNumber(data.item.monto_base) }}
                              </div>
                            </template>
                          </b-table>

                          <b-row>
                            <b-col>
                              <h4 class="text-right mb-4">Total {{ m.nombre }} {{ formatNumber(totalPorItems(m.items)) }}</h4>
                              <p
                                v-if="totalRetirosPorMoneda(m.nombre) > 0"
                                class="text-right text-muted small mb-4"
                              >
                                Neto {{ m.nombre }} (efectivo &minus; retiros de esta moneda):
                                {{ formatNumber(totalPorItems(m.items) - totalRetirosPorMoneda(m.nombre)) }}
                              </p>
                            </b-col>
                          </b-row>
                        </div>
                      </div>
                    </template>
                  </b-col>
                </b-row>

              <b-row>
                <b-col>
                  <h3>Retiros</h3>

                  <b-alert
                    v-if="!dataReport.retiros || dataReport.retiros.length === 0"
                    variant="info"
                    show
                  >No hay retiros</b-alert>

                  <div v-else>
                    <b-table
                      striped
                      small
                      :items="dataReport.retiros"
                      :fields="fields"
                      foot-clone
                    >
                      <template #cell(moneda)="data">
                        {{ data.item.moneda }}
                        {{ data.item.metodo_pago }}
                      </template>

                      <template #cell(monto)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto) }}
                        </div>
                      </template>

                      <template #cell(tasa)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.tasa) }}
                        </div>
                      </template>

                      <template #cell(monto_base)="data">
                        <div class="text-right">
                          {{ formatNumber(data.item.monto_base) }}
                        </div>
                      </template>
                    </b-table>

                    <b-row>
                      <b-col>
                        <h4 class="text-right mb-4">Total Retiros {{ formatNumber(totalRetiros) }}</h4>
                      </b-col>
                    </b-row>
                  </div>
                </b-col>
              </b-row>

              <b-row>
                <b-col>
                  <h4 class="text-right mb-4">
                    Total Efectivo (todas las monedas convertidas a {{ codigoBase }})
                    <span class="money-result">{{ simboloBase }}
                      {{
                        formatNumber(getTotal("efectivo") - totalRetiros)
                      }}</span>
                  </h4>
                  <p class="text-right text-muted small">
                    Suma el neto del período (efectivo &minus; retiros) de cada moneda -- ver el
                    desglose "Neto" debajo de cada moneda arriba. No es comparable directo contra
                    el saldo disponible de una sola moneda en Retiros/Cierre de Caja, que es
                    acumulado desde siempre, no de este rango de fechas.
                  </p>
                </b-col>
              </b-row>
            </b-card>

            <b-card class="mt-4">
              <b-row>
                <b-col>
                  <template v-for="d in dataReport.digital">
                    <div :key="d.nombre">
                      <h3>{{ d.nombre }}</h3>

                      <b-alert
                        v-if="!d.items || d.items.length === 0"
                        variant="info"
                        show
                      >No hay {{ d.nombre }}</b-alert>

                      <div v-else>
                        <b-table
                          striped
                          small
                          :items="d.items"
                          :fields="fields"
                          foot-clone
                        >
                          <template #cell(moneda)="data">
                            {{ data.item.moneda }}
                            {{ data.item.metodo_pago }}
                          </template>

                          <template #cell(monto)="data">
                            <div class="text-right">
                              {{ formatNumber(data.item.monto) }}
                            </div>
                          </template>

                          <template #cell(tasa)="data">
                            <div class="text-right">
                              {{ formatNumber(data.item.tasa) }}
                            </div>
                          </template>

                          <template #cell(monto_base)="data">
                            <div class="text-right">
                              {{ formatNumber(data.item.monto_base) }}
                            </div>
                          </template>
                        </b-table>

                        <b-row>
                          <b-col>
                            <h4 class="text-right mb-4">Total {{ d.nombre }} {{ formatNumber(totalPorItems(d.items)) }}</h4>
                          </b-col>
                        </b-row>
                      </div>
                    </div>
                  </template>
                </b-col>
              </b-row>
            </b-card>

            <b-row>
              <b-col>
                <hr />
                <h4 class="text-right mb-4 mt-4 pb-4">
                  Total General
                  <span class="money-result">{{ simboloBase }}
                    {{
                      formatNumber(getTotal("efectivo") + getTotal("digital") - totalRetiros)
                    }}</span>
                </h4>
              </b-col>
            </b-row>
          </div>


          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin, mixinLogin],

  data() {
    return {
      titulo: "Reporte de caja",
      overlay: false,
      reporteGenerado: false,
      vendedorSeleccionado: null,
      vendedores: [],
      fechaConsultaInicio: null,
      fechaConsultaFin: null,
      dataReport: {
        efectivo: [], // [{id_moneda, codigo, nombre, simbolo, items}]
        digital: [], // [{nombre, items}]
        retiros: [],
      },
      monedaBase: null,
    };
  },
  computed: {
    ...mapState("login", ["dataUser", "access", "currentDepartamentId"]),

    codigoBase() {
      return this.monedaBase ? this.monedaBase.codigo : "";
    },

    simboloBase() {
      return this.monedaBase ? this.monedaBase.simbolo : "$";
    },

    fields() {
      return [
        { key: "moneda", label: "Moneda" },
        {
          key: "monto",
          label: "Monto",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "tasa",
          label: "Tasa",
          thClass: "text-right",
          tdClass: "text-right",
        },
        {
          key: "monto_base",
          label: `Total ${this.codigoBase}`,
          thClass: "text-right",
          tdClass: "text-right",
        },
      ];
    },

    totalRetiros() {
      return this.totalPorItems(this.dataReport.retiros);
    },

    vendedoresOptions() {
      return this.vendedores.map((v) => ({
        value: v._id,
        text: v.nombre,
      }));
    },
  },

  methods: {
    totalPorItems(items) {
      return (items || []).reduce((total, item) => total + (parseFloat(item.monto_base) || 0), 0);
    },

    // "Total Efectivo" combina TODAS las monedas convertidas -- útil como
    // panorama general, pero no comparable directo contra el saldo de una
    // sola moneda (ej. Retiros/Cierre de Caja). Este desglose por moneda deja
    // claro qué aportó cada una al neto del período (hallazgo real: el
    // usuario comparó "Total Efectivo" contra el saldo de Dólares y no
    // coincidían -- eran dos preguntas distintas, no un error, 2026-08-03).
    totalRetirosPorMoneda(nombreMoneda) {
      const items = (this.dataReport.retiros || []).filter((r) => r.moneda === nombreMoneda);
      return this.totalPorItems(items);
    },

    // "efectivo"/"digital" son arrays de grupos ({items: [...]}), "retiros" ya es un array plano de items.
    getTotal(campo) {
      const dataToProcess = this.dataReport[campo];
      if (!dataToProcess) {
        return 0;
      }

      if (campo === "efectivo" || campo === "digital") {
        return dataToProcess.reduce((total, grupo) => total + this.totalPorItems(grupo.items), 0);
      }

      return this.totalPorItems(dataToProcess);
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;

      if (this.vendedorSeleccionado === null || !fechaInicio || !fechaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione un vendedor y un rango de fechas</p>`,
          type: "warning",
        });
        return;
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>La fecha de inicio debe ser anterior o igual a la fecha de fin</p>`,
          type: "warning",
        });
        return;
      }
      this.realizarConsulta();
    },

    realizarConsulta() {
      this.overlay = true;
      this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin, this.vendedorSeleccionado).then(
        () => {
          this.overlay = false;
          this.reporteGenerado = true;
        }
      );
    },

    async getCierre(inicio, fin, id_vendedor) {
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-caja/${inicio}/${fin}/${id_vendedor}`
        )
        .then((res) => {
          const apiData = res.data.data || {};

          this.dataReport = {
            efectivo: apiData.efectivo || [],
            digital: apiData.digital || [],
            retiros: apiData.retiros || [],
          };

          this.monedaBase = res.data.monedaBase || null;
          this.vendedores = res.data.vendedores || [];
        });
    },

    fechaActual() {
      let date = new Date();
      let day = `${date.getDate()}`.padStart(2, "0");
      let month = `${date.getMonth() + 1}`.padStart(2, "0");
      let year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },
  },

  beforeMount() {
    this.fechaConsultaInicio = this.fechaActual();
    this.fechaConsultaFin = this.fechaActual();
  },

  mounted() {
    this.overlay = true;
    // Si no es Administración (ID 5, el estándar real de la plantilla de
    // empresa -- antes decía 7 por error, que en realidad es Diseño, ver
    // hallazgo 2026-08-03), fijar el vendedor como el propio empleado.
    if (this.currentDepartamentId !== 5) {
      this.vendedorSeleccionado = this.dataUser.id_empleado;
    }

    // Cargar vendedores inicialmente (usamos el repo de reporte de caja para traer la lista)
    // Si no es Administración, cargamos solo sus datos
    const idConsulta = this.currentDepartamentId === 5 ? 0 : this.dataUser.id_empleado;

    this.getCierre(this.fechaConsultaInicio, this.fechaConsultaFin, idConsulta).then(() => {
      this.overlay = false;
    });
  },
};
</script>
