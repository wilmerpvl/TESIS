CREATE DATABASE sistema_muebles;
USE sistema_muebles;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    rol ENUM('ADMIN','DUENO','EMPLEADO') NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    identificacion VARCHAR(20),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(150)
);

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    correo VARCHAR(100)
);


CREATE TABLE tableros (
    id_tablero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150),
    tipo ENUM('MELAMINA','MDF','TRIPLEX'),
    color VARCHAR(100),
    textura VARCHAR(100),
    ancho DECIMAL(10,2),
    alto DECIMAL(10,2),
    espesor DECIMAL(10,2),
    precio_tablero DECIMAL(10,2),
    costo_corte DECIMAL(10,2),
    id_proveedor INT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_proveedor)
    REFERENCES proveedores(id_proveedor)
);


CREATE TABLE accesorios (
    id_accesorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    categoria VARCHAR(50),
    material VARCHAR(50),
    tamano VARCHAR(50),
    color VARCHAR(50),
    precio_unitario DECIMAL(10,2),
    id_proveedor INT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_proveedor)
    REFERENCES proveedores(id_proveedor)
);


CREATE TABLE tipos_mueble (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);


CREATE TABLE secciones_mueble (
    id_seccion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);


CREATE TABLE modulos (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT,
    id_seccion INT,
    nombre VARCHAR(100),
    descripcion TEXT,
    FOREIGN KEY (id_tipo)
    REFERENCES tipos_mueble(id_tipo),
    FOREIGN KEY (id_seccion)
    REFERENCES secciones_mueble(id_seccion)
);


CREATE TABLE piezas_modulo (
    id_pieza INT AUTO_INCREMENT PRIMARY KEY,
    id_modulo INT,
    nombre VARCHAR(100),
    obligatorio BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_modulo)
    REFERENCES modulos(id_modulo)
);


CREATE TABLE cotizaciones (
    id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    id_tipo INT,
    fecha DATE,
    total_tableros DECIMAL(10,2),
    total_accesorios DECIMAL(10,2),
    mano_obra DECIMAL(10,2),
    transporte DECIMAL(10,2),
    total_final DECIMAL(10,2),
    estado ENUM(
        'PENDIENTE',
        'APROBADA',
        'RECHAZADA'
    ) DEFAULT 'PENDIENTE',
    FOREIGN KEY (id_cliente)
    REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tipo)
    REFERENCES tipos_mueble(id_tipo)
);

CREATE TABLE detalle_modulos_cotizacion (
    id_detalle_modulo INT AUTO_INCREMENT PRIMARY KEY,
    id_cotizacion INT,
    id_modulo INT,
    cantidad INT,
    FOREIGN KEY (id_cotizacion)
    REFERENCES cotizaciones(id_cotizacion),
    FOREIGN KEY (id_modulo)
    REFERENCES modulos(id_modulo)
);


CREATE TABLE detalle_piezas_cotizacion (
    id_detalle_pieza INT AUTO_INCREMENT PRIMARY KEY,
    id_cotizacion INT,
    id_modulo INT,
    id_pieza INT,
    id_tablero INT,
    ancho DECIMAL(10,2),
    alto DECIMAL(10,2),
    cantidad INT,
    costo DECIMAL(10,2),
    observacion TEXT,
    FOREIGN KEY (id_cotizacion)
    REFERENCES cotizaciones(id_cotizacion),
    FOREIGN KEY (id_modulo)
    REFERENCES modulos(id_modulo),
    FOREIGN KEY (id_pieza)
    REFERENCES piezas_modulo(id_pieza),
    FOREIGN KEY (id_tablero)
    REFERENCES tableros(id_tablero)
);


CREATE TABLE detalle_accesorios_cotizacion (
    id_detalle_accesorio INT AUTO_INCREMENT PRIMARY KEY,
    id_cotizacion INT,
    id_accesorio INT,
    cantidad INT,
    subtotal DECIMAL(10,2),
    FOREIGN KEY (id_cotizacion)
    REFERENCES cotizaciones(id_cotizacion),
    FOREIGN KEY (id_accesorio)
    REFERENCES accesorios(id_accesorio)
);


