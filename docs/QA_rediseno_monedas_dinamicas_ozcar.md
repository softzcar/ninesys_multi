# Checklist de pruebas manuales — Rediseño de monedas/métodos de pago dinámicos

> Entorno: UI de Desarrollo (empresa 194, `app.nineteengreen.com` / `api.nineteengreen.com`). Backend + frontend ya desplegados en Dev.
> Orden pensado para probar de abajo hacia arriba: primero el catálogo (todo depende de él), luego captura de dinero, luego salida de dinero, luego cierre de caja, y al final los reportes que verifican que todo cuadre.
> Marca cada casilla al validar. *Esperado* es lo que debe ocurrir. Si algo no coincide, anótalo debajo del punto en vez de tacharlo.

## A. Catálogo — Gestor de Monedas (`/monedas`)

- [x] Entrar a **Configuración → Gestor de Monedas** (o la ruta `/monedas`) → *Esperado:* aparecen exactamente 3 monedas: **Dólares (USD)**, **Bolívares (VES)**, **Pesos (COP)**, con Dólares marcada como **moneda base**.
- [x] Revisar los métodos de pago de cada moneda → *Esperado:* Dólares (Efectivo, Zelle, Panamá), Bolívares (Efectivo, Pagomovil, Transferencia, Punto), Pesos (Efectivo, Transferencia).
- [x] Intentar eliminar la moneda marcada como **base** (Dólares) → *Esperado:* la app **bloquea la acción** con un mensaje claro (no se puede eliminar la moneda base).
- [x] Crear un **método de pago nuevo de prueba** en cualquier moneda (ej. "Binance" en Dólares) → *Esperado:* se crea sin error y aparece de inmediato en la lista.
- [x] Ir a cualquier formulario de pago (ver sección B) y confirmar que el método recién creado **ya aparece como opción**, sin necesidad de recargar nada más que la página.
- [x] Volver al Gestor de Monedas y eliminar ese método de prueba **sin haberlo usado en ningún pago** → *Esperado:* se elimina (soft-delete) sin advertencia, ya no aparece en los formularios.
- [x] Crear otro método de prueba, **usarlo en un pago real de prueba** (ver sección B), y luego intentar eliminarlo → *Esperado:* la app **advierte que está en uso** (muestra cuántas veces) en vez de eliminarlo silenciosamente.

## B. Captura de pagos — formularios reales

Para cada formulario, probar con **al menos 2 monedas distintas en el mismo pago** (ej. una parte en Dólares y otra en Bolívares) cuando el formulario lo permita.

- [x] **Abono a una orden existente** (modal "Abono a la Orden [id]", se abre desde varias pantallas) → *Esperado:* se pueden ingresar montos en varias monedas a la vez; el total mostrado en pantalla ya viene convertido a la moneda base (Dólares); al guardar, el abono queda reflejado correctamente en la orden (saldo pendiente baja lo correcto).
- [x] -> **Crear una orden nueva** (`nueva.vue`, pestaña "Pago y asignación") capturando un pago inicial → *Esperado:* mismo comportamiento que el abono; la orden se crea con el pago inicial ya registrado.
- [x] **Editar una orden existente** agregando un pago adicional desde el mismo formulario → *Esperado:* el pago nuevo se suma correctamente, sin duplicar ni perder los pagos anteriores.
- [x] **Convertir un presupuesto en orden** (modal "Convertir a Orden") capturando el pago inicial → *Esperado:* la orden se crea a partir del presupuesto, con el pago correctamente registrado y el cliente vinculado (si el presupuesto tenía cliente).
- [x] **"Otro Abono"** (`comercializacion/abonos.vue`, formulario principal, sin orden asociada) → *Esperado:* el pago queda registrado como abono general (no asociado a ninguna orden).
- [x] **"Abono a Orden Específica"** (mismo archivo, modal) → *Esperado:* igual que el abono normal, pero disparado desde esta pantalla.
- [x] En **todos** los formularios anteriores: para un método marcado como "requiere referencia" (ej. Zelle, Pagomovil, Transferencia), verificar que el campo de referencia/detalle **es obligatorio o al menos visible** → *Esperado:* el campo aparece; si se deja vacío en un método que lo requiere, el pago igual se guarda pero sin referencia (comportamiento actual, no debe trabar el guardado).
- [x] Verificar en cualquiera de los pagos de prueba que **el efectivo se refleje en Caja** (solo métodos "Efectivo") → *Esperado:* un pago en Zelle o Pagomovil **NO** aparece como movimiento de caja física; un pago en Efectivo **SÍ**.

