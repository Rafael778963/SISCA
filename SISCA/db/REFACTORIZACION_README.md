# REFACTORIZACIÓN DE BASE DE DATOS - SISCA

**Fecha de Refactorización:** 14 de noviembre de 2025
**Versión:** 2.0
**Responsable:** Claude Code

---

## RESUMEN EJECUTIVO

Esta refactorización mejora significativamente la **integridad referencial** de la base de datos SISCA, implementando relaciones completas entre tablas con cascadas automáticas, una nueva tabla para gestión de carga académica, y mejoras en los endpoints PHP.

### Beneficios Principales

✅ **Integridad de datos garantizada** mediante claves foráneas
✅ **Eliminación en cascada** automática de registros relacionados
✅ **Nueva tabla `carga_academica`** para gestión completa de asignaciones
✅ **Endpoints PHP actualizados** con validaciones mejoradas
✅ **Mejor rendimiento** gracias a índices optimizados

---

## CAMBIOS EN LA ESTRUCTURA DE LA BASE DE DATOS

### 1. TABLA `usuarios` (Actualizada)

**Campos Agregados:**
- `estado` (ENUM: activo/inactivo) - Estado del usuario
- `fecha_creacion` (TIMESTAMP) - Auditoría
- `fecha_modificacion` (TIMESTAMP) - Auditoría

**Índices Agregados:**
- `idx_area` - Para búsquedas por área
- `idx_estado` - Para filtrar usuarios activos

---

### 2. TABLA `periodos` (Actualizada)

**Campos Agregados:**
- `activo` (TINYINT) - Indica si el periodo está activo
- `fecha_inicio` (DATE) - Fecha de inicio del periodo
- `fecha_fin` (DATE) - Fecha de fin del periodo
- `fecha_creacion` (TIMESTAMP) - Auditoría
- `fecha_modificacion` (TIMESTAMP) - Auditoría

**Índices Agregados:**
- `idx_año` - Para búsquedas por año
- `idx_activo` - Para filtrar periodos activos

**Relaciones Salientes:**
- → `horarios` (CASCADE)
- → `grupos` (SET NULL)
- → `carga_academica` (CASCADE)

---

### 3. TABLA `programas` (Actualizada)

**Campos Agregados:**
- `fecha_modificacion` (TIMESTAMP) - Auditoría

**Índices Agregados:**
- `idx_nomenclatura` - Para búsquedas rápidas por código
- `idx_nivel` - Para filtrar por nivel educativo
- `idx_activo` - Para filtrar programas activos

**Relaciones Salientes:**
- → `programa_materias` (CASCADE)
- → `grupos` (RESTRICT)

---

### 4. TABLA `grupos` (Actualizada - CAMBIOS IMPORTANTES)

**Campos Agregados:**
- `programa_id` (INT NOT NULL) - **FK a `programas.id`**
- `periodo_id` (INT NULL) - **FK a `periodos.id`**

**Campos Modificados:**
- `programa_educativo` - Ahora es legacy, se usa `programa_id` para las relaciones

**Índices Agregados:**
- `idx_programa_id` - Para búsquedas por programa
- `idx_periodo_id` - Para búsquedas por periodo
- `idx_estado` - Para filtrar grupos activos
- `idx_grupos_periodo_estado` - Índice compuesto para optimización

**Relaciones:**
- **Entrantes:** `programas.id` (RESTRICT), `periodos.id` (SET NULL)
- **Salientes:** → `carga_academica` (CASCADE)

**⚠️ IMPORTANTE:** Al crear o editar grupos, ahora es obligatorio proporcionar `programa_id`. Los endpoints PHP lo resuelven automáticamente si solo se proporciona la nomenclatura.

---

### 5. TABLA `horarios` (Actualizada)

**Campos Agregados:**
- `usuario_carga_id` (INT NULL) - **FK a `usuarios.id`**

**Campos Modificados:**
- `usuario_carga` - Ahora es legacy, se usa `usuario_carga_id` para las relaciones

**Índices Agregados:**
- `idx_usuario_carga_id` - Para búsquedas por usuario

**Relaciones:**
- **Entrantes:** `periodos.id` (CASCADE), `usuarios.id` (SET NULL)

**Constraint Mejorada:**
```sql
CONSTRAINT `fk_horarios_periodo`
  FOREIGN KEY (`periodo_id`)
  REFERENCES `periodos` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

---

### 6. TABLA `programa_materias` (Actualizada)

**Campos Agregados:**
- `fecha_modificacion` (TIMESTAMP) - Auditoría

**Índices Agregados:**
- `idx_cve_materia` - Para búsquedas por clave
- `idx_grado` - Para filtrar por grado
- `idx_activo` - Para filtrar materias activas

**Constraint Mejorada:**
```sql
CONSTRAINT `fk_programa_materias_programa`
  FOREIGN KEY (`id_programa`)
  REFERENCES `programas` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

