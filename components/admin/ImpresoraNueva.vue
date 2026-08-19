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
                            <b-form-group description="Tipo de insumo/tinta que utiliza la máquina.">
                                <template #label>
                                    <div class="d-flex align-items-center justify-content-between w-100">
                                        <span>Tecnología de Tinta Física</span>
                                        <b-button v-if="!showNuevaTecnologia" variant="link" class="p-0 text-info ml-auto" style="font-size: 0.85rem;" @click.prevent="showNuevaTecnologia = true">
                                            <b-icon icon="plus-circle" class="mr-1" />Nueva
                                        </b-button>
                                    </div>
                                </template>
                                <div v-if="showNuevaTecnologia" class="d-flex align-items-center gap-2">
                                    <b-form-input v-model="nuevaTecnologiaNombre" placeholder="Nombre (ej. UV, Sublimación)" size="sm" class="flex-grow-1" />
                                    <b-button variant="success" size="sm" class="ml-2 font-weight-bold" @click.prevent="guardarNuevaTecnologia" :disabled="!nuevaTecnologiaNombre.trim() || savingTecnologia">
                                        <b-spinner v-if="savingTecnologia" small></b-spinner>
                                        <span v-else>Guardar</span>
                                    </b-button>
                                    <b-button variant="secondary" size="sm" class="ml-1" @click.prevent="cancelarNuevaTecnologia" :disabled="savingTecnologia">
                                        Cancelar
                                    </b-button>
                                </div>
                                <b-form-select v-else v-model="form.id_catalogo_tintas" :options="tecnologiasOptions" required></b-form-select>
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
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Tinta Estimada (ml por metro)" description="Estimado de ml de tinta por metro de material impreso a full print, sin considerar saturación. Se usa para calcular la referencia visual que se muestra junto a los inputs de tinta.">
                                <b-form-input type="number" step="0.1" min="0" v-model="form.ml_tinta_por_metro"></b-form-input>
                            </b-form-group>
                        </b-col>
                        <b-col md="6" class="d-flex flex-column justify-content-center">
                            <b-form-checkbox v-model="form.ingresar_tinta_manual" :value="1" :unchecked-value="0">
                                Ingresar consumo de tinta manualmente
                            </b-form-checkbox>
                            <small class="text-muted">
                                Activado: el empleado debe tipear los ml por color al terminar. Desactivado: no se pide nada, solo se muestra el estimado de referencia.
                            </small>
                        </b-col>
                    </b-row>

                    <!-- Canales de color dinámicos -->
                    <b-row class="mt-3 mb-4">
                        <b-col>
                            <b-form-group description="Seleccione todos los canales de color activos en esta impresora.">
                                <template #label>
                                    <div class="d-flex align-items-center justify-content-between w-100">
                                        <span>Canales de Tinta / Colores Soportados</span>
                                        <b-button v-if="!showNuevoColor" variant="link" class="p-0 text-info ml-auto" style="font-size: 0.85rem;" @click.prevent="showNuevoColor = true">
                                            <b-icon icon="plus-circle" class="mr-1" />Nuevo Canal
                                        </b-button>
                                    </div>
                                </template>

                                <!-- Formulario inline para nuevo color -->
                                <div v-if="showNuevoColor" class="p-3 border rounded mb-3 bg-light shadow-sm">
                                    <h6 class="font-weight-bold mb-2 text-info">Crear Nuevo Canal de Color</h6>
                                    <div class="mb-3 d-flex flex-wrap align-items-center" style="gap: 5px;">
                                        <small class="text-muted mr-2 font-weight-bold">Predeterminados:</small>
                                        <b-button 
                                            v-for="preset in coloresPredeterminados" 
                                            :key="preset.codigo" 
                                            size="sm" 
                                            variant="light" 
                                            class="py-1 px-2 d-flex align-items-center border" 
                                            style="font-size: 0.75rem; border-radius: 15px; cursor: pointer; height: 24px; margin-bottom: 2px;"
                                            @click.prevent="cargarPresetColor(preset)"
                                        >
                                            <span class="d-inline-block rounded-circle mr-1" :style="{ backgroundColor: preset.color_hex, width: '10px', height: '10px', border: '1px solid rgba(0,0,0,0.2)' }"></span>
                                            {{ preset.nombre }}
                                        </b-button>
                                    </div>
                                    <b-row>
                                        <b-col md="4">
                                            <b-form-group label="Código" label-size="sm" class="mb-2">
                                                <b-form-input v-model="nuevoColorForm.codigo" placeholder="Ej: V, FL, O" size="sm" required />
                                            </b-form-group>
                                        </b-col>
                                        <b-col md="5">
                                            <b-form-group label="Nombre" label-size="sm" class="mb-2">
                                                <b-form-input v-model="nuevoColorForm.nombre" placeholder="Ej: Barniz, Fluo Orange" size="sm" required />
                                            </b-form-group>
                                        </b-col>
                                        <b-col md="3">
                                            <b-form-group label="Muestra" label-size="sm" class="mb-2">
                                                <div class="d-flex align-items-center">
                                                    <input type="color" v-model="nuevoColorForm.color_hex" class="mr-1" style="width: 45px; height: 31px; border: 1px solid #ced4da; border-radius: 0.2rem; padding: 2px; cursor: pointer; background: none;" />
                                                    <b-form-input v-model="nuevoColorForm.color_hex" placeholder="#HEX" size="sm" style="font-size: 11px; flex-grow: 1;" />
                                                </div>
                                            </b-form-group>
                                        </b-col>
                                    </b-row>
                                    <div class="text-right mt-2">
                                        <b-button variant="secondary" size="sm" class="mr-1" @click.prevent="cancelarNuevoColor" :disabled="savingColor">
                                            Cancelar
                                        </b-button>
                                        <b-button variant="success" size="sm" class="font-weight-bold" @click.prevent="guardarNuevoColor" :disabled="!nuevoColorForm.codigo.trim() || !nuevoColorForm.nombre.trim() || savingColor">
                                            <b-spinner v-if="savingColor" small class="mr-1"></b-spinner>
                                            <span>Guardar e Incluir</span>
                                        </b-button>
                                    </div>
                                </div>

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
                        <b-button type="submit" variant="primary" class="px-4">Guardar</b-button>
                        <b-button @click="showModal = false" variant="secondary" class="ml-2">Cancelar</b-button>
                    </div>
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
                tipo_tecnologia: '',
                id_catalogo_tintas: null,
                capacidad_contenedor: '',
                estado: 'activa',
                ml_tinta_por_metro: 12,
                ingresar_tinta_manual: 1,
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
            coloresOptions: [],
            showNuevaTecnologia: false,
            nuevaTecnologiaNombre: '',
            savingTecnologia: false,
            showNuevoColor: false,
            nuevoColorForm: {
                codigo: '',
                nombre: '',
                color_hex: '#E5E7EB'
            },
            savingColor: false,
            coloresPredeterminados: [
                { codigo: 'C', nombre: 'Cyan', color_hex: '#00FFFF' },
                { codigo: 'M', nombre: 'Magenta', color_hex: '#FF00FF' },
                { codigo: 'Y', nombre: 'Yellow', color_hex: '#FFFF00' },
                { codigo: 'K', nombre: 'Black', color_hex: '#000000' },
                { codigo: 'W', nombre: 'White', color_hex: '#FFFFFF' },
                { codigo: 'BRNZ', nombre: 'Barniz', color_hex: '#E0F7FA' },
                { codigo: 'LC', nombre: 'Light Cyan', color_hex: '#80FFFF' },
                { codigo: 'LM', nombre: 'Light Magenta', color_hex: '#FF80FF' },
                { codigo: 'OR', nombre: 'Orange', color_hex: '#FFA500' },
                { codigo: 'GR', nombre: 'Green', color_hex: '#008000' },
                { codigo: 'RD', nombre: 'Red', color_hex: '#FF0000' },
                { codigo: 'BL', nombre: 'Blue', color_hex: '#0000FF' }
            ]
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
                console.error("Error al cargar los catálogos en ImpresoraNueva:", error);
            }
        },
        async crearImpresora() {
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
                if (key !== 'canales') {
                    data.append(key, this.form[key] !== null ? this.form[key] : '');
                }
            }
            this.form.canales.forEach(id_color => {
                data.append('canales[]', id_color);
            });

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
                    html: `<p>No se pudo crear la impresora.</p><p>${error.response?.data?.error || error}</p>`,
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
                tipo_tecnologia: '',
                id_catalogo_tintas: null,
                capacidad_contenedor: '',
                estado: 'activa',
                ml_tinta_por_metro: 12,
                ingresar_tinta_manual: 1,
                notes: '',
                canales: []
            };
            this.cancelarNuevaTecnologia();
            this.cancelarNuevoColor();
        },
        async guardarNuevaTecnologia() {
            if (!this.nuevaTecnologiaNombre.trim()) return;
            this.savingTecnologia = true;
            try {
                const params = new URLSearchParams();
                params.set('nombre', this.nuevaTecnologiaNombre.trim());
                const response = await this.$axios.post(`${this.$config.API}/catalogo-tintas`, params);
                const nuevaTech = response.data.data;
                if (nuevaTech && nuevaTech._id) {
                    await this.cargarCatalogos();
                    this.form.id_catalogo_tintas = nuevaTech._id;
                    this.$fire({
                        title: "Tecnología Creada",
                        html: `<p>Se ha agregado la tecnología <strong>${nuevaTech.nombre}</strong> correctamente.</p>`,
                        type: "success",
                        timer: 2000
                    });
                }
                this.cancelarNuevaTecnologia();
            } catch (error) {
                console.error("Error al crear nueva tecnología de tinta:", error);
                this.$fire({
                    title: "Error",
                    html: "<p>No se pudo crear la tecnología de tinta.</p>",
                    type: "error"
                });
            } finally {
                this.savingTecnologia = false;
            }
        },
        cancelarNuevaTecnologia() {
            this.showNuevaTecnologia = false;
            this.nuevaTecnologiaNombre = '';
        },
        async guardarNuevoColor() {
            if (!this.nuevoColorForm.codigo.trim() || !this.nuevoColorForm.nombre.trim()) return;
            this.savingColor = true;
            try {
                const params = new URLSearchParams();
                params.set('codigo', this.nuevoColorForm.codigo.trim().toUpperCase());
                params.set('nombre', this.nuevoColorForm.nombre.trim());
                params.set('color_hex', this.nuevoColorForm.color_hex);
                const response = await this.$axios.post(`${this.$config.API}/catalogo-colores-tintas`, params);
                const nuevoColor = response.data.data;
                if (nuevoColor && nuevoColor._id) {
                    await this.cargarCatalogos();
                    if (!this.form.canales.includes(nuevoColor._id)) {
                        this.form.canales.push(nuevoColor._id);
                    }
                    this.$fire({
                        title: "Color Creado",
                        html: `<p>Se ha agregado el canal <strong>${nuevoColor.nombre} (${nuevoColor.codigo})</strong> correctamente.</p>`,
                        type: "success",
                        timer: 2000
                    });
                }
                this.cancelarNuevoColor();
            } catch (error) {
                console.error("Error al crear nuevo color de tinta:", error);
                this.$fire({
                    title: "Error",
                    html: "<p>No se pudo crear el canal de color.</p>",
                    type: "error"
                });
            } finally {
                this.savingColor = false;
            }
        },
        cancelarNuevoColor() {
            this.showNuevoColor = false;
            this.nuevoColorForm = {
                codigo: '',
                nombre: '',
                color_hex: '#E5E7EB'
            };
        },
        cargarPresetColor(preset) {
            this.nuevoColorForm.codigo = preset.codigo;
            this.nuevoColorForm.nombre = preset.nombre;
            this.nuevoColorForm.color_hex = preset.color_hex;
        }
    }
}
</script>
