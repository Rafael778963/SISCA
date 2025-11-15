# Sistema de Reorganización de Letras de Grupos

## 📋 Descripción

Este sistema permite mantener un orden secuencial en cascada de las letras de identificación de los grupos, reorganizándose automáticamente cuando un grupo se da de baja.

## 🔄 Cómo Funciona

### Asignación de Letras

Los grupos con la misma configuración (Generación, Programa, Grado, Turno y Periodo) se diferencian mediante letras:

```
52AUTO6M    ← Primer grupo (sin letra)
52AUTO6BM   ← Segundo grupo (letra B)
52AUTO6CM   ← Tercer grupo (letra C)
52AUTO6DM   ← Cuarto grupo (letra D)
```

### Reorganización en Cascada

Cuando se da de baja un grupo intermedio, los grupos subsecuentes se reorganizan automáticamente:

**Estado Inicial:**
```
52AUTO6M    (activo)
52AUTO6BM   (activo)
52AUTO6CM   (activo)
52AUTO6DM   (activo)
```

**Si se da de baja 52AUTO6BM:**
```
52AUTO6M    (activo)
52AUTO6BM   (inactivo) - Dado de baja
52AUTO6CM   → se convierte en → 52AUTO6BM
52AUTO6DM   → se convierte en → 52AUTO6CM
```

**Resultado Final:**
```
52AUTO6M    (activo)
52AUTO6BM   (activo) - El que era C
52AUTO6CM   (activo) - El que era D
52AUTO6BM   (inactivo) - El original dado de baja
```

### Asignación Inteligente al Crear Grupos

Cuando se crea un nuevo grupo, el sistema busca la **primera letra disponible**:

**Ejemplo 1 - Sin huecos:**
```
Grupos activos: 52AUTO6M, 52AUTO6BM, 52AUTO6CM
Nuevo grupo se asigna: 52AUTO6DM (siguiente letra)
```

**Ejemplo 2 - Con hueco (se dio de baja el B):**
```
Grupos activos: 52AUTO6M, 52AUTO6CM
Nuevo grupo se asigna: 52AUTO6BM (llena el hueco)
```

## 📁 Archivos Modificados

### 1. `php/grupos/funciones_letras.php` (NUEVO)
Funciones principales:
- `reorganizarLetrasGrupos()` - Reorganiza letras en cascada al dar de baja
- `encontrarPrimeraLetraDisponible()` - Encuentra la primera letra libre

### 2. `php/grupos/baja_grupo.php`
Modificaciones:
- Incluye `funciones_letras.php`
- Llama a `reorganizarLetrasGrupos()` antes de cambiar el estado a inactivo
- Mensaje actualizado informando sobre la reorganización

### 3. `php/grupos/guardar_grupo.php`
Modificaciones:
- Incluye `funciones_letras.php`
- Usa `encontrarPrimeraLetraDisponible()` en lugar de solo incrementar la última letra
- Permite llenar "huecos" en la secuencia de letras

## 🎯 Casos de Uso

### Caso 1: Crear varios grupos
```sql
-- Usuario crea 4 grupos con la misma configuración
INSERT 1: 52AUTO6M   (sin letra)
INSERT 2: 52AUTO6BM  (letra B)
INSERT 3: 52AUTO6CM  (letra C)
INSERT 4: 52AUTO6DM  (letra D)
```

### Caso 2: Dar de baja grupo intermedio
```sql
-- Usuario da de baja el grupo con letra B
BAJA: 52AUTO6BM (cambia estado a inactivo)
AUTOMÁTICO: 52AUTO6CM → 52AUTO6BM
AUTOMÁTICO: 52AUTO6DM → 52AUTO6CM
```

### Caso 3: Crear nuevo grupo después de baja
```sql
-- Usuario crea nuevo grupo con misma configuración
NUEVO: 52AUTO6CM (toma la letra C que quedó libre)
```

### Caso 4: Dar de alta el grupo que estaba inactivo
```sql
-- Usuario da de alta el grupo que había dado de baja
-- El sistema lo ve como crear un nuevo grupo
ALTA: 52AUTO6DM (toma la siguiente letra disponible)

-- Resultado final:
52AUTO6M   (activo)
52AUTO6BM  (activo)
52AUTO6CM  (activo)
52AUTO6DM  (activo) - Recién dado de alta
```

## ⚠️ Consideraciones Importantes

1. **Solo afecta grupos ACTIVOS:**
   - La reorganización solo considera grupos con `estado = 'activo'`
   - Los grupos inactivos no se modifican

2. **Requiere mismo periodo:**
   - Solo reorganiza grupos del mismo `periodo_id`
   - Grupos de diferentes periodos no se afectan entre sí

3. **Configuración completa:**
   - Para reorganizar, deben coincidir:
     - Generación
     - Programa Educativo
     - Grado
     - Turno
     - Periodo ID

4. **Límite de letras:**
   - Máximo 25 grupos con letras (B hasta Z)
   - Más el grupo sin letra = 26 grupos totales por configuración

## 🧪 Pruebas Recomendadas

1. **Crear 4 grupos con misma configuración**
   - Verificar que se asignen correctamente: sin letra, B, C, D

2. **Dar de baja el grupo B**
   - Verificar que C se convierta en B
   - Verificar que D se convierta en C

3. **Crear un nuevo grupo**
   - Debe asignarse letra C (la que quedó libre)

4. **Dar de alta el grupo que estaba inactivo**
   - Debe asignarse letra D

5. **Dar de baja el primer grupo (sin letra)**
   - Verificar que B se convierte en grupo sin letra
   - Verificar que C se convierte en B

## 🔍 SQL para Verificar

```sql
-- Ver todos los grupos de una configuración
SELECT
    id,
    codigo_grupo,
    letra_identificacion,
    estado,
    fecha_creacion
FROM grupos
WHERE generacion = '52'
AND programa_educativo = 'AUTO'
AND grado = '6'
AND turno = 'M'
AND periodo_id = 1
ORDER BY letra_identificacion ASC;

-- Ver reorganizaciones recientes
SELECT
    codigo_grupo,
    estado,
    fecha_modificacion
FROM grupos
WHERE generacion = '52'
AND programa_educativo = 'AUTO'
ORDER BY fecha_modificacion DESC
LIMIT 10;
```

## 🐛 Solución de Problemas

**Problema:** Las letras no se reorganizan al dar de baja
- Verificar que el grupo tenga letra (no sea el primero sin letra)
- Verificar que existan grupos activos con letras mayores
- Revisar los logs de errores en PHP

**Problema:** Al crear un grupo nuevo no toma la letra correcta
- Verificar que `periodo_id` esté configurado
- Asegurarse de que `funciones_letras.php` esté incluido
- Verificar que los datos de configuración sean exactos

**Problema:** Se duplican códigos de grupo
- Verificar la restricción UNIQUE en `codigo_grupo`
- Revisar que `estado = 'activo'` en las consultas

## 📝 Notas Técnicas

- La función `reorganizarLetrasGrupos()` ejecuta múltiples UPDATEs en una transacción implícita
- Si hay error en la reorganización, se lanza una Exception y no se completa la baja
- La función `encontrarPrimeraLetraDisponible()` itera de B a Z buscando huecos
- Las letras se almacenan como VARCHAR(1) en la base de datos
