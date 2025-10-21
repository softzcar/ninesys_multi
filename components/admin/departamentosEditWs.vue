<template>
    <div>
        <b-button class="mb-4" @click="$bvModal.show(modal)" variant="info">
          <b-icon icon="building" class="mr-2"></b-icon>
          Departamentos
        </b-button>

        <b-modal :id="modal" :title="title" hide-footer size="lg">
            <b-overlay :show="overlay" spinner-small>
                <b-button v-b-toggle.ayuda-variables variant="outline-info" size="sm" class="mb-4">
                    <b-icon icon="question-circle" class="mr-1"></b-icon>
                    Ayuda: Variables Disponibles
                </b-button>
                <b-collapse id="ayuda-variables">
                    <p class="mb-2 text-muted">
                        Las variables se reemplazan automáticamente al enviar el mensaje. Usa corchetes <code>[]</code> para insertarlas.
                    </p>
                    <div v-for="(dep, index) in form" :key="`ayuda-${index}`">
                        <b-alert show variant="info" class="mt-2">
                            <strong>{{ dep.nombre }}:</strong>
                            <ul class="mb-0">
                                <li v-for="variable in getVariablesForDep(dep.nombre)" :key="variable.variable">
                                    <code>[{{ variable.variable }}]</code>: {{ variable.descripcion }}
                                </li>
                            </ul>
                        </b-alert>
                    </div>
                </b-collapse>

                <div class="text-right mb-4">
                    <b-button
                        variant="primary"
                        @click="saveAllSettings"
                        :disabled="overlay"
                    >
                        <b-spinner small v-if="overlay"></b-spinner>
                        Guardar Todos los Cambios
                    </b-button>
                </div>

                <b-form>
                    <div v-for="(dep, index) in form" :key="index">
                        <b-form-group
                            :id="genId('group-dep-', index)"
                            :label="`Departamento: ${dep.nombre}`"
                            :label-for="genId('input-mensaje-', index)"
                        >
                            <b-form-textarea
                                :id="genId('input-mensaje-', index)"
                                v-model="dep.mensaje"
                                placeholder="Escribe el mensaje para este departamento..."
                                rows="3"
                                max-rows="6"
                                class="mb-2"
                                maxlength="65536"
                            ></b-form-textarea>

                            <b-form-checkbox
                                v-model="dep.enviar_mensaje"
                                name="check-enviar-mensaje"
                                switch
                                value="1"
                                unchecked-value="0"
                                :id="genId('check-enviar-', index)"
                            >
                                Enviar mensaje automático para este departamento
                            </b-form-checkbox>
                        </b-form-group>
                        <hr v-if="index < form.length - 1" />
                    </div>
                </b-form>
                <div class="text-right mt-4">
                    <b-button
                        variant="primary"
                        @click="saveAllSettings"
                        :disabled="overlay"
                    >
                        <b-spinner small v-if="overlay"></b-spinner>
                        Guardar Todos los Cambios
                    </b-button>
                </div>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
// Importar componentes de BootstrapVue si no están registrados globalmente
// import { BButton, BModal, BOverlay, BForm, BFormGroup, BFormCheckbox, BFormTextarea, BAlert, BSpinner } from 'bootstrap-vue';

