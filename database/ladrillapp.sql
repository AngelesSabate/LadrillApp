-- =========================================================
-- LADRILLAPP
-- BASE DE DATOS
-- =========================================================

CREATE DATABASE IF NOT EXISTS ladrillapp;

USE ladrillapp;


-- =========================================================
-- 1. OBRAS
-- =========================================================

CREATE TABLE IF NOT EXISTS obras (

    id_obra INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    descripcion VARCHAR(255),

    fecha_creacion DATE NOT NULL

);


-- =========================================================
-- 2. TIPOS CONSTRUCTIVOS
-- =========================================================

CREATE TABLE IF NOT EXISTS tipos_constructivos (

    id_tipo INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    rubro VARCHAR(50) NOT NULL,

    unidad_calculo VARCHAR(10) NOT NULL,

    descripcion VARCHAR(255)

);


-- =========================================================
-- 3. ELEMENTOS DE UNA OBRA
-- =========================================================

CREATE TABLE IF NOT EXISTS elementos_obra (

    id_elemento INT AUTO_INCREMENT PRIMARY KEY,

    id_obra INT NOT NULL,

    id_tipo INT NOT NULL,

    nombre VARCHAR(100),

    largo DECIMAL(10,2) NOT NULL,

    segunda_dimension DECIMAL(10,2) NOT NULL,

    superficie DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_obra)
        REFERENCES obras(id_obra),

    FOREIGN KEY (id_tipo)
        REFERENCES tipos_constructivos(id_tipo)

);


-- =========================================================
-- 4. MATERIALES
-- =========================================================

CREATE TABLE IF NOT EXISTS materiales (

    id_material INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    unidad_medida VARCHAR(20) NOT NULL,

    precio_unitario DECIMAL(12,2),

    fecha_actualizacion_precio DATE

);


-- =========================================================
-- 5. REQUERIMIENTOS DE MATERIALES
-- =========================================================

CREATE TABLE IF NOT EXISTS requerimientos_material (

    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,

    id_tipo INT NOT NULL,

    id_material INT NOT NULL,

    rendimiento_unitario DECIMAL(12,4) NOT NULL,

    componente VARCHAR(50) NOT NULL,

    FOREIGN KEY (id_tipo)
        REFERENCES tipos_constructivos(id_tipo),

    FOREIGN KEY (id_material)
        REFERENCES materiales(id_material)

);


-- =========================================================
-- 6. MANO DE OBRA
-- =========================================================

CREATE TABLE IF NOT EXISTS mano_obra (

    id_mano_obra INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    unidad_medida VARCHAR(20) NOT NULL,

    precio_hora DECIMAL(12,2),

    fecha_actualizacion_precio DATE

);


-- =========================================================
-- 7. REQUERIMIENTOS DE MANO DE OBRA
-- =========================================================

CREATE TABLE IF NOT EXISTS requerimientos_mano_obra (

    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,

    id_tipo INT NOT NULL,

    id_mano_obra INT NOT NULL,

    horas_por_unidad DECIMAL(10,4) NOT NULL,

    componente VARCHAR(50) NOT NULL,

    FOREIGN KEY (id_tipo)
        REFERENCES tipos_constructivos(id_tipo),

    FOREIGN KEY (id_mano_obra)
        REFERENCES mano_obra(id_mano_obra)

);


-- =========================================================
-- DATOS INICIALES
-- =========================================================


-- =========================================================
-- TIPOS CONSTRUCTIVOS
-- =========================================================

INSERT IGNORE INTO tipos_constructivos
(id_tipo, nombre, rubro, unidad_calculo, descripcion)
VALUES

(
    1,
    'Pared terminada de ladrillo hueco 12x18x33 cm - espesor final 0.15 m',
    'Paredes',
    'm2',
    'Mampostería de ladrillo hueco de 12 cm con revoque grueso de 1.5 cm en ambas caras'
),

(
    2,
    'Pared terminada de ladrillo común 25x12x5 cm - espesor final 0.15 m',
    'Paredes',
    'm2',
    'Mampostería de ladrillo común de 12 cm con revoque grueso de 1.5 cm en ambas caras'
),

(
    3,
    'Piso terminado y techo',
    'Pisos y techos',
    'm2',
    'Incluye contrapiso de cascotes de 0.10 m, carpeta de cemento de 0.02 m y techo de chapa simplificado'
);


-- =========================================================
-- MATERIALES
-- =========================================================

