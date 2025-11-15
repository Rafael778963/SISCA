# GUÍA RÁPIDA DE USO - SISCA
## Sistema con Relaciones de Integridad Referencial

---

## 🚀 INICIO RÁPIDO

### 1. Importar la Base de Datos

**Opción A: Usando phpMyAdmin**
```
1. Ir a http://localhost/phpmyadmin
2. Crear base de datos "sisca" (si no existe)
3. Importar → Seleccionar archivo SISCA/db/sisca.sql
4. Clic en "Continuar"
```

**Opción B: Línea de comandos**
```bash
mysql -u root -p < SISCA/db/sisca.sql
```

---

## 📝 CÓMO USAR LAS NUEVAS FUNCIONALIDADES

### **GESTIÓN DE GRUPOS**

Ahora los grupos **requieren** un periodo asociado:

**Crear grupo:**
```javascript
// POST a php/grupos/guardar_grupo.php
{
  "generacion": "51",
  "nivel": "TSU",
  "programa": "TSUQAI",
  "grado": "3",
  "turno": "M",
  "periodo_id": 1  // ← NUEVO CAMPO OBLIGATORIO
}
```

**Editar grupo:**
```javascript
// POST a php/grupos/editar_grupo.php
{
  "id": 3,
  "generacion": "51",
  "nivel": "TSU",
  "programa": "TSUQAI",
  "grado": "3",
  "turno": "M",
  "periodo_id": 2  // ← Se puede cambiar el periodo
}
```

**Obtener grupos:**
```javascript
// GET a php/grupos/obtener_grupos.php?estado=activo
// Ahora incluye información del periodo:
{
  "success": true,
  "data": [
    {
      "id": 3,
      "periodo_id": 1,
      "codigo_grupo": "51TSUQAI3M",
      "periodo": "Enero - Abril",  // ← Información del periodo
      "año": 2025,
      ...
    }
  ]
}
```

---

### **GESTIÓN DE PERIODOS**

**⚠️ IMPORTANTE**: Ya no se pueden eliminar periodos que tengan grupos asociados.

**Eliminar periodo:**
```javascript
// POST a php/periodos/eliminar_periodo.php
{
  "id": 1
}

// Si tiene grupos asociados, retorna:
{
  "success": false,
  "message": "No se puede eliminar el periodo porque tiene 35 grupo(s) asociado(s).
              Primero debe reasignar o eliminar los grupos."
}

// Si NO tiene grupos pero tiene horarios:
{
  "success": true,
  "message": "Periodo eliminado correctamente. También se eliminaron: 18 horario(s),
              5 asignación(es)"
}
```

---

### **GESTIÓN DE ASIGNACIONES** 🆕

Nueva funcionalidad para asignar docentes a materias específicas de grupos en periodos determinados.

**Crear asignación:**
```javascript
// POST a php/asignaciones/crear_asignacion.php
{
  "docente_id": 1,      // ID del docente
  "materia_id": 15,     // ID de la materia (de programa_materias)
  "grupo_id": 3,        // ID del grupo
  "periodo_id": 1,      // ID del periodo
  "observaciones": "Clase los martes y jueves"  // Opcional
}

// Respuesta exitosa:
{
  "success": true,
  "message": "Asignación creada exitosamente",
  "data": {
    "id": 1,
    "docente_id": 1,
    "docente_nombre": "Adalberta Jiménez Salgado",
    "materia_id": 15,
    "materia_nombre": "Inglés III",
    "materia_cve": "EVND-C3-15",
    "grupo_id": 3,
    "grupo_codigo": "51TSUQAI3M",
    "periodo_id": 1,
    "periodo_nombre": "Enero - Abril",
    "observaciones": "Clase los martes y jueves"
  }
}
```

**Obtener asignaciones con filtros:**
```javascript
// GET a php/asignaciones/obtener_asignaciones.php

// Todas las asignaciones activas:
?estado=activo

// Por periodo:
?periodo_id=1

// Por docente:
?docente_id=1

// Por grupo:
?grupo_id=3

// Combinado:
?periodo_id=1&docente_id=1&estado=activo
```

**Editar asignación:**
```javascript
// POST a php/asignaciones/editar_asignacion.php
{
  "id": 1,
  "docente_id": 2,      // Cambiar docente
  "materia_id": 15,
  "grupo_id": 3,
  "periodo_id": 1,
  "estado": "inactivo", // Cambiar estado
  "observaciones": "Cambio de horario"
}
```

**Eliminar asignación:**
```javascript
// POST a php/asignaciones/eliminar_asignacion.php
{
  "id": 1
}
```

---

## 🔄 EFECTOS EN CASCADA

### **Al eliminar un PERIODO:**
```
❌ NO elimina: Grupos (protegido por RESTRICT)
✅ SÍ elimina:
   - Todos los horarios del periodo
   - Todas las asignaciones del periodo
```

### **Al eliminar un PROGRAMA:**
```
✅ SÍ elimina:
   - Todas las materias del programa
   - Todas las asignaciones de esas materias
```

### **Al eliminar un DOCENTE:**
```
✅ SÍ elimina:
   - Todas las asignaciones del docente
```

### **Al eliminar un GRUPO:**
```
✅ SÍ elimina:
   - Todas las asignaciones del grupo
```

### **Al eliminar una MATERIA:**
```
✅ SÍ elimina:
   - Todas las asignaciones de esa materia
```

---

## 🎯 CASOS DE USO COMUNES

### **Caso 1: Inicio de Periodo Nuevo**

1. Crear el nuevo periodo:
```sql
INSERT INTO periodos (periodo, año) VALUES ('Enero - Abril', 2026);
```