export default {
    // Registrar componentes si no están registrados globalmente
    // components: {
    //     BButton, BModal, BOverlay, BForm, BFormGroup, BFormCheckbox, BFormTextarea, BAlert, BSpinner
    // },
    data() {
        return {
            title: "Configuración de Mensajes por Departamento",
            overlay: false, // Controla el spinner de carga
            form: [], // Almacena la configuración de mensajes por departamento
        };
    },

    computed: {
        // Genera un ID único para el modal (tu implementación existente)
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-ws-deps-${rand}`; // Usar un prefijo más específico
        },
    },

    methods: {
        // Genera IDs para elementos del formulario
        genId(prefix, suffix) {
            // Asegurarse de que el suffix sea seguro para IDs (ej: convertir a string y limpiar)
            const safeSuffix = String(suffix).replace(/[^a-zA-Z0-9-_]/g, "");
            return `${prefix}${safeSuffix}`;
        },

        // Método para obtener variables disponibles por departamento
        getVariablesForDep(nombre) {
            const nombreLower = nombre.toLowerCase();

            // Variables comunes a todos
            const comunes = [
                { variable: 'CLIENTE', descripcion: 'Nombre del cliente.' },
                { variable: 'ORDEN_ID', descripcion: 'Número de la orden.' },
                { variable: 'DEPARTAMENTO', descripcion: 'Nombre del departamento actual.' }
            ];

            // Variables específicas por tipo de mensaje
            if (nombreLower.includes('inicio') || nombreLower.includes('welcome') || nombreLower.includes('bienvenida')) {
                return [
                    ...comunes,
                    { variable: 'FECHA_ENTREGA', descripcion: 'Fecha de entrega de la orden.' },
                    { variable: 'PRODUCTOS', descripcion: 'Lista de productos de la orden.' },
                    { variable: 'TOTAL_ORDEN', descripcion: 'Monto total de la orden.' }
                ];
            } else if (nombreLower.includes('saldo') || nombreLower.includes('cobro') || nombreLower.includes('pendiente')) {
                return [
                    ...comunes,
                    { variable: 'MONTO_PENDIENTE', descripcion: 'Monto pendiente (solo para mensajes de cobro).' },
                    { variable: 'FECHA_ENTREGA', descripcion: 'Fecha de entrega de la orden.' },
                    { variable: 'PRODUCTOS', descripcion: 'Lista de productos de la orden.' },
                    { variable: 'TOTAL_ORDEN', descripcion: 'Monto total de la orden, descuentos y saldo pendiente.' },
                    { variable: 'TOTAL_ABONOS', descripcion: 'Total de los abonos hechos a la orden.' },
                    { variable: 'TOTAL_DESCUENTOS', descripcion: 'Total de los descuentos hechos a la orden.' },
                    { variable: 'TOTAL_DEUDA', descripcion: 'Total de la deuda pendiente.' }
                ];
            } else if (nombreLower.includes('fin') || nombreLower.includes('bye') || nombreLower.includes('terminar')) {
                return [
                    ...comunes,
                    { variable: 'FECHA_ENTREGA', descripcion: 'Fecha de entrega de la orden.' },
                    { variable: 'PRODUCTOS', descripcion: 'Lista de productos de la orden.' },
                    { variable: 'TOTAL_ORDEN', descripcion: 'Monto total de la orden.' }
                ];
            } else {
                // Para departamentos sin patrón claro, mostrar variables comunes
                return comunes;
            }
        },

        // *** NUEVA FUNCIÓN: Guardar la configuración (mensaje y checkbox) de un departamento ***
                async saveAllSettings() {
                    this.overlay = true;
                    try {
                        const promises = this.form.map(dep => this.saveDepartmentSettings(dep));
                        await Promise.all(promises);
                        this.$fire({
                            title: "Éxito",
                            html: "<p>Todos los cambios han sido guardados.</p>",
                            type: "success",
                        });
                    } catch (error) {
                        this.$fire({
                            title: "Error",
                            html: "<p>Ocurrió un error al guardar algunos cambios.</p>",
                            type: "error",
                        });
                    } finally {
                        this.overlay = false;
                    }
                },
        
                async saveDepartmentSettings(department) {
                    const data = new URLSearchParams();
                    data.set("id_departamento", department.id_departamento);
                    data.set("enviar_mensaje", department.enviar_mensaje);
                    data.set("mensaje", department.mensaje);
        
                    const url = `${this.$config.API}/departamentos/editar/settings`;
                    return this.$axios.post(url, data);
                },
        // La función guardarEnvioMensaje ya no es necesaria si saveDepartmentSettings guarda ambos campos
        // async guardarEnvioMensaje(value, idDep) { /* ... */ },
    },

    mounted() {
        // Mapear los datos del store al formato del formulario, incluyendo el campo 'mensaje'
        if (this.$store.state.login && this.$store.state.login.departamentos) {
            this.form = this.$store.state.login.departamentos
                .filter((el) => el.asignar_numero_de_paso)
                .map((dep) => {
                    return {
                        id_departamento: dep._id,
                        nombre: dep.departamento,
                        enviar_mensaje: dep.enviar_mensaje
                            ? dep.enviar_mensaje.toString()
                            : "0", // Asegurar que sea string '1' o '0'
                        mensaje: dep.mensaje || "", // Incluir el campo mensaje (usar '' si es null/undefined)
                    };
                });
            console.log("Departamentos cargados en formulario:", this.form);
        } else {
            console.warn(
                "Store de login o departamentos no disponible al montar el componente."
            );
        }
    },

    // props: ["item", "reload"], // 'item' no parece usarse, 'reload' podría ser reemplazado por emitir eventos
};
</script>

<style scoped>
/* Estilos específicos para este componente */
.force {
    white-space: pre-wrap; /* Permite saltos de línea y espacios en pre */
    word-wrap: break-word; /* Rompe palabras largas si es necesario */
}

/* Puedes añadir más estilos si es necesario */
</style>