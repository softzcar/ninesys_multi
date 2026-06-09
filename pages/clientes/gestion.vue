<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Comercialización'
                ">
        <b-overlay
          :show="overlay"
          spinner-small
        >
          <b-container
            fluid
            v-if="
                            dataUser.departamento === 'Administración' ||
                            dataUser.departamento === 'Comercialización'
                        "
          >
            <!-- Fila de Filtros Avanzados -->
            <b-row class="mb-4">
              <!-- Filtro de Texto -->
              <b-col md="4" class="mb-2">
                <b-input-group size="sm">
                  <b-form-input
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Filtrar por texto (Nombre, Cédula...)"
                  ></b-form-input>
                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''">
                      Limpiar
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>

              <!-- Filtro de Ciudad -->
              <b-col md="4" class="mb-2">
                <b-form-select
                  v-model="selectedCity"
                  size="sm"
                  :options="cityOptions"
                >
                  <template #first>
                    <b-form-select-option :value="null">Todas las Ciudades</b-form-select-option>
                  </template>
                </b-form-select>
              </b-col>

              <!-- Filtro de Producto Comprado -->
              <b-col md="4" class="mb-2">
                <b-form-select
                  v-model="selectedProduct"
                  size="sm"
                  :options="productOptions"
                >
                  <template #first>
                    <b-form-select-option :value="null">Filtrar por Producto comprado</b-form-select-option>
                  </template>
                </b-form-select>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <customers-CustomerNuevo @reload="getCustomers" />
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                ></b-pagination>

                <p class="mt-3">
                  Página actual: {{ currentPage }} | Resultados filtrados: {{ totalRows }}
                </p>
                <b-table
                  :per-page="perPage"
                  :current-page="currentPage"
                  @filtered="onFiltered"
                  ref="table"
                  small
                  hover
                  :items="filteredDataTable"
                  :fields="fields"
                  :filter-included-fields="includedFields"
                >
                  <template #cell(id)="data">
                    <!-- Botón para ver Ficha CRM -->
                    <span class="floatme mr-1">
                      <b-button
                        variant="info"
                        size="sm"
                        v-b-tooltip.hover
                        title="Ver Ficha / CRM"
                        @click="openClientDetail(data.item)"
                      >
                        <b-icon icon="person-lines-fill"></b-icon>
                      </b-button>
                    </span>

                    <span class="floatme mr-1">
                      <customers-CustomerEditar
                        @reload="getCustomers"
                        :item="data.item"
                        :key="data.item.id"
                      />
                    </span>
                    <span
                      v-if="
                                                 dataUser.departamento ===
                                                 'Administración'
                                             "
                      class="floatme"
                    >
                      <b-button
                        variant="danger"
                        size="sm"
                        v-on:click="
                                                     deleteCustomer(
                                                         data.item.id,
                                                         data.item.first_name,
                                                         data.item.last_name,
                                                         data.item.email
                                                     )
                                                 "
                      ><b-icon icon="trash"></b-icon>
                      </b-button>
                    </span>
                  </template>

                  <template #cell(first_name)="data">
                    {{ data.item.first_name }}
                    {{ data.item.last_name }}
                  </template>

                  <template #cell(email)="data">
                    {{ checkEmail(data.item.email) }}
                  </template>
                </b-table>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>
    </div>

    <!-- Cajón de Detalle CRM -->
    <crm-ClientDetailDrawer
      :client="selectedClient"
      :show="showDetail"
      @close="showDetail = false"
    />
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      includedFields: ["first_name", "last_name", "cedula", "email", "phone", "address"],
      filter: null,
      ordenesLength: 0,
      perPage: 25,
      currentPage: 1,
      titulo: "Gestión de Clientes",
      overlay: true,
      dataTable: [],
      tmpDelete: null,

      // Filtros CRM Avanzados
      selectedCity: null,
      selectedProduct: null,
      productsList: [],
      clientsWhoBoughtProduct: [],

      // Control del Cajón de Detalle CRM
      selectedClient: null,
      showDetail: false,

      fields: [
        {
          key: "first_name",
          label: "Cliente",
          tdClass: "pl-4",
          sortable: true,
        },
        {
          key: "email",
          label: "Email",
          sortable: true,
        },
        {
          key: "phone",
          label: "Teléfono",
          sortable: true,
        },
        {
          key: "id",
          label: "Acciones",
          tdClass: "pr-4 text-right",
          thClass: "text-right pr-4"
        },
      ],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),

    // Lista filtrada reactivamente por texto, ciudad e historial de productos
    filteredDataTable() {
      return this.dataTable.filter(client => {
        // 1. Filtro de texto libre (Nombre, Cedula, Email, Telefono, Direccion)
        if (this.filter) {
          const search = this.filter.toLowerCase();
          const matchesText = [
            client.first_name,
            client.last_name,
            client.cedula,
            client.email,
            client.phone,
            client.address
          ].some(val => val && val.toString().toLowerCase().includes(search));
          
          if (!matchesText) return false;
        }

        // 2. Filtro por Ciudad
        if (this.selectedCity) {
          const city = client.billing_city || '';
          if (city.toLowerCase().trim() !== this.selectedCity.toLowerCase().trim()) {
            return false;
          }
        }

        // 3. Filtro por Producto comprado
        if (this.selectedProduct) {
          const clientId = client.id || client._id;
          if (!this.clientsWhoBoughtProduct.includes(parseInt(clientId))) {
            return false;
          }
        }

        return true;
      });
    },

    totalRows() {
      return this.filteredDataTable.length;
    },

    // Opciones para el select de ciudades
    cityOptions() {
      const cities = this.dataTable
        .map(c => c.billing_city || '')
        .filter(city => city.trim() !== '')
        .map(city => city.trim());
      
      const uniqueCities = [...new Set(cities)].sort();
      return uniqueCities.map(city => ({
        value: city,
        text: city
      }));
    },

    // Opciones para el select de productos
    productOptions() {
      return this.productsList.map(prod => ({
        value: prod.cod || prod._id,
        text: `${prod.name} (SKU: ${prod.sku || 'N/A'})`
      }));
    },
  },

  watch: {
    // Si cambia el producto seleccionado, cargar la lista de IDs de clientes desde el backend
    selectedProduct(newVal) {
      if (newVal) {
        this.$axios.get(`${this.$config.API}/crm/clientes-por-producto/${newVal}`)
          .then(res => {
            this.clientsWhoBoughtProduct = res.data;
          })
          .catch(err => {
            console.error("Error al obtener clientes por producto:", err);
            this.clientsWhoBoughtProduct = [];
          });
      } else {
        this.clientsWhoBoughtProduct = [];
      }
    }
  },

  methods: {
    onFiltered(filteredItems) {
      this.currentPage = 1;
    },

    openClientDetail(client) {
      this.selectedClient = client;
      this.showDetail = true;
    },

    checkCedula(cedula) {
      if (cedula === "none" || cedula === null || !cedula) {
        return "";
      } else {
        return cedula;
      }
    },

    checkEmail(email) {
      const parts = email.split("@");

      if (parts[1] === "email.com") {
        return "";
      } else {
        return email;
      }
    },

    async verificarPedidosEnWC(customer_email, customer_id) {
      const respCount = await this.$axios
        .get(
          `${this.$config.API}/customers/orders-count/${customer_email}/${customer_id}`
        )
        .then((res) => {
          this.tmpDelete = res.data;
        })
        .catch((err) => {
          this.tmpDelete = null;
        });
      return respCount;
    },

    deleteCustomer(id_emp, nombre, apellido, email) {
      this.$confirm(
        `¿Desea Eliminar el cliente ${nombre} ${apellido} ?`,
        "Eliminar Cliente",
        "warning"
      )
        .then(() => {
          this.verificarPedidosEnWC(email, id_emp).then(() => {
            if (this.tmpDelete.ordenes_ns === 0) {
              this.overlay = true;
              const data = new URLSearchParams();
              data.set("customer_id", id_emp);
              this.$axios
                .post(`${this.$config.API}/customers/eliminar`, data)
                .then((res) => {
                  this.getCustomers().then(() => (this.overlay = false));
                });
            } else {
              this.$fire({
                title: "El Cliente no se puede eliminar",
                html: `<p>El cliente posee ${this.tmpDelete.ordenes_ns} órdenes activas en el sistema.</p>`,
                type: "warning",
              });
            }
          });
        })
        .catch((err) => {
          console.log("CATCH!!!", err);
          return false;
        });
    },

    async getCustomers() {
      await this.$axios.get(`${this.$config.API}/customers`).then((resp) => {
        this.dataTable = resp.data.data.map((el) => {
          if (el.email === "none") {
            return { ...el, email: "" };
          } else {
            return el;
          }
        });
        this.ordenesLength = this.dataTable.length;
        this.overlay = false;
      });
    },

    fetchProductsList() {
      // Cargar lista de productos del catálogo local
      this.$axios.get(`${this.$config.API}/wp/products`)
        .then(res => {
          this.productsList = res.data.data || [];
        })
        .catch(err => {
          console.error("Error cargando catálogo de productos:", err);
        });
    },
  },

  mounted() {
    this.getCustomers().then(() => {
      this.overlay = false;
    });
    this.fetchProductsList();
  },
};
</script>
