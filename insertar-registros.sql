-- Insertar datos en prq_parqueo
INSERT INTO prq_parqueo (nombre_provincia, nombre, precio_por_hora) VALUES
('San José', 'Parqueo Principal Centro', 1000.00),
('Alajuela', 'Parqueo Mall Internacional', 800.00);

-- Insertar datos en prq_automoviles
INSERT INTO prq_automoviles (color, anio, fabricante, tipo) VALUES
('Blanco', 2022, 'Toyota', 'sedán'),
('Negro', 2021, 'Honda', 'sedán'),
('Rojo', 2023, 'Nissan', 'sedán'),
('Azul', 2020, 'Hyundai', '4x4'),
('Gris', 2022, 'Mazda', 'sedán');

-- Insertar datos en prq_ingreso_automoviles
-- Primero necesitamos los IDs de los automóviles insertados
-- Asumiendo que los IDs son secuenciales empezando desde 1
INSERT INTO prq_ingreso_automoviles (id_parqueo, id_automovil, fecha_hora_entrada, fecha_hora_salida) VALUES
-- Vehículos que ya salieron
(1, 1, '2025-11-08 08:00:00', '2025-11-08 10:30:00'),
(2, 2, '2025-11-08 09:15:00', '2025-11-08 12:45:00'),
(1, 3, '2025-11-08 10:30:00', '2025-11-08 14:15:00'),
(2, 4, '2025-11-08 11:45:00', '2025-11-08 15:30:00'),
(1, 5, '2025-11-08 12:00:00', '2025-11-08 16:00:00'),
(1, 1, '2025-11-08 13:30:00', '2025-11-08 17:45:00'),
(2, 2, '2025-11-08 14:45:00', '2025-11-08 18:30:00'),
(1, 3, '2025-11-08 15:00:00', '2025-11-08 19:15:00'),
(2, 4, '2025-11-08 16:15:00', '2025-11-08 20:00:00'),
(1, 5, '2025-11-08 17:30:00', '2025-11-08 21:30:00'),

-- Vehículos que aún están en el parqueo (fecha_hora_salida es NULL)
(1, 1, '2025-11-08 18:00:00', NULL),
(2, 2, '2025-11-08 18:15:00', NULL),
(1, 3, '2025-11-08 18:30:00', NULL),
(2, 4, '2025-11-08 18:45:00', NULL),
(1, 5, '2025-11-08 19:00:00', NULL);