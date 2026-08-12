# Pruebas de `app_multi` con API / PostgreSQL

- [x] ## Inicio



# ~~WhatsApp~~

## Avance WhatsApp 29/07/2026

🚀 *Reporte de Avance - Servicio de WhatsApp & PostgreSQL*

📌 *Resumen de lo realizado hoy:*

1️⃣ *Solución a Error 500 y Conexión PostgreSQL en `msg_ninesys`:*

• Se adaptó el microservicio de WhatsApp para operar nativamente con PostgreSQL (puerto 5432) en el servidor de desarrollo.

• Quedó resuelto el error al presionar el botón *[Actualizar estado]*. El endpoint responde correctamente con el código QR en base64 para vincular la sesión.

2️⃣ *Corrección de Catálogo en Backend API (`ninesys-api`):*

• Tras la migración a PostgreSQL, las búsquedas eran sensibles a mayúsculas (`LIKE`), omitiendo franelas que iniciaran con mayúscula.

• Se aplicó la cláusula `ILIKE`. Ahora la API devuelve los *13 productos de franelas* disponibles (sublimadas, algodón, licra, oversize, cuello V, etc.) con todas sus escalas de precios.

3️⃣ *Diagnóstico Pendiente en la IA:*

• El backend ya devuelve las 13 franelas. Para la siguiente sesión probaremos en una conversación desde cero para descartar el sesgo de la memoria conversacional previa.

✅ *Estado actual:* Cambios probados, documentados en bitácora y desplegados en el servidor de desarrollo (`vps-contabo-dev`).



## Ordenes y Lotes

- [x] Nueva Orden
  - [x] Crear una nueva orden a cliente
    - [x] Cargar Cliente existente
    - [x] Crear un nuevo cliente
    - [x] Cargar un producto existente
    - [x] Cargar producto desde `[Catalogo]`
    - [x] **Cliente** Asignar datos a los productos
      - [x] Precio
      - [x] cantidad
      - [x] talla
      - [x] corte
      - [x] tela
      - [x] Atributo
        - [x] Asignar
        - [x] Crear

      - [x] Duplicar item
      - [x] Eliminar item
      - [x] Aplicar Multiplicador
      - [x] Verificar incremento de tallas XL

    - [x] Observaciones
      - [x] Pegar una imagen
      - [x] insertar
      - [x] Redimensioanr imagen

  - [x] Vincular una orden
  - [x] Crear una nueva orden interna
  - [x] Guardar una orden
  - [x] Cargar una orden desde `[Cargar orden o presupuesto]`
  - [x] Cargar una orden desde `[Cargar orden no asignada]`
  - [x] Cargar un presupuesto y emitir la orden
  - [x] Botón `[Limpiar Formulario]`

- [x] **Nuevo Presupuesto** **(búsqueda de clientes migrada a server-side el 2026-08-07, mismo fix que Nueva Orden -- verificado en vivo por el usuario, typeahead busca correctamente por nombre y teléfono)**
  - [x] Crear unnuevo presupuesto a cliente
    - [x] Cargar Cliente existente
    - [x] Crear un nuevo cliente
    - [x] Cargar un producto existente
    - [x] Cargar producto desde `[Catalogo]`
    - [x] **Cliente** Asignar datos a los productos
      - [x] Precio
      - [x] cantidad
      - [x] talla
      - [x] corte
      - [x] tela
      - [x] Atributo
        - [x] Asignar
        - [x] Crear
      - [x] Duplicar item
      - [x] Eliminar item
      - [x] Aplicar Multiplicador
      - [x] Verificar incremento de tallas XL
    - [x] Observaciones
      - [x] Pegar una imagen
      - [x] insertar
      - [x] Redimensioanr imagen
  - [x] Guardar un presupuesto
- [x] Relación de Pagos
- [x] Ordenes en Curso
- [x] Todas las Ordenes **(PENDIENTE IMPORTANTE, no bloqueante: optimizar el tiempo de carga de la página `/produccion/ordenes-todas` -- reportado lento por el usuario, causa raíz aún sin investigar)**



## Caja

- [x] Retiros
- [x] Otros Abonos
- [x] Cierre de Caja
- [x] Reporte de Caja
- [x] Balance de Pagos y Abonos
- [x] Balance de Cierres



## Diseños

- [x] Aignación
- [x] Terminados
- [x] Aprobación



- [x] ## Control de Producción



## Control de producción

### Reposiciones por aprobar