## C. Retiros (`/comercializacion/retiros`)

- [x] Abrir la pantalla de Retiros → *Esperado:* el panel muestra el **efectivo disponible por cada moneda real** (Dólares/Bolívares/Pesos), no un valor fijo.
- [x] Intentar retirar **más de lo disponible** en una moneda → *Esperado:* se bloquea con un mensaje mostrando el monto máximo disponible en esa moneda específica.
- [x] Retirar un monto **dentro del disponible** en una sola moneda → *Esperado:* el retiro se guarda, y el disponible de esa moneda baja exactamente ese monto.
- [x] Repetir un retiro parcial adicional sobre el mismo saldo restante → *Esperado:* vuelve a validar correctamente contra el nuevo saldo (no contra el original).

## D. Cierre de Caja (`/comercializacion/cierre-de-caja`)

> Hacer esta prueba idealmente al final del día de pruebas, después de haber generado algunos pagos/retiros de prueba en las secciones B y C, para tener algo real que cerrar.

- [x] Abrir Cierre de Caja → *Esperado:* el panel "Disponible para cerrar" muestra el monto real por cada moneda con saldo (no lista monedas en 0 si no hay nada que cerrar en ellas).
- [x] Hacer un **cierre parcial** (cerrar menos del total disponible en alguna moneda) → *Esperado:* se puede confirmar el cierre; el sistema calcula automáticamente el **fondo remanente** (lo no cerrado) para esa moneda.
- [x] Intentar cerrar **más de lo disponible** en alguna moneda → *Esperado:* se bloquea con mensaje claro del máximo disponible.
- [x] Después de confirmar un cierre, volver a abrir Cierre de Caja → *Esperado:* el "Disponible para cerrar" ahora refleja el **fondo remanente** que quedó del cierre anterior, no el saldo de antes de cerrar.
- [x] (Opcional, si se sirve el mismo día) Hacer un **retiro** que dependa de ese fondo remanente recién dejado → *Esperado:* el retiro valida correctamente contra ese fondo (esto confirma que el fondo remanente quedó bien guardado, no en 0).

## E. Reportes — verificación final

- [x] **Reporte de Caja** (`/comercializacion/reporte-de-caja`), generar con un rango de fechas amplio (ej. mayo–julio 2026) → *Esperado:* aparece una sección "Efectivo" con una subsección por cada moneda real (Dólares/Bolívares/Pesos) y una sección con una subsección por cada método no-efectivo real (Zelle, Pagomovil, Transferencia, Punto, Panamá) — incluidas Punto y Panamá aunque digan "No hay X" si no tienen movimientos.
- [x] En ese mismo reporte, revisar el **"Total Efectivo"** y el **"Total General"** → *Esperado:* ambos muestran el símbolo de la moneda base real ($) y una suma coherente con las secciones de arriba.
- [x] **Balance de Cierres de Caja** (`/comercializacion/reportes/balance-cierres` o vía menú Caja → Balance de cierres), generar con un rango amplio → *Esperado:* aparece una tarjeta "Diferencia" por cada moneda real (no solo 3 fijas), y la tabla trae columnas Teórico/Rec./Ret./Fondo/Diff por cada moneda, más Total Real/Diff en la moneda base.
- [x] Ubicar en esa tabla el/los cierres hechos durante estas pruebas (sección D) → *Esperado:* los montos de "Ret." y "Fondo" coinciden exactamente con lo que se cerró y con el fondo remanente calculado; la columna "Diff" da **0** si no hubo ninguna descuadre real (retirado + fondo = fondo anterior + recaudado). — Encontrado y corregido un bug real: `retiros` no se atribuía a su cierre (faltaba `id_caja_cierres`), así que "Diff" siempre daba un falso descuadre del tamaño de lo retirado. Corregido, verificado en vivo contra el cierre real `_id=10`.
- [x] Confirmar que los **cierres históricos** (de antes de este rediseño, con fecha anterior a hoy) también se ven bien en ambos reportes → *Esperado:* sus montos siguen siendo correctos (se leen de las columnas antiguas, que quedaron congeladas como historial). — Verificado por SQL contra los 9 cierres de antes del rediseño (13/feb-22/may): montos correctos en ambos reportes. Los 2 cierres más antiguos muestran una diferencia grande, pero es porque son de antes de que existiera el mecanismo de atribuir ventas a un cierre (dato incompleto de esa época, no un bug del rediseño).

