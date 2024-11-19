<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-button @click="$bvModal.show(modal)" variant="primary"
        >Detalles</b-button
      >
      <b-modal :id="modal" :title="title" hide-footer size="xl">
        <b-row>
          <b-col>
            <h2>{{ data_empleado[0].nombre }}</h2>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-table striped :fields="fields" :items="data_empleado"></b-table>
          </b-col>
        </b-row>
        <pre>
            {{ data_empleado }}
        </pre>
      </b-modal>
    </b-overlay>
  </div>
</template>

<script>
export default {
  name: 'NinesysAsistenciasReporteDetalles',

  data() {
    return {
      overlay: false,
      fields: [
        {
          key: 'fecha',
          label: 'Fecha',
        },
        {
          key: 'hora',
          label: 'Hora',
        },
        {
          key: 'registro',
          label: 'Registro',
        },
      ],
    }
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7)
      return `modal-${rand}`
    },
  },

  methods: {
    gogo() {
      alert(JSON.stringify(this.$props))
    },
  },

  props: ['data_empleado'],
}
</script>
