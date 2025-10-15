<template>
    <div>
        <!-- Botón para abrir el modal -->
        <b-button variant="warning" @click="openModal">
            <b-icon icon="pencil-square"></b-icon>
        </b-button>

        <!-- Modal para el formulario -->
        <b-modal v-model="showModal" title="Editar Impresora" size="lg" hide-footer>
            <b-overlay :show="overlay">
                <b-form @submit.prevent="actualizarImpresora">
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
                    <b-button type="submit" variant="primary">Actualizar</b-button>
                    <b-button @click="showModal = false" variant="secondary">Cancelar</b-button>
                </b-form>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
export default {
    props: ['item'],
    data() {
        return {
            showModal: false,
            overlay: false,
            form: {},
            estados: [
                { value: 'activa', text: 'Activa' },
                { value: 'inactiva', text: 'Inactiva' },
                { value: 'mantenimiento', text: 'Mantenimiento' }
            ],
            tecnologias: [
                { value: null, text: 'Seleccione una opción' },
                { value: 'CMYK', text: 'CMYK' },
                { value: 'CMYKW', text: 'CMYKW' }
            ]
        }
    },
    methods: {
        openModal() {
            this.form = { ...this.item };
            this.showModal = true;
        },
        async actualizarImpresora() {
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
                if (key !== '_id') { // No enviar el _id en el cuerpo del PUT
                    data.append(key, this.form[key]);
                }
            }

            try {
                await this.$axios.put(`${this.$config.API}/impresoras/${this.form._id}`, data);
                this.$fire({
                    title: "Impresora Actualizada",
                    html: "<p>La impresora ha sido actualizada correctamente.</p>",
                    type: "success",
                });
                this.showModal = false;
                this.$emit('reload');
            } catch (error) {
                console.error('Error al actualizar la impresora:', error);
                this.$fire({
                    title: "Error",
                    html: `<p>No se pudo actualizar la impresora.</p><p>${error}</p>`,
                    type: "error",
                });
            } finally {
                this.overlay = false;
            }
        }
    }
}
</script>
