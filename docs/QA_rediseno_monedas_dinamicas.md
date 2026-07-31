# Checklist de pruebas manuales — Rediseño de monedas/métodos de pago dinámicos

> Entorno: UI de Desarrollo (empresa 194, `app.nineteengreen.com` / `api.nineteengreen.com`). Backend + frontend ya desplegados en Dev.
> Orden pensado para probar de abajo hacia arriba: primero el catálogo (todo depende de él), luego captura de dinero, luego salida de dinero, luego cierre de caja, y al final los reportes que verifican que todo cuadre.
> Marca cada casilla al validar. *Esperado* es lo que debe ocurrir. Si algo no coincide, anótalo debajo del punto en vez de tacharlo.

## A. Catálogo — Gestor de Monedas (`/monedas`) — ✅ CERRADA (2026-07-31)

> Cerrada por el usuario tras las pruebas reales del 2026-07-31, que encontraron y resolvieron 3 problemas en cadena no anticipados al escribir este checklist (ver `project_rediseno_monedas_metodos_pago.md` para el detalle técnico completo): falta de UI para crear métodos de pago de una moneda nueva, tasa asumida 1:1 en silencio cuando no había fuente configurada, y el scrapper de tasas roto al usar una base distinta de USD. Los puntos originales de abajo quedaron parcialmente superados por el catálogo real actual (ya no son exactamente 3 monedas, se agregaron Euro y una moneda de prueba durante las pruebas) — se dejan tachados como referencia histórica de lo que se verificó en su momento, y se agregan los puntos nuevos realmente cubiertos.

- [x] ~~Entrar a Gestor de Monedas → aparecen exactamente 3 monedas~~ — catálogo real hoy incluye además Euro (agregado como prueba) y una moneda de prueba (TST); Dólares se confirmó como base.
- [x] Revisar los métodos de pago de cada moneda — confirmado, incluido el nuevo método creado para Euro durante las pruebas.
- [x] Intentar eliminar/desasignar la moneda marcada como **base** → bloqueada con mensaje claro (`POST /monedas/eliminar` y `/establecer-base` validan explícitamente).
- [x] Crear un **método de pago nuevo de prueba** (Euro) → se creó sin error desde la nueva UI del Gestor de Monedas (botón "Métodos de Pago", reutiliza `MetodosPagoManager.vue`).
- [x] Ir al formulario de pago (modal Abono) y confirmar que el método recién creado **ya aparece como opción** → confirmado, input habilitado tras configurar la tasa.
- [ ] Eliminar un método de prueba sin uso → NO probado explícitamente esta ronda.
- [ ] Crear, usar en un pago real, e intentar eliminar con uso → NO probado explícitamente esta ronda.
- [x] **(Nuevo, no anticipado)** Configurar una **tasa manual** para una moneda sin fuente automática → editable inline en el Gestor de Monedas, refleja el badge (Automática/Manual/Sin configurar) y se propaga en caliente al modal de pagos sin recargar la página.
- [x] **(Nuevo, no anticipado)** Cambiar la **moneda base** a una moneda distinta de Dólares y de vuelta → ciclo completo probado (USD→EUR→USD), catálogo y tasas se recalculan correctamente para la nueva base (verificado con Euro: USD, VES y COP se resuelven automáticamente triangulando contra la nueva base).
- [x] **(Nuevo, no anticipado)** Intentar capturar un pago en una moneda **sin tasa configurada** → el input queda deshabilitado con una alerta explícita, en vez de asumir 1:1 en silencio.

## B. Captura de pagos — formularios reales

Para cada formulario, probar con **al menos 2 monedas distintas en el mismo pago** (ej. una parte en Dólares y otra en Bolívares) cuando el formulario lo permita.

- [ ] **Abono a una orden existente** (modal "Abono a la Orden [id]", se abre desde varias pantallas) → *Esperado:* se pueden ingresar montos en varias monedas a la vez; el total mostrado en pantalla ya viene convertido a la moneda base (Dólares); al guardar, el abono queda reflejado correctamente en la orden (saldo pendiente baja lo correcto).
- [ ] **Crear una orden nueva** (`nueva.vue`, pestaña "Pago y asignación") capturando un pago inicial → *Esperado:* mismo comportamiento que el abono; la orden se crea con el pago inicial ya registrado.
- [ ] **Editar una orden existente** agregando un pago adicional desde el mismo formulario → *Esperado:* el pago nuevo se suma correctamente, sin duplicar ni perder los pagos anteriores.
- [ ] **Convertir un presupuesto en orden** (modal "Convertir a Orden") capturando el pago inicial → *Esperado:* la orden se crea a partir del presupuesto, con el pago correctamente registrado y el cliente vinculado (si el presupuesto tenía cliente).
- [ ] **"Otro Abono"** (`comercializacion/abonos.vue`, formulario principal, sin orden asociada) → *Esperado:* el pago queda registrado como abono general (no asociado a ninguna orden).
- [ ] **"Abono a Orden Específica"** (mismo archivo, modal) → *Esperado:* igual que el abono normal, pero disparado desde esta pantalla.
- [ ] En **todos** los formularios anteriores: para un método marcado como "requiere referencia" (ej. Zelle, Pagomovil, Transferencia), verificar que el campo de referencia/detalle **es obligatorio o al menos visible** → *Esperado:* el campo aparece; si se deja vacío en un método que lo requiere, el pago igual se guarda pero sin referencia (comportamiento actual, no debe trabar el guardado).
- [ ] Verificar en cualquiera de los pagos de prueba que **el efectivo se refleje en Caja** (solo métodos "Efectivo") → *Esperado:* un pago en Zelle o Pagomovil **NO** aparece como movimiento de caja física; un pago en Efectivo **SÍ**.

