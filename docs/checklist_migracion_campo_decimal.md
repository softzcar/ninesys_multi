# Migración de inputs monetarios a `<campo-decimal>` — checklist persistente

**Objetivo:** dejar TODOS los inputs de tipo moneda de `app_multi` usando el componente `components/CampoDecimal.vue` (máscara bancaria 0.00). Pedido explícito del usuario (2026-08-13): esto se cierra por completo, no queda como "ir viendo después" — es requisito antes de poder actualizar Producción con la versión que se está desarrollando.

**Por qué este documento existe:** para sobrevivir cualquier interrupción (corte de luz, cierre de sesión) sin perder el análisis ya hecho y para que el usuario pueda ver en cualquier momento por dónde vamos, sin tener que preguntar.

**Alcance:** SOLO campos monetarios/financieros ($ reales: monto, precio, costo, salario, comisión fija, descuento, abono, tasa de cambio). Explícitamente FUERA de alcance: cantidades/conteos (piezas, stock, unidades), porcentajes, teléfonos, campos de búsqueda, cantidades físicas (metros, ml, kg, gramos, segundos, tokens). El componente ya usado en el piloto también trató `rendimiento` (metros que rinde un insumo) como campo a migrar — se mantiene ese mismo criterio aquí por consistencia con el precedente ya establecido.

**Metodología usada para clasificar (2026-08-13):** se partió de los 74 archivos con `type="number"` en `components/`+`pages/`, se revisó el contexto real (2 líneas antes de cada ocurrencia — variable/label) de las 115 ocurrencias totales, no solo el nombre del archivo. Ver `/tmp/.../contexto_number_inputs.txt` de esa sesión si hace falta reconstruir el razonamiento (no persistente, solo referencia).

**Nota de alcance residual:** este barrido cubrió `type="number"`. Podría haber campos monetarios usando `type="text"` con formato/máscara propia no detectados aquí — no confirmado, pendiente de una segunda pasada si se quiere garantía total.

---

## Ya migrados (piloto, antes de esta tarea)

- [x] `components/admin/AsignacionDePreciosForm.vue` — `item.price`
- [x] `components/inventario/InsumoNuevo.vue` — `costoMetro`, `form.rendimiento`, `form.costo`
- [x] `components/ordenes/presupuesto.vue` — `formConversion.descuento` (nota: la memoria original decía 6 campos migrados aquí, en la práctica solo hay 1; el resto de campos monetarios de este archivo, si los hay, quedarían para Fase 2 — revisar al llegar a `ordenes/nueva.vue`, que comparte patrón)

## FASE 1 — Migración directa (monetario confirmado, sin loop, sin ambigüedad)

Un solo campo, sin `v-for`, sin dependencias cruzadas — swap directo de `type="number"` por `<campo-decimal>`.

- [x] `components/admin/PagosBonoForm.vue` — `item.monto`
- [x] `components/admin/PagosDescuentoForm.vue` — `item.monto`
- [x] `components/admin/GastosVariables.vue` — `pagoModel.monto`
- [x] `components/admin/GastosAdicionales.vue` — `gastoModel.monto`
- [x] `components/admin/AtributosNuevo.vue` — `form.precio`
- [x] `components/admin/AtributosEditar.vue` — `form.precio`
- [x] `components/admin/ComisionesProductosInput.vue` — `comision`
- [x] `components/admin/ComisionesProductosInputGeneral.vue` — `comision`
- [x] `components/empresa/GastosManager.vue` — `newGasto.monto`
- [x] `components/empresa/MonedasManager.vue` — `tasaEnEdicion` (⚠️ requería `:decimals="6"` explícito -- el campo original tenía `step="0.000001"`, una tasa de cambio necesita más de los 2 decimales por defecto del componente. Ver nota abajo, ESTE ES EL CASO A REVISAR EN TODOS LOS DEMÁS ANTES DE DAR POR CERRADO: verificar si algún otro campo de Fase 1/Fase 2 también necesitaba más de 2 decimales -- ya verificado que ninguno de los otros 12 de Fase 1 los necesitaba, todos usaban `step="0.01"` o `step="0.10"`)
- [x] `components/impresoras/ServicioEditar.vue` — `form.costo`
- [x] `components/impresoras/ServicioNuevo.vue` — `form.costo`
- [x] `pages/crm/index.vue` — `newOp.monto_estimado` (tenía `v-for` en el archivo por una tabla no relacionada; el campo en sí está fuera de cualquier loop, verificado)

