# Módulo de Plan de Estudios - Instrucciones de Instalación

## Descripción

Este módulo permite gestionar planes de estudio por periodo académico, similar a como funcionan los módulos de Grupos y Carga. Los usuarios pueden:

- Agregar asignaturas al plan de estudio del periodo activo
- Visualizar el plan de estudios en una tabla organizada por cuatrimestres y áreas de conocimiento
- Guardar plantillas del plan de estudios
- Cargar plantillas previamente guardadas
- Eliminar asignaturas y plantillas

## Características Principales

✅ **Filtrado por periodo**: Solo muestra asignaturas del periodo activo
✅ **Sistema de plantillas**: Similar al módulo de Carga
✅ **Interfaz intuitiva**: Formulario simplificado sin campos de periodo/año
✅ **Eliminación de asignaturas**: Botón inline en cada asignatura
✅ **Gestión de plantillas**: Guardar, cargar y eliminar plantillas

## Instalación

### 1. Ejecutar Migraciones de Base de Datos

Ejecuta el siguiente script SQL en tu base de datos SISCA:

```bash
mysql -u [usuario] -p sisca < SISCA/db/migrations/plan_estudios_setup.sql
```

O manualmente ejecuta el contenido del archivo:
- `SISCA/db/migrations/plan_estudios_setup.sql`

Este script creará dos tablas:
- `plan_estudios_asignaturas`: Para almacenar asignaturas por periodo
- `plan_estudios_plantillas`: Para almacenar plantillas guardadas

### 2. Verificar Archivos Creados

Asegúrate de que los siguientes archivos se hayan creado correctamente:

#### JavaScript
- ✅ `SISCA/js/planEstudios/plandeestudios.js` (Lógica principal)

#### PHP
- ✅ `SISCA/php/planEstudios/guardar_asignatura.php`
- ✅ `SISCA/php/planEstudios/obtener_asignaturas.php`
- ✅ `SISCA/php/planEstudios/eliminar_asignatura.php`
- ✅ `SISCA/php/planEstudios/guardar_plantilla.php`
- ✅ `SISCA/php/planEstudios/obtener_plantillas.php`
- ✅ `SISCA/php/planEstudios/cargar_plantilla.php`
- ✅ `SISCA/php/planEstudios/eliminar_plantilla.php`

#### HTML
- ✅ `SISCA/templates/planEstudios/planEstudios.html` (Actualizado)

#### CSS
- ✅ `SISCA/css/planEstudios/planEstudios.css` (Actualizado con estilos adicionales)

### 3. Verificar Permisos de Archivos

Asegúrate de que el servidor web tenga permisos de lectura en todos los archivos:

```bash
chmod -R 644 SISCA/js/planEstudios/*
chmod -R 644 SISCA/php/planEstudios/*
chmod -R 644 SISCA/templates/planEstudios/*
chmod -R 644 SISCA/css/planEstudios/*
```

### 4. Verificar Estructura de Directorios

```
SISCA/
├── db/
│   └── migrations/
│       └── plan_estudios_setup.sql
├── js/
│   └── planEstudios/
│       └── plandeestudios.js
├── php/
│   └── planEstudios/
│       ├── guardar_asignatura.php
│       ├── obtener_asignaturas.php
│       ├── eliminar_asignatura.php
│       ├── guardar_plantilla.php
│       ├── obtener_plantillas.php
│       ├── cargar_plantilla.php
│       └── eliminar_plantilla.php
├── templates/
│   └── planEstudios/
│       └── planEstudios.html
└── css/
    └── planEstudios/
        └── planEstudios.css
```

## Uso del Módulo

### 1. Seleccionar Periodo Activo

Antes de usar el módulo de Plan de Estudios, asegúrate de tener un periodo activo seleccionado desde el módulo de **Períodos**.

### 2. Agregar Asignaturas

1. Completa el formulario con los datos requeridos:
   - Nivel (TSU, Ing, Lic)
   - Turno (Matutino, Vespertino, Nocturno)
   - Programa Educativo
   - Grado (1° - 11°)
   - Área de Conocimiento (opcional)
   - Asignatura
   - Total de Horas

2. Haz clic en **"Agregar Asignatura"**

3. La asignatura se mostrará en la tabla organizada por cuatrimestre y área

### 3. Guardar como Plantilla

1. Una vez que hayas agregado todas las asignaturas del plan de estudios
2. Haz clic en **"Guardar Plantilla"**
3. Ingresa un nombre y descripción (opcional)
4. La plantilla se guardará vinculada al periodo activo

### 4. Cargar Plantillas

1. En la sección **"Plantillas Guardadas"** podrás ver todas las plantillas del periodo actual
2. Haz clic en **"Ver Plantilla"** para visualizar su contenido
3. Haz clic en **"Nueva"** para regresar a la vista normal

### 5. Eliminar Asignaturas

- Pasa el cursor sobre una asignatura en la tabla
- Aparecerá un botón de eliminar (🗑️)
- Haz clic para eliminar (se pedirá confirmación)

### 6. Eliminar Plantillas

- En la información de cada plantilla hay un botón **"Eliminar"**
- Haz clic y confirma para eliminar la plantilla

## Cambios Realizados

### Eliminaciones
- ❌ Campo "Periodo" del formulario (ahora usa periodo activo automáticamente)
- ❌ Campo "Año Académico" del formulario
- ❌ Footer con año académico

### Adiciones
- ✅ Filtrado automático por periodo activo
- ✅ Sistema completo de plantillas
- ✅ Botones inline para eliminar asignaturas
- ✅ Indicador visual cuando se visualiza una plantilla
- ✅ Validación de periodo activo al iniciar
- ✅ Estilos CSS mejorados

## Solución de Problemas

### No se muestran las asignaturas
- Verifica que tienes un periodo activo seleccionado
- Revisa que las tablas `plan_estudios_asignaturas` y `plan_estudios_plantillas` existan en la BD
- Revisa la consola del navegador para errores JavaScript

### Error al guardar asignaturas
- Verifica que los archivos PHP tengan los permisos correctos
- Revisa que la conexión a la base de datos funcione
- Verifica que el usuario tenga sesión activa

### Las plantillas no se guardan
- Verifica que la tabla `plan_estudios_plantillas` exista
- Revisa que el campo `datos_json` sea de tipo `longtext`
- Verifica que el usuario esté autenticado (`$_SESSION['user_id']`)

### Errores de permisos
- Asegúrate de que el directorio `php/planEstudios/` tenga permisos de ejecución
- Verifica que el servidor web pueda leer los archivos JavaScript y CSS

## Notas Técnicas

- **Periodo automático**: El módulo usa `periodo_manager.js` para obtener el periodo activo de la sesión
- **Almacenamiento de plantillas**: Las plantillas se guardan como JSON en el campo `datos_json`
- **Usuario específico**: Cada usuario solo ve sus propias plantillas
- **Eliminación lógica**: Las asignaturas y plantillas se marcan como inactivas/eliminadas, no se borran físicamente

## Compatibilidad

- ✅ Compatible con el sistema de periodos existente
- ✅ Mismo patrón de diseño que módulos de Grupos y Carga
- ✅ Usa las mismas librerías (SweetAlert2, FontAwesome, etc.)

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo de SISCA.
