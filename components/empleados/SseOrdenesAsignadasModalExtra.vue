<template>
    <div>
        <span class="floatme">
            <b-button
                @click="$bvModal.show(modal)"
                variant="success"
                :disabled="ButtonDisabled"
                >{{ btnText }}</b-button
            >
        </span>

        <!-- Pausas -->
        <span class="floatme">
            <empleados-pausasEmpleados
                :pausas="filterPausa(item.id_orden)"
                :item="$props.item"
                @reload="reloadMe"
                @disBtnTodo="disBtnTodo"
            />
        </span>

        <b-modal :id="modal" :title="title" hide-footer size="sm">
            <b-overlay :show="overlay" spinner-small>
                <!-- Formulario de Impresión -->
                <!-- <div
                    v-if="
                        $store.state.login.currentDepartament === 'Impresión' ||
                        $store.state.login.currentDepartament === 'Estampado' ||
                        $store.state.login.currentDepartament === 'Corte' ||
                        $store.state.login.currentDepartament ===
                            'Corte de papel' ||
                        $store.state.login.currentDepartament === 'Costura' ||
                        $store.state.login.currentDepartament === 'Limpieza' ||
                        $store.state.login.currentDepartament === 'Revisión'
                    "
                > -->
                <!-- <pre style="display: block !important">
                    {{ $props.esreposicion }}
                  </pre
                    > -->
                <b-form @reset="onReserForm">
                    <div
                        v-if="
                            $store.state.login.currentDepartament ===
                            'Impresión'
                        "
                    >
                        <!-- Tintas -->
                        <b-form-group
                            id="input-group-1"
                            label="Tintas:"
                            label-for="input-1"
                        >
                            <b-form-input
                                id="input-1"
                                v-model="formImp.colorCyan"
                                placeholder="Cyan"
                                type="number"
                                step="0.01"
                                min="0"
                                class="cyan-label"
                            ></b-form-input>

                            <b-form-input
                                id="input-2"
                                v-model="formImp.colorMagenta"
                                placeholder="Magenta"
                                type="number"
                                step="0.01"
                                min="0"
                                class="magenta-label"
                            ></b-form-input>

                            <b-form-input
                                id="input-3"
                                v-model="formImp.colorYellow"
                                placeholder="Yellow"
                                type="number"
                                step="0.01"
                                min="0"
                                class="yellow-label"
                            ></b-form-input>

                            <b-form-input
                                id="input-4"
                                v-model="formImp.colorBlack"
                                placeholder="Black"
                                type="number"
                                step="0.01"
                                min="0"
                                class="black-label"
                            ></b-form-input>
                        </b-form-group>
                    </div>
                    <!-- MOSTRAR CANTIDAD DE MATERIAL UTILIZADO -->
                    <!-- <pre style="display: block !important">
                          {{ insumosimp }}
                         </pre
                        > -->
                    <div
                        v-if="
                            $store.state.login.currentDepartament ===
                                'Estampado' ||
                            $store.state.login.currentDepartament === 'Corte' ||
                            $store.state.login.currentDepartament ===
                                'Corte papel'
                        "
                    >
                        <p>
                            Material utilizado: {{ materialUtilizado }} Metros
                        </p>

                        <p>Rendimiento: {{ eficienciaCalculada }}</p>
                    </div>

                    <!-- MUESTRA ROLLOS DE MATEERIAL SI ESTA EN CONFIGURACION -->
                    <div v-if="showSelect">
                        <b-button
                            variant="light"
                            @click="addItem"
                            aria-label="Agregar insumo"
                        >
                            <b-icon icon="plus-lg"></b-icon>
                        </b-button>
                        <b-table
                            responsive
                            :primary-key="form.id"
                            :fields="campos"
                            :items="form"
                            small
                        >
                            <template #cell(input)="row">
                                <vue-typeahead-bootstrap
                                    @hit="loadInsumos(row.index)"
                                    :data="dataSearchInsumo"
                                    size="lg"
                                    v-model="form[row.index].select"
                                    placeholder="Buscar Insumo"
                                />

                                <!-- <b-form-select id="input-6" v-model="form[row.index].select"
                                        :options="selectOptions" required></b-form-select> -->
                                <b-form-input
                                    id="input-7"
                                    v-model="form[row.index].input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Peso"
                                    required
                                ></b-form-input>
                            </template>

                            <template #cell(id)="row">
                                <b-button
                                    variant="danger"
                                    @click="removeItem(row.index)"
                                    aria-label="Agregar insumo"
                                >
                                    <b-icon icon="trash"></b-icon>
                                </b-button>

                                <b-button
                                    variant="primary"
                                    @click="terminarRollo(row.index)"
                                    aria-label="Agregar insumo"
                                >
                                    <b-icon icon="stoplights"></b-icon>
                                </b-button>
                            </template>
                        </b-table>
                    </div>

                    <div
                        v-if="$store.state.login.currentDepartament === 'Corte'"
                    >
                        <p>Peso del desperdicio en kilos</p>
                        <b-form-input
                            id="input-13"
                            v-model="formCor.input"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Peso desperdicio"
                            required
                            class="mb-4"
                        ></b-form-input>
                    </div>

                    <b-button
                        :disbaled="ButtonDisabled"
                        @click="validateForm"
                        ButtonDisabled
                        variant="primary"
                        >Enviar</b-button
                    >
                    <b-button
                        :disbaled="ButtonDisabled"
                        type="reset"
                        variant="danger"
                        >Borrar</b-button
                    >
                </b-form>
                <!-- </div> -->
                <pre class="force">{{ form }}</pre>
            </b-overlay>
        </b-modal>
    </div>
