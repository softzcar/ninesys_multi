<template>
    <div>
        <b-overlay :show="overlay" spinner-small>
            <b-table striped :fields="fields2" :items="items">
                <template #cell(cantidad)="data">
                    {{ data.item.unidades * data.item.valor_eficiencia }} Min.
                </template>
            </b-table>

            <!-- Usamos la computed property aquí -->
            <b-table striped :fields="fields3" :items="processedMaterialData">
                <template #cell(id_catalogo_insumos_productos)="data">
                    {{
                        reduccionDeinsumos(
                            data.item.id_catalogo_insumos_productos
                        )
                    }}
                </template>
            </b-table>

            <!-- <pre class="force" style="background-color: darkmagenta">
                FORM (Prop)
                {{ form }}

                processedMaterialData (Computed)
                {{ processedMaterialData }}
            </pre> -->
        </b-overlay>
    </div>
</template>

<script>
import mixin from "~/mixins/mixins.js"; // Asumo que este mixin no interfiere con la lógica principal

export default {
    mixins: [mixin],
    props: ["items", "datainsumos", "form"], // 'items' parece ser para la primera tabla
    data() {
        return {
            title: "Matariales Utilizados",
            overlay: false,
            fields2: [
                { key: "name", label: "Producto" },
                { key: "nombre", label: "Insumo" },
                { key: "talla", label: "Talla" },
                { key: "unidades", label: "Unidades" },
                { key: "cantidad", label: "Estimado" },
            ],
            fields3: [
                { key: "catalogo", label: "Insumo" },
                { key: "porcentaje_consumo", label: "Eficiencia" },
            ],
            // ordenesActivas y ordenesLength no parecen usarse en este fragmento
        };
    },
    computed: {
        processedMaterialData() {
            console.log("CALCULANDO processedMaterialData (computed property)");
            // Accedemos a las props con 'this'
            const localDatainsumos = this.datainsumos;
            const localForm = this.form;

            console.log(
                "DataInsumos para computed:",
                JSON.stringify(localDatainsumos, null, 2)
            );
            console.log(
                "Form para computed:",
                JSON.stringify(localForm, null, 2)
            );

            if (!localDatainsumos || localDatainsumos.length === 0) {
                console.log(
                    "processedMaterialData: datainsumos vacío. Retornando []."
                );
                return [];
            }

            const safeForm = Array.isArray(localForm) ? localForm : [];
            // ... (logs de safeForm como antes si los necesitas)

            const agrupadosEstimado = localDatainsumos.reduce((acc, item) => {
                const idCatalogo = item.id_catalogo_insumos_productos;
                const consumoEstimadoActual =
                    parseFloat(item.unidades) *
                    parseFloat(item.cantidad_estimada_de_consumo);

                if (!acc[idCatalogo]) {
                    acc[idCatalogo] = {
                        id_catalogo_insumos_productos: idCatalogo,
                        catalogo: item.catalogo,
                        total_consumo_estimado: 0,
                    };
                }
                acc[idCatalogo].total_consumo_estimado += isNaN(
                    consumoEstimadoActual
                )
                    ? 0
                    : consumoEstimadoActual;
                return acc;
            }, {});

            const resultadoFinal = Object.values(agrupadosEstimado).map(
                (itemEstimado) => {
                    console.log(
                        `\n--- Procesando Catálogo ID: ${itemEstimado.id_catalogo_insumos_productos} (${itemEstimado.catalogo}) ---`
                    );

                    // ***** MODIFICACIÓN CLAVE AQUÍ *****
                    // Filtrar TODOS los items del form que coincidan con el idCatalogo actual
                    const matchingFormItems = safeForm.filter(
                        (f) =>
                            f.idCatalogo ===
                            itemEstimado.id_catalogo_insumos_productos
                    );

                    let consumoReal = 0;
                    if (matchingFormItems.length > 0) {
                        console.log(
                            `  Se encontraron ${matchingFormItems.length} items en 'form' para idCatalogo ${itemEstimado.id_catalogo_insumos_productos}:`,
                            matchingFormItems.map((fi) => fi.input)
                        );

                        // Sumar los 'input' de todos los items encontrados
                        consumoReal = matchingFormItems.reduce(
                            (sum, currentFormItem) => {
                                let currentItemInputValue = 0;
                                if (
                                    currentFormItem.input !== null &&
                                    currentFormItem.input !== undefined
                                ) {
                                    const inputComoString = String(
                                        currentFormItem.input
                                    ).trim();
                                    if (inputComoString !== "") {
                                        const parsedInput =
                                            parseFloat(inputComoString);
                                        if (!isNaN(parsedInput)) {
                                            currentItemInputValue = parsedInput;
                                        } else {
                                            console.log(
                                                `    Input "${currentFormItem.input}" (item id: ${currentFormItem.id}) no es un número válido.`
                                            );
                                        }
                                    }
                                }
                                return sum + currentItemInputValue;
                            },
                            0 // Acumulador inicial en 0
                        );
                        console.log(
                            `  Suma de 'input' para idCatalogo ${itemEstimado.id_catalogo_insumos_productos}: ${consumoReal}`
                        );
                    } else {
                        console.log(
                            `  No se encontró ningún formItem para idCatalogo ${itemEstimado.id_catalogo_insumos_productos} en 'safeForm'.`
                        );
                    }
                    // ***** FIN DE MODIFICACIÓN CLAVE *****

                    console.log(
                        `  >>> consumoReal final para este item: ${consumoReal}`
                    );

                    let eficienciaPorcentaje = 0;
                    const totalConsumoEstimado =
                        itemEstimado.total_consumo_estimado;

                    if (totalConsumoEstimado > 0) {
                        eficienciaPorcentaje =
                            (consumoReal / totalConsumoEstimado) * 100;
                    } else if (
                        totalConsumoEstimado === 0 &&
                        consumoReal === 0
                    ) {
                        eficienciaPorcentaje = 100;
                    } else if (totalConsumoEstimado === 0 && consumoReal > 0) {
                        eficienciaPorcentaje = 0; // O manejar de otra forma si se consumió algo no estimado
                    }

                    const eficienciaFormateada =
                        eficienciaPorcentaje.toFixed(2);
                    const mensajeEficiencia = `Eficiencia para ${itemEstimado.catalogo}: ${eficienciaFormateada}%`;
                    const porcentajeConsumoStr = `${eficienciaFormateada}%`;

                    return {
                        id_catalogo_insumos_productos:
                            itemEstimado.id_catalogo_insumos_productos,
                        catalogo: itemEstimado.catalogo,
                        total_consumo: parseFloat(eficienciaFormateada),
                        porcentaje_consumo: porcentajeConsumoStr,
                        mensaje_eficiencia: mensajeEficiencia,
                        _consumo_estimado_original: parseFloat(
                            totalConsumoEstimado.toFixed(2)
                        ),
                        _consumo_real_ingresado: parseFloat(
                            consumoReal.toFixed(2)
                        ),
                    };
                }
            );

            console.log(
                "\nResultado Final de processedMaterialData:",
                JSON.stringify(resultadoFinal, null, 2)
            );
            return resultadoFinal;
        },
    },
    watch: {
        // El watch en 'form' ya no es necesario para recalcular
        // `processedMaterialData` porque las computed properties son reactivas
        // a sus dependencias (this.form y this.datainsumos).
        // Puedes mantenerlo si hacía algo más, pero para este cálculo, es redundante.
        /*
        form(newVal, oldVal) {
            console.log("Watcher: form cambió", newVal);
            // No es necesario llamar a un método de cálculo aquí si solo alimenta una computed property
        },
        */
    },
    methods: {
        // El método calculateItemsMaterialesLista original ya no es necesario
        // porque su lógica está ahora en la computed property.

        reduccionDeinsumos(idCatalogo) {
            // Asegúrate de que this.datainsumos es lo que esperas aquí
            if (!this.datainsumos) return "0.00";
            const total = this.datainsumos
                .filter((el) => el.id_catalogo_insumos_productos == idCatalogo)
                .reduce((acumulador, objeto) => {
                    return (
                        parseFloat(acumulador) +
                        parseFloat(
                            objeto.cantidad_estimada_de_consumo *
                                objeto.unidades
                        )
                    );
                }, 0);
            return total.toFixed(2);
        },

        async getInsumos() {
            // ... (tu lógica de getInsumos, pero cuidado si modifica 'datainsumos' directamente)
            // Si 'datainsumos' es una prop, este método debería emitir un evento al padre
            // para actualizar 'datainsumos' en el padre, o manejar el estado de forma diferente.
            // Por ahora, asumo que 'datainsumos' se maneja correctamente como prop.
            await this.$axios
                .get(
                    `${this.$config.API}/insumos-productos/${this.idorden}/${this.$store.state.login.currentDepartamentId}`
                )
                .then((res) => {
                    // Esto es problemático si 'datainsumos' es una prop.
                    // this.insumos = res.data;
                    // Deberías emitir un evento o usar Vuex si necesitas modificar datos que vienen del padre.
                    console.warn(
                        "getInsumos está intentando modificar this.insumos, lo cual puede no funcionar como se espera si 'datainsumos' es una prop. Considera emitir un evento."
                    );
                });
        },

        calcularPorcentajeDiferenciaTela() {
            // Esta función parece usar this.eficiencia_estimada y this.materialUtilizado
            // que no están definidos en el data de este componente.
            // Asegúrate de que estas propiedades existan o se pasen como props.
            console.warn(
                "calcularPorcentajeDiferenciaTela usa propiedades no definidas (eficiencia_estimada, materialUtilizado)."
            );
            // ... (resto de tu lógica)
            return "Datos incompletos para calcular diferencia.";
        },
    },
    mounted() {
        if (this.datainsumos && this.datainsumos.length > 0) {
            this.overlay = false;
        }
        // this.getInsumos().then(...) // Cuidado con esto si modifica props
    },
};
</script>

<style scoped>
.force {
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>