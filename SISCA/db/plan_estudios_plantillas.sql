-- Tabla para almacenar plantillas de plan de estudios
CREATE TABLE IF NOT EXISTS `plan_estudios_plantillas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_plantilla` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `periodo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `datos_json` longtext NOT NULL COMMENT 'Almacena el array de asignaturas en formato JSON',
  `estado` enum('activo','eliminado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plantillas de plan de estudios por periodo';

-- Agregar restricciones de clave foránea si las tablas relacionadas existen
-- ALTER TABLE `plan_estudios_plantillas`
--   ADD CONSTRAINT `fk_plan_plantillas_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
--   ADD CONSTRAINT `fk_plan_plantillas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
