<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
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

        <template #cell(first_name)="data">
          {{ data.item.first_name }} {{ data.item.last_name }}
        </template>

        <template #cell(check)="data">
          <div class="text-center">
            <p
              v-if="data.item.check != null"
              class="h1 mt-2"
            >
              <b-icon
                icon="exclamation-circle-fill"
                variant="success"
              ></b-icon>
            </p>

            <p
              v-else
              class="h1 mt-2"
            >
              <b-icon
                icon="exclamation-circle-fill"
                style="color: lightgray"
              ></b-icon>
            </p>
          </div>
        </template>

        <template #cell(imagen)="data">
          <div class="d-flex">
            <div class="floatme mr-2">
              <diseno-viewImage :id="data.item.id" />
            </div>
            <div class="floatme">
              <disenosse-uploadDisenoAprobado
                :item="data.item"
                @reload="loadAll()"
              />
            </div>
          </div>
        </template>

        <template #cell(empleado)="data">
          <div class="floatme">
            <disenosse-asignacionDisenadores
              :idorden="data.item.id"
              :item="data.item"
              :options="empleadosFiltered()"
            />
          </div>
        </template>

        <template #cell(vinculadas)="data">
                    <ordenes-vinculadas-v2 :id_orden="data.item.vinculadas" />
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
      empleados: [],
      empSelected: [],
      size: "md",
      title: `Abonos a la orden ${this.idorden}`,
      datax: [],
      fields: [
        {
          key: "id",
          label: "Orden",
        },
        {
          key: "first_name",
          label: "Cliente",
        },
        {
          key: "nombre_empleado",
          label: "Diseñador",
        },
        {
          key: "check",
          label: "Aprobado por el cliente",
          thClass: "text-center", // Aplicar clase al encabezado (th)
          tdClass: "text-center", // Aplicar clase a las celdas (td)
          trClass: "text-center", // Esto es opcional si quieres centrar las filas
        },
        {
          key: "tipo",
          label: "Tipo",
        },
        {
          key: "empleado",
          label: "Empleado",
        },
        /* {
                    key: "vinculadas",
                    label: "Vinculadas",
                }, */
        {
          key: "imagen",
          label: "Imagen",
        },
      ],
    };
  },

  computed: {
    dataTable() {
      return this.$store.state.disenos.disenos;
    },
  },

  methods: {
    empleadosFiltered() {
      let options = [];
      if (Array.isArray(this.$store.state.disenos.empleados)) {
        options = this.$store.state.disenos.empleados
          .map((el) => {
            return {
              value: el.id_usuario,
              text: `${el.nombre}`,
            };
          });
      }

      options.unshift({
        value: null,
        text: "Seleccione un diseñador",
      });
      return options;
    },
    ordenesFiltered(id_orden) {
      // return this.$store.state.disenos.disenos.items
      return this.$store.state.disenos.disenos.items.filter(
        (el) => el.id_orden == id_orden && el.empleado != "0"
      );
      /* .map((el) => {
                    const rand_id = this.generateRandomId()
                    return {
                        id: rand_id,
                        select: el.empleado,
                        input: 0,
                        idorden: el.id_orden,
                    }
                }) */
    },

    generateRandomId() {
      // Generar un número aleatorio entre 100000 y 9999999
      return Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
    },

    terminado(val) {
      let res;
      if (val === "0") {
        res = "No";
      } else {
        res = "Si";
      }
      return res;
    },

    async getEmpleados() {
      await this.$axios.get(`${this.$config.API}/empleados`).then((res) => {
        this.empleados = res.data.items;
      });
    },

    filterOrdenesAsignadas(id_orden) {
      return this.$store.state.disenos.disenos.items
        .filter((el) => el.empleado == id_orden)
        .map((el) => {
          return {
            value: el.empleado,
            text: el.nombre_empleado,
          };
        });
    },

    loadAll() {
      this.getEmpleados().then(() => {
        this.$store.dispatch("disenos/getDisenos").then(() => {
          let tmpOptions = this.empleados
            /* .filter(
              (el) =>
                el.departamento === "Diseño" ||
                el.departamento === "Jefe de diseño"
            ) */
            .map((el) => {
              return {
                value: el.id_usuario,
                text: el.nombre,
              };
            });
          this.optionsSelect = tmpOptions.concat({
            value: 0,
            text: "Sin asignar",
          });
          this.overlay = false;

          if (parseInt(this.$store.state.login.dataUser.acceso) === 1) {
            this.datax = this.dataTable.items;
          } else {
            this.datax = this.dataTable.items.filter(
              (item) =>
                item.responsable ===
                this.$store.state.login.dataUser.id_empleado
            );
          }

          console.log("items de diseÑo", this.datax);
        });
      });
    },
  },

  mounted() {
    this.loadAll();
  },
};
</script>
