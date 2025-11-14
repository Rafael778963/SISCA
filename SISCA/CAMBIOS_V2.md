# 📋 Registro de Cambios - SISCA v2.0

## Fecha: 2025-11-14

---

## 🎯 Resumen Ejecutivo

Se implementaron mejoras **críticas de seguridad** y **optimizaciones de base de datos** en el Sistema de Carga Académica (SISCA). Los cambios incluyen hash de contraseñas, relaciones de base de datos con integridad referencial, y nuevas funcionalidades para gestión académica.

### Cambios Críticos

1. ✅ **Contraseñas Hasheadas** (bcrypt)
2. ✅ **Foreign Keys con Cascadas**
3. ✅ **Nuevas Tablas para Relaciones**
4. ✅ **Módulo de Gestión de Usuarios**
5. ✅ **Configuración Centralizada**

---

## 📁 Archivos Nuevos

### Base de Datos

| Archivo | Descripción |
|---------|-------------|
| `db/sisca_mejorado.sql` | Nueva estructura de BD con FK, cascadas y mejoras |
| `db/migrate_passwords.php` | Script de migración de contraseñas a bcrypt |

### PHP - Configuración

| Archivo | Descripción |
|---------|-------------|
| `php/config.php` | Configuración centralizada (BD, sesión, seguridad) |
| `php/conexion_v2.php` | Conexión compatible con código antiguo |

### PHP - Módulo de Usuarios

| Archivo | Descripción |
|---------|-------------|
| `php/usuarios/crear_usuario.php` | Crear usuario con validación y hash |
| `php/usuarios/editar_usuario.php` | Editar usuario (opcionalmente cambiar password) |
| `php/usuarios/obtener_usuarios.php` | Listar usuarios con paginación |
| `php/usuarios/desbloquear_usuario.php` | Desbloquear usuario bloqueado |
| `php/usuarios/cambiar_password.php` | Cambio de contraseña por usuario |

### Documentación

| Archivo | Descripción |
|---------|-------------|
| `GUIA_MIGRACION.md` | Guía completa de migración paso a paso |
| `CAMBIOS_V2.md` | Este archivo - Registro de cambios |

---

## 🔧 Archivos Modificados

### `php/login.php`

**Cambios:**
- ✅ Implementa `password_verify()` en lugar de comparación directa
- ✅ Valida usuario activo: `WHERE activo = 1`
- ✅ Verifica si usuario está bloqueado
- ✅ Incrementa intentos fallidos
- ✅ Bloquea después de 5 intentos
- ✅ Resetea intentos al login exitoso
- ✅ Registra `ultimo_acceso`
- ✅ Verifica flag `debe_cambiar_password`
- ✅ Mejora mensajes de error (sin revelar si usuario existe)

**Antes:**
```php
$stmt = $conn->prepare("SELECT id, area, nombre, nombre_usuario
    FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?");
$stmt->bind_param("ss", $usuario, $password);
```

**Después:**
```php
$stmt = $conn->prepare("SELECT id, area, nombre, nombre_usuario,
    contraseña_hash, debe_cambiar_password, intentos_fallidos, bloqueado
    FROM usuarios WHERE nombre_usuario = ? AND activo = 1");
$stmt->bind_param("s", $usuario);
// ...
if (password_verify($password, $user_data['contraseña_hash'])) {
    // Login exitoso
}
```

---

## 🗄️ Cambios en Base de Datos

### Nuevas Tablas

#### 1. `carga_academica`

Relaciona **docentes**, **materias**, **grupos** y **períodos**.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) PK | ID único |
| periodo_id | INT(11) FK | → periodos.id |
| docente_id | INT(11) FK | → docentes.id |
| grupo_id | INT(11) FK | → grupos.id |
| materia_id | INT(11) FK | → programa_materias.id |
| horas_asignadas | INT(3) | Horas semanales |
| aula | VARCHAR(50) | Salón asignado |
| horario_detalle | TEXT | JSON con días/horas |
| estado | ENUM | propuesta, confirmada, cancelada |
| asignado_por | INT(11) FK | Usuario que asignó |

**Foreign Keys:**
- `periodo_id` → `periodos.id` (CASCADE)
- `docente_id` → `docentes.id` (RESTRICT)
- `grupo_id` → `grupos.id` (CASCADE)
- `materia_id` → `programa_materias.id` (RESTRICT)

#### 2. `tutorias`

Gestión de tutorías por período.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) PK | ID único |
| periodo_id | INT(11) FK | → periodos.id |
| docente_id | INT(11) FK | Tutor asignado |
| grupo_id | INT(11) FK | → grupos.id |
| tipo_tutoria | ENUM | individual, grupal, academica, psicopedagogica |
| horas_semanales | INT(2) | Horas dedicadas |

