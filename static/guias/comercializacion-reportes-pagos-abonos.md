## Qué muestra este reporte

Filtra los **pagos y abonos** registrados en las órdenes, dentro del rango de fechas seleccionado (y opcionalmente por vendedor, categoría de producto, moneda o método de pago). Cada fila de la tabla es un pago individual; las columnas de la orden (Monto Total, Descuentos, Nota de Crédito, Monto Neto, Saldo Pendiente) solo se muestran en la **primera** fila de cada orden para no duplicar el total si una orden tuvo varios pagos.

### Las tarjetas de resumen

- **Total Bruto:** valor de catálogo (antes de descuentos) de los productos de las órdenes que tuvieron al menos un pago dentro del rango seleccionado.
- **Descuentos:** total de descuentos aplicados en esas mismas órdenes.
- **Total Neto:** Total Bruto − Descuentos. Lo que esas órdenes realmente valen.
- **Total Pagado / Abonos:** todo lo abonado en el **historial completo** de esas órdenes -- no solo los pagos dentro del rango de fechas. Si una orden tuvo pagos antes del rango seleccionado, esos también cuentan aquí.
- **Saldo Pendiente Total:** saldo real y actual (a día de hoy) de esas órdenes. Nunca es negativo por orden -- si una orden ya está sobrepagada, su saldo se cuenta como 0 (no se usa para compensar lo que deben otras órdenes).
- **Sobrepago / Crédito a favor:** cuánto se pagó de más en órdenes ya saldadas (la otra cara de la regla anterior).
- **Notas de Crédito:** notas de crédito aplicadas en esas órdenes -- a diferencia de un descuento, una nota de crédito **incrementa** lo que el cliente aún debe.

**Estas 7 tarjetas cuadran entre sí:**

```
Total Neto = Total Pagado (histórico) + Saldo Pendiente − Sobrepago − Notas de Crédito
```

### Métodos de Pago (panel lateral)

Es una pregunta distinta a las tarjetas de arriba: muestra **solo los pagos que realmente entraron dentro del rango de fechas seleccionado**, agrupados por método (Efectivo, Zelle, Pagomóvil, etc.). No tiene por qué coincidir con "Total Pagado / Abonos" (que es histórico completo) -- son dos cortes distintos de la información, cada uno útil para una pregunta distinta: *"¿cuánto entró en este período, por método?"* vs. *"¿cuánto se ha pagado en total de estas órdenes?"*