CREATE TABLE trabajos (
    id_trabajo INT AUTO_INCREMENT PRIMARY KEY,
    id_cotizacion INT,
    fecha_inicio DATE,
    fecha_estimada DATE,
    fecha_fin DATE,
    prioridad ENUM(
        'BAJA',
        'MEDIA',
        'ALTA'
    ) DEFAULT 'MEDIA',
    estado ENUM(
        'EN_PROCESO',
        'COMPLETADO'
    ) DEFAULT 'EN_PROCESO',
    FOREIGN KEY (id_cotizacion)
    REFERENCES cotizaciones(id_cotizacion)
);


CREATE TABLE trabajo_empleado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_trabajo INT,
    id_empleado INT,
    FOREIGN KEY (id_trabajo)
    REFERENCES trabajos(id_trabajo),
    FOREIGN KEY (id_empleado)
    REFERENCES usuarios(id_usuario)
);


CREATE TABLE avances (
    id_avance INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    porcentaje INT,
    descripcion TEXT,
	id_trabajo INT,
    fecha DATE,
    FOREIGN KEY (id_trabajo)
    REFERENCES trabajos(id_trabajo)
);



CREATE TABLE evidencias (
    id_evidencia INT AUTO_INCREMENT PRIMARY KEY,
    id_avance INT,
    url_imagen VARCHAR(255),
    FOREIGN KEY (id_avance)
    REFERENCES avances(id_avance)
);


CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario),
    detalle TEXT
);

INSERT INTO usuarios(nombre,email,password,rol) VALUES
('Administrador','admin@sistema.com','123456','ADMIN'),
('Darwin','dueno@sistema.com','123456','DUENO'),
('Empleado','empleado@sistema.com','123456','EMPLEADO');


INSERT INTO clientes(nombre,identificacion,telefono,correo,direccion) VALUES
('Juan Perez','0911111111','0999999999','juan@gmail.com','Guayaquil'),
('Maria Vera','0922222222','0988888888','maria@gmail.com','Durán');


INSERT INTO proveedores(nombre,telefono,direccion,correo) VALUES
('EDIMCA','0999999999','Guayaquil','ventas@edimca.com'),
('NOVOCENTRO','0888888888','Guayaquil','ventas@novocentro.com');


INSERT INTO tipos_mueble(nombre,descripcion) VALUES
('Closet','Closets personalizados'),
('Cocina','Muebles y anaqueles de cocina'),
('Escritorio','Escritorios personalizados'),
('Mueble TV','Centros de entretenimiento'),
('Repisas','Repisas decorativas');


INSERT INTO secciones_mueble(nombre) VALUES
('SUPERIOR'),
('CENTRAL'),
('INFERIOR');


INSERT INTO modulos(id_tipo,id_seccion,nombre,descripcion) VALUES

-- SUPERIOR
(1,1,'Maletero Superior','Espacio superior para maletas, sabanas o cajas'),

-- CENTRAL
(1,2,'Modulo Perchero','Modulo central para ropa colgada'),
(1,2,'Modulo Cajonera','Modulo de cajones para ropa'),
(1,2,'Modulo Mixto','Perchero con cajones'),

-- INFERIOR
(1,3,'Zapatera Abierta','Zapatera sin puertas'),
(1,3,'Zapatera con Puerta','Zapatera con puertas');


INSERT INTO modulos(id_tipo,id_seccion,nombre,descripcion) VALUES

-- SUPERIOR
(2,1,'Modulo Suspendido','Anaquel superior de cocina'),
(2,1,'Modulo Esquinero Superior','Modulo esquinero superior'),

-- CENTRAL
(2,2,'Modulo Microondas','Modulo para microondas'),
(2,2,'Modulo Decorativo','Modulo con repisas decorativas'),

