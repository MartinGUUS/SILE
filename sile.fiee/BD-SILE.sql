drop database if exists SILE;

create database if not exists SILE;

use SILE;

drop table if exists roles;

create table if not exists roles (
    id_rol int auto_increment primary key,
    nombre varchar(50) not null,
    descripcion varchar(100),
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

insert into
    roles (nombre, descripcion)
values (
        'Administrador',
        'Administrador del sistema'
    ),
    (
        'Servicio social',
        'Usuario del sistema'
    ),
    (
        'Personal de confianza',
        'Usuario del sistema'
    );

drop table if exists usuarios;

create table if not exists usuarios (
    id_usuario int auto_increment primary key,
    nombre varchar(50) not null,
    apellido varchar(50) not null,
    correo varchar(50) not null,
    contrasena varchar(150) not null,
    fk_rol int not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    foreign key (fk_rol) references roles (id_rol)
);

drop table if exists areas;

create table if not exists areas (
    id_area varchar(50) primary key,
    nombre varchar(50) not null,
    descripcion varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists presentacion;

create table if not exists presentacion (
    id_presentacion varchar(50) primary key,
    nombre varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists lineas;

create table if not exists lineas (
    id_linea varchar(50) primary key,
    nombre varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists marcas;

create table if not exists marcas (
    id_marca varchar(50) primary key,
    nombre varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists provedores;

create table if not exists provedores (
    id_provedor varchar(50) primary key,
    nombre varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists activos;

create table if not exists activos (
    no_activo varchar(15) primary key,
    nombre varchar(50) not null,
    descripcion varchar(50) not null,
    precio decimal(10, 2),
    existencias int not null,
    garantia varchar(50) not null,
    n_serie varchar(50) not null,
    fk_provedor varchar(50) not null,
    fk_marca varchar(50) not null,
    fk_linea varchar(50) not null,
    fk_presentacion varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    creado_por int not null,
    ultimo_actualizado_por int not null,
    foreign key (fk_provedor) references provedores (id_provedor),
    foreign key (fk_marca) references marcas (id_marca),
    foreign key (fk_linea) references lineas (id_linea),
    foreign key (fk_presentacion) references presentacion (id_presentacion),
    foreign key (creado_por) references usuarios (id_usuario),
    foreign key (ultimo_actualizado_por) references usuarios (id_usuario)
);

drop table if exists fotos;

create table if not exists fotos (
    id_foto int auto_increment primary key,
    fk_activo varchar(15) not null,
    foto varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    creado_por int not null,
    ultimo_actualizado_por int not null,
    foreign key (fk_activo) references activos (no_activo),
    foreign key (creado_por) references usuarios (id_usuario),
    foreign key (ultimo_actualizado_por) references usuarios (id_usuario)
);

drop table if exists resguardantes;

create table if not exists resguardantes (
    id_resguardante int auto_increment primary key,
    nombres varchar(50) not null,
    apellidos varchar(50) not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists asignaciones;

create table if not exists asignaciones (
    id_asignaciones int not null AUTO_INCREMENT primary key,
    fk_activo varchar(15) not null,
    fk_area varchar(50) not null,
    fk_resguardante int not null,
    estado int not null default 1,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    creado_por int not null,
    ultimo_actualizado_por int not null,
    foreign key (fk_activo) references activos (no_activo),
    foreign key (fk_area) references areas (id_area),
    foreign key (fk_resguardante) references resguardantes (id_resguardante),
    foreign key (ultimo_actualizado_por) references usuarios (id_usuario)
);

-- ==========================================
-- INSERT DE DATOS CATÁLOGO REQUERIDOS (PARA PRODUCTOS/ACTIVOS)
-- ==========================================

-- 1. Áreas
INSERT IGNORE INTO
    areas (id_area, nombre, descripcion)
VALUES (
        'A-001',
        'Laboratorio de Cómputo',
        'Área principal de sistemas y programación'
    ),
    (
        'A-002',
        'Taller de Electrónica',
        'Prácticas y ensamblaje de circuitos'
    );

-- 2. Presentación
INSERT IGNORE INTO
    presentacion (id_presentacion, nombre)
VALUES ('P-CAJA', 'En caja'),
    ('P-UNID', 'Unidad suelta'),
    (
        'P-KIT',
        'Paquete / Kit completo'
    );

-- 3. Líneas
INSERT IGNORE INTO
    lineas (id_linea, nombre)
VALUES (
        'L-COMP',
        'Computación y Sistemas'
    ),
    (
        'L-ELEC',
        'Herramienta y Electrónica'
    );

-- 4. Marcas
INSERT IGNORE INTO
    marcas (id_marca, nombre)
VALUES ('M-DELL', 'Dell Technologies'),
    ('M-FLUKE', 'Fluke Networks'),
    ('M-HP', 'Hewlett-Packard');

-- 5. Proveedores
INSERT IGNORE INTO
    provedores (id_provedor, nombre)
VALUES (
        'PRV-001',
        'Soluciones Tecnológicas S.A de C.V'
    ),
    (
        'PRV-002',
        'Electrónica Global Monterrey'
    );

-- 7. Los Activos (Productos)
INSERT IGNORE INTO
    activos (
        no_activo,
        nombre,
        descripcion,
        precio,
        existencias,
        garantia,
        n_serie,
        fk_provedor,
        fk_marca,
        fk_linea,
        fk_presentacion,
        creado_por,
        ultimo_actualizado_por
    )
VALUES (
        'ACT-10001',
        'Computadora Optiplex 7000',
        'PC i7 16GB RAM 512GB SSD',
        18500.00,
        15,
        '12 Meses',
        'SN-DELL-88223',
        'PRV-001',
        'M-DELL',
        'L-COMP',
        'P-CAJA',
        1,
        1
    ),
    (
        'ACT-10002',
        'Multímetro Fluke 87V',
        'Multímetro digital industrial RMS',
        8500.00,
        4,
        '36 Meses',
        'SN-FL-9911X',
        'PRV-002',
        'M-FLUKE',
        'L-ELEC',
        'P-UNID',
        1,
        1
    );