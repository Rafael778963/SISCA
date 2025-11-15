# Implementación: Eliminación de Períodos con Cascade Deletion

## Estado General
✅ Completado - Todos los componentes están implementados y listos para testing

## Cambios Realizados

### 1. Actualización de la Base de Datos (sisca.sql)
**Línea 1178**: FK constraint para docentes
```sql
-- ANTES:
ALTER TABLE `docentes`
  ADD CONSTRAINT `fk_docentes_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AHORA:
ALTER TABLE `docentes`
  ADD CONSTRAINT `fk_docentes_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
```

**Línea 1184**: FK constraint para grupos
```sql
-- ANTES:
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AHORA:
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. Scripts de Migración Creados

#### a) migration_cascade_deletion.sql
Ubicación: `SISCA/db/migration_cascade_deletion.sql`

Script SQL que altera las restricciones FK en una base de datos existente.

**Cómo ejecutar:**
```bash
mysql -u root sisca < migration_cascade_deletion.sql
```

O en MySQL CLI:
```sql
SOURCE /ruta/a/migration_cascade_deletion.sql;
```

#### b) alter_constraints.php
Ubicación: `/alter_constraints.php`

Script PHP alternativo para aplicar los cambios sin acceso directo a MySQL.

**Cómo ejecutar:**
```bash
php alter_constraints.php
```

### 3. Cambios en PHP

#### SISCA/php/periodos/eliminar_periodo.php
Este archivo ya contiene la lógica correcta para:
1. Iniciar una transacción
2. Eliminar archivos PDF de horarios
3. Eliminar directorios de horarios
4. Eliminar registros de horarios (DELETE - hard delete)
5. Eliminar registros de grupos
6. Eliminar registros de docentes
7. Eliminar el período
8. Confirmar la transacción

**Importante**: Con la migración a ON DELETE CASCADE, los pasos 5 y 6 se ejecutarán automáticamente cuando se elimine el período, pero el script mantiene estos deletes explícitos para mayor control.

#### SISCA/php/docentes/crear_docente.php
- Valida que haya un período_id
- Valida que el período existe en BD
- Inserta docentes con período_id

#### SISCA/php/docentes/editar_docente.php
- Valida período_id
- Actualiza docentes con período_id

#### SISCA/php/docentes/obtener_docentes.php
- Filtra docentes por período_id
- Solo devuelve docentes del período activo

### 4. Cambios en JavaScript

#### SISCA/js/docentes/docentes.js
- Carga período manager en DOMContentLoaded
- Envía periodo_id en todas las operaciones
- Valida que haya período activo antes de operaciones

#### SISCA/js/periodo_manager.js
- Gestor centralizado de período activo
- Proporciona funciones:
  - `cargarPeriodoActivo()`: Obtiene el período de sesión
  - `validarPeriodoActivo(accion)`: Valida que haya período
  - `obtenerPeriodoActivoId()`: Retorna ID del período
  - `hayPeriodoActivo()`: Verifica disponibilidad
  - `recargarPeriodoActivo()`: Actualiza período

## Flujo Completo de Eliminación de Período

### Paso 1: Usuario solicita eliminar período
```
SISCA/pages/periodos.html → JS → obtenerPeriodoActivoId()
```

### Paso 2: Validación en Frontend
```javascript
if (!confirm('¿Deseas eliminar el período...?')) return;
```

### Paso 3: Llamada a eliminar_periodo.php
```php
POST /SISCA/php/periodos/eliminar_periodo.php
Body: { id: 123 }
```

### Paso 4: Transacción en BD
```
1. BEGIN TRANSACTION
2. DELETE FROM horarios WHERE periodo_id = 123
3. DELETE FROM grupos WHERE periodo_id = 123 (CASCADE automático)
4. DELETE FROM docentes WHERE periodo_id = 123 (CASCADE automático)
5. DELETE FROM periodos WHERE id = 123
6. COMMIT
```

### Paso 5: Respuesta detallada
```json
{
  "success": true,
  "message": "Período eliminado correctamente",
  "summary": {
    "horarios_eliminados": 5,
    "archivos_eliminados": 5,
    "grupos_eliminados": 3,
    "docentes_eliminados": 8,
    "periodo_eliminado": 1
  }
}
```

## Testing - Casos de Uso

### Test 1: Eliminar período sin docentes
```
1. Crear período
2. Crear grupos (sin docentes)
3. Eliminar período
✓ Esperado: grupos se eliminan automáticamente
```

### Test 2: Eliminar período con docentes
```
1. Crear período
2. Crear docentes
3. Eliminar período
✓ Esperado: docentes se eliminan automáticamente de BD (no SET NULL)
```

### Test 3: Eliminar período con horarios, grupos y docentes
```
1. Crear período
2. Crear docentes
3. Crear grupos
4. Crear horarios
5. Eliminar período
✓ Esperado: Todo se elimina en cascada
✓ Verificar: Archivos PDF también se eliminan
```

### Test 4: Verificar que docentes nuevos requieren período activo
```
1. Sin período activo, intentar crear docente
✓ Esperado: Error "Debe seleccionar un período activo"
```

### Test 5: Verificar filtrado por período
```
1. Crear período A con docentes
2. Crear período B con docentes diferentes
3. Cambiar a período A
✓ Esperado: Solo docentes de período A se muestran
```

## Pasos para Aplicar la Migración

### Para Bases de Datos Nuevas
1. Usar el archivo sisca.sql actualizado (ya incluye los cambios)
2. La importación crea automáticamente las restricciones correctas

### Para Bases de Datos Existentes
Opción 1: Usar script SQL
```bash
cd /home/user/SISCA/SISCA/db
mysql -u root sisca < migration_cascade_deletion.sql
```

Opción 2: Usar script PHP
```bash
cd /home/user/SISCA
php alter_constraints.php
```

Opción 3: Ejecutar manualmente en MySQL CLI
```sql
USE sisca;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE `docentes` DROP FOREIGN KEY `fk_docentes_periodo`;
ALTER TABLE `docentes` ADD CONSTRAINT `fk_docentes_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `grupos` DROP FOREIGN KEY `fk_grupos_periodo`;
ALTER TABLE `grupos` ADD CONSTRAINT `fk_grupos_periodo`
  FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
```

