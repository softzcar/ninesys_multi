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
              <h1 class="mb-4">Reporte de retiros</h1>
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
                        @input="getRetiros"
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
                        @input="getRetiros"
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

            <b-row>
              <b-col>
                <b-table
                  striped
                  hover
                  responsive
                  :items="report"
                  :fields="fields"
                  show-empty
                  empty-text="No hay retiros registrados para este rango de fechas."
                >
                  <template #cell(monto)="data">
                    {{ formatNumber(data.item.monto) }}
                  </template>

                  <template #cell(moneda)="data">
                    <b-badge variant="light">{{ data.item.moneda }}</b-badge>
                    <small class="text-muted d-block">{{ data.item.metodo_pago }}</small>
                  </template>

                  <template #cell(detalle_retiro)="data">
                    {{ data.item.detalle_retiro }}
                    <br>
                    <small class="text-muted">{{ data.item.empleado }} - {{ data.item.moment }}</small>
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
      titulo: "Reporte de retiros",
      loading: true,
      fechaInicio: "",
      fechaFin: "",
      today: new Date().toISOString().substring(0, 10),
      dateError: null,
      report: [],
      fields: [
        { key: "monto", label: "Monto" },
        { key: "moneda", label: `Moneda` },
        { key: "detalle_retiro", label: "Detalle" },
      ],
    };
  },
  computed: {
    ...mapState("login", ["access", "dataUser"]),
  },

  methods: {
    async getRetiros() {
      if (!this.fechaInicio || !this.fechaFin) return;

      if (this.fechaInicio > this.fechaFin) {
        this.dateError = "La fecha de inicio no puede ser posterior a la fecha fin.";
        return;
      }

      this.dateError = null;
      this.loading = true;
      await this.$axios
        .get(
          `${this.$config.API}/retiros/${this.fechaInicio}/${this.fechaFin}/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.report = res.data.data.retiros;
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
    this.getRetiros();
  },

  mixins: [mixin, mixinLogin],
};
</script>
