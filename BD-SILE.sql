drop database if exists SILE;

create database if not exists SILE;

use SILE;

drop table if exists usuarios;

drop table if exists roles;

create table if not exists roles (
    id_rol int auto_increment primary key,
    nombre varchar(50) not null,
    descripcion varchar(100),
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

create table if not exists usuarios (
    id_usuario int auto_increment primary key,
    nombre varchar(50) not null,
    apellido varchar(50) not null,
    correo varchar(50) not null,
    contrasena varchar(50) not null,
    fk_rol int not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    foreign key (fk_rol) references roles (id_rol)
);

drop table if exists areas;

create table if not exists areas (
    id_area varchar(50) primary key,
    nombre varchar(50) not null,
    descripcion varchar(50) not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists presentacion;

create table if not exists presentacion (
    id_presentacion varchar(50) primary key,
    nombre varchar(50) not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists lineas;

create table if not exists lineas (
    id_linea varchar(50) primary key,
    nombre varchar(50) not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists marcas;

create table if not exists marcas (
    id_marca varchar(50) primary key,
    nombre varchar(50) not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists provedores;

create table if not exists provedores (
    id_provedor varchar(50) primary key,
    nombre varchar(50) not null,
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
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp
);

drop table if exists asignaciones;

create table if not exists asignaciones (
    id_asignaciones int not null AUTO_INCREMENT primary key,
    fk_activo varchar(15) not null,
    fk_area varchar(50) not null,
    fk_resguardante int not null,
    creado_en timestamp default current_timestamp,
    actualizado_en timestamp default current_timestamp on update current_timestamp,
    creado_por int not null,
    ultimo_actualizado_por int not null,
    foreign key (fk_activo) references activos (no_activo),
    foreign key (fk_area) references areas (id_area),
    foreign key (fk_resguardante) references resguardantes (id_resguardante),
    foreign key (creado_por) references usuarios (id_usuario),
    foreign key (ultimo_actualizado_por) references usuarios (id_usuario)
);