## Verificación Post-Migración

### Verificar que las restricciones se aplicaron correctamente
```sql
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, DELETE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME IN ('docentes', 'grupos')
AND REFERENCED_TABLE_NAME = 'periodos';
```

**Resultado esperado:**
```
CONSTRAINT_NAME      | TABLE_NAME | COLUMN_NAME | REFERENCED_TABLE | DELETE_RULE
fk_docentes_periodo  | docentes   | periodo_id  | periodos        | CASCADE
fk_grupos_periodo    | grupos     | periodo_id  | periodos        | CASCADE
```

## Resumen de Archivos Modificados/Creados

### Modificados:
1. `SISCA/db/sisca.sql` - FK constraints actualizados

### Creados:
1. `SISCA/db/migration_cascade_deletion.sql` - Script de migración SQL
2. `alter_constraints.php` - Script alternativo PHP
3. `IMPLEMENTATION_NOTES.md` - Este archivo

### Ya Implementados en Commits Anteriores:
1. `SISCA/php/periodos/eliminar_periodo.php` - Lógica de eliminación
2. `SISCA/php/docentes/crear_docente.php` - Validación período_id
3. `SISCA/php/docentes/editar_docente.php` - Validación período_id
4. `SISCA/php/docentes/obtener_docentes.php` - Filtrado por período
5. `SISCA/js/docentes/docentes.js` - Carga período manager
6. `SISCA/js/periodo_manager.js` - Gestor centralizado

## Próximos Pasos

1. **Aplicar la migración en la base de datos existente**
   - Ejecutar uno de los scripts de migración

2. **Testing en ambiente**
   - Ejecutar los casos de uso listados arriba

3. **Validación de datos**
   - Verificar que no hay datos inconsistentes
   - Confirmar que cascade deletion funciona correctamente

4. **Documentación de usuario**
   - Informar al usuario sobre el cambio de comportamiento
   - Advertir que la eliminación de períodos ahora es permanente

## Estado Final

✅ **FK Constraints**: Cambio de SET NULL a CASCADE
✅ **SQL Migration**: Script creado y listo
✅ **PHP Implementation**: Eliminación lógica implementada
✅ **Frontend**: Validación y filtrado por período
✅ **Documentation**: Notas completas para testing

**Próxima Acción**: Ejecutar migration_cascade_deletion.sql en la base de datos real
