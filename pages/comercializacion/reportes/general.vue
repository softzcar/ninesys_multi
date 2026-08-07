<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    accessModule.accessData.id_modulo === 2 ||
                    accessModule.accessData.id_modulo === 1
                "
            >
                <b-container>
                    <b-row>
                        <b-col>
                            <h1 class="mb-4">{{ titulo }}</h1>

                            <h5 class="mb-2">Filtrar por estatus de orden:</h5>
                            <b-form-radio-group
                                id="btn-radios-status"
                                v-model="selectedStatus"
                                :options="optionsStatus"
                                button-variant="outline-primary"
                                size="lg"
                                name="radio-btn-status"
                                class="mb-4"
                                buttons
                            ></b-form-radio-group>

                            <b-overlay :show="overlay" spinner-small>
                                <b-table
                                    ref="table"
                                    responsive
                                    small
                                    striped
                                    hover
                                    :items="filteredItems"
                                    :fields="fields"
                                >
                                    <template #cell(_id)="data">
                                        <linkSearch :id="data.item._id" />
                                    </template>

                                    <template #cell(vinculada)="data">
                                        <div
                                            v-for="(
                                                item, index
                                            ) in vinculadas"
                                            v-bind:key="index"
                                        >
                                            <div
                                                v-if="
                                                    item.id_father ===
                                                    data.item._id
                                                "
                                            >
                                                <span class="floatme">
                                                    <linkSearch
                                                        :id="item.id_child"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </template>
                                </b-table>
                            </b-overlay>
                        </b-col>
                    </b-row>
                </b-container>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import mixin from "~/mixins/mixin-login.js";


export default {
    mixins: [mixin],

    data() {
        return {
            overlay: true,
            titulo: "Reporte General de ordenes",
            allItems: [],
            vinculadas: [],
            fields: [],
            selectedStatus: "todas",
            optionsStatus: [],
        }
    },

    computed: {
        ...mapState("login", ["dataUser", "access"]),

        filteredItems() {
            if (this.selectedStatus === "todas") {
                return this.allItems
            }
            return this.allItems.filter(
                (item) => item.status === this.selectedStatus
            )
        },
    },

    methods: {
        generateStatusOptions() {
            const uniqueStatuses = new Set()
            this.allItems.forEach((item) => {
                if (item.status) {
                    uniqueStatuses.add(item.status.trim())
                }
            })

            const statusOptions = [...uniqueStatuses]
                .sort((a, b) => a.localeCompare(b))
                .map((status) => ({ text: status, value: status }))

            this.optionsStatus = [
                { text: "Todas", value: "todas" },
                ...statusOptions,
            ]
        },

        async getOrdenes() {
            console.log("vamos a cargar las ordenes")
            this.overlay = true
            await this.$axios
                .get(`${this.$config.API}/comercializacion/ordenes/reporte`)
                .then((resp) => {
                    this.allItems = resp.data.items
                    this.vinculadas = resp.data.vinculadas
                    this.fields = resp.data.fields.map((field) => ({
                        ...field,
                        sortable: field.key !== "vinculada",
                    }))
                    this.generateStatusOptions()
                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getOrdenes()
    },
}
</script>
