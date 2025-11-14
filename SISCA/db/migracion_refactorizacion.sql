-- =====================================================
-- SCRIPT DE MIGRACIÓN - BASE DE DATOS SISCA
-- Migra la base de datos existente al nuevo esquema refactorizado
-- =====================================================
-- IMPORTANTE: Hacer backup de la base de datos antes de ejecutar
-- mysqldump -u root sisca > backup_sisca_$(date +%Y%m%d_%H%M%S).sql
-- =====================================================

USE sisca;

-- Deshabilitar verificaciones de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- PASO 1: ACTUALIZAR TABLA USUARIOS
-- =====================================================

ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER `contraseña`,
  ADD COLUMN IF NOT EXISTS `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() AFTER `estado`,
  ADD COLUMN IF NOT EXISTS `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `fecha_creacion`;

-- Agregar índices
ALTER TABLE `usuarios`
  ADD INDEX IF NOT EXISTS `idx_area` (`area`),
  ADD INDEX IF NOT EXISTS `idx_estado` (`estado`);

-- =====================================================
-- PASO 2: ACTUALIZAR TABLA PERIODOS
-- =====================================================

ALTER TABLE `periodos`
  ADD COLUMN IF NOT EXISTS `activo` tinyint(1) DEFAULT 1 AFTER `año`,
  ADD COLUMN IF NOT EXISTS `fecha_inicio` date DEFAULT NULL AFTER `activo`,
  ADD COLUMN IF NOT EXISTS `fecha_fin` date DEFAULT NULL AFTER `fecha_inicio`,
  ADD COLUMN IF NOT EXISTS `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() AFTER `fecha_fin`,
  ADD COLUMN IF NOT EXISTS `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `fecha_creacion`;

-- Agregar índices
ALTER TABLE `periodos`
  ADD INDEX IF NOT EXISTS `idx_año` (`año`),
  ADD INDEX IF NOT EXISTS `idx_activo` (`activo`);

-- =====================================================
-- PASO 3: ACTUALIZAR TABLA PROGRAMAS
-- =====================================================

ALTER TABLE `programas`
  ADD COLUMN IF NOT EXISTS `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `fecha_alta`;

-- Agregar índices
ALTER TABLE `programas`
  ADD INDEX IF NOT EXISTS `idx_nomenclatura` (`nomenclatura`),
  ADD INDEX IF NOT EXISTS `idx_nivel` (`nivel`),
  ADD INDEX IF NOT EXISTS `idx_activo` (`activo`);

-- Limpiar programas duplicados (mantener solo el primero de cada nomenclatura)
CREATE TEMPORARY TABLE temp_programas_unicos AS
SELECT MIN(id) as id FROM programas GROUP BY nomenclatura, nivel;

-- Marcar duplicados como inactivos en lugar de eliminarlos
UPDATE programas
SET activo = 0
WHERE id NOT IN (SELECT id FROM temp_programas_unicos);

DROP TEMPORARY TABLE temp_programas_unicos;

-- =====================================================
-- PASO 4: ACTUALIZAR TABLA PROGRAMA_MATERIAS
-- =====================================================

ALTER TABLE `programa_materias`
  ADD COLUMN IF NOT EXISTS `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() AFTER `fecha_alta`;

-- Eliminar constraint antigua si existe
ALTER TABLE `programa_materias` DROP FOREIGN KEY IF EXISTS `fk_programa_mat`;

-- Agregar índices
ALTER TABLE `programa_materias`
  ADD INDEX IF NOT EXISTS `idx_id_programa` (`id_programa`),
  ADD INDEX IF NOT EXISTS `idx_cve_materia` (`cve_materia`),
  ADD INDEX IF NOT EXISTS `idx_grado` (`grado`),
  ADD INDEX IF NOT EXISTS `idx_activo` (`activo`);

