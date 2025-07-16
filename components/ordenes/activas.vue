<template>
  <div>
    <loading
      :show="loading.show"
      :text="loading.text"
    />
    <b-container fluid>
      <b-row>
        <b-col>
          <h2>Ordenes en curso</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          offset-lg="8"
          offset-xl="8"
        >
          <b-input-group
            class="mb-4"
            size="sm"
          >
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              placeholder="Filtrar Resultados"
            ></b-form-input>

            <b-input-group-append>
              <b-button
                :disabled="!filter"
                @click="filter = ''"
              >
                Limpiar
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-form
            class="mb-4"
            @submit.prevent="onSubmit"
          >
            <b-row>
              <b-col>
                <h3>Fecha Inicio</h3>
                <b-form-datepicker
                  class="mb-4"
                  v-model="fechaConsultaInicio"
                />
              </b-col>
              <b-col>
                <h3>Fecha Fin</h3>
                <b-form-datepicker
                  class="mb-4"
                  v-model="fechaConsultaFin"
                />
              </b-col>
              <b-col v-if="
                this.$store.state.login.dataUser
                  .departamento === 'Administración'
              ">
                <h3>Vendedor</h3>
                <b-form-select
                  v-model="selectedVendedor"
                  :options="vendedores"
                  @change="applyFilters()"
                />
              </b-col>
            </b-row>

            <b-row>
              <b-col class="text-center">
                <b-button
                  type="submit"
                  variant="primary"
                  class="mr-2"
                >BUSCAR</b-button>
                <b-button
                  type="button"
                  variant="secondary"
                  @click="resetFilters"
                >Limpiar Filtros</b-button>
              </b-col>
            </b-row>
          </b-form>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
          ></b-pagination>

          <p class="mt-3">Página actual: {{ currentPage }}</p>
          <b-table
            :per-page="perPage"
            :current-page="currentPage"
            ref="table"
            responsive
            small
            striped
            hover
            :items="dataTable"
            :fields="fields"
            @filtered="onFiltered"
            :filter="filter"
            :filter-included-fields="includedFields"
          >
            <template #cell(orden)="data">
              <linkSearch :id="data.item.orden" />
            </template>

            <template #cell(fecha_inicio)="data">
              {{ formatDate(data.item.fecha_inicio) }}
            </template>

            <template #cell(fecha_entrega)="data">
              {{ formatDate(data.item.fecha_entrega) }}
            </template>

            <template #cell(id_father)="data">
              {{ data.item.id_father }}, {{ data.item.orden }}
            </template>

            <template #cell(acc)="data">
              <div style="float: left; margin-right: 6px">
                <diseno-view-image
                  :index="data.index"
                  class="floatme mb-2"
                  :id="data.item.orden"
                />
              </div>
              <div style="float: left; margin-right: 6px">
                <ordenes-editar
                  :index="data.index"
                  :key="data.item.orden"
                  :data="data.item"
                />
              </div>
              <div style="float: left; margin-right: 6px">
                <ordenes-abono
                  :index="data.index"
                  :key="data.item.orden"
                  :idorden="data.item.orden"
                  :item="filterPago(data.item.orden)"
                />
              </div>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
      ordenesLength: 0,
      dataTable: [],
      ordenesActivas: [],
      fechaConsultaInicio: "",
      fechaConsultaFin: "",
      fields: [],
      selectedVendedor: 0,
      vendedores: [],
      pagos: [],
      includedFields: ["orden", "cliente_nombre"],
      perPage: 25,
      currentPage: 1,
      filter: null,
      loading: {
        show: true,
        text: "Cargando ordenes activas...",
      },
    };
  },

  methods: {
    ...mapActions("comerce", ["getOrdenesActivas"]),

    resetFilters() {
      this.fechaConsultaInicio = "";
      this.fechaConsultaFin = "";
      this.selectedVendedor = 0;
      this.applyFilters();
    },

    onSubmit(event) {
      event.preventDefault();
      const fechaInicio = this.fechaConsultaInicio;
      const fechaFin = this.fechaConsultaFin;

      if (!fechaInicio || !fechaFin) {
        this.$fire({
          title: "Datos requeridos",
          html: `<p>Por favor seleccione ambas fechas</p>`,
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
      this.applyFilters();
    },

    applyFilters() {
      let filtered = [...this.ordenesActivas];

      // Filter by seller
      if (this.selectedVendedor != 0) {
        filtered = filtered.filter(el => el.id_vendedor == this.selectedVendedor);
      }

      // Filter by date range
      if (this.fechaConsultaInicio && this.fechaConsultaFin) {
        const inicio = new Date(this.fechaConsultaInicio);
        const fin = new Date(this.fechaConsultaFin);
        fin.setHours(23, 59, 59, 999); // Include the whole end day

        filtered = filtered.filter(item => {
          const fechaInicio = new Date(item.fecha_inicio);
          const fechaEntrega = new Date(item.fecha_entrega);
          return (
            (fechaInicio >= inicio && fechaInicio <= fin) ||
            (fechaEntrega >= inicio && fechaEntrega <= fin) ||
            (fechaInicio <= inicio && fechaEntrega >= fin)
          );
        });
      }
      
      this.dataTable = filtered;
    },

    async getOrdenesActivas(id_empleado) {
      await this.$axios
        .get(`${this.$config.API}/table/ordenes-activas/${id_empleado}`)
        .then((res) => {
          this.dataTable = res.data.items;
          this.fields = res.data.fields;
          this.ordenesActivas = res.data.items;
          this.ordenesLength = this.ordenesActivas.length;
        });
    },

    async getPagos() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/reporte-de-pagos`)
        .then((resp) => {
          this.pagos = resp.data.pagos;
          this.vendedores = resp.data.vendedores.map((el) => {
            return {
              value: el._id,
              text: el.nombre,
            };
          });
          this.vendedores.unshift({ value: 0, text: "Todos" });
          this.overlay = false;
        });
    },

    filterPago(idOrden) {
      return this.pagos.filter((el) => el.orden == idOrden);
    },

    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    reloadMe() {
      this.overlay = true;
      this.getOrdenesActivas(this.dataUser.id_empleado).then(() => {
        this.getPagos().then(() => {
          this.loading.show = false;
          this.overlay = false;
        });
      });
    },
  },

  computed: {
    totalRows() {
      return this.dataTable.length;
    },

    misOrdenes() {
      return this.ordenesActivas;
    },
    ...mapState("login", ["dataUser"]),
  },

  mounted() {
    this.reloadMe();
  },

  mixins: [mixin],
};
</script>