-- INFERIOR
(2,3,'Modulo Inferior','Modulo inferior de cocina'),
(2,3,'Modulo Tacho Basura','Modulo para tacho de basura'),
(2,3,'Modulo Esquinero Inferior','Modulo esquinero inferior');



INSERT INTO modulos(id_tipo,id_seccion,nombre,descripcion) VALUES

-- SUPERIOR
(3,1,'Repisas Laterales','Repisas laterales decorativas'),

-- CENTRAL
(3,2,'Tablero Escritorio','Superficie principal del escritorio'),

-- INFERIOR
(3,3,'Cajonera Abierta','Cajonera sin puerta'),
(3,3,'Cajonera con Puerta','Cajonera con puerta');



INSERT INTO modulos(id_tipo,id_seccion,nombre,descripcion) VALUES

-- SUPERIOR
(4,1,'Panel TV','Panel decorativo para television'),
(4,1,'Repisas Superiores','Repisas decorativas superiores'),

-- CENTRAL
(4,2,'Vinera','Modulo para bebidas'),
(4,2,'Modulo Decorativo Abierto','Repisas decorativas abiertas'),
(4,2,'Modulo Decorativo con Puerta','Modulo decorativo con puertas'),
(4,2,'Repisas Laterales','Repisas laterales decorativas'),

-- INFERIOR
(4,3,'Modulo Base TV','Modulo inferior principal'),
(4,3,'Modulo Base con Puerta','Modulo inferior con puertas'),
(4,3,'Modulo Base Abierto','Modulo inferior abierto');


INSERT INTO modulos(id_tipo,id_seccion,nombre,descripcion) VALUES

(5,2,'Repisas Flotantes','Repisas decorativas flotantes'),
(5,2,'Repisas Esquineras','Repisas para esquinas'),
(5,2,'Repisas Verticales','Repisas verticales modernas'),
(5,2,'Repisas Redondas','Repisas decorativas curvas');


INSERT INTO piezas_modulo(id_modulo,nombre,obligatorio) VALUES

-- MALETERO SUPERIOR
(1,'Lateral Derecho',TRUE),
(1,'Lateral Izquierdo',TRUE),
(1,'Superior',TRUE),
(1,'Inferior',TRUE),
(1,'Fondo',FALSE),
(1,'Puertas',FALSE),

-- MODULO PERCHERO
(2,'Lateral Derecho',TRUE),
(2,'Lateral Izquierdo',TRUE),
(2,'Superior',TRUE),
(2,'Inferior',TRUE),
(2,'Fondo',FALSE),
(2,'Puertas',FALSE),

-- MODULO CAJONERA
(3,'Lateral Derecho',TRUE),
(3,'Lateral Izquierdo',TRUE),
(3,'Superior',TRUE),
(3,'Inferior',TRUE),
(3,'Fondo',FALSE),
(3,'Cajones',TRUE),
(3,'Puertas',FALSE),

-- MODULO MIXTO
(4,'Lateral Derecho',TRUE),
(4,'Lateral Izquierdo',TRUE),
(4,'Superior',TRUE),
(4,'Inferior',TRUE),
(4,'Division',FALSE),
(4,'Cajones',FALSE),
(4,'Puertas',FALSE),

-- ZAPATERA ABIERTA
(5,'Lateral Derecho',TRUE),
(5,'Lateral Izquierdo',TRUE),
(5,'Superior',TRUE),
(5,'Inferior',TRUE),
(5,'Repisas',TRUE),
(5,'Fondo',FALSE),

-- ZAPATERA CON PUERTA
(6,'Lateral Derecho',TRUE),
(6,'Lateral Izquierdo',TRUE),
(6,'Superior',TRUE),
(6,'Inferior',TRUE),
(6,'Repisas',TRUE),
(6,'Fondo',FALSE),
(6,'Puertas',TRUE);



INSERT INTO piezas_modulo(id_modulo,nombre,obligatorio) VALUES