- [ ] Verificar (pendiente: requiere acciones desde el módulo de Empleados, aún no revisado)

### Reposiciones en curso

- [ ] Asignar (pendiente: requiere acciones desde el módulo de Empleados, aún no revisado)
- [ ] Eliminar (pendiente: requiere acciones desde el módulo de Empleados, aún no revisado)

### Ordenes en curso

- [x] **Progreso: ** Botón Uregente
- [x] **Progreso: ** Asignación de personal
  - [x] 
- [x] **Progreso: ** Reposisicon





## Inventario

- [x] Inventario
- [x] Gestión de Remanentes
- [x] Catálogo de insumos
- [x] Reporte de inventario **(funcional; pendiente validar con el equipo de operaciones si el criterio de fecha por defecto en "Material en Stock" — últimos 30 días de ingreso — es el esperado para el negocio)**
- [x] Reporte de movimientos



## Impresoras

- [x] Gestión de impresoras
- [x] Recarga de tintas
- [x] Catálogo de tintas
- [x] Catálogo de Colores
- [x] Servicio Técnico
- [x] Reporte de impresoras
- [x] Reporte de Tintas
- [x] Tintas Actuales



## Empleados

- [x] Gestión de empleados **(crear/editar/desactivar revisados y corregidos: validación de formulario que se saltaba pestañas ocultas, email/teléfono duplicado por últimos 10 dígitos, normalización de teléfono E.164, botón "Eliminar" corregido para desactivar en vez de dejar el empleado activo, filtros por nombre y departamento agregados)**
- [x] Gestión de departamentos **(reordenar/crear/editar/eliminar funcional; fix aplicado backend+frontend para reconocer tipo='corte' en vez de solo el nombre "Corte" — verificado funcionando en Control de Producción con el departamento de prueba "Corte Dos"; al eliminar y volver a crear un departamento con el mismo nombre ahora se ofrece reactivar el original en vez de duplicarlo. Pendiente aparte, no bloqueante: el módulo/dashboard de Empleados aún NO reconoce departamentos tipo='corte' que no se llamen literalmente "Corte" — se revisa cuando se audite esa sección)**
- [ ] **PENDIENTE anotado 2026-07-27, resolver al auditar el módulo/dashboard de Empleados:** en el departamento "Diseño", la opción del sidebar "Diseños Terminados" debe mostrar solo los diseños del diseñador logueado, y permitir filtrar por rango de fechas (por defecto, últimos 30 días). Ver `pages/diseno/terminados/index.vue`.
- [x] Activación de empelados



- [x] ## Gestión de Clientes **(placeholders y validaciones de crear/editar corregidos: teléfono normalizado y sin duplicados, nombre/apellido obligatorios, email/cédula opcionales, país/estado/ciudad obligatorios; eliminación verificada como soft-delete correcto, con confirmación extra si el cliente tiene órdenes y reactivación al recrear por teléfono)**



## Productos

- [x] Gestión de Productos **(precios con 2 decimales en modal de edición; soft-delete y reactivación por nombre/SKU al crear -- manual y por Carga Masiva; typeahead "Importar desde otro producto" en Asignación de Insumos poblado correctamente y tabla de insumos reflejando datos reales tras importar; columna "Precio" obsoleta eliminada de la tabla; tabla de Gestión recargando sola tras Carga Masiva)**
- [x] Insumos de Productos **(radios de filtro por departamento se salían de la interfaz -- corregido con flex-wrap, mismo fix que en Gestión de Empleados)**
- [x] Comisiones de Productos **(filtros re-maquetados: buscador de texto y radios de tipo de producto lado a lado, mismo orden y flex-wrap que en las páginas anteriores)**
- [x] Atributos de productos **(no tenía soft-delete -- implementado con el mismo patrón trim+minúsculas y reactivación por 409 ya usado en Productos/Departamentos; edición se dejó como UPDATE directo, igual que el resto del proyecto)**
- [x] Categorías **(ya tenía soft-delete parcial -- GET y DELETE ya usaban eliminado; faltaba validar duplicados y reactivar al crear, implementado igual que Atributos de Productos; de paso se corrigió una inyección SQL en el DELETE y una inconsistencia en el PUT que bloqueaba renombrar hacia el nombre de una categoría ya eliminada)**



## Pagos

