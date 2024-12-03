<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
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
                :items="dataTable"
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
                <template #cell(moment)="data">
                    <span style="float: left; margin-left: 4px">
                        <b-button
                            variant="danger"
                            icon="ti-check"
                            @click="removeItem(data.index)"
                        >
                            <b-icon-trash></b-icon-trash>
                        </b-button>
                    </span>
                </template>
            </b-table>
        </b-overlay>
    </div>
</template>

<script>
import axios from "axios"
import { mapState, mapActions, mapGetters } from "vuex"

export default {
    data() {
        return {
            overlay: true,
            catagoriaInsumo: "corte",
            selected: null,
            insumos: [],
            options: [],
            dataTable: [],
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
                {
                    key: "moment",
                    label: "",
                    tdClass: "text-center pr-5",
                    thClass: "text-center pr-5",
                },
            ],
        }
    },

    computed: {
        ...mapState("empleados", ["dataTable2"]),
    },

    mounted() {
        this.getInsumos()
        if (this.dataTable2 === undefined) {
            this.dataTable = []
        } else {
            this.dataTable = this.dataTable2
        }

        // this.$store.dispatch('empleados/getDataInsumos')
    },

    methods: {
        // ...mapActions('empleados', ['updateOptions', 'updateDataTable2']),
        ...mapActions("empleados", ["updateDataTable2"]),

        sendDataTAble() {
            return this.dataTable
        },

        removeItem(index) {
            let xxx = this.dataTable.splice(index, 1)
            this.updateDataTable2(xxx)
        },

        reloadMe(index, val) {
            this.dataTable[index].cantidad = val
            // console.log('actualizar index', index)
            // console.log('con la cantidad', val)
            const tmp = {
                id: index,
                peso: val,
            }
            this.updateDataTable2(tmp)
            // this.$store.commit('empleados/updateDataTest', tmp)

            this.selected = null
            this.removeItem(index)
            this.getInsumos()
        },

        onSelect(val) {
            if (val) {
                console.log("ha seleccionado", val)
                let tmpItem = this.insumos.filter((el) => el._id == val)
                this.dataTable.push(tmpItem[0])
                // this.updateDataTable2(xxx)

                // PRUEBA GUARDAR DATOS EN VUEX
                // this.$store.dispatch('empleados/updateDataTest', this.dataTable)

                // this.$emit('reload', this.dataTable)
            }
        },

        async getInsumos() {
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/inventario/${this.catagoriaInsumo}`)
                .then((resp) => {
                    // this.$store.commit('empleados/setDataInsumos', resp.data)
                    this.insumos = resp.data.items
                    // this.$store.commit('empleados/setInsumos', resp.data.items)
                    this.options = resp.data.items.map((el) => {
                        return {
                            value: el._id,
                            text: `${el._id} - ${el.insumo}- ${el.cantidad} ${el.unidad}`,
                        }
                    })
                    // this.$store.dispatch('empleados/updateOptions', this.options)

                    this.options.unshift({
                        value: null,
                        text: "Seleccione un insumo",
                    })
                    //   this.options = resp.data
                    console.warn("recibimos de inventario", resp)
                    //   this.dataTable.push(resp.data.items[0])
                    // console.log('respuesta del insumo solicitado', resp.data)
                    return resp.data
                })
                .catch((err) => {
                    alert(err)
                })
                .finally(() => {
                    this.overlay = false
                })
        },
    },

    props: ["reload"],
}
</script>
