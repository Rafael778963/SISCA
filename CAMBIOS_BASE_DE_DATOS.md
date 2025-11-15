# CAMBIOS EN LA BASE DE DATOS SISCA
## Fecha: 15 de Noviembre de 2025

---

## 📋 RESUMEN DE CAMBIOS

Se implementó un sistema completo de **relaciones de integridad referencial** con **cascadas automáticas** para la base de datos SISCA, asegurando que todos los datos estén correctamente relacionados y que las eliminaciones/actualizaciones se propaguen de manera lógica.

---

## 🔄 MODIFICACIONES EN TABLAS EXISTENTES

### 1. **Tabla `periodos`**
- ✅ Se agregaron campos adicionales:
  - `activo` (TINYINT): Para marcar periodos activos/inactivos
  - `fecha_creacion` (TIMESTAMP): Registro de cuándo se creó el periodo
- ✅ Se agregaron índices para optimización:
  - `idx_año`: Índice en el campo año
  - `idx_activo`: Índice en el campo activo

### 2. **Tabla `programas`**
- ✅ Se agregaron índices para optimización:
  - `idx_nomenclatura`: Índice en nomenclatura
  - `idx_nivel`: Índice en nivel
  - `idx_activo`: Índice en activo

### 3. **Tabla `docentes`**
- ✅ Se agregaron índices para optimización:
  - `idx_nombre`: Índice en nombre_docente
  - `idx_turno`: Índice en turno
  - `idx_regimen`: Índice en régimen
  - `idx_estado`: Índice en estado

### 4. **Tabla `grupos`** ⭐ CAMBIO IMPORTANTE
- ✅ **NUEVA COLUMNA**: `periodo_id` (INT NOT NULL)
  - **Relación**: Conecta cada grupo con un periodo específico
  - **Clave Foránea**: `fk_grupos_periodo` → `periodos.id`
  - **Comportamiento**:
    - `ON DELETE RESTRICT`: No se puede eliminar un periodo si tiene grupos asociados
    - `ON UPDATE CASCADE`: Si se actualiza el ID del periodo, se actualiza en grupos
- ✅ Se agregaron índices:
  - `idx_periodo`: Índice en periodo_id
  - `idx_estado`: Índice en estado

### 5. **Tabla `usuarios`**
- ✅ Se agregaron campos:
  - `activo` (TINYINT): Para marcar usuarios activos/inactivos
  - `fecha_creacion` (TIMESTAMP): Registro de cuándo se creó el usuario
- ✅ Se agregó índice:
  - `idx_area`: Índice en área

### 6. **Tabla `programa_materias`**
- ✅ Se agregaron índices:
  - `idx_cve_materia`: Índice en clave de materia
  - `idx_grado`: Índice en grado
  - `idx_turno`: Índice en turno
  - `idx_activo`: Índice en activo

### 7. **Tabla `horarios`**
- ✅ Se agregó índice:
  - `idx_estado`: Índice en estado

---

## 🆕 NUEVA TABLA: `asignaciones`

Se creó una tabla completamente nueva para gestionar la relación entre docentes, materias, grupos y periodos.

### Estructura:
```sql
CREATE TABLE `asignaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `docente_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`docente_id`,`materia_id`,`grupo_id`,`periodo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relaciones:
- `docente_id` → `docentes.id` (ON DELETE CASCADE, ON UPDATE CASCADE)
- `materia_id` → `programa_materias.id` (ON DELETE CASCADE, ON UPDATE CASCADE)
- `grupo_id` → `grupos.id` (ON DELETE CASCADE, ON UPDATE CASCADE)
- `periodo_id` → `periodos.id` (ON DELETE CASCADE, ON UPDATE CASCADE)

### Funcionalidad:
Permite asignar docentes a materias específicas de grupos en periodos determinados, con trazabilidad completa.

---

## 🔗 ESQUEMA DE RELACIONES

```
periodos (TABLA CENTRAL)
├── grupos.periodo_id → RESTRICT (no eliminar si hay grupos)
├── horarios.periodo_id → CASCADE (eliminar horarios)
└── asignaciones.periodo_id → CASCADE (eliminar asignaciones)

programas
├── programa_materias.id_programa → CASCADE
    └── asignaciones.materia_id → CASCADE

docentes
└── asignaciones.docente_id → CASCADE

grupos
└── asignaciones.grupo_id → CASCADE

usuarios (INDEPENDIENTE)
```

---

## ⚙️ COMPORTAMIENTO DE CASCADAS

### Si eliminas un **PERIODO**:
- ❌ **NO** se eliminarán los grupos relacionados (RESTRICT lo impide)
- ✅ **SÍ** se eliminarán todos los horarios del periodo (CASCADE)
- ✅ **SÍ** se eliminarán todas las asignaciones del periodo (CASCADE)

### Si eliminas un **PROGRAMA**:
- ✅ **SÍ** se eliminarán todas las materias del programa (CASCADE)
- ✅ **SÍ** se eliminarán todas las asignaciones de esas materias (CASCADE transitivo)

### Si eliminas un **DOCENTE**:
- ✅ **SÍ** se eliminarán todas las asignaciones del docente (CASCADE)

### Si eliminas un **GRUPO**:
- ✅ **SÍ** se eliminarán todas las asignaciones del grupo (CASCADE)

### Si eliminas una **MATERIA**:
- ✅ **SÍ** se eliminarán todas las asignaciones de esa materia (CASCADE)