</template>

<script>
import eficienciaInsumoMixin from "~/mixins/mixin-insumos";
export default {
    mixins: [eficienciaInsumoMixin],
    data() {
        return {
            queryInsumo: "",
            title: `Datos Extra ${this.$store.state.login.currentDepartament}`,
            overlay: false,
            btnText: "Terminar",
            ButtonDisabled: false,
            form: [],
            insumos: [],
            resultadoRendimiento: null,
            showSelect: false,
            formEst: {
                input: 0,
            },
            formCor: {
                input: 0,
            },
            formImp: {
                colorCyan: "",
                colorMagenta: "",
                colorYellow: "",
                colorBlack: "",
            },
            campos: [
                { key: "input", label: "" },
                { key: "id", label: "" },
            ],
            datosEficiencia: {},
            eficienciaCalculada: null,
            intentoDeCalculo: false,
        };
    },

    computed: {
        materialUtilizado() {
            return (this.item.valor_inicial - this.item.valor_final).toFixed(2);
        },

        modal: function () {
            const rand = Math.random().toString(36).substring(2, 7);
            return `modal-${rand}`;
        },

        dataSearchInsumo() {
            let tmpArray = [];

            if (this.$store.state.login.currentDepartament === "Impresión") {
                tmpArray = this.insumosimp;
                this.insumos = this.insumosimp;
            } else if (
                this.$store.state.login.currentDepartament === "Estampado"
            ) {
                tmpArray = this.insumosest;
                this.insumos = this.insumosest;
            } else if (this.$store.state.login.currentDepartament === "Corte") {
                tmpArray = this.insumosest;
                this.insumos = this.insumosest;
            } else if (
                this.$store.state.login.currentDepartament === "Costura"
            ) {
                tmpArray = this.insumoscos;
                this.insumos = this.insumoscos;
            } else if (
                this.$store.state.login.currentDepartament === "Limpieza"
            ) {
                tmpArray = this.insumoslim;
                this.insumos = this.insumoslim;
            } else if (
                this.$store.state.login.currentDepartament === "Revisión"
            ) {
                tmpArray = this.insumosrev;
                this.insumos = this.insumosrev;
            }

            return tmpArray.map((el) => {
                return `${el._id} | ${el.insumo}`;
            });
        },

        selectOptions() {
            let myOptions = [];
            if (this.$store.state.login.currentDepartament === "Impresión") {
                myOptions = this.insumosimp;
            } else if (
                this.$store.state.login.currentDepartament === "Estampado"
            ) {
                myOptions = this.insumosest;
            } else if (this.$store.state.login.currentDepartament === "Corte") {
                myOptions = this.insumosest;
            } else if (
                this.$store.state.login.currentDepartament === "Costura"
            ) {
                myOptions = this.insumoscos;
            } else if (
                this.$store.state.login.currentDepartament === "Limpieza"
            ) {
                myOptions = this.insumoslim;
            } else if (
                this.$store.state.login.currentDepartament === "Revisión"
            ) {
                myOptions = this.insumosrev;
            }

            let options = myOptions.map((item) => {
                return {
                    text: `${item._id} | ${item.insumo} (${item.cantidad} ${item.unidad})`,
                    value: parseInt(item._id),
                };
            });
            options.unshift({ text: "Seleccione una opción", value: null });
            return options;
        },
    },

    methods: {
        reloadMe() {
            this.$emit("reload", "true");
        },

        disBtnTodo(action) {
            if (action) {
                this.ButtonDisabled = true;
            } else {
                this.ButtonDisabled = false;
            }
        },

        filterPausa(idOrden) {
            return this.pausas.filter((el) => el.id_orden == idOrden);
        },

        loadInsumos(index) {
            let myID = this.form[index].select.split(" | ");
            console.log("ID Insumo seleccionado", myID[0]);
            // this.form[index].select = parseInt(myID);
            this.form[index].select = myID[0].toString();
            console.log("ID LISTO", this.form[index].select);
            console.log("form", this.form);

            // CALCULAR EL RENDIMIENTO DEL MATERIAL
            this.getDataEficiencia(
                this.idorden,
                this.$store.state.login.currentDepartamentId
            ).then(() => this.calcular());

            // CALCULAR EL RENDIMIENTO DEL MATERIAL
            /* const itemFiltrado = this.insumos.filter(
                (el) => el._id == this.form[index].select
            );

            this.resultadoRendimiento = `Calcular y comparar rendimiento del manterial aqui con un consumo de matarial ID ${this.form[index].select} de ${this.materialUtilizado} metros, con una rendimienot de ... ${itemFiltrado[0].rendimiento}`;

            console.log(
                `Calcular y comparar rendimiento del manterial aqui con un consumo de matarial ID ${this.form[index].select} de ${this.materialUtilizado} metros, con una rendimienot de ... ${itemFiltrado[0].rendimiento}`,
                itemFiltrado
            ); */
        },

        generateRandomId() {
            let id;
            do {
                // Generar un número aleatorio entre 100000 y 9999999
                id =
                    Math.floor(Math.random() * (9999999 - 100000 + 1)) + 100000;
            } while (this.form.some((obj) => obj.id === id)); // Asegurarse de que el ID no esté repetido en el array
            return id;
        },

        addItem() {
            // const dep = this.$store.state.login.currentDepartament
            const obj = {
                id: this.generateRandomId(),
                select: null,
                input: 0.0,
            };
            this.form.push(obj);
        },

        removeItem(index) {
            this.form.splice(index, 1);
        },

        terminarRollo(index) {
            this.$confirm(
                `¿Desea terminar el rollo Index: ${this.form[index]}?`,
                "Terminar Rollo",
                "question"
            )
                .then(() => {
                    console.log(
                        "vamos a terminar este rollo",
                        this.form[index]
                    );
                    this.overlay = true;
                    // this.enviarEstatus('Aprobado').then(() => (this.overlay = false))
                    this.postInventarioMovimientos(
                        // this.formImp.inputImp1,
                        this.form[index].input,
                        this.form[index].select,
                        this.item.id_woo
                    ).then(() => {
                        this.form.splice(index, 1);
                    });
                })
                .catch(() => {
                    return false;
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        token() {
            const length = 8;
            var a =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
                    ""
                );
            var b = [];
            for (var i = 0; i < length; i++) {
                var j = (Math.random() * (a.length - 1)).toFixed(0);
                b[i] = a[j];
            }
            return b.join("");
        },

        /* terminaMe() {
            if (this.$store.state.login.currentDepartament === "Impresión") {
                this.validateImp();
            } else if (this.$store.state.login.currentDepartament === "Estampado") {
                this.validateEst();
            } else if (this.$store.state.login.currentDepartament === "Corte") {
                this.validateCor();
            } else if (this.$store.state.login.currentDepartament === "Costura") {
                this.validateCor();
            }
        }, */

        async rendimiento(valor, idOrden) {
            const data = new URLSearchParams();
            data.set("id_orden", idOrden);
            data.set("valor", valor);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set(
                "departamento",
                this.$store.state.login.currentDepartament
            );

            await this.$axios
                .post(`${this.$config.API}/insumos/rendimiento`, data)
                .then((res) => {
                    console.log("Rendimienot enviado");
                    // this.resetForm()
                    // this.$bvModal.hide(this.modal)
                });
        },

        clearForms() {
            this.form = [];
            this.formImp = {
                colorCyan: "",
                colorMagenta: "",
                colorYellow: "",
                colorBlack: "",
            };

            this.formEst = {
                input: 0,
            };

            this.formCor = {
                input: 0,
            };
        },

        onReserForm(event) {
            event.preventDefault();
            this.clearForms();
        },

        // VALIDACIÓN DE FORMULARIOS
        validateForm() {
            let ok = true;
            if (this.showSelect) {
                let msg = "";

                if (
                    this.$store.state.login.currentDepartament === "Impresión"
                ) {
                    if (
                        parseFloat(this.formImp.colorCyan) <= 0 ||
                        this.formImp.colorCyan.trim() === ""
                    ) {
                        ok = false;
                        msg = msg + "<p>Ingrese la cantidad de tinta Cyan</p>";
                    }

                    if (
                        parseFloat(this.formImp.colorMagenta) <= 0 ||
                        this.formImp.colorMagenta.trim() === ""
                    ) {
                        ok = false;
                        msg =
                            msg + "<p>Ingrese la cantidad de tinta Magenta</p>";
                    }

                    if (
                        parseFloat(this.formImp.colorYellow) <= 0 ||
                        this.formImp.colorYellow.trim() === ""
                    ) {
                        ok = false;
                        msg =
                            msg + "<p>Ingrese la cantidad de tinta Yellow</p>";
                    }

                    if (
                        this.formImp.colorBlack.trim() === "" ||
                        parseFloat(this.formImp.colorBlack) <= 0
                    ) {
                        ok = false;
                        msg = msg + "<p>Ingrese la cantidad de tinta Black</p>";
                    }
                }

                if (this.$store.state.login.currentDepartament === "Corte") {
                    // VALIDAR DESPERDICIO
                    if (this.formCor.input === 0) {
                        ok = false;
                        msg = msg + "<p>Ingrese el peso del desperdicio</p>";
                    }
                }

                if (this.form.length === 0) {
                    ok = false;
                    msg = msg + "<p>Debe asignar al menos un insumo</p>";
                }

                const formTmp = this.form;

                const errors = formTmp.find(
                    (el) => el.input === 0 || el.select === null
                );

                if (errors) {
                    ok = false;
                    msg =
                        msg +
                        "<p>Debe llenar todos los campos del formulario</p>";
                }

                if (!ok) {
                    this.$fire({
                        type: "info",
                        title: "Datos requeridos",
                        html: msg,
                    });

                    // ok = false;
                } else {
                    if (
                        this.$store.state.login.currentDepartament ===
                        "Impresión"
                    ) {
                        this.postImp();
                    }

                    if (
                        this.$store.state.login.currentDepartament === "Corte"
                    ) {
                        // Enviar desperdicio
                        this.rendimiento(this.formCor.input, this.idorden);
                    }
                    this.terminarTodo();
                    this.$emit("reload");
                }
            } else {
                // Enviar solo el formulario aqui
                this.terminarTodo();
                this.$emit("reload");
            }

            return ok;
        },

        async postImp() {
            // this.overlay = true
            const data = new URLSearchParams();
            data.set("id_orden", this.idorden);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set("c", this.formImp.colorCyan);
            data.set("m", this.formImp.colorMagenta);
            data.set("y", this.formImp.colorYellow);
            data.set("k", this.formImp.colorBlack);

            await this.$axios
                .post(`${this.$config.API}/empleados/tintas`, data)
                .then((res) => {
                    // this.overlay = false
                    // this.clearForms();
                    this.$emit("reload", "true");
                    // this.urlLink = res.data.linkdrive
                });

            // this.terminarTodo()
        },

        async postEst() {
            this.overlay = true;
            /* const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("desperdicio", this.formEst.input);

      await this.$axios
        .post(`${this.$config.API}/empleados/tintas`, data)
        .then((res) => {
          this.overlay = false;
          this.clearForms();
          this.$emit("reload", "true");
          // this.urlLink = res.data.linkdrive
        });
 */
            this.terminarTodo();
            /* this.postInventarioMovimientos(
        this.formEst.inputEst1,
        this.formEst.selectedEst1
      ); */

            // this.terminarTodo()
        },

        async postForm() {
            this.overlay = true;
            /* const data = new URLSearchParams();
      data.set("id_orden", this.idorden);
      data.set("id_empleado", this.$store.state.login.dataUser.id_empleado);
      data.set("desperdicio", this.formEst.input);

      await this.$axios
        .post(`${this.$config.API}/empleados/tintas`, data)
        .then((res) => {
          this.overlay = false;
          this.clearForms();
          this.$emit("reload", "true");
          // this.urlLink = res.data.linkdrive
        });
 */
            this.terminarTodo();
            /* this.postInventarioMovimientos(
        this.formEst.inputEst1,
        this.formEst.selectedEst1
      ); */

            // this.terminarTodo()
        },

        async postInventarioMovimientos(
            cantidadConsumida,
            idInsumo,
            idProducto
        ) {
            // this.overlay = true;
            // Buscar cantidad actual del insumo
            console.log("Entramos a postInventarioMovimientos");
            let cantidadInsumo;
            if (this.$store.state.login.currentDepartament === "Impresión") {
                cantidadInsumo = this.insumosimp.filter(
                    (item) => item._id == idProducto
                );
            } else if (
                this.$store.state.login.currentDepartament === "Estampado"
            ) {
                console.log("enviemos datos de estampado");
                cantidadInsumo = this.insumosest.filter(
                    (item) => item._id == idProducto
                );
            } // (else if...) Continuar con los otros departamentos aqui.
            else if (this.$store.state.login.currentDepartament === "Corte") {
                cantidadInsumo = this.insumoscor.filter(
                    (item) => item._id == idProducto
                );
            }
            /* console.log("producto filtrado para obtener la cantidad", cantidadInsumo);
      console.log("cantidad inicial", cantidadInsumo);
      console.log("cantidad final", cantidadConsumida); */

            const data = new URLSearchParams();
            data.set("id_orden", this.idorden);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set(
                "id_departamento",
                this.$store.state.login.currentDepartamentId
            );
            data.set(
                "departamento",
                this.$store.state.login.currentDepartament
            );
            data.set("id_insumo", idInsumo);
            data.set("id_ordenes_productos", this.id_ordenes_productos);
            data.set("es_reposicion", parseInt(this.esreposicion));
            data.set("id_producto", this.item.id_woo);
            data.set(
                "id_departamento",
                this.$store.state.login.currentDepartamentId
            );
            // data.set("cantidad_inicial", cantidadInsumo.cantidad);
            data.set("cantidad_consumida", cantidadConsumida);
            data.set("tipo", "fin");
            await this.$axios
                .post(
                    `${this.$config.API}/inventario-movimientos/empleados/update-insumo`,
                    data
                )
                .then((res) => {
                    // this.overlay = false;
                    // this.$emit("reload", this.index, this.value);
                })
                .catch((err) => {
                    console.log("Error guardando inventario_movimoentos", err);

                    /* this.$fire({
            title: "Error actualizando cantiad del insumo",
            html: `<p>${err}</p>`,
            type: "danger",
          });
          this.overlay = false; */
                })
                .finally(() => {
                    // this.overlay = false;
                    // console.log("vamos a enviar reload al padre!!!!");
                });
        },

        async postReposicion() {
            const data = new URLSearchParams();
            data.set("id_orden", idOrden);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set("terminar", 1);
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set(
                "departamento",
                this.$store.state.login.currentDepartament
            );

            await this.$axios
                .post(`${this.$config.API}/insumos/rendimiento`, data)
                .then((res) => {
                    console.log("Rendimienot enviado");
                    // this.resetForm()
                    // this.$bvModal.hide(this.modal)
                });
        },

        async registrarEstado(tipo, id_orden, unidades) {
            this.overlay = true;
            const data = new URLSearchParams();
            data.set(
                "id_empleado",
                this.$store.state.login.dataUser.id_empleado
            );
            data.set(
                "id_departamento",
                this.$store.state.login.currentDepartamentId
            );
            data.set("id_lotes_detalles", this.idlotesdetalles);
            data.set("id_orden", id_orden);
            data.set("tipo", tipo);
            data.set("unidades", unidades);
            data.set(
                "departamento",
                this.$store.state.login.currentDepartament
            );

            await this.$axios
                .post(`${this.$config.API}/registrar-paso-empleado`, data)
                .then((res) => {
                    console.log("emitimos aqui...");
                    this.$emit("reload", "true");
                    this.overlay = false;
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<p>No se pudo registrar la acción</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },

        terminarTodo() {
            this.registrarEstado("fin", this.idorden, 0);
            this.form.forEach((el) => {
                console.log("Enviamos elemento del formulario", el);

                this.postInventarioMovimientos(
                    // this.formImp.inputImp1,
                    el.input,
                    el.select,
                    this.item.id_woo
                );
            });

            if (this.items.length) {
                // this.registrarEstado("fin", this.idorden, 0).then(() => {
                // Enviar mensaje al cliente
                // this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
                //     // console.log('Modal is about to be shown', bvEvent, modal)
                //     });
                // });
                /* this.$emit(
                    "registrarestado",
                    "fin",
                    this.idorden,
                    this.item.unidades
                ); */
                /* this.items.forEach((item) => {
                    // enviar estado

                    this.registrarEstado(
                        "fin",
                        this.idorden,
                        item.unidades
                    ).then(() => {
                        // Enviar mensaje al cliente
                        // this.$root.$on("bv::modal::hide", (bvEvent, modal) => {
                        //     // console.log('Modal is about to be shown', bvEvent, modal)
                        //     });
                    });
                }); */
            }
            // this.clearForms()
            this.$emit("reload");
            this.$bvModal.hide(this.modal);
            // this.clearForms();
        },

        /* async registrarEstado_old(tipo, id_lotes_detalles, unidades) {
            // tipos: inicio, fin
            this.overlay = true;
            this.ButtonDisabled = true;

            await this.$axios
                .post(
                    `${this.$config.API}/empleados/registrar-paso/${tipo}/${this.$store.state.login.currentDepartamentId}/${id_lotes_detalles}/${unidades}`
                )
                .then((resp) => {
                    console.log("emitimos aqui...");
                    this.overlay = false;
                    this.$bvModal.hide(this.modal);

                    // this.$emit('reload', 'true')
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error registrando la accion",
                        html: `<p>Por favor intetelo de nuevo</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    if (tipo === "fin") {
                        this.$emit("reload");
                    }
                });
        }, */

        calcular() {
            this.intentoDeCalculo = true;
            this.eficienciaCalculada = this.calcularEficienciaInsumo(
                this.datosEficiencia
            );

            // Ejemplo de cómo podrías usarlo con otros datos
            // const otrosDatos = {
            //   cantidadProductosOrden: 10,
            //   consumoRealTotalOrdenUnidadBase: 0, // No se usó este insumo
            //   factorConversionUnidadInsumo: 5,
            //   consumoTeoricoPorProductoUnidadConvertida: 1
            // };
            // const otraEficiencia = this.calcularEficienciaInsumo(otrosDatos);
            // console.log('Otra eficiencia:', otraEficiencia); // Debería ser Infinity

            // const datosConDesperdicio = {
            //   cantidadProductosOrden: 5,
            //   consumoRealTotalOrdenUnidadBase: 0.5, // Se gastó 0.5 kg
            //   factorConversionUnidadInsumo: 1, // kg a kg (sin conversión)
            //   consumoTeoricoPorProductoUnidadConvertida: 0 // No se esperaba gastar nada
            // };
            // const eficienciaDesperdicio = this.calcularEficienciaInsumo(datosConDesperdicio);
            // console.log('Eficiencia con desperdicio:', eficienciaDesperdicio); // Debería ser 0
        },

        async getDataEficiencia(idOrden, idDep) {
            this.overlay = true;
            await this.$axios
                .get(
                    `${this.$config.API}/inventario/eficiencia/${idOrden}/${idDep}`
                )
                .then((res) => {
                    console.log("datos:", res.data[0]);

                    this.datosEficiencia = res.data[0];
                })
                .catch((err) => {
                    this.$fire({
                        title: "Error",
                        html: `<P>No se cargaron los datos correctamente</p><p>${err}</p>`,
                        type: "warning",
                    });
                })
                .finally(() => {
                    this.overlay = false;
                });
        },
    },

    mounted() {
        this.clearForms();
        if (this.tipo === "todo") this.btnText = `Terminar Todo`;
        // this.departamento = this.$store.state.login.currentDepartament

        if (this.$store.state.login.currentDepartament === "Impresión") {
            this.showSelect = true;
        } else {
            //  VEERIFICAR DEPARTAMENTOS
            const dep = this.$store.state.login.currentDepartament;

            const showEstampado =
                this.$store.state.datasys.dataSys
                    .sys_mostrar_rollo_en_empleado_estampado;

            const showCorte =
                this.$store.state.datasys.dataSys
                    .sys_mostrar_rollo_en_empleado_corte;

            const showCostura =
                this.$store.state.datasys.dataSys
                    .sys_mostrar_insumo_en_empleado_costura;

            const showLimpieza =
                this.$store.state.datasys.dataSys
                    .sys_mostrar_insumo_en_empleado_limpieza;

            const showRevision =
                this.$store.state.datasys.dataSys
                    .sys_mostrar_insumo_en_empleado_revision;

            if (dep === "Estampado" && showEstampado) {
                this.showSelect = true;
            }

            if (dep === "Corte" && showCorte) {
                this.showSelect = true;
            }

            if (dep === "Costura" && showCostura) {
                this.showSelect = true;
            }

            if (dep === "Limpieza" && showLimpieza) {
                this.showSelect = true;
            }

            if (dep === "Revisión" && showRevision) {
                this.showSelect = true;
            }
        }
    },

    props: [
        "item",
        "items",
        "pausas",
        "idlotesdetalles",
        "tipo",
        "departamento",
        "esreposicion",
        "insumosimp",
        "insumoscos",
        "insumoslim",
        "insumosrev",
        "insumosest",
        "insumoscor",
        "idorden",
        "id_ordenes_productos",
        "reload",
        "registrarestado",
    ],
};
</script>

<style scoped>
.cmyk {
    margin-top: 20px;
    padding: 2px !important;
    width: 30% !important;
}

.black-label {
    background-color: black;
    color: antiquewhite;
}

.cyan-label {
    background-color: cyan;
    color: black;
}

.yellow-label {
    background-color: yellow;
    color: black;
}

.magenta-label {
    background-color: magenta;
    color: black;
}
</style>
