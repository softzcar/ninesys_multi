<template>
    <div>
        <h1>Cálculo de Eficiencia del Insumo</h1>
        <button @click="calcular">Calcular Eficiencia</button>
        <div v.if="eficienciaCalculada !== null">
            <p>Cantidad de Productos: {{ datos.cantidadProductosOrden }}</p>
            <p>
                Consumo Real (unidad base):
                {{ datos.consumoRealTotalOrdenUnidadBase }}
            </p>
            <p>Factor Conversión: {{ datos.factorConversionUnidadInsumo }}</p>
            <p>
                Consumo Teórico por Producto (unidad convertida):
                {{ datos.consumoTeoricoPorProductoUnidadConvertida }}
            </p>

            <p v-if="eficienciaCalculada === Infinity">
                <strong
                    >Eficiencia del Insumo: Perfecta / Infinita (No se consumió
                    material esperado)</strong
                >
            </p>
            <p v-else>
                <strong
                    >Eficiencia del Insumo: {{ eficienciaCalculada }}%</strong
                >
            </p>
            <p v-if="eficienciaCalculada !== Infinity">
                <span v-if="eficienciaCalculada > 100"
                    >¡Excelente! Se usó menos material del esperado.</span
                >
                <span v-else-if="eficienciaCalculada === 100"
                    >¡Perfecto! Se usó exactamente el material esperado.</span
                >
                <span
                    v-else-if="
                        eficienciaCalculada < 100 && eficienciaCalculada >= 0
                    "
                    >Se usó más material del esperado.</span
                >
                <span
                    v-else-if="
                        eficienciaCalculada === 0 &&
                        datos.consumoRealTotalOrdenUnidadBase > 0 &&
                        datos.consumoTeoricoPorProductoUnidadConvertida === 0
                    "
                    >Se consumió material no esperado (Desperdicio).</span
                >
            </p>
        </div>
        <div v-if="eficienciaCalculada === null && intentoDeCalculo">
            <p>
                Error: No se pudo calcular la eficiencia. Revisa los datos de
                entrada.
            </p>
        </div>
    </div>
</template>

<script>
import eficienciaInsumoMixin from "~/mixins/eficienciaInsumoMixin"; // Ajusta la ruta si es necesario

export default {
    name: "PaginaEjemploEficiencia",
    mixins: [eficienciaInsumoMixin],
    data() {
        return {
            datos: {
                cantidadProductosOrden: 12, // ej: 12 franelas
                consumoRealTotalOrdenUnidadBase: 2.5, // ej: 2.5 kg de tela
                factorConversionUnidadInsumo: 4, // ej: 1 kg de tela rinde 4 metros
                consumoTeoricoPorProductoUnidadConvertida: 0.8, // ej: 1 franela debería usar 0.8 metros de tela
            },
            eficienciaCalculada: null,
            intentoDeCalculo: false,
        };
    },
    methods: {
        calcular() {
            this.intentoDeCalculo = true;
            this.eficienciaCalculada = this.calcularEficienciaInsumo(
                this.datos
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
    },
    mounted() {
        // Podrías calcularlo al montar el componente si los datos ya están disponibles
        // this.calcular();
    },
};
</script>

<style scoped>
/* Estilos opcionales */
div {
    margin-bottom: 10px;
}
p {
    margin: 5px 0;
}
</style>