-- Agregar constraint mejorada
ALTER TABLE `programa_materias`
  ADD CONSTRAINT `fk_programa_materias_programa`
    FOREIGN KEY (`id_programa`)
    REFERENCES `programas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =====================================================
-- PASO 5: ACTUALIZAR TABLA DOCENTES
-- =====================================================

-- Agregar índices mejorados
ALTER TABLE `docentes`
  ADD INDEX IF NOT EXISTS `idx_nombre` (`nombre_docente`),
  ADD INDEX IF NOT EXISTS `idx_turno` (`turno`),
  ADD INDEX IF NOT EXISTS `idx_regimen` (`regimen`),
  ADD INDEX IF NOT EXISTS `idx_estado` (`estado`),
  ADD INDEX IF NOT EXISTS `idx_docentes_estado_regimen` (`estado`, `regimen`);

-- =====================================================
-- PASO 6: ACTUALIZAR TABLA GRUPOS
-- =====================================================

-- Agregar nuevas columnas
ALTER TABLE `grupos`
  ADD COLUMN IF NOT EXISTS `programa_id` int(11) DEFAULT NULL AFTER `nivel_educativo`;

-- Crear índice temporal para la columna programa_educativo si no existe
ALTER TABLE `grupos`
  ADD INDEX IF NOT EXISTS `idx_programa_educativo_temp` (`programa_educativo`);

-- Mapear programa_educativo a programa_id basándose en nomenclatura
UPDATE grupos g
INNER JOIN programas p ON g.programa_educativo = p.nomenclatura
SET g.programa_id = p.id
WHERE g.programa_id IS NULL AND p.activo = 1;

-- Para grupos sin coincidencia exacta, intentar mapear por nomenclatura similar
UPDATE grupos g
SET g.programa_id = (
  SELECT p.id
  FROM programas p
  WHERE g.programa_educativo LIKE CONCAT('%', p.nomenclatura, '%')
    AND p.activo = 1
  LIMIT 1
)
WHERE g.programa_id IS NULL;

-- Agregar columna periodo_id
ALTER TABLE `grupos`
  ADD COLUMN IF NOT EXISTS `periodo_id` int(11) DEFAULT NULL AFTER `turno`;

-- Asignar el periodo más reciente a grupos activos sin periodo
UPDATE grupos
SET periodo_id = (SELECT id FROM periodos ORDER BY año DESC, id DESC LIMIT 1)
WHERE periodo_id IS NULL AND estado = 'activo';

-- Agregar índices
ALTER TABLE `grupos`
  ADD INDEX IF NOT EXISTS `idx_programa_id` (`programa_id`),
  ADD INDEX IF NOT EXISTS `idx_periodo_id` (`periodo_id`),
  ADD INDEX IF NOT EXISTS `idx_estado` (`estado`),
  ADD INDEX IF NOT EXISTS `idx_grupos_periodo_estado` (`periodo_id`, `estado`);

-- Ahora hacer programa_id NOT NULL solo para grupos activos con programa_id asignado
-- Los grupos sin programa_id válido se pueden marcar como inactivos o mantener NULL temporalmente
ALTER TABLE `grupos`
  MODIFY COLUMN `programa_id` int(11) NOT NULL;

-- Agregar constraints de FK
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_programa`
    FOREIGN KEY (`programa_id`)
    REFERENCES `programas` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- PASO 7: ACTUALIZAR TABLA HORARIOS
-- =====================================================

-- Agregar columna usuario_carga_id
ALTER TABLE `horarios`
  ADD COLUMN IF NOT EXISTS `usuario_carga_id` int(11) DEFAULT NULL AFTER `fecha_modificacion`;

-- Intentar mapear usuario_carga a usuario_carga_id (si hay coincidencias)
UPDATE horarios h
INNER JOIN usuarios u ON h.usuario_carga = u.id
SET h.usuario_carga_id = u.id
WHERE h.usuario_carga_id IS NULL AND h.usuario_carga IS NOT NULL;

-- Eliminar constraint antigua si existe
ALTER TABLE `horarios` DROP FOREIGN KEY IF EXISTS `fk_periodo_horarios`;

