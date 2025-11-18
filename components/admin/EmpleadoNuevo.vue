<template>
    <div>
        <b-button class="mb-4" variant="primary" @click="$bvModal.show(modal)">
            <b-icon icon="person-plus"></b-icon> Nuevo Empleado
        </b-button>

        <b-modal :size="size" :title="title" :id="modal" hide-footer>
            <b-overlay :show="overlay" spinner-small>
                
                <b-form @submit.stop.prevent="onSubmit" @reset="onReset">
                    <b-tabs content-class="mt-3" ref="tabs">

                        <b-tab title="1. Datos Básicos" active>
                            <b-row>
                                <b-col md="6">
                                    <b-form-group label="Nombre:" label-for="input-name">
                                        <b-form-input id="input-name" v-model="form.nombre" placeholder="Ingrese el nombre" required></b-form-input>
                                    </b-form-group>
                                    <b-form-group label="Email:" label-for="input-email">
                                        <b-form-input id="input-email" v-model="form.email" placeholder="Ingrese el email" type="email" required></b-form-input>
                                    </b-form-group>
                                    <b-form-group label="Teléfono:" label-for="input-telefono">
                                        <b-form-input id="input-telefono" v-model="form.telefono" placeholder="Ingrese el teléfono" type="tel" maxlength="20" required></b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col md="6">
                                    <b-form-group label="Contraseña:" label-for="input-password">
                                        <b-form-input id="input-password" v-model="form.password" placeholder="Ingrese la contraseña" type="password" required></b-form-input>
                                    </b-form-group>
                                    <b-form-group label="Tipo de acceso:" label-for="input-access">
                                        <b-form-select id="input-access" v-model="form.acceso" :options="accessOptions" required></b-form-select>
                                    </b-form-group>
                                    <b-form-group stacked label="Departamentos:" v-slot="{ ariaDescribedby }">
                                        <b-form-checkbox-group id="checkbox-group-1" v-model="form.departamentos"
                                            :options="depOptions" :aria-describedby="ariaDescribedby" name="options-1"></b-form-checkbox-group>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                        </b-tab>

                        <b-tab title="2. Detalles de Nómina">
                            <b-row>
                                <b-col md="6">
                                    <b-form-group label="ID/Cédula/DNI:" label-for="input-id-legal">
                                        <b-form-input id="input-id-legal" v-model="form.id_legal" placeholder="Cédula, DNI o ID Legal"></b-form-input>
                                    </b-form-group>
                                    <b-form-group label="Fecha de Ingreso:" label-for="input-fecha-ingreso">
                                        <b-form-datepicker id="input-fecha-ingreso" v-model="form.fecha_ingreso" required></b-form-datepicker>
                                    </b-form-group>
                                    <b-form-group label="ID Seguridad Social:" label-for="input-seguridad-social">
                                        <b-form-input id="input-seguridad-social" v-model="form.id_seguridad_social" placeholder="Nro. Seguro Social o equivalente"></b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col md="6">
                                    <b-form-group label="Tipo de compensación:" label-for="input-salario-tipo">
                                        <b-form-select id="input-salario-tipo" v-model="form.salario_tipo" :options="compensacionOptions"></b-form-select>
                                    </b-form-group>

                                    <div v-if="form.salario_tipo === 'Salario' || form.salario_tipo === 'Salario más Comisión'">
                                        <b-form-group label="Salario Base:" label-for="input-salario">
                                            <b-form-input id="input-salario" v-model="form.salario" placeholder="Ingrese el salario" type="number" step="0.01" min="0" required></b-form-input>
                                        </b-form-group>
                                        <b-form-group label="Periodo de pago:" label-for="input-periodo">
                                            <b-form-select id="input-periodo" v-model="form.periodo_pago" :options="periodoOptions"></b-form-select>
                                        </b-form-group>
                                    </div>
                                </b-col>
                            </b-row>

                            <hr class="mt-4 mb-3" v-if="form.salario_tipo === 'Comisión' || form.salario_tipo === 'Salario más Comisión'">
                            <div v-if="form.salario_tipo === 'Comisión' || form.salario_tipo === 'Salario más Comisión'">
                                <h5>Configuración de Comisión</h5>
                                <b-row>
                                    <b-col md="6">
                                        <b-form-group label="Tipo de comisión:" label-for="input-comision-tipo">
                                            <b-form-select id="input-comision-tipo" v-model="form.comsionTipo" :options="comisionOptions" required></b-form-select>
                                        </b-form-group>
                                    </b-col>
                                    <b-col md="6">
                                        <b-form-group v-if="form.comsionTipo === 'fija'" label="Comisión fija:" label-for="input-comision">
                                            <b-form-input id="input-comision" v-model="form.comision" placeholder="Monto fijo de comisión" type="number" step="0.01" min="0" required></b-form-input>
                                        </b-form-group>

                                        <b-form-group v-if="form.comsionTipo === 'porcentaje'" label="Comisión Porcentaje:" label-for="input-comision-porcentaje">
                                            <b-form-input id="input-comision-porcentaje" v-model="form.comisionPorcentaje" placeholder="% de comisión" type="number" step="0.01" min="0" max="100" required></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                </b-row>
                            </div>
                        </b-tab>

                        <b-tab title="3. Carga Familiar">
                            <p class="text-muted small">Registre los familiares dependientes del empleado.</p>

                            <!-- Lista de dependientes -->
                            <div v-for="(dependiente, index) in form.dependientes" :key="index" class="border rounded p-3 mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">Dependiente {{ index + 1 }}</h6>
                                    <b-button variant="outline-danger" size="sm" @click="removerDependiente(index)">
                                        <b-icon icon="trash"></b-icon> Eliminar
                                    </b-button>
                                </div>

                                <b-row>
                                    <b-col md="6">
                                        <b-form-group label="Nombre completo:" :label-for="`input-dep-nombre-${index}`">
                                            <b-form-input :id="`input-dep-nombre-${index}`" v-model="dependiente.nombre_completo" placeholder="Nombre completo del dependiente"></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                    <b-col md="6">
                                        <b-form-group label="Cédula/ID:" :label-for="`input-dep-cedula-${index}`">
                                            <b-form-input :id="`input-dep-cedula-${index}`" v-model="dependiente.cedula_o_id" placeholder="Cédula o ID del dependiente"></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                    <b-col md="6">
                                        <b-form-group label="Parentesco:" :label-for="`input-dep-parentesco-${index}`">
                                            <b-form-input :id="`input-dep-parentesco-${index}`" v-model="dependiente.parentesco" placeholder="Ej: Hijo, Cónyuge, Padre"></b-form-input>
                                        </b-form-group>
                                    </b-col>
                                    <b-col md="6">
                                        <b-form-group label="Fecha de nacimiento:" :label-for="`input-dep-nacimiento-${index}`">
                                            <b-form-datepicker :id="`input-dep-nacimiento-${index}`" v-model="dependiente.fecha_nacimiento"></b-form-datepicker>
                                        </b-form-group>
                                    </b-col>
                                    <b-col md="6">
                                        <b-form-group label="¿Es deducible?">
                                            <b-form-checkbox v-model="dependiente.es_deducible">Sí, aplica como deducible/beneficio</b-form-checkbox>
                                        </b-form-group>
                                    </b-col>
                                </b-row>
                            </div>

                            <!-- Botón para agregar dependiente -->
                            <b-button variant="outline-primary" @click="agregarDependiente" class="mb-3">
                                <b-icon icon="plus"></b-icon> Agregar Dependiente
                            </b-button>

                            <!-- Mensaje cuando no hay dependientes -->
                            <div v-if="form.dependientes.length === 0" class="text-center text-muted py-4">
                                <b-icon icon="people" scale="2" class="mb-2"></b-icon>
                                <p>No hay dependientes registrados</p>
                                <small>Haga clic en "Agregar Dependiente" para registrar familiares</small>
                            </div>
                        </b-tab>
                        
                    </b-tabs>

                    <hr class="mt-4">
                    <b-button type="submit" variant="primary">Guardar</b-button>
                    <b-button @click="resetForm" variant="danger">Limpiar</b-button>
                </b-form>

            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import axios from "axios"
