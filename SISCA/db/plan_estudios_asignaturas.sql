-- Tabla para almacenar asignaturas del plan de estudios por periodo
CREATE TABLE IF NOT EXISTS `plan_estudios_asignaturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `nivel` enum('TSU','Ing','Lic','I','L') NOT NULL,
  `turno` enum('Matutino','Vespertino','Nocturno') NOT NULL,
  `programa_educativo` varchar(255) NOT NULL,
  `cuatrimestre` tinyint(2) NOT NULL COMMENT 'Grado o cuatrimestre (1-11)',
  `area_conocimiento` varchar(255) DEFAULT NULL COMMENT 'Área del conocimiento',
  `asignatura` varchar(255) NOT NULL COMMENT 'Nombre de la asignatura',
  `horas_total` int(11) NOT NULL COMMENT 'Total de horas',
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_nivel_turno` (`nivel`, `turno`),
  KEY `idx_programa` (`programa_educativo`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asignaturas del plan de estudios por periodo académico';

-- Agregar restricción de clave foránea si la tabla periodos existe
-- ALTER TABLE `plan_estudios_asignaturas`
--   ADD CONSTRAINT `fk_plan_asignaturas_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
