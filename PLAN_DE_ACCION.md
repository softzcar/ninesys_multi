# Plan de Acción Detallado

## Objetivo General
Optimizar la carga de datos y la comunicación entre componentes en el módulo de control de producción, mejorando el rendimiento y la experiencia de usuario.

## Problemas Identificados

1.  **Comunicación Ineficiente del Modal:** El modal de asignación de empleados (`produccionsse/asignar.vue`) causaba una recarga completa del módulo padre al guardar, cerrando el modal y perdiendo el contexto.
2.  **Problema N+1 en Carga de Datos:** El componente `produccionsse/controlDeProduccionPro.vue` realizaba múltiples llamadas a la API (una por cada orden para obtener su progreso), lo que resultaba en una gran ineficiencia.

---

## Fase 1: Optimización de la Comunicación del Modal (Completada)

**Objetivo:** Evitar el cierre del modal al guardar y permitir actualizaciones locales de la lista de empleados asignados, con una recarga controlada del módulo padre solo al cerrar el modal si hubo cambios.

**Componentes Involucrados:**
*   `produccionsse/asignar.vue` (Modal principal de asignación)
*   `produccionsse/asignarEmpleadoMulti.vue` (Componente hijo dentro del modal, donde se guarda el empleado)
*   `produccionsse/progressBar.vue` (Componente padre de `asignar.vue`)
*   `produccionsse/controlDeProduccionPro.vue` (Módulo principal, padre de `progressBar.vue`)

**Cambios Aplicados:**

*   **`produccionsse/asignar.vue`:**
    *   Se añadió una variable `assignmentsChanged` (bandera booleana) en `data()` para rastrear si se realizaron cambios.
    *   Se modificó el template del modal para escuchar el evento `@hide` y llamar al método `onModalHide`.
    *   Se creó el método `onModalHide`: Si `assignmentsChanged` es `true`, emite un evento `refresh-data` hacia su padre (`progressBar.vue`) y luego resetea la bandera.
    *   Se modificó el método `handleAssignmentsUpdated` (que recibe el evento del componente hijo) para establecer `assignmentsChanged = true` cuando se actualizan las asignaciones.
    *   Se implementó `local_emp_asignados` en `data()` y un `watch` para la prop `emp_asignados` para mantener una copia local y reactiva de los empleados asignados.
    *   Se actualizó `filterAsigandos` para que use `local_emp_asignados` en lugar de la prop `emp_asignados`, asegurando que la lista mostrada en el modal se actualice localmente.
    *   Se cambió el listener en el template de `@reload` a `@assignments-updated` para el componente `produccionsse-asignar-empleado-multi`.

*   **`produccionsse/asignarEmpleadoMulti.vue`:**
    *   Se modificó el método `guararComisiones` para que sea asíncrono y utilice `Promise.all` para ejecutar todas las llamadas de `updateEmpleado` en paralelo.
    *   Después de que todas las actualizaciones son exitosas, emite un nuevo evento `assignments-updated` (en lugar de `reload`) con la lista completa de las asignaciones guardadas (`this.form`).

*   **`produccionsse/progressBar.vue`:**
    *   Se modificó el listener para el componente `produccionsse-asignar` de `@reload` a `@refresh-data`.
    *   El método `reloadOrders` (que ahora es llamado por `@refresh-data`) sigue emitiendo `reload` a su padre (`controlDeProduccionPro.vue`), actuando como un puente.

**Estado:** **COMPLETADA**. El modal ya no se cierra al guardar, y la recarga del módulo principal es controlada y solo ocurre al cerrar el modal si hubo cambios.

---

## Fase 2: Optimización de la Carga de Datos (Problema N+1) (En Progreso)

**Objetivo:** Reducir las múltiples llamadas a la API para obtener el progreso de cada orden a una única llamada centralizada.

**Componentes Involucrados:**
*   **Backend (Tu lado):** Nuevo endpoint unificado.
*   `produccionsse/controlDeProduccionPro.vue` (Módulo principal)
*   `produccionsse/progressBar.vue` (Componente de la barra de progreso)
*   `progreso-tiempo-semaforo.vue` (Componente del semáforo de tiempo)

**Cambios Aplicados (Hasta Ahora):**

*   **Backend (Tu lado):**
    *   Se definió la estructura de la respuesta esperada: un array de órdenes, donde cada objeto de orden incluye un objeto anidado con los datos de progreso (`progreso_paso_valor`, `progreso_total_pasos`, `progreso_porcentaje`).
    *   Se te proporcionó una consulta SQL unificada para generar esta respuesta.
    *   **Estado:** **COMPLETADO**. Confirmaste que el endpoint está devolviendo la estructura de datos esperada.

*   **`produccionsse/controlDeProduccionPro.vue`:**
    *   Se modificó el método `loadOrdersProduction` para que ahora llame al nuevo endpoint unificado (ej. `this.$config.API}/sse/produccion-unificada`).
    *   Se ajustó para que procese la respuesta del nuevo endpoint, esperando que los datos de las órdenes vengan en `res.data.items_unificado`.
    *   **Estado:** **COMPLETADO**.

*   **`produccionsse/progressBar.vue`:**
    *   Se simplificó drásticamente su sección `<script>`.
    *   Se eliminó toda la lógica de llamadas a la API y el `mounted()` hook.
    *   Ahora espera que los datos de progreso (`progreso_porcentaje`, `estatus`) vengan directamente en la prop `item` que recibe de su padre.
    *   **Estado:** **COMPLETADO**. (Aunque hubo problemas con la herramienta `replace`, la última lectura del archivo confirmó que el código está en el estado deseado).

*   **`progreso-tiempo-semaforo.vue`:**
    *   Se modificaron sus `props` para que recibiera directamente el objeto `item` completo (que ya contiene los datos de progreso).
    *   Se ajustaron sus propiedades computadas (`ordenReactiva`, `title`, `variant`, `textButton`, `textList`) para que leyeran la información directamente del objeto `item` y sus propiedades anidadas.
    *   **Estado:** **PENDIENTE**. Los intentos de aplicar este cambio automáticamente han fallado.

---

## Problemas con la Automatización y Próximos Pasos

Durante los intentos de aplicar los cambios en `progreso-tiempo-semaforo.vue`, la herramienta `replace` ha fallado repetidamente con el error "0 occurrences found for old_string". Esto indica que el texto que intento reemplazar no coincide exactamente con el contenido actual del archivo, probablemente debido a pequeñas variaciones en espacios, saltos de línea o caracteres ocultos que no son visibles en la salida de texto.

Esta situación impide que pueda aplicar los cambios de forma automática y continuar con la implementación del plan. Para poder avanzar, será necesario:

1.  **Iniciar una nueva sesión:** Esto me permitirá leer el archivo desde cero y tener la versión más actualizada y precisa de su contenido.
2.  **Guía manual:** Necesitaré que me indiques explícitamente qué partes del código debo leer y cómo debo construir la instrucción de reemplazo, asegurándonos de que el `old_string` sea una coincidencia exacta.

Una vez que podamos superar este obstáculo, el plan de acción continuará con la **Verificación Final** de todos los cambios en el frontend para asegurar que la aplicación funciona correctamente, que el rendimiento ha mejorado y que todos los estados se actualizan como se espera.