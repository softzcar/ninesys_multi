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
        <b-col class="mb-4 mt-4">
            <h5 class="mb-2">Filtrar por estado de pago:</h5>
            <b-form-radio-group id="btn-radios-2" v-model="selectedRadio" :options="optionsRadio"
                button-variant="outline-primary" size="lg" name="radio-btn-outline" @input="applyFilters()"
                buttons></b-form-radio-group>
            
            <h5 class="mt-4 mb-2">Filtrar por categoría de producto:</h5>
            <b-form-radio-group id="btn-radios-categories" v-model="selectedCategory" :options="optionsCategories"
                button-variant="outline-primary" size="lg" name="radio-btn-categories" @input="applyFilters()"
                buttons></b-form-radio-group>
        </b-col>
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
              <b-col class="col-12 col-md-4">
                <h3>Fecha Inicio</h3>
                <b-form-datepicker
                  class="mb-4"
                  v-model="fechaConsultaInicio"
                />
              </b-col>
              <b-col class="col-12 col-md-4">
                <h3>Fecha Fin</h3>
                <b-form-datepicker
                  class="mb-4"
                  v-model="fechaConsultaFin"
                />
              </b-col>
              <b-col class="col-12 col-md-4 mb-4 pb-4" v-if="
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
              <b-col class="text-center mt-4">
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
          <h3 class="mb-3 text-primary">{{ filterName }} {{ totalRows }} Ordenes</h3>
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
              <linkSearch :id="data.item.orden" :key="data.item.orden" />
            </template>

            <template #cell(fecha_inicio)="data">
              {{ formatDate(data.item.fecha_inicio) }}
            </template>

            <template #cell(fecha_entrega)="data">
              {{ formatDate(data.item.fecha_entrega) }}
            </template>

            <template #cell(id_father)="data">
              <ordenes-vinculadas-v2 :key="data.item.orden" :id_orden="data.item.orden" />
            </template>

            <template #cell(acc)="data">
              <div class="acciones-container">
                <div class="botones-superior">
                  <div class="btn-acciones">
                    <diseno-view-image
                      :index="data.index"
                      class="floatme mb-2"
                      :id="data.item.orden"
                    />
                  </div>
                  <div class="btn-acciones">
                    <ordenes-editar
                      :index="data.index"
                      :key="data.item.orden"
                      :data="data.item"
                      @updated="reloadMe"
                    />
                  </div>
                  <div class="btn-acciones d-lg-none text-left">
                    <ordenes-abono
                      :index="data.index"
                      :key="data.item.orden"
                      :idorden="data.item.orden"
                      :item="filterPago(data.item.orden)"
                      :sobrePago="data.item.payment_status === 'sobrepagada' ? data.item.monto_pendiente * -1 : 0"
                      @reload="reloadMe()"
                    />
                  </div>
                </div>
                <div class="abono-inferior d-lg-block">
                  <ordenes-abono
                    :index="data.index"
                    :key="data.item.orden"
                    :idorden="data.item.orden"
                    :item="filterPago(data.item.orden)"
                    :sobrePago="data.item.payment_status === 'sobrepagada' ? data.item.monto_pendiente * -1 : 0"
                    @reload="reloadMe()"
                  />
                </div>
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
      selectedRadio: "todas",
      optionsRadio: [
          { text: "Todas", value: "todas" },
          { text: "Pagadas", value: "pagadas" },
          { text: "Pendientes", value: "pendientes" },
          { text: "Sobrepagadas", value: "sobrepagada" },
      ],
      selectedCategory: "todas",
      optionsCategories: [],
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
      this.selectedRadio = "todas";
      this.selectedCategory = "todas";
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

    generateCategoryOptions() {
      if (!this.ordenesActivas || this.ordenesActivas.length === 0) {
        this.optionsCategories = [];
        return;
      }

      const uniqueCategories = new Map();
      this.ordenesActivas.forEach(order => {
        if (order.product_categories && Array.isArray(order.product_categories)) {
          order.product_categories.forEach(cat => {
            if (cat.category_name) {
              const trimmedCat = cat.category_name.trim();
              const lowerCaseCat = trimmedCat.toLowerCase();
              if (trimmedCat && !uniqueCategories.has(lowerCaseCat)) {
                uniqueCategories.set(lowerCaseCat, trimmedCat); // Use original casing for display
              }
            }
          });
        }
      });

      const categoryOptions = [...uniqueCategories.values()].map(originalCat => ({
        text: originalCat,
        value: originalCat,
      }));

      // Sort categories alphabetically for better UX
      categoryOptions.sort((a, b) => a.text.localeCompare(b.text));

      this.optionsCategories = [
        { text: "Todas", value: "todas" },
        ...categoryOptions,
      ];
    },

    applyFilters() {
      let filtered = [...this.ordenesConEstadoDePago]; // Start from the computed property

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
      
      // Filter by payment status
      if (this.selectedRadio === "pagadas") {
          filtered = filtered.filter(el => el.payment_status === 'pagada');
      } else if (this.selectedRadio === "pendientes") {
          filtered = filtered.filter(el => el.payment_status === 'pendiente');
      } else if (this.selectedRadio === "sobrepagada") {
          filtered = filtered.filter(el => el.payment_status === 'sobrepagada');
      }

      // Filter by category
      if (this.selectedCategory !== "todas") {
        filtered = filtered.filter(order => 
            order.product_categories && order.product_categories.some(cat => cat.category_name === this.selectedCategory)
        );
      }

      this.dataTable = filtered;
    },

    async getOrdenesActivas(id_empleado) {
      await this.$axios
        .get(`${this.$config.API}/table/ordenes-activas/${id_empleado}`)
        .then((res) => {
          this.fields = res.data.fields;
          // Añadir la columna 'Estatus'
          this.fields.push({ key: 'estatus', label: 'Estatus', sortable: true });
          this.ordenesActivas = res.data.items;
          this.ordenesLength = this.ordenesActivas.length;
          this.generateCategoryOptions();
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
      Promise.all([
        this.getOrdenesActivas(this.dataUser.id_empleado),
        this.getPagos()
      ]).then(() => {
        this.applyFilters(); // Call applyFilters after both data sources are loaded
        this.loading.show = false;
        this.overlay = false;
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
    ordenesLength() {
      return this.ordenesActivas.length;
    },
    filterName() {
      const option = this.optionsRadio.find(opt => opt.value === this.selectedRadio);
      return option ? option.text : 'Todas';
    },
    ordenesConEstadoDePago() {
        if (!this.ordenesActivas.length || !this.pagos.length) return [];
        
        return this.ordenesActivas.map(orden => {
            const pagosDeOrden = this.pagos.filter(p => p.orden == orden.orden);
            const totalAbonado = pagosDeOrden.reduce((acc, pago) => {
                const monto = parseFloat(pago.monto) || 0;
                const tasa = parseFloat(pago.tasa) || 1;
                return acc + (monto / tasa);
            }, 0);
            
            const totalOrden = parseFloat(orden.total) || 0;
            const totalDescuento = parseFloat(orden.descuento_total) || 0;
            const montoPendiente = totalOrden - totalAbonado - totalDescuento;

            let payment_status = 'pendiente';
            const epsilon = 0.1; // Tolerance for floating point errors

            if (Math.abs(montoPendiente) < epsilon) {
                payment_status = 'pagada';
            } else if (montoPendiente < -epsilon) {
                payment_status = 'sobrepagada';
            }

            return {
                ...orden,
                acc: orden.orden,
                monto_pendiente: montoPendiente,
                payment_status: payment_status
            };
        });
    },
    ...mapState("login", ["dataUser"]),
  },

  mounted() {
    this.reloadMe();
  },

  mixins: [mixin],
};
</script>

<style scoped>
@media (min-width: 992px) {
  .acciones-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  .botones-superior {
    display: flex;
    flex-direction: row;
  }
  .abono-inferior {
    margin-left: 20px;
  }
}
@media (max-width: 991px) {
  .acciones-container {
    display: flex;
    flex-direction: column;
  }
  .botones-superior {
    display: flex;
    justify-content: flex-start;
  }
  .abono-inferior {
    margin-top: 16px;
  }
  .btn-acciones {
    float: none !important;
    margin-right: 6px;
    margin-bottom: 4px;
  }
}
</style>