2. Crear grupos para el nuevo periodo:
```javascript
// Asegurarse de usar el periodo_id correcto
{
  "generacion": "52",
  "nivel": "TSU",
  "programa": "TSUQAI",
  "grado": "1",
  "turno": "M",
  "periodo_id": 4  // ID del nuevo periodo
}
```

3. Asignar docentes a materias:
```javascript
{
  "docente_id": 1,
  "materia_id": 1,
  "grupo_id": 36,  // ID del grupo recién creado
  "periodo_id": 4
}
```

---

### **Caso 2: Cambiar Grupo de Periodo**

```javascript
// PATCH/POST a php/grupos/editar_grupo.php
{
  "id": 3,
  "periodo_id": 2,  // Cambiar del periodo 1 al 2
  // ... otros campos sin cambios
}
```

**Efecto:** El grupo ahora pertenece al periodo 2, pero sus asignaciones anteriores (del periodo 1) siguen existiendo.

---

### **Caso 3: Ver Carga Académica de un Docente**

```javascript
// GET a php/asignaciones/obtener_asignaciones.php?docente_id=1&periodo_id=1

// Retorna todas las materias y grupos asignados al docente en ese periodo:
{
  "success": true,
  "data": [
    {
      "docente_nombre": "Adalberta Jiménez Salgado",
      "nombre_materia": "Inglés III",
      "codigo_grupo": "51TSUQAI3M",
      "horas_semanales": 5,
      ...
    },
    ...
  ],
  "total": 5
}
```

---

### **Caso 4: Ver Horario de un Grupo**

```javascript
// GET a php/asignaciones/obtener_asignaciones.php?grupo_id=3&periodo_id=1

// Retorna todas las materias y docentes asignados al grupo en ese periodo:
{
  "success": true,
  "data": [
    {
      "codigo_grupo": "51TSUQAI3M",
      "nombre_materia": "Inglés III",
      "docente_nombre": "Adalberta Jiménez Salgado",
      "horas_semanales": 5,
      ...
    },
    ...
  ],
  "total": 8
}
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### **Error: "Cannot delete or update a parent row"**
**Causa:** Intentas eliminar un registro que tiene datos relacionados protegidos.
**Solución:** Primero elimina o reasigna los datos relacionados.

### **Error: "El periodo seleccionado no existe"**
**Causa:** El periodo_id no existe en la tabla periodos.
**Solución:** Verifica que el periodo existe o créalo primero.

### **Error: "Esta asignación ya existe"**
**Causa:** Ya existe una asignación con el mismo docente, materia, grupo y periodo.
**Solución:** Usa editar en lugar de crear, o verifica los IDs.

### **Error: "No se puede eliminar el periodo porque tiene grupos"**
**Causa:** El periodo tiene grupos asociados (restricción RESTRICT).
**Solución:**
1. Reasigna los grupos a otro periodo
2. O elimina los grupos primero
3. Luego elimina el periodo

---

## 🔧 CONSULTAS SQL ÚTILES

### **Ver todos los grupos de un periodo:**
```sql
SELECT g.*, p.periodo, p.año
FROM grupos g
JOIN periodos p ON g.periodo_id = p.id
WHERE g.periodo_id = 1;
```

### **Ver asignaciones completas:**
```sql
SELECT
    d.nombre_docente,
    pm.nombre_materia,
    g.codigo_grupo,
    p.periodo,
    a.estado
FROM asignaciones a
JOIN docentes d ON a.docente_id = d.id
JOIN programa_materias pm ON a.materia_id = pm.id
JOIN grupos g ON a.grupo_id = g.id
JOIN periodos p ON a.periodo_id = p.id
WHERE a.estado = 'activo';
```

### **Contar asignaciones por docente:**
```sql
SELECT
    d.nombre_docente,
    COUNT(*) as total_asignaciones,
    SUM(pm.horas_semanales) as horas_totales
FROM asignaciones a
JOIN docentes d ON a.docente_id = d.id
JOIN programa_materias pm ON a.materia_id = pm.id
WHERE a.estado = 'activo'
GROUP BY d.id
ORDER BY horas_totales DESC;
```

### **Ver grupos sin asignaciones:**
```sql
SELECT g.*
FROM grupos g
LEFT JOIN asignaciones a ON g.id = a.grupo_id AND a.periodo_id = g.periodo_id
WHERE a.id IS NULL
AND g.estado = 'activo';
```

---

## 📊 DIAGRAMA DE FLUJO DE DATOS

```
PERIODOS
    │
    ├──[RESTRICT]──► GRUPOS ◄──┐
    │                   │       │
    ├──[CASCADE]──► HORARIOS    │
    │                           │
    └──[CASCADE]──┐             │
                  │             │
                  ▼             │
            ASIGNACIONES ◄──────┤
                  ▲             │
                  │             │
    ┌─────────────┼─────────────┘
    │             │
DOCENTES    PROGRAMA_MATERIAS
    │             ▲
    │             │
    │         PROGRAMAS
    │
    └──[INDEPENDIENTE]── USUARIOS
```

---

## 💡 TIPS Y MEJORES PRÁCTICAS

1. **Siempre crea el periodo antes de crear grupos**
2. **Verifica las asignaciones antes de eliminar docentes o grupos**
3. **Usa filtros en obtener_asignaciones.php para reportes específicos**
4. **Mantén actualizado el estado de las asignaciones (activo/inactivo)**
5. **Usa el campo observaciones para notas importantes**
6. **Realiza backups antes de eliminar periodos con muchos datos**

---

**Sistema: SISCA v2.0**
**Última actualización: 15 de Noviembre de 2025**
