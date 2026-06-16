-- ==========================================
-- SILE - Sistema de Inventario
-- Base de Datos
-- ==========================================

DROP DATABASE IF EXISTS SILE;
CREATE DATABASE IF NOT EXISTS SILE;
USE SILE;


-- 1.1 Roles
DROP TABLE IF EXISTS roles;
CREATE TABLE IF NOT EXISTS roles (
    id_rol          INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL,
    descripcion     VARCHAR(100),
    estado          INT          NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.2 Usuarios
DROP TABLE IF EXISTS usuarios;
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario              INT AUTO_INCREMENT PRIMARY KEY,
    nombre                  VARCHAR(50)  NOT NULL,
    apellido                VARCHAR(50)  NOT NULL,
    correo                  VARCHAR(50)  NOT NULL,
    contrasena              VARCHAR(150) NOT NULL,
    fk_rol                  INT          NOT NULL,
    estado                  INT          NOT NULL DEFAULT 1,
    creado_en               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_rol)    REFERENCES roles (id_rol)
);

-- 1.3 Áreas
DROP TABLE IF EXISTS areas;
CREATE TABLE IF NOT EXISTS areas (
    id_area         VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    descripcion     VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.4 Presentaciones
DROP TABLE IF EXISTS presentacion;
CREATE TABLE IF NOT EXISTS presentacion (
    id_presentacion VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.5 Líneas
DROP TABLE IF EXISTS lineas;
CREATE TABLE IF NOT EXISTS lineas (
    id_linea        VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.6 Marcas
DROP TABLE IF EXISTS marcas;
CREATE TABLE IF NOT EXISTS marcas (
    id_marca        VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.7 Proveedores
DROP TABLE IF EXISTS provedores;
CREATE TABLE IF NOT EXISTS provedores (
    id_provedor     VARCHAR(50) PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.8 Resguardantes
DROP TABLE IF EXISTS resguardantes;
CREATE TABLE IF NOT EXISTS resguardantes (
    id_resguardante INT AUTO_INCREMENT PRIMARY KEY,
    nombres         VARCHAR(50) NOT NULL,
    apellidos       VARCHAR(50) NOT NULL,
    estado          INT         NOT NULL DEFAULT 1,
    creado_en       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.9 Activos
DROP TABLE IF EXISTS activos;
CREATE TABLE IF NOT EXISTS activos (
    no_activo               VARCHAR(15)    PRIMARY KEY,
    nombre                  VARCHAR(50)    NOT NULL,
    descripcion             VARCHAR(50)    NOT NULL,
    precio                  DECIMAL(10,2),
    existencias             INT            NOT NULL,
    garantia                VARCHAR(50)    NOT NULL,
    n_serie                 VARCHAR(50)    NOT NULL,
    fk_provedor             VARCHAR(50)    NOT NULL,
    fk_marca                VARCHAR(50)    NOT NULL,
    fk_linea                VARCHAR(50)    NOT NULL,
    fk_presentacion         VARCHAR(50)    NOT NULL,
    estado                  INT            NOT NULL DEFAULT 1,
    creado_en               TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por              INT            NOT NULL,
    ultimo_actualizado_por  INT            NOT NULL,
    FOREIGN KEY (fk_provedor)             REFERENCES provedores (id_provedor),
    FOREIGN KEY (fk_marca)                REFERENCES marcas (id_marca),
    FOREIGN KEY (fk_linea)                REFERENCES lineas (id_linea),
    FOREIGN KEY (fk_presentacion)         REFERENCES presentacion (id_presentacion),
    FOREIGN KEY (creado_por)              REFERENCES usuarios (id_usuario),
    FOREIGN KEY (ultimo_actualizado_por) REFERENCES usuarios (id_usuario)
);

-- 1.10 Fotos
DROP TABLE IF EXISTS fotos;
CREATE TABLE IF NOT EXISTS fotos (
    id_foto                 INT AUTO_INCREMENT PRIMARY KEY,
    fk_activo               VARCHAR(15) NOT NULL,
    foto                    VARCHAR(50) NOT NULL,
    estado                  INT         NOT NULL DEFAULT 1,
    creado_en               TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por              INT         NOT NULL,
    ultimo_actualizado_por  INT         NOT NULL,
    FOREIGN KEY (fk_activo)               REFERENCES activos (no_activo),
    FOREIGN KEY (creado_por)              REFERENCES usuarios (id_usuario),
    FOREIGN KEY (ultimo_actualizado_por) REFERENCES usuarios (id_usuario)
);

-- 1.11 Asignaciones
DROP TABLE IF EXISTS asignaciones;
CREATE TABLE IF NOT EXISTS asignaciones (
    id_asignaciones         INT AUTO_INCREMENT PRIMARY KEY,
    fk_activo               VARCHAR(15) NOT NULL,
    fk_area                 VARCHAR(50) NULL,
    fk_resguardante         INT         NULL,
    estado                  INT         NOT NULL DEFAULT 1,
    creado_en               TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creado_por              INT         NOT NULL,
    ultimo_actualizado_por  INT         NOT NULL,
    FOREIGN KEY (fk_activo)               REFERENCES activos (no_activo),
    FOREIGN KEY (fk_area)                 REFERENCES areas (id_area),
    FOREIGN KEY (fk_resguardante)         REFERENCES resguardantes (id_resguardante),
    FOREIGN KEY (ultimo_actualizado_por) REFERENCES usuarios (id_usuario)
);

-- 1.12 Cambios Pendientes
DROP TABLE IF EXISTS cambios_pendientes;
CREATE TABLE IF NOT EXISTS cambios_pendientes (
    id_cambio       INT AUTO_INCREMENT PRIMARY KEY,
    tipo_cambio     ENUM('CREAR', 'ACTUALIZAR', 'ELIMINAR') NOT NULL,
    entidad         VARCHAR(50)  NOT NULL DEFAULT 'activos',
    id_entidad      VARCHAR(50)  DEFAULT NULL,
    datos_json      JSON         NOT NULL,
    id_solicitante  INT          NOT NULL,
    id_revisor      INT          DEFAULT NULL,
    estado          ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
    comentario      VARCHAR(500) DEFAULT NULL,
    creado_en       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitante) REFERENCES usuarios (id_usuario),
    FOREIGN KEY (id_revisor)     REFERENCES usuarios (id_usuario)
);


-- ==========================================
-- 2. DML - INSERTS DE DATOS
-- ==========================================

-- ------------------------------------------
-- 2.1 Roles
-- ------------------------------------------
INSERT IGNORE INTO roles (id_rol, nombre, descripcion, estado) VALUES
    (1, 'Administrador', 'Control total del sistema',                         1),
    (2, 'Editor',        'Crear, editar y eliminar con flujo de aprobación', 1),
    (3, 'Observador',    'Solo lectura de activos',                           1);


-- ------------------------------------------
-- 2.3 Áreas
-- ------------------------------------------
INSERT IGNORE INTO areas (id_area, nombre, descripcion) VALUES
    ('1',     'N/A',                          ''),
    ('A-001', 'Laboratorio de Cómputo',       'Sistemas y programación'),
    ('A-002', 'Taller de Electrónica',        'Prácticas y ensamblaje de circuitos'),
    ('A-003', 'Almacén General',              'Bodega de equipos y materiales'),
    ('A-004', 'Oficina Administrativa',       'Coordinación y jefatura de carrera'),
    ('A-005', 'Sala de Juntas',               'Reuniones académicas y de personal'),
    ('A-006', 'Laboratorio de Redes',         'Prácticas de telecomunicaciones y cableado'),
    ('A-007', 'Cubículo de Profesores',       'Espacio docente compartido');

-- ------------------------------------------
-- 2.4 Presentaciones
-- ------------------------------------------
INSERT IGNORE INTO presentacion (id_presentacion, nombre) VALUES
    ('P-CAJA',  'En caja'),
    ('P-UNID',  'Unidad suelta'),
    ('P-KIT',   'Paquete / Kit completo'),
    ('P-BOLSA', 'En bolsa'),
    ('P-GRAN',  'A granel'),
    ('P-PAQ',   'Paquete sellado'),
    ('P-ROLL',  'En rollo / carrete');

-- ------------------------------------------
-- 2.5 Líneas
-- ------------------------------------------
INSERT IGNORE INTO lineas (id_linea, nombre) VALUES
    ('L-COMP', 'Computación y Sistemas'),
    ('L-ELEC', 'Herramienta y Electrónica'),
    ('L-RED',  'Redes y Telecomunicaciones'),
    ('L-MOB',  'Mobiliario y Equipo de Oficina'),
    ('L-AUD',  'Audio y Video'),
    ('L-INST', 'Instrumentación y Medición');

-- ------------------------------------------
-- 2.6 Marcas
-- ------------------------------------------
INSERT IGNORE INTO marcas (id_marca, nombre) VALUES
    ('M-DELL',   'Dell Technologies'),
    ('M-FLUKE',  'Fluke Networks'),
    ('M-HP',     'Hewlett-Packard'),
    ('M-LENOVO', 'Lenovo'),
    ('M-CISCO',  'Cisco Systems'),
    ('M-SAMS',   'Samsung Electronics'),
    ('M-STEREN', 'Steren'),
    ('M-INTEL',  'Intel Corporation'),
    ('M-ASUS',   'ASUS'),
    ('M-APC',    'APC by Schneider Electric');

-- ------------------------------------------
-- 2.7 Proveedores
-- ------------------------------------------
INSERT IGNORE INTO provedores (id_provedor, nombre) VALUES
    ('PRV-001', 'Soluciones Tecnológicas S.A. de C.V.'),
    ('PRV-002', 'Electrónica Global Monterrey'),
    ('PRV-003', 'Office Depot de México S.A. de C.V.'),
    ('PRV-004', 'PC Extreme Informática S.A. de C.V.'),
    ('PRV-005', 'Grupo Covix México'),
    ('PRV-006', 'Electrónica y Componentes del Golfo'),
    ('PRV-007', 'Distribuidora Tecnológica del Sureste');

-- ------------------------------------------
-- 2.8 Resguardantes
-- ------------------------------------------
INSERT IGNORE INTO resguardantes (id_resguardante, nombres, apellidos, estado) VALUES
    (1, 'N/A',           '',                   1),
    (2, 'Carlos Alberto', 'Morales Castillo',  1),
    (3, 'Laura Elena',    'Sánchez Díaz',      1),
    (4, 'Pedro',          'Jiménez Torres',    1),
    (5, 'Ana Gabriela',   'Vázquez Ramírez',   1),
    (6, 'Roberto',        'Cruz Mendoza',      1),
    (7, 'Diana Patricia', 'Flores Gómez',      1);


