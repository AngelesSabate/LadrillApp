-- =========================================================
-- LADRILLAPP
-- Script completo de creación de base de datos
-- =========================================================

-- Creamos la base de datos si todavía no existe.
CREATE DATABASE IF NOT EXISTS ladrillapp;

-- Indicamos que vamos a trabajar con esta base.
USE ladrillapp;


-- =========================================================
-- 1. TABLA OBRAS
-- =========================================================

CREATE TABLE IF NOT EXISTS obras (
    id_obra INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_creacion DATE NOT NULL
);


-- =========================================================
-- 2. TABLA TIPOS_CONSTRUCTIVOS
-- =========================================================

CREATE TABLE IF NOT EXISTS tipos_constructivos (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rubro VARCHAR(50) NOT NULL,
    unidad_calculo VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255)
);


-- =========================================================
-- 3. TABLA ELEMENTOS_OBRA
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
-- 4. TABLA MATERIALES
-- =========================================================

CREATE TABLE IF NOT EXISTS materiales (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,

    precio_unitario DECIMAL(12,2),
    fecha_actualizacion_precio DATE
);


-- =========================================================
-- 5. TABLA REQUERIMIENTOS_MATERIAL
-- =========================================================

CREATE TABLE IF NOT EXISTS requerimientos_material (
    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    id_material INT NOT NULL,

    rendimiento_unitario DECIMAL(12,4) NOT NULL,

    FOREIGN KEY (id_tipo)
        REFERENCES tipos_constructivos(id_tipo),

    FOREIGN KEY (id_material)
        REFERENCES materiales(id_material)
);


-- =========================================================
-- 6. TABLA MANO_OBRA
-- =========================================================

CREATE TABLE IF NOT EXISTS mano_obra (
    id_mano_obra INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,

    precio_hora DECIMAL(12,2),
    fecha_actualizacion_precio DATE
);


-- =========================================================
-- 7. TABLA REQUERIMIENTOS_MANO_OBRA
-- =========================================================

CREATE TABLE IF NOT EXISTS requerimientos_mano_obra (
    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    id_mano_obra INT NOT NULL,

    horas_por_unidad DECIMAL(10,4) NOT NULL,

    FOREIGN KEY (id_tipo)
        REFERENCES tipos_constructivos(id_tipo),

    FOREIGN KEY (id_mano_obra)
        REFERENCES mano_obra(id_mano_obra)
);


-- =========================================================
-- 8. DATOS INICIALES - TIPOS CONSTRUCTIVOS
-- =========================================================

INSERT INTO tipos_constructivos
(nombre, rubro, unidad_calculo, descripcion)
VALUES
(
    'Mampostería de ladrillos huecos 12x18x33 - espesor 0.15 m',
    'Mampostería',
    'm2',
    'Mampostería de ladrillos huecos de 12x18x33 cm y 0.15 m de espesor'
),
(
    'Mampostería de ladrillos comunes - espesor 0.15 m',
    'Mampostería',
    'm2',
    'Mampostería de ladrillos comunes de 0.15 m de espesor'
),
(
    'Contrapiso de hormigón de cascotes - espesor 0.10 m',
    'Contrapisos',
    'm2',
    'Contrapiso de hormigón de cascotes de 0.10 m de espesor'
);


-- =========================================================
-- 9. DATOS INICIALES - MATERIALES
-- =========================================================

INSERT INTO materiales
(nombre, unidad_medida, precio_unitario, fecha_actualizacion_precio)
VALUES
('Ladrillo hueco 12x18x33', 'unidad', NULL, NULL),
('Ladrillo común', 'unidad', NULL, NULL),
('Cemento', 'kg', NULL, NULL),
('Cal hidráulica', 'kg', NULL, NULL),
('Arena', 'm3', NULL, NULL),
('Cascote de ladrillo', 'm3', NULL, NULL);


-- =========================================================
-- 10. DATOS INICIALES - MANO DE OBRA
-- =========================================================

INSERT INTO mano_obra
(nombre, unidad_medida, precio_hora, fecha_actualizacion_precio)
VALUES
('Oficial albañil', 'hora', NULL, NULL),
('Ayudante', 'hora', NULL, NULL);


-- =========================================================
-- 11. RENDIMIENTOS DE MATERIALES
-- =========================================================

-- Mampostería de ladrillos huecos.
INSERT INTO requerimientos_material
(id_tipo, id_material, rendimiento_unitario)
VALUES
(1, 1, 16.0000),
(1, 3, 3.1000),
(1, 4, 6.1000),
(1, 5, 0.0350);


-- Mampostería de ladrillos comunes.
INSERT INTO requerimientos_material
(id_tipo, id_material, rendimiento_unitario)
VALUES
(2, 2, 60.0000),
(2, 3, 5.1000),
(2, 4, 12.0000),
(2, 5, 0.0430);


-- Contrapiso de hormigón de cascotes.
INSERT INTO requerimientos_material
(id_tipo, id_material, rendimiento_unitario)
VALUES
(3, 3, 11.0000),
(3, 4, 26.0000),
(3, 5, 0.0900),
(3, 6, 0.1100);


-- =========================================================
-- 12. RENDIMIENTOS DE MANO DE OBRA
-- =========================================================

-- Mampostería de ladrillos huecos.
INSERT INTO requerimientos_mano_obra
(id_tipo, id_mano_obra, horas_por_unidad)
VALUES
(1, 1, 1.0000),
(1, 2, 0.7000);


-- Mampostería de ladrillos comunes.
INSERT INTO requerimientos_mano_obra
(id_tipo, id_mano_obra, horas_por_unidad)
VALUES
(2, 1, 1.3000),
(2, 2, 1.1000);


-- Contrapiso de hormigón de cascotes.
INSERT INTO requerimientos_mano_obra
(id_tipo, id_mano_obra, horas_por_unidad)
VALUES
(3, 1, 0.4500),
(3, 2, 0.8500);