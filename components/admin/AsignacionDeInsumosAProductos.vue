<template>
    <div>
        <b-button @click="showModal()" variant="primary">
            <b-icon icon="plus-lg"></b-icon> Insumos
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="xl">
            <b-overlay :show="overlay" spinner-small>
                <h3 class="mb-4 mt-4 pb-2">Producto: {{ item.name }}</h3>

                <b-tabs content-class="mt-3" lazy>
                    <b-tab
                        :title="dep.departamento"
                        v-for="(dep, index) in filterDeps"
                        :key="index"
                        @click="loadDataTab(dep._id)"
                    >
                        <b-alert v-if="showDom === false" show variant="info"
                            ><a href="#" class="alert-link"
                                >Seleccione un departamento</a
                            ></b-alert
                        >
                        <div v-else>
                            <admin-AsignacionDeInsumosAProductosTab
                                :key="dep.id_product_insumos_asignados"
                                :form="form"
                                :item="dep"
                                :idprod="item.cod"
                                :iddep="dep._id"
                                :tiemposprod="tiemposprod"
                                :insumosasignados="filteredInsumos[dep._id]"
                                :selectinsumos="selectinsumos"
                                @reload="loadDataTab(dep._id)"
                            />
                            <!-- <pre class="force" style="background-color: red">
                                    filterInsumosAsignados(1)::: {{
                                        filterInsumosAsignados('1')
                                    }}
                                    <hr>
                                    {{ insumosasignados }}
                                </pre> -->
                        </div>
                    </b-tab>
                </b-tabs>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            misInsumos: [],
            showDom: false,
            filteredInsumos: {},
            title: `Asignación De Insumos`,
            overlay: false,
            form: {},
        };
    },

    computed: {
        filterDeps() {
            return this.departamentos.filter(
                (dep) => dep.asignar_numero_de_paso > 0
            );
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },
    },

    watch: {
        form() {
            console.log("form actualziado", this.form);
        },
    },

    methods: {
        /* filterInsumosAsignados(idDepartamento) {
            // return idDepartamento;
            this.misInsumos = this.insumosasignados.filter(
                (insumo) =>
                    parseInt(insumo.id_departamento) ===
                    parseInt(idDepartamento)
            );
        }, */

        filterInsumosAsignados(idDepartamento) {
            return this.insumosasignados.filter(
                (insumo) =>
                    parseInt(insumo.id_departamento) ===
                    parseInt(idDepartamento)
            );
        },
        loadDataTab(idDepartamento) {
            this.filteredInsumos[idDepartamento] =
                this.filterInsumosAsignados(idDepartamento);
            this.$emit("reload");
            this.showDom = true;
        },

        /* loadDataTab() {
            this.$emit("reload");
        }, */

        showModal() {
            this.$bvModal.show(this.modal);
        },

        relodMe() {
            this.$emit("reload");
        },

        closeModal() {
            this.$bvModal.hide(this.modal);
        },
    },

    mounted() {
        this.filterInsumosAsignados(this.item._id);
        // PREPARAR FORMULARIO
        this.filterDeps.forEach((dep) => {
            this.form[dep._id] = [];
        });
    },

    props: [
        "insumosasignados",
        "tiemposprod",
        "departamentos",
        "selectinsumos",
        "item",
        "idprod",
        "nomdep",
        "reload",
    ],
};
</script>
