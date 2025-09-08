### **Plan de Pruebas: Finalización de Lotes de Producción**

**Fase 1: Pruebas del Flujo Estándar (Departamentos como Costura, Acabado, etc.)**

1.  **Prueba 1.1 (Interfaz de Usuario):**
    *   **Acción:** Desde la vista de tareas, finalizar un lote de un departamento estándar.
    *   **Resultado Esperado:** Debe abrirse el modal de finalización genérico (`FinalizarLoteModal.vue`), mostrando los insumos del lote para registrar el consumo.

2.  **Prueba 1.2 (Funcionalidad Principal):**
    *   **Acción:** Registrar cantidades de consumo válidas y enviar el formulario.
    *   **Resultado Esperado:** La solicitud al backend debe ser exitosa. El stock de los insumos debe disminuir y deben crearse los movimientos de inventario correspondientes. El lote debe marcarse como finalizado.

3.  **Prueba 1.3 (Casos Borde):**
    *   **Acción:** Intentar finalizar un lote sin registrar consumo o con valores en cero.
    *   **Resultado Esperado:** El sistema debe manejarlo adecuadamente, ya sea mostrando una advertencia o finalizando sin registrar consumo.

**Fase 2: Pruebas del Flujo de Impresión**

1.  **Prueba 2.1 (Interfaz de Usuario):**
    *   **Acción:** Finalizar un lote del departamento "Impresión".
    *   **Resultado Esperado:** Debe abrirse el modal específico `FinalizarLoteImpresionModal.vue`. Los campos de tinta deben estar habilitados y el de tinta blanca (W) solo si la impresora seleccionada lo soporta.

2.  **Prueba 2.2 (Funcionalidad Principal):**
    *   **Acción:** Seleccionar impresora, registrar consumo de rollos de papel y de tintas, y enviar.
    *   **Resultado Esperado:** La solicitud debe ser exitosa. El stock de papel y los niveles de tinta deben disminuir correctamente.

3.  **Prueba 2.3 (Casos Borde):**
    *   **Acción:** Intentar finalizar sin seleccionar una impresora.
    *   **Resultado Esperado:** El formulario no debe poder enviarse y debe indicar que la impresora es requerida.

**Fase 3: Pruebas del Flujo de Corte**

1.  **Prueba 3.1 (Interfaz de Usuario):**
    *   **Acción:** Finalizar un lote del departamento "Corte".
    *   **Resultado Esperado:** Debe abrirse el modal específico `FinalizarLoteCorteModal.vue`, con campos para "Cantidad Consumida" y "Desperdicio".

2.  **Prueba 3.2 (Funcionalidad Principal):**
    *   **Acción:** Registrar consumo y desperdicio para los insumos y enviar.
    *   **Resultado Esperado:** La solicitud debe ser exitosa. El stock del inventario debe disminuir por la suma del consumo y el desperdicio. Deben crearse registros en la tabla de rendimiento.

3.  **Prueba 3.3 (Casos Borde):**
    *   **Acción:** Finalizar registrando solo consumo (desperdicio en cero) y viceversa.
    *   **Resultado Esperado:** El sistema debe procesar ambos casos correctamente.

**Fase 4: Pruebas Generales del Sistema**

1.  **Prueba 4.1 (Enrutador de Modales):**
    *   **Acción:** Repetir el paso 1 de cada fase para distintos departamentos.
    *   **Resultado Esperado:** Confirmar que siempre se abra el modal correcto según el departamento.

2.  **Prueba 4.2 (Filtro de Tareas en Lote):**
    *   **Acción:** Crear un lote y dejarlo activo. Volver a la lista de tareas.
    *   **Resultado Esperado:** Las órdenes que pertenecen al lote activo ya no deben aparecer en la lista de tareas "En Curso" disponibles para añadir a un nuevo lote.