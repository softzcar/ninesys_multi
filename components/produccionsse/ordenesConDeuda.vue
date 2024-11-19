<template>
  <div>
    <loading :show="loading.show" :text="loading.text" />
    <b-container fluid>
      <b-row>
        <!-- <pre>{{ ordenes }}</pre> -->
        <b-col offset-lg="8" offset-xl="8">
          <b-input-group class="mb-4" size="sm">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              placeholder="Filtrar Resultados"
            ></b-form-input>

            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">
                Limpiar
              </b-button>
            </b-input-group-append>
          </b-input-group>
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
          <!-- <b-pagination-nav :link-gen="linkGen" :number-of-pages="10" use-router></b-pagination-nav> -->

          <b-table
            :items="ordenes"
            :per-page="perPage"
            :current-page="currentPage"
            @filtered="onFiltered"
            :fields="fields"
            :filter="filter"
            :filter-included-fields="includedFields"
          >
            <template #cell(orden)="data">
              <linkSearch :id="data.item.orden" key="data.item.orden" />
            </template>
            <template #cell(acc)="data">
              <div style="float: left; margin-right: 6px">
                <diseno-view-image class="floatme mb-2" :id="data.item.orden" />
              </div>
              <div style="float: left; margin-right: 6px">
                <pre>
                {{ data.item.orden }}
                </pre>
                <ordenes-editar :data="data.item" :key="data.item.orden" />
              </div>
              <div style="float: left; margin-right: 6px">
                <ordenes-abono
                  :idorden="data.item.orden"
                  :key="data.item.orden"
                />
              </div>
            </template>
          </b-table>
          <p class="mt-3">Página actual: {{ currentPage }}</p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
      includedFields: ["orden", "cliente"],
      perPage: 25,
      currentPage: 1,
      ordenesLength: 0,
      ordenes: null,
      fields: null,
      filter: null,
      loading: {
        show: true,
        text: "Cargando ordenes...",
      },

      fields: [
        {
          key: "name",
          label: "Person full name",
          sortable: true,
          sortDirection: "desc",
        },

        {
          key: "age",
          label: "Person age",
          sortable: true,
          class: "text-center",
        },

        {
          key: "isActive",
          label: "Is Active",
          formatter: (value, key, item) => {
            return value ? "Yes" : "No";
          },
          sortable: true,
          sortByFormatted: true,
          filterByFormatted: true,
        },
        { key: "actions", label: "Actions" },
      ],
    };
  },

  methods: {
    async getOrdenes() {
      await axios
        .get(`${this.$config.API}/table/ordenes-con-deuda`)
        .then((res) => {
          this.ordenes = res.data.items.map((obj) => ({
            ...obj,
            acc: obj.orden,
          }));
          this.ordenesLength = this.ordenes.length;

          this.fields = res.data.fields;
        });
    },
    loadOrders() {
      this.overlay = true;
      this.getOrdenes().then(() => (this.loading.show = false));
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },

  computed: {
    totalRows() {
      return parseInt(this.ordenesLength) + 1;
    },

    misOrdenes() {
      return this.ordenes;
    },
  },

  beforeMount() {
    this.getOrdenes().then(() => (this.loading.show = false));
    // this.loadOrders()
  },

  mixins: [mixin],
};
</script>
