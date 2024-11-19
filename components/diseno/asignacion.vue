<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <b-table
        ref="table"
        responsive
        small
        striped
        hover
        :items="datax"
        :fields="fields"
      >
        <template #cell(id)="data">
          <linkSearch :id="data.item.id" />
        </template>

        <template #cell(check)="data">
          <div class="text-center">
            <p v-if="data.item.check != null" class="h1 mt-2">
              <b-icon icon="exclamation-circle-fill" variant="success"></b-icon>
            </p>

            <p v-else class="h1 mt-2">
              <b-icon
                icon="exclamation-circle-fill"
                style="color: lightgray"
              ></b-icon>
            </p>
          </div>
        </template>

        <template #cell(imagen)="data">
          <diseno-viewImage :id="data.item.id" />
        </template>

        <template #cell(empleado)="data">
          <diseno-reasignacionSelect
            :idorden="data.item.id"
            :idempleado="data.item.empleado"
            :options="optionsSelect"
          />
        </template>

        <template #cell(vinculadas)="data">
          <ordenes-vinculadas :id_orden="data.item.vinculadas" />
        </template>
      </b-table>
    </b-overlay>
  </div>
</template>

<script>
// import axios from 'axios'
// import mixin from '~/mixins/mixins.js'

export default {
  data() {
    return {
      overlay: true,
      empSelected: [],
      optionsSelect: [],
      size: 'md',
      title: `Abonos a la orden ${this.idorden}`,
      datax: [],
      fields: [
        {
          key: 'id',
          label: 'Orden',
        },
        {
          key: 'check',
          label: 'Aprobado por el cliente',
          thClass: 'text-center', // Aplicar clase al encabezado (th)
          tdClass: 'text-center', // Aplicar clase a las celdas (td)
          trClass: 'text-center', // Esto es opcional si quieres centrar las filas
        },
        {
          key: 'tipo',
          label: 'Tipo',
        },
        {
          key: 'empleado',
          label: 'Empleado',
        },
        {
          key: 'vinculadas',
          label: 'Vinculadas',
        },
        {
          key: 'imagen',
          label: 'Diseño',
        },
      ],
    }
  },

  computed: {
    dataTable() {
      return this.$store.state.disenos.disenos
    },

    empleados() {
      return this.$store.state.disenos.empleados
    },
  },

  methods: {
    terminado(val) {
      let res
      if (val === '0') {
        res = 'No'
      } else {
        res = 'Si'
      }
      return res
    },
  },

  mounted() {
    this.$store.dispatch('disenos/getDisenos').then(() => {
      let tmpOptions = this.empleados
        .filter(
          (el) =>
            el.departamento === 'Diseño' || el.departamento === 'Jefe de diseño'
        )
        .map((el) => {
          return {
            value: el._id,
            text: el.username,
          }
        })
      this.optionsSelect = tmpOptions.concat({ value: 0, text: 'Sin asignar' })
      this.overlay = false

      if (parseInt(this.$store.state.login.dataUser.accesso) > 0) {
        this.datax = this.dataTable.items.filter(
          (item) =>
            item.responsable === this.$store.state.login.dataUser.id_empleado
        )
      } else {
        this.datax = this.dataTable.items
      }
    })
  },
}
</script>