- [x] Planilla de Pagos **(bug real corregido 2026-07-21, commit `4bd543d`: "Total General" del modal "Confirmar Procesamiento de Pagos" podía quedar desactualizado vs. lo realmente procesado -- causa raíz: `totalCancelado` era un `data()` sincronizado a mano en 4 puntos, convertido a `computed` para que nunca se desincronice. Verificado en vivo el 2026-08-12 con 140 pagos reales pendientes (rango 12/01/2026-11/08/2026): "Total General" de la pantalla principal y del modal "Confirmar Procesamiento de Pagos" coinciden exacto en $317.37, sin abrir/cerrar desincronización. Cerrado sin necesidad de tocar código)**
- [x] Histórico de Pagos **(auditoría completa 2026-08-12, backend `/pagos/historico/{semana}`: (1) inyección SQL real y explotable en fecha_inicio/fecha_fin sin sanitizar en 6 consultas -- confirmado con apóstrofe real (500), corregido parametrizando con `?`. (2) 3 campos que filtraban el SQL completo en la respuesta, eliminados. (3) bug real de multiplicación: el JOIN contra `revisiones` en la categoría "diseñadores" repetía la fila del pago por cada revisión coincidente -- caso real de un pago de $4.00 con 4 revisiones inflando el total hasta 4x, ~$82 de inflación en una sola semana real -- corregido con EXISTS + subconsulta. (4) doble conteo cuando un pago de OTRO departamento coincidía por casualidad (orden+empleado) con una revisión de diseño -- acotado con filtro de `detalle`. Frontend: hallazgo latente (sin impacto real confirmado, `.find()` en vez de sumar todas las filas de salario por empleado si hubiera más de un `tipo_salario` en el mismo período) corregido de forma defensiva. Verificado en vivo: semana 03-09/08/2026 pasó de un total inflado (~$1229.99) a **$1147.89 real**, confirmado por el usuario en pantalla. Estos mismos 3 bugs de backend también existen en Producción (rama `refactor/modular-routes`) -- el usuario decidió explícitamente NO corregirlos ahí, solo en Desarrollo, hasta el proyecto de migración completa)**



## Reportes

