# Carga de datos después de iniciar la empresa

## Datos incluidos automáticamente en el setup:

### Impresoras (catalogo_impresoras):
```sql
INSERT INTO `catalogo_impresoras` (`_id`, `codigo_interno`, `marca`, `modelo`, `capacidad_contenedor`, `ubicacion`, `tipo_tecnologia`, `estado`, `notas`, `moment`) VALUES
(1, 'IMPRESORA PRINCIPAL', 'EPSON', 'EPS_9902', 1000.00, 'PISO 1', 'CMYK', 'activa', 'Impresora con cabezales originales', CURRENT_TIMESTAMP),
(2, 'IMPRESORA SECUNDARIA', 'Mimaki', 'MK_09890', 750.00, 'PISO 2', 'CMYKW', 'activa', 'Impresora para usar solo con tintas originales', CURRENT_TIMESTAMP);
```

### Productos (products):
```sql
INSERT INTO `products` (`_id`, `product`, `sku`, `fisico`, `es_diseno`, `price`, `comision`, `stock_quantity`, `product_description`, `category_ids`, `moment`) VALUES
(1, 'Producto de pruebas', 'PRU_01', 1, 0, 10.00, 0.20, 12, 'Producto de pruebas', '1', '2025-09-25 13:36:26'),
(2, 'Diseño Gráfico', 'DIS_01', 0, 1, 15.00, 10.00, 12, 'Diseño Gráfico de pruebas', '1', '2025-09-25 13:36:26');
```

### Comisiones por producto y departamento (products_comisiones):
```sql
INSERT INTO `products_comisiones` (`_id`, `id_product`, `id_departamento`, `comision`) VALUES
(1, 1, 1, 0.50),
(2, 1, 2, 0.50),
(3, 1, 3, 0.50),
(4, 1, 4, 0.50),
(5, 1, 6, 0.50),
(6, 1, 7, 0.50);
```

### Insumos (inventario):
```sql
INSERT INTO `inventario` (`_id`, `sku`, `id_catalogo`, `insumo`, `unidad`, `costo`, `rendimiento`, `cantidad`, `color`, `ancho`, `elongacion`, `detalles`, `departamento`, `moment`) VALUES
(1, 'PAP_001', NULL, 'Papel de pruebas', 'Mts', 20.00, 8.0, 12.00, 'BLANCO', 0.90, NULL, 'Papel para pruebas de impresión', 'Impresión', CURRENT_TIMESTAMP),
(2, 'TEL_001', NULL, 'Tela de pruebas', 'Kg', 80.00, 3.0, 12.00, 'BLANCO', 1.50, 'HORIZONTAL', 'Tela para pruebas de estampado', 'Estampado', CURRENT_TIMESTAMP),
(3, 'TIN_C_001', NULL, 'Tinta Cyan', 'ML', 15.00, NULL, 1000.00, 'CYAN', NULL, NULL, 'Tinta cyan para impresoras', 'Impresión', CURRENT_TIMESTAMP),
(4, 'TIN_M_001', NULL, 'Tinta Magenta', 'ML', 15.00, NULL, 1000.00, 'MAGENTA', NULL, NULL, 'Tinta magenta para impresoras', 'Impresión', CURRENT_TIMESTAMP),
(5, 'TIN_Y_001', NULL, 'Tinta Yellow', 'ML', 15.00, NULL, 1000.00, 'YELLOW', NULL, NULL, 'Tinta yellow para impresoras', 'Impresión', CURRENT_TIMESTAMP),
(6, 'TIN_K_001', NULL, 'Tinta Black', 'ML', 15.00, NULL, 1000.00, 'BLACK', NULL, NULL, 'Tinta negra para impresoras', 'Impresión', CURRENT_TIMESTAMP);
```

### Catálogo de insumos por producto (catalogo_insumos_productos):
```sql
INSERT INTO `catalogo_insumos_productos` (`_id`, `nombre`, `id_product`, `id_departamento`) VALUES
(1, 'Papel para sublimación', 1, 1),
(2, 'Tela Atlética', 1, 3),
(3, 'Botones', 1, 1),
(4, 'Tinta', 1, 1),
(5, 'Tela Licra', 1, 3),
(6, 'Tela Algodón', 1, 3),
(7, 'Diseño Gráfico', 2, 7);
```

