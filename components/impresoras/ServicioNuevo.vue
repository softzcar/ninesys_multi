<template>
  <b-modal id="modal-servicio-nuevo" title="Registrar Nuevo Servicio Técnico" hide-footer>
    <b-form @submit.prevent="save">
      <b-form-group label="Máquina">
        <b-form-select v-model="form.id_maquina" required>
          <option value="">Seleccione una impresora...</option>
          <option v-for="imp in impresoras" :key="imp._id" :value="imp._id">
            {{ imp.codigo_interno }}
          </option>
        </b-form-select>
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

      <div class="d-flex justify-content-end gap-2 mt-3">
        <b-button variant="secondary" @click="$bvModal.hide('modal-servicio-nuevo')">Cancelar</b-button>
        <b-button variant="primary" type="submit" :disabled="loading">Guardar Registro</b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      impresoras: [],
      tipos: [
        { text: 'Mantenimiento Preventivo', value: 'Mantenimiento Preventivo' },
        { text: 'Mantenimiento Correctivo', value: 'Mantenimiento Correctivo' },
        { text: 'Reparación', value: 'Reparación' },
        { text: 'Instalación / Configuración', value: 'Instalación' },
        { text: 'Otro', value: 'Otro' }
      ],
      form: {
        id_maquina: '',
        maquina_tipo: 'impresora',
        tipo_servicio: 'Mantenimiento Preventivo',
        descripcion: '',
        tecnico: '',
        costo: 0,
        fecha_servicio: new Date().toISOString().split('T')[0],
        proxima_fecha: null,
        estado: 'completado'
      }
    };
  },
  mounted() {
    this.getImpresoras();
  },
  methods: {
    async getImpresoras() {
      try {
        const res = await this.$axios.get(`${this.$config.API}/impresoras`);
        this.impresoras = res.data;
      } catch (e) {
        console.error(e);
      }
    },
    async save() {
      this.loading = true;
      try {
        await this.$axios.post(`${this.$config.API}/servicios-maquinas`, this.form);
        this.$fire({
          title: "Éxito",
          text: "Servicio registrado correctamente",
          type: "success"
        });
        this.$emit('reload');
        this.$bvModal.hide('modal-servicio-nuevo');
        this.resetForm();
      } catch (e) {
        this.$fire({
          title: "Error",
          text: "Error al registrar servicio",
          type: "error"
        });
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        id_maquina: '',
        maquina_tipo: 'impresora',
        tipo_servicio: 'Mantenimiento Preventivo',
        descripcion: '',
        tecnico: '',
        costo: 0,
        fecha_servicio: new Date().toISOString().split('T')[0],
        proxima_fecha: null,
        estado: 'completado'
      };
    }
  }
};
</script>