---

## 📝 ARCHIVOS PHP MODIFICADOS

### Archivos de Grupos:
1. **`php/grupos/guardar_grupo.php`**
   - Se agregó validación y manejo de `periodo_id`
   - Se valida que el periodo exista antes de crear el grupo

2. **`php/grupos/editar_grupo.php`**
   - Se agregó soporte para actualizar el `periodo_id`
   - Validación de periodo existente

3. **`php/grupos/obtener_grupos.php`**
   - Se agregó JOIN con la tabla `periodos`
   - Se incluye información del periodo en la respuesta

### Archivos de Periodos:
4. **`php/periodos/eliminar_periodo.php`**
   - Se agregaron validaciones pre-eliminación:
     - Verifica si hay grupos asociados (RESTRICT)
     - Cuenta horarios y asignaciones que se eliminarán (CASCADE)
     - Informa al usuario qué datos se eliminarán
   - Manejo de errores de claves foráneas

---

## 🆕 ARCHIVOS PHP NUEVOS

### Directorio: `php/asignaciones/`

1. **`crear_asignacion.php`**
   - Crear nuevas asignaciones docente-materia-grupo
   - Validaciones de existencia de todas las entidades
   - Prevención de duplicados

2. **`obtener_asignaciones.php`**
   - Obtener asignaciones con filtros opcionales:
     - Por periodo
     - Por docente
     - Por grupo
     - Por estado
   - Incluye JOIN con todas las tablas relacionadas

3. **`eliminar_asignacion.php`**
   - Eliminar asignaciones individuales
   - Validación de ID

4. **`editar_asignacion.php`**
   - Actualizar asignaciones existentes
   - Validación de duplicados
   - Permite cambiar estado y observaciones

---

## 📊 ESTADÍSTICAS DE DATOS

### Datos preservados en la migración:
- ✅ **85** docentes
- ✅ **35** grupos (ahora con periodo_id = 1 por defecto)
- ✅ **18** horarios
- ✅ **3** periodos
- ✅ **18** programas
- ✅ **701** materias de programas
- ✅ **9** usuarios

**TOTAL: 869 registros migrados exitosamente**

---

## 🔐 SEGURIDAD Y VALIDACIONES

### Validaciones implementadas:
1. ✅ Validación de existencia de claves foráneas antes de insertar
2. ✅ Prevención de eliminaciones que violan integridad referencial
3. ✅ Uso de prepared statements en todos los queries
4. ✅ Validación de tipos de datos
5. ✅ Manejo de errores con try-catch
6. ✅ Mensajes descriptivos al usuario

### Índices para optimización:
- Se crearon **25+ índices** para mejorar el rendimiento de consultas
- Índices en claves foráneas para JOINs rápidos
- Índices en campos de búsqueda frecuente

---

## 📥 INSTRUCCIONES DE IMPORTACIÓN

### En XAMPP:
1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Elimina la base de datos `sisca` si existe (hacer backup primero)
3. Clic en "Nueva" para crear una base de datos
4. Nombre: `sisca`, Cotejamiento: `utf8mb4_unicode_ci`
5. Clic en "Importar"
6. Selecciona el archivo: `/SISCA/db/sisca.sql`
7. Formato: SQL
8. Clic en "Continuar"

### Desde línea de comandos:
```bash
# Primero, hacer backup de la base de datos actual (si existe)
mysqldump -u root -p sisca > sisca_backup_$(date +%Y%m%d).sql

# Eliminar la base de datos actual
mysql -u root -p -e "DROP DATABASE IF EXISTS sisca;"

# Importar la nueva base de datos
mysql -u root -p < /path/to/SISCA/db/sisca.sql
```

---

## 🔍 VERIFICACIÓN POST-IMPORTACIÓN

Ejecuta estas consultas en phpMyAdmin para verificar:

```sql
-- Verificar que todas las tablas existan
SHOW TABLES;

-- Verificar relaciones de claves foráneas
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'sisca'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verificar cantidad de registros
SELECT 'docentes' as tabla, COUNT(*) as total FROM docentes
UNION ALL
SELECT 'grupos', COUNT(*) FROM grupos
UNION ALL
SELECT 'periodos', COUNT(*) FROM periodos
UNION ALL
SELECT 'programas', COUNT(*) FROM programas
UNION ALL
SELECT 'programa_materias', COUNT(*) FROM programa_materias
UNION ALL
SELECT 'horarios', COUNT(*) FROM horarios
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'asignaciones', COUNT(*) FROM asignaciones;
```

**Resultados esperados:**
- 8 tablas
- 8 relaciones de claves foráneas
- 869 registros totales (sin contar asignaciones, que inicia en 0)

---

## ⚠️ ARCHIVOS DE BACKUP

El archivo SQL original se respaldó automáticamente como:
- `SISCA/db/sisca_backup_YYYYMMDD_HHMMSS.sql`

**IMPORTANTE**: Mantén este archivo como respaldo por si necesitas revertir los cambios.

---

## 📞 SOPORTE

Para problemas o dudas sobre la implementación:
1. Revisa este documento completo
2. Verifica los logs de MySQL/MariaDB
3. Consulta el archivo SQL para ver la estructura exacta
4. Revisa los archivos PHP modificados para entender la lógica

---

**Documento generado el: 15 de Noviembre de 2025**
**Sistema: SISCA (Sistema Integral de Seguimiento de Carga Académica)**
**Versión de Base de Datos: 2.0**
