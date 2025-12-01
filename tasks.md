# DIARIO
- [X] Arregrlar pagos de empleados ne la planilla
- [X] Corrección de Bug en Carga de Orden No Asignada
- [X] Carga de Observaciones Adicionales
- [ ] Reset de formaulaios en el modulo de empleados
- [ ] Estimar tiempos de producción basado en los datos de las ordenes

******************************************************************************



# MENSAJE ORIGINAL

cargar numeros de orden mas rapido
ordenar por fecha en control de produccion
filtro de busqueda de ordenes se queda pegado y se cierra la ventana (verificar)

control de produccion debe llevar reporte semanal
resumen semanal (filtro de lunes a viernes) de total de prendas fabricadas (estado terminada)
orden 23 --- 10 productos
orden 13 -- 5 productos
total de semana
excluir diseño grafico

reporte por producto
poner cantidad total gastada (valor final menos inicial)
agregar uso de papel en modulo de impresion
agregar uso de tinta general no por numero de orden. (registro de fecha)(total de productos impresos en ese rango de fecha)
agregar rendimiento de tela por kilo (1 kg rinde 4 metros) (editar insumo para poder agregar el rendimiento)
Buen dia agregar esto a pendientes urgentes :
(ordenes en curso y todas las ordenes)Poder Ver solo órdenes pendientes de pago (no mostrar las pagadas) (un boton donde se seleccione ver ordenes pendientes de deuda)
Cuando se hacen abonos y tiene un decimal no se puede hacer el pago

# FIN MENSAJE ORIGINAL

X Buen dia agregar esto a pendientes urgentes :
  X (ordenes en curso y todas las ordenes)Poder Ver solo órdenes pendientes de pago (no mostrar las pagadas) (un boton donde se seleccione ver ordenes pendientes de deuda)
  
  X Cuando se hacen abonos y tiene un decimal no se puede hacer el pago


-> cantidad total de pedidos finalizados por semana,

-> Resumen de producción semanal 
  *-> Calcular los datos de la tabla porque permanecen en cero*

- (Producción) Reporte de inventario por insumo, por orden, por producto, mostrando fechas y números de orden involucrados 

NO! Optimizaci;on de tiempo de respuesta de el reporte de ORdenes desde likSearch y desde el inpit Buscar

X (vnetas) Reporte de inventario por insumo, por orden, por producto, mostrando fechas y números de orden involucrados 
  *NOTA: Los registros se iran creando en la mendida que se vayan procesando los roductos en el departamento de corte.*

- Calcular los tiempo de producción por producto, desde que diseño esta aprobado hasta finalizar en control de produccion por número de orden. calcular tiempo promedio de franelas(por producto)

X (Ya funciona) Botón de reposición arreglarlo revisar

eficiencia de corte .(calculando el desperdicio) por producto por número de orden, por talla más promedios mostrando link con historial de números de orden involucrado 

- modulo de costos de productos (suma de todas las comisiones por empleado, mas costo de tela, costo de impresion, mas un precio fijo base) para luego poder calcular las ganancias totales, que exista tambien el calculo mensual donde se incluyan gastos como alquiler, luz, internet, la posibilidad de agregar cualquier gasto, y al final relacionar costos vs ingresos totales


- cargar numeros de orden mas rapido
- ordenar por fecha en control de produccion
- filtro de busqueda de ordenes se queda pegado y se cierra la ventana (verificar)

- control de produccion debe llevar reporte semanal
- resumen semanal (filtro de lunes a viernes) de total de prendas fabricadas (estado terminada)
  orden 23 --- 10 productos
  orden 13 -- 5 productos
  total de semana
  excluir diseño grafico

- reporte por producto
- poner cantidad total gastada (valor final menos inicial)
- agregar uso de papel en modulo de impresion
- agregar uso de tinta general no por numero de orden. (registro de fecha)(total de productos impresos en ese rango de fecha)
- agregar rendimiento de tela por kilo (1 kg rinde 4 metros) (editar insumo para poder agregar el rendimiento)

- buen dia, estoy revisando el modulo de resumen semanal, y veo que esta buscando las fechas segun el numero de ordenes, y necesito que busque es segun el numero de pagos realizados en esa semana para que sea realmente funcional

- Y necesitamos que el reporte de caja muestre el dinero por vendedor, porque se complica hacerlo general como lo pensamos inicialmente, seria dejarlo igual para ver el general y una opcion donde se muestre solo por el vendedor que se seleccione









# ANTIGUO DESDE AQUÍ



# QUEDAMOS EN QUE YA FUNCIONA LA CARGA DEL STATE Y MEJORAMOS LA VELOCIDAD DE LA CARGA DE DATOS PERO NO LEE EL CATALOGO DE CLIENTES DESPES QUE S EMAPEA DEESDE EL VECTOR DE STATE...,                                                                            

