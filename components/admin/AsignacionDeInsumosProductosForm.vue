<template>
  <div>
    <b-overlay
      spinner-small
    >
      <b-form>
        

        <b-form-group
          id="input-group-1"
          label="Seleccione un insumo"
          label-for="select-insumo"
          description="Seleccione un insumo"
        >
          <b-form-select
            id="select-insumo"
            v-model="item.insumo"
            :options="selectinsumos"
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
            v-model="item.cantidad"
          />
        </b-form-group>

        <b-form-group
          id="input-group-talla"
          label="Talla:"
          label-for="talla-input"
          description="Seleccione la talla"
        >
          <b-form-select
            v-model="item.miTalla"
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
            v-model="item.unidadDeMedida"
            :options="optionsUnidad"
          ></b-form-select>
        </b-form-group>

        
      </b-form>
      
    </b-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
    };
  },

  computed: {
    dataSave() {
      return {
        id: this.item.cod,
      };
    },
  },

  methods: {
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