### Atributos de productos (products_attributes):
```sql
INSERT INTO `products_attributes` (`_id`, `attribute_name`, `precio`)
VALUES (1, 'Atributo de pruebas', 5.00);
```

### Empleados de ejemplo creados automáticamente:

Al ejecutar el endpoint `POST /setup/user`, se crean automáticamente los siguientes empleados de ejemplo:

#### Administrador (creado inicialmente):
- **Email**: El email proporcionado en la solicitud
- **Departamento**: Administración (ID: 5)
- **Salario base**: 600.00 USD
- **Bonos fijos**: 50.00 USD

#### Empleados de producción creados automáticamente:
1. **Juan Pérez García** (Impresión - ID departamento: 1)
   - Email: juan.perez@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

2. **María González López** (Estampado - ID departamento: 2)
   - Email: maria.gonzalez@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

3. **Carlos Rodríguez Díaz** (Corte - ID departamento: 3)
   - Email: carlos.rodriguez@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

4. **Ana Martínez Torres** (Costura - ID departamento: 4)
   - Email: ana.martinez@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

5. **Luisa Fernández Ruiz** (Diseño - ID departamento: 7)
   - Email: luisa.fernandez@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

6. **Roberto Díaz Castro** (Comercialización - ID departamento: 6)
   - Email: roberto.diaz@empresa.com
   - Salario base: 450.00 USD, Bonos: 25.00 USD

### Salarios de empleados (empleados_salario):
Los registros en la tabla `empleados_salario` se crean automáticamente en la base de datos individual de cada empresa con los datos de salario definidos arriba. Cada empleado tiene su registro correspondiente con sueldo base, bonos fijos, moneda USD, fecha de inicio de contrato (fecha actual) y pago mensual fijo activado.

### Precios de productos (products_prices):
```sql
INSERT INTO `products_prices` (`_id`, `id_product`, `price`, `descripcion`) VALUES
(1, 1, 25.00, 'Detal'),
(2, 1, 22.00, 'Mayor'),
(3, 2, 15.00, 'Unitario');
```

### Tallas (sizes):
```sql
INSERT INTO `sizes` (`_id`, `nombre`) VALUES
(1, 'S'),
(2, 'M'),
(3, 'L'),
(4, 'XL');
```

### Tiempos de producción por producto y departamento:
```sql
INSERT INTO `products_tiempos_de_produccion` (`_id`, `id_product`, `id_departamento`, `tiempo`, `moment`) VALUES
(1, 1, 1, 1800, CURRENT_TIMESTAMP),
(2, 1, 2, 2400, CURRENT_TIMESTAMP),
(3, 1, 3, 1200, CURRENT_TIMESTAMP),
(4, 1, 4, 1800, CURRENT_TIMESTAMP);
```

## Pasos adicionales (si son necesarios):

1. Crear impresora adicional: `INSERT INTO catalogo_impresoras(codigo_interno, marca, modelo, capacidad_contenedor, ubicacion, tipo_tecnologia, estado, notas) VALUES ('Impresora de pruebas','EPSON','EP_0001','0','Fábrica','CMYK','activa','Notas de la impresora');`
2. Cargar catálogo de productos: `INSERT INTO catalogo_insumos_productos(nombre, id_product, id_departamento) VALUES ('Papel de pruebas',1,1); INSERT INTO catalogo_insumos_productos(nombre, id_product, id_departamento) VALUES ('Tela de pruebas',2,3);`
3. Crear insumos adicionales: `INSERT INTO inventario(sku, id_catalogo, insumo, unidad, costo, rendimiento, cantidad, color, ancho, departamento) VALUES ('PAP_001',1,'Papel de pruebas','Mts','20','8','12','BLANCO','0.9','Impresión'); INSERT INTO inventario(sku, id_catalogo, insumo, unidad, costo, rendimiento, cantidad, color, ancho, elongacion, departamento) VALUES ('PAP_001',2,'Tela de pruebas','Kg','80','3','12','BLANCO','1.5','HORIZONTAL','Telas');`
