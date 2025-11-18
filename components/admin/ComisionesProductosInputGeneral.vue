<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-row>
        <b-col>
          <b-form-input
            :id="idInput"
            style="width: 100px"
            type="number"
            min="0"
            step="0.01"
            :value="comision"
            :disabled="inputDisabled"
            @change="notificarCambio"
          />
        </b-col>
      </b-row>
    </b-overlay>
  </div>
</template>

<script>
import mixin from "~/mixins/mixins.js";

export default {
  mixins: [mixin],

  data() {
    return {
      idInput: null,
      comision: 0,
      departamento: null,
      idProducto: 0,
      overlay: false,
      inputDisabled: false,
    };
  },

  watch: {
    iddep(val) {
      this.iddepChacker(val);
    },
  },

  methods: {
    notificarCambio(newValue) {
      // Emitimos un objeto con todo lo que el padre necesita saber
      this.$emit('update-comision', {
        id_producto: this.item.cod,
        comision: parseFloat(newValue), // Asegurarse de que sea un número
      })
    },

    iddepChacker(val) {
      if (!val || val === null || val < 1) {
        this.inputDisabled = true;
        this.comision = 0;
      } else {
        this.inputDisabled = false;
      }

      const idExist = this.item.comisiones.find(
        (el) => el.id_departamento === val
      );
      console.log("idExist", idExist);

      if (idExist === undefined) {
        // Buscar el nombre del departamento seleccionado
        const depSeleccionado = this.seldep.find(dep => dep.value === val);
        const esDiseno = depSeleccionado && depSeleccionado.text === "Diseño";
        // Solo usar la comisión general si es producto de diseño y departamento es Diseño
        if (this.item.es_diseno === 1 && esDiseno) {
          this.comision = parseFloat(this.item.comision) || 0;
        } else {
          this.comision = 0;
        }
      } else {
        this.comision = idExist.comision;
      }
    },
  },

  mounted() {
    this.idInput = this.token();
    this.iddepChacker(this.iddep);
    /* this.comisionEmpleado = parseFloat(this.comision)
        if (this.lock != null) {
            this.inputDisabled = true
        }
        this.idInput = this.token()
        this.idProducto = parseInt(this.idprod)
        // obtener comision:
        if (this.attributes[0] != undefined) {
            this.comision = this.attributes[0].options[0]
        }
        this.overlay = false */
  },

  props: ["item", "seldep", "iddep"],
  /* props: [
        "idprod",
        "attributes",
        "categories",
        "reloadme",
        "lock",
        "departamento",
        "comisionEmp",
        "comisionprod",
    ], */
};
</script>

<style lang="scss" scoped></style>
