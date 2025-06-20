<template>
  <div>
    <!-- <pre style="background-color: pink">
      {{ empleados }}
    </pre> -->
    <b-overlay :overlay="overlay" spinner-small>
      <div v-if="hideMe" class="floatme">
        <b-button :variant="myVariant" @click="$bvModal.show(modal)">
          <b-icon icon="skip-backward-fill"></b-icon>
        </b-button>
      </div>

      <div class="floatme">
        <produccionsse-reposicionChecker
          ref="repoControl"
          style="margin-top: 6px"
          :showControl="showControl"
          :item="item"
        />
      </div>
    </b-overlay>

    <b-modal :size="size" :title="title" :id="modal" hide-footer>
      <b-overlay :overlay="overlay" spinner-small>
        <b-container>
          <b-row>
            <b-col xl="12" lg="12" md="12" sm="12">
              <b-list-group style="margin: 20px 0">
                <b-list-group-item
                  ><strong class="mb-4">{{
                    item.item.Producto
                  }}</strong></b-list-group-item
                >
                <b-list-group-item
                  ><strong class="mb-4">Talla:</strong>
                  {{ item.item.Talla }}</b-list-group-item
                >
                <b-list-group-item
                  ><strong class="mb-4">Corte:</strong>
                  {{ item.item.Corte }}</b-list-group-item
                >
                <b-list-group-item
                  ><strong class="mb-4">Tela:</strong>
                  {{ item.item.Tela }}</b-list-group-item
                >
              </b-list-group>

              <b-form @submit="onSubmit">
                <b-form-group
                  id="input-group-1"
                  label="Cantidad:"
                  label-for="input-1"
                  description="Cantidad de piezas a reponer. ccc"
                >
                  <b-form-input
                    style="width: 90px"
                    id="input-1"
                    step="1"
                    min="0"
                    v-model="form.cantidad"
                    type="number"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group
                  id="input-group-2"
                  label="Empleado:"
                  label-for="select-empleado"
                  description="Empleado involucrado en la reposición."
                >
                  <b-form-select
                    id="select-empleado"
                    v-model="emp"
                    :options="selectEmpleados"
                    :value="emp"
                  ></b-form-select>
                </b-form-group>

                <!-- Nuevo Selector de Departamento -->
                <b-form-group
                  v-if="
                    emp && emp !== 0 && selectedEmployeeDepartments.length > 0
                  "
                  id="input-group-departamento-reposicion-form"
                  label="Departamento del Empleado:"
                  label-for="select-departamento-reposicion-form"
                  description="Departamento del empleado para la reposición."
                >
                  <b-form-select
                    id="select-departamento-reposicion-form"
                    v-model="form.id_departamento"
                    :options="selectDepartmentOptions"
                  ></b-form-select>
                </b-form-group>

                <b-form-group
                  id="input-group-2"
                  label="Detalle:"
                  label-for="input-2"
                  description="Describa el motivo de la reposición."
                >
                  <b-form-textarea
                    id="textarea"
                    v-model="form.detalle"
                    no-auto-shrink
                    size="sm"
                    no-resize
                    rows="3"
                    max-rows="20"
                  >
                  </b-form-textarea>
                </b-form-group>

                <b-button type="submit" variant="primary"
                  >Reponer Piezas</b-button
                >
              </b-form>
            </b-col>
          </b-row>
        </b-container>
      </b-overlay>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      size: "md",
      title: "Detalles de la reposición",
      overlay: false,
      myVariant: "warning",
      repos: null,
      emp: 0,
      hideMe: false,
      form: {
        id_departamento: null, // Nuevo para el departamento seleccionado
        cantidad: 0,
        detalle: "",
      },
      selectedEmployeeDepartments: [], // Nuevo para almacenar departamentos del empleado
    };
  },

  computed: {
    showControl: function () {
      let showMe;
      if (this.myVariant === "success") {
        showMe = true;
        this.hideMe = false;
      } else {
        showMe = false;
        this.hideMe = true;
      }
      return showMe;
    },

    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `modal-${rand}`;
    },

    selectEmpleados() {
      let tmp = this.empleados.map((item) => {
        return {
          value: item._id,
          text: item.nombre,
        };
      });

      tmp.unshift({ value: 0, text: "Seleccione un empleado" });

      return tmp;
    },

    selectDepartmentOptions() {
      if (
        !this.selectedEmployeeDepartments ||
        this.selectedEmployeeDepartments.length === 0
      ) {
        return [{ value: null, text: "Seleccione un departamento" }];
      }
      let options = this.selectedEmployeeDepartments.map((dep) => ({
        value: dep.id_departamento || dep.id,
        text: dep.departamento || dep.nombre_departamento || dep.nombre,
      }));
      options.unshift({ value: null, text: "Seleccione un departamento" });
      return options;
    },
  },

  methods: {
    async getRepositions() {
      await this.$axios
        .get(
          `${this.$config.API}/reposiciones/${this.item.item.Reponer}/${this.item.item.Orden}`
        )
        .then((res) => {
          this.repos = res.data.data;
        });
    },

    async fetchEmployeeDepartments(employeeId) {
      if (!employeeId || employeeId === 0) {
        this.selectedEmployeeDepartments = [];
        this.form.id_departamento = null;
        return;
      }
      this.overlay = true;
      try {
        const response = await this.$axios.get(
          `${this.$config.API}/departamentos-empleado/${employeeId}`
        );
        this.selectedEmployeeDepartments = response.data || [];
        this.form.id_departamento = null;
      } catch (error) {
        console.error("Error fetching employee departments:", error);
        this.selectedEmployeeDepartments = [];
        this.form.id_departamento = null;
        this.$fire({
          title: "Error",
          html: "<p>No se pudieron cargar los departamentos del empleado.</p>",
          type: "warning",
        });
      } finally {
        this.overlay = false;
      }
    },

    onSubmit(event) {
      event.preventDefault();
      this.validateForm();
    },

    validateForm() {
      let valido = true;
      let msg = "";

      if (parseInt(this.form.cantidad) === 0) {
        valido = false;
        msg = msg + "<p>Ingrese la cantidad de piezas a reponer</p>";
      }

      if (!this.form.detalle.trim()) {
        valido = false;
        msg = msg + "<p>Escriba el detalle de la reposición</p>";
      }

      if (!parseInt(this.emp)) {
        valido = false;
        msg =
          msg + "<p>Seleccione el empleado involucrado en la reposición</p>";
      }

      // Validar departamento si un empleado está seleccionado y tiene departamentos cargados
      if (
        this.emp &&
        this.emp !== 0 &&
        this.selectedEmployeeDepartments.length > 0 &&
        !this.form.id_departamento
      ) {
        valido = false;
        msg += "<p>Seleccione un departamento para el empleado.</p>";
      }

      if (valido) {
        this.createReposicion().then(() => {
          // this.$refs.repoControl.setReload(true)
        });
      } else {
        this.$fire({
          type: "error",
          title: "Se requeiren datos",
          html: msg,
        });
      }
    },

    clearForm() {
      this.form = {
        cantidad: 0,
        detalle: "",
        id_departamento: null,
      };
      this.emp = 0;
      this.selectedEmployeeDepartments = [];
    },

    async createReposicion() {
      this.overlay = true;
      const data = new URLSearchParams();
      data.set("id_ordenes_productos", this.item.item.Reponer);
      data.set("id_orden", this.item.item.Orden);
      data.set("cantidad", this.form.cantidad);
      data.set("detalle", this.form.detalle);
      if (this.emp && this.emp !== 0) {
        data.set("id_empleado", this.emp); // Empleado asignado a la tarea de reposición
      }
      data.set(
        "id_empleado_emisor",
        this.$store.state.login.dataUser.id_empleado
      );
      data.set(
        "id_departamento_solicitante", // Renombrado
        this.$store.state.login.currentDepartamentId
      );
      if (this.form.id_departamento) {
        data.set("id_departamento", this.form.id_departamento);
      }

      await this.$axios
        .post(`${this.$config.API}/produccion/reposicion`, data)
        .then((res) => {
          this.clearForm();
          this.$fire({
            title: "Reposición",
            html: `<p>La reposición se ha creado correctamente.</p>`,
            type: "success",
          }).then(() => {
            this.$emit("reload_this");
            this.getRepositions().then(() => {
              if (this.repos.length) {
                this.myVariant = "success";
              }
              this.clearForm();
              this.$bvModal.hide(this.modal);
            });
          });
        })
        .catch((err) => {
          this.$fire({
            title: "Error en la reposición",
            html: `<p>${err}</p>`,
            type: "danger",
          });
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  watch: {
    emp: function (newEmpId, oldEmpId) {
      this.form.id_departamento = null;
      this.selectedEmployeeDepartments = [];
      if (newEmpId && newEmpId !== 0) {
        this.fetchEmployeeDepartments(newEmpId);
      }
    },
  },

  props: ["item", "departamento", "empleados", "reload_this"],

  mounted() {
    /* this.overlay = true
    this.getRepositions().then(() => {
      if (this.repos.length) {
        this.myVariant = 'success'
      }
      this.getEmpleados().then(() => (this.overlay = false))
    }) */
  },
};
</script>

<style>
.float-button {
  width: 100%;
  float: left;
  margin-bottom: 40px;
  margin-top: 1rem;
}

.image img {
  width: auto;
}
</style>
