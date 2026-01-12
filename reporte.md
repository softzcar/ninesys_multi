# Reporte Frontend

## miércoles, 25 de septiembre de 2025

### Tareas Realizadas

#### 1. Refactorización de Lógica de Monedas y Tasas
- **Resumen:** Se detectó un comportamiento incorrecto en la visualización de las tasas de cambio. Se refactorizó la lógica para mostrar mensajes claros al usuario según la configuración de monedas (sin monedas, solo dólar, o múltiples monedas). La lógica de validación se centralizó en la store de Vuex usando `getters` para ser consumida por múltiples componentes, eliminando código duplicado y mejorando la mantenibilidad.
- **Logro:** Comportamiento consistente en toda la aplicación y un código más limpio y centralizado.

#### 2. Mejora de UX en Página de Retiros
- **Resumen:** Se modificó la página de retiros para que, en caso de no haber fondos disponibles, se muestre una alerta informativa en lugar de un formulario vacío, guiando mejor al usuario.
- **Logro:** La interfaz ahora es más clara y previene la confusión del usuario.

#### 3. Corrección de Bug de Cálculo `NaN` en Abonos
- **Resumen:** Se solucionó un bug crítico en la página de "Abonos" donde los totales se mostraban como `NaN`. El error se debía a cálculos que no manejaban valores nulos de las tasas de cambio. Se robustecieron los métodos de cálculo para prevenir el error.
- **Logro:** Los cálculos en la sección de abonos ahora son seguros y muestran siempre un valor numérico correcto.

#### 4. Corrección de Bug de Cálculo `NaN` en Reporte de Caja
- **Resumen:** Se corrigió un bug similar en la página de "Reporte de Caja". Se identificó el componente correcto (`reporte-de-caja.vue`) y se arregló el método de cálculo `getTotal()` que contenía errores de lógica y de depuración.
- **Logro:** Los totales del reporte ahora se calculan y muestran correctamente.

#### 5. Mejora de UX en Recarga de Tintas
- **Resumen:** Se implementó una validación en la página de recarga de tintas. Si no hay impresoras o tintas configuradas, ahora se muestra una alerta con enlaces directos a las páginas de gestión correspondientes.
- **Logro:** La página ahora guía activamente al usuario para que complete la configuración necesaria antes de usar la funcionalidad.

#### 6. Corrección de Error de Runtime en Control de Producción
- **Resumen:** Se solucionó un error `TypeError` que rompía la aplicación en la página de control de producción. El problema era un acceso inseguro a propiedades de una respuesta de API que a veces no existían. Se blindó el código para manejar respuestas incompletas.
- **Logro:** Se restauró la funcionalidad de la página de control de producción, evitando que la aplicación se detenga.

#### 7. Corrección de Enlace en Recarga de Tintas
- **Resumen:** Se corrigió un enlace roto en la nueva alerta de la página de recarga de tintas. Se ajustó la ruta del `router-link` y su estilo para que funcionara y se viera correctamente.
- **Logro:** La funcionalidad de la alerta de guía ahora está completa y es 100% funcional.

### Tareas Pendientes

  - A pesar de una larga sesión de depuración y la corrección de múltiples bugs secundarios en 4 componentes distintos, persiste el problema principal: la edición de un precio existente resulta en la creación de un duplicado porque el `id` se pierde en el flujo de datos. La tarea quedó pendiente para ser retomada.

## domingo, 1 de diciembre de 2025

### Tareas Realizadas

#### 1. Corrección de Bug en Carga de Orden No Asignada
- **Resumen:** Se solucionó un bug donde al cargar una orden no asignada para editarla, el sistema creaba una nueva orden duplicada al guardar. El problema se debía a que el frontend no actualizaba el endpoint de la API a la ruta de edición (`/edit`) al cargar los datos de una orden existente.
- **Logro:** Ahora el sistema detecta correctamente que se está editando una orden y utiliza el endpoint adecuado, permitiendo actualizar la orden existente sin duplicarla.