## C. Retiros (`/comercializacion/retiros`)

- [ ] Abrir la pantalla de Retiros → *Esperado:* el panel muestra el **efectivo disponible por cada moneda real** (Dólares/Bolívares/Pesos), no un valor fijo.
- [ ] Intentar retirar **más de lo disponible** en una moneda → *Esperado:* se bloquea con un mensaje mostrando el monto máximo disponible en esa moneda específica.
- [ ] Retirar un monto **dentro del disponible** en una sola moneda → *Esperado:* el retiro se guarda, y el disponible de esa moneda baja exactamente ese monto.
- [ ] Repetir un retiro parcial adicional sobre el mismo saldo restante → *Esperado:* vuelve a validar correctamente contra el nuevo saldo (no contra el original).

## D. Cierre de Caja (`/comercializacion/cierre-de-caja`)

> Hacer esta prueba idealmente al final del día de pruebas, después de haber generado algunos pagos/retiros de prueba en las secciones B y C, para tener algo real que cerrar.

- [ ] Abrir Cierre de Caja → *Esperado:* el panel "Disponible para cerrar" muestra el monto real por cada moneda con saldo (no lista monedas en 0 si no hay nada que cerrar en ellas).
- [ ] Hacer un **cierre parcial** (cerrar menos del total disponible en alguna moneda) → *Esperado:* se puede confirmar el cierre; el sistema calcula automáticamente el **fondo remanente** (lo no cerrado) para esa moneda.
- [ ] Intentar cerrar **más de lo disponible** en alguna moneda → *Esperado:* se bloquea con mensaje claro del máximo disponible.
- [ ] Después de confirmar un cierre, volver a abrir Cierre de Caja → *Esperado:* el "Disponible para cerrar" ahora refleja el **fondo remanente** que quedó del cierre anterior, no el saldo de antes de cerrar.
- [ ] (Opcional, si se sirve el mismo día) Hacer un **retiro** que dependa de ese fondo remanente recién dejado → *Esperado:* el retiro valida correctamente contra ese fondo (esto confirma que el fondo remanente quedó bien guardado, no en 0).

## E. Reportes — verificación final

- [ ] **Reporte de Caja** (`/comercializacion/reporte-de-caja`), generar con un rango de fechas amplio (ej. mayo–julio 2026) → *Esperado:* aparece una sección "Efectivo" con una subsección por cada moneda real (Dólares/Bolívares/Pesos) y una sección con una subsección por cada método no-efectivo real (Zelle, Pagomovil, Transferencia, Punto, Panamá) — incluidas Punto y Panamá aunque digan "No hay X" si no tienen movimientos.
- [ ] En ese mismo reporte, revisar el **"Total Efectivo"** y el **"Total General"** → *Esperado:* ambos muestran el símbolo de la moneda base real ($) y una suma coherente con las secciones de arriba.
- [ ] **Balance de Cierres de Caja** (`/comercializacion/reportes/balance-cierres` o vía menú Caja → Balance de cierres), generar con un rango amplio → *Esperado:* aparece una tarjeta "Diferencia" por cada moneda real (no solo 3 fijas), y la tabla trae columnas Teórico/Rec./Ret./Fondo/Diff por cada moneda, más Total Real/Diff en la moneda base.
- [ ] Ubicar en esa tabla el/los cierres hechos durante estas pruebas (sección D) → *Esperado:* los montos de "Ret." y "Fondo" coinciden exactamente con lo que se cerró y con el fondo remanente calculado; la columna "Diff" da **0** si no hubo ninguna descuadre real (retirado + fondo = fondo anterior + recaudado).
- [ ] Confirmar que los **cierres históricos** (de antes de este rediseño, con fecha anterior a hoy) también se ven bien en ambos reportes → *Esperado:* sus montos siguen siendo correctos (se leen de las columnas antiguas, que quedaron congeladas como historial).

## F. Limpieza de datos de prueba

- [ ] Si se crearon órdenes, pagos, retiros o cierres de prueba, decidir con el equipo si se dejan como evidencia de las pruebas o se limpian de la base de Desarrollo.
- [ ] Confirmar que ningún dato de prueba quedó en la base de **Producción** (estas pruebas deben hacerse únicamente contra Desarrollo).
