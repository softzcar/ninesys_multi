<template>
  <div>
    <b-overlay
      class="floatme"
      :show="overlay"
      spinner-small
    >
      <div class="my-private-input floatme">
        <b-form-input
          type="number"
          step="0.1"
          v-model="value"
        ></b-form-input>
      </div>
      <div class="floatme ml-2">
        <b-button
          class="floatme"
          variant="success"
          @click="updateCantidad"
        ><b-icon-check-lg></b-icon-check-lg></b-button>
      </div>
      <div class="floatme ml-2">
        <b-form-checkbox-group
          button-variant="success"
          v-model="selectedOrdnes"
          :options="ordenesCheck"
          stacked
          name="buttons-1"
          buttons
        ></b-form-checkbox-group>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      value: null,
      idInsumo: this.item._id,
      overlay: false,
      selectedOrdnes: [],
    };
  },

  mounted() {
    if (this.tipo === "final") {
      this.value = 0;
    } else {
      this.value = this.item.cantidad;
    }
  },

  computed: {
    ordenesCheck() {
      return this.$store.state.empleados.ordenesAsignadas.map((item) => {
        return {
          text: item.id_orden,
          value: item.id_orden,
        };
      });
    },

    ordenes() {
      return this.$store.state.empleados.ordenesAsignadas;
    },
  },

  methods: {
    async updateCantidad() {
      //  verificar si hay ordenes seleccionadas
      if (!this.selectedOrdnes.length) {
        this.$fire({
          title: "Ordenes",
          html: `<p>Debe seleccionar las ordenes asignadas al insumo</p>`,
          type: "warning",
        });
      } else {
        await this.$confirm(
          `¿Desea cambiar el peso del insumo a ${this.value} Kg y asignarlo a las ordenes ${this.selectedOrdnes}?`,
          "Insumos",
          "question"
        )
          .then(() => {
            this.postOrdenes();
          })
          .catch(() => {
            this.value = 0;
            return false;
          });
      }
    },

    // ORDENES
    saveOrden() {
      alert("save orden");
    },

    async postOrdenes() {
      this.overlay = true;
      console.log("postOrdenes() -> vamos");
      const data = new URLSearchParams();
      data.set("ordenes", this.selectedOrdnes);
      // data.set(this.item)
      data.set("cantidad_inicial", this.item.cantidad);
      data.set("cantidad_final", this.value);
      data.set("id_insumo", this.item._id);
      data.set("id_orden", 0);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("departamento", this.$store.state.login.dataUser.departamento);
      await this.$axios
        .post(`${this.$config.API}/inventario-movimientos/update-insumo`, data)
        .then((res) => {
          this.overlay = false;
          this.$emit("reload", this.index, this.value);
        })
        .catch((err) => {
          this.$fire({
            title: "Error actualizando cantiad del insumo",
            html: `<p>${err}</p>`,
            type: "danger",
          });
          this.overlay = false;
        })
        .finally(() => {
          this.overlay = false;
          console.log("vamos a enviar reload al padre!!!!");
        });
    },
  },

  props: ["item", "index", "reload", "tipo"],
};
</script>

<style scoped>
.my-private-input {
  margin: 0 auto;
  width: 100px !important;
}
</style>
