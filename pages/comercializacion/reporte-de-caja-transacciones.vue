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
        <b-container>
          <b-row>
            <b-col>
              <h1 class="mb-4">Transacciones de Caja</h1>
            </b-col>
          </b-row>

          <b-overlay :show="loading" spinner-small>
            <b-row class="mb-4 justify-content-center">
              <b-col md="12" lg="10">
                <b-card class="shadow-sm border-light">
                  <b-row align-v="center">
                    <b-col md="5">
                      <label class="small font-weight-bold text-muted text-uppercase">Fecha Inicio</label>
                      <b-form-datepicker
                        v-model="fechaInicio"
                        @input="getTransacciones"
                        :max="today"
                        locale="es-VE"
                        size="sm"
                        placeholder="Inicio"
                        class="border-light"
                      ></b-form-datepicker>
                    </b-col>
                    <b-col md="2" class="text-center pt-3">
                      <b-icon icon="arrow-right" variant="primary" font-scale="1.5"></b-icon>
                    </b-col>
                    <b-col md="5">
                      <label class="small font-weight-bold text-muted text-uppercase">Fecha Fin</label>
                      <b-form-datepicker
                        v-model="fechaFin"
                        @input="getTransacciones"
                        :max="today"
                        locale="es-VE"
                        size="sm"
                        placeholder="Fin"
                        class="border-light"
                      ></b-form-datepicker>
                    </b-col>
                  </b-row>

                  <b-alert
                    v-if="dateError"
                    show
                    variant="danger"
                    class="mt-3 mb-0 small py-2 px-3 border-0 shadow-sm"
                  >
                    <b-icon icon="exclamation-triangle-fill" class="mr-2"></b-icon>
                    {{ dateError }}
                  </b-alert>
                </b-card>
              </b-col>
            </b-row>

            <b-row class="mb-2">
              <b-col>
                <h5 class="mb-2">Filtrar por moneda:</h5>
                <b-form-radio-group
                  id="btn-radios-moneda"
                  v-model="selectedMoneda"
                  :options="optionsMoneda"
                  button-variant="outline-primary"
                  size="sm"
                  name="radio-btn-moneda"
                  @input="applyFilters()"
                  buttons
                ></b-form-radio-group>
              </b-col>
            </b-row>

            <b-row class="mb-4">
              <b-col>
                <h5 class="mb-2">Filtrar por tipo:</h5>
                <b-form-radio-group
                  id="btn-radios-tipo"
                  v-model="selectedTipo"
                  :options="optionsTipo"
                  button-variant="outline-primary"
                  size="sm"
                  name="radio-btn-tipo"
                  @input="applyFilters()"
                  buttons
                ></b-form-radio-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <h5 class="mb-3 text-primary">{{ transacciones.length }} transacciones</h5>
                <b-table
                  striped
                  hover
                  responsive
                  small
                  :items="transacciones"
                  :fields="fields"
                  show-empty
                  empty-text="No hay transacciones registradas para este rango de fechas y filtros."
                >
                  <template #cell(moment)="data">
                    {{ formatDateTimeCustom(data.item.moment) }}
                  </template>

                  <template #cell(monto)="data">
                    {{ formatNumber(data.item.monto) }}
                  </template>

                  <template #cell(moneda)="data">
                    <b-badge variant="light">{{ data.item.moneda }}</b-badge>
                  </template>

                  <template #cell(tipo)="data">
                    <b-badge variant="secondary">{{ data.item.tipo }}</b-badge>
                  </template>

                  <template #cell(detalle)="data">
                    {{ data.item.detalle || '-' }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-overlay>
        </b-container>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import mixinLogin from "~/mixins/mixin-login.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      titulo: "Transacciones de Caja",
      loading: true,
      fechaInicio: "",
      fechaFin: "",
      today: new Date().toISOString().substring(0, 10),
      dateError: null,
      transaccionesTodas: [],
      transacciones: [],
      selectedMoneda: "todos",
      optionsMoneda: [],
      selectedTipo: "todos",
      optionsTipo: [],
      fields: [
        { key: "moment", label: "Fecha", class: "text-center", sortable: true },
        { key: "monto", label: "Monto", class: "text-center", sortable: true },
        { key: "moneda", label: "Moneda", class: "text-center", sortable: true },
        { key: "tipo", label: "Tipo", class: "text-center", sortable: true },
        { key: "detalle", label: "Detalle", class: "text-center" },
        { key: "empleado", label: "Empleado", class: "text-center", sortable: true },
      ],
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser"]),
  },

  methods: {
    generateMonedaOptions() {
      const unicos = new Map();
      this.transaccionesTodas.forEach((t) => {
        if (t.moneda) {
          const key = t.moneda.trim();
          if (!unicos.has(key)) unicos.set(key, key);
        }
      });

      const opciones = [...unicos.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((moneda) => ({ text: moneda, value: moneda }));

      this.optionsMoneda = [{ text: "Todas", value: "todos" }, ...opciones];
    },

    generateTipoOptions() {
      const unicos = new Map();
      this.transaccionesTodas.forEach((t) => {
        if (t.tipo) {
          const key = t.tipo.trim();
          if (!unicos.has(key)) unicos.set(key, key);
        }
      });

      const opciones = [...unicos.values()]
        .sort((a, b) => a.localeCompare(b))
        .map((tipo) => ({ text: tipo, value: tipo }));

      this.optionsTipo = [{ text: "Todos", value: "todos" }, ...opciones];
    },

    applyFilters() {
      let filtered = [...this.transaccionesTodas];

      if (this.selectedMoneda !== "todos") {
        filtered = filtered.filter((t) => t.moneda === this.selectedMoneda);
      }

      if (this.selectedTipo !== "todos") {
        filtered = filtered.filter((t) => t.tipo === this.selectedTipo);
      }

      this.transacciones = filtered;
    },

    async getTransacciones() {
      if (!this.fechaInicio || !this.fechaFin) return;

      if (this.fechaInicio > this.fechaFin) {
        this.dateError = "La fecha de inicio no puede ser posterior a la fecha fin.";
        return;
      }

      this.dateError = null;
      this.loading = true;
      await this.$axios
        .get(
          `${this.$config.API}/reporte-de-caja-transacciones/${this.fechaInicio}/${this.fechaFin}/0`
        )
        .then((res) => {
          this.transaccionesTodas = res.data.data.transacciones || [];
          this.generateMonedaOptions();
          this.generateTipoOptions();
          this.applyFilters();
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },

  mounted() {
    const todayStr = new Date().toISOString().substring(0, 10);
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    this.fechaInicio = hace30Dias.toISOString().substring(0, 10);
    this.fechaFin = todayStr;
    this.getTransacciones();
  },

  mixins: [mixin, mixinLogin],
};
</script>