-- MODULO SUSPENDIDO
(7,'Lateral Derecho',TRUE),
(7,'Lateral Izquierdo',TRUE),
(7,'Superior',TRUE),
(7,'Inferior',TRUE),
(7,'Fondo',FALSE),
(7,'Puertas',FALSE),
(7,'Repisas',FALSE),

-- ESQUINERO SUPERIOR
(8,'Laterales',TRUE),
(8,'Superior',TRUE),
(8,'Inferior',TRUE),
(8,'Fondo',FALSE),
(8,'Puertas',FALSE),

-- MODULO MICROONDAS
(9,'Laterales',TRUE),
(9,'Superior',TRUE),
(9,'Inferior',TRUE),
(9,'Base',TRUE),
(9,'Fondo',FALSE),

-- MODULO DECORATIVO
(10,'Laterales',TRUE),
(10,'Superior',TRUE),
(10,'Inferior',TRUE),
(10,'Repisas',TRUE),

-- MODULO INFERIOR
(11,'Lateral Derecho',TRUE),
(11,'Lateral Izquierdo',TRUE),
(11,'Superior',TRUE),
(11,'Inferior',TRUE),
(11,'Fondo',FALSE),
(11,'Puertas',FALSE),
(11,'Repisas',FALSE),

-- MODULO TACHO BASURA
(12,'Laterales',TRUE),
(12,'Superior',TRUE),
(12,'Inferior',TRUE),
(12,'Puerta',TRUE),

-- ESQUINERO INFERIOR
(13,'Laterales',TRUE),
(13,'Superior',TRUE),
(13,'Inferior',TRUE),
(13,'Puertas',FALSE);



INSERT INTO piezas_modulo(id_modulo,nombre,obligatorio) VALUES

-- REPISAS LATERALES
(14,'Laterales',TRUE),
(14,'Repisas',TRUE),

-- TABLERO ESCRITORIO
(15,'Tablero Superior',TRUE),
(15,'Laterales',FALSE),

-- CAJONERA ABIERTA
(16,'Laterales',TRUE),
(16,'Superior',TRUE),
(16,'Inferior',TRUE),
(16,'Cajones',TRUE),

-- CAJONERA CON PUERTA
(17,'Laterales',TRUE),
(17,'Superior',TRUE),
(17,'Inferior',TRUE),
(17,'Cajones',TRUE),
(17,'Puerta',TRUE);


INSERT INTO piezas_modulo(id_modulo,nombre,obligatorio) VALUES

-- PANEL TV
(18,'Panel Principal',TRUE),

-- REPISAS SUPERIORES
(19,'Laterales',TRUE),
(19,'Repisas',TRUE),

-- VINERA
(20,'Laterales',TRUE),
(20,'Divisiones',TRUE),
(20,'Base',TRUE),
(20,'Fondo',FALSE),

-- MODULO DECORATIVO ABIERTO
(21,'Laterales',TRUE),
(21,'Superior',TRUE),
(21,'Inferior',TRUE),
(21,'Repisas',TRUE),

-- MODULO DECORATIVO CON PUERTA
(22,'Laterales',TRUE),
(22,'Superior',TRUE),
(22,'Inferior',TRUE),
(22,'Puertas',TRUE),
(22,'Repisas',FALSE),

-- REPISAS LATERALES
(23,'Laterales',TRUE),
(23,'Repisas',TRUE),

-- MODULO BASE TV
(24,'Laterales',TRUE),
(24,'Superior',TRUE),
(24,'Inferior',TRUE),
(24,'Fondo',FALSE),

-- MODULO BASE CON PUERTA
(25,'Laterales',TRUE),
(25,'Superior',TRUE),
(25,'Inferior',TRUE),
(25,'Puertas',TRUE),
(25,'Fondo',FALSE),

-- MODULO BASE ABIERTO
(26,'Laterales',TRUE),
(26,'Superior',TRUE),
(26,'Inferior',TRUE),
(26,'Repisas',TRUE);



INSERT INTO piezas_modulo(id_modulo,nombre,obligatorio) VALUES

