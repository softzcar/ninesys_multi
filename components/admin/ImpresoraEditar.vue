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
                            <b-form-group label="Tecnología de Tinta Física" description="Tipo de insumo/tinta que utiliza la máquina.">
                                <b-form-select v-model="form.id_catalogo_tintas" :options="tecnologiasOptions" required></b-form-select>
                            </b-form-group>
                        </b-col>
                        <b-col md="6">
                            <b-form-group label="Capacidad del Contenedor (ml)" description="Capacidad máxima de los tanques de tinta.">
                                <b-form-input type="number" step="0.1" v-model="form.capacidad_contenedor" required></b-form-input>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Estado" description="Estado de disponibilidad actual.">
                                <b-form-select v-model="form.estado" :options="estados"></b-form-select>
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <!-- Canales de color dinámicos -->
                    <b-row class="mt-3 mb-4">
                        <b-col>
                            <b-form-group label="Canales de Tinta / Colores Soportados" description="Seleccione todos los canales de color activos en esta impresora.">
                                <div class="d-flex flex-wrap gap-2">
                                    <div v-for="color in coloresOptions" :key="color._id" class="mr-2 mb-2">
                                        <b-form-checkbox
                                            v-model="form.canales"
                                            :value="color._id"
                                            button
                                            :button-variant="form.canales.includes(color._id) ? 'primary' : 'outline-secondary'"
                                        >
                                            <span class="d-inline-block rounded-circle mr-1" :style="{ backgroundColor: color.color_hex, width: '12px', height: '12px', border: '1px solid rgba(0,0,0,0.25)' }"></span>
                                            {{ color.nombre }} ({{ color.codigo }})
                                        </b-form-checkbox>
                                    </div>
                                </div>
                            </b-form-group>
                        </b-col>
                    </b-row>

                    <b-row>
                        <b-col>
                            <b-form-group label="Notas" description="Cualquier información adicional relevante.">
                                <b-form-textarea v-model="form.notes"></b-form-textarea>
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <div class="mt-3 text-right">
                        <b-button type="submit" variant="primary" class="px-4">Actualizar</b-button>
                        <b-button @click="showModal = false" variant="secondary" class="ml-2">Cancelar</b-button>
                    </div>
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
            form: {
                codigo_interno: '',
                marca: '',
                modelo: '',
                ubicacion: '',
                tipo_tecnologia: '',
                id_catalogo_tintas: null,
                capacidad_contenedor: '',
                estado: 'activa',
                notes: '',
                canales: []
            },
            estados: [
                { value: 'activa', text: 'Activa' },
                { value: 'inactiva', text: 'Inactiva' },
                { value: 'mantenimiento', text: 'Mantenimiento' }
            ],
            tecnologiasOptions: [
                { value: null, text: 'Seleccione una opción' }
            ],
            coloresOptions: []
        }
    },
    watch: {
        'form.id_catalogo_tintas'(newVal) {
            const selected = this.tecnologiasOptions.find(t => t.value === newVal);
            if (selected) {
                this.form.tipo_tecnologia = selected.text;
            } else {
                this.form.tipo_tecnologia = '';
            }
        }
    },
    async mounted() {
        await this.cargarCatalogos();
    },
    methods: {
        async cargarCatalogos() {
            try {
                const [respTech, respColors] = await Promise.all([
                    this.$axios.get(`${this.$config.API}/catalogo-tintas`),
                    this.$axios.get(`${this.$config.API}/catalogo-colores-tintas`)
                ]);
                
                const techList = respTech.data.data || respTech.data || [];
                const colorsList = respColors.data.data || respColors.data || [];

                this.tecnologiasOptions = [
                    { value: null, text: 'Seleccione una opción' },
                    ...techList.map(t => ({ value: t._id, text: t.nombre }))
                ];
                
                this.coloresOptions = colorsList;
            } catch (error) {
                console.error("Error al cargar los catálogos en ImpresoraEditar:", error);
            }
        },
        openModal() {
            // Extraemos los IDs de los canales de color que la impresora ya tiene asignados
            const canalesIds = (this.item.canales_colores || []).map(c => c.id_color);
            
            this.form = {
                _id: this.item._id,
                codigo_interno: this.item.codigo_interno || '',
                marca: this.item.marca || '',
                modelo: this.item.modelo || '',
                ubicacion: this.item.ubicacion || '',
                tipo_tecnologia: this.item.tipo_tecnologia || '',
                id_catalogo_tintas: this.item.id_catalogo_tintas || null,
                capacidad_contenedor: this.item.capacidad_contenedor || '',
                estado: this.item.estado || 'activa',
                notes: this.item.notes || this.item.notas || '',
                canales: canalesIds
            };
            this.showModal = true;
        },
        async actualizarImpresora() {
            const requiredFields = {
                codigo_interno: 'Código Interno',
                id_catalogo_tintas: 'Tecnología de Tinta Física',
                capacidad_contenedor: 'Capacidad del Contenedor',
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

            if (!this.form.canales || this.form.canales.length === 0) {
                this.$fire({
                    title: "Canales de color requeridos",
                    html: "<p>Debe seleccionar al menos un canal de color para la impresora.</p>",
                    type: "warning",
                });
                return;
            }

            this.overlay = true;
            const data = new URLSearchParams();
            for (const key in this.form) {
                if (key !== 'canales' && key !== '_id') {
                    data.append(key, this.form[key] !== null ? this.form[key] : '');
                }
            }
            this.form.canales.forEach(id_color => {
                data.append('canales[]', id_color);
            });

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
                    html: `<p>No se pudo actualizar la impresora.</p><p>${error.response?.data?.error || error}</p>`,
                    type: "error",
                });
            } finally {
                this.overlay = false;
            }
        }
    }
}
</script>