---

### 7. TABLA `carga_academica` (NUEVA ⭐)

**Propósito:** Gestionar la asignación de docentes a materias en grupos específicos durante un periodo académico.

**Estructura:**
```sql
CREATE TABLE `carga_academica` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `periodo_id` INT NOT NULL,                    -- FK a periodos
  `docente_id` INT NOT NULL,                    -- FK a docentes
  `programa_materia_id` INT NOT NULL,           -- FK a programa_materias
  `grupo_id` INT NOT NULL,                      -- FK a grupos
  `horas_asignadas` INT DEFAULT 0,              -- Horas semanales
  `observaciones` TEXT,                          -- Notas adicionales
  `estado` ENUM('activo','cancelado','completado') DEFAULT 'activo',
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_asigno_id` INT,                      -- FK a usuarios (quien asignó)

  UNIQUE KEY `unique_carga` (periodo_id, docente_id, programa_materia_id, grupo_id)
);
```

**Índices:**
- `idx_carga_periodo_docente` - Búsquedas por periodo y docente
- `idx_carga_periodo_grupo` - Búsquedas por periodo y grupo

**Relaciones (Todas con CASCADE):**
- → `periodos.id`
- → `docentes.id`
- → `programa_materias.id`
- → `grupos.id`
- → `usuarios.id` (SET NULL)

**Constraint Único:**
No se puede asignar el mismo docente a la misma materia en el mismo grupo durante el mismo periodo.

---

## DIAGRAMA DE RELACIONES

```
periodos (1) ----< (N) horarios         [ON DELETE CASCADE]
periodos (1) ----< (N) grupos           [ON DELETE SET NULL]
periodos (1) ----< (N) carga_academica  [ON DELETE CASCADE]

programas (1) ----< (N) programa_materias [ON DELETE CASCADE]
programas (1) ----< (N) grupos            [ON DELETE RESTRICT]

docentes (1) ----< (N) carga_academica  [ON DELETE CASCADE]
programa_materias (1) ----< (N) carga_academica [ON DELETE CASCADE]
grupos (1) ----< (N) carga_academica    [ON DELETE CASCADE]

usuarios (1) ----< (N) horarios.usuario_carga_id [ON DELETE SET NULL]
usuarios (1) ----< (N) carga_academica.usuario_asigno_id [ON DELETE SET NULL]
```

---

## CAMBIOS EN COMPORTAMIENTO DE CASCADAS

### Al Eliminar un PERIODO:
- ✅ Se eliminan automáticamente todos los `horarios` del periodo
- ✅ Se eliminan automáticamente todas las `carga_academica` del periodo
- ✅ Los `grupos` asociados tendrán `periodo_id = NULL` (no se eliminan)

### Al Eliminar un PROGRAMA:
- ✅ Se eliminan automáticamente todas las `programa_materias` del programa
- ❌ **NO** se pueden eliminar programas con grupos asociados (RESTRICT)
  - Primero debe eliminar o reasignar los grupos

### Al Eliminar un DOCENTE:
- ✅ Se eliminan automáticamente todas las `carga_academica` del docente

### Al Eliminar un GRUPO:
- ✅ Se eliminan automáticamente todas las `carga_academica` del grupo

### Al Eliminar una MATERIA:
- ✅ Se eliminan automáticamente todas las `carga_academica` de esa materia

---

## ARCHIVOS PHP MODIFICADOS

### 1. `/php/periodos/eliminar_periodo.php`

**Mejoras:**
- ✅ Verifica y cuenta registros relacionados antes de eliminar
- ✅ Retorna advertencia con cantidad de horarios, grupos y cargas que se eliminarán
- ✅ Manejo mejorado de errores de constraint

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Periodo eliminado correctamente. ADVERTENCIA: Se eliminarán también 18 horario(s), 35 grupo(s), 120 carga(s) académica(s) relacionados.",
  "deleted_related": ["18 horario(s)", "35 grupo(s)", "120 carga(s) académica(s)"]
}
```

### 2. `/php/grupos/guardar_grupo.php`

**Mejoras:**
- ✅ Acepta `programa_id` y `periodo_id` como parámetros
- ✅ Resuelve automáticamente `programa_id` desde nomenclatura si no se proporciona
- ✅ Asigna automáticamente el periodo más reciente si no se proporciona
- ✅ Validación de existencia de programa activo

