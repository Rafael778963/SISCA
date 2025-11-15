# Mejoras en Eliminación de Horarios y Períodos

## Resumen de Cambios

Se han implementado mejoras significativas en los procesos de eliminación de horarios y períodos para garantizar la integridad de datos y la sincronización entre base de datos y almacenamiento físico.

---

## 1. Mejoras en `eliminar_horarios.php`

### Cambios Implementados:

1. **Transacciones ACID**:
   - Se añadió `BEGIN TRANSACTION` para garantizar la atomicidad
   - Si ocurre un error, se hace `ROLLBACK` automático
   - Se añadió bloque `finally` para cerrar conexión

2. **Mejor Manejo de Errores**:
   - Validación de preparación de statements
   - Captura de excepciones detalladas
   - Respuestas de error más informativas

3. **Manejo Robusto de Archivos**:
   - Detecta si el archivo no existe en disco
   - Marca el registro como eliminado incluso si el archivo falta
   - Retorna advertencias en la respuesta JSON

4. **Información Adicional**:
   - Incluye `periodo_id` en la respuesta
   - Proporciona advertencias si hay problemas con el archivo físico

### Flujo de Eliminación:

```
POST /php/horarios/eliminar_horarios.php
  ↓
1. BEGIN TRANSACTION
2. Obtener ruta del archivo y período
3. Intentar eliminar archivo físico
4. Marcar registro como estado='eliminado' (SOFT DELETE)
5. COMMIT o ROLLBACK
6. Retornar JSON con detalles
```

### Ejemplo de Respuesta:

```json
{
  "success": true,
  "message": "Archivo eliminado correctamente",
  "archivo_eliminado": true,
  "advertencia": null,
  "id": 5,
  "periodo_id": 2
}
```

---

## 2. Mejoras en `eliminar_periodo.php`

### Cambios Implementados:

1. **Rutas Absolutas Correctas**:
   - Usa `__DIR__` para obtener ruta absoluta
   - Normaliza barras diagonales para compatibilidad cross-platform
   - Mejora construcción de rutas

2. **Validación de Carpetas Vacías**:
   - Verifica que la carpeta `periodo_X` esté vacía antes de eliminarla
   - Usa `scandir()` con validación correcta

3. **Conteo Detallado de Elementos**:
   - Cuenta y reporta horarios eliminados de la BD
   - Cuenta archivos PDF eliminados del disco
   - Reporta grupos eliminados

4. **Mejor Diagnóstico**:
   - Respuesta detallada con 4 métricas diferentes
   - Permite auditoría completa de qué se eliminó

### Flujo de Eliminación:

```
POST /php/periodos/eliminar_periodo.php
  ↓
1. BEGIN TRANSACTION
2. Obtener archivos del período
3. Eliminar cada archivo PDF del disco
4. Intentar eliminar carpeta periodo_X (si vacía)
5. Eliminar grupos relacionados
6. Contar horarios pendientes
7. Eliminar período (CASCADE elimina horarios de BD)
8. COMMIT o ROLLBACK
9. Retornar JSON con estadísticas
```

### Ejemplo de Respuesta:

```json
{
  "success": true,
  "message": "Periodo eliminado correctamente con todos sus datos",
  "detalles": {
    "grupos_eliminados": 5,
    "horarios_eliminados_bd": 8,
    "archivos_pdf_eliminados": 8,
    "archivos_totales_periodo": 8
  }
}
```

---

## 3. Nueva Función: Limpieza de Horarios Eliminados

### Ubicación:
`/php/horarios/limpiar_horarios_eliminados.php`

### Propósito:
Herramienta de mantenimiento para mantener la consistencia entre la BD y el almacenamiento físico.

### Funcionalidades:

#### a) Limpiar Registros Eliminados
```bash
POST /php/horarios/limpiar_horarios_eliminados.php

{
  "action": "limpiar_registros_eliminados"
}
```

- Elimina registros con `estado='eliminado'` de la BD
- Libera espacio en la base de datos
- Respuesta: Cantidad de registros eliminados

#### b) Limpiar Archivos Huérfanos
```bash
POST /php/horarios/limpiar_horarios_eliminados.php

{
  "action": "limpiar_archivos_huerfanos"
}
```

