CREATE TABLE `abonos` (
  `_id` int(11) NOT NULL COMMENT 'ID de la talba',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado',
  `abono` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'monto del abono',
  `descuento` decimal(10,2) DEFAULT 0.00 COMMENT 'Descuento del abono',
  `detalle` varchar(60) DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'fecha del abono'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `abonos`;
CREATE TABLE `aprobacion_clientes` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL,
  `id_diseno` int(11) DEFAULT NULL,
  `check` tinyint(1) NOT NULL DEFAULT 1,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro para notificación de aprobación de diseño';

TRUNCATE TABLE `aprobacion_clientes`;
CREATE TABLE `asistencias` (
  `_id` int(11) NOT NULL COMMENT 'ID unico del registro',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado',
  `registro` varchar(14) DEFAULT NULL COMMENT 'Entrada Mañana, Salida Mañana, Entrada Tarde, Salida Tarde',
  `detalle` mediumtext DEFAULT NULL COMMENT 'Detalle de el registro si se requiere',
  `moment` datetime DEFAULT current_timestamp() COMMENT 'Momento de la acción'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `asistencias`;
CREATE TABLE `caja` (
  `_id` int(11) NOT NULL,
  `id_caja_cierres` int(11) DEFAULT NULL COMMENT 'ID del cierre de la caja',
  `monto` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'monto de la moneda',
  `moneda` varchar(10) NOT NULL DEFAULT '0' COMMENT 'dolares, pesos, bolivares',
  `tasa` decimal(12,2) NOT NULL DEFAULT 1.00 COMMENT 'tasa de conversion para el dia',
  `detalle` text DEFAULT NULL,
  `tipo` varchar(20) DEFAULT NULL COMMENT 'orden_nueva, orden_abono, otro_abono, retiro, cierre_de_caja, ajuste',
  `id_empleado` int(11) DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registros de los movimientos del efectivo en la caja antes del cierre, luego se reinicia, el histroico de ingresos queda en la tabla metodos_de_pago';

TRUNCATE TABLE `caja`;
CREATE TABLE `caja_cierres` (
  `_id` int(11) NOT NULL,
  `dolares` decimal(10,0) NOT NULL DEFAULT 0,
  `pesos` decimal(10,0) NOT NULL DEFAULT 0,
  `bolivares` decimal(10,0) NOT NULL DEFAULT 0,
  `moment` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_empleado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registro de cierres de caja';

TRUNCATE TABLE `caja_cierres`;
CREATE TABLE `caja_fondos` (
  `_id` int(11) NOT NULL,
  `id_caja_cierres` int(11) DEFAULT NULL COMMENT 'ID del cierre de la caja',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del Vendedor',
  `dolares` decimal(12,0) NOT NULL DEFAULT 0,
  `pesos` decimal(12,0) NOT NULL DEFAULT 0,
  `bolivares` decimal(12,0) NOT NULL DEFAULT 0,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Fondo en efectivo que queda en caja';

TRUNCATE TABLE `caja_fondos`;
CREATE TABLE `catalogo_impresoras` (
  `_id` int(11) NOT NULL,
  `codigo_interno` varchar(50) NOT NULL COMMENT 'Identificador único y fácil de leer para el empleado. Ej: SUBLIMACION-01, EPSON-F570-A',
  `marca` varchar(50) DEFAULT NULL COMMENT 'Marca del fabricante. Ej: Epson, Roland',
  `modelo` varchar(100) DEFAULT NULL COMMENT 'Nombre comercial del modelo. Ej: SureColor F570',
  `capacidad_contenedor` decimal(7,2) DEFAULT NULL COMMENT 'Capacidad del contenedor de la tinta',
  `ubicacion` varchar(100) DEFAULT NULL COMMENT 'Ubicación física para ayudar al empleado a identificarla. Ej: Taller de Estampado',
  `tipo_tecnologia` varchar(50) DEFAULT NULL COMMENT 'Tecnología para agrupar o filtrar. Ej: Sublimación, DTG, DTF',
  `estado` varchar(20) NOT NULL DEFAULT 'activa' COMMENT 'Estado actual. Ej: activa, inactiva, en_mantenimiento',
  `notas` text DEFAULT NULL COMMENT 'Cualquier información adicional relevante.',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Catálogo de las impresoras físicas de la empresa.';

TRUNCATE TABLE `catalogo_impresoras`;
CREATE TABLE `catalogo_insumos_productos` (
  `_id` int(11) NOT NULL,
  `nombre` varchar(128) NOT NULL,
  `id_product` int(11) NOT NULL COMMENT 'ID del producto',
  `id_departamento` int(11) NOT NULL COMMENT 'ID del departamento',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `catalogo_insumos_productos`;
CREATE TABLE `catalogo_telas` (
  `_id` int(11) NOT NULL COMMENT 'Identificador unico de la tabla',
  `tela` varchar(45) DEFAULT NULL COMMENT 'Nombre de la tela',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `catalogo_telas`;
INSERT INTO `catalogo_telas` (`_id`, `tela`, `moment`) VALUES
(1, 'Tela de Prueba', '2025-09-25 16:51:19');

CREATE TABLE `categories` (
  `_id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `categories`;
INSERT INTO `categories` (`_id`, `nombre`) VALUES
(1, 'Categoría de Pruebas');

CREATE TABLE `check_tareas` (
  `_id` int(11) NOT NULL COMMENT 'ID unico',
  `id_orden` int(11) DEFAULT NULL,
  `id_lotes_detalles_empleados_asigandos` int(11) DEFAULT NULL,
  `id_ordenes_productos` int(11) DEFAULT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_departamento` int(11) DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fin de tarea'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Control de el check de tareas para empleados';

TRUNCATE TABLE `check_tareas`;
CREATE TABLE `config` (
  `_id` int(11) NOT NULL,
  `app_key` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Indica si el cliente tiene acceso a el sitema o está suspendido',
  `nombre_empresa` varchar(45) DEFAULT NULL,
  `identificador_fiscal` varchar(60) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL COMMENT 'Dirección de la empresa',
  `telefonos` int(60) DEFAULT NULL COMMENT 'Teléfonos de la empresa',
  `email` int(255) DEFAULT NULL COMMENT 'Email de la empresa',
  `msg_welcome` text DEFAULT NULL COMMENT 'Mensaje de bienvenida a el cliente',
  `msg_bye` text DEFAULT NULL COMMENT 'Mensajde de despedida al cliente',
  `msg_saldo` text DEFAULT NULL COMMENT 'Mensaje de saldo pendiente del cliente',
  `sys_mostrar_detalle_terminar_indicidual` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si se muestra el formaulario de ingresar detalle de la terminación del item indicidual en el módulo de empleados al momento de terminar una tarea individual',
  `sys_mostrar_rollo_en_empleado_corte` tinyint(1) DEFAULT 0 COMMENT 'Muestra la opción sedeleccionar rollo en el módulo de empleados depatament de Corte',
  `sys_mostrar_rollo_en_empleado_estampado` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Mostrar el rollo de tela al emplado de Estampado',
  `sys_mostrar_insumo_en_empleado_costura` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Mostrar select de insumos en modulo de empleados',
  `sys_mostrar_insumo_en_empleado_limpieza` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'empleados',
  `sys_mostrar_insumo_en_empleado_revision` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'empleados',
  `sys_comision_de_costura` varchar(8) NOT NULL DEFAULT 'producto' COMMENT 'Define si a costura se le calclua comision por el porcentaje en la tabla empleados o el porcentaje ne la tabla productos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `config`;
INSERT INTO `config` (`_id`, `app_key`, `activo`, `nombre_empresa`, `identificador_fiscal`, `direccion`, `telefonos`, `email`, `msg_welcome`, `msg_bye`, `msg_saldo`, `sys_mostrar_detalle_terminar_indicidual`, `sys_mostrar_rollo_en_empleado_corte`, `sys_mostrar_rollo_en_empleado_estampado`, `sys_mostrar_insumo_en_empleado_costura`, `sys_mostrar_insumo_en_empleado_limpieza`, `sys_mostrar_insumo_en_empleado_revision`, `sys_comision_de_costura`) VALUES
(1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 0, 0, 0, 'producto');

CREATE TABLE `customers` (
  `_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(60) DEFAULT NULL,
  `last_name` varchar(60) DEFAULT NULL,
  `username` varchar(60) DEFAULT NULL,
  `cedula` varchar(12) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `billing_city` varchar(60) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `customers`;
INSERT INTO `customers` (`_id`, `first_name`, `last_name`, `username`, `cedula`, `address`, `billing_city`, `phone`, `email`, `moment`) VALUES
(1, 'Cliente', 'de Pruebas', 'Cliente Prueba', 'V12345678', 'Dirección de prueba', 'Caracas', '58424000000', 'clientepruebas@email.com', '2025-09-25 16:25:44');

CREATE TABLE `departamentos` (
  `_id` int(11) NOT NULL,
  `id_modulo` int(11) DEFAULT NULL COMMENT 'ID del módulo asignado al departamento',
  `orden_proceso` int(11) NOT NULL DEFAULT 0 COMMENT 'indica el orden del proceso de fabricación',
  `departamento` varchar(256) DEFAULT NULL COMMENT 'Nombre del departamento',
  `asignar_numero_de_paso` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Interviene en proceso Es un paso de proceso de fabricación',
  `enviar_mensaje` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Enviar mensaje al cliente al iniciar el paso',
  `mensaje` text DEFAULT NULL COMMENT 'Mensaje para el cliente máximo 255 caracters',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `departamentos`;
INSERT INTO `departamentos` (`_id`, `id_modulo`, `orden_proceso`, `departamento`, `asignar_numero_de_paso`, `enviar_mensaje`, `mensaje`, `moment`) VALUES
(1, 4, 2, 'Impresión', 1, 1, NULL, '2025-09-24 19:50:20'),
(2, 4, 3, 'Estampado', 1, 1, NULL, '2025-09-24 19:50:20'),
(3, 4, 4, 'Corte', 1, 1, NULL, '2025-09-24 19:50:20'),
(4, 4, 5, 'Costura', 1, 1, NULL, '2025-09-24 19:50:20'),
(5, 1, 0, 'Administración', 0, 0, NULL, '2025-09-24 19:50:20'),
(6, 2, 0, 'Comecialización', 0, 0, NULL, '2025-09-24 19:50:20'),
(7, 3, 0, 'Diseño', 0, 0, NULL, '2025-09-24 19:50:20');

CREATE TABLE `disenos` (
  `_id` int(11) NOT NULL COMMENT 'ID de la tabla',
  `id_orden` int(11) DEFAULT NULL COMMENT 'IDn de la orden',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del diseÑador tabla empleados',
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del producto asociado al diseño',
  `origen` varchar(25) NOT NULL DEFAULT 'orden_inicial' COMMENT 'Identifica el Origen del registro, puede ser ''origen_inicial'' si se crea al momento de la facturación o ''agregado_posterior'' si proviene de la creación de una revisión',
  `codigo_diseno` varchar(6) DEFAULT NULL COMMENT 'Codigo de diseño de uso interno de 6 digitos formato XX-XXX',
  `tipo` varchar(128) DEFAULT NULL COMMENT 'Tipo de diseÑo modas ó gráfico',
  `terminado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el diseño ya ha sido terminado',
  `linkdrive` text DEFAULT NULL COMMENT 'Link a google drive',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `disenos`;
CREATE TABLE `disenos_ajustes_y_personalizaciones` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_diseno` int(11) DEFAULT NULL COMMENT 'ID de la tabla disenos',
  `tipo` varchar(15) DEFAULT NULL COMMENT 'Si es ajuste o personalizacion',
  `cantidad` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad de piezas trabajadas',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Guarda Datos ajustes y las personalizaciones';

TRUNCATE TABLE `disenos_ajustes_y_personalizaciones`;
CREATE TABLE `empleados_lotes_fabricacion` (
  `_id` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID emleado que ejecuta la tarea',
  `id_departamento_creador` int(11) DEFAULT NULL,
  `id_departamento_actual` int(11) DEFAULT NULL,
  `estado` varchar(11) DEFAULT 'pendiente' COMMENT 'pendiente, en_curso, terminado',
  `fecha_inicio` timestamp NULL DEFAULT NULL COMMENT 'Fecha de inicio del pprocesamiento en lotes',
  `fecha_fin` timestamp NULL DEFAULT NULL COMMENT 'FEcha de finlización del porcesamienteo en lotes',
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'FEcha de creación del registro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='ordenes que se procesan el lotes en el modulo de Empleados';

TRUNCATE TABLE `empleados_lotes_fabricacion`;
CREATE TABLE `empleados_lotes_fabricacion_items` (
  `_id` int(11) NOT NULL,
  `id_lote` int(11) DEFAULT NULL,
  `id_orden` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Informacion general de los lotes de fabricación';

TRUNCATE TABLE `empleados_lotes_fabricacion_items`;
CREATE TABLE `inventario` (
  `_id` int(11) NOT NULL COMMENT 'Identificador unico',
  `sku` varchar(128) DEFAULT NULL COMMENT 'SKU del Item de inventario',
  `id_catalogo` int(11) DEFAULT NULL COMMENT 'ID de catalogo_insumos_productos',
  `insumo` varchar(45) DEFAULT NULL COMMENT 'Nombre del insumo',
  `unidad` varchar(6) DEFAULT NULL COMMENT 'Unidd de medida del articulo CD, LTS, ML UND',
  `costo` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio de costo del insumo',
  `rendimiento` decimal(3,1) DEFAULT NULL,
  `cantidad` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor de la unidad e medida',
  `color` varchar(64) DEFAULT NULL COMMENT 'Color del insumo',
  `ancho` decimal(7,2) DEFAULT 0.00 COMMENT 'ancho del insumo',
  `elongacion` varchar(32) DEFAULT NULL COMMENT 'Elongación del material',
  `detalles` text DEFAULT NULL COMMENT 'Detalles del insumo',
  `departamento` varchar(14) DEFAULT NULL COMMENT 'Departamento al que pertence el insumo',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `inventario`;
CREATE TABLE `inventario_movimientos` (
  `_id` int(11) NOT NULL COMMENT 'Identificador unico',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la  orden - lote',
  `id_producto` int(11) DEFAULT NULL COMMENT 'ID del catálogo de productos',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado',
  `id_insumo` int(11) DEFAULT NULL COMMENT 'Id del insumoa signado',
  `id_catalogo_insumos_prodcutos` int(11) DEFAULT NULL COMMENT 'ID del catálogo seleccionado por el empleado al momento de usar el insumo',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'Id del departamento del empleado',
  `departamento` varchar(20) DEFAULT NULL COMMENT 'Nombre del departamento',
  `valor_inicial` decimal(7,2) DEFAULT NULL COMMENT 'Valor inicial del insumo',
  `valor_final` decimal(7,2) DEFAULT NULL COMMENT 'Valor Final del insumo ',
  `fecha` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha del registro',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `inventario_movimientos`;
CREATE TABLE `lotes` (
  `_id` int(11) NOT NULL COMMENT 'ID Autonumérico',
  `lote` mediumtext DEFAULT NULL COMMENT 'Código del Lote',
  `fecha` date DEFAULT NULL COMMENT 'Fecha de creación del lote',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_departamento_actual` int(11) DEFAULT NULL COMMENT 'ID del departamento',
  `prioridad` int(1) NOT NULL DEFAULT 0 COMMENT '0 NORMAL, 1 URGENTE',
  `piezas_actuales` int(11) DEFAULT NULL COMMENT 'Cantidad de piezasa ctuales',
  `paso` varchar(128) DEFAULT 'responsable' COMMENT 'Paso actual del proceso, Corte, estampado, impresion, etc.',
  `detalles` mediumtext DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Controla el proceso de fabricacion';

TRUNCATE TABLE `lotes`;
CREATE TABLE `lotes_detalles` (
  `_id` int(10) NOT NULL COMMENT 'ID único del registro',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden de trabajo',
  `id_woo` int(11) DEFAULT NULL COMMENT 'ID del producto en Woocommerce',
  `progreso` varchar(11) NOT NULL DEFAULT 'por iniciar' COMMENT 'Nos indica el estado de desarrollo de la tarea: por niciar, en curso, terminada',
  `id_ordenes_productos` int(11) NOT NULL DEFAULT 0 COMMENT 'ID del producto ordenes_productos',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'id del empleado responsable de la producción',
  `id_reposicion` int(11) DEFAULT NULL COMMENT 'ID de en caso de ser una reposción',
  `terminado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si la tarea se ha terminado para la lista de verificación en el módulo de empleados',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento',
  `departamento` varchar(256) DEFAULT NULL COMMENT 'Departamento al cual pertenecen las unidades, se guarda como histórico del registro en caso que el nombre del departamento sea editado posteriormente',
  `unidades_solicitadas` int(11) DEFAULT 0 COMMENT 'Unidades para el calculo de pago',
  `comision` decimal(8,2) DEFAULT 0.00 COMMENT 'Porcentaje para el cálculo de la comisión',
  `detalles` varchar(255) DEFAULT NULL COMMENT 'Información adicional del producto',
  `fecha_inicio` timestamp NULL DEFAULT NULL COMMENT 'Momento en que el primer empleado asignado ha iniciado el trabajo	',
  `fecha_terminado` timestamp NULL DEFAULT NULL COMMENT 'Momento en que el último empleado afirma haber terminado el trabajo',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Controla el proceso de fabciacion x producto y empleado';

TRUNCATE TABLE `lotes_detalles`;
CREATE TABLE `lotes_detalles_empleados_asignados` (
  `_id` int(11) NOT NULL,
  `id_lotes_detalles` int(11) DEFAULT NULL COMMENT 'ID de lotes_detalles',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID empleado',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento',
  `progreso` varchar(11) DEFAULT 'por iniciar' COMMENT 'Nos indica el estado de desarrollo de la tarea: por iniciar, en curso, terminada por cada empleado para el control de su proceso en el modulo de empleados',
  `procentaje_comision` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Porcentaje para el cálculo de la comisión',
  `terminado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si la tarea se ha terminado para la lista de verificación en el módulo de empleados',
  `fecha_inicio` timestamp NULL DEFAULT NULL COMMENT 'Indica el momento en que el empleado indica que iniciado',
  `fecha_terminado` timestamp NULL DEFAULT NULL COMMENT 'Indica el momento en que el empleado indica que ha terminado la tarea'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Empleados asignados a tareas de producción con su porcentaje';

TRUNCATE TABLE `lotes_detalles_empleados_asignados`;
CREATE TABLE `lotes_detalles_empleados_asignados_pausas` (
  `_id` int(11) NOT NULL,
  `id_lotes_detalles_empleados_asignados` int(11) DEFAULT NULL COMMENT 'ID de la tabla madre',
  `pausa_inicio` timestamp NULL DEFAULT NULL COMMENT 'Inicio de la pausa',
  `pausa_fin` timestamp NULL DEFAULT NULL COMMENT 'Fin de la pausa',
  `motivo` mediumtext NOT NULL COMMENT 'MOtivo de la pausa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `lotes_detalles_empleados_asignados_pausas`;
CREATE TABLE `lotes_fisicos` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL COMMENT 'id de la orden',
  `id_woo` int(11) DEFAULT NULL COMMENT 'id del producto en woocommerce',
  `piezas_actuales` int(11) DEFAULT NULL COMMENT 'Cantidad de unidades en el lote',
  `tela` varchar(120) DEFAULT NULL COMMENT 'Tela del corte',
  `talla` varchar(5) DEFAULT NULL COMMENT 'Nombre de la talla',
  `corte` varchar(24) DEFAULT NULL COMMENT 'Tipo de corte, dama caballeto etc',
  `categoria` int(11) DEFAULT NULL COMMENT 'ID de la categoría en woocommerce',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Controla la cantidad de piezas cortadas existentes';

TRUNCATE TABLE `lotes_fisicos`;
CREATE TABLE `lotes_historico_solicitadas` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden que solicitó el corte del lote',
  `id_lotes_fisicos` int(11) DEFAULT NULL,
  `unidades_produccion` int(11) DEFAULT NULL COMMENT 'Unidades que se solicitan en produccion',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Histórico de unidades solicitadas';

TRUNCATE TABLE `lotes_historico_solicitadas`;
CREATE TABLE `lotes_movimientos` (
  `_id` int(11) NOT NULL,
  `id_lotes_detalles` int(11) DEFAULT NULL COMMENT 'ID del detalle del lote',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `unidades_existentes` int(11) DEFAULT NULL COMMENT 'unidades existentes en elote al momento de el registro',
  `unidades_solicitadas_corte` int(11) DEFAULT NULL COMMENT 'Unidades solicitadas para cortar',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registra los movimientos que se efectúan sobre los lotes';

TRUNCATE TABLE `lotes_movimientos`;
CREATE TABLE `metodos_de_pago` (
  `_id` int(11) NOT NULL COMMENT 'ID unico de la tabla',
  `id_orden` int(11) NOT NULL DEFAULT 0 COMMENT 'ID de la orden',
  `id_caja_cierres` int(11) DEFAULT NULL COMMENT 'ID del cierre de caja, nos indica si el pago ya ha sido retirado ',
  `moneda` varchar(10) DEFAULT NULL COMMENT 'tipo de moneda',
  `metodo_pago` varchar(20) DEFAULT NULL COMMENT 'Método de pago',
  `detalle` varchar(140) DEFAULT NULL COMMENT 'Detalle en caso de que el tipo de pago sea abonos u otros',
  `tipo_de_pago` varchar(13) NOT NULL DEFAULT 'Orden nueva' COMMENT 'Procedencia del pago para identificar el tipo de ingreso',
  `monto` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto cancelado en cada metodo de pago',
  `tasa` decimal(12,0) DEFAULT NULL COMMENT 'Tasa de conversion con relacion al dolar',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `metodos_de_pago`;
CREATE TABLE `ordenes` (
  `_id` int(11) NOT NULL,
  `id_wp` int(11) DEFAULT NULL COMMENT 'ID del cliente de Woocommerce',
  `id_wp_order` int(11) DEFAULT NULL COMMENT 'ID de la orden generada en Wocommerce',
  `status` varchar(45) DEFAULT NULL COMMENT 'Status de la orden: activa, pausada, cancelada, terminada, entregada',
  `tipo` varchar(6) NOT NULL DEFAULT 'custom' COMMENT 'Identificar si la orden pertence a custom o a sport',
  `responsable` int(11) DEFAULT NULL COMMENT 'ID del Vendedor',
  `cliente_nombre` varchar(256) DEFAULT NULL COMMENT 'Nombre del cliente',
  `cliente_cedula` varchar(45) DEFAULT NULL COMMENT 'Cedula del cliente',
  `lote_id` varchar(33) DEFAULT NULL COMMENT 'ID del Lote',
  `fecha_inicio` varchar(45) DEFAULT NULL COMMENT 'Fecha de inicio de la orden',
  `fecha_entrega` varchar(45) DEFAULT NULL COMMENT 'Fecha de entrega de la orden',
  `fecha_creacion` date DEFAULT NULL,
  `token` varchar(45) DEFAULT NULL COMMENT 'Token random',
  `pago_descuento` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Descuento sobre le monto de la orden',
  `pago_total` decimal(12,2) DEFAULT 0.00 COMMENT 'Montototal de la orden',
  `pago_abono` decimal(12,2) DEFAULT 0.00 COMMENT 'Monto abonado',
  `pago_comision` varchar(9) NOT NULL DEFAULT 'pendiente' COMMENT 'Los valores puedes ser pendiente: cuando aun no se ha pagado el total de la orden al vendedor, pagado, cuando se ha  terminado de pagar la totalidad de comisiones al vendedor, anulado, cuando por algun motivo no se terminará de pagar el vanededor y el administrador decide anular los pagos de esta orden',
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creación del registro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes`;
CREATE TABLE `ordenes_borrador_empleado` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_departamento` int(11) NOT NULL COMMENT 'ID del departamento',
  `borrador` mediumtext DEFAULT NULL COMMENT 'El detalle de la orden editado por el empleado',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_borrador_empleado`;
CREATE TABLE `ordenes_fila_orden` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `orden_fila` int(6) DEFAULT NULL COMMENT 'Orden en la fila de producción'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_fila_orden`;DELIMITER $$
CREATE TRIGGER `ordenes_fila_orden_cambios_trigger_delete` AFTER DELETE ON `ordenes_fila_orden` FOR EACH ROW BEGIN
    -- Obtiene todos los registros de ordenes_fila_orden ordenados por orden_fila
    SET @cambio = (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(
        '_id', _id,
        'id_orden', id_orden,
        'orden_fila', orden_fila       
    )), ']') FROM ordenes_fila_orden ORDER BY orden_fila ASC);

    -- Inserta el cambio en la tabla ordenes_fila_orden_cambios
    INSERT INTO ordenes_fila_orden_cambios (cambio) VALUES (@cambio);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `ordenes_fila_orden_cambios_trigger_insert` AFTER INSERT ON `ordenes_fila_orden` FOR EACH ROW BEGIN
    -- Obtiene todos los registros de ordenes_fila_orden ordenados por orden_fila
    SET @cambio = (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(
        '_id', _id,
        'id_orden', id_orden,
        'orden_fila', orden_fila      
    )), ']') FROM ordenes_fila_orden ORDER BY orden_fila ASC);

    -- Inserta el cambio en la tabla ordenes_fila_orden_cambios
    INSERT INTO ordenes_fila_orden_cambios (cambio) VALUES (@cambio);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `ordenes_fila_orden_cambios_trigger_update` AFTER UPDATE ON `ordenes_fila_orden` FOR EACH ROW BEGIN
    -- Obtiene todos los registros de ordenes_fila_orden ordenados por orden_fila
    SET @cambio = (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(
        '_id', _id,
        'id_orden', id_orden,
        'orden_fila', orden_fila        
    )), ']') FROM ordenes_fila_orden ORDER BY orden_fila ASC);

    -- Inserta el cambio en la tabla ordenes_fila_orden_cambios
    INSERT INTO ordenes_fila_orden_cambios (cambio) VALUES (@cambio);
END
$$
DELIMITER ;

CREATE TABLE `ordenes_fila_orden_cambios` (
  `id` int(11) NOT NULL,
  `cambio` mediumtext NOT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_fila_orden_cambios`;
CREATE TABLE `ordenes_fila_reposiciones` (
  `_id` int(11) NOT NULL,
  `id_reposicion` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `orden_fila` smallint(6) DEFAULT NULL COMMENT 'Orden en la fila de producción'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_fila_reposiciones`;
CREATE TABLE `ordenes_observaciones` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) NOT NULL,
  `observaciones` longtext DEFAULT NULL COMMENT 'Observaciones de la orden desde QuillEditor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Observaciones de las ordenes en html e imágenes incrustadas';

TRUNCATE TABLE `ordenes_observaciones`;
CREATE TABLE `ordenes_productos` (
  `_id` int(11) NOT NULL COMMENT 'ID del registro',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_woo` int(11) DEFAULT NULL COMMENT 'ID del producto en woocommerce',
  `id_tela` int(11) DEFAULT NULL COMMENT 'ID de la tela a utilizar del catálogo de telas',
  `id_category` int(11) NOT NULL DEFAULT 0 COMMENT 'ID de la catagoria en WooCommerce ',
  `id_products_attributes` int(11) DEFAULT NULL COMMENT 'ID de la variante del producto',
  `category_name` varchar(20) DEFAULT NULL COMMENT 'NOMBRE de la categoria en woocommerce',
  `name` varchar(240) DEFAULT NULL COMMENT 'Nombre del producto',
  `cantidad` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad del producto',
  `id_size` int(11) DEFAULT NULL COMMENT 'ID de la talla',
  `talla` varchar(8) DEFAULT NULL COMMENT 'Talla del producto',
  `corte` varchar(32) DEFAULT NULL COMMENT 'Dama, caballero, niño',
  `metros` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Metros de material utilizado',
  `desperdicio` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Restos del material',
  `rollo` int(11) DEFAULT NULL COMMENT 'ID de el catálogo de telas',
  `tela` varchar(128) DEFAULT NULL COMMENT 'Tela principal seleccionada desde Comercialización',
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio del producto',
  `precio_woo` decimal(10,2) DEFAULT NULL COMMENT 'Precio de Woocommerce',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_productos`;
CREATE TABLE `ordenes_tmp` (
  `_id` int(11) NOT NULL COMMENT 'Clave primaria',
  `form` longtext DEFAULT NULL COMMENT 'Datos del formulario',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del vendedor',
  `tipo` varchar(11) NOT NULL DEFAULT 'Orden' COMMENT 'Orden o Presupuesto',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Ordenes guardadas pendientes por terminar';

TRUNCATE TABLE `ordenes_tmp`;
CREATE TABLE `ordenes_vinculadas` (
  `_id` int(11) NOT NULL COMMENT 'id de la tabla',
  `id_father` int(11) DEFAULT NULL COMMENT 'ID de la orden principal',
  `id_child` int(11) DEFAULT NULL COMMENT 'ID de la orden secundaria',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `ordenes_vinculadas`;
CREATE TABLE `pagos` (
  `_id` int(11) NOT NULL COMMENT 'ID unico',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_reposicion` int(11) DEFAULT NULL COMMENT 'ID de la reposición se usa para identificar la reposición en los pagos y filtrar las reposiciones terminadas en el modulo de empleados',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento del empleado, lo utilizamos para identificar si es reposición a cual departamento de los que tenga asignados el empleado pertenece el pago. ',
  `id_metodos_de_pago` int(11) DEFAULT NULL COMMENT 'ID de la tabla metodos_de_pago',
  `id_lotes_detalles` int(11) DEFAULT NULL COMMENT 'ID del registro asociado al pago',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado',
  `cantidad` int(11) DEFAULT NULL COMMENT 'Cantidad de items a calcular',
  `monto_pago` decimal(12,2) DEFAULT NULL COMMENT 'Monto a pagar',
  `comision` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Comision usada para el calculo del pago',
  `comision_tipo` varchar(8) DEFAULT NULL COMMENT 'Tipo de comision: fija, variable o monto fijo',
  `detalle` varchar(16) DEFAULT NULL COMMENT 'Detalle de el pago, en el caso de diseño pra diferenciar si el pago es por ajuste, personalizacion etc, en el caso de los empleados no es relevante pues es un pago unico por item trabajado registrado en la tabla id_lotes_detalles',
  `estatus` varchar(9) DEFAULT NULL COMMENT '`aprobado` es el estado por defecto, se crea al terminar la tarea desde el modulo del empleado y `rechazado` se asigna cuando hay una revision y se vuelve a asignar cuando el empleado repite la tarea',
  `fecha_pago` timestamp NULL DEFAULT NULL COMMENT 'Fecha en que se raliza el pago si es NULL no se ha realizado el pago',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='id_lotes_detalles se usa para pagos de empleados y id_orden para vendedores y disenadores';

TRUNCATE TABLE `pagos`;
CREATE TABLE `piezas_cortadas` (
  `_id` int(11) NOT NULL COMMENT 'ID unico',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_inventario` int(11) DEFAULT NULL COMMENT 'ID del insumo',
  `id_ordenes_productos` int(11) DEFAULT NULL COMMENT 'ID de los detalles de el producto cortado',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado que hizo el corte',
  `peso` decimal(5,2) DEFAULT NULL COMMENT 'Peso en Gramos de los cortes',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Detalles de las piezas cortadas';

TRUNCATE TABLE `piezas_cortadas`;
CREATE TABLE `presupuestos` (
  `_id` int(11) NOT NULL,
  `id_wp` int(11) DEFAULT NULL COMMENT 'ID del cliente de Woocommerce',
  `id_wp_order` int(11) DEFAULT NULL COMMENT 'ID de la orden generada en Wocommerce',
  `status` varchar(45) DEFAULT NULL COMMENT 'Status de la orden: activa, pausada, cancelada, terminada, entregada',
  `tipo` varchar(6) NOT NULL DEFAULT 'custom' COMMENT 'Identificar si la orden pertence a custom o a sport',
  `responsable` int(11) DEFAULT NULL COMMENT 'ID del Vendedor',
  `cliente_nombre` varchar(40) DEFAULT NULL COMMENT 'Nombre del cliente',
  `cliente_cedula` varchar(45) DEFAULT NULL COMMENT 'Cedula del cliente',
  `lote_id` varchar(33) DEFAULT NULL COMMENT 'ID del Lote',
  `fecha_inicio` varchar(45) DEFAULT NULL COMMENT 'Fecha de inicio de la orden',
  `fecha_entrega` varchar(45) DEFAULT NULL COMMENT 'Fecha de entrega de la orden',
  `observaciones` longtext DEFAULT NULL COMMENT 'Detalles de la orden',
  `fecha_creacion` date DEFAULT NULL,
  `token` varchar(45) DEFAULT NULL COMMENT 'Token random',
  `pago_descuento` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Descuento sobre le monto de la orden',
  `pago_total` decimal(12,2) DEFAULT 0.00 COMMENT 'Montototal de la orden',
  `pago_abono` decimal(12,2) DEFAULT 0.00 COMMENT 'Monto abonado',
  `pago_comision` varchar(9) NOT NULL DEFAULT 'pendiente' COMMENT 'Los valores puedes ser pendiente: cuando aun no se ha pagado el total de la orden al vendedor, pagado, cuando se ha  terminado de pagar la totalidad de comisiones al vendedor, anulado, cuando por algun motivo no se terminará de pagar el vanededor y el administrador decide anular los pagos de esta orden',
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creación del registro'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `presupuestos`;
CREATE TABLE `presupuestos_productos` (
  `_id` int(11) NOT NULL COMMENT 'ID del registro',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_woo` int(11) DEFAULT NULL COMMENT 'ID del producto en woocommerce',
  `id_category` int(11) NOT NULL DEFAULT 0 COMMENT 'ID de la catagoria en WooCommerce ',
  `category_name` varchar(20) DEFAULT NULL COMMENT 'NOMBRE de la categoria en woocommerce',
  `name` varchar(240) DEFAULT NULL COMMENT 'Nombre del producto',
  `cantidad` int(11) NOT NULL DEFAULT 0 COMMENT 'Cantidad del producto',
  `talla` varchar(8) DEFAULT NULL COMMENT 'Talla del producto',
  `corte` varchar(32) DEFAULT NULL COMMENT 'Dama, caballero, niño',
  `id_catalogo_telas` int(11) DEFAULT NULL COMMENT 'ID de el catálogo de telas',
  `tela` varchar(128) DEFAULT NULL COMMENT 'Tela principal seleccionada desde Comercialización',
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio del producto',
  `precio_woo` decimal(10,0) DEFAULT NULL COMMENT 'Precio de Woocommerce',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `presupuestos_productos`;
CREATE TABLE `products` (
  `_id` bigint(20) UNSIGNED NOT NULL,
  `product` text DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `fisico` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Indica true si es un [rpducto virtual como diseños, patronajes o indica si es un producto fisico, si es falso indica un producto virtual o digital',
  `price` decimal(20,2) DEFAULT NULL,
  `comision` decimal(7,2) DEFAULT 0.00 COMMENT 'Monto para el calculo de comisión variable',
  `stock_quantity` int(11) DEFAULT 0 COMMENT 'Existencia en inventario\r\n',
  `product_description` text DEFAULT NULL COMMENT 'Descripción para mostrar e el sistema y la teienda',
  `category_ids` varchar(255) DEFAULT NULL,
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `products`;
INSERT INTO `products` (`_id`, `product`, `sku`, `fisico`, `price`, `comision`, `stock_quantity`, `product_description`, `category_ids`, `moment`) VALUES
(1, 'Producto de pruebas', 'PRU_01', 1, 10.00, 0.20, 12, 'Producto de pruebas', '1', '2025-09-25 13:36:26');

CREATE TABLE `products_attributes` (
  `_id` int(11) NOT NULL,
  `attribute_name` varchar(255) NOT NULL COMMENT 'Nombre del atributo',
  `precio` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio del atributo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Catálogo de atributos para productos';

TRUNCATE TABLE `products_attributes`;
INSERT INTO `products_attributes` (`_id`, `attribute_name`, `precio`) VALUES
(1, 'Atributo de Prueba', 1.00);

CREATE TABLE `products_attributes_values` (
  `_id` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_product` int(11) NOT NULL COMMENT 'id del prodcuto',
  `id_product_attribute` int(11) NOT NULL COMMENT 'id del atributo del producto',
  `attribute_value` varchar(128) NOT NULL COMMENT 'Descripción del atributo del producto',
  `attribute_price` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Precio del atributo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Atributos asignados a los productos';

TRUNCATE TABLE `products_attributes_values`;
CREATE TABLE `products_comisiones` (
  `_id` int(11) NOT NULL COMMENT 'ID único',
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del producto',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento',
  `comision` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Comisión asignada'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Comisiones asignada a los productos por departamento';

TRUNCATE TABLE `products_comisiones`;
INSERT INTO `products_comisiones` (`_id`, `id_product`, `id_departamento`, `comision`) VALUES
(1, 1, 2, 0.00);

CREATE TABLE `products_prices` (
  `_id` int(11) NOT NULL,
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del producto',
  `price` decimal(7,2) DEFAULT NULL COMMENT 'Precio del producto',
  `descripcion` varchar(128) DEFAULT NULL COMMENT 'Descripción del precio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Precios de productos';

TRUNCATE TABLE `products_prices`;
CREATE TABLE `products_sizes_eficiencia` (
  `_id` int(11) NOT NULL,
  `id_size` int(11) DEFAULT NULL COMMENT 'ID de la talla',
  `id_catalogo_insumos_prodcutos` int(11) DEFAULT NULL COMMENT 'ID de la tabla catalogo_ibsumos_productos',
  `cantidad` decimal(3,2) NOT NULL DEFAULT 0.00 COMMENT 'Cantidad de insumo',
  `unidad` varchar(64) DEFAULT NULL COMMENT 'Unidad de medida del insumo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Valores de la eficiencia de productos por tallas';

TRUNCATE TABLE `products_sizes_eficiencia`;
CREATE TABLE `products_tiempos_de_produccion` (
  `_id` int(11) NOT NULL,
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del producto',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento',
  `tiempo` int(11) NOT NULL DEFAULT 1 COMMENT 'Tiempo de producción e segundos',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `products_tiempos_de_produccion`;
CREATE TABLE `product_insumos_asignados` (
  `_id` int(11) NOT NULL,
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del prodducto',
  `id_catalogo_insumos_productos` int(11) DEFAULT NULL COMMENT 'ID delc atalogo de insumos de productos',
  `id_departamento` int(11) NOT NULL COMMENT 'ID del departamento',
  `id_talla` int(11) DEFAULT NULL COMMENT 'ID de la talla',
  `cantidad` decimal(6,2) NOT NULL DEFAULT 0.00 COMMENT 'cantidad del insumo',
  `unidad` varchar(64) DEFAULT NULL COMMENT 'Unidad de medida del insumo',
  `tiempo` int(11) NOT NULL DEFAULT 0 COMMENT 'tiempo estimadop de fabricación en segundos',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `product_insumos_asignados`;
CREATE TABLE `rendimiento` (
  `_id` int(11) NOT NULL,
  `id_empleado_impresion` int(11) DEFAULT NULL,
  `id_empleado_estampado` int(11) DEFAULT NULL,
  `id_empleado_corte` int(11) DEFAULT NULL,
  `id_orden` int(11) DEFAULT NULL,
  `id_insumo` int(11) DEFAULT NULL COMMENT 'Numero de rollo',
  `metros` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'Metros de material utilizado',
  `desperdicio` decimal(7,2) NOT NULL DEFAULT 0.00 COMMENT 'peso en gramos del material sobrante',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Datos para el calculo de el rendimiento del material';

TRUNCATE TABLE `rendimiento`;
CREATE TABLE `reposiciones` (
  `_id` int(11) NOT NULL COMMENT 'ID unico de la tabla',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden',
  `id_departamento` int(11) DEFAULT NULL COMMENT 'ID del departamento del empleado al que se envía la reposición',
  `id_departamento_solicitante` int(11) DEFAULT NULL COMMENT 'ID del departamento que emitió la reposición',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado asignado',
  `id_empleado_emisor` int(11) DEFAULT NULL COMMENT 'ID del empleado que genera la reposición',
  `id_ordenes_productos` int(11) DEFAULT NULL COMMENT 'ID de ordenes_productos',
  `unidades` int(11) DEFAULT NULL COMMENT 'Número de unidades involucradas en la reposición',
  `detalle` text DEFAULT NULL COMMENT 'Detalles del jefe de producción',
  `detalle_emisor` text DEFAULT NULL COMMENT 'Detalle de el empleado emisor',
  `aprobada` tinyint(1) DEFAULT 0 COMMENT 'Determina si la reposición has sido aprobada es true, si no es false, si en null aún no se ha indicado el estado de la reposicion',
  `terminada` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el empleado al que se le asignó la reposicion ya la terminó',
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'moment'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Control de reposiciones durante el proceso de fabricacion';

TRUNCATE TABLE `reposiciones`;
CREATE TABLE `retiros` (
  `_id` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `monto` decimal(10,0) DEFAULT NULL,
  `moneda` varchar(12) DEFAULT NULL COMMENT 'nombre de la moneda que será objeto del retiro',
  `tasa` decimal(10,0) NOT NULL DEFAULT 0 COMMENT 'TASA DE CONVERSION',
  `metodo_pago` varchar(20) DEFAULT NULL COMMENT 'Metodo de pago ejm pago movil, efectivo etc.',
  `detalle_retiro` text DEFAULT NULL,
  `cierre_caja` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'El registro corresponde a un cierre de caja',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `retiros`;
CREATE TABLE `revisiones` (
  `_id` int(11) NOT NULL COMMENT 'id de la tabla',
  `id_orden` int(11) DEFAULT NULL COMMENT 'ID de la orden a la cual pertenece el diseño y estarevision',
  `id_diseno` int(11) DEFAULT NULL COMMENT 'id en la tabla disenos',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del diseñador que envió la revisión',
  `id_product` int(11) DEFAULT NULL COMMENT 'ID del producto asociado a la revisión',
  `tipo` varchar(128) DEFAULT NULL COMMENT 'Tipo de diseño asociado a la revisión',
  `revision` int(11) NOT NULL DEFAULT 0 COMMENT 'Numero de revisiones máximo dos',
  `estatus` varchar(19) NOT NULL DEFAULT 'Esperando Respuesta' COMMENT 'Los estados son ''Esperando Respuesta'', ''Rechazado'', ''Aprobado''',
  `url_image` varchar(255) DEFAULT NULL COMMENT 'URL de la imagen de la revisión',
  `detalles` text DEFAULT NULL COMMENT 'Detalles de la revision',
  `moment` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `revisiones`;
CREATE TABLE `sizes` (
  `_id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

TRUNCATE TABLE `sizes`;
INSERT INTO `sizes` (`_id`, `nombre`) VALUES
(1, 'Talla de Pruaba');

CREATE TABLE `tintas` (
  `_id` int(11) NOT NULL,
  `c` decimal(7,2) DEFAULT NULL COMMENT 'Cyan',
  `m` decimal(7,2) DEFAULT NULL COMMENT 'Magenta',
  `y` decimal(7,2) DEFAULT NULL COMMENT 'Yellow',
  `k` decimal(7,2) DEFAULT NULL COMMENT 'Black',
  `w` decimal(7,2) DEFAULT NULL COMMENT 'White',
  `id_catalogo_impresoras` int(11) DEFAULT NULL COMMENT 'ID del catálogo de impresoras',
  `id_orden` int(11) DEFAULT NULL COMMENT 'Id de la Orden',
  `id_empleado` int(11) DEFAULT NULL COMMENT 'ID del empleado que imprimió',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Registra el consumo de tintas por orden';

TRUNCATE TABLE `tintas`;
CREATE TABLE `tintas_recargas` (
  `_id` int(11) NOT NULL,
  `id_insumo` int(11) DEFAULT NULL,
  `id_catalogo_impresora` int(11) DEFAULT NULL COMMENT 'ID catalodo de imoresoras',
  `color` varchar(1) DEFAULT NULL COMMENT 'Color de la tinta',
  `cantidad` decimal(7,2) DEFAULT NULL COMMENT 'Cantidad en ML',
  `fecha_recarga` timestamp NULL DEFAULT NULL COMMENT 'Fecha de la recarga',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Recargas de tinta';

TRUNCATE TABLE `tintas_recargas`;
CREATE TABLE `tinta_filtro` (
  `_id` int(11) NOT NULL,
  `id_inventario` int(11) DEFAULT NULL COMMENT 'Id del insumo',
  `color` varchar(1) NOT NULL COMMENT 'Color de la tinta C, M, Y, K, W',
  `moment` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Indica cuales insumos son tintas para filtrar las tintas';

TRUNCATE TABLE `tinta_filtro`;

ALTER TABLE `abonos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_empleado`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `aprobacion_clientes`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_diseno`);

ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `caja`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `caja_cierres`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `caja_fondos`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `catalogo_impresoras`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `idx_codigo_interno` (`codigo_interno`) COMMENT 'Asegura que cada código sea único.';

ALTER TABLE `catalogo_insumos_productos`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `nombre_2` (`nombre`);

ALTER TABLE `catalogo_telas`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `_id` (`_id`);

ALTER TABLE `categories`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `check_tareas`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `config`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `customers`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `disenos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `disenos_ajustes_y_personalizaciones`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_diseno`);

ALTER TABLE `empleados_lotes_fabricacion`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `empleados_lotes_fabricacion_items`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `inventario`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `inventario_movimientos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_producto`,`id_empleado`,`id_insumo`);

ALTER TABLE `lotes`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`);

ALTER TABLE `lotes_detalles`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_empleado` (`id_empleado`),
  ADD KEY `id_orden` (`id_orden`,`id_ordenes_productos`);

ALTER TABLE `lotes_detalles_empleados_asignados`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `lotes_detalles_empleados_asignados_pausas`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `lotes_fisicos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`);

ALTER TABLE `lotes_historico_solicitadas`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_lotes_fisicos`);

ALTER TABLE `lotes_movimientos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_lotes_detalles` (`id_lotes_detalles`,`id_orden`);

ALTER TABLE `metodos_de_pago`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`);

ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_borrador_empleado`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_fila_orden`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_fila_orden_cambios`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ordenes_fila_reposiciones`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_observaciones`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_productos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`rollo`),
  ADD KEY `id_catalogo_telas` (`rollo`);

ALTER TABLE `ordenes_tmp`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `ordenes_vinculadas`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_father` (`id_father`,`id_child`),
  ADD KEY `id_child` (`id_child`);

ALTER TABLE `pagos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_metodos_de_pago`,`id_lotes_detalles`,`id_empleado`),
  ADD KEY `id_metodos_de_pago` (`id_metodos_de_pago`),
  ADD KEY `id_lotes_detalles` (`id_lotes_detalles`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `piezas_cortadas`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_inventario`,`id_ordenes_productos`,`id_empleado`);

ALTER TABLE `presupuestos`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `presupuestos_productos`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_catalogo_telas`),
  ADD KEY `id_catalogo_telas` (`id_catalogo_telas`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_attributes`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_attributes_values`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_comisiones`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_prices`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_sizes_eficiencia`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `products_tiempos_de_produccion`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `product_insumos_asignados`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `rendimiento`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `reposiciones`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_empleado`,`id_ordenes_productos`),
  ADD KEY `id_empleado_emisor` (`id_empleado_emisor`);

ALTER TABLE `retiros`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_empleado` (`id_empleado`);

ALTER TABLE `revisiones`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `id_orden` (`id_orden`,`id_diseno`),
  ADD KEY `id_orden_2` (`id_orden`,`id_diseno`);

ALTER TABLE `sizes`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `tintas`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `tintas_recargas`
  ADD PRIMARY KEY (`_id`);

ALTER TABLE `tinta_filtro`
  ADD PRIMARY KEY (`_id`);


ALTER TABLE `abonos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID de la talba';

ALTER TABLE `aprobacion_clientes`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asistencias`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico del registro';

ALTER TABLE `caja`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `caja_cierres`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `caja_fondos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `catalogo_impresoras`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `catalogo_insumos_productos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `catalogo_telas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico de la tabla', AUTO_INCREMENT=2;

ALTER TABLE `categories`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `check_tareas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico';

ALTER TABLE `config`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `customers`
  MODIFY `_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `departamentos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `disenos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID de la tabla';

ALTER TABLE `disenos_ajustes_y_personalizaciones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `empleados_lotes_fabricacion`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `empleados_lotes_fabricacion_items`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `inventario`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico';

ALTER TABLE `inventario_movimientos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico';

ALTER TABLE `lotes`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID Autonumérico';

ALTER TABLE `lotes_detalles`
  MODIFY `_id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'ID único del registro';

ALTER TABLE `lotes_detalles_empleados_asignados`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lotes_detalles_empleados_asignados_pausas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lotes_fisicos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lotes_historico_solicitadas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lotes_movimientos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `metodos_de_pago`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico de la tabla';

ALTER TABLE `ordenes`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_borrador_empleado`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_fila_orden`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_fila_orden_cambios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_fila_reposiciones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_observaciones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ordenes_productos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID del registro';

ALTER TABLE `ordenes_tmp`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Clave primaria';

ALTER TABLE `ordenes_vinculadas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id de la tabla';

ALTER TABLE `pagos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico';

ALTER TABLE `piezas_cortadas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico';

ALTER TABLE `presupuestos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `presupuestos_productos`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID del registro';

ALTER TABLE `products`
  MODIFY `_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `products_attributes`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `products_attributes_values`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `products_comisiones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID único', AUTO_INCREMENT=2;

ALTER TABLE `products_prices`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `products_sizes_eficiencia`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `products_tiempos_de_produccion`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `product_insumos_asignados`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `rendimiento`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reposiciones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID unico de la tabla';

ALTER TABLE `retiros`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `revisiones`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id de la tabla';

ALTER TABLE `sizes`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `tintas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tintas_recargas`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tinta_filtro`
  MODIFY `_id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `abonos`
  ADD CONSTRAINT `abonos_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `disenos`
  ADD CONSTRAINT `disenos_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`_id`);

ALTER TABLE `lotes`
  ADD CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `lotes_detalles`
  ADD CONSTRAINT `lotes_detalles_ibfk_2` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`_id`);

ALTER TABLE `ordenes_productos`
  ADD CONSTRAINT `ordenes_productos_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes` (`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `ordenes_vinculadas`
  ADD CONSTRAINT `ordenes_vinculadas_ibfk_1` FOREIGN KEY (`id_father`) REFERENCES `ordenes` (`_id`),
  ADD CONSTRAINT `ordenes_vinculadas_ibfk_2` FOREIGN KEY (`id_child`) REFERENCES `ordenes` (`_id`);
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
