<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-container class="text-center">
        <b-row v-if="
                        idOrden === undefined ||
                        this.imageUrl ===
                            `${this.$config.CDN}/images/no-image.png`
                    ">
          <b-col>
            <b-alert
              v-if="idOrden === undefined"
              variant="danger"
              class="text-center mt-4"
              show
            >
              No re recibió el numero de orden
            </b-alert>
            <b-alert
              v-if="`${this.$config.CDN}/images/no-image.png`"
              variant="danger"
              class="text-center mt-4"
              show
            >
              La orden {{ idOrden }} no tiene diseño asignado
            </b-alert>
          </b-col>
        </b-row>

        <div v-else>
          <b-row>
            <b-col>
              <h2 class="mt-4">ORDEN {{ idOrden }}</h2>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <h3 class="mt-4 mb-3">Propuesta De Diseño</h3>
              <b-img
                class="mb-4"
                :src="imageUrl"
                fluid
              ></b-img>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-list-group>
                <b-list-group-item><strong>Cliente:</strong>
                  {{ miCliente }}
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col class="text-left mt-4">
              <h4>CONDICIONES PARA CONCRETAR</h4>
              <ul>
                <li>
                  Para comenzar a trabajar con el diseño es
                  necesario tener abonado el 50%. Una vez
                  aprobado necesitamos el otro 50% para
                  comenzar la producción.
                </li>
                <li>
                  El tiempo de entrega puede variar entre 3 y
                  10 días hábiles.
                </li>
              </ul>

              <h4>EL DISEÑO DE CUALQUIER PRENDA:</h4>
              <ul>
                <li>
                  No incluye diseÑo de logo, si ya tiene el
                  logo se puede incluir siempre y cuando esté
                  en formato editable CDR, AI o ESP. D lo
                  contrario volverlo a hacer tiene un costo de
                  15$
                </li>
                <li>
                  Con el costo del diseÑO se incluyen 3
                  modificaciones, si el cliente requiere
                  modificaciónes adicionales cada modificación
                  tiene un costo adicional de 5$
                </li>
                <li>
                  NO ACEPTAMOS IMÁGENES O LOGOS REALIZADOS CON
                  APLICACIONES DE TELÉFONOS
                </li>
              </ul>

              <h4>ATENCIÓN:</h4>
              <ul>
                <li>
                  El cliente debe proporcionar toda la
                  información requerida para su diseño
                  referente a ideas o especificaciones
                  concretas de colores o posición de logos y
                  elementos en el producto a realizar.
                </li>
                <li>
                  Si después de aprobarse el diseñoO parte del
                  cliente éste pide una modificación tendrá un
                  costo adicional de 5$
                </li>

                <li>
                  El tiempo de entrega desde 3 días hasta 10
                  días hábiles son contados a partir de la
                  fecha de aprobación del diseño.
                </li>
              </ul>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-button
                :disabled="disbaleControls"
                size="lg"
                class="mb-4 mt-3"
                variant="info"
                @click="aprobar"
              >APROBAR DISEÑO</b-button>
            </b-col>
          </b-row>
        </div>
      </b-container>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NinesysRevision",

  data() {
    return {
      disbaleControls: false,
      idOrden: null,
      disenoLength: null,
      imageUrl: "",
      resCDN: null,
      myOrder: null,
      overlay: true,
      miCliente: "",
    };
  },

  methods: {
    async findImage() {
      let token = this.token();
      if (!this.disenoLength) {
        this.imageUrl = `${this.$config.CDN}/images/no-image.png?_=${token}`;
      } else {
        console.log("Vamos a buscar la imágen");
        await this.$axios
          .get(
            `${this.$config.CDN}/?id_orden=${this.myOrder.diseno[0].id_orden}&id_diseno=${this.myOrder.diseno[0].id_diseno}&review=${this.myOrder.diseno[0].revision}`
          )
          .then((res) => {
            console.log(`El cdn respondio con una imagen`, res);
            this.imageUrl = `${this.$config.CDN}/${res.data.url}?_=${token}`;
          })
          .catch((err) => {
            console.log(`El cdn respondio con un error`, err);
            this.imageUrl = `${this.$config.CDN}/images/no-image.png`;
          });
      }
    },

    async getOrdenes() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/ordenes/reporte/${this.idOrden}`)
        .then((resp) => {
          this.myOrder = resp.data;
          this.disenoLength = resp.data.diseno.length;
          this.miCliente = `${resp.data.customer[0].first_name} ${resp.data.customer[0].last_name}`;
          this.overlay = false;
        });
    },

    token() {
      const length = 8;
      var a =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
          ""
        );
      var b = [];
      for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
      }
      return b.join("");
    },

    async enviarAprobacion() {
      const data = new URLSearchParams();
      data.set("id_orden", this.idOrden);
      if (this.myOrder.diseno.length > 0) {
        this.overlay = true;
        data.set("id_diseno", this.myOrder.diseno[0].id_diseno);
        await this.$axios
          .post(`${this.$config.API}/disenos/parobacion-de-cliente`, data)
          .then((res) => {
            this.pagos = [];
            this.pagos = res.data.data;
            // this.urlLink = res.data.linkdrive
          });
      }
    },

    aprobar() {
      this.disbaleControls = true;

      this.$confirm(
        `Al aprobar el diseño acepta las condiciones aquí planteadas.`
      )
        .then(() => {
          this.enviarAprobacion().then(() => {
            this.$fire({
              title: "Aprobado",
              html: `<p>!Ha aprobado su diseño!</p>`,
              type: "info",
            });
          });
        })
        .catch(() => {
          this.disbaleControls = false;
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  beforeMount() {
    this.idOrden = this.$route.params.id;
    this.getOrdenes()
      .then(() => {
        this.findImage();
      })
      .finally(() => (this.overlay = false));
  },

  mounted() {
    console.log(`params reote`, this.$route);
  },
};
</script>

<style lang="scss" scoped></style>