-- Agregar índices
ALTER TABLE `horarios`
  ADD INDEX IF NOT EXISTS `idx_periodo` (`periodo_id`),
  ADD INDEX IF NOT EXISTS `idx_usuario_carga_id` (`usuario_carga_id`);

-- Agregar constraints mejoradas
ALTER TABLE `horarios`
  ADD CONSTRAINT `fk_horarios_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE `horarios`
  ADD CONSTRAINT `fk_horarios_usuario`
    FOREIGN KEY (`usuario_carga_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- PASO 8: CREAR TABLA CARGA_ACADEMICA
-- =====================================================

CREATE TABLE IF NOT EXISTS `carga_academica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL COMMENT 'Periodo académico',
  `docente_id` int(11) NOT NULL COMMENT 'Docente asignado',
  `programa_materia_id` int(11) NOT NULL COMMENT 'Materia del plan de estudios',
  `grupo_id` int(11) NOT NULL COMMENT 'Grupo donde se imparte',
  `horas_asignadas` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas semanales asignadas',
  `observaciones` text DEFAULT NULL,
  `estado` enum('activo','cancelado','completado') NOT NULL DEFAULT 'activo',
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_asigno_id` int(11) DEFAULT NULL COMMENT 'Usuario que realizó la asignación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_carga` (`periodo_id`,`docente_id`,`programa_materia_id`,`grupo_id`),
  KEY `idx_periodo_id` (`periodo_id`),
  KEY `idx_docente_id` (`docente_id`),
  KEY `idx_materia_id` (`programa_materia_id`),
  KEY `idx_grupo_id` (`grupo_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_usuario_asigno` (`usuario_asigno_id`),
  KEY `idx_carga_periodo_docente` (`periodo_id`, `docente_id`, `estado`),
  KEY `idx_carga_periodo_grupo` (`periodo_id`, `grupo_id`, `estado`),
  CONSTRAINT `fk_carga_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_docente`
    FOREIGN KEY (`docente_id`)
    REFERENCES `docentes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_materia`
    FOREIGN KEY (`programa_materia_id`)
    REFERENCES `programa_materias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_grupo`
    FOREIGN KEY (`grupo_id`)
    REFERENCES `grupos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_usuario`
    FOREIGN KEY (`usuario_asigno_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- PASO 9: VERIFICACIONES FINALES
-- =====================================================

-- Reactivar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar integridad de las relaciones
SELECT 'VERIFICACIÓN DE INTEGRIDAD' as 'PASO FINAL';

-- Contar registros con problemas de relaciones
SELECT
  'Grupos sin programa válido' as verificacion,
  COUNT(*) as registros_afectados
FROM grupos
WHERE programa_id NOT IN (SELECT id FROM programas);

SELECT
  'Horarios sin periodo válido' as verificacion,
  COUNT(*) as registros_afectados
FROM horarios
WHERE periodo_id NOT IN (SELECT id FROM periodos);

SELECT
  'Materias sin programa válido' as verificacion,
  COUNT(*) as registros_afectados
FROM programa_materias
WHERE id_programa NOT IN (SELECT id FROM programas);

-- Mostrar resumen de tablas
SELECT
  'periodos' as tabla,
  COUNT(*) as total_registros,
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos
FROM periodos
UNION ALL
SELECT 'programas', COUNT(*), SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) FROM programas
UNION ALL
SELECT 'docentes', COUNT(*), SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) FROM docentes
UNION ALL
SELECT 'grupos', COUNT(*), SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) FROM grupos
UNION ALL
SELECT 'programa_materias', COUNT(*), SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) FROM programa_materias
UNION ALL
SELECT 'horarios', COUNT(*), SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) FROM horarios
UNION ALL
SELECT 'usuarios', COUNT(*), SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) FROM usuarios
UNION ALL
SELECT 'carga_academica', COUNT(*), SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) FROM carga_academica;

SELECT '✓ MIGRACIÓN COMPLETADA - Verifique los resultados anteriores' as resultado;
