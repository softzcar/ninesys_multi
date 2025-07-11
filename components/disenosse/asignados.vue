<template>
  <div>
    <h2>{{ title }}</h2>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-row
        v-if="error.show"
        class="mt-4"
      >
        <b-col>
          <b-alert
            show
            variant="danger"
          >Danger Alert: {{ error.msg }}</b-alert>
        </b-col>
      </b-row>

      <b-row class="mt-4">
        <b-col>
          <b-table
            responsive
            :fields="fields"
            :items="items"
          >
            <template #cell(id)="data">
              <linkSearch :id="data.item.id" />
            </template>

            <template #cell(imagen)="data">
              <diseno-viewImage :id="data.item.imagen" />
            </template>

            <template #cell(inicio)="data">
              {{ formatDate(data.item.inicio) }}
            </template>

            <template #cell(cliente)="data">
              {{ data.item.cliente }}
            </template>

            <template #cell(codigo_diseno)="data">
              <diseno-codigoDiseno :item="data.item" />
            </template>

            <template #cell(phone)="data">
              <div style="float: left; margin-right: 6px; margin-top: 6px">
                <span v-html="whatsAppMe(data.item.phone, true)"></span>
              </div>
            </template>

            <template #cell(linkdrive)="data">
              <disenosse-linkDrive
                :linkdrive="data.item.linkdrive"
                :item="data.item"
              />
            </template>

            <!-- <template #cell(revision)="data">
                            <disenosse-uploadPropuesta
                                :revisiones="revisiones"
                                :item="data.item"
                                :idorden="data.item.id_orden"
                                :@reload="reloadDisenos"
                                />
                            </template> -->
            <template #cell(revision)="data">
              <disenosse-uploadPropuestaDisenador
                :revisiones="
                  revisiones.filter(
                    (el) => parseInt(el.id_orden) === data.item.id_orden
                  )
                "
                :item="data.item"
                :productos="productos"
                @reload="loadDisenos"
              />
            </template>

            <template #cell(id_orden)="data">
              <ordenes-vinculadas :id_orden="data.item.id_orden" />
            </template>

            <template #cell(tallas_y_personalizacion)="data">
              <disenosse-tallasPersoalizacion
                :ajustes="ajustes"
                :item="data.item"
                @reload="loadDisenos"
              />
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
import axios from "axios";
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],
  data() {
    return {
      title: "Diseños Asignados SSE",
      error: {
        show: false,
        msg: "",
      },
      revisiones: [],
      productos: [],
      ajustes: [],
      placeholder: "Número de orden",
      overlay: true,
      items: [],
      fields: [
        {
          key: "id",
          label: "Orden",
        },
        {
          key: "cliente",
          label: "Cliente",
        },
        {
          key: "inicio",
          label: "Inicio",
        },
        /* {
                    key: "phone",
                    label: "WhatsApp",
                    class: "text-center",
                }, */
        {
          key: "revision",
          label: "Revisión",
          class: "text-center",
        },
        {
          key: "tallas_y_personalizacion",
          label: "Tallas y Personalización",
          class: "text-center",
        },
        {
          key: "id_orden",
          label: "Vinculadas",
          class: "text-center",
        },
        {
          key: "codigo_diseno",
          label: "Código Diseño",
          class: "text-center",
        },
        {
          key: "linkdrive",
          label: "Google Drive",
          class: "text-center",
        },
        {
          key: "revision",
          label: "Revisiones",
          class: "text-center",
        },
      ],
      reloadDisenos: false,
    };
  },

  watch: {
    reloadDisenos(val) {
      if (val) {
        // this.overlay = true
        this.getDisenos().then(() => {
          this.reloadDisenos = false;
          // this.overlay = false
        });
      }
    },
  },

  methods: {
    filterRevisiones(id_orden) {
      const resultado = arregloOriginal.reduce((acumulador, objeto) => {
        const idOrden = objeto.id_orden;
        const objetoExistente = acumulador.find(
          (item) => item.id_orden === idOrden
        );

        if (objetoExistente) {
          objetoExistente.revisiones.push({
            id_revision: objeto.id_revision,
            id_diseno: objeto.id_diseno,
            estatus: objeto.estatus,
            detalles: objeto.detalles,
          });
        } else {
          acumulador.push({
            id_orden: idOrden,
            revisiones: [
              {
                id_revision: objeto.id_revision,
                id_diseno: objeto.id_diseno,
                estatus: objeto.estatus,
                detalles: objeto.detalles,
              },
            ],
          });
        }

        return acumulador;
      }, []);
    },

    getLindirve(id_diseno) {
      return this.items
        .filter((el) => el.id_diseno == id_diseno)
        .map((el) => {
          return el.linkdrive;
        });
    },

    async loadDisenos() {
      await this.$axios
        .get(
          `${this.$config.API}/sse/diseno/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          console.log("Respuesta de sse/disenos", res.data);
          this.items = res.data.items.reduce((acumulador, objeto) => {
            const idOrden = objeto.id_orden;
            const objetoExistente = acumulador.find(
              (item) => item.id_orden === idOrden
            );

            if (!objetoExistente) {
              acumulador.push(objeto);
            }

            return acumulador;
          }, []);
          this.revisiones = res.data.revisiones;
          this.productos = res.data.productos;
          this.ajustes = res.data.ajustes;
          this.overlay = false;
        });
    },

    /* loadDisenos() {
            this.source = new EventSource(
                `${this.$config.API}/sse/diseno/${this.$store.state.login.dataUser.id_empleado}`
            )

            this.source.addEventListener("message", (event) => {
                const eventData = JSON.parse(event.data)
                const eventType = event.type

                if (eventType === "chat") {
                    this.events.push(eventData)
                }

                if (eventType === "message") {
                    this.events = eventData
                    this.items = eventData.items.reduce(
                        (acumulador, objeto) => {
                            const idOrden = objeto.id_orden
                            const objetoExistente = acumulador.find(
                                (item) => item.id_orden === idOrden
                            )

                            if (!objetoExistente) {
                                acumulador.push(objeto)
                            }

                            return acumulador
                        },
                        []
                    )
                    this.revisiones = eventData.revisiones
                    this.ajustes = eventData.ajustes
                    this.overlay = false
                }
            })

            this.source.addEventListener("error", (error) => {
                console.error("Error in SSE connection:", error)
                this.source.close() // Cerrar la conexión actual
            })
        }, */

    connectToServer() {
      this.loadDisenos();
    },

    onRevision(id_diseno) {
      let hasReview = [];
      hasReview = this.revisiones.filter((el) => el.id_diseno == id_diseno);
      return hasReview;
    },

    /* async getDisenos() {
      // let userType = this.$store.state.login.dataUser.departamento
      // console.log('Departamento de usuario', userType)
      console.log(`recarguemos diseños...`)
      await this.$axios
        .get(
          `${this.$config.API}/disenos/asignados/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.fields = res.data.fields
          this.revisiones = res.data.revisiones
          // this.items = res.data.items

          this.items = res.data.items.reduce((acc, obj) => {
            let current = acc.find((o) => o.id_orden === obj.id_orden)
            if (!current) {
              acc.push(obj)
              return acc
            }
            if (obj.estatus === 'Aprobado') {
              current.estatus = 'Aprobado'
            } else if (
              current.estatus !== 'Aprobado' &&
              obj.estatus === 'Rechazado'
            ) {
              current.estatus = 'Rechazado'
            } else if (
              current.estatus !== 'Aprobado' &&
              current.estatus !== 'Rechazado' &&
              obj.estatus === 'Esperando Respuesta'
            ) {
              current.estatus = 'Esperando Respuesta'
            }
            return acc
          }, [])

          // TODO vamos a filtrar el estatus de la revision y pasarselo al componenete `uploadImageRevision`
        })
    }, */
  },

  mounted() {
    this.overlay = true;
    // setInterval(this.getDisenos, 90000)
    //   this.getDisenos().then(() => (this.overlay = false))
    this.connectToServer();
  },
};
</script>

<style scoped>
.floarme {
  float: left;
}

.floatme:first-child {
  margin-right: 20px;
}
</style>
