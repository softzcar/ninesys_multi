<template>
  <div>
    <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
      <b-icon icon="box-seam"></b-icon>
    </b-button>
    <b-modal
    @shown="verificarDatos"
    :size="size"
    :title="title"
    :id="modal"
    hide-footer
    >
    <b-overlay :show="overlay" spinner-small>
      <p class="my-4">
          <!-- <pre>
            EMP: {{ empleado }}
            <hr />
            PROPS: {{ $props }}
          </pre> -->
          <b-list-group>
            <b-list-group-item
            ><strong>Producto:</strong> {{ datos.name }}</b-list-group-item
            >
            <b-list-group-item
            ><strong>Tela:</strong> {{ datos.tela }}</b-list-group-item
            >
            <b-list-group-item
            ><strong>Talla:</strong> {{ datos.talla }}</b-list-group-item
            >
            <b-list-group-item
            ><strong>Corte:</strong> {{ datos.corte }}</b-list-group-item
            >
            <b-list-group-item
            ><strong>Solicitadas:</strong>
            {{ datos.cantidad }}</b-list-group-item
            >
            <b-list-group-item
            ><strong>Piezas en lote:</strong>
            {{ datos.cantidad_lote }}</b-list-group-item
            >
          </b-list-group>
        </p>

        <p>
          <b-form-select
          class="mb-4 pb-4"
          v-model="selected"
          :options="options"
          @change="guardarInsumoEmpleado"
          ></b-form-select>
          <!-- <b-form-input type="number"></b-form-input> -->
        </p>

        <p>
          <b-table small :items="dataTable" :fields="fields">
            <template #cell(cantidad)="data">
              <inventario-insumo-asignar-input
              :cantidad="data.item.cantidad"
              :item="data.item"
              :empleado="empleado"
              />
              <!-- <b-form-input
                type="number"
                :value="data.item.cantidad"
                @change="saveCantidad(data.item.cantidad)"
                ></b-form-input> -->
              </template>
              <template #cell(_id)="data">
                <b-button variant="danger" @click="filterData(data.item._id)">
                  <b-icon-trash></b-icon-trash>
                </b-button>
                <!-- <inventario-InsumoMovimientos :item="data.item" :datos="datos" /> -->
              </template>
            </b-table>
          </p>
        </b-overlay>
      </b-modal>
    </div>
  </template>

  <script>
  import axios from 'axios'  

  export default {
    data() {
      return {
        inputCantidad: 0.0,
        size: 'lg',
        title: 'Asiganción de insumos',
        overlay: true,
        key: 1,
        dataTable: [],
        selectInsumo: [],
        movimientos: [],
        selected: '',
        itemSelect: [
        {
          _id: '',
          insumo: '',
          unidad: '',
          cantidad: '',
          departamento: '',
        },
        ],
        fields: [
        {
          key: 'insumo',
          label: 'INSUMO',
        },
        {
          key: 'unidad',
          label: 'UNIDAD',
        },
        {
          key: 'cantidad',
          label: 'CANTIDAD',
        },
        {
          key: '_id',
          label: 'ACCIONES',
        },
        ],
      }
    },

    computed: {
      modal: function () {
        const rand = Math.random().toString(36).substring(2, 7)
        return `modal-${rand}`
      },

      items() {
        let items = this.itemSelect.map((item) => {
          let tmp = {
            insumo: item.insumo,
            unidad: item.unidad,
            cantidad: item.cantidad,
            eliminar: item._id,
          }
        })
        return (
                items || [
                {
                  _id: 22,
                  insumo: '',
                  unidad: '',
                  cantidad: '',
                  departamento: '',
                },
                ]
                )
      },

      options() {
        let items = this.selectInsumo.map(function (insumo) {
          return {
            value: insumo._id,
            text: insumo.insumo,
          }
        })
        return items
      },
    },

    methods: {
      saveCantidad(val) {
        let tmp = { val: val }
        console.log('valor en un objeto', tmp)
        return val
      },
    // OK
      verificarDatos() {
        if (!this.empleado) {
          this.$fire({
            type: 'error',
            title: 'Dato requerido',
            html: 'No ha seleccionado un empleado',
          }).then(() => this.$bvModal.hide(this.modal))
        } else {
          this.getInsumos().then(() => (this.overlay = false))
        }
      },
    // OK
      async getInsumos() {
        await axios
        .get(`${this.$config.API}/inventario/todos`)
        .then((resp) => {
          this.selectInsumo = resp.data.items
        })
        .then(() => {
          axios
          .get(
               `${this.$config.API}/inventario-movimientos/${this.datos.id_orden}/${this.empleado}`
               )
          .then((resp) => {
            this.dataTable = resp.data.movimientos
          })
        })
      },

    // OBTENER MOVIMIENTOS DEL INSUMO PARA ESTA ORDEN
      async getMovimientos() {
        await axios
        .get(`${this.$config.API}/inventario/historial/${this.datos.id_orden}`)
        .then((resp) => {
          this.movimientos = resp.data.items
        })
        .then(() => {
          axios
          .get(
               `${this.$config.API}/inventario-movimientos/${this.datos.id_orden}/${this.empleado}`
               )
          .then((resp) => {
            this.dataTable = resp.data.movimientos
          })
        })
      },

    // OK
      async filterData(id_insumo) {
        console.log('id indumo a eliminar', id_insumo)
        console.log()
        let tmp = this.dataTable.filter((item) => item._id != id_insumo)
        this.dataTable = tmp

        this.overlay = true

        const data = new URLSearchParams()
        data.set('id', id_insumo)

        await axios
        .post(`${this.$config.API}/inventario-movimientos/eliminar`, data)
        .then((res) => {
          this.overlay = false
        })
      },
      async guardarInsumoEmpleado() {
        this.overlay = true

        const data = new URLSearchParams()
        data.set('id_orden', this.datos.id_orden)
        data.set('id_empleado', this.empleado)
        data.set('id_producto', this.datos.id_woo)
        data.set('id_insumo', this.selected)
        data.set('departamento', this.departamento)

        await axios
        .post(`${this.$config.API}/inventario-movimientos/nuevo`, data)
        .then((res) => {
          // this.resetForm()
          // this.$bvModal.hide(this.modal)
        })
        .then(() => this.getInfo().then(() => (this.overlay = false)))
      },

    // TODO Esta funcion va par Produccion
    /*  async guardarInsumoEmpleado() {
      this.overlay = true

      const data = new URLSearchParams()
      data.set('id_orden', this.datos.id_orden)
      data.set('id_empleado', this.empleado)
      data.set('id_producto', this.datos.id_woo)
      data.set('id_insumo', this.selected)
      data.set('departamento', this.departamento)

      await axios
        .post(`${this.$config.API}/inventario-movimientos/nuevo`, data)
        .then((res) => {
          // this.resetForm()
          // this.$bvModal.hide(this.modal)
        })
        .then(() => this.getInfo().then(() => (this.overlay = false)))
    }, */

      async updateInsumo(id_insumo) {
        this.overlay = true

        this.getInsumoDetalles(id_insumo).then(() => {
        // this.$refs.table.refresh()
          this.overlay = false
        })
      },

    // OK Obtener información del insumo al seleccionarlo
      async getInfo() {
        await axios
        .get(`${this.$config.API}/insumos/${this.selected}`)
        .then((resp) => {
          this.dataTable.push(resp.data.items[0])
          // console.log('respuesta del insumo solicitado', resp.data)
          return resp.data
        })
      },
    /* *** */
      async getInsumoDetalles(id_insumo) {
        await axios
        .get(`${this.$config.API}/insumos/${id_insumo}`)
        .then((resp) => {
          this.itemSelect.push(resp.data)
          return resp.data
        })
      },
    },

    mounted() {
      this.getMovimientos()
    },

    props: ['datos', 'empleado', 'departamento'],
  }
  </script>
