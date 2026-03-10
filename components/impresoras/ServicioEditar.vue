<template>
  <b-modal id="modal-servicio-editar" title="Editar Registro de Servicio Técnico" hide-footer @show="initForm">
    <b-form v-if="form" @submit.prevent="update">
      <b-form-group label="Máquina">
        <b-form-input :value="servicio ? servicio.maquina_nombre : ''" readonly />
      </b-form-group>

      <b-form-group label="Tipo de Servicio">
        <b-form-select v-model="form.tipo_servicio" :options="tipos" required />
      </b-form-group>

      <b-form-group label="Descripción">
        <b-form-textarea v-model="form.descripcion" placeholder="Detalle lo realizado..." rows="3" />
      </b-form-group>

      <b-form-group label="Técnico">
        <b-form-input v-model="form.tecnico" placeholder="Nombre o empresa" />
      </b-form-group>

      <b-row>
        <b-col>
          <b-form-group label="Costo ($)">
            <b-form-input v-model="form.costo" type="number" step="0.01" />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="Fecha">
            <b-form-input v-model="form.fecha_servicio" type="date" />
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group label="Próximo Mantenimiento (Opcional)">
        <b-form-input v-model="form.proxima_fecha" type="date" />
      </b-form-group>

      <b-form-group label="Estado">
        <b-form-select v-model="form.estado" :options="estados" required />
      </b-form-group>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <b-button variant="secondary" @click="$bvModal.hide('modal-servicio-editar')">Cancelar</b-button>
        <b-button variant="primary" type="submit" :disabled="loading">Guardar Cambios</b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  props: ['servicio'],
  data() {
    return {
      loading: false,
      tipos: [
        { text: 'Mantenimiento Preventivo', value: 'Mantenimiento Preventivo' },
        { text: 'Mantenimiento Correctivo', value: 'Mantenimiento Correctivo' },
        { text: 'Reparación', value: 'Reparación' },
        { text: 'Instalación / Configuración', value: 'Instalación' },
        { text: 'Otro', value: 'Otro' }
      ],
      estados: [
        { text: 'Completado', value: 'completado' },
        { text: 'Pendiente', value: 'pendiente' }
      ],
      form: null
    };
  },
  methods: {
    initForm() {
      if (this.servicio) {
        this.form = {
          tipo_servicio: this.servicio.tipo_servicio,
          descripcion: this.servicio.descripcion,
          tecnico: this.servicio.tecnico,
          costo: this.servicio.costo,
          fecha_servicio: this.servicio.fecha_servicio ? this.servicio.fecha_servicio.split(' ')[0] : '',
          proxima_fecha: this.servicio.proxima_fecha ? this.servicio.proxima_fecha.split(' ')[0] : null,
          estado: this.servicio.estado
        };
      }
    },
    async update() {
      this.loading = true;
      try {
        await this.$axios.put(`${this.$config.API}/servicios-maquinas/${this.servicio._id}`, this.form);
        this.$fire({
          title: "Éxito",
          text: "Registro actualizado",
          type: "success"
        });
        this.$emit('reload');
        this.$bvModal.hide('modal-servicio-editar');
      } catch (e) {
        this.$fire({
          title: "Error",
          text: "Error al actualizar",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
