-- phpMyAdmin SQL Dump - VERSIÓN REFACTORIZADA CON RELACIONES MEJORADAS
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Base de datos: `sisca`
-- Refactorización: 2025-11-14
--
-- MEJORAS IMPLEMENTADAS:
-- 1. Relaciones FK completas entre todas las tablas
-- 2. Cascadas ON DELETE y ON UPDATE para integridad referencial
-- 3. Nueva tabla carga_academica para gestión de asignaciones
-- 4. Normalización de datos (grupos.programa_id en lugar de texto)
-- 5. Campos usuario_carga_id como FK en horarios
-- 6. Índices optimizados para mejorar rendimiento

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
-- Estructura de tabla para la tabla `usuarios`
-- NOTA: Se coloca primero porque otras tablas dependen de ella
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `idx_area` (`area`),
  KEY `idx_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
-- NOTA: Tabla maestra - otras tablas dependen de ella
--

CREATE TABLE `periodos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo` varchar(255) NOT NULL,
  `año` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_año` (`año`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
-- NOTA: Tabla maestra - otras tablas dependen de ella
--

CREATE TABLE `programas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nomenclatura` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nivel` enum('TSU','I','L') NOT NULL COMMENT 'TSU=Técnico Superior Universitario, I=Ingeniería, L=Licenciatura',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_nomenclatura` (`nomenclatura`),
  KEY `idx_nivel` (`nivel`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_docente` varchar(255) NOT NULL,
  `turno` varchar(50) NOT NULL COMMENT 'Matutino, Nocturno, Matutino/Nocturno',
  `regimen` varchar(10) NOT NULL COMMENT 'PA=Profesor de Asignatura, PTC=Profesor de Tiempo Completo, PH=Profesor por Horas',
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
-- Estructura de tabla para la tabla `programa_materias`
-- MEJORA: Agregada FK a programas con CASCADE
--

CREATE TABLE `programa_materias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_programa` int(11) NOT NULL,
  `cve_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(255) NOT NULL,
  `grado` tinyint(2) NOT NULL,
  `horas_semanales` int(11) NOT NULL,
  `turno` enum('Matutino','Nocturno') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `programa_materia_grado_turno` (`id_programa`,`cve_materia`,`grado`,`turno`),
  KEY `idx_id_programa` (`id_programa`),
  KEY `idx_cve_materia` (`cve_materia`),
  KEY `idx_grado` (`grado`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `fk_programa_materias_programa`
    FOREIGN KEY (`id_programa`)
    REFERENCES `programas` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
-- MEJORA: Agregados programa_id y periodo_id como FK con CASCADE
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_grupo` varchar(20) NOT NULL,
  `generacion` varchar(2) NOT NULL,
  `nivel_educativo` varchar(5) NOT NULL,
  `programa_id` int(11) NOT NULL COMMENT 'FK a programas.id',
  `programa_educativo` varchar(20) NOT NULL COMMENT 'Nomenclatura del programa (legacy, usar programa_id)',
  `grado` varchar(1) NOT NULL,
  `letra_identificacion` varchar(1) DEFAULT NULL,
  `turno` char(1) NOT NULL DEFAULT 'M' COMMENT 'M=Matutino, N=Nocturno',
  `periodo_id` int(11) DEFAULT NULL COMMENT 'Periodo académico actual del grupo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_grupo` (`codigo_grupo`),
  KEY `idx_generacion` (`generacion`),
  KEY `idx_nivel` (`nivel_educativo`),
  KEY `idx_programa_educativo` (`programa_educativo`),
  KEY `idx_codigo` (`codigo_grupo`),
  KEY `idx_programa_id` (`programa_id`),
  KEY `idx_periodo_id` (`periodo_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `fk_grupos_programa`
    FOREIGN KEY (`programa_id`)
    REFERENCES `programas` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_grupos_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
-- MEJORA: Agregada FK a usuarios con SET NULL
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `nombre_guardado` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tamaño` bigint(11) DEFAULT 0,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_carga_id` int(11) DEFAULT NULL COMMENT 'FK a usuarios.id',
  `usuario_carga` varchar(100) DEFAULT NULL COMMENT 'Legacy field',
  `estado` enum('activo','eliminado') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `idx_periodo` (`periodo_id`),
  KEY `idx_periodo_estado` (`periodo_id`,`estado`),
  KEY `idx_fecha_carga` (`fecha_carga`),
  KEY `idx_usuario_carga_id` (`usuario_carga_id`),
  CONSTRAINT `fk_horarios_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_horarios_usuario`
    FOREIGN KEY (`usuario_carga_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carga_academica`
-- NUEVA TABLA: Gestiona la asignación de docentes a materias en grupos específicos
--

CREATE TABLE `carga_academica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `periodo_id` int(11) NOT NULL COMMENT 'Periodo académico',
  `docente_id` int(11) NOT NULL COMMENT 'Docente asignado',
  `programa_materia_id` int(11) NOT NULL COMMENT 'Materia del plan de estudios',
  `grupo_id` int(11) NOT NULL COMMENT 'Grupo donde se imparte',
  `horas_asignadas` int(11) NOT NULL DEFAULT 0 COMMENT 'Horas semanales asignadas',
  `observaciones` text DEFAULT NULL,
  `estado` enum('activo','cancelado','completado') NOT NULL DEFAULT 'activo',
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_asigno_id` int(11) DEFAULT NULL COMMENT 'Usuario que realizó la asignación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_carga` (`periodo_id`,`docente_id`,`programa_materia_id`,`grupo_id`),
  KEY `idx_periodo_id` (`periodo_id`),
  KEY `idx_docente_id` (`docente_id`),
  KEY `idx_materia_id` (`programa_materia_id`),
  KEY `idx_grupo_id` (`grupo_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_usuario_asigno` (`usuario_asigno_id`),
  CONSTRAINT `fk_carga_periodo`
    FOREIGN KEY (`periodo_id`)
    REFERENCES `periodos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_docente`
    FOREIGN KEY (`docente_id`)
    REFERENCES `docentes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_materia`
    FOREIGN KEY (`programa_materia_id`)
    REFERENCES `programa_materias` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_grupo`
    FOREIGN KEY (`grupo_id`)
    REFERENCES `grupos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_carga_usuario`
    FOREIGN KEY (`usuario_asigno_id`)
    REFERENCES `usuarios` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- ÍNDICES Y OPTIMIZACIONES ADICIONALES
--

-- Índice compuesto para búsquedas comunes de carga académica
CREATE INDEX idx_carga_periodo_docente ON carga_academica(periodo_id, docente_id, estado);
CREATE INDEX idx_carga_periodo_grupo ON carga_academica(periodo_id, grupo_id, estado);

-- Índice para reportes de docentes
CREATE INDEX idx_docentes_estado_regimen ON docentes(estado, regimen);

-- Índice para búsquedas de grupos activos por periodo
CREATE INDEX idx_grupos_periodo_estado ON grupos(periodo_id, estado);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