## F. Limpieza de datos de prueba

- [x] Si se crearon órdenes, pagos, retiros o cierres de prueba, decidir con el equipo si se dejan como evidencia de las pruebas o se limpian de la base de Desarrollo. — Auditado por SQL: órdenes de prueba (999xxx) ya estaban limpiadas; moneda Euro y método "binance" (0 uso real) dados de baja por decisión del usuario; el cierre real `_id=10` de las pruebas en vivo se conserva como historial (no es descartable).
- [x] Confirmar que ningún dato de prueba quedó en la base de **Producción** (estas pruebas deben hacerse únicamente contra Desarrollo). — Verificado por SQL de solo lectura contra Producción (autorizado explícitamente): no hay datos de prueba. Hallazgo importante: las tablas del rediseño de monedas ni siquiera existen en Producción todavía (Producción sigue en MySQL con el esquema viejo) -- el rediseño completo solo vive en Desarrollo, pendiente de planificar su despliegue.



##  Ricardo

### WhatsApp

- [x] lapagina `/comercializacion/reportes/pagos-abonos` no muestra correctametne el monto `**Saldo Pendiente Total**` con relación a las demás Cards
- [x] Revisar interfaz ene l fuljo de empleados donde el empleado no debe asignar material parece que se ve **FEO** — Causa raíz: `empresas.timezone` de la empresa 194 tenía el string literal `"NULL"` (artefacto de sincronización MySQL→Postgres), lo que rompía `Intl.DateTimeFormat` en el cálculo de eficiencia en segundo plano de "Órdenes Asignadas" y degradaba la interfaz. Corregido en 3 capas (dato, script de sync, guardia defensiva en `store/login.js`) el 2026-08-11. Confirmado por el usuario que el error ya no aparece.
- [ ] El empleado debe pode abrir una sola sesión (LO ATENDEREMOS CUANDO IMPLEMENTEMOS LA SEGURIDAD DEL SISTEMA),  
- [x] En el emplado Yervin en la relacion de pagos muesta un numero de horas irreal — "HORAS TRABAJADAS" sumaba diferencia de calendario cruda (sin restar noches/fines de semana) en vez de tiempo dentro de horario laboral. Corregido el 2026-08-11 (`TablaDePagos.vue`, mismo cálculo ya usado en el dashboard); verificado en vivo con Yervin: pasó de un valor inflado a 0.58 horas reales.
- [x] Cuando una orden tiene dos productos distintos por ejemplo Impresion DTF y Sublimacion y se asigna un emplado para imprimir DTF y otro para imprimir Sublimación el sistema nos abe quien está haciendo que, enotnces le exige que ingrese insumos para ambos productos a ambos empleados... (Thailyn)
- [x] La vendedora Zenaida sigue apareciendo en el select de empleados de balance ya bonos y pagos en poduccion, investigar si el bug es solo en esta pagina o en todo el sItema, la vendedora zenaida esta desactivada en el sistema.
- [x] Eliminar el reporte 'Cortar' De Producción
- [x] En el reporte que meuestra 'Buscar' parece estat harcodeada la dirección de la empresa, debe mostrase la dierección que se le asigne a cda empresa en su configuración.
- [ ] WhatApp tambene sta mezclando las empresas
- [x] wizard de inicio: Agregar emoleados, seleccioanr departametneos que si se van a utilizar, 
- [x] wizard inicio: NEcesitmaos en el wizard ocnfigurar de manera sistematica y logica la carga inicial de datos, 
- [x] En crear nueva orden tenemos productos que son impresion por ejemplo, estos productos NO llevan talla, puede que leven tela o simplemente se venda la impresion en papel... lo quehace tambena l corte opcional, veamos como podemos indicar que existen porductos que no son prendas pero sis e fabrican.
- [x] En el emplado IMPRESIÓN  tenemos un inconveninete en el flujo de recolecciond e losd atos de la tinta. El sistema aestá pensado para un escenario donde el software siempre de los datros que se bene intorducir, sin mebargo existen casos recurrentes donde la información proporcionada no es confiable o d eplano la inforacioń no esta disponible denependiendo dle sofware que use la impresora... La solución propuesta es buscar la amnera de 'promediar' la cantidad de tinta utlizada dependiend de los emtros impresos entre recargas... Tener en cuenta que impresoras usan tntas distintas algunas usan más tipos de tintas que otras... 
- [x] Desde Clientes poner un filtro similar al que tenemos en la pestaña productos en el botón catálogo para filtrar clientes. **Filtros ya implementados por nombre, cédula, correo, teléfono, país, estado, ciudad y productos comprados**
- [x] Mejorar interfaz de **Horario laboran en el Wizard** NO podemos omitir un turno desde la interfaz, maquetar correctamente el turno nocturno, poninedo el texto debajo par que todo se alne acorrectamente con los otros dos horaros. tenemos selector de días de la semana en la parte superior como antes y también en la parte inferior de cada turno es confuso. No pude configurar un horario diferente para el día sábado.
- [x] n Crear - editar producto poner el Check 'Requiere Talla, Corte y Tela' debajo del Check 'Prodcuto fisico' y el check 'Es un Diseño' de primero en la parte superior
- [x] Poder crear **cataegorias** desde el formulario de crear / editar productos
- [x] La asignación manual de la tasa de cambio no funciona
- [x] Cambiar el texto `Marque esta opción si el producto es un artículo físico que requiere inventario` por ``Requere fabricación` en crear editar un porducto.

## Pagos

- [ ] En la planilla ya no se muestra los empleados con salario base despues de lso cambios en la asigancion de prodcutos granulares

## Configuración de la empresa

- [ ] En la configuración del horario laboral necsitamos implementar poder asiganr solo medio dia de trabajo... 

## Wizard Nueva Empresa

- [ ] **Wizard de nueva empresa** se quedó bloqueado al hacer Click en Finalizar, al recargar no entra a la app se queda bloqueado
- [ ] **Wizard nueva empresa** No crea un nuevo porducto
- [ ] **Wizard nueva empresa** desde el asistente tambien cree en el catalogo de insumos papel dtf, pero luego no salia cuando creaba un producto del inventario y debia asociarlo al catalogo

## Crear nueva orden

- [ ] **Crear la primera orden** de la empresa 207 tardó 14 segundos la api en responder, veamos que esta demorando tanto la creación de la orden...

## Administración Productos

- [ ] Al momento de asignar insumos a un producto, tenemos un botón llamado [+ Cargar Todas las Tallas] esto nos carga TODAS las tallas disponibles en el catálogo de tallas. En este caso estoy creando un porducto llamado Banderin que NO lleva tallas, o puede haber prodcutos que solo se fabrican en tallas infantiles por ejemplo, entonces poder cargar en insumos de productos unicamente las tallas que se seleccionen y estas mismas tallas son las que se deben mostrar en el formuario de crear una nueva orden y presupuesto de manera que el usuario NO tenga oprtunidad de seleccioanr una talla que no corresponde a ese producto. Entocnes aplicar un filtro que solo retorne las tallas configuradas en la asignación de insumos de productos para cada producto en nueva orden y presupuesto. Tambien necesitamos que en la talla se muestre la opción 'No aplica' y tambien en 'Tela' poder seleccioanar 'No aplica' y asegurarnos que esta implementación no rompa nada más al momento de validar y procesar estos datos.
- [ ] 🔥TEnemos un nuevo check `Requiere Talla, Corte y Tela` pero no todos los productos requieren todos los items de información, por ejemplo un banderin no requierre talla ni corte solo tela, se me ocurre que la manera mas simple de implementarlo es que en los SELECT en el wizard de crear nueva orden y presupuestos opngamos la opción 'No Aplica' como una opción siempre presente. Esta fucnionalidad solo está implementada en el SELECT 'Corte' tanto en crear ordenes como presupustos. Debemos tener en cuenta que la API entienda este parámetro y lo guarde de manera de no romper nada, si no es posible implemenarlo sin romper algo después, es decir alguna consulta o la manera como renderizamos los datos cuando traemos estos datos entonces tendremos que modificar esas partes. Procedamos paso a paso con cuidado de que todo quede bien programado y todos los escenarios cubiertos

## WhatsApp

- [ ] **WhatsApp** tenemos mensajes automatizados que se envian alos clietnes, para ello tenemos unas plantillas de tipo [NOMBRE_EMPRESA] por ejemplo, vamos primero a verificar que estas plantillas estén funcionando correctamente, luego redactamos mensajes que se creen por defecto junto con la empresa. Y vamos a mejorar la interfaz desde donde se crean y modificane stos mensajes implementando hacer click sobre esas etiquetas para insertarlas en el textarea 

- [ ] en el asistente de configuración de empresa pide primero productos y despues talla, entonces hay que cambiar el orden, y que cuando se agreguen las tallas que automaticamente muestre por defecto el ajuste como estaba antes y luego si quiere que lo edite
- [ ] 🔥**WhatsApp** verificar como está manejando la IA los sinonimos de los productos y ver si se pueden incluir en el JSON de la base del conocimiento.
- [ ] El porcentaje de incremento no funciona para las tallas XL en crear nueva orden al momento de calcular el precio
- [x] **WhatsApp** Recalculo de tallas [N]XL
- [x]  **WhatsApp no da de baja **  Sigue enviando mensajes a los vendedores y administradores qunque se apague el check enl a configuración dela IA, y laopcion dese el chat para escribir "BAJA" o "NO"  tampoco funciona...

## Empleados API_EMPRESAS

- [ ] Ese es el telfono de Zenaida 4262535073 que es empelada de la empresa 194 ... Está inactiva pero el telefono sigue registrado ... Si intento crear un empleado con ese telefono en tora emrpesa me muestra error y no me lo permite. ¿Es posible qeu un empleado trabaje en dos empresas? Creo que si... entonces, un empelado (su teléfono) puede estar registrado en varias empresas pero el mismo teléfono NO se puede repetir  en la misma empresa... es decir dos empelados de la misma empresa NO pueden tener el mismo numero tlefonico. ¿Que problema nos puede traer que el mismo empelado este registrado  en api_empresas.empresas_usuarios 

## dtf.nineteencustom.com

### Credenciales Ricardo

- App: http://localhost:5173
- Usuario: nineteenvenezuela@gmail.com / Clave: w2XAqzwvIjNH
- Panel de usuarios (admin): http://localhost:5173/admin/usuarios
- api key pexels 8BA9DCD1dLIDBBTakULZILjOGxxHF0ckOE6eomygOkFqsyIFlo1X4VZT

### Credenciales VPS

Credenciales generadas (guardalas ahora, no quedan en ningún log de chat después de esto)

-  Login admin: nineteenvenezuela@gmail.com / pqGLyeQduv3r                         
- DB print19  │ usuario print19 / a4e8d8738a46263b7c67bc24d285b6f2d61ae7b313d4af13 
- JWT_SECRET  │ 7180264cfd3565b70361a7d22398d87d5a8998a3b05c8daa30c958b31a9478d2 



- [x] Crear sudominio en CloudFlare

- [x] Crear sitios en DEV o PROD directamente?
- [x] Crear repositorio en Github
- [x] clonar en VPS
- [ ] Porbar funcionamiento
- [ ] 🐛 Una vez que se envía el emnsaje al servicio de whatsapp para generar un presupuesto autmáticamente, da error diciendo que el producto no tiene nombre
- [ ] 🐛 Dejar de mostrar el precio en el select de productos
- [ ] 🐛 El requerimiento para el presupuesto debe generarlo independientemente que el modo IA esté activado o no, 
- [ ] 🐛 Una inagen se meustra en negro despues de haber sido procesada
- [ ] 🐛 `/lienzos/[value]` en el boton 'Editar / Reacomodar' no muestra el preview de las imagenes, debe mostrar las imagnes orifginaes y con lso mismos cortoles para editar el ancho y cantidad.
- [ ] 🐛 Al momento de cargar la imagen queita el fondo automáticamente, debemos permitir al usuuario indicar cuando le debe quetar el fonde con eun check en el formupario de la parte inferior
- [ ] En `proyecots/[vaalue]` necesitamos una nueva pestaña lado izquierdo  llamadsa 'Subir Lienzo' esta opción se usará apra subir un 'Lienzo' ya montado.