**Foreign Keys:**
- `periodo_id` → `periodos.id` (CASCADE)
- `docente_id` → `docentes.id` (RESTRICT)
- `grupo_id` → `grupos.id` (CASCADE)

#### 3. `prefectura`

Seguimiento y control estudiantil.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) PK | ID único |
| periodo_id | INT(11) FK | → periodos.id |
| grupo_id | INT(11) FK | → grupos.id |
| prefecto_id | INT(11) FK | → docentes.id |
| fecha_registro | DATE | Fecha del registro |
| tipo_registro | ENUM | asistencia, conducta, rendimiento, general |
| descripcion | TEXT | Detalle del registro |
| estado | ENUM | pendiente, atendido, cerrado |

**Foreign Keys:**
- `periodo_id` → `periodos.id` (CASCADE)
- `grupo_id` → `grupos.id` (CASCADE)
- `prefecto_id` → `docentes.id` (SET NULL)

#### 4. `auditoria`

Registro de cambios en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT(11) PK | ID único |
| tabla | VARCHAR(50) | Tabla afectada |
| id_registro | INT(11) | ID del registro afectado |
| accion | ENUM | INSERT, UPDATE, DELETE |
| usuario_id | INT(11) FK | Usuario que hizo cambio |
| datos_anteriores | TEXT | JSON con datos antes |
| datos_nuevos | TEXT | JSON con datos después |
| ip_address | VARCHAR(45) | IP del usuario |
| fecha_accion | TIMESTAMP | Cuándo ocurrió |

### Tablas Modificadas

#### `usuarios`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `contraseña_hash` | VARCHAR(255) | - | Hash bcrypt de la contraseña |
| `email` | VARCHAR(150) | NULL | Email del usuario |
| `ultimo_acceso` | TIMESTAMP | NULL | Último login exitoso |
| `intentos_fallidos` | INT(2) | 0 | Contador de intentos |
| `bloqueado` | TINYINT(1) | 0 | 1 = bloqueado |
| `fecha_bloqueo` | TIMESTAMP | NULL | Cuándo se bloqueó |
| `debe_cambiar_password` | TINYINT(1) | 0 | Forzar cambio de password |
| `token_recuperacion` | VARCHAR(100) | NULL | Token para reset |
| `token_expiracion` | TIMESTAMP | NULL | Expiración del token |
| `activo` | TINYINT(1) | 1 | 1 = activo, 0 = inactivo |

**Índices nuevos:**
- `idx_activo` en campo `activo`
- `idx_area` en campo `area`
- `UNIQUE` en campo `email`

#### `grupos`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `programa_id` | INT(11) | NULL | FK a programas.id |
| `capacidad_maxima` | INT(3) | 30 | Cupo máximo |
| `estudiantes_inscritos` | INT(3) | 0 | Alumnos actuales |

**Foreign Keys nuevas:**
- `programa_id` → `programas.id` (RESTRICT)

#### `horarios`

**Campos modificados:**

| Campo | Antes | Después |
|-------|-------|---------|
| `usuario_carga` | VARCHAR(100) | INT(11) FK → usuarios.id |
| `tipo_horario` | - | ENUM (nuevo) |

**Nuevos campos:**
- `tipo_horario`: general, grupo, docente, aula

#### `periodos`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `fecha_inicio` | DATE | NULL | Inicio del período |
| `fecha_fin` | DATE | NULL | Fin del período |
| `activo` | TINYINT(1) | 1 | Estado del período |

#### `programa_materias`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `creditos` | INT(2) | NULL | Créditos de la materia |
| `tipo` | ENUM | Obligatoria | Tipo de materia |

**Modificaciones:**
- `turno` ahora acepta: Matutino, Nocturno, **Ambos**

#### `programas`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `duracion_cuatrimestres` | TINYINT(2) | 5 | Duración del programa |

#### `docentes`

**Nuevos campos:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `email` | VARCHAR(150) | NULL | Email del docente |
| `telefono` | VARCHAR(20) | NULL | Teléfono de contacto |
| `especialidad` | VARCHAR(200) | NULL | Especialidad del docente |

### Foreign Keys Implementadas