- [x] Reporte general **(renombrado de "semanal" a "Reporte General de Eficiencia" -- URL, endpoint y links del sidebar; corregido fallback 100% falso en Eficiencia Tiempo/Material cuando no hay datos reales -- ahora N/A; corregido 500 en el modal de eficiencia de insumos por columna eliminada en limpieza anterior; corregido cálculo de "Real" en eficiencia de insumos que aplicaba rendimiento sin condición, inflando el consumo real hasta 11x en algunas órdenes; verificado con datos reales que el progressbar de eficiencia de tiempo calcula correctamente -- los desfases observados son de configuración de datos, no de código)**
- ~~Rendimiento~~ **(entrada muerta del checklist -- ese link ya no existe en el sidebar actual de Reportes, confirmado por grep en `SidebarAdmin.vue`. No corresponde a ninguna página real hoy)**
- [x] Eficiencia Empleados **(selector de empleado rediseñado -- ocupaba todo el ancho en desktop; corregida inflación 60x en Eficiencia Tiempo por mezclar segundos con minutos; corregida etiqueta "minutos" incorrecta en modal de detalle; corregido consumo_real_total inflado en Eficiencia Insumos por rendimiento aplicado sin verificar unidad del insumo; corregido "0%" engañoso -- ahora N/A cuando no hay datos reales; corregido JOIN roto en Eficiencia Insumos por id_catalogo_insumos_prodcutos NULL en 69% del historial de inventario_movimientos, usando inventario.id_catalogo como respaldo; restaurado cálculo de HORAS TRABAJADAS -- código muerto tras un `return` hacía que siempre mostrara 0.00, afectaba también producción MySQL; agregado modal de detalle de horas con estado de pago por tarea (pagado/pendiente); corregido PENDIENTE $ que ignoraba procentaje_comision de reparto entre empleados en el mismo lote, riesgo de duplicación de comisión -- sin impacto en datos actuales pero confirmado en 130 asignaciones históricas)**
- ~~Insumos por orden~~ **(página eliminada del sidebar y del código el 22/07 -- ya no aplica)**
- ~~Insumos~~ **(link eliminado del sidebar el 22/07 -- ya no aplica)**
- [x] Productos **(SELECT de producto reemplazado por TypeHead buscable por nombre/código; columnas valor_inicial/valor_final unificadas en una sola "Material Consumido" = ABS(diferencia); agregado filtro client-side por número de orden; habilitado ordenamiento por columna -- orden, producto, id insumo, insumo, empleado, fecha -- ya estaba previsto en el backend pero nunca activado; eliminado un campo "Fecha" duplicado por error de copiar/pegar; corregida inyección SQL real en el route param id_producto, que se concatenaba crudo sin sanitizar)**
- [x] Reporte de Costos **(auditoría en 4 fases: datos de la API -- todos correctos salvo costo_mano_de_obra, que excluía por completo el costo de empleados asalariados que sí trabajaron tareas rastreadas -- corregido conectando salario_invertido, ya calculado pero descartado; filtros de fecha -- corregido bug de zona horaria que desplazaba el rango por defecto un día en horario nocturno (~8pm-medianoche Venezuela); filtro "Buscar/Filtrar por Orden" -- corregido bucle infinito de reactividad que colgaba la app (causa real: array literal inline como prop de <b-table>, no las mutaciones que parecían la causa a primera vista); gastos con switches -- mecánica correcta, pero corregida dirección de conversión de moneda invertida y selector de moneda inconsistente en los 3 formularios de gastos (sin impacto en datos actuales, ningún gasto real registrado en moneda distinta a USD); cards/KPIs -- todos los totales verificados correctos contra todas las combinaciones de switches, y conectada la barra "Eficiencia Promedio de Insumos" que nunca se mostraba, a un cálculo real reutilizando la lógica ya corregida en el Reporte de Eficiencia de Empleados; verificación adicional de las 3 columnas con modal -- Costo M.O. usaba horas crudas en vez de horario laboral real, mismo patrón que salario_invertido pero en un endpoint independiente, corregido con impacto real verificado (orden 4744: 271.62h crudas → 77.07h reales); Productos y Costo Insumos -- corregidas 2 inconsistencias latentes entre el link y el modal (filtro de categoría "Diseños" ausente en el conteo del link; truncamiento a 1 letra del código de color en el costo de tintas), sin impacto visible en datos actuales pero verificadas para eliminar riesgo de divergencia futura; panel "Resumen de Costos Operativos" -- corregidos los badges de Gastos Fijos/Variables/Adicionales/Remanentes/Mantenimiento, que mostraban siempre el total absoluto del período sin importar los switches de "Incluir Gastos", dando una impresión contradictoria con la "Utilidad Neta" de la misma tarjeta -- ahora son dinámicos según los switches, verificado en vivo en ambos estados)**
- [x] Desviación de Costos **(auditoría en 4 fases sobre `/reporte-costos-productos` -- datos de la API: rendimiento Kg->Mt faltante en costo estimado de insumos (sobrestimaba hasta ~3.7x en productos de tela); precio_venta leído de `products.price`, campo legacy sin mantenimiento (60/62 productos reales en $0), corregido a `products_prices` y eliminada la columna legacy de Postgres Dev tras limpiar todas sus referencias en backend y frontend; labor_real incluía comisión de vendedor mezclada con mano de obra real (52% del total agregado del reporte); insumos_estimado no ponderaba por la mezcla real de tallas producidas; tiempo_real/labor_real (salario fijo) usaban horas crudas sin filtrar por horario laboral (mismo patrón ya corregido en Costo M.O. y Eficiencia de Empleados, caso real: 154h para 1 unidad); cards/gráficos -- verificados correctos en ambas vistas (Por Productos/Por Categorías); filtros -- corregido el mismo bug de zona horaria en fechas por defecto, y el filtro de búsqueda que no se limpiaba al alternar de vista dejando la tabla vacía sin explicación; modal "Tallas" -- corregido insumos_real no-cero en tallas con 0 unidades reales fabricadas, y luego (a pedido del usuario, tras notar que la Ficha Técnica ya registra la cantidad de material por talla en la pantalla "Insumos Asignados") reemplazado el promedio plano por un reparto ponderado del consumo real entre tallas según su cantidad estimada -- de $0.91 fijo en todas las tallas a una progresión real de $0.41 a $1.41 según el tamaño)**
- [x] Reporte de Reposiciones **(el reporte no mostraba ningún dato -- 3 bugs en `/reposiciones-reporte`/`/reposicion-detalles`: filtro de estatus sensible a mayúsculas que nunca coincidía con los datos reales (dejaba el reporte en 0 filas por defecto); JOIN de insumos por `id_producto` en vez de `id_insumo` (costo de material en $0 o filas de material invisibles en el modal); parámetros sin sanitizar. Frontend: la vista "Activas" restringía por fecha al día de hoy, ocultando reposiciones activas más antiguas -- ahora la fecha es un filtro opcional. `detalle_emisor` en la API era en realidad una copia de `detalle` (nota del jefe de producción) por un alias SQL duplicado -- corregido, habilitando mostrar ambas notas correctamente. Costo de tinta (CMYK) en $0 en el 100% de las reposiciones por IDs de inventario hardcodeados que no existían en la empresa 194, e ignoraba además colores fuera de CMYK -- corregido replicando la lógica ya validada de costeo de tinta del Reporte de Costos de Producción (mapa de costo por impresora+color con respaldo, calculado en PHP). Mejoras de interfaz: badge de color por estado de orden (componente reutilizable `BadgeEstatusOrden`) aplicado también en "Órdenes en curso" de Control de Producción, "Todas las Órdenes" y "Órdenes en curso" de Comercialización; nuevo modal de detalle de solo lectura (emisor + jefe de producción, sin acciones); mensaje de sin-resultados y paginación en la tabla principal, que antes quedaba en blanco sin explicación con filtros de 0 resultados (ej. "Canceladas") o se renderizaba entera sin cortar con "Todas"/"Entregadas" (70-82 filas))**



