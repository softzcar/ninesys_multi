<template>
  <div>
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <!-- <a href="#" @click="$bvModal.show(modal)"> -->
    <b-button
      variant="info"
      @click="$bvModal.show(modal)"
      size="lg"
    >
      Ver Detalles
    </b-button>

    <b-modal
      :size="size"
      :title="title"
      :id="modal"
      hide-footer
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-container fluid>
          <b-row>
            <b-col>
              <div
                class="floatme"
                style="width: 100%; margin-bottom: 20px"
              >
                <span v-if="showbutton != 'false'">
                  <b-button
                    @click="imprimirReporte"
                    variant="primary"
                  >Imprimir</b-button>
                </span>
                <div
                  v-if="item.pago === '0.00'"
                  class="alert alert-info mt-2"
                >
                  <small>Este empleado ya recibió su salario correspondiente al período actual.</small>
                </div>
              </div>
            </b-col>
          </b-row>
          <b-row class="justify-content-md-center">
            <b-col>
              <b-table
                responsive
                small
                striped
                :items="detalles"
                :fields="fields"
              >
                <template #cell(pago)="data">
                  $ {{ formatNumber(data.item.pago) }}
                </template>

                <template #cell(comsion_vendedor)="data">
                  ${{ data.item.pago }}
                </template>
                <template #cell(id_orden)="data">
                  <linkSearch
                    v-if="data.item.orden || data.item.id_orden"
                    class="floatme"
                    :id="data.item.orden || data.item.id_orden"
                  />
                  <diseno-viewImage
                    v-if="data.item.orden || data.item.id_orden"
                    class="floatme"
                    :id="data.item.orden || data.item.id_orden"
                  />
                  <span v-else class="text-muted small">Sin orden</span>
                </template>
              </b-table>
            </b-col>
          </b-row>

        </b-container>
      </b-overlay>
    </b-modal>

    <!-- Componente para impresión, oculto -->
    <div style="display: none;">
      <ReportePagoVendedor
        :datos-reporte="datosParaElReporte"
        ref="reporteParaImprimir"
      />
    </div>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";
import ReportePagoVendedor from "~/components/reportes/ReportePagoVendedor.vue";

export default {
  mixins: [mixin],
  components: {
    ReportePagoVendedor,
  },
  data() {
    return {
      size: "xl",
  data() {
    return {
      size: "xl",
      title: `${this.tipoEmpleado}: ${this.item.nombre}`,
      overlay: false,
// ... (rest of data)
    };
  },
// ...
  props: {
    item: {},
    detalles: {},
    products: {},
    reload: {},
    showbutton: {},
    tipoEmpleado: {
      type: String,
      default: 'Vendedor'
    }
  },
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
