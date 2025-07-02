<template>
  <div>
    <b-overlay :show="overlay" spinner-small>
      <div class="mb-2" v-if="asignado">
        <b-alert variant="info" show>Insumo Creado {{ attributeText }}</b-alert>
      </div>
      <b-form>
        <b-form-group id="input-group-0">
          <b-button
            @click="$bvModal.show(modal)"
            id="add-insumo"
            variant="info"
            class="mt-4"
          >
            <b-icon icon="plus-lg" size="sm"></b-icon> Nuevo insumo
          </b-button>
          <b-popover target="add-insumo" triggers="hover" placement="top">
            <template #title>Crear nuevo insumo</template>
          </b-popover>
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Seleccione un insumo"
          label-for="select-insumo"
          description="Seleccione un insumo"
        >
          <b-form-select
            id="select-insumo"
            :disabled="inputDisabled"
            v-model="insumo"
            :options="selectinsumos"
            :value="insumo"
          ></b-form-select>
        </b-form-group>

        <b-form-group
          id="input-group-2"
          label="Cantidad"
          label-for="input-cantidad"
          description="Indique la cantidad consumida"
        >
          <b-form-input
            id="input-cantidad"
            type="number"
            v-model="cantidad"
            :disabled="inputDisabled"
          />
        </b-form-group>

        <b-form-group
          id="input-group-talla"
          label="Talla:"
          label-for="talla-input"
          description="Seleccione la talla"
        >
          <b-form-select
            v-model="miTalla"
            :options="selecttallas"
          ></b-form-select>
        </b-form-group>

        <b-form-group
          id="input-group-3"
          label="Unidad de medida"
          label-for="select-unidad"
          description="Seleccione la unidad de medida"
        >
          <b-form-select
            v-model="unidadDeMedida"
            :options="optionsUnidad"
          ></b-form-select>
        </b-form-group>

        <b-button
          :disabled="inputDisabled"
          variant="success"
          @click="asignarInsumoAProducto()"
          size="lg"
        >
          Asignar
        </b-button>
      </b-form>

      <!-- <pre class="force" style="background-color: red">
                {{ clacTimeProduction }}
                <hr>
                {{ $props }}
            </pre> -->

      <b-modal
        :id="modal"
        ref="modalCaptura"
        title="Crear nuevo insumo"
        @ok="crearInsumo"
        @cancel="clearInput"
      >
        <b-form-input
          v-model="nuevoInsumo"
          placeholder="Nombre del insumo"
        ></b-form-input>
      </b-modal>
    </b-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nuevoInsumo: "",
      cantidad: 0,
      insumo: null,
      talla: null,
      miTalla: null,
      unidadDeMedida: null,
      optionsUnidad: [
        { value: null, text: "Seleccione una opción" },
        { value: "Kg", text: "Kilos" },
        { value: "Mt", text: "Metros" },
        { value: "Und", text: "Unidades" },
        { value: "Ml", text: "Mililitros" },
        { value: "Lt", text: "Litros" },
        { value: "Gr", text: "Gramos" },
        { value: "Cm", text: "Centímetros" },
      ],
      attributeText: "",
      asignado: false,
      inputDisabled: false,
      overlay: false,
    };
  },

  watch: {
    miTalla(val) {
      console.log("mi talla es", val);
    },
    insumo(val) {
      console.log("mi talla es", val);
    },
  },

  computed: {
    modal: function () {
      const rand = Math.random().toString(36).substring(2, 7);
      return `${this.id}-modal-${rand}`;
    },

    dataSave() {
      return {
        id: this.item.cod,
      };
    },
  },

  methods: {
    clearInput() {
      this.nuevoInsumo = "";
    },

    validarFormatoHHMM(texto) {
      // Expresión regular para el formato HH:MM
      const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

      // Verificar si el texto coincide con la expresión regular
      if (regex.test(texto)) {
        return true; // El formato es válido
      } else {
        return false; // El formato no es válido
      }
    },

    async crearInsumo() {
      let msg = "";

      if (this.insumo === null) {
        msg += `<li>Seleccione un tipo de insumo</li>`;
      }

      if (!this.nuevoInsumo || this.nuevoInsumo.trim() === "") {
        msg += `<p>Ingrese el nombre del insumo</p>`;
        this.$fire({
          title: "Dato Requerido",
          html: msg,
          type: "warning",
        });
      } else {
        this.overlay = true;

        const data = new URLSearchParams();
        data.set("id_departamento", this.iddep);
        data.set("insumo", this.nuevoInsumo);
        data.set("id_product", this.idprod);

        await this.$axios
          .post(`${this.$config.API}/catalogo-insumos-productos`, data)
          .then((res) => {
            this.$fire({
              title: "Nuevo Insumo",
              html: `<p>el insumo "${this.nuevoInsumo}" se ha creado correctamente</p>`,
              type: "success",
            });
            this.$emit("reload", true);
          })
          .catch((err) => {
            this.$fire({
              title: "Error",
              html: `<p>No se pudo crear el insumo</p><p>${err}</p>`,
              type: "error",
            });
          })
          .finally(() => {
            this.nuevoInsumo = "";
            this.overlay = false;
          });
      }
    },

    async asignarInsumoAProducto() {
      let ok = true;
      let msg = "";

      if (this.insumo === null) {
        ok = false;
        msg += `<p>Seleccione un tipo de insumo</p>`;
      }

      if (this.cantidad <= 0) {
        ok = false;
        msg += `<p>Indique la cantidad del insumo</p>`;
      }

      if (this.unidadDeMedida === null) {
        ok = false;
        msg += `<p>Indique la unidad de medida del insumo</p>`;
      }

      if (!ok) {
        this.$fire({
          title: "Dato Requerido",
          html: msg,
          type: "warning",
        });
      } else {
        this.overlay = true;

        const data = new URLSearchParams();
        data.set("insumo", this.insumo);
        data.set("departamento", this.iddep);
        data.set("cantidad", this.cantidad);
        data.set("unidad", this.unidadDeMedida);
        data.set("id_size", this.miTalla);
        data.set("id_product", this.idprod);

        await this.$axios
          .post(`${this.$config.API}/insumos-productos`, data)
          .then((res) => {
            this.$fire({
              title: "Nuevo Insumo",
              html: `<p>el insumo se ha creado correctamente</p>`,
              type: "success",
            });
            this.$emit("reload", true);
          })
          .catch((err) => {
            this.$fire({
              title: "Error",
              html: `<p>No se pudo crear el insumo</p><p>${err}</p>`,
              type: "error",
            });
          })
          .finally(() => {
            this.nuevoInsumo = "";
            this.overlay = false;
          });
      }
    },

    asignarAtributo() {
      this.asignado = true;
      this.inputDisabled = true;
    },

    saveChange() {
      this.overlay = true;

      let ok = true;
      let msg = "";

      if (this.attributeText.trim() === "") {
        ok = false;
        msg += "<p>Debe indicar el valor del atributo</p>";
      }

      if (this.attribute === null) {
        ok = false;
        msg += "<p>Debe Seleccionar un atributo</p>";
      }

      if (ok) {
        this.$emit("reload", this.dataSave);
        this.asignarAtributo();
        alert(
          "todo OK vamos a guardar el registro en el formularieo para enviarlo posteriormente"
        );
      } else {
        this.$fire({
          title: "Datos requeridos",
          html: msg,
          type: "warning",
        });
      }
      this.overlay = false;
    },
  },

  props: [
    "iddep",
    "idprod",
    "selectinsumos",
    "item",
    "selecttallas",
    "index",
    "tiemposprod",
    "reload",
  ],
};
</script>