- Encuentra archivos en disco que no tienen registro en BD
- Elimina esos archivos
- Retorna lista de archivos eliminados
- Útil si hay corrupción de datos

#### c) Diagnóstico Completo
```bash
POST /php/horarios/limpiar_horarios_eliminados.php

{
  "action": "diagnostico"
}
```

- Analiza estado de la BD y archivos
- Reporta inconsistencias
- No elimina nada, solo diagnosis

### Ejemplo de Respuesta - Diagnóstico:

```json
{
  "success": true,
  "message": "Diagnóstico completado",
  "diagnostico": {
    "registros_activos": 12,
    "registros_eliminados": 3,
    "archivos_totales_en_disco": 12,
    "archivos_huerfanos": 0,
    "consistencia": "OK"
  }
}
```

---

## 4. Garantías de Integridad

### Durante la Eliminación de Horarios:

✅ Archivo físico eliminado antes de marcar como eliminado
✅ Transacción garantiza atomicidad
✅ Si falla cualquier paso, se revierte todo
✅ Si archivo no existe, se marca como eliminado de todas formas

### Durante la Eliminación de Períodos:

✅ Archivos eliminados antes de registros de BD
✅ CASCADE automático elimina horarios relacionados
✅ Carpeta `periodo_X` eliminada si está vacía
✅ Transacción garantiza consistencia total
✅ Estadísticas detalladas de qué se eliminó

### Mantenimiento Periódico:

✅ Diagnostico identifica inconsistencias
✅ Limpieza de registros "fantasma" (`estado='eliminado'`)
✅ Eliminación de archivos huérfanos
✅ Auditoría completa disponible

---

## 5. Tabla de Estados de Horarios

| Estado | Significado | En BD | En Disco |
|--------|------------|-------|---------|
| `activo` | Disponible y funcional | ✅ | ✅ |
| `eliminado` | Marcado para eliminar (soft delete) | ✅ | ❌ |
| (no existe) | Completamente eliminado (hard delete) | ❌ | ❌ |

---

## 6. Recomendaciones de Uso

1. **Eliminación de Horarios Individuales**:
   - Usuarios normales pueden eliminar horarios
   - Se usa soft delete (marca como eliminado)
   - Archivo se elimina inmediatamente del disco

2. **Eliminación de Períodos**:
   - Solo administradores deberían hacerlo
   - Elimina TODO (hard delete): archivos, horarios, grupos, período
   - Es irreversible

3. **Mantenimiento Mensual**:
   - Ejecutar diagnóstico: `limpiar_horarios_eliminados.php?action=diagnostico`
   - Si hay inconsistencias, limpiar archivos huérfanos
   - Cada trimestre, limpiar registros eliminados

4. **Recuperación de Emergencia**:
   - Con soft delete, pueden recuperarse horarios por un tiempo
   - Modificar estado de `'eliminado'` a `'activo'` en BD si es necesario
   - Después del hard delete, los datos son irrecuperables

---

## 7. Cambios en Respuestas JSON

### Antes (Viejo):
```json
{
  "success": true,
  "message": "Archivo eliminado correctamente",
  "archivo_eliminado": true,
  "id": 1
}
```

### Después (Nuevo):
```json
{
  "success": true,
  "message": "Archivo eliminado correctamente",
  "archivo_eliminado": true,
  "advertencia": null,
  "id": 1,
  "periodo_id": 2
}
```

---

## 8. Monitoreo de Errores

Revisar logs de error en:
- `/var/log/php-fpm/error.log` (si usa PHP-FPM)
- `/var/log/apache2/error.log` (si usa Apache)
- Consola del navegador (Ctrl+Shift+J / F12)

---

## Fecha de Implementación

- **Fecha**: 15 de Noviembre de 2025
- **Rama**: `claude/delete-schedule-pdf-db-017QpyxNCFfrqiv4f1AXUFi4`
- **Archivos Modificados**:
  - `/php/horarios/eliminar_horarios.php` (mejorado)
  - `/php/periodos/eliminar_periodo.php` (mejorado)
  - `/php/horarios/limpiar_horarios_eliminados.php` (nuevo)
