-- ===========================================================================
-- SCRIPT SQL BÁSICO - SOLO RELACIONES EXISTENTES
-- ===========================================================================
-- Este script solo crea/verifica las Foreign Keys para las columnas
-- que YA EXISTEN en la base de datos, sin agregar nuevas columnas.
--
-- IMPORTANTE: Ejecutar en XAMPP (phpMyAdmin) o MySQL
-- ===========================================================================

USE sisca;

-- ===========================================================================
-- ELIMINAR FOREIGN KEYS EXISTENTES (para recrearlas correctamente)
-- ===========================================================================

-- Verificar y eliminar FK de horarios
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

-- Verificar y eliminar FK de programa_materias
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
-- CREAR FOREIGN KEYS CORRECTAMENTE
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Relación: horarios.periodo_id -> periodos.id
-- ---------------------------------------------------------------------------
ALTER TABLE `horarios`
ADD CONSTRAINT `fk_horarios_periodo`
FOREIGN KEY (`periodo_id`)
REFERENCES `periodos` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Relación: programa_materias.id_programa -> programas.id
-- ---------------------------------------------------------------------------
ALTER TABLE `programa_materias`
ADD CONSTRAINT `fk_programa_materias_programa`
FOREIGN KEY (`id_programa`)
REFERENCES `programas` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ===========================================================================
-- CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ===========================================================================

CREATE INDEX IF NOT EXISTS `idx_horarios_periodo` ON `horarios` (`periodo_id`);
CREATE INDEX IF NOT EXISTS `idx_programa_materias_programa` ON `programa_materias` (`id_programa`);
CREATE INDEX IF NOT EXISTS `idx_grupos_codigo` ON `grupos` (`codigo_grupo`);
CREATE INDEX IF NOT EXISTS `idx_grupos_estado` ON `grupos` (`estado`);
CREATE INDEX IF NOT EXISTS `idx_docentes_estado` ON `docentes` (`estado`);

-- ===========================================================================
-- VERIFICAR RELACIONES
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
-- FIN DEL SCRIPT
-- ===========================================================================