#### 2. Carga de Observaciones Adicionales
- **Resumen:** Se implementó una funcionalidad para cargar observaciones adicionales desde un endpoint específico (`/ordenes-observaciones/{id}`) al momento de cargar una orden no asignada. Se modificó el componente para realizar peticiones paralelas y concatenar las observaciones recibidas con las existentes.
- **Logro:** El usuario ahora visualiza el historial completo de observaciones al editar una orden, mejorando el contexto y la toma de decisiones.

#### 3. Corrección de Persistencia y Lógica de Descuentos
- **Resumen:** Se corrigió un problema donde los descuentos aplicados al editar una orden no se guardaban correctamente. Se cambió la lógica para que sea incremental (el usuario ingresa solo el monto adicional) y se modificó el backend para registrar estos cambios en la tabla `abonos`, asegurando la consistencia de los datos.
- **Logro:** Los descuentos ahora se suman correctamente al historial de la orden y persisten tras guardar.

#### 4. Corrección de Error 500 en Abonos
- **Resumen:** Se solucionó un error crítico (500 Internal Server Error) en el endpoint `/orden/abono` que ocurría cuando se enviaba un descuento sin un pago monetario asociado. También se aseguró que este endpoint actualice los totales (`pago_abono`, `pago_descuento`) en la tabla principal de la orden.
- **Logro:** El sistema ahora procesa correctamente abonos que consisten solo en descuentos y mantiene los saldos de la orden siempre actualizados.

### Resumen General
- Se han resuelto dos problemas críticos relacionados con la gestión de órdenes no asignadas, asegurando la integridad de los datos y mejorando la experiencia de usuario al editar órdenes.
- Se ha robustecido el sistema de pagos y descuentos, corrigiendo errores de servidor y lógica de negocio.
- Ambos repositorios (Frontend y Backend) han sido actualizados con todas las correcciones.

## Domingo, 29 de Diciembre de 2025

### Tareas Realizadas

#### 1. Implementación de Dashboard de Comercialización
- **Resumen:** Se implementó el dashboard completo para el módulo de Comercialización. Se integraron gráficos de ApexCharts para mostrar el resumen semanal de órdenes, el estado de las órdenes y los pagos de la semana.
- **Logro:** El personal de comercialización ahora cuenta con una herramienta visual para monitorizar su desempeño y el estado de sus órdenes en tiempo real.

#### 2. Nuevo Gráfico de Distribución de Procesos
- **Resumen:** A solicitud del usuario, se añadió un gráfico de barras horizontal que visualiza la cantidad de órdenes activas (y en espera) en cada departamento del proceso productivo, ordenado secuencialmente.
- **Logro:** Facilita la identificación de cuellos de botella y la carga de trabajo por departamento.

#### 3. Solución de Persistencia de Sidebar (Bugfix)
- **Resumen:** Se corrigió un error crítico donde el menú lateral desaparecía al recargar la página. Se implementó un plugin de persistencia (`vuex-persist.js`) para mantener la sesión del usuario.
- **Logro:** La navegación es estable y robusta frente a recargas.

#### 4. Corrección de Lógica de Estados y Datos
- **Resumen:** Se corrigieron discrepancias en el backend donde las órdenes "En espera" no se contabilizaban en los gráficos debido a sensibilidad de mayúsculas (PHP) y filtros SQL estrictos. Además, se implementó un filtrado estricto por `id_empleado` (responsable) en todas las consultas para asegurar que cada usuario vea únicamente sus propios datos.
- **Logro:** Los datos visualizados en los gráficos ahora coinciden exactamente con los registros reales de la base de datos y respetan la propiedad de las órdenes.

#### 5. Corrección de Error 500 y Validación por Departamento
- **Resumen:** Se resolvió un error crítico (500) causado por el uso de un método deprecado (`withJson`) y accesos inválidos a respuestas de error SQL. Se reestructuró el endpoint del dashboard para aceptar explícitamente el `id_departamento`, permitiendo validaciones contextuales requeridas por el usuario.
- **Logro:** El dashboard carga correctamente validando el contexto del empleado (ID + Departamento) y manejando errores de base de datos de manera segura (JSON detallado en lugar de crash).

### Resumen General
- Se completó la entrega del Dashboard de Comercialización con funcionalidades extendidas (persistencia, nuevos gráficos).
- Se realizaron despliegues en backend y ajustes en frontend para asegurar la integridad de los datos visualizados.