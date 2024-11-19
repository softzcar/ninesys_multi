<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <!-- <pre>
        ORDENES {{ ordenes }}
      </pre> -->
      <div v-if="ordenesSize < 1">
        <b-container>
          <b-row>
            <b-col>
              <b-alert :show="showAlert" class="text-center" variant="info">
                <h1>Has terminado todas tus tareas 👍</h1>
              </b-alert>
            </b-col>
          </b-row>
        </b-container>
      </div>

      <div v-else>
        <b-container>
          <b-row>
            <b-col>
              <b-card
                bg-variant="default"
                header="Conmtrol de Material"
                class="text-center mb-4"
              >
                <b-card-text>
                  <empleados-AsignacionDeTelas />
                </b-card-text>
                <b-card-text v-if="enCurso.length"> </b-card-text>
                <b-card-text v-else>
                  <b-alert :show="showAlert" class="text-center" variant="info">
                    No hay tareas en curso.
                  </b-alert>
                </b-card-text>
                <!-- <b-card-text>{{ dataOrdenEnCurso }}</b-card-text> -->
              </b-card>

              <b-card
                bg-variant="default"
                header="Trabajos en curso"
                class="text-center mb-4"
              >
                <b-card-text v-if="enCurso.length">
                  <!-- <pre>
                   enCurso {{ enCurso }}
                  </pre> -->
                  <b-table small stacked striped :items="enCurso"></b-table
                ></b-card-text>
                <b-card-text v-else>
                  <b-alert :show="showAlert" class="text-center" variant="info">
                    No hay tareas en curso.
                  </b-alert>
                </b-card-text>
                <!-- <b-card-text>{{ dataOrdenEnCurso }}</b-card-text> -->
              </b-card>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-table small stacked :items="ordersList" :fields="fields2">
                <template #cell(id_lotes_detalles)="row">
                  terminemos el lote {{ row.item.id_lotes_detalles }}
                </template>
                <template #cell(orden)="row">
                  <div style="width: 164%">
                    <b-button
                      :variant="row.item.urgent"
                      block
                      size="xl"
                      @click="row.toggleDetails"
                      >{{ row.item.orden }}
                    </b-button>
                  </div>
                </template>

                <template #row-details="row">
                  <b-card>
                    <b-table
                      small
                      striped
                      stacked
                      responsive
                      :items="filterOrder(row.item.orden)"
                      :fields="fields"
                    >
                      <template #cell(departamento)="row">
                        {{ row.item.departamento }}
                        <!-- <pre
                          style="
                            background-color: lightcoral;
                            color: darkred !important;
                          "
                        >
                        {{ row.item }}
                      </pre
                        > -->
                      </template>
                      <template #cell(id_lotes_detalles)="row">
                        <empleados-boton-terminar
                          @reload="reloadMe"
                          :item="row.item"
                        />
                        <!-- <span class="floatme" style="margin-top: 47px">
                          <inventario-InsumoAsignar
                            :datos="item"
                            :empleado="emp"
                            departamento="Corte"
                          />
                        </span> -->
                      </template>
                      <template #cell(detalle)="row">
                        <div
                          style="
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                          "
                        >
                          <linkSearch
                            class="floatme mb-2"
                            :id="row.item.id_orden"
                          />
                          <diseno-view-image
                            class="floatme mb-2"
                            :id="row.item.id_orden"
                          />
                        </div>
                        <empleados-ver-detalle
                          class="mt-2"
                          :detalles_revision="row.item.detalles_revision"
                          :idorden="row.item.id_orden"
                          :id_ordenes_productos="row.item.id_ordenes_productos"
                        />
                      </template>
                      <template #cell(id_orden)="row">
                        <h4 class="mb-4">
                          {{ row.item.id_orden }}
                          <small style="font-size: 35%"
                            >{{ row.item.producto }} | Talla
                            {{ row.item.talla }}</small
                          >
                        </h4>
                        {{ maquetarPrioridad(row.item.prioridad) }}
                      </template>
                    </b-table>
                  </b-card>
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import axios from 'axios'
import { log } from 'console'
export default {
  data() {
    return {
      dataOrdenEnCurso: [],
      showAlert: true,
      ordenes: [],
      pagos: [],
      overlay: false,
      reload: false,
      fields2: [
        {
          key: 'orden',
          label: '',
          variant: '',
        },
      ],
      fields: [
        {
          key: 'departamento',
          label: 'Paso Actual',
        },
        {
          key: 'producto',
          thClass: 'Porducto',
        },
        {
          key: 'unidades_solicitadas',
          label: 'Unidades',
        },

        {
          key: 'id_empleado',
          thClass: 'd-none',
          tdClass: 'd-none',
        },
        {
          key: 'talla',
          label: 'Talla',
        },
        {
          key: 'corte',
          label: 'Corte',
        },
        {
          key: 'tela',
          label: 'Tela',
        },
        {
          key: 'detalle',
          label: '',
          class: 'text-center',
        },
        {
          key: 'id_lotes_detalles',
          label: '',
          tdClass: 'text-center pt-4 pb-4',
        },
        {
          key: 'departamento',
          thClass: 'd-none',
          tdClass: 'd-none',
        },
      ],

      /* fields2: [
        {
          key: 'producto',
          label: 'Producto',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
        {
          key: 'unidades',
          label: 'Unidades',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
        {
          key: 'piezas_actuales',
          label: 'Piezas',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
        {
          key: 'talla',
          label: 'Talla',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
        {
          key: 'corte',
          label: 'Corte',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
        {
          key: 'tela',
          label: 'Tela',
          tdClass: 'text-uppercase text-center font-weight-bold',
        },
      ], */
    }
  },

  watch: {
    reload(val) {
      // const p = this.dataOrdenEnCurso.push('val')
      this.dataOrdenEnCurso = [{ data: 'hola' }]

      console.log('cargar informacion en el cuadro informativo', p)
      return true
    },

    reload2() {
      // console.log('RELOAD', val)
      if (this.reload) {
        this.reloadMe()
        /* this.getOrdenesAsignadas().then(() => {
          this.overlay = false
          this.reload = false
        }) */
      }
    },
  },

  computed: {
    ordersList() {
      if (!Array.isArray(this.pagos)) {
        this.pagos = []
      }

      let tmp = this.ordenes
        .map((item) => {
          let txtVariant
          if (parseInt(item.prioridad)) {
            txtVariant = 'danger'
          } else {
            txtVariant = 'success'
          }
          return {
            orden: item.id_orden,
            variant: txtVariant,
            terminado: item.fecha_terminado,
            urgent: this.checkPrioridad(item.prioridad),
          }
        })
        .reduce((acc, item) => {
          console.log('item to push', item)

          if (acc.filter((row) => row.orden === item.orden).length === 0) {
            acc.push(item)
          }
          return acc
        }, [])
      return tmp
    },

    ordenesSize() {
      let size = null
      size = parseInt(this.ordenes.length)
      return size
    },
  },

  methods: {
    checkPrioridad(val) {
      const prioridad = parseInt(val)
      let variant = ''
      if (prioridad) {
        variant = 'danger'
      } else {
        variant = 'info'
      }
      return variant
    },

    createArray(obj) {
      const arr = []
      arr.push(obj)
      console.log(' creata array', arr)
      return arr
    },

    filterOrder(id_orden) {
      const products = this.ordenes.filter(
        (item) => item.id_orden === id_orden && !item.fecha_terminado
      )

      return products
    },

    async getOrdenesAsignadas() {
      await axios
        .get(`${this.$config.API}/empleados/ordenes-asignadas/${this.emp}`)
        .then((resp) => {
          this.ordenes = resp.data.items.filter(
            (item) =>
              item.id_woo != '11' ||
              item.id_woo != '12' ||
              item.id_woo != '13' ||
              item.id_woo != '14' ||
              item.id_woo != '15' ||
              item.id_woo != '16' ||
              item.id_woo != '112' ||
              item.id_woo != '113' ||
              item.id_woo != '168' ||
              item.id_woo != '169' ||
              item.id_woo != '170' ||
              item.id_woo != '171' ||
              item.id_woo != '172' ||
              item.id_woo != '173'
          )
          this.enCurso = resp.data.trabajos_en_curso
          if (resp.data.pagos.length) {
            this.pagos = resp.data.pagos[0]
          }
        })
    },

    maquetarPrioridad(prioridad) {
      const pri = parseInt(prioridad)
      let text = ''

      if (!pri) {
        text = ''
        this.fields[0].variant = 'info'
      } else {
        text = ''
        this.fields[0].variant = 'danger'
      }

      return text
    },

    async reloadMe() {
      await this.getOrdenesAsignadas().then(() => {
        if (this.ordenes != this.items) {
          this.items = this.ordenes
        }
      })
    },
  },

  mounted() {
    this.reloadMe()
    // setInterval(this.reloadMe, 90000)
  },

  props: ['emp', 'updatedata'],
}
</script>
