<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-table
        responsive
        :fields="fields"
        :items="items"
      >
        <template #cell(prioridad)="data">
          <produccion-check-prioridad
            :key="data.item.orden + '-prioridad'"
            :id="data.item.orden"
            :prioridad="data.item.prioridad"
          />
        </template>
        <template #cell(orden)="data">
          <link-search :key="data.item.orden + '-link'" :id="data.item.orden" />
        </template>

        <template #cell(inicio)="data">
          {{ formatDate(data.item.inicio) }}
        </template>

        <template #cell(entrega)="data">
          {{ formatDate(data.item.entrega) }}
        </template>

        <template #cell(paso)="data">
          <span class="floatme">
            <produccion-progress-bar :key="data.item.orden + '-progress'" :item="data.item" />
          </span>
        </template>

        <template #cell(detalles)="data">
          <produccion-control-de-produccion-detalles
            :key="data.item.orden + '-detalles'"
            :idorden="data.item.orden"
            :detalles="data.item.detalles"
          />
        </template>

        <template #cell(vinculada)="data">
          <span class="floatme">
            <ordenes-vinculadas-v2 :key="data.item.acciones + '-vinculada'" :id_orden="data.item.acciones" />
          </span>
        </template>

        <template #cell(acciones)="data">
          <span class="floatme">
            <ordenes-editar :key="data.item.orden + '-editar'" :data="data.item" />
          </span>
          <span class="floatme">
            <diseno-view-image :key="data.item.acciones + '-image'" :id="data.item.acciones" />
          </span>

          <span class="floatme">
            <produccion-terminar :key="data.item.acciones + '-terminar'" :id="data.item.acciones" />
          </span>
          <!-- <div class="float-me">
            <produccion-asignar :reload="reloadMe" :id="data.item.orden" />
          </div> -->
          <!-- <div class="float-me">
            {{ reloadMe }}
            <inventario-asignacion :id="data.item.acciones" />
          </div> -->
        </template>
      </b-table>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
import mixin from "~/mixins/mixins.js";

export default {
  data() {
    return {
      overlay: true,
      fields: [],
      items: [],
      reloadMe: false,
    };
  },

  methods: {
    loadOrdersProduction() {
      axios
        .get(`${this.$config.API}/lotes/en-proceso`)
        .then((res) => {
          this.fields = res.data.fields;
          this.items = res.data.items;
          this.overlay = false;
        })
        .catch((err) => {
          this.$fire({
            type: "error",
            title: "Error",
            html: `No se pudo obtener los datos de la tabla:  ${err}`,
          });
        });
    },
  },

  computed: {
    /* itemsNoDesign() {
      const filtered = this.items.filter(el => )
    }, */
  },

  mounted() {
    this.loadOrdersProduction();
  },

  mixins: [mixin],
};
</script>

<style scoped>
.float-me {
  float: left;
  margin-right: 4px;
  margin-top: 4px;
}
</style>
