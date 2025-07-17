<template>
  <div>
    <b-overlay
      :show="overlay"
      spinner-small
    >
      <b-form-select
        v-model="selected"
        :options="options"
        size="sm"
        class="mt-4 mb-4"
        @input="onSelect"
      ></b-form-select>

      <b-table
        responsive
        class="mt-4"
        striped
        small
        :fields="fields"
        :items="dataTable2"
      >
        <template #cell(cantidad)="data">
          {{ data.item.cantidad }} {{ data.item.unidad }}
        </template>

        <template #cell(cantidad_final)="data">
          <empleados-AsignacionDeTelasInput
            :item="data.item"
            :index="data.index"
            @reload="reloadMe"
            tipo="final"
          />
        </template>
      </b-table>
    </b-overlay>
  </div>
</template>

<script>
import axios from "axios";
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      overlay: true,
      catagoriaInsumo: "corte",
      selected: null,
      insumos: [],
      options: [],
      fields: [
        {
          key: "_id",
          label: "ID",
          tdClass: "text-center pt-2",
        },
        {
          key: "insumo",
          label: "Insumo",
          tdClass: "pl-4 pt-2",
        },
        {
          key: "cantidad",
          label: "Peso Actual",
          tdClass: "pl-4 pt-2",
        },
        {
          key: "cantidad_final",
          label: "Peso Final",
          tdClass: "text-center pr-5",
          thClass: "text-center pr-5",
        },
        /*{
        key: 'moment',
        label: 'Acciones',
        tdClass: 'text-center pr-5',
        thClass: 'text-center pr-5',
      },*/
      ],
    };
  },

  computed: {
    ...mapState("empleados", ["dataTable2"]),
  },

  mounted() {
    this.getInsumos();
    // this.$store.dispatch('empleados/getDataInsumos')
  },

  methods: {
    // ...mapActions('empleados', ['updateOptions', 'updateDataTable2']),
    ...mapActions("empleados", [
      "updateDataTable2",
      "pushDataTable2Acc",
      "spliceDataTable22Acc",
    ]),

    sendDataTAble() {
      return this.dataTable2;
    },

    removeItem(index) {
      this.spliceDataTable22Acc(index);
      // let xxx = this.dataTable2.splice(index, 1)
      // this.updateDataTable2(xxx)
    },

    reloadMe(index, val) {
      // this.dataTable2[index].cantidad = val
      console.log("actualizar index", index);
      console.log("con la cantidad", val);
      const tmp = {
        id: index,
        peso: val,
      };
      // this.updateDataTable2(tmp)
      // this.$store.commit('empleados/updateDataTest', tmp)

      this.selected = null;
      this.removeItem(index);
      this.getInsumos();
    },

    async getInfo() {
      await this.$axios
        .get(`${this.$config.API}/insumos/${this.selected}`)
        .then((resp) => {
          this.dataTable.push(resp.data.items[0]);
          // console.log('respuesta del insumo solicitado', resp.data)
          return resp.data;
        });
    },

    onSelect(val) {
      if (val) {
        let tmpItem = this.insumos.filter((el) => el._id == val);
        this.pushDataTable2Acc(tmpItem[0]);
        // let xxx = this.dataTable2
        // console.log('xxx:', xxx)
        // xxx = xxx.push(tmpItem[0])
      }
    },

    async getInsumos() {
      this.overlay = true;
      await this.$axios
        .get(`${this.$config.API}/inventario/${this.catagoriaInsumo}`)
        .then((resp) => {
          // this.$store.commit('empleados/setDataInsumos', resp.data)
          this.insumos = resp.data.items;
          // this.$store.commit('empleados/setInsumos', resp.data.items)
          this.options = resp.data.items.map((el) => {
            return {
              value: el._id,
              text: `${el._id} - ${el.insumo}- ${el.cantidad} ${el.unidad}`,
            };
          });
          // this.$store.dispatch('empleados/updateOptions', this.options)

          this.options.unshift({
            value: null,
            text: "Seleccione un insumo",
          });
          //   this.options = resp.data
          console.warn("recibimos de inventario", resp);
          // console.log('respuesta del insumo solicitado', resp.data)
          return resp.data;
        })
        .catch((err) => {
          consloe.log(err);
        })
        .finally(() => {
          this.overlay = false;
        });
    },
  },

  props: ["datos", "reload"],
};
</script>
