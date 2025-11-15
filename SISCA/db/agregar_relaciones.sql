-- ===========================================================================
-- SCRIPT SQL PARA AGREGAR RELACIONES A LA BASE DE DATOS SISCA
-- ===========================================================================
-- Este script agrega las claves foráneas (Foreign Keys) necesarias para
-- mantener la integridad referencial entre las tablas del sistema.
--
-- IMPORTANTE: Ejecutar en XAMPP (phpMyAdmin) o MySQL
-- ===========================================================================

USE sisca;

-- ===========================================================================
-- PASO 1: AGREGAR COLUMNA periodo_id A TABLAS QUE LA NECESITEN
-- ===========================================================================

-- Agregar periodo_id a la tabla grupos
-- (Los grupos se crean para un periodo académico específico)
ALTER TABLE `grupos`
ADD COLUMN `periodo_id` INT(11) NULL AFTER `id`;

-- Agregar periodo_id a la tabla docentes
-- (Permite rastrear en qué periodo se registró o modificó un docente)
ALTER TABLE `docentes`
ADD COLUMN `periodo_id` INT(11) NULL AFTER `id`;

-- ===========================================================================
-- PASO 2: ELIMINAR FOREIGN KEYS EXISTENTES (si existen)
-- ===========================================================================
-- Esto es para evitar errores si el script se ejecuta más de una vez

-- Eliminar FK de horarios si existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'sisca'
    AND TABLE_NAME = 'horarios'
    AND CONSTRAINT_NAME = 'fk_periodo_horarios'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE horarios DROP FOREIGN KEY fk_periodo_horarios',
    'SELECT "FK fk_periodo_horarios no existe" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar FK de programa_materias si existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'sisca'
    AND TABLE_NAME = 'programa_materias'
    AND CONSTRAINT_NAME = 'fk_programa_mat'
);

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE programa_materias DROP FOREIGN KEY fk_programa_mat',
    'SELECT "FK fk_programa_mat no existe" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===========================================================================
-- PASO 3: CREAR/RECREAR TODAS LAS FOREIGN KEYS
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 3.1: Relación HORARIOS -> PERIODOS
-- ---------------------------------------------------------------------------
-- Cada horario pertenece a un periodo específico
-- ON DELETE CASCADE: Si se elimina un periodo, se eliminan sus horarios
-- ON UPDATE CASCADE: Si cambia el ID del periodo, se actualiza en horarios

ALTER TABLE `horarios`
ADD CONSTRAINT `fk_horarios_periodo`
FOREIGN KEY (`periodo_id`)
REFERENCES `periodos` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3.2: Relación PROGRAMA_MATERIAS -> PROGRAMAS
-- ---------------------------------------------------------------------------
-- Cada materia pertenece a un programa educativo
-- ON DELETE CASCADE: Si se elimina un programa, se eliminan sus materias
-- ON UPDATE CASCADE: Si cambia el ID del programa, se actualiza en materias

ALTER TABLE `programa_materias`
ADD CONSTRAINT `fk_programa_materias_programa`
FOREIGN KEY (`id_programa`)
REFERENCES `programas` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3.3: Relación GRUPOS -> PERIODOS
-- ---------------------------------------------------------------------------
-- Cada grupo pertenece a un periodo académico
-- ON DELETE SET NULL: Si se elimina un periodo, el grupo no se elimina
--                     pero su periodo_id se pone en NULL
-- ON UPDATE CASCADE: Si cambia el ID del periodo, se actualiza en grupos

ALTER TABLE `grupos`
ADD CONSTRAINT `fk_grupos_periodo`
FOREIGN KEY (`periodo_id`)
REFERENCES `periodos` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 3.4: Relación DOCENTES -> PERIODOS (Opcional)
-- ---------------------------------------------------------------------------
-- Rastrea en qué periodo fue registrado/activo el docente
-- ON DELETE SET NULL: Si se elimina el periodo, el docente permanece

ALTER TABLE `docentes`
ADD CONSTRAINT `fk_docentes_periodo`
FOREIGN KEY (`periodo_id`)
REFERENCES `periodos` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ===========================================================================
-- PASO 4: CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ===========================================================================

-- Índice en horarios.periodo_id (si no existe)
CREATE INDEX IF NOT EXISTS `idx_horarios_periodo` ON `horarios` (`periodo_id`);

-- Índice en programa_materias.id_programa (si no existe)
CREATE INDEX IF NOT EXISTS `idx_programa_materias_programa` ON `programa_materias` (`id_programa`);

-- Índice en grupos.periodo_id
CREATE INDEX IF NOT EXISTS `idx_grupos_periodo` ON `grupos` (`periodo_id`);

-- Índice en docentes.periodo_id
CREATE INDEX IF NOT EXISTS `idx_docentes_periodo` ON `docentes` (`periodo_id`);

-- Índice en grupos.codigo_grupo (para búsquedas rápidas)
CREATE INDEX IF NOT EXISTS `idx_grupos_codigo` ON `grupos` (`codigo_grupo`);

-- Índice en grupos.estado (para filtrar activos/inactivos)
CREATE INDEX IF NOT EXISTS `idx_grupos_estado` ON `grupos` (`estado`);

-- Índice en docentes.estado
CREATE INDEX IF NOT EXISTS `idx_docentes_estado` ON `docentes` (`estado`);

-- ===========================================================================
-- PASO 5: VERIFICAR LAS RELACIONES CREADAS
-- ===========================================================================

SELECT
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna',
    CONSTRAINT_NAME AS 'Nombre FK',
    REFERENCED_TABLE_NAME AS 'Tabla Referenciada',
    REFERENCED_COLUMN_NAME AS 'Columna Referenciada'
FROM information_schema.KEY_COLUMN_USAGE
WHERE
    CONSTRAINT_SCHEMA = 'sisca'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ===========================================================================
-- NOTAS IMPORTANTES
-- ===========================================================================
/*
1. INTEGRIDAD REFERENCIAL:
   - Las Foreign Keys garantizan que no puedas insertar datos inválidos
   - Por ejemplo, no podrás crear un horario con un periodo_id que no existe

2. ON DELETE CASCADE vs ON DELETE SET NULL:
   - CASCADE: Elimina automáticamente los registros relacionados
   - SET NULL: Mantiene el registro pero pone NULL en la FK

3. ACTUALIZACIÓN DE DATOS EXISTENTES:
   - Los registros existentes tendrán periodo_id = NULL
   - Deberás actualizar manualmente estos registros según corresponda:

   UPDATE grupos SET periodo_id = 1 WHERE fecha_creacion BETWEEN '2025-01-01' AND '2025-04-30';
   UPDATE grupos SET periodo_id = 2 WHERE fecha_creacion BETWEEN '2025-05-01' AND '2025-08-31';
   UPDATE grupos SET periodo_id = 3 WHERE fecha_creacion BETWEEN '2025-09-01' AND '2025-12-31';

4. PARA FUTURAS MEJORAS:
   - Crear tabla `asignaciones` para relacionar docentes, materias y grupos
   - Crear tabla `cargas_academicas` para gestionar carga horaria por periodo
   - Agregar más validaciones a nivel de base de datos (TRIGGERS)
*/

-- ===========================================================================
-- FIN DEL SCRIPT
-- ===========================================================================