**FASE 1 COMPLETA (13/13) — 2026-08-13.** Verificado con `git diff` que las 13 ediciones son limpias (solo el swap del input, sin efectos colaterales). `components/empresa/MonedasManager.vue` tenía WIP ajeno preexistente sin commitear en el mismo archivo (`reloadAll()` + watcher de `id_pais`, de otra sesión, no relacionado) -- se aisló con `git add -p` para no mezclarlo en el commit de esta tarea, mismo procedimiento ya usado antes en el proyecto para este tipo de situación.

## FASE 2 — Requiere revisión individual

Múltiples campos monetarios en el mismo archivo, campo dentro de `v-for`, o nombre ambiguo que requiere leer el archivo antes de decidir. Orden sugerido (no es una regla fija, ajustar según convenga al tocar cada área):

- [x] `components/admin/detallePagos.vue` — SIN ACCIÓN: los inputs de `value`/`valueDescuento` están completamente COMENTADOS en el template (código muerto, líneas 72-97). No hay ningún input real que migrar. Las variables siguen usándose internamente como string (`.trim()`), pero no hay UI que las alimente hoy.
- [x] `components/admin/EmpleadoEditar.vue` — `form.salario` + `form.comision` monetarios; `form.comisionPorcentaje` NO aplica (es %).
- [x] `components/admin/EmpleadoNuevo.vue` — mismo patrón exacto que `EmpleadoEditar.vue`.
- [x] `components/admin/GastosFijos.vue` — `gastoModel.monto` + `pagoModel.monto` (2 monetarios).
- [x] `components/admin/GastosHistorial.vue` — `editModel.monto`. Confirmado envuelto en `b-input-group` (el mismo contexto que causó el bug de carrera ya corregido) — buen caso de prueba adicional.
- [x] `components/admin/AsignacionDeInsumosAProductosTab.vue` — `comisionActual` ("Monto de comisión por unidad producida") confirmado monetario, migrado. `row.item.cantidad` NO aplica. (Archivo tenía WIP ajeno preexistente sin commitear -- aislado con `git add -p`, mismo procedimiento que `MonedasManager.vue`).
- [x] `components/inventario/InsumoNuevoTinta.vue` — `form.costo` + `form.rendimiento` monetarios; `form.mililitros` NO aplica.
- [x] `components/inventario/InsumoEditarTinta.vue` — `form.rendimiento` + `form.costo` monetarios.
- [x] `components/inventario/InsumoClonar.vue` — `costoMetro` + `form.rendimiento` + `form.costo` monetarios.
- [x] `components/inventario/InsumoEditar.vue` — `costoMetro` + `form.rendimiento` + `form.costo` monetarios.
- [x] `components/inventario/InsumoClonarTinta.vue` — `form.rendimiento` + `form.costo` monetarios; `form.mililitros` NO aplica.
- [x] `components/ordenes/abono.vue` — solo 2 monetarios reales (`valueDescuento` + `valueNotaCredito`). `value` (el abono en sí) está COMENTADO en el template -- el monto real hoy se captura vía `<ordenes-metodos-pago-dinamico>` (el componente de Tier G). De paso se quitó un atributo `lab` suelto sin función (typo/cruft preexistente en el tag).
- [x] `components/ordenes/nueva.vue` — `form.descuento` (real) + `form.total` (readonly, migrado también por consistencia visual, sin riesgo al ser solo lectura). `form.abono` está COMENTADO (2 veces) -- mismo patrón que `abono.vue`, el abono real se captura vía `<ordenes-metodos-pago-dinamico>`. `form.productos[].cantidad` NO aplica.
- [ ] `components/ordenes/MetodosPagoDinamico.vue` — `montos[metodo._id]` monetario, dentro de doble `v-for` (moneda × método). **ALTO IMPACTO Y ALTO CUIDADO:** este componente es compartido por 6 formularios reales (nueva orden, presupuesto, abono, retiros, cierre de caja, abonos) — migrarlo propaga el cambio a los 6 de una vez, pero también significa que un error aquí rompe 6 pantallas simultáneamente. Probar en las 6 antes de dar por cerrado.
- [x] `components/formMonedas.vue` — `moneda.valor` (tasa de cambio) monetario, dentro de `v-for`, migrado. Usa `:value`+`@change` (no v-model) igual que `ComisionesProductosInputGeneral.vue`; `updateTasa()` ya hace `parseFloat()` así que acepta el string que devuelve el evento nativo sin problema.
- [x] `components/products/ProductEditar.vue` — SIN ACCIÓN: el bloque con `form.price`/`form.unidades` está completamente COMENTADO (código muerto). Los precios reales van por `<admin-AsignacionDePrecios>` = `AsignacionDePreciosForm.vue`, ya migrado en el piloto original. `form.stock_quantity` (activo) NO aplica (cantidad).
- [x] `components/whatsapp/WaConfiguracion.vue` — `sttConfig.stt_monthly_usd_limit` monetario, migrado; `max_tokens`/`stt_long_audio_seconds` NO aplican (no son $).
- [x] `components/produccionsse/asignarEmpleadoMulti.vue` — SIN ACCIÓN: `row.item.comision` es en realidad "Porcentaje Comisión" (distribución de % entre empleados, ver `calculoPorcentaje`/label real del campo) -- NO es monto $, confirmado.
- [x] `components/empleados/SseOrdenesAsignadasModalExtra.vue` — SIN ACCIÓN: `itemForm.input` es una cantidad de consumo de material con unidad dinámica (kg/metros, ver `getUnidadRow()`), no un monto. Resto del archivo ya confirmado no monetario.
- [x] `components/comercio/editarProductos.vue` — SIN ACCIÓN: la columna "precio" de la tabla es de solo lectura (sin `#cell(precio)` custom, renderiza texto plano); único input real es `cantidad`, ya confirmado no monetario.
- [x] `components/comercio/editarProductos2.vue` — SIN ACCIÓN, mismo caso exacto que `editarProductos.vue`.

