<template>
  <div>
    <loading :show="loading.show" :text="loading.text" />
    <b-container fluid>
      <b-row>
        <b-col>
          <h2>Ordenes en curso</h2>
          <!-- <pre>
            {{ dataUser.id_empleado }}
          </pre> -->
        </b-col>
      </b-row>
      <!-- EL BUSCADOR INTERCAMBIA LA COLUMNA DE ACCIONES ↓ -->
      <b-row>
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
          <b-table
            :per-page="perPage"
            :current-page="currentPage"
            ref="table"
            responsive
            small
            striped
            hover
            :items="ordenesActivas.items"
            :fields="ordenesActivas.fields"
            @filtered="onFiltered"
            :filter="filter"
            :filter-included-fields="includedFields"
          >
            <template #cell(orden)="data">
              <!-- <linkSearch :key="data.index" :index="data.index" :id="data.item.orden" /> -->
              <linkSearch :id="data.item.orden" />
            </template>

            <template #cell(fecha_inicio)="data">
              {{ formatDate(data.item.fecha_inicio) }}
            </template>

            <template #cell(fecha_entrega)="data">
              {{ formatDate(data.item.fecha_entrega) }}
            </template>

            <template #cell(id_father)="data">
              <ordenes-vinculadas
                :key="data.item.orden"
                :id_orden="data.item.id_father"
              />
            </template>

            <template #cell(acc)="data">
              <!-- <div style="float: left; margin-right: 6px">
                <comercio-editarProductos @reload="loadOrders()" :item="data.item" />
              </div> -->
              <div style="float: left; margin-right: 6px; margin-top: 6px">
                <span v-html="whatsAppMe(data.item.phone, true)"></span>
              </div>
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
                />
              </div>
            </template>
          </b-table>
          <!-- <pre>
            {{ ordenesActivas.items }}
          </pre> -->
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import { mapState, mapActions, mapGetters } from "vuex";
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
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
    loadOrders() {
      this.overlay = true;
      this.getOrdenesActivas(this.dataUser.id_empleado).then(
        () => (this.loading.show = false)
      );
    },

    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },

  computed: {
    totalRows() {
      return this.ordenesLength;
    },
    misOrdenes() {
      return this.ordenesActivas;
    },
    ...mapState("comerce", ["ordenesActivas", "ordenesLength", "hola"]),
    ...mapGetters("comerce", ["dynOrdenesActivas"]),
    ...mapState("login", ["dataUser"]),
  },

  mounted() {
    this.getOrdenesActivas(this.dataUser.id_empleado).then(
      () => (this.loading.show = false)
    );
    // this.loadOrders()
  },

  mixins: [mixin],
};
</script>