### 3. `/php/grupos/editar_grupo.php`

**Mejoras:**
- ✅ Acepta `programa_id` y `periodo_id` como parámetros
- ✅ Resuelve automáticamente `programa_id` desde nomenclatura si no se proporciona
- ✅ Validación de existencia de programa activo
- ✅ Actualización correcta de relaciones FK

---

## NUEVOS ARCHIVOS PHP - CARGA ACADÉMICA

### 1. `/php/carga_academica/guardar_carga.php`

**Funcionalidad:**
- ✅ Crea nueva asignación de docente a materia en grupo
- ✅ Validaciones completas de existencia y estado de entidades relacionadas
- ✅ Previene duplicados mediante constraint único
- ✅ Registra usuario que realiza la asignación

**Parámetros POST:**
```json
{
  "periodo_id": 1,
  "docente_id": 15,
  "programa_materia_id": 234,
  "grupo_id": 12,
  "horas_asignadas": 5,
  "observaciones": "Grupo regular"
}
```

### 2. `/php/carga_academica/obtener_cargas.php`

**Funcionalidad:**
- ✅ Lista cargas académicas con JOINs completos
- ✅ Filtros opcionales: periodo, docente, grupo, estado
- ✅ Estadísticas opcionales por periodo
- ✅ Retorna información completa de docente, materia, grupo y programa

**Parámetros GET:**
```
?periodo_id=1&docente_id=15&include_stats=true
```

**Ejemplo de respuesta con estadísticas:**
```json
{
  "success": true,
  "data": [ /* array de cargas */ ],
  "stats": {
    "total_asignaciones": 120,
    "total_docentes": 45,
    "total_grupos": 35,
    "total_horas": 600
  }
}
```

### 3. `/php/carga_academica/eliminar_carga.php`

**Funcionalidad:**
- ✅ Elimina asignación de carga académica
- ✅ Validación de existencia antes de eliminar

### 4. `/php/carga_academica/actualizar_carga.php`

**Funcionalidad:**
- ✅ Actualiza horas asignadas, observaciones y estado
- ✅ Validaciones de estado (activo/cancelado/completado)
- ✅ Retorna datos completos actualizados

---

## INSTRUCCIONES DE MIGRACIÓN

### PASO 1: BACKUP (CRÍTICO ⚠️)

```bash
# Crear backup completo de la base de datos
mysqldump -u root sisca > backup_sisca_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el backup se creó correctamente
ls -lh backup_sisca_*.sql
```

### PASO 2: EJECUTAR SCRIPT DE MIGRACIÓN

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de migración
source /ruta/completa/a/SISCA/db/migracion_refactorizacion.sql
```

**⏱️ Tiempo estimado:** 2-5 minutos (dependiendo del tamaño de la BD)

### PASO 3: VERIFICAR RESULTADOS

El script mostrará un resumen final con:
- Grupos sin programa válido
- Horarios sin periodo válido
- Materias sin programa válido
- Resumen de registros por tabla

**✅ Resultados esperados:**
```
+----------------------------------+---------------------+
| verificacion                     | registros_afectados |
+----------------------------------+---------------------+
| Grupos sin programa válido       |                   0 |
| Horarios sin periodo válido      |                   0 |
| Materias sin programa válido     |                   0 |
+----------------------------------+---------------------+

+-------------------+-----------------+--------+
| tabla             | total_registros | activos|
+-------------------+-----------------+--------+
| periodos          |               3 |      3 |
| programas         |              18 |     12 |
| docentes          |              85 |     70 |
| grupos            |              35 |     32 |
| programa_materias |            1016 |   1016 |
| horarios          |              18 |     18 |
| usuarios          |               9 |      9 |
| carga_academica   |               0 |      0 |
+-------------------+-----------------+--------+
```

### PASO 4: PRUEBAS FUNCIONALES

**Probar eliminación de periodo:**
```sql
-- Crear periodo de prueba
INSERT INTO periodos (periodo, año, activo) VALUES ('Prueba', 2026, 1);
SET @test_periodo_id = LAST_INSERT_ID();

-- Crear horario de prueba asociado
INSERT INTO horarios (periodo_id, nombre_archivo, nombre_guardado, ruta_archivo)
VALUES (@test_periodo_id, 'test.pdf', 'test_save.pdf', '/test/');

-- Verificar que existe
SELECT COUNT(*) FROM horarios WHERE periodo_id = @test_periodo_id;

-- Eliminar periodo (debería eliminar horario en cascada)
DELETE FROM periodos WHERE id = @test_periodo_id;