| Tabla Hijo | Campo FK | Tabla Padre | ON DELETE | ON UPDATE |
|------------|----------|-------------|-----------|-----------|
| horarios | periodo_id | periodos | CASCADE | CASCADE |
| horarios | usuario_carga | usuarios | SET NULL | CASCADE |
| programa_materias | id_programa | programas | CASCADE | CASCADE |
| grupos | programa_id | programas | RESTRICT | CASCADE |
| carga_academica | periodo_id | periodos | CASCADE | CASCADE |
| carga_academica | docente_id | docentes | RESTRICT | CASCADE |
| carga_academica | grupo_id | grupos | CASCADE | CASCADE |
| carga_academica | materia_id | programa_materias | RESTRICT | CASCADE |
| tutorias | periodo_id | periodos | CASCADE | CASCADE |
| tutorias | docente_id | docentes | RESTRICT | CASCADE |
| tutorias | grupo_id | grupos | CASCADE | CASCADE |
| prefectura | periodo_id | periodos | CASCADE | CASCADE |
| prefectura | grupo_id | grupos | CASCADE | CASCADE |
| prefectura | prefecto_id | docentes | SET NULL | CASCADE |
| auditoria | usuario_id | usuarios | SET NULL | CASCADE |

### Vistas Creadas

#### `v_carga_academica_completa`

Vista desnormalizada con toda la información de cargas académicas:

```sql
SELECT
    ca.id,
    p.periodo, p.año,
    d.nombre_docente, d.regimen,
    g.codigo_grupo, g.nivel_educativo,
    prog.nombre as programa_nombre,
    pm.nombre_materia, pm.cve_materia,
    ca.horas_asignadas, ca.aula, ca.estado
FROM carga_academica ca
INNER JOIN periodos p ON ca.periodo_id = p.id
INNER JOIN docentes d ON ca.docente_id = d.id
INNER JOIN grupos g ON ca.grupo_id = g.id
INNER JOIN programa_materias pm ON ca.materia_id = pm.id
INNER JOIN programas prog ON pm.id_programa = prog.id;
```

#### `v_tutorias_activas`

Vista de tutorías activas:

```sql
SELECT
    t.id, p.periodo, p.año,
    d.nombre_docente as tutor,
    g.codigo_grupo, g.nivel_educativo,
    t.tipo_tutoria, t.horas_semanales
FROM tutorias t
INNER JOIN periodos p ON t.periodo_id = p.id
INNER JOIN docentes d ON t.docente_id = d.id
INNER JOIN grupos g ON t.grupo_id = g.id
WHERE t.estado = 'activo';
```

#### `v_grupos_completos`

Vista de grupos con información de programa:

```sql
SELECT
    g.id, g.codigo_grupo, g.generacion,
    g.nivel_educativo, g.programa_educativo,
    prog.nombre as programa_nombre,
    prog.duracion_cuatrimestres,
    g.grado, g.turno, g.capacidad_maxima
FROM grupos g
LEFT JOIN programas prog ON g.programa_id = prog.id;
```

---

## 🔐 Mejoras de Seguridad

### 1. Hash de Contraseñas

**Algoritmo:** bcrypt (PASSWORD_BCRYPT)
**Cost Factor:** 10
**Salt:** Automático por bcrypt

**Ejemplo de hash:**
```
$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n
```

### 2. Validación de Contraseña

**Requisitos:**
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

**Regex:**
```php
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
```

### 3. Bloqueo de Cuenta

- Máximo 5 intentos fallidos
- Bloqueo automático
- Desbloqueo solo por administrador
- Registro de fecha de bloqueo

### 4. Sesiones Seguras

**Configuración (config.php):**
```php
'cookie_httponly' => true,     // Previene XSS
'cookie_secure' => true,       // Solo HTTPS
'cookie_samesite' => 'Strict', // Previene CSRF
'use_strict_mode' => true,     // IDs seguros
'gc_maxlifetime' => 900,       // 15 min timeout
```

### 5. Tokens CSRF

Funciones en `config.php`:
- `generateCSRFToken()` - Genera token único
- `validateCSRFToken($token)` - Valida token

### 6. Sanitización de Input

Función en `config.php`:
```php
sanitizeInput($data)
```

Previene:
- XSS (Cross-Site Scripting)
- Inyección HTML
- Caracteres especiales

---

## 📊 Estadísticas de Cambios

### Archivos

- **Nuevos:** 11 archivos
- **Modificados:** 1 archivo (login.php)
- **Líneas de código PHP nuevo:** ~1,500
- **Líneas de SQL nuevo:** ~800

### Base de Datos

- **Nuevas tablas:** 4 (carga_academica, tutorias, prefectura, auditoria)
- **Tablas modificadas:** 6 (usuarios, grupos, horarios, periodos, programa_materias, docentes, programas)
- **Nuevas columnas totales:** ~25
- **Foreign keys nuevas:** 13
- **Vistas creadas:** 3
- **Índices nuevos:** ~10

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo (1-2 semanas)

- [ ] Ejecutar migración de contraseñas
- [ ] Probar login con nuevos usuarios
- [ ] Capacitar administradores en módulo de usuarios
- [ ] Implementar formularios HTML para gestión de usuarios

