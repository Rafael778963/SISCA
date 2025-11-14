# 🚀 Guía de Migración - SISCA v2.0

## Fecha: 2025-11-14

---

## 📋 Índice

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Mejoras de Seguridad](#mejoras-de-seguridad)
3. [Nuevas Tablas y Relaciones](#nuevas-tablas-y-relaciones)
4. [Pasos de Migración](#pasos-de-migración)
5. [Verificación Post-Migración](#verificación-post-migración)
6. [Rollback (Si es necesario)](#rollback-si-es-necesario)
7. [FAQs](#faqs)

---

## 🎯 Resumen de Cambios

### Cambios Críticos

1. **✅ Contraseñas Hasheadas**
   - Migración de contraseñas en texto plano a bcrypt
   - Implementación de `password_hash()` y `password_verify()`
   - Sistema de bloqueo por intentos fallidos

2. **✅ Foreign Keys y Cascadas**
   - Relaciones entre tablas con integridad referencial
   - Eliminaciones en cascada para mantener consistencia
   - Restricciones para proteger datos críticos

3. **✅ Nuevas Tablas**
   - `carga_academica` - Asignación docente-materia-grupo
   - `tutorias` - Gestión de tutorías
   - `prefectura` - Seguimiento estudiantil
   - `auditoria` - Registro de cambios

4. **✅ Módulo de Gestión de Usuarios**
   - CRUD completo de usuarios
   - Cambio de contraseña
   - Desbloqueo de usuarios

### Archivos Nuevos

```
SISCA/
├── db/
│   ├── sisca_mejorado.sql          # Nueva estructura de BD
│   └── migrate_passwords.php        # Script de migración
├── php/
│   ├── config.php                   # Configuración centralizada
│   ├── conexion_v2.php             # Conexión compatible
│   └── usuarios/                    # Módulo de usuarios
│       ├── crear_usuario.php
│       ├── editar_usuario.php
│       ├── obtener_usuarios.php
│       ├── desbloquear_usuario.php
│       └── cambiar_password.php
└── GUIA_MIGRACION.md               # Este archivo
```

### Archivos Modificados

- `php/login.php` - Implementa `password_verify()`

---

## 🔒 Mejoras de Seguridad

### 1. Hash de Contraseñas

**Antes:**
```php
WHERE nombre_usuario = ? AND contraseña = ?
```

**Ahora:**
```php
WHERE nombre_usuario = ?
// Luego verificar con:
password_verify($password, $hash)
```

**Beneficios:**
- ✅ Contraseñas no legibles en BD
- ✅ Protección ante ataques de fuerza bruta
- ✅ Salt automático por bcrypt

### 2. Bloqueo por Intentos Fallidos

- Máximo 5 intentos fallidos
- Bloqueo automático del usuario
- Desbloqueo solo por administrador

### 3. Campos de Seguridad Añadidos a `usuarios`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `contraseña_hash` | VARCHAR(255) | Hash bcrypt de la contraseña |
| `debe_cambiar_password` | TINYINT(1) | Forzar cambio en próximo login |
| `intentos_fallidos` | INT(2) | Contador de intentos |
| `bloqueado` | TINYINT(1) | Estado de bloqueo |
| `fecha_bloqueo` | TIMESTAMP | Cuándo se bloqueó |
| `ultimo_acceso` | TIMESTAMP | Último login exitoso |
| `token_recuperacion` | VARCHAR(100) | Token para reset de password |
| `token_expiracion` | TIMESTAMP | Expiración del token |

---

## 🔗 Nuevas Tablas y Relaciones

### Diagrama de Relaciones

```
periodos (1) ──┬── (N) horarios [CASCADE]
               ├── (N) carga_academica [CASCADE]
               ├── (N) tutorias [CASCADE]
               └── (N) prefectura [CASCADE]

programas (1) ──┬── (N) programa_materias [CASCADE]
                └── (N) grupos [RESTRICT]

grupos (1) ──┬── (N) carga_academica [CASCADE]
             ├── (N) tutorias [CASCADE]
             └── (N) prefectura [CASCADE]

docentes (1) ──┬── (N) carga_academica [RESTRICT]
               ├── (N) tutorias [RESTRICT]
               └── (N) prefectura [SET NULL]

usuarios (1) ──┬── (N) horarios.usuario_carga [SET NULL]
               ├── (N) carga_academica.asignado_por [SET NULL]
               ├── (N) prefectura.registrado_por [SET NULL]
               └── (N) auditoria.usuario_id [SET NULL]
```

### Explicación de Cascadas

#### ON DELETE CASCADE
**Cuando se elimina el padre, se eliminan los hijos automáticamente**

Ejemplos:
- Eliminar un `periodo` → Elimina sus `horarios`, `cargas`, `tutorías`, `prefecturas`
- Eliminar un `programa` → Elimina sus `materias`
- Eliminar un `grupo` → Elimina sus `cargas`, `tutorías`, `prefecturas`

#### ON DELETE RESTRICT
**No permite eliminar el padre si tiene hijos**

Ejemplos:
- No se puede eliminar un `docente` si tiene `cargas académicas` activas
- No se puede eliminar un `programa` si tiene `grupos` activos
- No se puede eliminar una `materia` si está asignada en `cargas`

#### ON DELETE SET NULL
**Cuando se elimina el padre, los hijos ponen NULL en la FK**

Ejemplos:
- Eliminar un `usuario` → Los `horarios` que subió quedan sin usuario (NULL)
- Eliminar un `prefecto` → Los registros de `prefectura` quedan sin prefecto

---

## 📝 Pasos de Migración

### ⚠️ IMPORTANTE: Hacer Backup

```bash
# 1. Backup de base de datos
mysqldump -u root -p sisca > backup_sisca_$(date +%Y%m%d_%H%M%S).sql

# 2. Backup de archivos
cp -r /path/to/SISCA /path/to/SISCA_backup_$(date +%Y%m%d_%H%M%S)
```

### Opción A: Migración Gradual (Recomendada)

Esta opción permite mantener el sistema antiguo funcionando durante la transición.

#### Paso 1: Agregar Nuevas Columnas a Tabla Usuarios

```sql
ALTER TABLE usuarios ADD COLUMN contraseña_hash VARCHAR(255) NULL AFTER contraseña;
ALTER TABLE usuarios ADD COLUMN debe_cambiar_password TINYINT(1) DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN ultimo_acceso TIMESTAMP NULL;
ALTER TABLE usuarios ADD COLUMN intentos_fallidos INT(2) DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN bloqueado TINYINT(1) DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN fecha_bloqueo TIMESTAMP NULL;
ALTER TABLE usuarios ADD COLUMN token_recuperacion VARCHAR(100) NULL;
ALTER TABLE usuarios ADD COLUMN token_expiracion TIMESTAMP NULL;
ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) DEFAULT 1;
```

#### Paso 2: Migrar Contraseñas

```bash
# Desde línea de comandos
cd /path/to/SISCA/db
php migrate_passwords.php

# O desde navegador (solo localhost)
# http://localhost/SISCA/db/migrate_passwords.php
```

**Salida esperada:**
```
============================================================
SCRIPT DE MIGRACIÓN DE CONTRASEÑAS - SISCA v2.0
============================================================

✓ Conexión establecida exitosamente
✓ Columna 'contraseña_hash' creada exitosamente
✓ Backup creado en tabla: usuarios_password_backup_20251114_120000
  Registros respaldados: 9

Migrando contraseñas...
  [1/9] SUBDIRECTOR_ACADÉMICO ... ✓ OK
  [2/9] PTC_CARGA_ACADÉMICA ... ✓ OK
  ...
  [9/9] PROYECTO_INTEGRADOR ... ✓ OK

Total usuarios:     9
Migrados:           9
Errores:            0

✓ Migración completada exitosamente
```

#### Paso 3: Actualizar login.php

**El archivo `php/login.php` ya ha sido actualizado.**

Verificar que contiene:
```php
password_verify($password, $user_data['contraseña_hash'])
```

#### Paso 4: Probar Login

1. Ir a la página de login
2. Intentar iniciar sesión con un usuario
3. Verificar que funcione correctamente
4. Verificar que se registre `ultimo_acceso`

```sql
SELECT id, nombre_usuario, ultimo_acceso FROM usuarios;
```

#### Paso 5: Eliminar Columna de Contraseña en Texto Plano

**⚠️ SOLO DESPUÉS DE CONFIRMAR QUE TODO FUNCIONA**

```sql
-- Verificar que todos los usuarios tengan contraseña_hash
SELECT nombre_usuario FROM usuarios WHERE contraseña_hash IS NULL;

-- Si no hay resultados, eliminar columna antigua
ALTER TABLE usuarios DROP COLUMN contraseña;
```

#### Paso 6: Crear Nuevas Tablas

```sql
-- Ejecutar solo las partes de sisca_mejorado.sql que crean las nuevas tablas
-- Ver secciones:
-- - carga_academica
-- - tutorias
-- - prefectura
-- - auditoria
```

#### Paso 7: Agregar Foreign Keys

```sql
-- Agregar FK a grupos (si no existe programa_id)
ALTER TABLE grupos ADD COLUMN programa_id INT(11) NULL;
ALTER TABLE grupos ADD CONSTRAINT fk_grupo_programa
    FOREIGN KEY (programa_id) REFERENCES programas(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Actualizar programa_id basado en programa_educativo
-- (Esto requiere mapeo manual o script)

-- Agregar FK a horarios.usuario_carga
ALTER TABLE horarios MODIFY COLUMN usuario_carga INT(11) NULL;
ALTER TABLE horarios ADD CONSTRAINT fk_usuario_horarios
    FOREIGN KEY (usuario_carga) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE;
```

### Opción B: Migración Completa (Avanzada)

Si prefieres empezar de cero con la nueva estructura:

```bash
# 1. Backup completo
mysqldump -u root -p sisca > backup_sisca_completo.sql

# 2. Exportar solo datos (sin estructura)
mysqldump -u root -p sisca --no-create-info > datos_sisca.sql

# 3. Crear nueva base de datos
mysql -u root -p < db/sisca_mejorado.sql

# 4. Importar datos (necesitará ajustes manuales)
# Editar datos_sisca.sql para ajustar a nueva estructura
mysql -u root -p sisca < datos_sisca_ajustado.sql
```

---

## ✅ Verificación Post-Migración

### Checklist de Verificación

- [ ] **Login funciona correctamente**
  - Prueba con usuario válido
  - Prueba con contraseña incorrecta
  - Verifica contador de intentos fallidos
  - Verifica bloqueo después de 5 intentos

- [ ] **Contraseñas están hasheadas**
  ```sql
  SELECT id, nombre_usuario,
         LEFT(contraseña_hash, 20) as hash_preview
  FROM usuarios;
  ```
  Debe mostrar: `$2y$10$...`

- [ ] **Nuevo módulo de usuarios funciona**
  - Crear usuario
  - Editar usuario
  - Listar usuarios
  - Desbloquear usuario
  - Cambiar contraseña

- [ ] **Foreign keys funcionan**
  ```sql
  -- Intentar eliminar un período con horarios
  DELETE FROM periodos WHERE id = 1;
  -- Debe eliminar horarios en cascada
  ```

- [ ] **Tablas nuevas creadas**
  ```sql
  SHOW TABLES LIKE 'carga_academica';
  SHOW TABLES LIKE 'tutorias';
  SHOW TABLES LIKE 'prefectura';
  SHOW TABLES LIKE 'auditoria';
  ```

- [ ] **Backup existe y es válido**
  ```bash
  ls -lh backup_sisca_*.sql
  ```

### Consultas de Verificación

```sql
-- 1. Verificar estructura de usuarios
DESCRIBE usuarios;

-- 2. Verificar foreign keys
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'sisca'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 3. Verificar que no hay contraseñas en texto plano
SELECT COUNT(*) as total_usuarios,
       SUM(CASE WHEN contraseña_hash LIKE '$2y$10$%' THEN 1 ELSE 0 END) as con_hash,
       SUM(CASE WHEN bloqueado = 1 THEN 1 ELSE 0 END) as bloqueados
FROM usuarios;

-- 4. Verificar tabla de backup
SELECT * FROM usuarios_password_backup_20251114_120000 LIMIT 5;
```

---

## 🔄 Rollback (Si es necesario)

### Si algo sale mal durante la migración:

#### Opción 1: Restaurar desde Backup

```bash
# Restaurar base de datos completa
mysql -u root -p sisca < backup_sisca_20251114_120000.sql

# Restaurar archivos
rm -rf /path/to/SISCA
cp -r /path/to/SISCA_backup_20251114_120000 /path/to/SISCA
```

#### Opción 2: Restaurar Solo Contraseñas

```sql
-- Si la migración de contraseñas falló
UPDATE usuarios u
INNER JOIN usuarios_password_backup_20251114_120000 b ON u.id = b.id
SET u.contraseña = b.contraseña;

-- Eliminar columna contraseña_hash si se agregó
ALTER TABLE usuarios DROP COLUMN contraseña_hash;
```

#### Opción 3: Revertir login.php

```bash
# Si guardaste el original
cp php/login.php.backup php/login.php

# O usar git
git checkout php/login.php
```

---

## ❓ FAQs

### ¿Qué pasa con las contraseñas existentes?

Las contraseñas antiguas se hashean automáticamente con bcrypt. Los usuarios pueden seguir usando sus contraseñas actuales, pero ahora están protegidas.

### ¿Los usuarios deben cambiar su contraseña?

Por defecto, `debe_cambiar_password = 1` después de la migración. En el primer login, se les pedirá cambiar su contraseña.

### ¿Puedo revertir la migración?

Sí, mientras mantengas el backup. Ver sección de [Rollback](#rollback-si-es-necesario).

### ¿Qué pasa si olvido una contraseña?

Necesitarás implementar la funcionalidad de recuperación de contraseña, o un administrador puede:

```sql
-- Generar hash temporal (ejemplo: TempPass123!)
UPDATE usuarios
SET contraseña_hash = '$2y$10$...', debe_cambiar_password = 1
WHERE id = X;
```

O usar el script de usuario nuevo:
```php
// En crear_usuario.php puedes usarlo para resetear password
```

### ¿Cómo desbloquear un usuario bloqueado?

```sql
UPDATE usuarios
SET bloqueado = 0, intentos_fallidos = 0, fecha_bloqueo = NULL
WHERE id = X;
```

O usar el endpoint:
```javascript
fetch('php/usuarios/desbloquear_usuario.php', {
    method: 'POST',
    body: new FormData().append('id', userId)
});
```

### ¿Las nuevas tablas son obligatorias?

No inmediatamente. Puedes implementar solo:
1. ✅ Hash de contraseñas (CRÍTICO)
2. ✅ login.php actualizado
3. ⚠️ Nuevas tablas (opcional, para futuras funcionalidades)

### ¿Cómo crear un usuario nuevo con contraseña segura?

```php
// Desde PHP
$password = 'MiPassword123!';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

// Insertar en BD
INSERT INTO usuarios (nombre_usuario, contraseña_hash, ...)
VALUES ('nuevo_usuario', '$hash', ...);
```

O usar el módulo de usuarios:
```bash
POST php/usuarios/crear_usuario.php
```

### ¿Necesito cambiar algo en el código existente?

Solo si usas el módulo de usuarios. El código antiguo sigue funcionando con `conexion.php`. Para nuevo código, usa `conexion_v2.php` o `config.php`.

### ¿Cómo migrar a HTTPS?

1. Obtener certificado SSL (Let's Encrypt gratis)
2. Configurar servidor web (Apache/Nginx)
3. Cambiar en `config.php`:
   ```php
   'cookie_secure' => true,
   ```

### ¿Qué hacer si un usuario reporta "Usuario bloqueado"?

1. Verificar en BD:
   ```sql
   SELECT id, nombre_usuario, intentos_fallidos, bloqueado, fecha_bloqueo
   FROM usuarios WHERE nombre_usuario = 'USUARIO';
   ```

2. Desbloquear:
   ```sql
   UPDATE usuarios SET bloqueado = 0, intentos_fallidos = 0 WHERE id = X;
   ```

3. Informar al usuario que intente de nuevo

---

## 📞 Soporte

Para problemas o dudas sobre la migración:

1. Revisar logs de errores: `logs/php-errors.log`
2. Verificar backup existe y es válido
3. Consultar esta guía
4. Contactar al equipo de desarrollo

---

## 📊 Resumen de Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Contraseñas | Texto plano | Hash bcrypt |
| Intentos de login | Ilimitados | Máx 5, luego bloqueo |
| Integridad de datos | Sin FK | FK con cascadas |
| Auditoría | No existe | Tabla auditoria |
| Gestión de usuarios | Manual en BD | Módulo PHP completo |
| Relaciones | Implícitas | Explícitas con FK |
| Seguridad sesiones | Básica | Avanzada (config.php) |

---

## ✅ Checklist Final

Antes de considerar la migración completa:

- [ ] Backup realizado y verificado
- [ ] Script de migración ejecutado exitosamente
- [ ] Login probado y funcional
- [ ] Usuarios pueden cambiar contraseña
- [ ] Foreign keys creadas
- [ ] Nuevas tablas disponibles
- [ ] Documentación revisada
- [ ] Equipo informado de cambios

---

**Versión:** 2.0
**Fecha:** 2025-11-14
**Autor:** SISCA Development Team
**Estado:** ✅ Completado

---
