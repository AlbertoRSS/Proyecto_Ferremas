
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL
);

CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre_marca VARCHAR(100) NOT NULL
);

CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo_producto VARCHAR(50) UNIQUE NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_categoria INT,
    id_marca INT,
    precio DECIMAL(10,2),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca)
);

CREATE TABLE contacto (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(100),
    correo_cliente VARCHAR(100),
    mensaje TEXT,
    fecha_contacto DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE precio_producto (
    id_precio INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    fecha_precio DATETIME DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE tienda (
    id_tienda INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tienda VARCHAR(100) NOT NULL
);

CREATE TABLE inventario_tienda (
    id_tienda INT,
    id_producto INT,
    stock INT DEFAULT 0,
    PRIMARY KEY (id_tienda, id_producto),
    FOREIGN KEY (id_tienda) REFERENCES tienda(id_tienda),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE carrito_temporal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    cantidad INT,
    id_tienda INT,
    session_id VARCHAR(255),
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO categoria (nombre_categoria) VALUES
('Herramientas Manuales'),
('Herramientas Electricas'),
('Materiales de Construccion'),
('Acabados'),
('Equipos de Seguridad');

INSERT INTO marca (nombre_marca) VALUES
('Bosch'),
('Black & Decker'),
('Makita'),
('Stanley'),
('3M');

INSERT INTO producto (codigo_producto, nombre_producto, descripcion, id_categoria, id_marca, precio) VALUES
('FER-0001', 'Martillo de carpintero', 'Martillo de acero con mango de goma antideslizante', 1, 4, 8990.00),
('FER-0002', 'Taladro Percutor Bosch', 'Taladro electrico con percutor de 650W', 2, 1, 45990.00),
('FER-0003', 'Cemento gris 25kg', 'Saco de cemento para construccion', 3, 3, 5990.00),
('FER-0004', 'Pintura blanca 1 galon', 'Pintura latex para interiores', 4, 2, 13990.00),
('FER-0005', 'Casco de seguridad 3M', 'Casco industrial con suspension ajustable', 5, 5, 10990.00);

INSERT INTO precio_producto (id_producto, valor) VALUES
(1, 8990.00),
(2, 45990.00),
(3, 5990.00),
(4, 13990.00),
(5, 10990.00);