-- Verificar que el horario se eliminó automáticamente
SELECT COUNT(*) FROM horarios WHERE periodo_id = @test_periodo_id;
-- Resultado esperado: 0
```

**Probar carga académica:**
```sql
-- Crear carga académica de prueba
INSERT INTO carga_academica
(periodo_id, docente_id, programa_materia_id, grupo_id, horas_asignadas)
VALUES (1, 1, 1, 3, 5);

-- Verificar con JOIN completo
SELECT ca.*, d.nombre_docente, pm.nombre_materia, g.codigo_grupo
FROM carga_academica ca
INNER JOIN docentes d ON ca.docente_id = d.id
INNER JOIN programa_materias pm ON ca.programa_materia_id = pm.id
INNER JOIN grupos g ON ca.grupo_id = g.id
WHERE ca.id = LAST_INSERT_ID();
```

---

## ROLLBACK EN CASO DE PROBLEMAS

Si algo sale mal durante la migración:

```bash
# 1. Detener la migración inmediatamente
# 2. Restaurar desde el backup

mysql -u root -p sisca < backup_sisca_YYYYMMDD_HHMMSS.sql

# 3. Verificar que la restauración fue exitosa
mysql -u root -p sisca -e "SELECT COUNT(*) FROM periodos; SELECT COUNT(*) FROM grupos;"
```

---

## COMPATIBILIDAD CON CÓDIGO EXISTENTE

### Frontend (JavaScript)

**✅ Compatible:** La mayoría del código frontend seguirá funcionando sin cambios.

**⚠️ Ajustes necesarios:**

1. **Al crear grupos:** Opcionalmente puede enviar `programa_id` y `periodo_id`:
```javascript
// Antes (sigue funcionando)
{
  generacion: "51",
  nivel: "TSU",
  programa: "TSUQAI",
  grado: "3",
  turno: "M"
}

// Mejorado (recomendado)
{
  generacion: "51",
  nivel: "TSU",
  programa: "TSUQAI",
  programa_id: 2,      // Opcional pero recomendado
  periodo_id: 3,       // Opcional pero recomendado
  grado: "3",
  turno: "M"
}
```

2. **Al crear horarios:** Opcionalmente puede enviar `usuario_carga_id`:
```javascript
{
  periodo_id: 1,
  archivo: file,
  usuario_carga_id: 2  // Opcional - ID del usuario de sesión
}
```

---

## MANTENIMIENTO FUTURO

### Limpieza de datos legacy

Una vez verificado que todo funciona correctamente, se pueden eliminar campos legacy:

```sql
-- EJECUTAR SOLO DESPUÉS DE 1-2 MESES DE PRUEBAS EN PRODUCCIÓN
ALTER TABLE grupos DROP COLUMN programa_educativo;
ALTER TABLE horarios DROP COLUMN usuario_carga;
```

### Optimización de índices

```sql
-- Analizar uso de índices después de 1 mes
SHOW INDEX FROM grupos;
SHOW INDEX FROM carga_academica;

-- Optimizar tablas si es necesario
OPTIMIZE TABLE grupos;
OPTIMIZE TABLE carga_academica;
```

---

## PREGUNTAS FRECUENTES (FAQ)

**Q: ¿Qué pasa si elimino un periodo con horarios y grupos?**
A: Los horarios y cargas académicas se eliminan automáticamente. Los grupos tendrán `periodo_id = NULL` pero no se eliminan.

**Q: ¿Puedo eliminar un programa que tiene grupos asociados?**
A: No. Primero debes eliminar o reasignar los grupos a otro programa.

**Q: ¿Cómo asigno un docente a una materia?**
A: Usa la nueva tabla `carga_academica` con los endpoints en `/php/carga_academica/`.

**Q: ¿Los datos existentes se pierden durante la migración?**
A: No. El script de migración preserva todos los datos existentes y solo agrega las nuevas relaciones.

**Q: ¿Qué pasa si la migración falla a la mitad?**
A: Restaura desde el backup usando el comando de rollback.

---

## SOPORTE Y CONTACTO

Para dudas o problemas con la refactorización:

1. Revisar este documento completo
2. Verificar los logs de errores de MySQL
3. Revisar el backup antes de hacer cambios
4. Contactar al equipo de desarrollo

---

## HISTORIAL DE CAMBIOS

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0 | 2025-11-14 | Refactorización completa con FK y cascadas |
| 1.0 | 2025-10-13 | Versión original sin relaciones FK |

---

**✅ FIN DE LA DOCUMENTACIÓN DE REFACTORIZACIÓN**