## Confirmado SIN campos monetarios (no requieren acción, no volver a investigar)

`NewStockOrderModal.vue`, `asignacionDeCorteGrupalGuardar.vue`, `produccion/asignarEmpleado.vue`, `produccionsse/asignarEmpleado.vue`, `CorteItemView.vue`, `produccion/guardarCantidad.vue`, `produccionsse/guardarCantidad.vue`, `produccion/reposicionForm.vue`, `produccionsse/reposicionForm.vue`, `reposicionFormEmpleados.vue`, `AsignacionMasivaModal.vue`, `TallasNuevo.vue`, `TallasEditar.vue`, `ImpresoraEditar.vue`, `ImpresoraNueva.vue`, `MultiplicadorPrecio.vue`, `RecargaTintas.vue`, `InsumoTerminar.vue`, `AsignacionDeTelasInput.vue`, `FinalizarLoteModal.vue`, `FinalizarLoteImpresionModal.vue`, `FinalizarLoteCorteModal.vue`, `diseno/tallasPersoalizacion.vue`, `disenosse/tallasPersoalizacion.vue`, `WaAgentes.vue`, `products/new.vue`, `ConfigEmpresaForm.vue`, `ConfigAdminForm.vue`, `clientes-progreso.vue`, `pages/clientes/progreso/_id.vue`, `pages/comercializacion/abonos.vue` (el campo es búsqueda por número de orden, no un monto), `pages/administradores/inventario/remanentes.vue`, `AsignacionDeInsumosProductosForm.vue`, `InsumoAsignarInput.vue` (confirmado: es cantidad), `BotonTerminarModalInput.vue` (confirmado: es gramos), `updateInsumo.vue` (confirmado: es cantidad), `ConsumoMaterialModal.vue` (material consumido en metros, no $), `produccionsse/AsignacionMasiva.vue` (porcentaje, no $).

## Registro de avance

- **2026-08-13**: Análisis completo de los 74 archivos con `type="number"`, clasificación en Fase 1 (13 archivos)/Fase 2 (20 archivos)/sin acción (37 archivos). Documento creado. Empezando ejecución de Fase 1.