INSERT IGNORE INTO materiales
(id_material, nombre, unidad_medida, precio_unitario, fecha_actualizacion_precio)
VALUES

(1, 'Ladrillo hueco 12x18x33', 'unidad', NULL, NULL),

(2, 'Ladrillo común', 'unidad', NULL, NULL),

(3, 'Cemento', 'kg', NULL, NULL),

(4, 'Cal hidráulica', 'kg', NULL, NULL),

(5, 'Arena', 'm3', NULL, NULL),

(6, 'Cascote de ladrillo', 'm3', NULL, NULL),

(7, 'Chapa acanalada', 'm2', NULL, NULL),

(8, 'Tirantes de madera', 'm lineal', NULL, NULL),

(9, 'Aislante térmico', 'm2', NULL, NULL);


-- =========================================================
-- MANO DE OBRA
-- =========================================================

INSERT IGNORE INTO mano_obra
(id_mano_obra, nombre, unidad_medida, precio_hora, fecha_actualizacion_precio)
VALUES

(1, 'Oficial albañil', 'hora', NULL, NULL),

(2, 'Ayudante', 'hora', NULL, NULL),

(3, 'Oficial techador', 'hora', NULL, NULL);


-- =========================================================
-- PARED DE LADRILLO HUECO
-- MAMPOSTERÍA
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(1, 1, 1, 16.0000, 'Mampostería'),

(2, 1, 3, 3.1000, 'Mampostería'),

(3, 1, 4, 6.1000, 'Mampostería'),

(4, 1, 5, 0.0350, 'Mampostería');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(1, 1, 1, 1.0000, 'Mampostería'),

(2, 1, 2, 0.7000, 'Mampostería');


-- =========================================================
-- PARED DE LADRILLO HUECO
-- REVOQUE EN AMBAS CARAS
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(5, 1, 3, 4.4000, 'Revoque'),

(6, 1, 4, 8.6000, 'Revoque'),

(7, 1, 5, 0.0420, 'Revoque');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(3, 1, 1, 1.1000, 'Revoque'),

(4, 1, 2, 0.8000, 'Revoque');


-- =========================================================
-- PARED DE LADRILLO COMÚN
-- MAMPOSTERÍA
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(8, 2, 2, 60.0000, 'Mampostería'),

(9, 2, 3, 5.1000, 'Mampostería'),

(10, 2, 4, 12.0000, 'Mampostería'),

(11, 2, 5, 0.0430, 'Mampostería');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(5, 2, 1, 1.3000, 'Mampostería'),

(6, 2, 2, 1.1000, 'Mampostería');


-- =========================================================
-- PARED DE LADRILLO COMÚN
-- REVOQUE EN AMBAS CARAS
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(12, 2, 3, 4.4000, 'Revoque'),

(13, 2, 4, 8.6000, 'Revoque'),

(14, 2, 5, 0.0420, 'Revoque');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(7, 2, 1, 1.1000, 'Revoque'),

(8, 2, 2, 0.8000, 'Revoque');


-- =========================================================
-- PISO
-- CONTRAPISO DE CASCOTES 0.10 M
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(15, 3, 3, 11.0000, 'Contrapiso'),

(16, 3, 4, 26.0000, 'Contrapiso'),

(17, 3, 5, 0.0900, 'Contrapiso'),

(18, 3, 6, 0.1100, 'Contrapiso');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(9, 3, 1, 0.4500, 'Contrapiso'),

(10, 3, 2, 0.8500, 'Contrapiso');


-- =========================================================
-- PISO
-- CARPETA DE CEMENTO 0.02 M
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(19, 3, 3, 6.1000, 'Carpeta'),

(20, 3, 5, 0.0230, 'Carpeta');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(11, 3, 1, 0.5000, 'Carpeta'),

(12, 3, 2, 0.2500, 'Carpeta');


-- =========================================================
-- TECHO DE CHAPA SIMPLIFICADO
-- =========================================================

INSERT IGNORE INTO requerimientos_material
(id_requerimiento, id_tipo, id_material, rendimiento_unitario, componente)
VALUES

(21, 3, 7, 1.1500, 'Techo'),

(22, 3, 8, 2.5000, 'Techo'),

(23, 3, 9, 1.0500, 'Techo');


INSERT IGNORE INTO requerimientos_mano_obra
(id_requerimiento, id_tipo, id_mano_obra, horas_por_unidad, componente)
VALUES

(13, 3, 3, 1.2000, 'Techo'),

(14, 3, 2, 1.0000, 'Techo');