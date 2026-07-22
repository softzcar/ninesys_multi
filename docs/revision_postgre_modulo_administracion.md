# Pruebas de `app_multi` con API / PostgreSQL

- [x] ## Inicio



# ~~WhatsApp~~



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

- [ ] **Nuevo Presupuesto**
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
- [x] Todas las Ordenes



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
- [x] Activación de empelados



- [x] ## Gestión de Clientes **(placeholders y validaciones de crear/editar corregidos: teléfono normalizado y sin duplicados, nombre/apellido obligatorios, email/cédula opcionales, país/estado/ciudad obligatorios; eliminación verificada como soft-delete correcto, con confirmación extra si el cliente tiene órdenes y reactivación al recrear por teléfono)**



## Productos

- [x] Gestión de Productos **(precios con 2 decimales en modal de edición; soft-delete y reactivación por nombre/SKU al crear -- manual y por Carga Masiva; typeahead "Importar desde otro producto" en Asignación de Insumos poblado correctamente y tabla de insumos reflejando datos reales tras importar; columna "Precio" obsoleta eliminada de la tabla; tabla de Gestión recargando sola tras Carga Masiva)**
- [x] Insumos de Productos **(radios de filtro por departamento se salían de la interfaz -- corregido con flex-wrap, mismo fix que en Gestión de Empleados)**
- [x] Comisiones de Productos **(filtros re-maquetados: buscador de texto y radios de tipo de producto lado a lado, mismo orden y flex-wrap que en las páginas anteriores)**
- [x] Atributos de productos **(no tenía soft-delete -- implementado con el mismo patrón trim+minúsculas y reactivación por 409 ya usado en Productos/Departamentos; edición se dejó como UPDATE directo, igual que el resto del proyecto)**
- [x] Categorías **(ya tenía soft-delete parcial -- GET y DELETE ya usaban eliminado; faltaba validar duplicados y reactivar al crear, implementado igual que Atributos de Productos; de paso se corrigió una inyección SQL en el DELETE y una inconsistencia en el PUT que bloqueaba renombrar hacia el nombre de una categoría ya eliminada)**



## Pagos

- [ ] Planilla de Pagos
- [ ] Histórico de Pagos



## Reportes

- [x] Reporte general **(renombrado de "semanal" a "Reporte General de Eficiencia" -- URL, endpoint y links del sidebar; corregido fallback 100% falso en Eficiencia Tiempo/Material cuando no hay datos reales -- ahora N/A; corregido 500 en el modal de eficiencia de insumos por columna eliminada en limpieza anterior; corregido cálculo de "Real" en eficiencia de insumos que aplicaba rendimiento sin condición, inflando el consumo real hasta 11x en algunas órdenes; verificado con datos reales que el progressbar de eficiencia de tiempo calcula correctamente -- los desfases observados son de configuración de datos, no de código)**
- [ ] Rendimiento
- [ ] Eficiencia Empleados
- [ ] Insumos por orden
- [ ] Insumos
- [ ] Productos
- [ ] Reporte de Costos
- [ ] Desviación de Costos
- [ ] Reporte de Reposiciones



## Varios

- [ ] Tallas
- [ ] Telas
- [ ] Multiplicador de Precios



## Gatos

- [ ] Gastos Fijos
- [ ] Gasatos Variables
- [ ] Gastos Adicionales
- [ ] Historial de pagos
- [ ] Bitácora de gastos



## Configuración

- [ ] Configuración de la Empresa