-- REPISAS FLOTANTES
(27,'Tabla Principal',TRUE),
(27,'Soportes',TRUE),

-- REPISAS ESQUINERAS
(28,'Tabla Esquinera',TRUE),
(28,'Soportes',TRUE),

-- REPISAS VERTICALES
(29,'Laterales',TRUE),
(29,'Repisas',TRUE),

-- REPISAS REDONDAS
(30,'Base Circular',TRUE),
(30,'Soporte',TRUE);



INSERT INTO tableros 
(nombre,tipo,color,textura,ancho,alto,espesor,precio_tablero,costo_corte,id_proveedor)
VALUES

('Melamina Blanco Edimca','MELAMINA','Blanco','Liso',244,214,15,35,2,1),
('Melamina Roble Natural Edimca','MELAMINA','Roble Natural','Madera',244,214,15,39,2,1),
('Melamina Cedro Merak Edimca','MELAMINA','Cedro Merak','Madera',244,214,15,40,2,1),
('Melamina Gris Ideal Edimca','MELAMINA','Gris Ideal','Liso',244,214,15,38,2,1),
('Melamina Canela Nuez Edimca','MELAMINA','Canela Nuez','Madera',244,214,15,41,2,1),

('MDF Blanco Edimca','MDF','Blanco','Liso',244,214,15,45,2.5,1),
('MDF Roble Chic Edimca','MDF','Roble Chic','Madera',244,214,15,49,2.5,1),
('MDF Encino Marrón Edimca','MDF','Encino Marrón','Madera',244,214,15,50,2.5,1),
('MDF Seike Titanio Edimca','MDF','Seike Titanio','Madera',244,214,15,52,2.5,1),
('MDF Visón Verde Silvestre Edimca','MDF','Visón Verde','Madera',244,214,15,51,2.5,1),

('Melamina Blanco Novocentro','MELAMINA','Blanco','Liso',244,214,15,36,2,2),
('Melamina Roble Gris Novocentro','MELAMINA','Roble Gris','Madera',244,214,15,40,2,2),
('Melamina Capri Novocentro','MELAMINA','Capri','Madera',244,214,15,41,2,2),
('Melamina Bellota Novocentro','MELAMINA','Bellota','Madera',244,214,15,42,2,2),
('Melamina Toquilla Novocentro','MELAMINA','Toquilla','Madera',244,214,15,39,2,2),

('MDF Blanco Novocentro','MDF','Blanco','Liso',244,214,15,46,2.5,2),
('MDF Milano Novocentro','MDF','Milano','Madera',244,214,15,50,2.5,2),
('MDF Espresso Novocentro','MDF','Espresso','Madera',244,214,15,52,2.5,2),
('MDF Roble Negro Novocentro','MDF','Roble Negro','Madera',244,214,15,53,2.5,2),
('MDF Ágave Novocentro','MDF','Ágave','Madera',244,214,15,51,2.5,2),

('Triplex Natural Edimca','TRIPLEX','Natural','Natural',244,214,18,55,3,1),
('Triplex Crudo Novocentro','TRIPLEX','Crudo','Natural',244,214,18,57,3,2);


INSERT INTO accesorios
(nombre,categoria,material,tamano,color,precio_unitario,id_proveedor)
VALUES

('Bisagra Recta','Bisagra','Acero','35mm','Plata',3.50,1),
('Bisagra Cierre Lento','Bisagra','Acero','35mm','Plata',5.50,1),
('Riel Telescopico','Riel','Acero','40cm','Plata',8.00,1),
('Agarradera Negra','Agarradera','Aluminio','12cm','Negro',5.00,2),
('Agarradera Dorada','Agarradera','Aluminio','15cm','Dorado',6.50,2),
('Tornillo Zincado','Tornillo','Acero','2 pulgadas','Gris',2.50,1),
('Bordo PVC Blanco','Bordo PVC','PVC','18mm','Blanco',0.35,1),
('Bordo PVC Negro','Bordo PVC','PVC','22mm','Negro',0.45,1);