<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div
                v-if="
                    dataUser.departamento === 'Administración' ||
                    dataUser.departamento === 'Comercialización'
                "
            >
                <b-overlay :show="overlay" spinner-small>
                    <b-container
                        fluid
                        v-if="
                            dataUser.departamento === 'Administración' ||
                            dataUser.departamento === 'Comercialización'
                        "
                    >
                        <b-row>
                            <pre> tmpDelete{{ tmpDelete }}</pre>
                            <b-col offset-lg="8" offset-xl="8">
                                <b-input-group class="mb-4" size="sm">
                                    <b-form-input
                                        id="filter-input"
                                        v-model="filter"
                                        type="search"
                                        placeholder="Filtrar Resultados"
                                    ></b-form-input>

                                    <b-input-group-append>
                                        <b-button
                                            :disabled="!filter"
                                            @click="filter = ''"
                                        >
                                            Limpiar
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <customers-CustomerNuevo
                                    @reload="getCustomers"
                                />
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-pagination
                                    v-model="currentPage"
                                    :total-rows="totalRows"
                                    :per-page="perPage"
                                ></b-pagination>

                                <p class="mt-3">
                                    Página actual: {{ currentPage }}
                                </p>
                                <b-table
                                    :per-page="perPage"
                                    :current-page="currentPage"
                                    @filtered="onFiltered"
                                    :filter="filter"
                                    ref="table"
                                    small
                                    striped
                                    hover
                                    :items="dataTable"
                                    :fields="fields"
                                    :filter-included-fields="includedFields"
                                >
                                    <template #cell(id)="data">
                                        <span class="floatme">
                                            <customers-CustomerEditar
                                                @reload="getCustomers"
                                                :item="data.item"
                                                :key="data.item.id"
                                            />
                                        </span>
                                        <span
                                            v-if="
                                                dataUser.departamento ===
                                                'Administración'
                                            "
                                            class="floatme"
                                        >
                                            <b-button
                                                variant="danger"
                                                v-on:click="
                                                    deleteCustomer(
                                                        data.item.id,
                                                        data.item.first_name,
                                                        data.item.last_name,
                                                        data.item.email
                                                    )
                                                "
                                                ><b-icon icon="trash"></b-icon>
                                            </b-button>
                                        </span>
                                    </template>

                                    <template #cell(first_name)="data">
                                        {{ data.item.first_name }}
                                        {{ data.item.last_name }}
                                    </template>

                                    <template #cell(cedula)="data">
                                        {{ checkCedula(data.item.cedula) }}
                                    </template>

                                    <template #cell(email)="data">
                                        {{ checkEmail(data.item.email) }}
                                    </template>

                                    <!-- <template #cell(address)="data">
                    {{ data.item }}
                    {{ data.item       }}
                  </template> -->
                                </b-table>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
import axios from "axios"
import { log } from "console"

export default {
    data() {
        return {
            includedFields: ["orden"],
            filter: null,
            ordenesLength: 0,
            perPage: 25,
            currentPage: 1,
            titulo: "Gestión de Clientes",
            overlay: true,
            dataTable: [],
            tmpDelete: null,
            fields: [
                {
                    key: "id",
                    label: "",
                    tdClass: "pl-4",
                },
                {
                    key: "first_name",
                    label: "Cliente",
                    tdClass: "pl-4",
                    sortable: true,
                },
                {
                    key: "cedula",
                    label: "Cédula / RIF",
                    sortable: true,
                },
                {
                    key: "email",
                    label: "Email",
                    sortable: true,
                },
                {
                    key: "phone",
                    label: "Teléfono",
                    sortable: true,
                },
                {
                    key: "address",
                    label: "Dirección",
                    sortable: true,
                },
            ],
        }
    },

    computed: {
        totalRows() {
            return parseInt(this.ordenesLength) + 1
        },

        ...mapState("login", ["dataUser", "access"]),
        myTable() {
            return this.items
        },
    },

    methods: {
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },

        checkCedula(cedula) {
            if (cedula === "none" || cedula === null || !cedula) {
                return ""
            } else {
                return cedula
            }
        },

        checkEmail(email) {
            const parts = email.split("@")

            if (parts[1] === "email.com") {
                return ""
            } else {
                return email
            }
        },
        checkRoles(roles) {
            let myRoles = []
            for (const key in roles) {
                if (roles.hasOwnProperty(key)) {
                    myRoles.push(key)
                }
            }
            return myRoles[0]
        },

        async verificarPedidosEnWC(customer_email, customer_id) {
            // console.log(`Eliminemos a ${customer_email}`)
            // var respCount
            const respCount = await this.$axios
                .get(
                    `${this.$config.API}/customers/orders-count/${customer_email}/${customer_id}`
                )
                .then((res) => {
                    this.tmpDelete = res.data
                })
                .catch((err) => {
                    this.tmpDelete = null
                })
            console.log("respCount resp", respCount)
            return respCount
        },

        deleteCustomer(id_emp, nombre, apellido, email) {
            this.$confirm(
                `¿Desea Elimiar el cliente ${nombre} ${apellido} ?`,
                "Eliminar Cliente",
                "warning"
            )
                .then(() => {
                    this.verificarPedidosEnWC(email, id_emp).then(() => {
                        if (this.tmpDelete.ordenes_ns === 0) {
                            this.overlay = true
                            const data = new URLSearchParams()
                            data.set("customer_id", id_emp)
                            axios
                                .post(
                                    `${this.$config.API}/customers/eliminar`,
                                    data
                                )
                                .then((res) => {
                                    this.getCustomers().then(
                                        () => (this.overlay = false)
                                    )
                                })
                        } else {
                            this.$fire({
                                title: "EL Cliente no se puede elminar",
                                html: `<p>El cliente posee ${this.tmpDelete.ordenes_ns} ordenes en curso y ${this.tmpDelete.ordenes_wc} en Woocommerce</p>`,
                                type: "warning",
                            })
                        }
                    })
                })
                .catch((err) => {
                    console.log("CATCH!!!", err)
                    return false
                })
                .finally(() => {
                    console.log("finalli aqui")
                })
        },

        reloadData() {
            this.overlay = true
            this.overlay = false
        },

        async getCustomers() {
            await this.$axios
                .get(`${this.$config.API}/customers`)
                .then((resp) => {
                    this.dataTable = resp.data.data.map((el) => {
                        if (el.email === "none") {
                            // Si el email es 'none', reemplazarlo con una cadena vacía
                            return { ...el, email: "" }
                        } else {
                            // De lo contrario, mantener el objeto tal como está
                            return el
                        }
                    })
                    this.ordenesLength = this.dataTable.length

                    this.overlay = false
                })
        },
    },

    mounted() {
        this.getCustomers().then(() => {
            this.overlay = false
        })
    },
}
</script>
