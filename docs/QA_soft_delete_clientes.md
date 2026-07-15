# Pendientes Ricardo

- [ ] Planilla de pagos tarda mucho en cargar
- [x] Comercialización NO guarda Tasa BCV
- [x] Implementar CRM de Clientes para vendedores

### PRODUCTOS

- [x] Poder eliminar el producto **Soft-delete**
- [x] Poder Eliminar Categorías de productos  **Soft-delete**
- [x] Poder eliminar Telas (catalogo) **Soft-delete**

### DESVIACIÓN DE COSTOS

- [ ] Mostrar unicamente los productos con actividad para el periodo seleccionado en el reporte.

### EMPLEADOS

- [ ] Terminar un lote pide ingresar insumos aunque NO estén asignados

### CONTROL DE PRODUCCIÓN

- [ ] Cuando un empleado ya ha terminado la tarea o tiene la tare iniciada NO se puede eliminar el empleado, pero si podemos reasignar la carga de  trabajo solo en caso de tener la tarea iniciada, si ya la terminó no.



___



# Checklist de pruebas — Soft delete de clientes (Frontend Dev)

> Entorno: UI de Desarrollo (empresa 194). Backend + frontend ya desplegados en Dev.
> Cliente de referencia usado en pruebas de backend: **ALVARO (id 1980, tel 584163569151)** — quedó activo.
> Marca cada casilla al validar. "Resultado esperado" es lo que debe ocurrir.

## A. Preparación
- [x] Entrar a la UI de Dev con un usuario que gestione clientes/órdenes.
- [x] Identificar (o crear) un cliente de prueba **con al menos una orden**.
- [x] Anotar su teléfono y nombre para las pruebas siguientes.

## B. Borrado lógico (soft delete)

- [x] **Eliminar** un cliente que tiene órdenes → *Esperado:* se elimina sin error y **desaparece de la lista de clientes**.
- [x] Abrir/consultar **una orden de ese cliente eliminado** → *Esperado:* la orden **se abre normal** y muestra el nombre/cédula del cliente (no se rompe ni desaparece).
- [x] Ir al **buscador/autocomplete de clientes** (p. ej. al crear una orden) y escribir su nombre → *Esperado:* el cliente eliminado **NO aparece** entre los resultados.
- [x] Segmentar una **campaña de WhatsApp** que incluiría a ese cliente → *Esperado:* el cliente eliminado **NO se incluye** en el envío.

## C. Crear cliente suelto (pantalla de Clientes)
- [ ] Crear un cliente **nuevo** con un teléfono no usado → *Esperado:* se crea normal y aparece en la lista.
- [x] Crear un cliente con el teléfono de uno **ACTIVO** → *Esperado:* mensaje **"Teléfono Duplicado"** (comportamiento previo, no debe cambiar).
- [x] Crear un cliente con el teléfono de uno **ELIMINADO** → *Esperado:* aparece el diálogo **"Cliente eliminado — ¿Desea reactivarlo?"** con botones *Sí, reactivar* / *Cancelar*.
  - [x] Pulsar **Cancelar** → *Esperado:* no se crea nada, no se duplica, el cliente sigue eliminado.
  - [x] Repetir y pulsar **Sí, reactivar** → *Esperado:* mensaje **"Cliente reactivado"**, el cliente **vuelve a la lista** con los datos que se acaban de escribir (nombre/cédula/etc. actualizados).

## D. Flujo de creación de ORDEN
- [x] Crear una orden para un cliente **nuevo** (teléfono libre) → *Esperado:* se crea el cliente y la orden queda ligada a él.
- [x] Crear una orden escribiendo el teléfono de un cliente **ELIMINADO** → *Esperado:* **se reactiva automáticamente (sin diálogo)**, la orden se crea y queda ligada a ese cliente; el cliente vuelve a aparecer en la lista.
- [x] Verificar que **no se creó un cliente duplicado** con ese teléfono (debe reutilizarse el mismo registro).

## E. Flujo de creación de PRESUPUESTO
- [x] Crear un presupuesto con el teléfono de un cliente **ELIMINADO** → *Esperado:* igual que la orden, **auto-reactiva** sin preguntar.
- [x] **Convertir** ese presupuesto a orden → *Esperado:* funciona con normalidad.

## F. Regresiones (que nada se haya roto)
- [x] **Editar** un cliente existente activo → *Esperado:* guarda bien (sin cambios en su comportamiento).
- [x] Al crear/reactivar, los **selectores geográficos** (país/estado/ciudad) se guardan correctamente.
- [x] Listado de clientes normal (sin eliminados) muestra el conteo correcto.
- [x] Reportes/pantallas que muestran el cliente **de una orden histórica** siguen mostrándolo aunque esté eliminado.

## G. (Opcional) Verificación en base de datos
- [ ] Tras eliminar: `SELECT eliminado FROM customers WHERE _id = <id>` → **1**.
- [ ] Tras reactivar: **0**.
- [ ] `SELECT COUNT(*) FROM customers WHERE phone LIKE '%<últimos 10 dígitos>%'` → **1** (no se duplicó el teléfono).

---
**Endpoints involucrados (para diagnóstico si algo falla):**
- `POST /customers/eliminar` → soft delete (UPDATE eliminado=1).
- `POST /customers/nuevo` → creación suelta (devuelve `phone_deleted` si hay un eliminado).
- `POST /customers/{first_name}/.../{address}` → creación en flujo orden/presupuesto (auto-reactiva).
- `POST /customers/reactivar` → reactivación tras confirmar en creación suelta.
- Nota: la UI requiere el header `Authorization: <id_empresa>` (lo pone el frontend automáticamente).
