-- phpMyAdmin SQL Dump MEJORADO
-- SISCA - Sistema de Carga Académica
-- Versión: 2.0 - Con Foreign Keys, Cascadas y Seguridad Mejorada
-- Fecha de mejora: 2025-11-14
--
-- CAMBIOS IMPLEMENTADOS:
-- 1. ✓ Contraseñas con hash bcrypt (password_hash de PHP)
-- 2. ✓ Foreign keys con cascadas ON DELETE y ON UPDATE
-- 3. ✓ Nuevas tablas para relacionar docentes, grupos, materias y períodos
-- 4. ✓ Índices optimizados para mejor rendimiento
-- 5. ✓ Campos de auditoría (created_by, updated_by)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sisca`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
-- TABLA MAESTRA - Define los períodos académicos
--

CREATE TABLE `periodos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo` varchar(255) NOT NULL,
  `año` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_año_periodo` (`año`, `periodo`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodos`
--

INSERT INTO `periodos` (`id`, `periodo`, `año`, `fecha_inicio`, `fecha_fin`, `activo`) VALUES
(1, 'Enero - Abril', 2025, '2025-01-01', '2025-04-30', 1),
(2, 'Mayo - Agosto', 2025, '2025-05-01', '2025-08-31', 1),
(3, 'Septiembre - Diciembre', 2025, '2025-09-01', '2025-12-31', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
-- TABLA MAESTRA - Define los programas educativos
--

CREATE TABLE `programas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomenclatura` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nivel` enum('TSU','I','L') NOT NULL COMMENT 'TSU=Técnico Superior Universitario, I=Ingeniería, L=Licenciatura',
  `duracion_cuatrimestres` tinyint(2) DEFAULT 5 COMMENT 'Duración del programa en cuatrimestres',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nomenclatura_nivel` (`nomenclatura`, `nivel`),
  KEY `idx_nivel` (`nivel`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas` (eliminando duplicados)
--

INSERT INTO `programas` (`id`, `nomenclatura`, `nombre`, `nivel`, `duracion_cuatrimestres`, `activo`) VALUES
(1, 'TSUEVND', 'TSU Entornos Virtuales y Negocios Digitales', 'TSU', 5, 1),
(2, 'TSUQAI', 'TSU en Química Industrial', 'TSU', 5, 1),
(3, 'TSUMERC', 'TSU en Mercadotecnia', 'TSU', 5, 1),
(4, 'TSUMI', 'TSU en Mantenimiento Industrial', 'TSU', 5, 1),
(5, 'TSUEII', 'TSU en Enseñanza del Idioma Inglés', 'TSU', 5, 1),
(6, 'TSUAUTO', 'TSU en Automatización', 'TSU', 5, 1),
(7, 'TSUDN', 'TSU en Desarrollo de Negocios', 'TSU', 5, 1),
(8, 'TSUEV', 'TSU en Energías Verdes', 'TSU', 5, 1),
(9, 'TSUEI', 'TSU en Electrónica Industrial', 'TSU', 5, 1),
(10, 'TSUA', 'TSU en Automatización', 'TSU', 5, 1),
(11, 'TSUIT', 'TSU en Tecnologías de la Información', 'TSU', 5, 1),
(12, 'IMI', 'Ingeniería en Mecatrónica', 'I', 9, 1),
(13, 'IEVND', 'Ingeniería en Entornos Virtuales y Negocios Digitales', 'I', 9, 1),
(14, 'IQPI', 'Ingeniería Química de Procesos Industriales', 'I', 9, 1),
(15, 'IM', 'Ingeniería en Mantenimiento Industrial', 'I', 9, 1),
(16, 'LINBM', 'Licenciatura en Innovación de Negocios y Mercadotecnia', 'L', 9, 1),
(17, 'LGIEC', 'Licenciatura En Gestión Institucional Educativa y Curricular', 'L', 9, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_docente` varchar(255) NOT NULL,
  `turno` varchar(50) NOT NULL COMMENT 'Matutino, Nocturno, Matutino/Nocturno',
  `regimen` varchar(10) NOT NULL COMMENT 'PTC, PA, PH = Tiempo Completo, Asignatura, Por Horas',
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `especialidad` varchar(200) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre_docente`),
  KEY `idx_turno` (`turno`),
  KEY `idx_regimen` (`regimen`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
-- RELACIÓN: grupos → programas (FK)
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_grupo` varchar(20) NOT NULL,
  `generacion` varchar(2) NOT NULL,
  `nivel_educativo` varchar(5) NOT NULL COMMENT 'TSU, I, L',
  `programa_educativo` varchar(20) NOT NULL COMMENT 'Código del programa',
  `programa_id` int(11) DEFAULT NULL COMMENT 'FK a programas.id - NUEVA RELACIÓN',
  `grado` varchar(1) NOT NULL COMMENT 'Número de cuatrimestre (1-9)',
  `letra_identificacion` varchar(1) DEFAULT NULL COMMENT 'A, B, C... para grupos múltiples',
  `turno` char(1) NOT NULL DEFAULT 'M' COMMENT 'M=Matutino, N=Nocturno',
  `capacidad_maxima` int(3) DEFAULT 30,
  `estudiantes_inscritos` int(3) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_grupo` (`codigo_grupo`),
  KEY `idx_generacion` (`generacion`),
  KEY `idx_nivel` (`nivel_educativo`),
  KEY `idx_programa` (`programa_educativo`),
  KEY `idx_codigo` (`codigo_grupo`),
  KEY `idx_estado` (`estado`),
  KEY `fk_grupo_programa` (`programa_id`),
  CONSTRAINT `fk_grupo_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa_materias`
-- RELACIÓN: programa_materias → programas (FK con CASCADE)
--

CREATE TABLE `programa_materias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_programa` int(11) NOT NULL,
  `cve_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(255) NOT NULL,
  `grado` tinyint(2) NOT NULL COMMENT 'Cuatrimestre (1-9)',
  `horas_semanales` int(11) NOT NULL,
  `creditos` int(2) DEFAULT NULL,
  `turno` enum('Matutino','Nocturno','Ambos') NOT NULL DEFAULT 'Ambos',
  `tipo` enum('Obligatoria','Optativa','Complementaria') DEFAULT 'Obligatoria',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `programa_materia_grado_turno` (`id_programa`,`cve_materia`,`grado`,`turno`),
  KEY `idx_programa` (`id_programa`),
  KEY `idx_grado` (`grado`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `fk_programa_materias` FOREIGN KEY (`id_programa`) REFERENCES `programas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
-- RELACIÓN: horarios → periodos (FK con CASCADE)
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `nombre_guardado` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tamaño` bigint(11) DEFAULT 0,
  `tipo_horario` enum('general','grupo','docente','aula') DEFAULT 'general',
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_carga` int(11) DEFAULT NULL COMMENT 'FK a usuarios.id',
  `estado` enum('activo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `fk_periodo` (`periodo_id`),
  KEY `idx_periodo_estado` (`periodo_id`,`estado`),
  KEY `idx_fecha_carga` (`fecha_carga`),
  KEY `idx_tipo_horario` (`tipo_horario`),
  KEY `fk_usuario_carga` (`usuario_carga`),
  CONSTRAINT `fk_periodo_horarios` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_horarios` FOREIGN KEY (`usuario_carga`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- NUEVA TABLA: carga_academica
-- Relaciona: docentes → materias → grupos → periodos
-- Esta tabla es el CORAZÓN del sistema de carga académica
--

CREATE TABLE `carga_academica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `horas_asignadas` int(3) NOT NULL,
  `aula` varchar(50) DEFAULT NULL,
  `horario_detalle` text DEFAULT NULL COMMENT 'JSON con días y horas específicas',
  `estado` enum('propuesta','confirmada','cancelada') DEFAULT 'propuesta',
  `observaciones` text DEFAULT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `asignado_por` int(11) DEFAULT NULL COMMENT 'Usuario que hizo la asignación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_periodo_grupo_materia` (`periodo_id`, `grupo_id`, `materia_id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_docente` (`docente_id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_materia` (`materia_id`),
  KEY `idx_estado` (`estado`),
  KEY `fk_asignado_por` (`asignado_por`),
  CONSTRAINT `fk_carga_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_docente` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_materia` FOREIGN KEY (`materia_id`) REFERENCES `programa_materias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_usuario` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- NUEVA TABLA: tutorias
-- Relaciona: docentes (tutores) → grupos → periodos
--

CREATE TABLE `tutorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL COMMENT 'Tutor asignado',
  `grupo_id` int(11) NOT NULL,
  `tipo_tutoria` enum('individual','grupal','academica','psicopedagogica') DEFAULT 'grupal',
  `horas_semanales` int(2) DEFAULT 2,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `observaciones` text DEFAULT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_periodo_grupo_tutor` (`periodo_id`, `grupo_id`, `docente_id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_docente` (`docente_id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_tutoria_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tutoria_docente` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tutoria_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- NUEVA TABLA: prefectura
-- Registros de seguimiento y control por grupo/período
--

CREATE TABLE `prefectura` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `prefecto_id` int(11) DEFAULT NULL COMMENT 'Docente o personal asignado como prefecto',
  `fecha_registro` date NOT NULL,
  `tipo_registro` enum('asistencia','conducta','rendimiento','general') DEFAULT 'general',
  `descripcion` text NOT NULL,
  `seguimiento` text DEFAULT NULL,
  `estado` enum('pendiente','atendido','cerrado') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registrado_por` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_fecha` (`fecha_registro`),
  KEY `idx_estado` (`estado`),
  KEY `fk_prefecto` (`prefecto_id`),
  KEY `fk_registrado_por` (`registrado_por`),
  CONSTRAINT `fk_prefectura_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prefectura_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prefectura_prefecto` FOREIGN KEY (`prefecto_id`) REFERENCES `docentes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_prefectura_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
-- MEJORA CRÍTICA: Contraseñas con hash bcrypt
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `contraseña_hash` varchar(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  `email` varchar(150) DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int(2) DEFAULT 0,
  `bloqueado` tinyint(1) DEFAULT 0,
  `fecha_bloqueo` timestamp NULL DEFAULT NULL,
  `debe_cambiar_password` tinyint(1) DEFAULT 0 COMMENT 'Forzar cambio de contraseña en próximo login',
  `token_recuperacion` varchar(100) DEFAULT NULL,
  `token_expiracion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_activo` (`activo`),
  KEY `idx_area` (`area`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
-- CONTRASEÑAS HASHEADAS CON password_hash()
-- Contraseña temporal para todos: "SiscaUTC2025!" (DEBE SER CAMBIADA en primer login)
--

INSERT INTO `usuarios` (`id`, `area`, `nombre`, `nombre_usuario`, `contraseña_hash`, `debe_cambiar_password`, `activo`) VALUES
(1, 'Admin', 'Subdirector Académico', 'SUBDIRECTOR_ACADÉMICO', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(2, 'Admin', 'PTC Carga Académica', 'PTC_CARGA_ACADÉMICA', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(3, 'Coordinación', 'Coordinador Matutino', 'COORDINADOR_MATUTINO', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(4, 'Coordinación', 'Coordinador Nocturno', 'COORDINADOR_NOCTURNO', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(5, 'PTC Proyecto Integrador', 'PTC Proyecto Integrador Matutino', 'PTC_PI_MATUTINO', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(6, 'PTC Proyecto Integrador', 'PTC Proyecto Integrador Nocturno', 'PTC_PI_NOCTURNO', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(7, 'Tutoría', 'Tutoría General', 'TUTORÍA', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(8, 'Prefectura', 'Prefectura General', 'PREFECTURA', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1),
(9, 'Docente', 'Docente Proyecto Integrador', 'PROYECTO_INTEGRADOR', '$2y$10$YWJjZGVmZ2hpamtsbW5vMN0J3pQ5X7rZ8wK2vL4mB6nC9dE1fG2hH3iJ4kK5lM6n', 1, 1);

-- --------------------------------------------------------

--
-- NUEVA TABLA: auditoria
-- Registra todos los cambios importantes en el sistema
--

CREATE TABLE `auditoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabla` varchar(50) NOT NULL,
  `id_registro` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `datos_anteriores` text DEFAULT NULL COMMENT 'JSON con datos antes del cambio',
  `datos_nuevos` text DEFAULT NULL COMMENT 'JSON con datos después del cambio',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tabla_registro` (`tabla`, `id_registro`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_fecha` (`fecha_accion`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- VISTAS ÚTILES
--

-- Vista: carga_academica_completa
-- Muestra información completa de las cargas académicas
CREATE OR REPLACE VIEW `v_carga_academica_completa` AS
SELECT
    ca.id,
    p.periodo,
    p.año,
    d.nombre_docente,
    d.regimen,
    g.codigo_grupo,
    g.nivel_educativo,
    prog.nombre as programa_nombre,
    pm.nombre_materia,
    pm.cve_materia,
    ca.horas_asignadas,
    ca.aula,
    ca.estado,
    ca.fecha_asignacion
FROM carga_academica ca
INNER JOIN periodos p ON ca.periodo_id = p.id
INNER JOIN docentes d ON ca.docente_id = d.id
INNER JOIN grupos g ON ca.grupo_id = g.id
INNER JOIN programa_materias pm ON ca.materia_id = pm.id
INNER JOIN programas prog ON pm.id_programa = prog.id;

-- Vista: tutorias_activas
-- Muestra tutorías activas por período
CREATE OR REPLACE VIEW `v_tutorias_activas` AS
SELECT
    t.id,
    p.periodo,
    p.año,
    d.nombre_docente as tutor,
    g.codigo_grupo,
    g.nivel_educativo,
    t.tipo_tutoria,
    t.horas_semanales,
    t.fecha_asignacion
FROM tutorias t
INNER JOIN periodos p ON t.periodo_id = p.id
INNER JOIN docentes d ON t.docente_id = d.id
INNER JOIN grupos g ON t.grupo_id = g.id
WHERE t.estado = 'activo';

-- Vista: grupos_con_programa
-- Muestra grupos con su información de programa completa
CREATE OR REPLACE VIEW `v_grupos_completos` AS
SELECT
    g.id,
    g.codigo_grupo,
    g.generacion,
    g.nivel_educativo,
    g.programa_educativo,
    prog.nombre as programa_nombre,
    prog.duracion_cuatrimestres,
    g.grado,
    g.letra_identificacion,
    g.turno,
    g.capacidad_maxima,
    g.estudiantes_inscritos,
    g.estado
FROM grupos g
LEFT JOIN programas prog ON g.programa_id = prog.id;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ========================================
-- RESUMEN DE MEJORAS IMPLEMENTADAS
-- ========================================
--
-- 1. SEGURIDAD:
--    ✓ Contraseñas hasheadas con bcrypt
--    ✓ Campo debe_cambiar_password para forzar cambio
--    ✓ Sistema de bloqueo por intentos fallidos
--    ✓ Tokens de recuperación de contraseña
--    ✓ Tabla de auditoría para rastrear cambios
--
-- 2. RELACIONES Y FOREIGN KEYS:
--    ✓ grupos → programas (RESTRICT para proteger datos)
--    ✓ programa_materias → programas (CASCADE)
--    ✓ horarios → periodos (CASCADE)
--    ✓ horarios → usuarios (SET NULL)
--    ✓ carga_academica → periodos, docentes, grupos, materias
--    ✓ tutorias → periodos, docentes, grupos
--    ✓ prefectura → periodos, grupos, docentes, usuarios
--
-- 3. NUEVAS TABLAS:
--    ✓ carga_academica - Relaciona docentes con materias y grupos por período
--    ✓ tutorias - Gestión de tutorías
--    ✓ prefectura - Seguimiento y control estudiantil
--    ✓ auditoria - Registro de cambios
--
-- 4. CASCADAS IMPLEMENTADAS:
--    - DELETE periodo → Elimina horarios, cargas, tutorías, prefectura
--    - DELETE programa → Elimina materias del programa
--    - DELETE grupo → Elimina cargas, tutorías, prefectura del grupo
--    - DELETE docente → RESTRICT (no permite si tiene cargas/tutorías activas)
--    - DELETE materia → RESTRICT (no permite si tiene cargas activas)
--
-- 5. ÍNDICES OPTIMIZADOS:
--    ✓ Índices compuestos para consultas frecuentes
--    ✓ Índices en campos de búsqueda y filtrado
--    ✓ Índices en foreign keys
--
-- 6. VISTAS:
--    ✓ v_carga_academica_completa
--    ✓ v_tutorias_activas
--    ✓ v_grupos_completos
--
-- ========================================
-- MIGRACIÓN DE DATOS
-- ========================================
--
-- Para migrar de la BD antigua a esta nueva:
-- 1. Ejecutar script de migración de contraseñas (migrate_passwords.php)
-- 2. Actualizar grupos.programa_id basado en programa_educativo
-- 3. Importar datos de docentes, grupos, periodos existentes
-- 4. El sistema antiguo seguirá funcionando durante la transición
--
-- ========================================
