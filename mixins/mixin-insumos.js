// mixins/eficienciaInsumoMixin.js

export default {
  methods: {
    /**
     * Calcula la eficiencia de un insumo para una orden de producción.
     * La eficiencia se define como (Consumo Teórico Total / Consumo Real Total) * 100.
     * Un valor > 100% indica que se usó menos material del esperado (buena eficiencia).
     * Un valor < 100% indica que se usó más material del esperado (mala eficiencia).
     *
     * @param {Object} datosCalculo - Objeto con los datos para el cálculo.
     * @param {number} datosCalculo.cantidadProductosOrden - Número de productos en la orden (ej: 12).
     * @param {number} datosCalculo.consumoRealTotalOrdenUnidadBase - Cantidad real total del insumo consumido para la orden, en su unidad base (ej: 2.5 para kg).
     * @param {number} datosCalculo.factorConversionUnidadInsumo - Factor para convertir el insumo de su unidad base a la unidad de comparación/teórica (ej: si 1kg rinde 4 metros, el factor es 4).
     * @param {number} datosCalculo.consumoTeoricoPorProductoUnidadConvertida - Cantidad teórica del insumo (en unidad convertida) que UN producto debería consumir (ej: 0.8 para metros por producto).
     * @returns {number|null} La eficiencia como porcentaje (ej: 95.5 para 95.5%),
     *                        Infinity si el consumo real fue 0 pero se esperaba consumir,
     *                        o null si los datos de entrada son inválidos o no permiten el cálculo.
     */
    calcularEficienciaInsumo({
      cantidadProductosOrden,
      consumoRealTotalOrdenUnidadBase,
      factorConversionUnidadInsumo,
      consumoTeoricoPorProductoUnidadConvertida
    }) {
      // Validación de entradas numéricas y positivas (o cero para consumos)
      if (
        typeof cantidadProductosOrden !== 'number' || cantidadProductosOrden <= 0 ||
        typeof consumoRealTotalOrdenUnidadBase !== 'number' || consumoRealTotalOrdenUnidadBase < 0 || // El consumo real podría ser 0
        typeof factorConversionUnidadInsumo !== 'number' || factorConversionUnidadInsumo <= 0 ||
        typeof consumoTeoricoPorProductoUnidadConvertida !== 'number' || consumoTeoricoPorProductoUnidadConvertida < 0 // El teórico podría ser 0 si el producto no requiere este insumo
      ) {
        console.error('[Mixin EficienciaInsumo] Datos de entrada inválidos:', {
          cantidadProductosOrden,
          consumoRealTotalOrdenUnidadBase,
          factorConversionUnidadInsumo,
          consumoTeoricoPorProductoUnidadConvertida
        });
        return null;
      }

      // 1. Calcular el Consumo REAL Total para la Orden (en unidad convertida)
      // Ej: 2.5 kg de tela * 4 metros/kg = 10 metros de tela consumidos realmente.
      const consumoRealTotalOrdenUnidadConvertida = consumoRealTotalOrdenUnidadBase * factorConversionUnidadInsumo;

      // 2. Calcular el Consumo TEÓRICO Total para la Orden (en unidad convertida)
      // Ej: 12 franelas * 0.8 metros/franela (teórico) = 9.6 metros de tela teóricos.
      const consumoTeoricoTotalOrdenUnidadConvertida = cantidadProductosOrden * consumoTeoricoPorProductoUnidadConvertida;

      // 3. Calcular la eficiencia
      if (consumoRealTotalOrdenUnidadConvertida === 0) {
        if (consumoTeoricoTotalOrdenUnidadConvertida === 0) {
          // No se esperaba consumir nada y no se consumió nada. Se considera 100% eficiente en este contexto.
          return 100.00;
        } else {
          // Se esperaba consumir (consumoTeorico > 0) pero no se consumió nada (consumoReal = 0).
          // Esto implica una eficiencia "infinita" para este insumo.
          // (Ej: se debían usar 10m, se usaron 0m. Eficiencia = 10/0 * 100 = Infinity)
          return Infinity;
        }
      }
      
      // Caso especial: si el consumo teórico es 0, pero sí hubo consumo real.
      // Esto significaría que se consumió material que no se esperaba consumir (desperdicio).
      if (consumoTeoricoTotalOrdenUnidadConvertida === 0 && consumoRealTotalOrdenUnidadConvertida > 0) {
        return 0.00; // Eficiencia 0% porque todo lo consumido fue "extra" o no planificado.
      }

      const eficiencia = (consumoTeoricoTotalOrdenUnidadConvertida / consumoRealTotalOrdenUnidadConvertida) * 100;

      // Devolver con dos decimales. `parseFloat` es para asegurar que es un número.
      return parseFloat(eficiencia.toFixed(2));
    }
  }
};