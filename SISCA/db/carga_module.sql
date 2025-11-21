-- ============================================================
-- SQL PARA MÓDULO DE CARGA ACADÉMICA - SISCA
-- ============================================================
-- Este script crea las tablas necesarias para el módulo de carga académica
-- Incluye soporte para plantillas (guardar trabajo en progreso)
-- ============================================================

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `carga_academica`
-- Almacena las cargas académicas asignadas a los docentes
--

CREATE TABLE IF NOT EXISTS `carga_academica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL COMMENT 'FK a periodos',
  `docente_id` int(11) NOT NULL COMMENT 'FK a docentes',
  `grupo_id` int(11) NOT NULL COMMENT 'FK a grupos',
  `materia_id` int(11) NOT NULL COMMENT 'FK a programa_materias',
  `turno` enum('Matutino','Vespertino','Mixto') NOT NULL DEFAULT 'Matutino',
  `horas` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas totales de la materia',
  `horas_clase` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas frente a grupo',
  `horas_tutoria` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas de tutoría',
  `horas_estadia` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas de estadía',
  `actividades_administrativas` varchar(255) DEFAULT NULL COMMENT 'Descripción de actividades administrativas (ej: LP, Coordinación)',
  `total_horas_asignadas` int(11) GENERATED ALWAYS AS (`horas_clase` + `horas_tutoria` + `horas_estadia`) STORED COMMENT 'Total calculado automáticamente',
  `estado` enum('activo','eliminado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_creacion` int(11) DEFAULT NULL COMMENT 'FK a usuarios - quien creó el registro',
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_docente` (`docente_id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_materia` (`materia_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_periodo_estado` (`periodo_id`, `estado`),
  CONSTRAINT `fk_carga_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_docente` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_materia` FOREIGN KEY (`materia_id`) REFERENCES `programa_materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_usuario` FOREIGN KEY (`usuario_creacion`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena las cargas académicas de los docentes por periodo';

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `carga_plantillas`
-- Almacena plantillas temporales para continuar trabajo en progreso
--

CREATE TABLE IF NOT EXISTS `carga_plantillas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_plantilla` varchar(100) NOT NULL COMMENT 'Nombre descriptivo de la plantilla',
  `descripcion` varchar(255) DEFAULT NULL COMMENT 'Descripción opcional de la plantilla',
  `periodo_id` int(11) NOT NULL COMMENT 'FK a periodos',
  `usuario_id` int(11) NOT NULL COMMENT 'FK a usuarios - dueño de la plantilla',
  `datos_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`datos_json`)) COMMENT 'Datos de la plantilla en formato JSON',
  `estado` enum('activo','eliminado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_usuario_periodo` (`usuario_id`, `periodo_id`, `estado`),
  CONSTRAINT `fk_plantilla_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_plantilla_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plantillas temporales para guardar trabajo en progreso';

-- --------------------------------------------------------
--
-- Índices adicionales para optimización de consultas
--

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX `idx_carga_busqueda` ON `carga_academica` (`periodo_id`, `docente_id`, `estado`);

-- Índice para reportes por grupo
CREATE INDEX `idx_carga_grupo_periodo` ON `carga_academica` (`grupo_id`, `periodo_id`, `estado`);

-- --------------------------------------------------------
--
-- Vista para consultas simplificadas de carga académica
-- Une toda la información relevante en una sola consulta
--

CREATE OR REPLACE VIEW `vista_carga_academica` AS
SELECT
    ca.id,
    ca.periodo_id,
    CONCAT(p.periodo, ' (', p.año, ')') AS periodo_texto,
    ca.docente_id,
    d.nombre_docente,
    d.turno AS turno_docente,
    d.regimen AS regimen_docente,
    ca.grupo_id,
    g.codigo_grupo,
    ca.materia_id,
    pm.cve_materia,
    pm.nombre_materia,
    pm.horas_semanales AS horas_materia_plan,
    ca.turno,
    ca.horas,
    ca.horas_clase,
    ca.horas_tutoria,
    ca.horas_estadia,
    ca.actividades_administrativas,
    ca.total_horas_asignadas,
    ca.estado,
    ca.fecha_creacion,
    ca.fecha_modificacion,
    u.nombre AS usuario_creacion_nombre
FROM
    carga_academica ca
    INNER JOIN periodos p ON ca.periodo_id = p.id
    INNER JOIN docentes d ON ca.docente_id = d.id
    INNER JOIN grupos g ON ca.grupo_id = g.id
    INNER JOIN programa_materias pm ON ca.materia_id = pm.id
    LEFT JOIN usuarios u ON ca.usuario_creacion = u.id
WHERE
    ca.estado = 'activo'
ORDER BY
    d.nombre_docente ASC,
    ca.fecha_creacion DESC;

-- --------------------------------------------------------
--
-- Vista para estadísticas de carga por docente
--

CREATE OR REPLACE VIEW `vista_estadisticas_carga_docente` AS
SELECT
    ca.periodo_id,
    CONCAT(p.periodo, ' (', p.año, ')') AS periodo_texto,
    ca.docente_id,
    d.nombre_docente,
    d.turno AS turno_docente,
    d.regimen,
    COUNT(ca.id) AS total_asignaturas,
    SUM(ca.horas) AS total_horas_materias,
    SUM(ca.horas_clase) AS total_horas_clase,
    SUM(ca.horas_tutoria) AS total_horas_tutoria,
    SUM(ca.horas_estadia) AS total_horas_estadia,
    SUM(ca.total_horas_asignadas) AS total_horas_general,
    GROUP_CONCAT(DISTINCT ca.actividades_administrativas SEPARATOR ', ') AS actividades_admin
FROM
    carga_academica ca
    INNER JOIN periodos p ON ca.periodo_id = p.id
    INNER JOIN docentes d ON ca.docente_id = d.id
WHERE
    ca.estado = 'activo'
    AND d.estado = 'activo'
GROUP BY
    ca.periodo_id,
    ca.docente_id,
    p.periodo,
    p.año,
    d.nombre_docente,
    d.turno,
    d.regimen
ORDER BY
    d.nombre_docente ASC;

-- --------------------------------------------------------
--
-- Triggers para validaciones automáticas
--

DELIMITER $$

-- Trigger para validar que las horas no sean negativas
CREATE TRIGGER `before_insert_carga_academica`
BEFORE INSERT ON `carga_academica`
FOR EACH ROW
BEGIN
    IF NEW.horas < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas no pueden ser negativas';
    END IF;

    IF NEW.horas_clase < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de clase no pueden ser negativas';
    END IF;

    IF NEW.horas_tutoria < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de tutoría no pueden ser negativas';
    END IF;

    IF NEW.horas_estadia < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de estadía no pueden ser negativas';
    END IF;
END$$

-- Trigger para validar actualizaciones
CREATE TRIGGER `before_update_carga_academica`
BEFORE UPDATE ON `carga_academica`
FOR EACH ROW
BEGIN
    IF NEW.horas < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas no pueden ser negativas';
    END IF;

    IF NEW.horas_clase < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de clase no pueden ser negativas';
    END IF;

    IF NEW.horas_tutoria < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de tutoría no pueden ser negativas';
    END IF;

    IF NEW.horas_estadia < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de estadía no pueden ser negativas';
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

-- Instrucciones de uso:
-- 1. Ejecutar este script en la base de datos 'sisca'
-- 2. Se crearán las tablas: carga_academica y carga_plantillas
-- 3. Se crearán vistas para consultas simplificadas
-- 4. Se crearán triggers para validaciones automáticas
-- 5. Verificar con: SHOW TABLES LIKE 'carga%';
