## Qué muestra este reporte

Filtra los **pagos y abonos** registrados en las órdenes, dentro del rango de fechas seleccionado (y opcionalmente por vendedor, categoría de producto, moneda o método de pago). Cada fila de la tabla es un pago individual; las columnas de la orden (Monto Total, Descuentos, Nota de Crédito, Monto Neto, Saldo Pendiente) solo se muestran en la **primera** fila de cada orden para no duplicar el total si una orden tuvo varios pagos.

### Las tarjetas de resumen

- **Total Bruto:** valor de catálogo (antes de descuentos) de los productos de las órdenes que tuvieron al menos un pago dentro del rango seleccionado.
- **Descuentos:** total de descuentos aplicados en esas órdenes **dentro del rango de fechas seleccionado**.
- **Total Neto:** Total Bruto − Descuentos.
- **Total Pagado / Abonos:** lo abonado en esas órdenes **dentro del rango de fechas seleccionado** -- no incluye pagos hechos antes o después del rango, aunque la orden sea la misma.
- **Saldo Pendiente Total:** lo que queda del Total Neto después de restar lo pagado **dentro del rango**. No es el saldo real y actualizado de la orden a día de hoy -- si la orden tuvo pagos fuera del rango filtrado, esos no se restan acá. Nunca es negativo por orden -- si dentro del rango una orden quedó sobrepagada, su saldo se cuenta como 0 (no se usa para compensar lo que deben otras órdenes).
- **Sobrepago / Crédito a favor:** cuánto se pagó de más, dentro del rango, en órdenes que quedaron saldadas o sobrepagadas.
- **Notas de Crédito:** notas de crédito aplicadas en esas órdenes **dentro del rango de fechas seleccionado** -- a diferencia de un descuento, una nota de crédito **incrementa** lo que el cliente aún debe.

**Estas 7 tarjetas cuadran entre sí:**

```
Total Neto = Total Pagado + Saldo Pendiente − Sobrepago − Notas de Crédito
```

### Métodos de Pago (panel lateral)

Mismo alcance que las tarjetas de arriba: los pagos que entraron dentro del rango de fechas seleccionado, agrupados por método (Efectivo, Zelle, Pagomóvil, etc.). Coincide con "Total Pagado / Abonos" -- son la misma cifra vista de dos formas (total vs. desglosada por método).
