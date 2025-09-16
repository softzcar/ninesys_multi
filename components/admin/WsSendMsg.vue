<template>
  <div>
    <b-button
      class="mb-4"
      @click="$bvModal.show(modal)"
      variant="success"
    >
      <b-icon icon="whatsapp" class="mr-2"></b-icon>
      WhatsApp a Clientes
    </b-button>

    <b-modal
      :id="modal"
      :title="title"
      hide-footer
      size="lg"
    >
      <b-overlay
        :show="overlay"
        spinner-small
      >
        <b-row>
          <b-col>
            <h2 class="mb-4 mt-2">Enviar Mensajes</h2>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-pagination
              v-model="currentPage"
              :total-rows="totalRows"
              :per-page="perPage"
            ></b-pagination>

            <p class="mt-3">Página actual: {{ currentPage }}</p>
            <b-table
              :per-page="perPage"
              :current-page="currentPage"
              ref="table"
              responsive
              small
              striped
              hover
              :items="dataTable"
              :fields="fields"
              @filtered="onFiltered"
              :filter="filter"
              :filter-included-fields="includedFields"
            >
              <template #cell(orden)="data">
                <!-- <linkSearch :key="data.index" :index="data.index" :id="data.item.orden" /> -->
                <linkSearch :id="data.item.orden" />
              </template>

              <template #cell(fecha_inicio)="data">
                {{ formatDate(data.item.fecha_inicio) }}
              </template>

              <template #cell(fecha_entrega)="data">
                {{ formatDate(data.item.fecha_entrega) }}
              </template>

              <template #cell(id_father)="data">
                <ordenes-vinculadas-v2 :key="data.item.orden" :id_orden="data.item.orden" />
              </template>

              <template #cell(acc)="data">
                <div
                  v-for="(paso, index) in filterDeps()"
                  :key="index"
                >
                  {{ paso.departamento }}
                  <!-- <b-dropdown-item>{{
                                                paso.progreso
                                            }}</b-dropdown-item> -->
                </div>
                <b-button-group>
                  <admin-WsSendMsgCustomClientes
                    :idorden="data.item.acc"
                    :nombre_cliente="
                                            data.item.cliente_nombre
                                        "
                  />
                  <admin-WsSendMsgWelcome :idorden="data.item.acc" />
                  <admin-WsSendMsgBye :idorden="data.item.acc" />
                  <admin-WsSendMsgSaldo :idorden="data.item.acc" />

                  <b-dropdown
                    right
                    text="Pasos"
                  >
                    <div v-if="
                                                filterDeps(data.item.acc)
                                                    .length === 0
                                            ">
                      <b-dropdown-item disabled>
                        No hay departamentos asignados
                      </b-dropdown-item>
                    </div>
                    <div v-else>
                      <div
                        v-for="(
                                                    paso, index
                                                ) in filterDeps(data.item.acc)"
                        :key="index"
                      >
                        <b-dropdown-item @click="
                                                        sendMsgCustom(
                                                            data.item.acc,
                                                            'paso',
                                                            paso.id_departamento,
                                                            ''
                                                        )
                                                    ">{{
                                                        paso.departamento
                                                    }}</b-dropdown-item>
                      </div>
                    </div>
                  </b-dropdown>
                </b-button-group>
                <!--<div
                                style="
                                    float: left;
                                    margin-right: 6px;
                                    margin-top: 6px;
                                "
                            >
                                 <span
                                    v-html="whatsAppMe(data.item.phone, true)"
                                ></span>
                            </div> -->
                <!-- <div style="float: left; margin-right: 6px">
                                <diseno-view-image
                                    :index="data.index"
                                    class="floatme mb-2"
                                    :id="data.item.orden"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-editar
                                    :index="data.index"
                                    :key="data.item.orden"
                                    :data="data.item"
                                />
                            </div>
                            <div style="float: left; margin-right: 6px">
                                <ordenes-abono
                                    :index="data.index"
                                    :key="data.item.orden"
                                    :idorden="data.item.orden"
                                    :item="filterPago(data.item.orden)"
                                />
                            </div> -->
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      title: "Envío de Mensajes",
      overlay: true, // Controla el spinner de carga
      dataTable: [],
      departamentos: [],
      fields: [
        {
          key: "orden",
          label: "Orden",
          sortable: true,
        },
        {
          key: "cliente_nombre",
          label: "Cliente",
          sortable: true,
        },
        {
          key: "acc",
          label: "Mensajes",
          sortable: false,
        },
      ],
      ordenesActivas: [],
      ordenesLength: [],
    };
  },

  computed: {
    // Genera un ID único para el modal (tu implementación existente)
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-ws-deps-${rand}`; // Usar un prefijo más específico
    },
  },

  methods: {
    sendStepMsg(idDep, idOren) {
      console.log("ID departamento", idDep);
      console.log("ID ordem", idOren);
    },

    async getOrdenesActivas() {
      await this.$axios
        .get(
          `${this.$config.API}/table/ordenes-activas/${this.$store.state.login.dataUser.id_empleado}`
        )
        .then((res) => {
          this.dataTable = res.data.items;
          this.ordenesActivas = res.data.items;
          this.ordenesLength = this.ordenesActivas.length;
        });
    },

    async getDeps() {
      await this.$axios
        .get(`${this.$config.API}/ws/departamentos`)
        .then((res) => {
          this.departamentos = res.data;
        });
    },

    filterDeps(idOrden) {
      // return "departamento a flitrar " + idOrden;
      const result = this.departamentos.filter(
        (el) => el.id_orden === parseInt(idOrden)
      );

      console.log("departamento filtrados (result)", result);
      return result;
    },
  },

  mounted() {
    this.$root.$on("bv::modal::show", (bvEvent, modal) => {
      if (modal === this.modal) {
        this.getDeps();
        this.getOrdenesActivas().then(() => {
          this.overlay = false;
        });
      }
    });
  },

  // props: ["item", "reload"], // 'item' no parece usarse, 'reload' podría ser reemplazado por emitir eventos
};
</script>

<style scoped>
/* Estilos específicos para este componente */
.force {
  white-space: pre-wrap; /* Permite saltos de línea y espacios en pre */
  word-wrap: break-word; /* Rompe palabras largas si es necesario */
}

/* Puedes añadir más estilos si es necesario */
</style>
