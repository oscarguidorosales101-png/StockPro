-- ========================================================
-- Script de Creación de Base de Datos - StockPro
-- Plataforma empresarial de inventarios y clientes
-- Charset: utf8mb4
-- ========================================================

CREATE DATABASE IF NOT EXISTS `stockpro`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `stockpro`;

-- --------------------------------------------------------
-- 1. Tabla: categorias
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `estado` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla: proveedores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id_proveedor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `correo` VARCHAR(120) DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla: productos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` INT NOT NULL AUTO_INCREMENT,
  `id_categoria` INT NOT NULL,
  `id_proveedor` INT NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `precio` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_producto`),
  CONSTRAINT `fk_productos_categorias`
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_productos_proveedores`
    FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabla: clientes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `tipo_cliente` VARCHAR(20) NOT NULL, -- 'persona' o 'empresa'
  `nombre` VARCHAR(150) NOT NULL,
  `identificacion` VARCHAR(30) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `correo` VARCHAR(120) DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `estado` BOOLEAN NOT NULL DEFAULT TRUE,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uk_clientes_identificacion` (`identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabla: movimientos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `movimientos` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` VARCHAR(20) NOT NULL, -- 'entrada', 'salida', 'ajuste'
  `observacion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  CONSTRAINT `fk_movimientos_clientes`
    FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla: detalle_movimientos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `detalle_movimientos` (
  `id_detalle` INT NOT NULL AUTO_INCREMENT,
  `id_movimiento` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_detalle`),
  CONSTRAINT `fk_detalle_movimientos_movimiento`
    FOREIGN KEY (`id_movimiento`) REFERENCES `movimientos` (`id_movimiento`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_movimientos_producto`
    FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Datos Iniciales de Demostración (Semilla)
-- --------------------------------------------------------
INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Abarrotes y Granos', 'Productos alimenticios básicos no perecederos', 1),
(2, 'Bebidas y Refrescos', 'Jugos, gaseosas, aguas y bebidas energéticas', 1),
(3, 'Cuidado Personal', 'Jabones, champús, dentífricos y aseo personal', 1),
(4, 'Limpieza del Hogar', 'Detergentes, desinfectantes y artículos de aseo', 1)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `proveedores` (`id_proveedor`, `nombre`, `telefono`, `correo`, `direccion`) VALUES
(1, 'Distribuidora Alimentos del Valle S.A.', '+506 2222-1111', 'contacto@alimentosdelvalle.com', 'Parque Industrial Heredia, Bodega 14'),
(2, 'Comercializadora Global de Bebidas', '+506 2244-8899', 'ventas@globalbebidas.cr', 'San José, Paseo Colón, Edificio Torre Este'),
(3, 'Suministros Químicos y Limpieza Pro', '+506 2433-5566', 'pedidos@limpiezapro.com', 'Alajuela, Zona Franca El Coyol')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `productos` (`id_producto`, `id_categoria`, `id_proveedor`, `nombre`, `descripcion`, `precio`, `stock`) VALUES
(1, 1, 1, 'Arroz Grano Entero 1kg', 'Arroz blanco seleccionado 99% entero', 1250.00, 100),
(2, 1, 1, 'Frijoles Negros 800g', 'Frijoles negros de primera calidad', 1400.00, 80),
(3, 2, 2, 'Jugo de Naranja 1L', 'Jugo pasteurizado 100% natural', 1800.00, 60),
(4, 2, 2, 'Agua Purificada 600ml', 'Botella de agua purificada sin gas', 650.00, 120),
(5, 3, 3, 'Jabón Antibacterial 120g', 'Jabón en barra con glicerina y aloe vera', 850.00, 75),
(6, 4, 3, 'Detergente Líquido Multiusos 2L', 'Detergente concentrado aroma lavanda', 3900.00, 45)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

INSERT INTO `clientes` (`id_cliente`, `tipo_cliente`, `nombre`, `identificacion`, `telefono`, `correo`, `direccion`, `estado`, `fecha_registro`) VALUES
(1, 'persona', 'Carlos Alberto Méndez Rojas', '1-1452-0987', '+506 8811-2233', 'carlos.mendez@gmail.com', 'San José, Barrio Escalante', 1, '2026-01-15 09:30:00'),
(2, 'persona', 'María Fernanda Vargas Solís', '2-0543-0876', '+506 8765-4321', 'maria.vargas@outlook.com', 'Heredia Centro, Calle 5', 1, '2026-02-10 14:15:00'),
(3, 'empresa', 'Cafetería & Panadería Aroma Café S.A.', '3-101-789456', '+506 2233-4455', 'compras@aromacafe.cr', 'San Pedro, Montes de Oca, 200m Sur de la Iglesia', 1, '2026-03-01 11:00:00'),
(4, 'empresa', 'Restaurante Sabor Criollo Ltda.', '3-102-654321', '+506 2441-9988', 'administracion@saborcriollo.com', 'Alajuela centro, costado norte del Parque Central', 1, '2026-03-20 16:45:00')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Movimientos iniciales de prueba
INSERT INTO `movimientos` (`id_movimiento`, `id_cliente`, `fecha`, `tipo`, `observacion`) VALUES
(1, NULL, '2026-04-01 08:00:00', 'entrada', 'Ingreso inicial por compra de inventario a proveedores'),
(2, 3, '2026-04-05 10:30:00', 'salida', 'Despacho semanal para Cafetería Aroma Café'),
(3, NULL, '2026-04-10 15:00:00', 'ajuste', 'Ajuste de inventario tras conteo físico mensual')
ON DUPLICATE KEY UPDATE `tipo` = VALUES(`tipo`);

INSERT INTO `detalle_movimientos` (`id_detalle`, `id_movimiento`, `id_producto`, `cantidad`) VALUES
(1, 1, 1, 50),
(2, 1, 3, 30),
(3, 2, 1, 10),
(4, 2, 3, 5),
(5, 3, 2, 5)
ON DUPLICATE KEY UPDATE `cantidad` = VALUES(`cantidad`);