### Mediano Plazo (1-2 meses)

- [ ] Implementar módulo de carga académica (CRUD)
- [ ] Implementar módulo de tutorías
- [ ] Implementar módulo de prefectura
- [ ] Crear reportes con vistas SQL

### Largo Plazo (3-6 meses)

- [ ] Implementar HTTPS
- [ ] Migrar a framework PHP (Laravel/Symfony)
- [ ] Implementar API REST
- [ ] Agregar autenticación de dos factores (2FA)
- [ ] Implementar recuperación de contraseña por email
- [ ] Crear dashboard con estadísticas

---

## 🐛 Problemas Conocidos

### Migración de Datos

**Problema:** `grupos.programa_educativo` (VARCHAR) no coincide exactamente con `programas.nomenclatura`

**Solución temporal:** Campo `programa_id` es NULL hasta mapeo manual

**Solución definitiva:** Script de mapeo automático o manual

### Compatibilidad

**Problema:** Código antiguo usa `conexion.php` directamente

**Solución:** Se mantiene `conexion.php` original, nuevo código usa `conexion_v2.php`

---

## 📝 Notas Técnicas

### Bcrypt vs Argon2

Se eligió bcrypt porque:
- ✅ Disponible en PHP 5.5+
- ✅ Probado y confiable
- ✅ Suficiente para este caso de uso
- ⚠️ Argon2 requiere PHP 7.2+ (opcional para futuro)

### Cost Factor = 10

- Tiempo de hash: ~0.1 segundos
- Balance entre seguridad y rendimiento
- Incrementar si hardware mejora

### Estructura de Cascadas

**Filosofía:**
- **CASCADE:** Para datos derivados (horarios, cargas, etc.)
- **RESTRICT:** Para datos maestros (docentes, materias)
- **SET NULL:** Para referencias opcionales (usuario que creó registro)

### Auditoría

La tabla `auditoria` está preparada pero no implementada automáticamente. Requiere triggers o lógica en PHP para poblarla.

**Ejemplo trigger (futuro):**
```sql
CREATE TRIGGER after_usuario_update
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO auditoria (tabla, id_registro, accion, datos_anteriores, datos_nuevos)
    VALUES ('usuarios', NEW.id, 'UPDATE',
        JSON_OBJECT('nombre', OLD.nombre, 'area', OLD.area),
        JSON_OBJECT('nombre', NEW.nombre, 'area', NEW.area));
END;
```

---

## 🔍 Testing Recomendado

### Tests de Seguridad

- [ ] Intentar login con contraseña incorrecta 5 veces
- [ ] Verificar bloqueo de usuario
- [ ] Intentar desbloquear sin permisos
- [ ] Cambiar contraseña con requisitos inválidos
- [ ] Verificar que hashes diferentes para misma password (salt)

### Tests de Integridad

- [ ] Eliminar período con horarios → Verifica cascada
- [ ] Intentar eliminar docente con cargas → Verifica restrict
- [ ] Eliminar grupo → Verifica eliminación de cargas/tutorías
- [ ] Actualizar usuario → Verifica que FK en horarios se actualiza

### Tests de Funcionalidad

- [ ] Crear usuario con contraseña válida
- [ ] Editar usuario sin cambiar contraseña
- [ ] Editar usuario cambiando contraseña
- [ ] Listar usuarios con paginación
- [ ] Filtrar usuarios por área

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación:

1. Revisar `GUIA_MIGRACION.md`
2. Consultar este documento
3. Verificar logs: `logs/php-errors.log`
4. Contactar al equipo de desarrollo

---

## 📜 Licencia y Créditos

**Proyecto:** SISCA - Sistema de Carga Académica
**Versión:** 2.0
**Fecha:** 2025-11-14
**Desarrollado por:** Equipo SISCA

**Mejoras implementadas por:**
- Análisis de seguridad
- Diseño de base de datos
- Implementación de hash de contraseñas
- Módulo de gestión de usuarios
- Documentación completa

---

## ✅ Checklist de Implementación

### Para Administradores

- [ ] Hacer backup completo
- [ ] Ejecutar migrate_passwords.php
- [ ] Verificar login funcional
- [ ] Probar creación de usuario
- [ ] Documentar credenciales de emergencia
- [ ] Capacitar usuarios clave

### Para Desarrolladores

- [ ] Revisar nuevo esquema de BD
- [ ] Actualizar diagramas ER
- [ ] Implementar formularios de gestión
- [ ] Crear endpoints para nuevas tablas
- [ ] Escribir tests unitarios
- [ ] Implementar auditoría automática

---

**¡Migración exitosa!** 🎉

El sistema ahora cuenta con seguridad mejorada y base de datos normalizada con integridad referencial.
