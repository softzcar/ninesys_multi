<template>
  <b-overlay :show="loading" spinner-small rounded="sm">
    <div v-if="datos && datos.productos && datos.productos.length > 0">
      <!-- INFO DEL DEPARTAMENTO Y PORCENTAJE (COMUN A AMBOS MODOS) -->
      <b-alert show variant="light" class="mb-3 py-2">
        <div class="d-flex align-items-center">
          <b-icon icon="person-check-fill" variant="info" class="mr-2"></b-icon>
          <div>
            <span class="small font-weight-bold text-uppercase d-block text-info">Departamento:</span>
            <span class="font-weight-bold text-dark">{{ datos.departamento }}</span>
          </div>
          <div class="ml-auto text-right">
            <span class="small text-muted d-block">Porcentaje asignado</span>
            <b-badge variant="info" pill style="font-size: 1rem;">
              {{ datos.productos[0].porcentaje_asignado }}%
            </b-badge>
          </div>
        </div>
      </b-alert>

      <b-list-group>
        <b-list-group-item v-for="(prod, index) in datos.productos" :key="index"
          class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-0">{{ prod.nombre }}</h6>
            <small class="text-muted">
              Talla: <strong>{{ prod.talla || 'N/A' }}</strong>
              &nbsp;|&nbsp; Corte: <strong>{{ prod.corte || 'N/A' }}</strong>
            </small>
            <!-- Nota de excedente para Corte -->
            <div v-if="prod.excedente > 0" class="mt-1">
              <b-badge variant="warning" class="mr-1">
                <b-icon icon="plus-circle-fill"></b-icon>
                Excedentes detectados: {{ prod.excedente }}
              </b-badge>
              <small class="text-muted">(base {{ prod.cantidad_base }} + exc. {{ prod.excedente }})</small>
            </div>
          </div>
          <b-badge variant="dark" pill style="font-size: 1rem; min-width: 3rem; text-align: center;">
            {{ prod.cantidad_asignada }} pzs
          </b-badge>
        </b-list-group-item>
      </b-list-group>

      <!-- Total -->
      <div class="mt-3 text-right pr-2 mb-3">
        <strong>Total a producir: </strong>
        <b-badge variant="dark" style="font-size: 1.1rem;">
          {{ totalPiezas }} pzs
        </b-badge>
      </div>

    </div>
    <div v-else-if="!loading" class="text-center py-4">
      <b-icon icon="info-circle" variant="info" font-scale="1.5" class="mb-2"></b-icon>
      <p class="text-muted small">Sin datos de asignación.</p>
    </div>
  </b-overlay>
</template>

<script>
export default {
  name: "MiAsignacionContenido",
  props: ["datos", "loading", "totalPiezas"]
};
</script>