## Varios

- [x] Tallas **(API/CRUD auditados: listar/crear/editar correctos. Eliminar hacía un DELETE físico real sin ninguna bandera de borrado lógico -- `sizes._id` tiene FKs reales desde 3 tablas, incluyendo un `ON DELETE CASCADE` que borraba permanentemente los datos de eficiencia teórica de esa talla para todos los productos, y 2 `ON DELETE SET NULL` que rompían el agrupamiento por talla ya usado en Desviación de Costos; con datos reales, cada una de las 19 tallas activas tiene entre 23 y 4550 líneas dependientes. Implementado soft-delete real (columna `eliminado`, mismo patrón que Categorías/Departamentos): preserva el `_id` por lo que ninguna FK problemática se dispara nunca. Agregado `GET /sizes/{id}/uso` y advertencia en el frontend mostrando el uso real antes de eliminar, sugiriendo Editar en vez de Eliminar. Crear una talla ya existente (activa o eliminada) ahora se detecta -- eliminada ofrece reactivar recuperando también su Porcentaje de Variación original, en vez de perderlo. Aclarado además que "Porcentaje de Variación" se usa en la Asignación Masiva de Insumos por Talla (Ficha Técnica), no en creación de órdenes como se asumía inicialmente)**
- [x] Telas **(soft-delete ya existía parcialmente -- corregido lo que faltaba y, más grave, se encontró y corrigió una inyección SQL real y confirmada en los 3 endpoints de escritura (crear/editar/eliminar), que concatenaban el texto del usuario directamente sin parámetros: un simple apóstrofe en un nombre de tela rompía el endpoint con un 500. Corregido con consultas parametrizadas; endpoint de edición migrado de `/telas/{_id}/{tela}` (nombre en la URL, roto ante un "/") a `/telas/editar` (body). Agregado `GET /telas/{id}/uso` + advertencia antes de eliminar, y detección/reactivación de telas eliminadas al crear una con el mismo nombre, igual que Tallas. Corregidos también 2 bugs de reactividad heredados en `TelasNuevo.vue` (resetForm/onReset reseteaban campos de otro formulario, rompiendo la creación de una segunda tela sin recargar). Hallazgo importante: el mismo patrón de inyección SQL (concatenación sin parametrizar) existe también en `catalogo_tintas` y en `/insumos/nuevo` -- queda como auditoría de seguridad dedicada, próxima tarea antes de continuar este checklist)**
- [x] Multiplicador de Precios **(CRUD del valor global correcto y ya parametrizado. Hallazgo principal: el toggle "aplicar multiplicador de empresa" por producto en `nueva.vue` nunca se persistía en base de datos -- al recargar una orden real para editarla, el botón siempre mostraba "no aplicado" sin importar el estado real, arriesgando una doble aplicación silenciosa del margen si el usuario lo reactivaba (con el 50% configurado actualmente, un producto de $100 pasaba a $225 sin que nadie lo notara). Corregido agregando `ordenes_productos.multiplicador_porcentaje` (se persiste el PORCENTAJE exacto, no solo un booleano, para reconstruir el precio base sin depender del valor actual de la configuración, que pudo cambiar desde que se aplicó). Actualizado en creación y edición (custom y sport). De paso se encontró y corrigió una inyección SQL en `GET /buscar/{id}` -- el endpoint real detrás de "Cargar Orden", con un route param reutilizado sin castear en ~11 consultas, no detectado por el barrido de inyección SQL anterior porque el valor se reasignaba a una variable local antes de usarse. Búsqueda exhaustiva en `app_multi` confirmó que ningún otro lugar del sistema mostraba/asumía incorrectamente este estado -- el problema estaba acotado a un único punto de reconstrucción, ya corregido y verificado end-to-end)**