# ESTAMOS EN REVISAR Y PONER A FUCIONAR BOTÓN INICAR Y TERMINAR TAREA EN EL MÓDULO DE EMPLEADOS, REGISTRAR EL TRABAJO PARA EL PAGO. PASO SIGUIENTE VERIFICAR EN EL RECHAZO (NO SE LMA ASI) POR TRABAJO DAÑADO DETERMINAR COMO Y CUANDO SE LE DESCUENTA, SI AUTOMÁTICAMENTE O MANUALMENTE PUE EL ERROR PUEDE NOS ER CULPA DEL EMPELADO Y EM ESE CASO ENTEIENDO QUE NO SE HACE DESCUENTO DE SU SALARIO.

## QUEDA EN EL CAMINO

### DISEÑO -> CUANDO SE GENERA UNA NUEVA REVISION HAY QUE RECARGAR PARA QUE LA INTERFÁZ SE COMPORTE CORRECTAMENTE

### PRODUCCION -> VERIFICAR EN CREAR NUEVO PRODUCTO QUE NO SE REPITA EL ITEM DISEÑO...

### PRODUCCION -> AUN MUESTRA LA ORDEN SI ES SOLO DISEñO AUNQUE YA NO MUESTRA EL PRODUCTO DISEñO, DETERMINAR LA MEJOR MANERA PARA HACER ESTO, SI CON UN QUERY, DESDE EL BACKEND O UN FILTRO DESDE EL FRONTEND...

- [ ] DISEÑO -> Módulo de ajuste de tallas vamos a hacer un botón para ajusar tallas y personalizacion donde se incluya la cantidad de cada una, con un botón y un modal con formlrio para esta tarea, este componente va a ser accedido por los departamentos de diseño e impresión.
- [ ] PRODUCCION -> El inventario de telas va a quedar como está, se le asigna por orden y debe pesar las telas al momento de utilizarlas y registrlo en la app,
- [ ] PRODUCCION -> Inventario de impresión y confección, se le asignarán insumos al empleado, en el caso de impresión tintas y papel, en el caso de confección insumos de costura, esta asignación se hace por empleado y se regstra la fecha en que se le entrega el insumo y se registra la fecha en que se acaba y aparte la fecha en que se repone pues peude pasar que se acabe pero no haya para reponer
- [ ] PRODCCIÖN - ADMINISTRACION -> Emitir un reporte que refleje los datos de los ajustes de tallas y personalizaxions asociadas al munero de orden
- [x] Empleados -> Mostrar el botón en rojo si el estatus es urgente

```
SELECT
	a._id orden,
    a.cliente_nombre cliente,
    b.prioridad,
    b.paso,
    a.fecha_inicio inicio,
    a.fecha_entrega entrega,
    a.observaciones detalles,
    a._id acciones,
    a.status estatus
FROM ordenes a
JOIN lotes b
	ON a._id = b.id_orden
JOIN (
	SELECT count(*) num, name
    FROM ordenes_productos
    WHERE name NOT LIKE 'DISEÑO%'
    GROUP BY id_orden
    HAVING COUNT(*) > 1
) c
GROUP BY b.id_orden
ORDER BY a._id DESC


 /* SELECT count(name), name, id_orden
    FROM ordenes_productos
    WHERE id_orden = 1
    GROUP BY id_orden
    HAVING COUNT(*) < 2 */
```

### Pasos correctos

1. Corte
2. Imnpresión
3. Estampado
4. Confección
5. Limpieza
6. Revisión

-> VEERIFICAR PASOS EN ESTE ORDEN CCORRECTO

-> CUANDO EL DISEÑADOR PASA UNA NUEVA REVISIÓN EL ESTATUS DEBE CAMBIAR A `Esperando Respuesta`
-> ORDENAR DESCENDETE LAS REVISIONES EN COMERNCIALIZACION
-> AL RECHAZAR UNA ORDEN EN COMERCIALIZACION SE DESAPARECE LA IMAGEN Y MUESTRA `no-image.png`
-> PASAR LAS REVISIONES APROBADAS PARA OTRA PARTE, (VER CRITERIO PARA ELLO)
-> TENER EN CUENTA QUE SERÁN MUCHAS REVISIONES CONSIDERAR ORGANIZARLAS EN ALGUN TIPO DE COPONENETE DESLIZANTE O ALGO ASI....

//consulta de diseño verificar que el estatus de la revisión esté llegandocorrectamente

