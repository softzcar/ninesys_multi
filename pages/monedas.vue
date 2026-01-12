<template>
    <div>
        <div v-if="!access">
            <login-form />
        </div>

        <div v-else>
            <menus-MenuLoader />
            <div v-if="dataUser.departamento === 'Administración'">
                <b-overlay :show="overlay" spinner-small>
                    <b-container>
                        <b-row>
                            <b-col>
                                <h2 class="mb-4">{{ titulo }}</h2>
                                <p class="text-muted">
                                    Gestiona las monedas que tu empresa utiliza para transacciones.
                                    <strong>Nota:</strong> El Dólar y el Bolívar no pueden ser eliminados.
                                </p>
                            </b-col>
                        </b-row>

                        <!-- Botón para crear nueva moneda -->
                        <b-row class="mb-3">
                            <b-col>
                                <b-button variant="primary" @click="abrirModalCrear">
                                    <b-icon icon="plus-circle" />
                                    Nueva Moneda
                                </b-button>
                            </b-col>
                        </b-row>

                        <!-- Tabla de monedas -->
                        <b-row>
                            <b-col>
                                <b-table responsive hover :fields="fields" :items="monedas" :busy="overlay"
                                    :key="tableKey">
                                    <!-- Campo Moneda -->
                                    <template #cell(moneda)="data">
                                        <strong>{{ data.item.moneda }}</strong>
                                    </template>

                                    <!-- Campo Nombre -->
                                    <template #cell(mondeda_nombre)="data">
                                        {{ data.item.mondeda_nombre }}
                                    </template>

                                    <!-- Campo Estado (toggle activo) -->
                                    <template #cell(activo)="data">
                                        <b-form-checkbox switch :checked="data.item.activo"
                                            @change="toggleActivo(data.item, data.index)">
                                            <b-badge :variant="data.item.activo ? 'success' : 'secondary'">
                                                {{ data.item.activo ? 'Activa' : 'Inactiva' }}
                                            </b-badge>
                                        </b-form-checkbox>
                                    </template>

                                    <!-- Campo Acciones -->
                                    <template #cell(acciones)="data">
                                        <b-button variant="danger" size="sm"
                                            :disabled="isMonedaBloqueada(data.item.moneda)"
                                            @click="eliminarMoneda(data.item)">
                                            <b-icon icon="trash" />
                                            Eliminar
                                        </b-button>
                                        <b-tooltip v-if="isMonedaBloqueada(data.item.moneda)"
                                            :target="`btn-delete-${data.index}`">
                                            Esta moneda no puede ser eliminada
                                        </b-tooltip>
                                    </template>
                                </b-table>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-overlay>
            </div>

            <div v-else>
                <accessDenied />
            </div>
        </div>

        <!-- Modal para crear nueva moneda -->
        <b-modal id="modal-crear-moneda" title="Crear Nueva Moneda" @ok="crearMoneda" @hidden="resetFormulario">
            <b-form>
                <b-form-group label="Identificador de Moneda" label-for="input-moneda-id"
                    description="Identificador único sin espacios (ej: peso_mexicano, euro)">
                    <b-form-input id="input-moneda-id" v-model="nuevaMoneda.moneda" placeholder="peso_mexicano" required
                        :state="validarIdMoneda" />
                    <b-form-invalid-feedback>
                        Usa solo letras minúsculas, números y guiones bajos. No puede estar vacío ni duplicarse.
                    </b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label="Nombre de la Moneda" label-for="input-moneda-nombre"
                    description="Nombre completo para mostrar en la interfaz">
                    <b-form-input id="input-moneda-nombre" v-model="nuevaMoneda.mondeda_nombre"
                        placeholder="Peso Mexicano" required
                        :state="nuevaMoneda.mondeda_nombre.length > 0 ? true : false" />
                </b-form-group>

                <b-form-group>
                    <b-form-checkbox v-model="nuevaMoneda.activo">
                        Activar moneda inmediatamente
                    </b-form-checkbox>
                </b-form-group>
            </b-form>
        </b-modal>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "GestionMonedas",
    data() {
        return {
            titulo: "Gestión de Monedas",
            overlay: false,
            monedas: [],
            monedasBloqueadas: ["dolar", "bolivar"],
            tableKey: 0, // Key para forzar re-renderización de la tabla
            nuevaMoneda: {
                moneda: "",
                mondeda_nombre: "",
                activo: true,
            },
            fields: [
                {
                    key: "moneda",
                    label: "Identificador",
                    sortable: true,
                },
                {
                    key: "mondeda_nombre",
                    label: "Nombre",
                    sortable: true,
                },
                {
                    key: "activo",
                    label: "Estado",
                    class: "text-center",
                },
                {
                    key: "acciones",
                    label: "Acciones",
                    class: "text-center",
                },
            ],
        };
    },
    computed: {
        ...mapState("login", ["dataUser", "access", "idEmpresa"]),
        validarIdMoneda() {
            if (this.nuevaMoneda.moneda.length === 0) return null;

            // Validar formato (solo letras minúsculas, números y _)
            const formatoValido = /^[a-z0-9_]+$/.test(this.nuevaMoneda.moneda);
            if (!formatoValido) return false;

            // Validar que no esté duplicado
            const duplicado = this.monedas.some(
                (m) => m.moneda === this.nuevaMoneda.moneda
            );
            return !duplicado;
        },
    },
    methods: {
        cargarMonedas() {
            // Cargar monedas desde el store de Vuex
            const tipos = this.$store.state.login.dataEmpresa.tipos_de_monedas;
            if (tipos && Array.isArray(tipos)) {
                this.monedas = JSON.parse(JSON.stringify(tipos)); // Deep copy
            }
        },

        isMonedaBloqueada(moneda) {
            return this.monedasBloqueadas.includes(moneda);
        },

        abrirModalCrear() {
            this.$bvModal.show("modal-crear-moneda");
        },

        resetFormulario() {
            this.nuevaMoneda = {
                moneda: "",
                mondeda_nombre: "",
                activo: true,
            };
        },

        async crearMoneda(bvModalEvent) {
            bvModalEvent.preventDefault();

            // Validaciones
            if (!this.validarIdMoneda || this.nuevaMoneda.mondeda_nombre.length === 0) {
                this.$bvToast.toast("Por favor completa todos los campos correctamente", {
                    title: "Error de Validación",
                    variant: "danger",
                    solid: true,
                });
                return;
            }

            // Agregar nueva moneda al array
            this.monedas.push({ ...this.nuevaMoneda });

            // Guardar en el backend
            await this.guardarMonedas();

            this.$bvModal.hide("modal-crear-moneda");
        },

        async toggleActivo(moneda, index) {
            // Contar cuántas monedas activas hay actualmente
            const monedasActivas = this.monedas.filter(m => m.activo).length;

            // Si están tratando de desactivar y solo hay 1 activa, no permitir
            if (moneda.activo && monedasActivas === 1) {
                this.$bvToast.toast(
                    'Debe haber al menos una moneda activa en el sistema.',
                    {
                        title: 'Operación No Permitida',
                        variant: 'warning',
                        solid: true,
                    }
                );


                // Incrementar tableKey para forzar re-renderización de la tabla
                this.tableKey++;
                return;
            }

            // Crear una copia del array local y cambiar el estado
            const monedasCopy = [...this.monedas];
            monedasCopy[index] = {
                ...monedasCopy[index],
                activo: !monedasCopy[index].activo
            };

            // Actualizar el array local
            this.monedas = monedasCopy;

            // Guardar en backend
            await this.guardarMonedas();
        },

        eliminarMoneda(moneda) {
            if (this.isMonedaBloqueada(moneda.moneda)) {
                this.$bvToast.toast(
                    `La moneda ${moneda.mondeda_nombre} es obligatoria y no puede ser eliminada.`,
                    {
                        title: "Operación No Permitida",
                        variant: "warning",
                        solid: true,
                    }
                );
                return;
            }

            this.$confirm(
                `¿Está seguro de eliminar la moneda "${moneda.mondeda_nombre}"?`,
                "Eliminar Moneda",
                "warning"
            )
                .then(async () => {
                    // Filtrar la moneda eliminada
                    this.monedas = this.monedas.filter((m) => m.moneda !== moneda.moneda);

                    // Guardar cambios
                    await this.guardarMonedas();

                    this.$bvToast.toast(`Moneda "${moneda.mondeda_nombre}" eliminada exitosamente`, {
                        title: "Éxito",
                        variant: "success",
                        solid: true,
                    });
                })
                .catch(() => {
                    // Usuario canceló
                });
        },

        async guardarMonedas() {
            this.overlay = true;

            try {
                const payload = {
                    id_empleado: this.dataUser.id_empleado,
                    monedas: this.monedas,
                };

                await this.$axios.post(
                    `${this.$config.API}/configuracion/monedas`,
                    payload
                );

                // Actualizar el store de Vuex
                this.$store.commit("login/setDataEmpresa", {
                    ...this.$store.state.login.dataEmpresa,
                    tipos_de_monedas: this.monedas,
                });

                this.$bvToast.toast("Monedas actualizadas correctamente", {
                    title: "Éxito",
                    variant: "success",
                    solid: true,
                });
            } catch (error) {
                console.error("Error al guardar monedas:", error);
                this.$bvToast.toast(
                    "Ocurrió un error al guardar los cambios. Por favor intenta nuevamente.",
                    {
                        title: "Error",
                        variant: "danger",
                        solid: true,
                    }
                );
            } finally {
                this.overlay = false;
            }
        },
    },
    mounted() {
        this.cargarMonedas();
    },
};
</script>

<style scoped>
.floatme {
    margin-right: 5px;
}
</style>
