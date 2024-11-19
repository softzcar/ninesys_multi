# Arreglar detales al subir actualizacion
## [10:05 a.m., 7/10/2024] Ricardo Plus: buenos días estuve probando asignando tareas y esto fue lo que vi de momento: 
- **X** Cuando se buscan todas las ordenes muestra estos datos, hay que darle pag 2 para que comience a mostrar como es
- Revisiones no está funcionanado
- - diseño cuando sube la imagen sigue con el mismo error (Error 500 La revisión no se creó)
- **X** Cuando se asigna la tarea en corte emite mensaje de error al actualizar cantidad del lote code 500
- **!!! PENDIENTE REVISAR LA URL DEL CDN DE IMÁGENES->** cuando diseñador hace revision dice la revision no se creo code 500
- **X** cuando en impresión se comienzan todas las tareas luego en individual solo muestra 2 tareas
- **X** una ves asignado desde control de producción la tarea no la muestra en impresión
- **X** una vez se le da terminar tarea se pasa a enviar los datos y la ventana sigue activa
- en estampado la tarea estaba en curso cuando no se habia comenzado aun, y no deja terminar ya que tampoco deja seleccionar el rollo de tela
- en corte cuando entre salia activa una tarea que habia comenzado impression y de igual manera la orden que estaba en curso no muestra todas las tareas sino solo dos
- en costura cuando se inicia y luego termina pide datos extra de costura que no permite termimnar la tarea
- en revision tampoco deja terminar ya que pide datos extra, en tareas en curso en detalles si muestra todas las ordenes detalladas
- una vez terminadas las tareas a ninguno le relaciona el pago, solo los de impresion
[10:20 a.m., 7/10/2024] Ricardo Plus: y ya que estas con el modulo empleados y control de producción revisar las tareas que asignamos inicialmente ya que al menos en este momento toca revisar bien todo el proceso ya que con los cambios no funcionan bien:


- control de produccion cuando asigna a corte puede enviar mas del item solicitado, mostrar en existencia la disponibilidad
modulo control de produccion
- En control de producción acomodar está tarea ya fue asignada 
- Función autoasignar todas las tareas solo seleccionando la persona en control de producción 
- Quitar diseño gráfico de la asignación de tareas en control de producción (posibilidad de que todas las ordenes se puedan asignar sin necesidad de item diseño grafico) 
- Inventario no se resta cuando corte Impresion Ponen cantidades en inventario sigue igual.

### Modulo empleados
- Revisar que al empleado le muestre vincular órdenes en modulo de empleado-
- Módulo empleado iniciar tareas individuales para verificacion de pedido y calculo de pago, (impresion, estampado y corte checar items y al terminar dejar activo activo el boton terminar para introducir datos de insumos)
- mostrar el total ganado y total de productos para poder imprimir o enviar pdf, posibilidad de enviar por Whatsapp que muestre este mismo dato en planilla de pagos.
- en relacion de trabajos mostrar tareas pendiente tambien como las terminadas y/o eliminar esa ventana y dejar solo las tareas normales
### Modulo DISEÑADOR
- Cuando el diseñador sube la imagen decir la imagen fue subida exitosamente 
- Acomodar en diseño tallas y personalización no carga
- Mostrar reporte de fallos 
- Cuando se pida una reposición desde módulo control de producción  luego mostrar en módulo empleado que es una reposición puede ser el botón amarillo que cuando le den abra el detalle ejm:  imprimir solo una manga derecha
### Calcular los tiempos que tomo cada pedido 
- Mostrar reporte de tiempos, ejm, desglose diseño 2 días, impresión 2 horas, corte 1 hora, y el total, en el futuro guardar dato de promedio de tiempo para luego hacer estimaciones a futuro. 
- Mostrar totales de producción semanal de lunes a viernes, posibilidad de ver solo impresiones, solo corte, solo costura, y al final todo lo terminado que este en revision y terminado con sus respectivos tiempos 

- En productos revisar inventario, cuando se hace orden deberia sumarse al inventario en el momento en que produccion dice entregado, y cuando se vende deberia descontarse del inventario

- en la ventana de asignacion de diseños mostrar nombre de cliente
