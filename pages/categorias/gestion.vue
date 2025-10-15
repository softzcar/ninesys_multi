<template>
  <div>
    <div v-if="!access">
      <login-form />
    </div>

    <div v-else>
      <menus-MenuLoader />
      <div v-if="dataUser.departamento === 'Administración'">
        <b-overlay :show="overlay" spinner-small>
          <b-container fluid>
            <b-row>
              <b-col offset-lg="8" offset-xl="8">
                <b-input-group class="mb-4" size="sm">
                  <b-form-input
                    id="filter-input"
                    v-model="filter"
                    type="search"
                    placeholder="Filtrar Resultados"
                  ></b-form-input>

                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''">
                      Limpiar
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <h2 class="mb-4">{{ titulo }}</h2>
                <admin-CategoriasNuevo @reload="getCategorias()" />
              </b-col>
            </b-row>
            <b-row v-if="categorias.length > 0">
              <b-col>
                <b-table
                  responsive
                  :fields="fields"
                  :items="categorias"
                  :filter="filter"
                  :filter-included-fields="includedFields"
                  :per-page="perPage"
                  :current-page="currentPage"
                  small
                >
                  <template #cell(acciones)="data">
                    <span class="floatme">
                      <admin-categoriasEdit
                        :key="data.item.id"
                        :item="data.item"
                        @reload="getCategorias()"
                      />
                    </span>
                    <span class="floatme">
                      <admin-categoriasDelete
                        @reload="getCategorias()"
                        :id="data.item.id"
                        :key="data.item.id"
                        :nombre="data.item.name"
                      />
                    </span>
                  </template>
                </b-table>
                <b-pagination
                  v-model="currentPage"
                  :total-rows="categorias.length"
                  :per-page="perPage"
                  align="center"
                  class="mt-3"
                ></b-pagination>
              </b-col>
            </b-row>

            <b-row v-else>
              <b-col>
                <b-alert variant="info" show>
                  <p>No se encontraron categorías</p>
                </b-alert>
              </b-col>
            </b-row>
          </b-container>
        </b-overlay>
      </div>

      <div v-else>
        <accessDenied />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import mixin from "~/mixins/mixin-login.js";

export default {
  mixins: [mixin],

  data() {
    return {
      titulo: "Gestión de Categorías",
      overlay: false,
      categorias: [],
      filter: null,
      includedFields: ["name"],
      perPage: 20,
      currentPage: 1,
      fields: [
        {
          key: "id",
          label: "ID",
        },
        {
          key: "name",
          label: "Nombre",
        },
        {
          key: "acciones",
          label: "Acciones",
        },
      ],
    };
  },

  computed: {
    ...mapState("login", ["dataUser", "access"]),
  },

  methods: {
    async getCategorias() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/categories`)
        .then((res) => {
          this.categorias = res.data;
        })
        .catch((err) => {
          this.$fire({
            title: "Error cargando las categorías",
            html: `<p>${err}</p>`,
            type: "warning",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  mounted() {
    this.getCategorias();
  },
};
</script>