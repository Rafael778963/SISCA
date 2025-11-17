-- ============================================
-- MIGRACIÓN: Cambiar FK constraints a CASCADE
-- ============================================
--
-- Esta migración cambia las restricciones FK para docentes y grupos
-- de ON DELETE SET NULL a ON DELETE CASCADE
--
-- Esto permitirá que cuando se elimina un período, todos los docentes
-- y grupos asociados se eliminen automáticamente de la base de datos
--
-- Ejecutar esta migración es necesario para que la función de
-- eliminación de períodos funcione correctamente
--

-- Desactivar temporalmente las restricciones FK
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- Alteración 1: Docentes
-- ============================================
-- Eliminar la restricción antigua
ALTER TABLE `docentes` DROP FOREIGN KEY `fk_docentes_periodo`;

-- Crear la nueva restricción con ON DELETE CASCADE
ALTER TABLE `docentes`
  ADD CONSTRAINT `fk_docentes_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ============================================
-- Alteración 2: Grupos
-- ============================================
-- Eliminar la restricción antigua
ALTER TABLE `grupos` DROP FOREIGN KEY `fk_grupos_periodo`;

-- Crear la nueva restricción con ON DELETE CASCADE
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Reactivar las restricciones FK
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Verificación
-- ============================================
-- Ejecutar estos comandos para verificar que las restricciones se crearon correctamente:
--
-- SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, DELETE_RULE
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_NAME IN ('docentes', 'grupos')
-- AND COLUMN_NAME = 'periodo_id';
--
-- El resultado debe mostrar:
-- - docentes: fk_docentes_periodo, DELETE_RULE = CASCADE
-- - grupos: fk_grupos_periodo, DELETE_RULE = CASCADE
