-- ===========================================================================
-- SCRIPT SQL PARA AGREGAR COLUMNA periodo_id A TODAS LAS TABLAS NECESARIAS
-- ===========================================================================
-- Este script agrega la columna periodo_id a las tablas que gestionan
-- información académica que debe estar asociada a un periodo específico.
--
-- IMPORTANTE: Ejecutar DESPUÉS de haber ejecutado agregar_relaciones.sql
-- ===========================================================================

USE sisca;

-- ===========================================================================
-- PASO 1: AGREGAR COLUMNA periodo_id A LAS TABLAS
-- ===========================================================================

-- GRUPOS: Ya debe tener la columna si ejecutaste agregar_relaciones.sql
-- Verificamos si existe y la agregamos solo si no existe
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'sisca'
    AND TABLE_NAME = 'grupos'
    AND COLUMN_NAME = 'periodo_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `grupos` ADD COLUMN `periodo_id` INT(11) NULL AFTER `id`',
    'SELECT "Columna periodo_id ya existe en grupos" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- DOCENTES: Ya debe tener la columna si ejecutaste agregar_relaciones.sql
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'sisca'
    AND TABLE_NAME = 'docentes'
    AND COLUMN_NAME = 'periodo_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `docentes` ADD COLUMN `periodo_id` INT(11) NULL AFTER `id`',
    'SELECT "Columna periodo_id ya existe en docentes" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===========================================================================
-- PASO 2: CREAR/VERIFICAR FOREIGN KEYS (si no existen)
-- ===========================================================================

-- FK para grupos.periodo_id -> periodos.id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'sisca'
    AND TABLE_NAME = 'grupos'
    AND CONSTRAINT_NAME = 'fk_grupos_periodo'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `grupos`
     ADD CONSTRAINT `fk_grupos_periodo`
     FOREIGN KEY (`periodo_id`)
     REFERENCES `periodos` (`id`)
     ON DELETE SET NULL
     ON UPDATE CASCADE',
    'SELECT "FK fk_grupos_periodo ya existe" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK para docentes.periodo_id -> periodos.id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'sisca'
    AND TABLE_NAME = 'docentes'
    AND CONSTRAINT_NAME = 'fk_docentes_periodo'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `docentes`
     ADD CONSTRAINT `fk_docentes_periodo`
     FOREIGN KEY (`periodo_id`)
     REFERENCES `periodos` (`id`)
     ON DELETE SET NULL
     ON UPDATE CASCADE',
    'SELECT "FK fk_docentes_periodo ya existe" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===========================================================================
-- PASO 3: CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ===========================================================================

CREATE INDEX IF NOT EXISTS `idx_grupos_periodo` ON `grupos` (`periodo_id`);
CREATE INDEX IF NOT EXISTS `idx_docentes_periodo` ON `docentes` (`periodo_id`);

-- ===========================================================================
-- PASO 4: VERIFICAR CAMBIOS
-- ===========================================================================

SELECT 'VERIFICACIÓN DE COLUMNAS periodo_id' AS '';

SELECT
    TABLE_NAME AS 'Tabla',
    COLUMN_NAME AS 'Columna',
    DATA_TYPE AS 'Tipo',
    IS_NULLABLE AS 'Nullable'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sisca'
AND COLUMN_NAME = 'periodo_id'
ORDER BY TABLE_NAME;

SELECT '' AS '';
SELECT 'VERIFICACIÓN DE FOREIGN KEYS' AS '';

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
    AND COLUMN_NAME = 'periodo_id'
ORDER BY TABLE_NAME;

-- ===========================================================================
-- NOTAS IMPORTANTES
-- ===========================================================================
/*
1. DATOS EXISTENTES:
   - Los registros existentes tendrán periodo_id = NULL
   - Puedes actualizarlos manualmente según las fechas:

   UPDATE grupos
   SET periodo_id = 1
   WHERE fecha_creacion BETWEEN '2025-01-01' AND '2025-04-30'
   AND periodo_id IS NULL;

   UPDATE grupos
   SET periodo_id = 2
   WHERE fecha_creacion BETWEEN '2025-05-01' AND '2025-08-31'
   AND periodo_id IS NULL;

   UPDATE grupos
   SET periodo_id = 3
   WHERE fecha_creacion BETWEEN '2025-09-01' AND '2025-12-31'
   AND periodo_id IS NULL;

2. FUNCIONALIDAD:
   - Al seleccionar un periodo en el index, este se guardará en sesión PHP
   - Todos los nuevos registros se guardarán automáticamente con ese periodo_id
   - Puedes filtrar datos por periodo en tus consultas

3. TABLAS AFECTADAS:
   - grupos: Asocia cada grupo a un periodo académico
   - docentes: Permite rastrear en qué periodo fue activo/registrado
   - horarios: Ya tiene periodo_id (relación existente)
   - programa_materias: No requiere periodo_id (son datos maestros)

4. PRÓXIMOS PASOS:
   - Actualizar registros existentes con periodo_id apropiado
   - Verificar que el frontend muestre correctamente el periodo activo
   - Agregar filtros por periodo en reportes y consultas
*/

-- ===========================================================================
-- FIN DEL SCRIPT
-- ===========================================================================