export default {
    data() {
        return {
            form: {
                // Datos Básicos
                username: "",
                password: "",
                nombre: "",
                email: "",
                telefono: "",
                acceso: null,
                departamentos: [],

                // Datos de Nómina y Compensación (existentes y nuevos)
                salario_tipo: null,
                salario: 0,
                periodo_pago: null,
                comision: 0,
                comsionTipo: null,
                comisionPorcentaje: 0,
                
                // NUEVOS CAMPOS (Tabla Empleado/empresas_usuarios)
                id_legal: null, // Cédula/DNI
                fecha_ingreso: null,
                id_seguridad_social: null,

                // Carga Familiar (Array de dependientes para múltiples registros)
                dependientes: []
            },
            accessOptions: [
                { value: 0, text: "Empleado" },
                { value: 1, text: "Administrador" },
            ],
            comisionOptions: [
                { value: null, text: "Seleccione un tipo de comisión" },
                { value: 'variable', text: "Variable" },
                { value: 'fija', text: "Fija" },
                { value: 'porcentaje', text: "Porcentaje" },
            ],
            periodoOptions: [
                { value: null, text: "Seleccione un periodo de pago" },
                { value: 'semanal', text: "Semanal" },
                { value: 'quincenal', text: "Quincenal" },
                { value: 'mensual', text: "Mensual" },
            ],
            compensacionOptions: [
                { value: null, text: "Seleccione un tipo de compensación" },
                { value: 'Salario', text: "Salario" },
                { value: 'Comisión', text: "Comisión" },
                { value: 'Salario más Comisión', text: "Salario más Comisión" },
            ],
            size: "xl", // Cambiado a 'xl' o 'lg' para acomodar las pestañas
            title: "Nuevo Empleado",
            overlay: false,
        }
    },

    computed: {
        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7)
            return `modal-${rand}`
        },
        depOptions() {
            let options = this.departamentos.map((el) => {
                return {
                    value: el._id,
                    text: el.departamento
                }
            })
            return options
        },
    },

    methods: {
        resetForm() {
            this.overlay = true
            this.form = {
                username: "",
                password: "",
                nombre: "",
                email: "",
                telefono: "",
                acceso: null,
                comision: 0,
                comsionTipo: null,
                comisionPorcentaje: 0,
                departamentos: [],
                salario: 0,
                periodo_pago: null,
                salario_tipo: null,
                
                // Nuevos campos reseteados
                id_legal: null,
                fecha_ingreso: null,
                id_seguridad_social: null,
                dependientes: []
            }
            this.overlay = false
        },
        async guardarEmpleado() {
            this.overlay = true

            // --- VALIDACIONES DE DATOS BÁSICOS ---

            // 1. Validar campos básicos (pestaña 1)
            if (!this.form.nombre || !this.form.email || !this.form.telefono || !this.form.password || this.form.acceso === null) {
                this.$fire({
                    title: "Campos Requeridos",
                    html: `<p>Debe completar todos los campos obligatorios en la pestaña "Datos Básicos".</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de datos básicos
                this.$refs.tabs.currentTab = 0
                this.overlay = false
                return
            }

            // --- VALIDACIONES DE NÓMINA ---

            // 2. Validar ID Legal (Cédula/DNI) - formato básico
            if (!this.form.id_legal) {
                this.$fire({
                    title: "Campo Requerido",
                    html: `<p>Debe ingresar la Cédula o DNI en la pestaña "Detalles de Nómina".</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de detalles de nómina
                this.$refs.tabs.currentTab = 1
                this.overlay = false
                return
            }

            // Validar formato básico de cédula (solo números y letras, mínimo 5 caracteres)
            const idLegalRegex = /^[A-Za-z0-9]{5,20}$/
            if (!idLegalRegex.test(this.form.id_legal)) {
                this.$fire({
                    title: "Formato Inválido",
                    html: `<p>La Cédula/DNI debe contener solo letras y números, con una longitud entre 5 y 20 caracteres.</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de detalles de nómina
                this.$refs.tabs.currentTab = 1
                this.overlay = false
                return
            }

            // 3. Validar Fecha de Ingreso
            if (!this.form.fecha_ingreso) {
                this.$fire({
                    title: "Campo Requerido",
                    html: `<p>Debe seleccionar la Fecha de Ingreso en la pestaña "Detalles de Nómina".</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de detalles de nómina
                this.$refs.tabs.currentTab = 1
                this.overlay = false
                return
            }

            // Validar que la fecha no sea futura
            const fechaIngreso = new Date(this.form.fecha_ingreso)
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0) // Resetear hora para comparación de fechas

            if (fechaIngreso > hoy) {
                this.$fire({
                    title: "Fecha Inválida",
                    html: `<p>La Fecha de Ingreso no puede ser una fecha futura.</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de detalles de nómina
                this.$refs.tabs.currentTab = 1
                this.overlay = false
                return
            }

            // 4. Validar Tipo de Compensación
            if (this.form.salario_tipo === null) {
                this.$fire({
                    title: "Campo Requerido",
                    html: `<p>Debe seleccionar el Tipo de Compensación en la pestaña "Detalles de Nómina".</p>`,
                    type: "warning",
                })
                // Cambiar a la pestaña de detalles de nómina
                this.$refs.tabs.currentTab = 1
                this.overlay = false
                return
            }

            // 5. Validaciones según tipo de compensación (existentes)
            if (this.form.salario_tipo === 'Salario' || this.form.salario_tipo === 'Salario más Comisión') {
                if (!this.form.salario || this.form.salario <= 0) {
                    this.$fire({
                        title: "Campo requerido",
                        html: `<p>Debe ingresar un salario válido (mayor a 0) en la pestaña "Detalles de Nómina".</p>`,
                        type: "warning"
                    })
                    // Cambiar a la pestaña de detalles de nómina
                    this.$refs.tabs.currentTab = 1
                    this.overlay = false
                    return
                }
                if (!this.form.periodo_pago) {
                    this.$fire({
                        title: "Campo requerido",
                        html: `<p>Debe seleccionar un periodo de pago en la pestaña "Detalles de Nómina".</p>`,
                        type: "warning"
                    })
                    // Cambiar a la pestaña de detalles de nómina
                    this.$refs.tabs.currentTab = 1
                    this.overlay = false
                    return
                }
            }
            if (this.form.salario_tipo === 'Comisión' || this.form.salario_tipo === 'Salario más Comisión') {
                if (!this.form.comsionTipo) {
                    this.$fire({
                        title: "Campo requerido",
                        html: `<p>Debe seleccionar el tipo de comisión en la pestaña "Detalles de Nómina".</p>`,
                        type: "warning"
                    })
                    // Cambiar a la pestaña de detalles de nómina
                    this.$refs.tabs.currentTab = 1
                    this.overlay = false
                    return
                }
                if (this.form.comsionTipo === 'fija' && (!this.form.comision || this.form.comision < 0)) {
                    this.$fire({
                        title: "Campo requerido",
                        html: `<p>Debe ingresar una comisión fija válida en la pestaña "Detalles de Nómina".</p>`,
                        type: "warning"
                    })
                    // Cambiar a la pestaña de detalles de nómina
                    this.$refs.tabs.currentTab = 1
                    this.overlay = false
                    return
                }
                if (this.form.comsionTipo === 'porcentaje' && (!this.form.comisionPorcentaje || this.form.comisionPorcentaje <= 0 || this.form.comisionPorcentaje > 100)) {
                    this.$fire({
                        title: "Campo requerido",
                        html: `<p>Debe ingresar un porcentaje de comisión válido (entre 1 y 100) en la pestaña "Detalles de Nómina".</p>`,
                        type: "warning"
                    })
                    // Cambiar a la pestaña de detalles de nómina
                    this.$refs.tabs.currentTab = 1
                    this.overlay = false
                    return
                }
            }

            // --- CONSTRUCCIÓN DEL PAYLOAD ---

            const data = new URLSearchParams()
            // Datos Básicos y de Acceso
            data.set("acceso", this.form.acceso)
            data.set("email", this.form.email)
            data.set("nombre", this.form.nombre)
            data.set("password", this.form.password)
            data.set("username", this.form.username)
            data.set("telefono", this.form.telefono)
            data.set("departamentos", this.form.departamentos) // Se envía como string de array

            // Datos de Compensación (Salario y Comisión)
            data.set("salario_tipo", this.form.salario_tipo)
            data.set("salario", this.form.salario)
            data.set("periodo_pago", this.form.periodo_pago)
            data.set("comision", this.form.comision)
            data.set("comsion_tipo", this.form.comsionTipo)
            data.set("comision_porcentaje", this.form.comisionPorcentaje)
            
            // NUEVOS DATOS DE NÓMINA (Para la tabla empresas_usuarios / salario_empleado)
            data.set("id_legal", this.form.id_legal)
            data.set("fecha_ingreso", this.form.fecha_ingreso)
            data.set("id_seguridad_social", this.form.id_seguridad_social)

            // --- VALIDACIÓN CARGA FAMILIAR ---

            // 6. Validar carga familiar (cada dependiente debe tener nombre y parentesco)
            for (let i = 0; i < this.form.dependientes.length; i++) {
                const dep = this.form.dependientes[i]
                if (!dep.nombre_completo || !dep.parentesco) {
                    this.$fire({
                        title: "Campos Requeridos en Carga Familiar",
                        html: `<p>El dependiente ${i + 1} debe tener al menos nombre completo y parentesco en la pestaña "Carga Familiar".</p>`,
                        type: "warning",
                    })
                    // Cambiar a la pestaña de carga familiar
                    this.$refs.tabs.currentTab = 2
                    this.overlay = false
                    return
                }
            }

            // 7. Verificar si hay información de carga familiar
            const tieneCargaFamiliar = this.form.dependientes.length > 0

            if (!tieneCargaFamiliar) {
                // Mostrar confirmación si no hay carga familiar
                try {
                    const confirmacion = await this.$confirm(
                        `¿Está seguro de guardar el empleado <b>${this.form.nombre}</b> sin información de carga familiar?`,
                        "Confirmar Registro",
                        "question"
                    )
                    if (!confirmacion) {
                        this.overlay = false
                        return
                    }
                } catch (error) {
                    // Si el usuario cancela el confirm, quitar el overlay
                    this.overlay = false
                    return
                }
            }

            // CARGA FAMILIAR (Se envía como JSON string para ser parseado en Slim Framework)
            // Esto permite que el backend registre la información en salario_carga_familiar
            data.set("dependientes_json", JSON.stringify(this.form.dependientes))


            // --- LLAMADA A LA API ---

            await this.$axios
                .post(`${this.$config.API}/empleados/nuevo`, data)
                .then((res) => {
                    this.$fire({
                        title: "¡Éxito!",
                        html: `<p>Empleado <b>${this.form.nombre}</b> registrado correctamente.</p>`,
                        type: "success",
                    })
                    this.resetForm()
                    this.$bvModal.hide(this.modal)
                })
                .catch(error => {
                    this.$fire({
                        title: "Error de Registro",
                        html: `<p>Ocurrió un error al guardar: ${error.response ? error.response.data.message : error.message}</p>`,
                        type: "error",
                    })
                })
                .finally(() => {
                    this.overlay = false
                    this.$emit("reload")
                })
        },
        onSubmit(event) {
            event.preventDefault()
            this.guardarEmpleado()
        },
        onReset(event) {
            event.preventDefault()
            this.resetForm()
            this.show = false
            this.$nextTick(() => { this.show = true })
        },

        // Métodos para gestión de carga familiar
        agregarDependiente() {
            this.form.dependientes.push({
                nombre_completo: '',
                cedula_o_id: '',
                parentesco: '',
                fecha_nacimiento: null,
                es_deducible: false
            })
        },

        removerDependiente(index) {
            this.form.dependientes.splice(index, 1)
        },
    },

    props: ['reload', 'departamentos']
}
</script>