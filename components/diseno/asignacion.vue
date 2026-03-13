<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-row class="mb-3">
        <b-col md="6">
          <b-form-group label="Filtrar por Diseñador:" label-for="filter-designer">
            <b-form-select
              id="filter-designer"
              v-model="filterDesigner"
              :options="designerOptions"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col md="6">
          <b-form-group label="Filtrar por Vendedor:" label-for="filter-seller">
            <b-form-select
              id="filter-seller"
              v-model="filterSeller"
              :options="sellerOptions"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>

      <b-table
        ref="table"
        responsive
        small
        striped
        hover
        :items="filteredDatax"
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
      filterDesigner: null,
      filterSeller: null,
      fields: [
        {
          key: "id",
          label: "Orden",
          sortable: true,
        },
        {
          key: "first_name",
          label: "Cliente",
          sortable: true,
        },
        {
          key: "nombre_empleado",
          label: "Diseñador",
          sortable: true,
        },
        {
          key: "check",
          label: "Aprobado por el cliente",
          thClass: "text-center", // Aplicar clase al encabezado (th)
          tdClass: "text-center", // Aplicar clase a las celdas (td)
          trClass: "text-center", // Esto es opcional si quieres centrar las filas
          sortable: true,
        },
        {
          key: "tipo",
          label: "Tipo",
          sortable: true,
        },
        {
          key: "responsable_nombre",
          label: "Vendedor",
          sortable: true,
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
    filteredDatax() {
      if (!this.datax) return [];
      
      let data = this.datax.map(item => {
        let seller = this.empleados.find(emp => emp._id == item.responsable || emp.id_empleado == item.responsable || emp.id_usuario == item.responsable);
        return {
          ...item,
          responsable_nombre: seller ? seller.nombre : 'Desconocido',
        };
      });

      if (this.filterDesigner !== null && this.filterDesigner !== "0") {
        data = data.filter(item => item.empleado == this.filterDesigner);
      } else if (this.filterDesigner === "0") {
        data = data.filter(item => item.empleado == "0" || !item.empleado);
      }
      
      if (this.filterSeller !== null) {
        data = data.filter(item => item.responsable == this.filterSeller);
      }
      
      return data;
    },
    designerOptions() {
      if (!this.empleados) return [{ value: null, text: "-- Todos los diseñadores --" }];
      
      let options = this.empleados
        .filter(emp => {
          const depStr = emp.departamento ? String(emp.departamento).toLowerCase() : '';
          let isDiseño = depStr.includes('diseño') || depStr.includes('diseñador');
          if (Array.isArray(emp.departamentos)) {
             isDiseño = isDiseño || emp.departamentos.some(d => d.nombre && d.nombre.toLowerCase().includes('diseño'));
          }
          return isDiseño;
        })
        .map(emp => ({
          value: emp._id || emp.id_usuario,
          text: emp.nombre
        }));
      options.unshift({ value: "0", text: "Sin asignar" });
      options.unshift({ value: null, text: "-- Todos los diseñadores --" });
      return options;
    },
    sellerOptions() {
      if (!this.datax || this.datax.length === 0 || !this.empleados) {
        return [{ value: null, text: "-- Todos los vendedores --" }];
      }
      
      let uniqueResponsables = [...new Set(this.datax.map(item => item.responsable))];
      let options = uniqueResponsables
        .map(respId => {
          let emp = this.empleados.find(e => e._id == respId || e.id_empleado == respId || e.id_usuario == respId);
          if (emp) {
            return {
              value: respId,
              text: emp.nombre
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.text.localeCompare(b.text));
        
      options.unshift({ value: null, text: "-- Todos los vendedores --" });
      return options;
    }
  },

  methods: {
    empleadosFiltered() {
      let options = [];
      if (Array.isArray(this.$store.state.disenos.empleados)) {
        options = this.$store.state.disenos.empleados
          .map((el) => {
            return {
              value: el._id || el.id_usuario,
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
                value: el._id || el.id_usuario,
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