```
SELECT
a.\_id linkdrive,
a.codigo_diseno,
a.id_orden,
a.id_orden id,
a.id_orden imagen,
a.id_orden revision,
b.cliente_nombre cliente,
b.fecha_inicio inicio,
a.tipo,
c.estatus
FROM disenos a
JOIN ordenes b
ON b.\_id = a.id_orden
LEFT JOIN revisiones c
ON c.id_diseno = a.\_id
WHERE a.id_empleado = 5
AND a.terminado = 0
ORDER BY a.id_orden ASC
```

- [x] QUEDAMOS: `uploadImageRevision.vue` debe pasar al componenete `uploadPropuesta.vue` una variable para recibir via ` $emit` la orden apra habilitar el boton `Nueva Revision`, las revisiones se han creado correcramente, falta probar eeditar cada una a ver si el CDN esta recibiendo los datos correctos y sesta escribiendo el nombre del archivo correctamente.

- [x] LISTO: AL INSERTAR NUEVA REVISION NO MUESTRA LAIMAGEN `no-image.png` AL SUBIR LA SEGUNDA PROPUESTA, REVISAR LOS REGISTROS EN LA BASE DE DATOS PARECE QUE SOBREESCRIBE LA REVISION ANTERIOR EN EL CAMPO `revision` TAMBIEN SOBREESCRIBE LA IMAGEN. VAMOS A REVISAR EL ID DE LA REVISION QUE ESTAMOS ENVIANDO TANTO A `api3` COMO A `cdn` Y VERIFICAR QUE ESTAMOS ENVIANDO EL DATO CORRECTO Y QUE TAMBIÉN ESTAMOS GESTIONANADOLO BIEN ENC ADA PROGRAMA.

- Comercialización

  - Métodos de pago:

    - [x] Normalización de base de datos

    - [x] Creación de tablas

    - [x] Modificación de interfaz

    - [x] Cambiar tamaño de los titulos de el tipo de moneda, se ven muy grandes en pantallas medianas y pequeñas

    - [x] Corregir columnas sobran espacios a la izaquierda

    - [x] Programación de formulario para tasas

    - [x] integración de datos de tasas en el modulo de formas de pago

    - [x] creacion de formulario para ingresar indidualmente los emtodos de pago

    - [x] modificar el vector del formulario apra incluir las variables por separado

    - [x] validar el formulario de metodos de pago

    - [x] Reprogarmr el script de calculo de montos de pago para que interactue en tiempo real con las tasas guardadas ahora en el store

    - [x] modificar los datos del payload para la creación de la orden

    - [x] modificar el backend para recibir los nuevos datos y guardarlos en las tablas ahora por separado

    - [x] PROGRAMAR CORRECTAMENTE LAS FORMULAS QUE SE MUESTRAN EN TIEMPO REAL

    - [x] Migrar las variables de tasas de cambios al store para que permanezcana activas durante la sesión

    - [x] Crear nuevos campos en la tabla metodos_de_pago para separar el tipo de moneda del metodo de pago

    - [x] reprogramar backend para guardar los datos correctamente

    - [x] TOTAL: El monto total a pagar dela orden

    - [x] ABONO: el monto abonado qeu corresponode a la sumatoria de Dolares pesos y bolivares

    - [x] DESCEUNTO: el monto descintado de la orden

    - [x] RESTA: el monto que resta por pagar si el abono es inerior a al monto de la orden

  # RETIROS

  - [x] Modificar tabla, añadir campo moneda para luego poder hacer el cálculo de cierre de caja

  - [x] crear formulario de retiros (monto y detalle)

  - [x] Boton par enviar el retiro

  - [x] programar metodos para conexion con al api

  - [x] Crear formulario de retiro

  -> ??? PONER MONTOS DE EFECTIVO POR TIPO (CUANTOS DOLARES, PESOS Y BOLIVARES HAY DISPONIBLES) en hacer abono a irden desde `Ordenes Activas`

  - [x] 23/01 QUEDAMOS EN QUE ACABAMOS DE CREAR EL CAMPO PARA EL CODIGO DE DISEÑO, LO GEMOS BSCADO EN EL BACKEND PARA DEVOLVERLO EN `fields` y el `items` VIENE CREAR EL CONTROL BASADO EN `linkDrive` PARA GESTIONARLO...

  - [x] Crear reporte de retiros con filtro de fechas (por defecto muestra el dia actual)

  - \*\*\* CUANDO LA ORDEN TERMINA DESAPARECE DE COMERCIALIZACIONA AUNQUE SE DEBA DINERO DE ESTA ORDEN, LA ORDEN DEBE PERMANECER VISIBLE EN COMERCCIALIZACION AUN CUANDO ESTE TERMINADA SI AUN TIENE SALDO PENDIENTE.

  - [x] RETIROS: Verificar que `caja[n].monto` da error al iniciar, incicalizar caja con la estructura de los objetos dolares, pesos y bolivares

