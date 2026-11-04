-- ========================================================
-- Migración 001: Esquema Inicial de StockPro
-- ========================================================

CREATE DATABASE IF NOT EXISTS `stockpro`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `stockpro`;

-- 1. Categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `estado` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id_proveedor` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `correo` VARCHAR(120) DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Productos
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

-- 4. Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `tipo_cliente` VARCHAR(20) NOT NULL,
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

-- 5. Movimientos
CREATE TABLE IF NOT EXISTS `movimientos` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT,
  `id_cliente` INT DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` VARCHAR(20) NOT NULL,
  `observacion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  CONSTRAINT `fk_movimientos_clientes`
    FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Detalle Movimientos
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

