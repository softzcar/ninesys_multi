<template>
    <div>
        <!-- Botón para abrir el modal -->
        <b-button variant="success" @click="showModal = true">
            <b-icon icon="plus-circle"></b-icon> Nueva Impresora
        </b-button>

        <!-- Modal para el formulario -->
        <b-modal v-model="showModal" title="Crear Nueva Impresora" size="lg" hide-footer>
            <b-overlay :show="overlay">
                <b-form @submit.prevent="crearImpresora">
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Código Interno" description="Identificador único y fácil de leer para el empleado.">
                                <b-form-input v-model="form.codigo_interno" required></b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group label="Marca" description="Marca del fabricante. Ej: Epson, Roland">
                                <b-form-input v-model="form.marca"></b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Modelo" description="Nombre comercial del modelo. Ej: SureColor F570">
                                <b-form-input v-model="form.modelo"></b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group label="Ubicación" description="Ubicación física para ayudar al empleado a identificarla.">
                                <b-form-input v-model="form.ubicacion"></b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Tecnología" description="Tecnología para agrupar o filtrar. Ej: Sublimación">
                                <b-form-select v-model="form.tipo_tecnologia" :options="tecnologias" required></b-form-select>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group label="Estado" description="Estado actual. Ej: activa, inactiva, en_mantenimiento">
                                <b-form-select v-model="form.estado" :options="estados"></b-form-select>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col>
                            <b-form-group label="Notas" description="Cualquier información adicional relevante.">
                                <b-form-textarea v-model="form.notas"></b-form-textarea>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-button type="submit" variant="primary">Guardar</b-button>
                    <b-button @click="showModal = false" variant="secondary">Cancelar</b-button>
                </b-form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showModal: false,
            overlay: false,
            form: {
                codigo_interno: '',
                marca: '',
                modelo: '',
                ubicacion: '',
                tipo_tecnologia: null,
                estado: 'activa',
                notas: ''
            },
            estados: [
                { value: 'activa', text: 'Activa' },
                { value: 'inactiva', text: 'Inactiva' },
                { value: 'mantenimiento', text: 'Mantenimiento' }
            ],
            tecnologias: [
                { value: null, text: 'Seleccione una opción' },
                { value: 'CMYK', text: 'CMYK' },
                { value: 'CMYK+W', text: 'CMYK+W' }
            ]
        }
    },
    methods: {
        async crearImpresora() {
            const requiredFields = {
                codigo_interno: 'Código Interno',
                marca: 'Marca',
                modelo: 'Modelo',
                tipo_tecnologia: 'Tecnología',
                estado: 'Estado'
            };

            for (const field in requiredFields) {
                if (!this.form[field]) {
                    this.$fire({
                        title: "Campo Requerido",
                        html: `<p>Por favor, complete el campo: <strong>${requiredFields[field]}</strong></p>`,
                        type: "warning",
                    });
                    return;
                }
            }

            this.overlay = true;
            const data = new URLSearchParams();
            for (const key in this.form) {
                data.append(key, this.form[key]);
            }

            try {
                await this.$axios.post(`${this.$config.API}/impresoras`, data);
                this.$fire({
                    title: "Impresora Creada",
                    html: `<p>La impresora ha sido creada correctamente.</p>`,
                    type: "success",
                });
                this.showModal = false;
                this.$emit('reload');
                this.resetForm();
            } catch (error) {
                console.error('Error al crear la impresora:', error);
                this.$fire({
                    title: "Error",
                    html: `<p>No se pudo crear la impresora.</p><p>${error}</p>`,
                    type: "error",
                });
            } finally {
                this.overlay = false;
            }
        },
        resetForm() {
            this.form = {
                codigo_interno: '',
                marca: '',
                modelo: '',
                ubicacion: '',
                tipo_tecnologia: null,
                estado: 'activa',
                notas: ''
            };
        }
    }
}
</script>