- [x] RETIROS: Verificar que todo okok con este modulo aqui quedamos el viernes 20 okok

---

- ABONOS

  - [x] CHECAR SI ESTAMOS GUARDANDO DONDE (DECIDIR SI LA TABLA `retiros` AUN NOS VA A SER NECESARIA O PRESCINDIREMOS DE ELLA)

  - [x] EN CREAR NUEVO ABONO DEBEMOS CARGAR LOS DATOS EN AL TABLA `caja` EN VASO DE SER PAGOS EN EFECTIVO

  - [x] En `Ordenes En Curso` la opción abonos solo pide el monto, debemos pedir el monto y tambien todos los métodos de pago de pago... :(

  - [x] PROGRAMAR FORMULARIO PARA CREAR NUEVOS ABONOS BASADO EN LOS METODOS DE PAGO DE LA NUEVA ORDEN ADICIONANDO LA OPCION PARA ESCRIBIR U DETALLE Y SELECCIONAR EL TIPO DE ABONO, DONDE `ABONO` SE REFIERE A UN ABONO A UNA ORDEN A CREDITO Y `OTROS` SE REFIERE A UN ABONO SOBRE OTRO CONCEPTO DISTINTO, EN AMBOS CASOS SE DENBE ESPECIFICAR EN EL DETALLE LO OCURRIDO.

  - [x] Quitar tipo de abono de `Otros Abonos`

- [x] En `ORdenes en curso` verificar recibir datos en el backend en `\orden\abono` alli debemos guardar cada método por separado en la tabla `metodos_de_Pago` y si es efectivo debemos reflejarlo en la tabla `caja`

- [ ] En `Otros Abonos` mostrar una alerta de crear nuevo abono okok!!!

-> 23/01/2023 CREAR EN LA TABLA `diseños` UN CAMPO PARA GUARDAR EL CODIGO DEL DISEÑO

- [ ] PROGRAMAR BACKEND, PARA:

  - [x] CREAR UN NUEVO ABONO
  - [ ] BUSCAR ABONOS DEL DIA
  - [ ] BUSCAR ABONOS DE LA SEMANA
  - [ ] BUSCAR ABONOS CON RANGO DE FECHAS?

- [ ] CIERRE DE CAJA -> QUEDAMOS EN QUE DESPUES DE GUARDAR EL CIERRE DEBEMOS RECARGAR LOS DATOS PARA MOSTAR LO QU QUEDO EN CAJA, EM ESTE CASO LA TABLA ABONO, PERO NO MUESTRA NADA... PODEMOS RETORMARLO EN EL POST Y MATAR ESE GALLO ALLI...

- [x] CREAR UNA TABLA LLAMADA `caja` PARA CONTROLAR LA CANTIDAD DE EFECTIVO EXISTENTE EN LA CAJA, AQUI LLEVAREMOS UN REGISTRO DE LOS ABONOS (QUE PUEDEN SER POR ORDENES NUEVAS, POR ABONOS A CUANTAS A CREDITO U OTROS INGRESOS, Y TAMBIEN LOS RETIROS, QUE AHORA TIENEN UNA TABLA APARTE, LOS REGISTRAREMOS AQUI COMO EGRESOS, AQUI TAMBIEN SE REGISTRARÁ EL CIERRE DE CAJA AL MOMENTO DE HACERSE Y QUEDAR EFECTIVO EN CAJA AQUI SABREMOS CUANTO DINERO HAY). lOS CAMPOS PARA LA TAMBRA SERÁN"

# \_id

# monto

# moneda

# tasa

# tipo (nueva_orden, abono_a_orden, otro_abono, retiro, cierre_de_caja, ajuste)

# detalle

# id_empleado

# CREAR ALGO LLAMADO `AJUSTE DE CAJA` O SIMILAR DONDE SE PEUDA AJUSTAR LAS CANTIDADES DE EFECTIVO CON UN DETALLE

- EL CIERRE DE CAJA SE HARÁ EN BASE A

  - [x] modificacioń del frontend

  - [x] modificación del backend

  - [x] modificación del backend crear nueva orden

  - [x] El reporte de caja en fechas anteriores no muestra los montos en efectivo si ya se ha hecho el cierre de caja

  - [x] Organizar el menu de coercialización organizar ciere de caja y re portes relacionados en un sub menu

  - [x] reporte diario de cierre de caja

  - Probar reporte de caja por fechas con la fecha `2013-01-23` como referencia

  # Poner Overlay al cierre de caja

- Empleados:
  - implementación de vista de tarea activa
  - implemeetación de información de pagos y tiepo transcurrido
