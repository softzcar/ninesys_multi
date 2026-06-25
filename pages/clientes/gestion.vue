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
            <!-- Fila de Título de la Página -->
            <b-row class="mt-2 mb-3">
              <b-col>
                <h2 class="font-weight-bold">{{ titulo }}</h2>
              </b-col>
            </b-row>

            <!-- Fila de Filtros Avanzados -->
            <b-row class="mb-4 align-items-end">
              <!-- Filtro de Texto -->
              <b-col md="3" class="mb-2">
                <label for="filter-input" class="small text-muted font-weight-bold mb-1">Buscar Cliente</label>
                <b-input-group size="sm">
                  <b-form-input
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Nombre, Cédula, Correo..."
                  ></b-form-input>
                  <b-input-group-append v-if="filter">
                    <b-button variant="outline-secondary" @click="filter = ''" title="Limpiar búsqueda">
                      <b-icon icon="x"></b-icon>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>

              <!-- Filtro de País -->
              <b-col md="1" class="mb-2">
                <label for="filter-pais" class="small text-muted font-weight-bold mb-1">País</label>
                <b-form-select
                  id="filter-pais"
                  v-model="selectedPais"
                  size="sm"
                  :options="paisOptions"
                  :disabled="loadingPaises"
                >
                </b-form-select>
              </b-col>

              <!-- Filtro de Estado -->
              <b-col md="2" class="mb-2">
                <label for="filter-estado" class="small text-muted font-weight-bold mb-1">Estado</label>
                <b-input-group size="sm">
                  <b-form-select
                    id="filter-estado"
                    v-model="selectedEstado"
                    :options="estadoOptions"
                    :disabled="!selectedPais || loadingEstados"
                  >
                    <template #first>
                      <b-form-select-option :value="null">Todos los Estados</b-form-select-option>
                    </template>
                  </b-form-select>
                  <b-input-group-append v-if="selectedEstado !== null">
                    <b-button variant="outline-secondary" @click="selectedEstado = null" title="Limpiar estado">
                      <b-icon icon="x"></b-icon>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>

              <!-- Filtro de Ciudad -->
              <b-col md="2" class="mb-2">
                <label for="filter-ciudad" class="small text-muted font-weight-bold mb-1">Ciudad</label>
                <b-input-group size="sm">
                  <b-form-select
                    id="filter-ciudad"
                    v-model="selectedCiudad"
                    :options="ciudadOptions"
                    :disabled="!selectedEstado || loadingCiudades"
                  >
                    <template #first>
                      <b-form-select-option :value="null">Todas las Ciudades</b-form-select-option>
                    </template>
                  </b-form-select>
                  <b-input-group-append v-if="selectedCiudad !== null">
                    <b-button variant="outline-secondary" @click="selectedCiudad = null" title="Limpiar ciudad">
                      <b-icon icon="x"></b-icon>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>

              <!-- Filtro de Producto Comprado -->
              <b-col md="2" class="mb-2">
                <label for="filter-producto" class="small text-muted font-weight-bold mb-1">Producto Comprado</label>
                <b-input-group size="sm">
                  <b-form-select
                    id="filter-producto"
                    v-model="selectedProduct"
                    :options="productOptions"
                  >
                    <template #first>
                      <b-form-select-option :value="null">Todos los Productos</b-form-select-option>
                    </template>
                  </b-form-select>
                  <b-input-group-append v-if="selectedProduct !== null">
                    <b-button variant="outline-secondary" @click="selectedProduct = null" title="Limpiar producto">
                      <b-icon icon="x"></b-icon>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>

              <!-- Botón Limpiar Filtros -->
              <b-col md="2" class="mb-2">
                <label class="small text-muted font-weight-bold mb-1 d-block">&nbsp;</label>
                <b-button
                  variant="primary"
                  size="sm"
                  block
                  @click="resetFilters"
                >
                  <b-icon icon="arrow-counterclockwise" class="mr-1"></b-icon>
                  Limpiar Filtros
                </b-button>
              </b-col>
            </b-row>

            <!-- Fila de Acciones de Clientes -->
            <b-row class="mb-4">
              <b-col>
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
      :filter-product="selectedProduct"
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
      selectedPais: 189,
      selectedEstado: null,
      selectedCiudad: null,
      paisesList: [],
      estadosList: [],
      ciudadesList: [],
      loadingPaises: false,
      loadingEstados: false,
      loadingCiudades: false,
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
          key: "phone",
          label: "Teléfono",
          sortable: true,
        },
        {
          key: "id",
          label: "Acciones",
          tdClass: "pl-4",
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

        // 2. Filtro por País, Estado y Ciudad
        if (this.selectedPais) {
          if (Number(client.id_catalogo_pais) !== Number(this.selectedPais)) {
            return false;
          }
        }
        if (this.selectedEstado) {
          if (Number(client.id_catalogo_estado) !== Number(this.selectedEstado)) {
            return false;
          }
        }
        if (this.selectedCiudad) {
          if (Number(client.id_catalogo_ciudad) !== Number(this.selectedCiudad)) {
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

    paisOptions() {
      return this.paisesList
        .filter(p => Number(p._id) === 189)
        .map(p => ({ value: p._id, text: p.nombre }));
    },
    estadoOptions() {
      const estadosConClientes = [...new Set(this.dataTable.map(c => Number(c.id_catalogo_estado)).filter(Boolean))];
      return this.estadosList
        .filter(e => estadosConClientes.includes(Number(e._id)))
        .map(e => ({ value: e._id, text: e.nombre }));
    },
    ciudadOptions() {
      const ciudadesConClientes = [...new Set(this.dataTable.map(c => Number(c.id_catalogo_ciudad)).filter(Boolean))];
      return this.ciudadesList
        .filter(c => ciudadesConClientes.includes(Number(c._id)))
        .map(c => ({ value: c._id, text: c.nombre }));
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
    },
    selectedPais(nuevoId) {
      this.selectedEstado = null;
      this.selectedCiudad = null;
      this.estadosList = [];
      this.ciudadesList = [];
      if (nuevoId) {
        this.fetchEstados(nuevoId);
      }
    },
    selectedEstado(nuevoId) {
      this.selectedCiudad = null;
      this.ciudadesList = [];
      if (nuevoId) {
        this.fetchCiudades(nuevoId);
      }
    }
  },

  methods: {
    resetFilters() {
      this.filter = '';
      this.selectedPais = 189;
      this.selectedEstado = null;
      this.selectedCiudad = null;
      this.selectedProduct = null;
      this.currentPage = 1;
    },

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

    async fetchPaises() {
      this.loadingPaises = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-paises`);
        this.paisesList = res.data.data || [];
      } catch (err) {
        console.error("Error cargando países:", err);
      } finally {
        this.loadingPaises = false;
      }
    },

    async fetchEstados(idPais) {
      this.loadingEstados = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-estados/${idPais}`);
        this.estadosList = res.data.data || [];
      } catch (err) {
        console.error("Error cargando estados:", err);
      } finally {
        this.loadingEstados = false;
      }
    },

    async fetchCiudades(idEstado) {
      this.loadingCiudades = true;
      try {
        const res = await this.$axios.get(`${this.$config.API}/catalogo-ciudades/${idEstado}`);
        this.ciudadesList = res.data.data || [];
      } catch (err) {
        console.error("Error cargando ciudades:", err);
      } finally {
        this.loadingCiudades = false;
      }
    },
  },

  async mounted() {
    this.getCustomers().then(() => {
      this.overlay = false;
    });
    this.fetchProductsList();
    await this.fetchPaises();
    if (this.selectedPais) {
      await this.fetchEstados(this.selectedPais);
    }
  },
};
</script>