## Gatos

- [x] Gastos Fijos **(4 hallazgos reales corregidos, priorizados de más a menos crítico por el usuario: (1) `POST /configuracion/gastos` -- el endpoint del Wizard de Configuración de Empresa -- no validaba que el `id_empleado` recibido perteneciera a la empresa autenticada, riesgo real de que cualquiera pudiera sobreescribir los gastos fijos de OTRA empresa; corregido validando contra `ID_EMPRESA`, verificado en vivo con un empleado real de otra empresa (rechazado 403) y uno legítimo (aceptado). (2) Ese mismo endpoint hacía un DELETE + reinsert completo de la tabla local `gastos` a partir del payload del cliente, en conflicto con `GastosManager.vue` (que ya persiste cada cambio en tiempo real vía los mismos endpoints REST) -- riesgo real de pérdida silenciosa de datos si el Wizard se reabría con un caché desactualizado; corregido para que el endpoint ya no toque la tabla local, solo refresque el caché de solo-lectura a partir del estado real. (3) `DELETE /gastos/{id}` era un DELETE físico real, sin soft-delete, sin aviso de uso, sin auditoría -- con datos reales, 2 Gastos Fijos con 2 y 1 pagos históricos respectivamente perdían su vínculo con la plantilla al eliminarla (FK `ON DELETE SET NULL`, no tan grave como el `CASCADE` de Tallas, pero sí rompía la trazabilidad); corregido con columna `eliminado`, `GET /gastos/{id}/uso`, y registro en `gastos_auditoria` al eliminar una plantilla (antes no dejaba ningún rastro). (4) `PUT /gastos/{id}` no tenía lista blanca de columnas editables (a diferencia de su endpoint hermano `PUT /gastos/registros/{id}`, que sí la tenía) -- cualquier clave del body se concatenaba directo como nombre de columna en el UPDATE; corregido con la misma lista blanca. Los 4 verificados end-to-end con curl contra el servidor real, con datos 100% desechables)**
- [x] Gastos Variables **(comparte backend con Gastos Fijos -- mismos endpoints `/gastos`, distinguidos por `tipo='variable'`, ya corregidos en la tarea anterior sin necesidad de tocar el backend de nuevo. El componente frontend `GastosVariables.vue` es un archivo separado que nunca había recibido las mejoras de UX de Gastos Fijos -- aplicadas ahora: aviso de uso + auditoría al eliminar, reactivación en vez de duplicado al recrear un nombre eliminado. Verificado end-to-end con curl (`tipo=variable`). Detalle de diseño señalado, no corregido: el modal no tiene selector de "Estatus", toda plantilla variable queda siempre activa)**
- [x] Gastos Adicionales **(auditoría sin hallazgos que corregir. Aclarado el concepto, que generaba confusión: a diferencia de Gastos Fijos/Variables (plantillas recurrentes), Gastos Adicionales son gastos de una sola vez (reparaciones, compras puntuales) que van directo al historial de pagos (`gastos_registros`, `tipo='adicional'`, sin plantilla). La página no mostraba nada porque no existe ningún registro real todavía (0 filas `tipo='adicional'` en la BD) -- comportamiento correcto ante datos vacíos, no un bug. Verificado end-to-end con un registro de prueba: crear, listar con el filtro real de la página, editar y eliminar, ambos con motivo obligatorio y auditados correctamente en `gastos_auditoria`. Este backend (`/gastos/registros`) ya tenía desde el principio el patrón correcto (lista blanca + auditoría completa) -- fue la referencia usada para corregir Gastos Fijos/Variables)**
- [ ] Historial de pagos
- [ ] Bitácora de gastos



## Configuración

- [x] Configuración de la Empresa **(checklist nunca se marcó pese a estar CERRADA 2026-08-06, 8/8 cards -- confirmado por >7 commits: CSS global roto eliminado, staleness en 5 cards corregido, bucle infinito en Horario, 3 switches muertos eliminados, Resumen restructurado, contraseñas texto plano señaladas)**