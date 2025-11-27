-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2025 a las 09:32:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

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
-- Estructura de tabla para la tabla `carga_academica`
--

CREATE TABLE `carga_academica` (
  `id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `grupo_id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `turno` enum('Matutino','Vespertino','Mixto') NOT NULL DEFAULT 'Matutino',
  `horas` int(11) NOT NULL DEFAULT 0,
  `horas_clase` int(11) NOT NULL DEFAULT 0,
  `horas_tutoria` int(11) NOT NULL DEFAULT 0,
  `horas_estadia` int(11) NOT NULL DEFAULT 0,
  `actividades_administrativas` varchar(255) DEFAULT NULL,
  `total_horas_asignadas` int(11) GENERATED ALWAYS AS (`horas_clase` + `horas_tutoria` + `horas_estadia`) STORED,
  `estado` enum('activo','eliminado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_creacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena las cargas académicas de los docentes por periodo';

--
-- Volcado de datos para la tabla `carga_academica`
--

INSERT INTO `carga_academica` (`id`, `periodo_id`, `docente_id`, `grupo_id`, `materia_id`, `turno`, `horas`, `horas_clase`, `horas_tutoria`, `horas_estadia`, `actividades_administrativas`, `estado`, `fecha_creacion`, `fecha_modificacion`, `usuario_creacion`) VALUES
(1, 1, 44, 1, 544, 'Matutino', 1, 4, 1, 2, '', 'eliminado', '2025-11-21 17:35:01', '2025-11-21 17:35:30', 1),
(2, 1, 50, 1, 786, 'Matutino', 3, 3, 0, 0, '', 'eliminado', '2025-11-21 17:41:35', '2025-11-26 08:24:47', 1),
(3, 1, 51, 1, 544, '', 4, 4, 0, 0, '', 'activo', '2025-11-21 18:06:04', '2025-11-21 18:06:04', 1),
(4, 1, 52, 1, 185, 'Matutino', 6, 6, 1, 1, '', 'activo', '2025-11-21 19:04:52', '2025-11-21 19:04:52', 1),
(5, 1, 50, 1, 418, 'Matutino', 4, 1, 1, 1, '', 'activo', '2025-11-21 20:22:34', '2025-11-26 08:24:59', 1),
(6, 1, 12, 1, 418, 'Matutino', 4, 1, 1, 1, '', 'eliminado', '2025-11-21 20:29:27', '2025-11-25 19:59:50', 1),
(7, 1, 11, 1, 424, 'Matutino', 2, 2, 1, 0, 'LP', 'activo', '2025-11-21 20:31:05', '2025-11-21 20:31:05', 1),
(8, 1, 2, 1, 421, 'Matutino', 2, 1, 1, 1, '', 'eliminado', '2025-11-21 21:07:06', '2025-11-25 19:59:46', 1),
(9, 1, 11, 4, 315, '', 2, 0, 2, 3, '', 'activo', '2025-11-25 20:07:19', '2025-11-25 20:07:19', 1),
(10, 1, 53, 1, 427, 'Mixto', 1, 0, 1, 5, '', 'activo', '2025-11-25 20:13:01', '2025-11-25 20:13:01', 1),
(11, 1, 11, 4, 312, '', 1, 0, 0, 0, 'LP', 'activo', '2025-11-26 07:45:24', '2025-11-26 07:45:24', 1),
(12, 1, 11, 4, 316, '', 1, 1, 1, 1, 'LP', 'eliminado', '2025-11-26 07:48:21', '2025-11-26 07:48:35', 1),
(13, 1, 11, 4, 316, '', 1, 1, 1, 1, 'LP', 'activo', '2025-11-26 07:49:27', '2025-11-26 07:49:27', 1),
(14, 1, 11, 1, 420, 'Mixto', 1, 1, 1, 1, 'LP', 'eliminado', '2025-11-26 07:55:33', '2025-11-26 07:57:18', 1);

--
-- Disparadores `carga_academica`
--
DELIMITER $$
CREATE TRIGGER `before_insert_carga_academica` BEFORE INSERT ON `carga_academica` FOR EACH ROW BEGIN
    IF NEW.horas < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas no pueden ser negativas';
    END IF;

    IF NEW.horas_clase < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de clase no pueden ser negativas';
    END IF;

    IF NEW.horas_tutoria < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de tutoría no pueden ser negativas';
    END IF;

    IF NEW.horas_estadia < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de estadía no pueden ser negativas';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_update_carga_academica` BEFORE UPDATE ON `carga_academica` FOR EACH ROW BEGIN
    IF NEW.horas < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas no pueden ser negativas';
    END IF;

    IF NEW.horas_clase < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de clase no pueden ser negativas';
    END IF;

    IF NEW.horas_tutoria < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de tutoría no pueden ser negativas';
    END IF;

    IF NEW.horas_estadia < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Las horas de estadía no pueden ser negativas';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carga_plantillas`
--

CREATE TABLE `carga_plantillas` (
  `id` int(11) NOT NULL,
  `nombre_plantilla` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `periodo_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `datos_json` longtext NOT NULL,
  `estado` enum('activo','eliminado') NOT NULL DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plantillas temporales para guardar trabajo en progreso';

--
-- Volcado de datos para la tabla `carga_plantillas`
--

INSERT INTO `carga_plantillas` (`id`, `nombre_plantilla`, `descripcion`, `periodo_id`, `usuario_id`, `datos_json`, `estado`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 'Carga 2025 Prueba_1', '2 cargas académicas', 1, 1, '{\"cargas\":[{\"id\":2,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":50,\"docente\":\"Abigail Camacho Sandoval\",\"turno_docente\":\"Nocturno\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":786,\"clave_materia\":\"LICE-C7-06\",\"materia\":\"Administración Del Tiempo\",\"horas_plan\":3,\"turno\":\"Matutino\",\"horas\":3,\"horas_clase\":3,\"horas_tutoria\":0,\"horas_estadia\":0,\"administrativas\":\"\",\"total\":3,\"fecha_creacion\":\"2025-11-21 11:41:35\",\"fecha_modificacion\":\"2025-11-21 11:41:35\"},{\"id\":3,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":51,\"docente\":\"Alicia Sanjuana Leal Rendón\",\"turno_docente\":\"Nocturno\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":544,\"clave_materia\":\"MERC-C7-30\",\"materia\":\"Administración del Tiempo\",\"horas_plan\":4,\"turno\":\"\",\"horas\":4,\"horas_clase\":4,\"horas_tutoria\":0,\"horas_estadia\":0,\"administrativas\":\"\",\"total\":4,\"fecha_creacion\":\"2025-11-21 12:06:04\",\"fecha_modificacion\":\"2025-11-21 12:06:04\"}],\"fecha\":\"2025-11-21T18:29:45.367Z\",\"periodo_id\":\"1\"}', 'activo', '2025-11-21 18:29:45', '2025-11-21 18:29:45'),
(2, 'Plantilla 2025-Prueba-2', 'Descripción del', 1, 1, '{\"cargas\":[{\"id\":2,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":50,\"docente\":\"Abigail Camacho Sandoval\",\"turno_docente\":\"Nocturno\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":786,\"clave_materia\":\"LICE-C7-06\",\"materia\":\"Administración Del Tiempo\",\"horas_plan\":3,\"turno\":\"Matutino\",\"horas\":3,\"horas_clase\":3,\"horas_tutoria\":0,\"horas_estadia\":0,\"administrativas\":\"\",\"total\":3,\"fecha_creacion\":\"2025-11-21 11:41:35\",\"fecha_modificacion\":\"2025-11-21 11:41:35\"},{\"id\":5,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":50,\"docente\":\"Abigail Camacho Sandoval\",\"turno_docente\":\"Nocturno\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":418,\"clave_materia\":\"AUTO-C6-23\",\"materia\":\"Inglés V\",\"horas_plan\":4,\"turno\":\"Matutino\",\"horas\":4,\"horas_clase\":2,\"horas_tutoria\":1,\"horas_estadia\":1,\"administrativas\":\"\",\"total\":4,\"fecha_creacion\":\"2025-11-21 14:22:34\",\"fecha_modificacion\":\"2025-11-21 14:22:34\"},{\"id\":3,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":51,\"docente\":\"Alicia Sanjuana Leal Rendón\",\"turno_docente\":\"Nocturno\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":544,\"clave_materia\":\"MERC-C7-30\",\"materia\":\"Administración del Tiempo\",\"horas_plan\":4,\"turno\":\"\",\"horas\":4,\"horas_clase\":4,\"horas_tutoria\":0,\"horas_estadia\":0,\"administrativas\":\"\",\"total\":4,\"fecha_creacion\":\"2025-11-21 12:06:04\",\"fecha_modificacion\":\"2025-11-21 12:06:04\"},{\"id\":4,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":52,\"docente\":\"Brenda Janeth Mosqueda Ríos\",\"turno_docente\":\"Matutino\",\"regimen\":\"PH\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":185,\"clave_materia\":\"AUTO-C2-10\",\"materia\":\"Cálculo Diferencial\",\"horas_plan\":6,\"turno\":\"Matutino\",\"horas\":6,\"horas_clase\":6,\"horas_tutoria\":1,\"horas_estadia\":1,\"administrativas\":\"\",\"total\":8,\"fecha_creacion\":\"2025-11-21 13:04:52\",\"fecha_modificacion\":\"2025-11-21 13:04:52\"},{\"id\":7,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":11,\"docente\":\"Hugo Castillo Díaz\",\"turno_docente\":\"Matutino\",\"regimen\":\"PTC\",\"grupo_id\":1,\"grupo\":\"52AUTO6M\",\"materia_id\":424,\"clave_materia\":\"AUTO-C6-25\",\"materia\":\"Control de Motores Eléctricos\",\"horas_plan\":5,\"turno\":\"Matutino\",\"horas\":2,\"horas_clase\":2,\"horas_tutoria\":1,\"horas_estadia\":0,\"administrativas\":\"LP\",\"total\":3,\"fecha_creacion\":\"2025-11-21 14:31:05\",\"fecha_modificacion\":\"2025-11-21 14:31:05\"},{\"id\":9,\"periodo_id\":1,\"periodo\":\"Enero - Abril (2025)\",\"docente_id\":11,\"docente\":\"Hugo Castillo Díaz\",\"turno_docente\":\"Matutino\",\"regimen\":\"PTC\",\"grupo_id\":4,\"grupo\":\"52QI6N\",\"materia_id\":315,\"clave_materia\":\"QI-C6-24\",\"materia\":\"Cálculo de Varias Variables\",\"horas_plan\":5,\"turno\":\"\",\"horas\":2,\"horas_clase\":0,\"horas_tutoria\":2,\"horas_estadia\":3,\"administrativas\":\"\",\"total\":5,\"fecha_creacion\":\"2025-11-25 14:07:19\",\"fecha_modificacion\":\"2025-11-25 14:07:19\"}],\"fecha_guardado\":\"2025-11-25T20:10:27.611Z\",\"total_registros\":6}', 'eliminado', '2025-11-25 20:10:27', '2025-11-25 20:11:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL,
  `periodo_id` int(11) DEFAULT NULL,
  `nombre_docente` varchar(255) NOT NULL,
  `turno` varchar(50) NOT NULL,
  `regimen` varchar(10) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`id`, `periodo_id`, `nombre_docente`, `turno`, `regimen`, `estado`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, 1, 'Adalberta Jiménez Salgado', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(2, 1, 'Arely Eunice Cotero Rodríguez', 'Matutino', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(3, 1, 'Arianna Iveth Castillo González', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(4, 1, 'Armando Aguilar Loera', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(5, 1, 'Celeste Elizabeth de la Cerda Denegri', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(6, 1, 'Elsa Margarita Guevara Merino', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(7, 1, 'Erick Arturo González Garza', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(8, 1, 'Felipe De Jesús Ramírez Turrubiartes', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(9, 1, 'Gloria Leticia Aguilar Pachecano', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(10, 1, 'Héctor Torres Cruz', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(11, 1, 'Hugo Castillo Díaz', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(12, 1, 'Joanna Lizette Galindo Salazar', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(13, 1, 'Juan Zúñiga Moreno', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(14, 1, 'Lucía Patricia López Cuevas', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(15, 1, 'Marcela Yunuent Guzmán Muñoz', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(16, 1, 'Mateo Álvarez Ruiz', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(17, 1, 'Perla Lizeth Vázquez Loredo', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(18, 1, 'Reyna Rodríguez López', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(19, 1, 'Rigoberto Fuentevilla González', 'Matutino', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(20, 1, 'Rodolfo Hernández Chavarría', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(21, 1, 'Xóchitl Margarita Romero Arteaga', 'Nocturno', 'PTC', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(22, 1, 'Adrián Contreras Palacios', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(23, 1, 'Américo Antonio Frías Pineda', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(24, 1, 'Arturo Nava Ramírez', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(25, 1, 'David Alejandro Martínez Osoria', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(26, 1, 'Deisy Elvira Rodríguez Leal', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(27, 1, 'Diana Luna Florencio', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(28, 1, 'Flor Edtih Sahagún Sánchez', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(29, 1, 'Francisco Javier González Rodríguez', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(30, 1, 'Irma Beatriz Saldaña Govela', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(31, 1, 'Jessica Yadhira Guzmán Muñoz', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(32, 1, 'Jesús Leal Campos', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(33, 1, 'Jorge Guadalupe González González', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(34, 1, 'Jorge Hernán Cortez Lajas', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(35, 1, 'José Gustavo Alanís Nuñez', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(36, 1, 'Karina Elizabeth Montoya Ariceaga', 'Matutino/Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(37, 1, 'Laura Lariza Rodríguez González', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(38, 1, 'María de Jesús Cisneros Guani', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(39, 1, 'Mario Francisco Garza de León', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(40, 1, 'Mayra Maldonado Martínez', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(41, 1, 'Nallely Alejandra de León Guajardo', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(42, 1, 'Nancy Evelyn López Velarde Paz', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(43, 1, 'Nubia del Carmen Romay Franyutti', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(44, 1, 'Omar Alejandro Mata Garza', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(45, 1, 'Olga Lydia Salazar Villegas', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(46, 1, 'Paul Azuara Castillo', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(47, 1, 'Raúl Rodríguez Guerra', 'Matutino', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(48, 1, 'Saúl Espericueta Posadas', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(49, 1, 'Silvia Edith González Espinoza', 'Nocturno', 'PA', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(50, 1, 'Abigail Camacho Sandoval', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(51, 1, 'Alicia Sanjuana Leal Rendón', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(52, 1, 'Brenda Janeth Mosqueda Ríos', 'Matutino', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(53, 1, 'Carlos Cristóbal Juárez Mendoza', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(54, 1, 'Cristy Sarahi de León Leal', 'Matutino', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(55, 1, 'Jesús Tomas García Ramos', 'Matutino/Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(56, 1, 'Jonathan Alejandro Moreno Lozano', 'Matutino/Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(57, 1, 'Lucero de las Angeles Nájera Lira', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(58, 1, 'María Fernanda Tamez González', 'Matutino/Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(59, 1, 'Oscar Luis Rodríguez López', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(60, 1, 'Oswaldo Trejo Flores', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(61, 1, 'Víctor Manuel Pérez Simón', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(62, 1, 'Viviana Aremí Pérez Treviño', 'Matutino/Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(63, 1, 'Juan Pablo García Garza', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(64, 1, 'Ricardo Pérez Rodríguez', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(65, 1, 'Gloria Lizeth Bailón Silva', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(66, 1, 'Taryn Michelle Saldívar Estrada', 'Matutino', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(67, 1, 'Jesús Alfredo de León Leal', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(68, 1, 'Angélica Yuliana Guerrero Rocha', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53'),
(69, 1, 'Armando Campos Salazar', 'Nocturno', 'PH', 'activo', '2025-10-13 20:38:54', '2025-11-16 01:57:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id` int(11) NOT NULL,
  `periodo_id` int(11) DEFAULT NULL,
  `codigo_grupo` varchar(20) NOT NULL,
  `generacion` varchar(2) NOT NULL,
  `nivel_educativo` varchar(5) NOT NULL,
  `programa_educativo` varchar(20) NOT NULL,
  `grado` varchar(1) NOT NULL,
  `letra_identificacion` varchar(1) DEFAULT NULL,
  `turno` char(1) NOT NULL DEFAULT 'M' COMMENT 'M=Matutino, N=Nocturno',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id`, `periodo_id`, `codigo_grupo`, `generacion`, `nivel_educativo`, `programa_educativo`, `grado`, `letra_identificacion`, `turno`, `fecha_creacion`, `fecha_modificacion`, `estado`) VALUES
(1, 1, '52AUTO6M', '52', 'TSU', 'AUTO', '6', NULL, 'M', '2025-11-21 17:29:29', '2025-11-21 17:29:29', 'activo'),
(2, 1, '52INGE6N', '52', 'I', 'INGE', '6', NULL, 'N', '2025-11-25 20:03:54', '2025-11-25 20:03:54', 'activo'),
(3, 1, '52INGE6M', '52', 'I', 'INGE', '6', NULL, 'M', '2025-11-25 20:04:39', '2025-11-25 20:04:52', 'inactivo'),
(4, 1, '52QI6N', '52', 'TSU', 'QI', '6', NULL, 'N', '2025-11-25 20:05:26', '2025-11-25 20:05:26', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `nombre_guardado` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tamaño` bigint(11) DEFAULT 0,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_carga` varchar(100) DEFAULT NULL,
  `estado` enum('activo','eliminado') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos`
--

CREATE TABLE `periodos` (
  `id` int(11) NOT NULL,
  `periodo` varchar(255) NOT NULL,
  `año` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodos`
--

INSERT INTO `periodos` (`id`, `periodo`, `año`) VALUES
(1, 'Enero - Abril', 2025),
(2, 'Mayo - Agosto', 2025);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
--

CREATE TABLE `programas` (
  `id` int(11) NOT NULL,
  `nomenclatura` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `nivel` enum('TSU','I','L') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas`
--

INSERT INTO `programas` (`id`, `nomenclatura`, `nombre`, `nivel`, `activo`, `fecha_alta`) VALUES
(1, 'EVND', 'TSU Entornos Virtuales y Negocios Digitales', 'TSU', 1, '2025-11-13 02:52:17'),
(2, 'QI', 'TSU en Química Industrial', 'TSU', 1, '2025-11-13 02:52:17'),
(3, 'MERC', 'TSU en Mercadotecnia', 'TSU', 1, '2025-11-13 02:52:17'),
(4, 'MI', 'TSU en Mantenimiento Industrial', 'TSU', 1, '2025-11-13 02:52:17'),
(5, 'EII', 'TSU en Enseñanza del Idioma Inglés', 'TSU', 1, '2025-11-13 02:52:17'),
(6, 'AUTO', 'TSU en Automatización', 'TSU', 1, '2025-11-13 02:52:17'),
(7, 'TSU ', 'TSU en Entornos Virtuales y Negocios Digitales', 'TSU', 1, '2025-11-13 02:53:16'),
(8, 'QI', 'TSU en Química Industrial', 'TSU', 1, '2025-11-13 02:53:16'),
(9, 'AUTO', 'TSU en Automatización', 'TSU', 1, '2025-11-13 02:53:16'),
(10, 'MERC', 'TSU en Mercadotecnia', 'TSU', 1, '2025-11-13 02:53:16'),
(11, 'EII', 'TSU en Enseñanza del Idioma Inglés', 'TSU', 1, '2025-11-13 02:53:16'),
(12, 'MI', 'TSU en Mantenimiento Industrial', 'TSU', 1, '2025-11-13 02:53:16'),
(13, 'LICE', 'Licenciatura En Gestión Institucional Educativa y Curricular', 'L', 1, '2025-11-13 02:55:26'),
(14, 'INGE', 'Ingeniería en Mecatrónia', 'I', 1, '2025-11-13 02:55:26'),
(15, 'INGE', 'Ingeniería en Mantenimiento Industrial', 'I', 1, '2025-11-13 02:55:26'),
(16, 'INGE', 'Ingeniería en Entornos Virtuales y Negocios Digitales', 'I', 1, '2025-11-13 02:55:26'),
(17, 'LICE', 'Licenciatura en Innovación de Negocios y Mercadotecnia', 'L', 1, '2025-11-13 02:55:26'),
(18, 'INGE', 'Ingeniería Química de Procesos Industriales', 'I', 1, '2025-11-13 02:55:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programa_materias`
--

CREATE TABLE `programa_materias` (
  `id` int(11) NOT NULL,
  `id_programa` int(11) NOT NULL,
  `cve_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(255) NOT NULL,
  `grado` tinyint(2) NOT NULL,
  `horas_semanales` int(11) NOT NULL,
  `turno` enum('Matutino','Nocturno') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programa_materias`
--

INSERT INTO `programa_materias` (`id`, `id_programa`, `cve_materia`, `nombre_materia`, `grado`, `horas_semanales`, `turno`, `activo`, `fecha_alta`) VALUES
(1, 1, 'EVND-C1-01', 'Inglés I', 1, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(2, 1, 'EVND-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(3, 1, 'EVND-C1-03', 'Fundamentos Matemáticos', 1, 7, 'Matutino', 1, '2025-11-13 02:52:17'),
(4, 1, 'EVND-C1-04', 'Fundamentos de Redes', 1, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(5, 1, 'EVND-C1-05', 'Física', 1, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(6, 1, 'EVND-C1-06', 'Fundamentos de Programación', 1, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(7, 1, 'EVND-C1-07', 'Comunicación y Habilidades digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(8, 1, 'EVND-C2-08', 'Inglés II', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(9, 1, 'EVND-C2-09', 'Habilidades Socioemocionales y manejo de emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(10, 1, 'EVND-C2-10', 'Calculo diferencial', 2, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(11, 1, 'EVND-C2-11', 'Conmutación y enrutamiento de redes', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(12, 1, 'EVND-C2-12', 'Probabilidad y Estadística', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(13, 1, 'EVND-C2-13', 'Programación estructurada', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(14, 1, 'EVND-C2-14', 'Sistemas operativos', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(15, 1, 'EVND-C3-15', 'Inglés III', 3, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(16, 1, 'EVND-C3-16', 'Desarrollo del pensamiento y toma de decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(17, 1, 'EVND-C3-17', 'Calculo integral', 3, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(18, 1, 'EVND-C3-18', 'Tópicos de calidad para el diseño de software', 3, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(19, 1, 'EVND-C3-19', 'Base de Datos', 3, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(20, 1, 'EVND-C3-20', 'Programación orientada a objetos', 3, 7, 'Matutino', 1, '2025-11-13 02:52:17'),
(21, 1, 'EVND-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(22, 1, 'EVND-C4-22', 'Inglés IV', 4, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(23, 1, 'EVND-C4-23', 'Ética profesional', 4, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(24, 1, 'EVND-C4-24', 'Cálculo de varias variables', 4, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(25, 1, 'EVND-C4-25', 'Modelado y animación digital', 4, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(26, 1, 'EVND-C4-26', 'Diseño digital y producción audiovisual', 4, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(27, 1, 'EVND-C4-27', 'Aplicaciones web', 4, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(28, 1, 'EVND-C4-28', 'Mercadotecnia Digital', 4, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(29, 1, 'EVND-C5-29', 'Ingles V', 5, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(30, 1, 'EVND-C5-30', 'Liderazgo de equipos de alto desempeño', 5, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(31, 1, 'EVND-C5-31', 'Ecuaciones Diferenciales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(32, 1, 'EVND-C5-32', 'Aplicaciones para realidad aumentada', 5, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(33, 1, 'EVND-C5-33', 'Aplicaciones para realidad virtual', 5, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(34, 1, 'EVND-C5-34', 'Fireworks para desarrollo web', 5, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(35, 1, 'EVND-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(36, 2, 'QI-C1-01', 'Inglés I', 1, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(37, 2, 'QI-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(38, 2, 'QI-C1-03', 'Fundamentos Matemáticos', 1, 7, 'Matutino', 1, '2025-11-13 02:52:17'),
(39, 2, 'QI-C1-04', 'Termodinámica', 1, 3, 'Matutino', 1, '2025-11-13 02:52:17'),
(40, 2, 'QI-C1-05', 'Buenas Prácticas de Laboratorio', 1, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(41, 2, 'QI-C1-06', 'Química Básica', 1, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(42, 2, 'QI-C1-07', 'Comunicación y Habilidades Digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(43, 2, 'QI-C2-08', 'Inglés II', 2, 5, 'Matutino', 1, '2025-11-13 02:52:17'),
(44, 2, 'QI-C2-09', 'Habilidades Socioemocionales y Manejo de Emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:17'),
(45, 2, 'QI-C2-10', 'Cálculo Diferencial', 2, 6, 'Matutino', 1, '2025-11-13 02:52:17'),
(46, 2, 'QI-C2-11', 'Física', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(47, 2, 'QI-C2-12', 'Probabilidad y Estadística', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(48, 2, 'QI-C2-13', 'Química Inorgánica', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(49, 2, 'QI-C2-14', 'Control de Calidad', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(50, 2, 'QI-C3-15', 'Inglés III', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(51, 2, 'QI-C3-16', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(52, 2, 'QI-C3-17', 'Cálculo Integral', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(53, 2, 'QI-C3-18', 'Balance en Materia y Energía', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(54, 2, 'QI-C3-19', 'Química Orgánica', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(55, 2, 'QI-C3-20', 'Química Analítica', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(56, 2, 'QI-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(57, 2, 'QI-C4-22', 'Inglés IV', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(58, 2, 'QI-C4-23', 'Ética Profesional', 4, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(59, 2, 'QI-C4-24', 'Cálculo de Varias Variables', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(60, 2, 'QI-C4-25', 'Operaciones Unitarias', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(61, 2, 'QI-C4-26', 'Cinética Química', 4, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(62, 2, 'QI-C4-27', 'Seguridad, Higiene y Medio Ambiente', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(63, 2, 'QI-C4-28', 'Transporte de Fluidos', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(64, 2, 'QI-C5-29', 'Inglés V', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(65, 2, 'QI-C5-30', 'Liderazgo de Equipos de Alto Desempeño', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(66, 2, 'QI-C5-31', 'Ecuaciones Diferenciales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(67, 2, 'QI-C5-32', 'Proceso de Separación', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(68, 2, 'QI-C5-33', 'Transferencia de Masas', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(69, 2, 'QI-C5-34', 'Análisis Industriales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(70, 2, 'QI-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(71, 3, 'MERC-C1-01', 'Inglés I', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(72, 3, 'MERC-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(73, 3, 'MERC-C1-03', 'Mercadotecnia', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(74, 3, 'MERC-C1-04', 'Matemáticas', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(75, 3, 'MERC-C1-05', 'Informática', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(76, 3, 'MERC-C1-06', 'Fundamentos de Administración y Entornos Empresariales', 1, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(77, 3, 'MERC-C1-07', 'Comunicación y Habilidades Digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(78, 3, 'MERC-C2-08', 'Inglés II', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(79, 3, 'MERC-C2-09', 'Habilidades socioemocionales y manejo de emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(80, 3, 'MERC-C2-10', 'Estadística I', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(81, 3, 'MERC-C2-11', 'Planeación estratégica', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(82, 3, 'MERC-C2-12', 'Contabilidad para Negocios', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(83, 3, 'MERC-C2-13', 'Comportamiento del Consumidor', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(84, 3, 'MERC-C2-14', 'Economía', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(85, 3, 'MERC-C3-15', 'Inglés III', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(86, 3, 'MERC-C3-16', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(87, 3, 'MERC-C3-17', 'Legislación Comercial', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(88, 3, 'MERC-C3-18', 'Estadística II', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(89, 3, 'MERC-C3-19', 'Sistema de Investigación de Mercados I', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(90, 3, 'MERC-C3-20', 'Estratégicas de Productos y Precios', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(91, 3, 'MERC-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(92, 3, 'MERC-C4-22', 'Inglés IV', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(93, 3, 'MERC-C4-23', 'Ética profesional', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(94, 3, 'MERC-C4-24', 'Mezcla Promocional', 4, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(95, 3, 'MERC-C4-25', 'Diseño Digital y Multimedia', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(96, 3, 'MERC-C4-26', 'Sistema de Investigación de Mercados II', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(97, 3, 'MERC-C4-27', 'Gestión de Ventas', 4, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(98, 3, 'MERC-C4-28', 'Administración del Tiempo', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(99, 3, 'MERC-C5-29', 'Inglés V', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(100, 3, 'MERC-C5-30', 'Liderazgo de Equipos de alto Desempeño', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(101, 3, 'MERC-C5-31', 'Logística y Distribución', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(102, 3, 'MERC-C5-32', 'Mercadotecnia de Servicios', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(103, 3, 'MERC-C5-33', 'Mercadotecnia Digital I', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(104, 3, 'MERC-C5-34', 'Mercadotecnia Estratégica', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(105, 3, 'MERC-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(106, 4, 'MI-C1-01', 'Inglés I', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(107, 4, 'MI-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(108, 4, 'MI-C1-03', 'Fundamentos Matemáticos', 1, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(109, 4, 'MI-C1-04', 'Fundamentos de Mantenimiento', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(110, 4, 'MI-C1-05', 'Dibujo Industrial', 1, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(111, 4, 'MI-C1-06', 'Seguridad Industrial', 1, 3, 'Matutino', 1, '2025-11-13 02:52:18'),
(112, 4, 'MI-C1-07', 'Comunicación y Habilidades Digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(113, 4, 'MI-C2-08', 'Inglés II', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(114, 4, 'MI-C2-09', 'Habilidades Socioemocionales y Manejo de Emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(115, 4, 'MI-C2-10', 'Cálculo Diferencial', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(116, 4, 'MI-C2-11', 'Física', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(117, 4, 'MI-C2-12', 'Probabilidad y Estadística', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(118, 4, 'MI-C2-13', 'Gestión de Mantenimiento', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(119, 4, 'MI-C2-14', 'Termodinámica', 2, 3, 'Matutino', 1, '2025-11-13 02:52:18'),
(120, 4, 'MI-C3-15', 'Inglés III', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(121, 4, 'MI-C3-16', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(122, 4, 'MI-C3-17', 'Cálculo Integral', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(123, 4, 'MI-C3-18', 'Sistemas Eléctricos', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(124, 4, 'MI-C3-19', 'Máquinas y Mecanismos', 3, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(125, 4, 'MI-C3-20', 'Electrónica Analítica', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(126, 4, 'MI-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(127, 4, 'MI-C4-22', 'Inglés IV', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(128, 4, 'MI-C4-23', 'Ética Profesional', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(129, 4, 'MI-C4-24', 'Cálculo de Varias Variables', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(130, 4, 'MI-C4-25', 'Maquinas Eléctricas', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(131, 4, 'MI-C4-26', 'Mantenimiento a Procesos de Manufactura', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(132, 4, 'MI-C4-27', 'Electrónica Digital', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(133, 4, 'MI-C4-28', 'Sistemas Neumáticos e Hidráulicos', 4, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(134, 4, 'MI-C5-29', 'Inglés V', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(135, 4, 'MI-C5-30', 'Liderazgo de Equipos de Alto Desempeño', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(136, 4, 'MI-C5-31', 'Ecuaciones Diferenciales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(137, 4, 'MI-C5-32', 'Automatización y Robótica', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(138, 4, 'MI-C5-33', 'Sistemas Térmicos e Industriales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(139, 4, 'MI-C5-34', 'Ciencias de los Materiales', 5, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(140, 4, 'MI-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(141, 5, 'EII-C1-01', 'Inglés I', 1, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(142, 5, 'EII-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(143, 5, 'EII-C1-03', 'Fundamentos Pedagógicos de la Educación', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(144, 5, 'EII-C1-04', 'Psicología Educativa y Etapas del Desarrollo', 1, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(145, 5, 'EII-C1-05', 'Fundamento de Matemáticas', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(146, 5, 'EII-C1-06', 'Educación en México', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(147, 5, 'EII-C1-07', 'Comunicación y Habilidades Digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(148, 5, 'EII-C2-08', 'Inglés II', 2, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(149, 5, 'EII-C2-09', 'Habilidades Socioemocionales y Manejo de Emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(150, 5, 'EII-C2-10', 'Metodología de la Didáctica I', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(151, 5, 'EII-C2-11', 'Diseño de Material Didáctico I', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(152, 5, 'EII-C2-12', 'Probabilidad y Estadística', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(153, 5, 'EII-C2-13', 'Evaluación de Procesos y Enseñanzas-Aprendizaje', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(154, 5, 'EII-C2-14', 'Metodología de la Investigación', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(155, 5, 'EII-C3-15', 'Ingles III', 3, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(156, 5, 'EII-C3-16', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(157, 5, 'EII-C3-17', 'Metodología de la Didáctica II', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(158, 5, 'EII-C3-18', 'Diseño de Material Didáctico II', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(159, 5, 'EII-C3-19', 'Instrumentos de Evaluación', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(160, 5, 'EII-C3-20', 'Planeación Educativa', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(161, 5, 'EII-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(162, 5, 'EII-C4-22', 'Ingles IV', 4, 8, 'Matutino', 1, '2025-11-13 02:52:18'),
(163, 5, 'EII-C4-23', 'Ética Profesional', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(164, 5, 'EII-C4-24', 'Fonética', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(165, 5, 'EII-C4-25', 'Diseño de Situaciones de Aprendizaje I', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(166, 5, 'EII-C4-26', 'Estrategias de Enseñanzas de la Lengua Inglesa I', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(167, 5, 'EII-C4-27', 'Metodología de la enseñanza de contenidos', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(168, 5, 'EII-C4-28', 'Enseñanza de Estructura Gramatical Inglesa', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(169, 5, 'EII-C5-29', 'Ingles V', 5, 8, 'Matutino', 1, '2025-11-13 02:52:18'),
(170, 5, 'EII-C5-30', 'Liderazgo de Equipos de Alto Desempeño', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(171, 5, 'EII-C5-31', 'Enseñanza de Habilidades Productivas', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(172, 5, 'EII-C5-32', 'Diseño de Situaciones de Aprendizaje II', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(173, 5, 'EII-C5-33', 'Estrategia de Enseñanza de Lengua Inglesa II', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(174, 5, 'EII-C5-34', 'Enseñanza de Habilidades Receptivas', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(175, 5, 'EII-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(176, 6, 'AUTO-C1-01', 'Inglés I', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(177, 6, 'AUTO-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(178, 6, 'AUTO-C1-03', 'Fundamentos Matemáticos', 1, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(179, 6, 'AUTO-C1-04', 'Procesos Industriales', 1, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(180, 6, 'AUTO-C1-05', 'Metodología de la Programación', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(181, 6, 'AUTO-C1-06', 'Metrología', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(182, 6, 'AUTO-C1-07', 'Comunicación y Habilidades Digitales', 1, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(183, 6, 'AUTO-C2-08', 'Inglés II', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(184, 6, 'AUTO-C2-09', 'Habilidades Socioemocionales y Manejo de Emociones', 2, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(185, 6, 'AUTO-C2-10', 'Cálculo Diferencial', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(186, 6, 'AUTO-C2-11', 'Física', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(187, 6, 'AUTO-C2-12', 'Probabilidad y Estadística', 2, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(188, 6, 'AUTO-C2-13', 'Circuitos Eléctricos', 2, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(189, 6, 'AUTO-C2-14', 'Dibujo para Ingeniería', 2, 3, 'Matutino', 1, '2025-11-13 02:52:18'),
(190, 6, 'AUTO-C3-15', 'Inglés III', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(191, 6, 'AUTO-C3-16', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(192, 6, 'AUTO-C3-17', 'Cálculo Integral', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(193, 6, 'AUTO-C3-18', 'Elementos Mecánicos', 3, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(194, 6, 'AUTO-C3-19', 'Electrónico Digital', 3, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(195, 6, 'AUTO-C3-20', 'Electrónica Analógica y de Potencia', 3, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(196, 6, 'AUTO-C3-21', 'Proyecto Integrador I', 3, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(197, 6, 'AUTO-C4-22', 'Inglés IV', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(198, 6, 'AUTO-C4-23', 'Ética Profesional', 4, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(199, 6, 'AUTO-C4-24', 'Cálculo de Varias Variables', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(200, 6, 'AUTO-C4-25', 'Estructura y Propiedades de los Materiales', 4, 3, 'Matutino', 1, '2025-11-13 02:52:18'),
(201, 6, 'AUTO-C4-26', 'Control de Motores Eléctricos', 4, 6, 'Matutino', 1, '2025-11-13 02:52:18'),
(202, 6, 'AUTO-C4-27', 'Sistemas Neumáticos e Hidráulicos', 4, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(203, 6, 'AUTO-C4-28', 'Instrumentación Industrial', 4, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(204, 6, 'AUTO-C5-29', 'Inglés V', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(205, 6, 'AUTO-C5-30', 'Liderazgo de Equipos de Alto Desempeño', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(206, 6, 'AUTO-C5-31', 'Ecuaciones Diferenciales', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(207, 6, 'AUTO-C5-32', 'Controladores Lógicos Programables', 5, 7, 'Matutino', 1, '2025-11-13 02:52:18'),
(208, 6, 'AUTO-C5-33', 'Procesos de Manufactura', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(209, 6, 'AUTO-C5-34', 'Implementación de Sistemas Automáticos', 5, 5, 'Matutino', 1, '2025-11-13 02:52:18'),
(210, 6, 'AUTO-C5-35', 'Proyecto Integrador II', 5, 4, 'Matutino', 1, '2025-11-13 02:52:18'),
(211, 7, 'TSU -C1-01', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(212, 7, 'TSU -C1-02', 'Fundamentos de Redes', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(213, 7, 'TSU -C1-03', 'Fundamentos de Programación', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(214, 7, 'TSU -C1-04', 'Física', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(215, 7, 'TSU -C2-05', 'Inglés I', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(216, 7, 'TSU -C2-06', 'Cálculo Diferencial', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(217, 7, 'TSU -C2-07', 'Programación Estructurada', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(218, 7, 'TSU -C2-08', 'Comunicación y Habilidades Digitales', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(219, 7, 'TSU -C3-09', 'Inglés II', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(220, 7, 'TSU -C3-10', 'Desarrollo Humano y Valores', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(221, 7, 'TSU -C3-11', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(222, 7, 'TSU -C3-12', 'Conmutación y Enrutamiento', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(223, 7, 'TSU -C3-13', 'Sistemas Operativos', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(224, 7, 'TSU -C4-14', 'Inglés III', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(225, 7, 'TSU -C4-15', 'Probabilidad y Estadística', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(226, 7, 'TSU -C4-16', 'Base de Datos', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(227, 7, 'TSU -C4-17', 'Programación Orientada a Objetos', 4, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(228, 7, 'TSU -C5-18', 'Inglés IV', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(229, 7, 'TSU -C5-19', 'Desarrollo del Pensamiento y Toma de Decisiones', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(230, 7, 'TSU -C5-20', 'Cálculo Integral', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(231, 7, 'TSU -C5-21', 'Tópicos de Calidad para el Diseño de Software', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(232, 7, 'TSU -C5-22', 'Proyecto Integrador I', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(233, 7, 'TSU -C6-23', 'Ética Profesional', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(234, 7, 'TSU -C6-24', 'Cálculo de Varias Variables', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(235, 7, 'TSU -C6-25', 'Modelado y Animación Digital', 6, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(236, 7, 'TSU -C6-26', 'Diseño Digital y Producción Audiovisual', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(237, 7, 'TSU -C7-27', 'Inglés V', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(238, 7, 'TSU -C7-28', 'Liderazgo de Equipos de Alto Desempeño', 7, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(239, 7, 'TSU -C7-29', 'Aplicaciones para Realidad Aumentada', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(240, 7, 'TSU -C7-30', 'Mercadotecnia Digital', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(241, 7, 'TSU -C7-31', 'Aplicaciones Web', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(242, 7, 'TSU -C8-32', 'Ecuaciones Diferenciales', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(243, 7, 'TSU -C8-33', 'Aplicaciones para Realidad Aumentada', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(244, 7, 'TSU -C8-34', 'Frameworks para Desarrollo Web', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(245, 7, 'TSU -C8-35', 'Proyecto Integrador II', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(246, 2, 'QI-C1-01', 'Inglés I', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(247, 8, 'QI-C1-01', 'Inglés I', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(249, 2, 'QI-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(250, 8, 'QI-C1-02', 'Desarrollo Humano y Valores', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(252, 2, 'QI-C1-03', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(253, 8, 'QI-C1-03', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(255, 2, 'QI-C1-04', 'Buenas Prácticas de Laboratorio', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(256, 8, 'QI-C1-04', 'Buenas Prácticas de Laboratorio', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(258, 2, 'QI-C2-05', 'Inglés II', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(259, 8, 'QI-C2-05', 'Inglés II', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(261, 2, 'QI-C2-06', 'Cálculo Diferencial', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(262, 8, 'QI-C2-06', 'Cálculo Diferencial', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(264, 2, 'QI-C2-07', 'Química Básica', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(265, 8, 'QI-C2-07', 'Química Básica', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(267, 2, 'QI-C2-08', 'Comunicación y Habilidades Digitales', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(268, 8, 'QI-C2-08', 'Comunicación y Habilidades Digitales', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(270, 2, 'QI-C3-09', 'Inglés III', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(271, 8, 'QI-C3-09', 'Inglés III', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(273, 2, 'QI-C3-10', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(274, 8, 'QI-C3-10', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(276, 2, 'QI-C3-11', 'Termodinámica', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(277, 8, 'QI-C3-11', 'Termodinámica', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(279, 2, 'QI-C3-12', 'Probabilidad y Estadística', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(280, 8, 'QI-C3-12', 'Probabilidad y Estadística', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(282, 2, 'QI-C3-13', 'Química Inorgánica', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(283, 8, 'QI-C3-13', 'Química Inorgánica', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(285, 2, 'QI-C4-14', 'Inglés IV', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(286, 8, 'QI-C4-14', 'Inglés IV', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(288, 2, 'QI-C4-15', 'Desarrollo del Pensamiento y Toma de Decisiones', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(289, 8, 'QI-C4-15', 'Desarrollo del Pensamiento y Toma de Decisiones', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(291, 2, 'QI-C4-16', 'Cálculo Integral', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(292, 8, 'QI-C4-16', 'Cálculo Integral', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(294, 2, 'QI-C4-17', 'Física', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(295, 8, 'QI-C4-17', 'Física', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(297, 2, 'QI-C4-18', 'Control de Calidad', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(298, 8, 'QI-C4-18', 'Control de Calidad', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(300, 2, 'QI-C5-19', 'Balance de Materia y Energía', 5, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(301, 8, 'QI-C5-19', 'Balance de Materia y Energía', 5, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(303, 2, 'QI-C5-20', 'Química Orgánica', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(304, 8, 'QI-C5-20', 'Química Orgánica', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(306, 2, 'QI-C5-21', 'Química Analítica', 5, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(307, 8, 'QI-C5-21', 'Química Analítica', 5, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(309, 2, 'QI-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(310, 8, 'QI-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(312, 2, 'QI-C6-23', 'Inglés V', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(313, 8, 'QI-C6-23', 'Inglés V', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(315, 2, 'QI-C6-24', 'Cálculo de Varias Variables', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(316, 8, 'QI-C6-24', 'Cálculo de Varias Variables', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(318, 2, 'QI-C6-25', 'Operaciones Unitarias', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(319, 8, 'QI-C6-25', 'Operaciones Unitarias', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(321, 2, 'QI-C6-26', 'Cinética Química', 6, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(322, 8, 'QI-C6-26', 'Cinética Química', 6, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(324, 2, 'QI-C7-27', 'Ética Profesional', 7, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(325, 8, 'QI-C7-27', 'Ética Profesional', 7, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(327, 2, 'QI-C7-28', 'Procesos de Separación', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(328, 8, 'QI-C7-28', 'Procesos de Separación', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(330, 2, 'QI-C7-29', 'Transferencia de Masas', 7, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(331, 8, 'QI-C7-29', 'Transferencia de Masas', 7, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(333, 2, 'QI-C7-30', 'Seguridad Higiene y Medio Ambiente', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(334, 8, 'QI-C7-30', 'Seguridad Higiene y Medio Ambiente', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(336, 2, 'QI-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(337, 8, 'QI-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(339, 2, 'QI-C8-32', 'Ecuaciones Diferenciales', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(340, 8, 'QI-C8-32', 'Ecuaciones Diferenciales', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(342, 2, 'QI-C8-33', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(343, 8, 'QI-C8-33', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(345, 2, 'QI-C8-34', 'Análisis Industriales', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(346, 8, 'QI-C8-34', 'Análisis Industriales', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(348, 2, 'QI-C8-35', 'Transporte de Fluidos', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(349, 8, 'QI-C8-35', 'Transporte de Fluidos', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(351, 6, 'AUTO-C1-01', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(352, 9, 'AUTO-C1-01', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(354, 6, 'AUTO-C1-02', 'Procesos Industriales', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(355, 9, 'AUTO-C1-02', 'Procesos Industriales', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(357, 6, 'AUTO-C1-03', 'Metrología', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(358, 9, 'AUTO-C1-03', 'Metrología', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(360, 6, 'AUTO-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(361, 9, 'AUTO-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(363, 6, 'AUTO-C2-05', 'Inglés I', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(364, 9, 'AUTO-C2-05', 'Inglés I', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(366, 6, 'AUTO-C2-06', 'Cálculo Diferencial', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(367, 9, 'AUTO-C2-06', 'Cálculo Diferencial', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(369, 6, 'AUTO-C2-07', 'Física', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(370, 9, 'AUTO-C2-07', 'Física', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(372, 6, 'AUTO-C2-08', 'Circuitos Eléctricos', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(373, 9, 'AUTO-C2-08', 'Circuitos Eléctricos', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(375, 6, 'AUTO-C3-09', 'Inglés II', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(376, 9, 'AUTO-C3-09', 'Inglés II', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(378, 6, 'AUTO-C3-10', 'Desarrollo Humano y Valores', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(379, 9, 'AUTO-C3-10', 'Desarrollo Humano y Valores', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(381, 6, 'AUTO-C3-11', 'Cálculo Integral', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(382, 9, 'AUTO-C3-11', 'Cálculo Integral', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(384, 6, 'AUTO-C3-12', 'Probabilidad y Estadística', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(385, 9, 'AUTO-C3-12', 'Probabilidad y Estadística', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(387, 6, 'AUTO-C3-13', 'Metodología de la Programación', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(388, 9, 'AUTO-C3-13', 'Metodología de la Programación', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(390, 6, 'AUTO-C4-14', 'Inglés III', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(391, 9, 'AUTO-C4-14', 'Inglés III', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(393, 6, 'AUTO-C4-15', 'Habilidades Socioemocionales y Manejo de Conflictos', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(394, 9, 'AUTO-C4-15', 'Habilidades Socioemocionales y Manejo de Conflictos', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(396, 6, 'AUTO-C4-16', 'Elementos Mecánicos', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(397, 9, 'AUTO-C4-16', 'Elementos Mecánicos', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(399, 6, 'AUTO-C4-17', 'Electrónica Analógica y de Potencia', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(400, 9, 'AUTO-C4-17', 'Electrónica Analógica y de Potencia', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(402, 6, 'AUTO-C4-18', 'Dibujo para Ingeniería', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(403, 9, 'AUTO-C4-18', 'Dibujo para Ingeniería', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(405, 6, 'AUTO-C5-19', 'Inglés IV', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(406, 9, 'AUTO-C5-19', 'Inglés IV', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(408, 6, 'AUTO-C5-20', 'Desarrollo del Pensamiento y Toma de Decisiones', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(409, 9, 'AUTO-C5-20', 'Desarrollo del Pensamiento y Toma de Decisiones', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(411, 6, 'AUTO-C5-21', 'Electrónica Digital', 5, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(412, 9, 'AUTO-C5-21', 'Electrónica Digital', 5, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(414, 6, 'AUTO-C5-22', 'Proyecto Integrador I', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(415, 9, 'AUTO-C5-22', 'Proyecto Integrador I', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(417, 6, 'AUTO-C6-23', 'Inglés V', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(418, 9, 'AUTO-C6-23', 'Inglés V', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(420, 6, 'AUTO-C6-24', 'Cálculo de Varias Variables', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(421, 9, 'AUTO-C6-24', 'Cálculo de Varias Variables', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(423, 6, 'AUTO-C6-25', 'Control de Motores Eléctricos', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(424, 9, 'AUTO-C6-25', 'Control de Motores Eléctricos', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(426, 6, 'AUTO-C6-26', 'Sistemas Neumáticos e Hidráulicos', 6, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(427, 9, 'AUTO-C6-26', 'Sistemas Neumáticos e Hidráulicos', 6, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(429, 6, 'AUTO-C7-27', 'Ética Profesional', 7, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(430, 9, 'AUTO-C7-27', 'Ética Profesional', 7, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(432, 6, 'AUTO-C7-28', 'Ecuaciones Diferenciales', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(433, 9, 'AUTO-C7-28', 'Ecuaciones Diferenciales', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(435, 6, 'AUTO-C7-29', 'Controladores Lógicos Programables', 7, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(436, 9, 'AUTO-C7-29', 'Controladores Lógicos Programables', 7, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(438, 6, 'AUTO-C7-30', 'Instrumentación Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(439, 9, 'AUTO-C7-30', 'Instrumentación Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(441, 6, 'AUTO-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(442, 9, 'AUTO-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(444, 6, 'AUTO-C8-32', 'Procesos de Manufactura', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(445, 9, 'AUTO-C8-32', 'Procesos de Manufactura', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(447, 6, 'AUTO-C8-33', 'Implementación de Sistemas Automáticos', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(448, 9, 'AUTO-C8-33', 'Implementación de Sistemas Automáticos', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(450, 6, 'AUTO-C8-34', 'Estructura y Propiedad de los Materiales', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(451, 9, 'AUTO-C8-34', 'Estructura y Propiedad de los Materiales', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(453, 6, 'AUTO-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(454, 9, 'AUTO-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(456, 3, 'MERC-C1-01', 'Mercadotecnia', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(457, 10, 'MERC-C1-01', 'Mercadotecnia', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(459, 3, 'MERC-C1-02', 'Informática', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(460, 10, 'MERC-C1-02', 'Informática', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(462, 3, 'MERC-C1-03', 'Fundamentos de Administración y Entorno Empresarial', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(463, 10, 'MERC-C1-03', 'Fundamentos de Administración y Entorno Empresarial', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(465, 3, 'MERC-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(466, 10, 'MERC-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(468, 3, 'MERC-C2-05', 'Inglés I', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(469, 10, 'MERC-C2-05', 'Inglés I', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(471, 3, 'MERC-C2-06', 'Desarrollo Humano y Valores', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(472, 10, 'MERC-C2-06', 'Desarrollo Humano y Valores', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(474, 3, 'MERC-C2-07', 'Matemáticas', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(475, 10, 'MERC-C2-07', 'Matemáticas', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(477, 3, 'MERC-C2-08', 'Planeación Estratégica', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(478, 10, 'MERC-C2-08', 'Planeación Estratégica', 2, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(480, 3, 'MERC-C2-09', 'Comportamiento del Consumidor', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(481, 10, 'MERC-C2-09', 'Comportamiento del Consumidor', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(483, 3, 'MERC-C3-10', 'Inglés II', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(484, 10, 'MERC-C3-10', 'Inglés II', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(486, 3, 'MERC-C3-11', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(487, 10, 'MERC-C3-11', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(489, 3, 'MERC-C3-12', 'Estadística I', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(490, 10, 'MERC-C3-12', 'Estadística I', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(492, 3, 'MERC-C3-13', 'Economía', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(493, 10, 'MERC-C3-13', 'Economía', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(495, 3, 'MERC-C4-14', 'Inglés III', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(496, 10, 'MERC-C4-14', 'Inglés III', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(498, 3, 'MERC-C4-15', 'Desarrollo del Pensamiento y Toma de Decisiones', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(499, 10, 'MERC-C4-15', 'Desarrollo del Pensamiento y Toma de Decisiones', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(501, 3, 'MERC-C4-16', 'Estadística II', 4, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(502, 10, 'MERC-C4-16', 'Estadística II', 4, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(504, 3, 'MERC-C4-17', 'Sistema de Investigación de Mercados I', 4, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(505, 10, 'MERC-C4-17', 'Sistema de Investigación de Mercados I', 4, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(507, 3, 'MERC-C5-18', 'Ética Profesional', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(508, 10, 'MERC-C5-18', 'Ética Profesional', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(510, 3, 'MERC-C5-19', 'Legislación Comercial', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(511, 10, 'MERC-C5-19', 'Legislación Comercial', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(513, 3, 'MERC-C5-20', 'Contabilidad para Negocios', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(514, 10, 'MERC-C5-20', 'Contabilidad para Negocios', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(516, 3, 'MERC-C5-21', 'Estrategias de Productos y Precio', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(517, 10, 'MERC-C5-21', 'Estrategias de Productos y Precio', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(519, 3, 'MERC-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(520, 10, 'MERC-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(522, 3, 'MERC-C6-23', 'Inglés IV', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(523, 10, 'MERC-C6-23', 'Inglés IV', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(525, 3, 'MERC-C6-24', 'Mezcla Promocional', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(526, 10, 'MERC-C6-24', 'Mezcla Promocional', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(528, 3, 'MERC-C6-25', 'Sistema de Investigación de Mercados II', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(529, 10, 'MERC-C6-25', 'Sistema de Investigación de Mercados II', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(531, 3, 'MERC-C6-26', 'Gestión de Ventas', 6, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(532, 10, 'MERC-C6-26', 'Gestión de Ventas', 6, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(534, 3, 'MERC-C7-27', 'Logística y Distribución', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(535, 10, 'MERC-C7-27', 'Logística y Distribución', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(537, 3, 'MERC-C7-28', 'Mercadotecnia Estratégica', 7, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(538, 10, 'MERC-C7-28', 'Mercadotecnia Estratégica', 7, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(540, 3, 'MERC-C7-29', 'Diseño Digital y Multimedia', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(541, 10, 'MERC-C7-29', 'Diseño Digital y Multimedia', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(543, 3, 'MERC-C7-30', 'Administración del Tiempo', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(544, 10, 'MERC-C7-30', 'Administración del Tiempo', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(546, 3, 'MERC-C8-31', 'Inglés V', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(547, 10, 'MERC-C8-31', 'Inglés V', 8, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(549, 3, 'MERC-C8-32', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(550, 10, 'MERC-C8-32', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(552, 3, 'MERC-C8-33', 'Mercadotecnia de Servicios', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(553, 10, 'MERC-C8-33', 'Mercadotecnia de Servicios', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(555, 3, 'MERC-C8-34', 'Mercadotecnia Digital I', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(556, 10, 'MERC-C8-34', 'Mercadotecnia Digital I', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(558, 3, 'MERC-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(559, 10, 'MERC-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(561, 5, 'EII-C1-01', 'Fundamentos Pedagógicos de la Educación', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(562, 11, 'EII-C1-01', 'Fundamentos Pedagógicos de la Educación', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(564, 5, 'EII-C1-02', 'Psicología Educativa y Etapas del Desarrollo', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(565, 11, 'EII-C1-02', 'Psicología Educativa y Etapas del Desarrollo', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(567, 5, 'EII-C1-03', 'Fundamentos Matemáticos', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(568, 11, 'EII-C1-03', 'Fundamentos Matemáticos', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(570, 5, 'EII-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(571, 11, 'EII-C1-04', 'Comunicación y Habilidades Digitales', 1, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(573, 5, 'EII-C2-05', 'Inglés I', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(574, 11, 'EII-C2-05', 'Inglés I', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:16'),
(576, 5, 'EII-C2-06', 'Desarrollo Humano y Valores', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(577, 11, 'EII-C2-06', 'Desarrollo Humano y Valores', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(579, 5, 'EII-C2-07', 'Probabilidad y Estadística Aplicadas a la Educación', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(580, 11, 'EII-C2-07', 'Probabilidad y Estadística Aplicadas a la Educación', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(582, 5, 'EII-C2-08', 'La Educación en México', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(583, 11, 'EII-C2-08', 'La Educación en México', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(585, 5, 'EII-C2-09', 'Metodología de la Investigación', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(586, 11, 'EII-C2-09', 'Metodología de la Investigación', 2, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(588, 5, 'EII-C3-10', 'Inglés II', 3, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(589, 11, 'EII-C3-10', 'Inglés II', 3, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(591, 5, 'EII-C3-11', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(592, 11, 'EII-C3-11', 'Habilidades Socioemocionales y Manejo de Conflictos', 3, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(594, 5, 'EII-C3-12', 'Diseño de Material Didáctico I', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(595, 11, 'EII-C3-12', 'Diseño de Material Didáctico I', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(597, 5, 'EII-C3-13', 'Evaluación del proceso de enseñanza-aprendizaje', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(598, 11, 'EII-C3-13', 'Evaluación del proceso de enseñanza-aprendizaje', 3, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(600, 5, 'EII-C4-14', 'Inglés III', 4, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(601, 11, 'EII-C4-14', 'Inglés III', 4, 7, 'Nocturno', 1, '2025-11-13 02:53:16'),
(603, 5, 'EII-C4-15', 'Metodología de la Didáctica I', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(604, 11, 'EII-C4-15', 'Metodología de la Didáctica I', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(606, 5, 'EII-C4-16', 'Diseño de Material Didáctico II', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(607, 11, 'EII-C4-16', 'Diseño de Material Didáctico II', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(609, 5, 'EII-C4-17', 'Planeación Educativa', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(610, 11, 'EII-C4-17', 'Planeación Educativa', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(612, 5, 'EII-C5-18', 'Desarrollo del Pensamiento y toma de Decisiones', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(613, 11, 'EII-C5-18', 'Desarrollo del Pensamiento y toma de Decisiones', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(615, 5, 'EII-C5-19', 'Metodología de la didáctica II', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(616, 11, 'EII-C5-19', 'Metodología de la didáctica II', 5, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(618, 5, 'EII-C5-20', 'Instrumentos de Evaluación', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(619, 11, 'EII-C5-20', 'Instrumentos de Evaluación', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(621, 5, 'EII-C5-21', 'Enseñanza de estructura Gramatical Inglesa', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(622, 11, 'EII-C5-21', 'Enseñanza de estructura Gramatical Inglesa', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(624, 5, 'EII-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(625, 11, 'EII-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(627, 5, 'EII-C6-23', 'Inglés IV', 6, 8, 'Nocturno', 1, '2025-11-13 02:53:16'),
(628, 11, 'EII-C6-23', 'Inglés IV', 6, 8, 'Nocturno', 1, '2025-11-13 02:53:16'),
(630, 5, 'EII-C6-24', 'Ética Profesional', 6, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(631, 11, 'EII-C6-24', 'Ética Profesional', 6, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(633, 5, 'EII-C6-25', 'Fonética', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(634, 11, 'EII-C6-25', 'Fonética', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(636, 5, 'EII-C6-26', 'Metodología de la Enseñanza de Contenidos', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(637, 11, 'EII-C6-26', 'Metodología de la Enseñanza de Contenidos', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(639, 5, 'EII-C7-27', 'Inglés V', 7, 8, 'Nocturno', 1, '2025-11-13 02:53:16'),
(640, 11, 'EII-C7-27', 'Inglés V', 7, 8, 'Nocturno', 1, '2025-11-13 02:53:16'),
(642, 5, 'EII-C7-28', 'Enseñanza de Habilidades Productivas', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(643, 11, 'EII-C7-28', 'Enseñanza de Habilidades Productivas', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(645, 5, 'EII-C7-29', 'Diseño de Situaciones de Aprendizaje I', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(646, 11, 'EII-C7-29', 'Diseño de Situaciones de Aprendizaje I', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(648, 5, 'EII-C7-30', 'Estrategias de Enseñanza de la Lengua Inglesa I', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(649, 11, 'EII-C7-30', 'Estrategias de Enseñanza de la Lengua Inglesa I', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(651, 5, 'EII-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(652, 11, 'EII-C8-31', 'Liderazgo de Equipos de Alto Desempeño', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(654, 5, 'EII-C8-32', 'Diseño de Situaciones de Aprendizaje II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(655, 11, 'EII-C8-32', 'Diseño de Situaciones de Aprendizaje II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(657, 5, 'EII-C8-33', 'Estrategias de Enseñanza de la Lengua Inglesa II', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(658, 11, 'EII-C8-33', 'Estrategias de Enseñanza de la Lengua Inglesa II', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(660, 5, 'EII-C8-34', 'Enseñanza de Habilidades Receptivas', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(661, 11, 'EII-C8-34', 'Enseñanza de Habilidades Receptivas', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:16'),
(663, 5, 'EII-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(664, 11, 'EII-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:16'),
(666, 4, 'MI-C1-01', 'Desarrollo Humano y Valores', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(667, 12, 'MI-C1-01', 'Desarrollo Humano y Valores', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:16'),
(669, 4, 'MI-C1-02', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(670, 12, 'MI-C1-02', 'Fundamentos Matemáticos', 1, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(672, 4, 'MI-C1-03', 'Fundamentos de Mantenimiento', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(673, 12, 'MI-C1-03', 'Fundamentos de Mantenimiento', 1, 4, 'Nocturno', 1, '2025-11-13 02:53:17');
INSERT INTO `programa_materias` (`id`, `id_programa`, `cve_materia`, `nombre_materia`, `grado`, `horas_semanales`, `turno`, `activo`, `fecha_alta`) VALUES
(675, 4, 'MI-C1-04', 'Seguridad Industrial', 1, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(676, 12, 'MI-C1-04', 'Seguridad Industrial', 1, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(678, 4, 'MI-C1-05', 'Comunicación y Habilidades Digitales', 1, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(679, 12, 'MI-C1-05', 'Comunicación y Habilidades Digitales', 1, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(681, 4, 'MI-C2-06', 'Habilidades Socioemocionales y Manejo de Conflictos', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(682, 12, 'MI-C2-06', 'Habilidades Socioemocionales y Manejo de Conflictos', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(684, 4, 'MI-C2-07', 'Cálculo Diferencial', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(685, 12, 'MI-C2-07', 'Cálculo Diferencial', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(687, 4, 'MI-C2-08', 'Probabilidad y Estadística', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(688, 12, 'MI-C2-08', 'Probabilidad y Estadística', 2, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(690, 4, 'MI-C2-09', 'Dibujo Industrial', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(691, 12, 'MI-C2-09', 'Dibujo Industrial', 2, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(693, 4, 'MI-C3-10', 'Inglés I', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(694, 12, 'MI-C3-10', 'Inglés I', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(696, 4, 'MI-C3-11', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(697, 12, 'MI-C3-11', 'Desarrollo del Pensamiento y Toma de Decisiones', 3, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(699, 4, 'MI-C3-12', 'Física', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(700, 12, 'MI-C3-12', 'Física', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(702, 4, 'MI-C3-13', 'Gestión de Mantenimiento', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(703, 12, 'MI-C3-13', 'Gestión de Mantenimiento', 3, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(705, 4, 'MI-C4-14', 'Inglés II', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(706, 12, 'MI-C4-14', 'Inglés II', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(708, 4, 'MI-C4-15', 'Ética Profesional', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(709, 12, 'MI-C4-15', 'Ética Profesional', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(711, 4, 'MI-C4-16', 'Cálculo Integral', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(712, 12, 'MI-C4-16', 'Cálculo Integral', 4, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(714, 4, 'MI-C4-17', 'Electrónica Analógica', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(715, 12, 'MI-C4-17', 'Electrónica Analógica', 4, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(717, 4, 'MI-C4-18', 'Termodinámica', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(718, 12, 'MI-C4-18', 'Termodinámica', 4, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(720, 4, 'MI-C5-19', 'Inglés III', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(721, 12, 'MI-C5-19', 'Inglés III', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(723, 4, 'MI-C5-20', 'Sistemas Eléctricos', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(724, 12, 'MI-C5-20', 'Sistemas Eléctricos', 5, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(726, 4, 'MI-C5-21', 'Máquinas y Mecanismos', 5, 7, 'Nocturno', 1, '2025-11-13 02:53:17'),
(727, 12, 'MI-C5-21', 'Máquinas y Mecanismos', 5, 7, 'Nocturno', 1, '2025-11-13 02:53:17'),
(729, 4, 'MI-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(730, 12, 'MI-C5-22', 'Proyecto Integrador I', 5, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(732, 4, 'MI-C6-23', 'Inglés IV', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(733, 12, 'MI-C6-23', 'Inglés IV', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(735, 4, 'MI-C6-24', 'Liderazgo de Equipos de Alto Desempeño', 6, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(736, 12, 'MI-C6-24', 'Liderazgo de Equipos de Alto Desempeño', 6, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(738, 4, 'MI-C6-25', 'Cálculo de Varias Variables', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(739, 12, 'MI-C6-25', 'Cálculo de Varias Variables', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(741, 4, 'MI-C6-26', 'Máquinas Eléctricas', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(742, 12, 'MI-C6-26', 'Máquinas Eléctricas', 6, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(744, 4, 'MI-C6-27', 'Electrónica Digital', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(745, 12, 'MI-C6-27', 'Electrónica Digital', 6, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(747, 4, 'MI-C7-28', 'Inglés V', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(748, 12, 'MI-C7-28', 'Inglés V', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(750, 4, 'MI-C7-29', 'Ecuaciones Diferenciales', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(751, 12, 'MI-C7-29', 'Ecuaciones Diferenciales', 7, 4, 'Nocturno', 1, '2025-11-13 02:53:17'),
(753, 4, 'MI-C7-30', 'Sistemas Neumáticos e Hidráulicos', 7, 7, 'Nocturno', 1, '2025-11-13 02:53:17'),
(754, 12, 'MI-C7-30', 'Sistemas Neumáticos e Hidráulicos', 7, 7, 'Nocturno', 1, '2025-11-13 02:53:17'),
(756, 4, 'MI-C7-31', 'Sistemas Térmicos e Industriales', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(757, 12, 'MI-C7-31', 'Sistemas Térmicos e Industriales', 7, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(759, 4, 'MI-C8-32', 'Automatización y Robótica', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(760, 12, 'MI-C8-32', 'Automatización y Robótica', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(762, 4, 'MI-C8-33', 'Ciencia de los Materiales', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(763, 12, 'MI-C8-33', 'Ciencia de los Materiales', 8, 6, 'Nocturno', 1, '2025-11-13 02:53:17'),
(765, 4, 'MI-C8-34', 'Mantenimiento a Procesos de Manufactura', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(766, 12, 'MI-C8-34', 'Mantenimiento a Procesos de Manufactura', 8, 5, 'Nocturno', 1, '2025-11-13 02:53:17'),
(768, 4, 'MI-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(769, 12, 'MI-C8-35', 'Proyecto Integrador II', 8, 3, 'Nocturno', 1, '2025-11-13 02:53:17'),
(771, 13, 'LICE-C7-01', 'Historia De La Educación', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(772, 17, 'LICE-C7-01', 'Historia De La Educación', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(774, 13, 'LICE-C7-02', 'Política Educativa', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(775, 17, 'LICE-C7-02', 'Política Educativa', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(777, 13, 'LICE-C7-03', 'Gestión Educativa I', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(778, 17, 'LICE-C7-03', 'Gestión Educativa I', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(780, 13, 'LICE-C7-04', 'Psicolingüística', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(781, 17, 'LICE-C7-04', 'Psicolingüística', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(783, 13, 'LICE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(784, 17, 'LICE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(786, 13, 'LICE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(787, 17, 'LICE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(789, 13, 'LICE-C8-07', 'Teorías Del Aprendizaje', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(790, 17, 'LICE-C8-07', 'Teorías Del Aprendizaje', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(792, 13, 'LICE-C8-08', 'Fundamentos De Contabilidad', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(793, 17, 'LICE-C8-08', 'Fundamentos De Contabilidad', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(795, 13, 'LICE-C8-09', 'Gestión Educativa II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(796, 17, 'LICE-C8-09', 'Gestión Educativa II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(798, 13, 'LICE-C8-10', 'Calidad En Instituciones Educativas', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(799, 17, 'LICE-C8-10', 'Calidad En Instituciones Educativas', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(801, 13, 'LICE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(802, 17, 'LICE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(804, 13, 'LICE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(805, 17, 'LICE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(807, 13, 'LICE-C9-13', 'Investigación Evaluativa', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(808, 17, 'LICE-C9-13', 'Investigación Evaluativa', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(810, 13, 'LICE-C9-14', 'Administración Educativa', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(811, 17, 'LICE-C9-14', 'Administración Educativa', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(813, 13, 'LICE-C9-15', 'Teoría Curricular', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(814, 17, 'LICE-C9-15', 'Teoría Curricular', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(816, 13, 'LICE-C9-16', 'Psicopedagogía', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(817, 17, 'LICE-C9-16', 'Psicopedagogía', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(819, 13, 'LICE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(820, 17, 'LICE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(822, 13, 'LICE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(823, 17, 'LICE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(825, 13, 'LICE-C10-19', 'Evaluación Educativa', 10, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(826, 17, 'LICE-C10-19', 'Evaluación Educativa', 10, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(828, 13, 'LICE-C10-20', 'Administración Escolar', 10, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(829, 17, 'LICE-C10-20', 'Administración Escolar', 10, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(831, 13, 'LICE-C10-21', 'Diseño Curricular', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(832, 17, 'LICE-C10-21', 'Diseño Curricular', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(834, 13, 'LICE-C10-22', 'Comunicación Y Tecnología Educativa', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(835, 17, 'LICE-C10-22', 'Comunicación Y Tecnología Educativa', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(837, 13, 'LICE-C10-23', 'Integradora', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(838, 17, 'LICE-C10-23', 'Integradora', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(840, 13, 'LICE-C10-24', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(841, 17, 'LICE-C10-24', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(843, 13, 'LICE-C10-25', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(844, 17, 'LICE-C10-25', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(846, 14, 'INGE-C7-01', 'Matemáticas Para Ingeniería I', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(847, 15, 'INGE-C7-01', 'Matemáticas Para Ingeniería I', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(848, 16, 'INGE-C7-01', 'Matemáticas Para Ingeniería I', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(849, 18, 'INGE-C7-01', 'Matemáticas Para Ingeniería I', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(853, 14, 'INGE-C7-02', 'Física Para Ingeniería', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(854, 15, 'INGE-C7-02', 'Física Para Ingeniería', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(855, 16, 'INGE-C7-02', 'Física Para Ingeniería', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(856, 18, 'INGE-C7-02', 'Física Para Ingeniería', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(860, 14, 'INGE-C7-03', 'Instrumentación Virtual', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(861, 15, 'INGE-C7-03', 'Instrumentación Virtual', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(862, 16, 'INGE-C7-03', 'Instrumentación Virtual', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(863, 18, 'INGE-C7-03', 'Instrumentación Virtual', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(867, 14, 'INGE-C7-04', 'Electricidad Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(868, 15, 'INGE-C7-04', 'Electricidad Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(869, 16, 'INGE-C7-04', 'Electricidad Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(870, 18, 'INGE-C7-04', 'Electricidad Industrial', 7, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(874, 14, 'INGE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(875, 15, 'INGE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(876, 16, 'INGE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(877, 18, 'INGE-C7-05', 'Inglés VI', 7, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(881, 14, 'INGE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(882, 15, 'INGE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(883, 16, 'INGE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(884, 18, 'INGE-C7-06', 'Administración Del Tiempo', 7, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(888, 14, 'INGE-C8-07', 'Matemáticas Para Ingeniería II', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(889, 15, 'INGE-C8-07', 'Matemáticas Para Ingeniería II', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(890, 16, 'INGE-C8-07', 'Matemáticas Para Ingeniería II', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(891, 18, 'INGE-C8-07', 'Matemáticas Para Ingeniería II', 8, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(895, 14, 'INGE-C8-08', 'Mecánica Para La Automatización', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(896, 15, 'INGE-C8-08', 'Mecánica Para La Automatización', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(897, 16, 'INGE-C8-08', 'Mecánica Para La Automatización', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(898, 18, 'INGE-C8-08', 'Mecánica Para La Automatización', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(902, 14, 'INGE-C8-09', 'Control De Motores II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(903, 15, 'INGE-C8-09', 'Control De Motores II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(904, 16, 'INGE-C8-09', 'Control De Motores II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(905, 18, 'INGE-C8-09', 'Control De Motores II', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(909, 14, 'INGE-C8-10', 'Diseño Asistido Por Computadora', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(910, 15, 'INGE-C8-10', 'Diseño Asistido Por Computadora', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(911, 16, 'INGE-C8-10', 'Diseño Asistido Por Computadora', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(912, 18, 'INGE-C8-10', 'Diseño Asistido Por Computadora', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(916, 14, 'INGE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(917, 15, 'INGE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(918, 16, 'INGE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(919, 18, 'INGE-C8-11', 'Inglés VII', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(923, 14, 'INGE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(924, 15, 'INGE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(925, 16, 'INGE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(926, 18, 'INGE-C8-12', 'Planeación Y Organización Del Trabajo', 8, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(930, 14, 'INGE-C9-13', 'Control Automático', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(931, 15, 'INGE-C9-13', 'Control Automático', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(932, 16, 'INGE-C9-13', 'Control Automático', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(933, 18, 'INGE-C9-13', 'Control Automático', 9, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(937, 14, 'INGE-C9-14', 'Ingeniería De Proyectos', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(938, 15, 'INGE-C9-14', 'Ingeniería De Proyectos', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(939, 16, 'INGE-C9-14', 'Ingeniería De Proyectos', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(940, 18, 'INGE-C9-14', 'Ingeniería De Proyectos', 9, 3, 'Nocturno', 1, '2025-11-13 02:55:26'),
(944, 14, 'INGE-C9-15', 'Sistemas Mecánicos II', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(945, 15, 'INGE-C9-15', 'Sistemas Mecánicos II', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(946, 16, 'INGE-C9-15', 'Sistemas Mecánicos II', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(947, 18, 'INGE-C9-15', 'Sistemas Mecánicos II', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(951, 14, 'INGE-C9-16', 'Optativa - Fundamentos De Robótica Industrial', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(952, 15, 'INGE-C9-16', 'Optativa - Fundamentos De Robótica Industrial', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(953, 16, 'INGE-C9-16', 'Optativa - Fundamentos De Robótica Industrial', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(954, 18, 'INGE-C9-16', 'Optativa - Fundamentos De Robótica Industrial', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(958, 14, 'INGE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(959, 15, 'INGE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(960, 16, 'INGE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(961, 18, 'INGE-C9-17', 'Inglés VIII', 9, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(965, 14, 'INGE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(966, 15, 'INGE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(967, 16, 'INGE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(968, 18, 'INGE-C9-18', 'Dirección De Equipos De Alto Rendimiento', 9, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(972, 14, 'INGE-C10-19', 'Sistemas De Manufactura Flexible', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(973, 15, 'INGE-C10-19', 'Sistemas De Manufactura Flexible', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(974, 16, 'INGE-C10-19', 'Sistemas De Manufactura Flexible', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(975, 18, 'INGE-C10-19', 'Sistemas De Manufactura Flexible', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(979, 14, 'INGE-C10-20', 'Control Lógico Avanzado', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(980, 15, 'INGE-C10-20', 'Control Lógico Avanzado', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(981, 16, 'INGE-C10-20', 'Control Lógico Avanzado', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(982, 18, 'INGE-C10-20', 'Control Lógico Avanzado', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(986, 14, 'INGE-C10-21', 'Dispositivos Digitales Programables', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(987, 15, 'INGE-C10-21', 'Dispositivos Digitales Programables', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(988, 16, 'INGE-C10-21', 'Dispositivos Digitales Programables', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(989, 18, 'INGE-C10-21', 'Dispositivos Digitales Programables', 10, 5, 'Nocturno', 1, '2025-11-13 02:55:26'),
(993, 14, 'INGE-C10-22', 'Integradora III', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(994, 15, 'INGE-C10-22', 'Integradora III', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(995, 16, 'INGE-C10-22', 'Integradora III', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(996, 18, 'INGE-C10-22', 'Integradora III', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1000, 14, 'INGE-C10-23', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1001, 15, 'INGE-C10-23', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1002, 16, 'INGE-C10-23', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1003, 18, 'INGE-C10-23', 'Inglés IX', 10, 4, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1007, 14, 'INGE-C10-24', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1008, 15, 'INGE-C10-24', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1009, 16, 'INGE-C10-24', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26'),
(1010, 18, 'INGE-C10-24', 'Negociación Empresarial', 10, 2, 'Nocturno', 1, '2025-11-13 02:55:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `area` varchar(100) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `area`, `nombre`, `nombre_usuario`, `contraseña`) VALUES
(1, 'Admin', 'Subdirector Académico', 'SUBDIRECTOR_ACADÉMICO', 'SUBDIRECTOR'),
(2, 'Admin', 'PTC Carga Académica', 'PTC_CARGA_ACADÉMICA', 'CARGAACADEMICA'),
(3, 'Coordinación', 'Coordinador Matutino', 'COORDINADOR_MATUTINO', 'COORDUTC123'),
(4, 'Coordinación', 'Coordinador Nocturno', 'COORDINADOR_NOCTURNO', 'UTCCOORD234'),
(5, 'PTC Proyecto Integrador', 'PTC Proyecto Integrador Matutino', 'PTC_PI_MATUTINO', 'guest123'),
(6, 'PTC Proyecto Integrador', 'PTC Proyecto Integrador Nocturno', 'PTC_PI_NOCTURNO', 'guest234'),
(7, 'Tutoría', 'Tutoría General', 'TUTORÍA', 'TTR234'),
(8, 'Prefectura', 'Prefectura General', 'PREFECTURA', 'PREF123'),
(9, 'Docente', 'Docente Proyecto Integrador', 'PROYECTO_INTEGRADOR', 'guest123');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_carga_academica`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_carga_academica` (
`id` int(11)
,`periodo_id` int(11)
,`periodo_texto` varchar(269)
,`docente_id` int(11)
,`nombre_docente` varchar(255)
,`turno_docente` varchar(50)
,`regimen_docente` varchar(10)
,`grupo_id` int(11)
,`codigo_grupo` varchar(20)
,`materia_id` int(11)
,`cve_materia` varchar(20)
,`nombre_materia` varchar(255)
,`horas_materia_plan` int(11)
,`turno` enum('Matutino','Vespertino','Mixto')
,`horas` int(11)
,`horas_clase` int(11)
,`horas_tutoria` int(11)
,`horas_estadia` int(11)
,`actividades_administrativas` varchar(255)
,`total_horas_asignadas` int(11)
,`estado` enum('activo','eliminado')
,`fecha_creacion` timestamp
,`fecha_modificacion` timestamp
,`usuario_creacion_nombre` varchar(150)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_estadisticas_carga_docente`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_estadisticas_carga_docente` (
`periodo_id` int(11)
,`periodo_texto` varchar(269)
,`docente_id` int(11)
,`nombre_docente` varchar(255)
,`turno_docente` varchar(50)
,`regimen` varchar(10)
,`total_asignaturas` bigint(21)
,`total_horas_materias` decimal(32,0)
,`total_horas_clase` decimal(32,0)
,`total_horas_tutoria` decimal(32,0)
,`total_horas_estadia` decimal(32,0)
,`total_horas_general` decimal(32,0)
,`actividades_admin` mediumtext
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_carga_academica`
--
DROP TABLE IF EXISTS `vista_carga_academica`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_carga_academica`  AS SELECT `ca`.`id` AS `id`, `ca`.`periodo_id` AS `periodo_id`, concat(`p`.`periodo`,' (',`p`.`año`,')') AS `periodo_texto`, `ca`.`docente_id` AS `docente_id`, `d`.`nombre_docente` AS `nombre_docente`, `d`.`turno` AS `turno_docente`, `d`.`regimen` AS `regimen_docente`, `ca`.`grupo_id` AS `grupo_id`, `g`.`codigo_grupo` AS `codigo_grupo`, `ca`.`materia_id` AS `materia_id`, `pm`.`cve_materia` AS `cve_materia`, `pm`.`nombre_materia` AS `nombre_materia`, `pm`.`horas_semanales` AS `horas_materia_plan`, `ca`.`turno` AS `turno`, `ca`.`horas` AS `horas`, `ca`.`horas_clase` AS `horas_clase`, `ca`.`horas_tutoria` AS `horas_tutoria`, `ca`.`horas_estadia` AS `horas_estadia`, `ca`.`actividades_administrativas` AS `actividades_administrativas`, `ca`.`total_horas_asignadas` AS `total_horas_asignadas`, `ca`.`estado` AS `estado`, `ca`.`fecha_creacion` AS `fecha_creacion`, `ca`.`fecha_modificacion` AS `fecha_modificacion`, `u`.`nombre` AS `usuario_creacion_nombre` FROM (((((`carga_academica` `ca` join `periodos` `p` on(`ca`.`periodo_id` = `p`.`id`)) join `docentes` `d` on(`ca`.`docente_id` = `d`.`id`)) join `grupos` `g` on(`ca`.`grupo_id` = `g`.`id`)) join `programa_materias` `pm` on(`ca`.`materia_id` = `pm`.`id`)) left join `usuarios` `u` on(`ca`.`usuario_creacion` = `u`.`id`)) WHERE `ca`.`estado` = 'activo' ORDER BY `d`.`nombre_docente` ASC, `ca`.`fecha_creacion` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_estadisticas_carga_docente`
--
DROP TABLE IF EXISTS `vista_estadisticas_carga_docente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_estadisticas_carga_docente`  AS SELECT `ca`.`periodo_id` AS `periodo_id`, concat(`p`.`periodo`,' (',`p`.`año`,')') AS `periodo_texto`, `ca`.`docente_id` AS `docente_id`, `d`.`nombre_docente` AS `nombre_docente`, `d`.`turno` AS `turno_docente`, `d`.`regimen` AS `regimen`, count(`ca`.`id`) AS `total_asignaturas`, sum(`ca`.`horas`) AS `total_horas_materias`, sum(`ca`.`horas_clase`) AS `total_horas_clase`, sum(`ca`.`horas_tutoria`) AS `total_horas_tutoria`, sum(`ca`.`horas_estadia`) AS `total_horas_estadia`, sum(`ca`.`total_horas_asignadas`) AS `total_horas_general`, group_concat(distinct `ca`.`actividades_administrativas` separator ', ') AS `actividades_admin` FROM ((`carga_academica` `ca` join `periodos` `p` on(`ca`.`periodo_id` = `p`.`id`)) join `docentes` `d` on(`ca`.`docente_id` = `d`.`id`)) WHERE `ca`.`estado` = 'activo' AND `d`.`estado` = 'activo' GROUP BY `ca`.`periodo_id`, `ca`.`docente_id`, `p`.`periodo`, `p`.`año`, `d`.`nombre_docente`, `d`.`turno`, `d`.`regimen` ORDER BY `d`.`nombre_docente` ASC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carga_academica`
--
ALTER TABLE `carga_academica`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_periodo` (`periodo_id`),
  ADD KEY `idx_docente` (`docente_id`),
  ADD KEY `idx_grupo` (`grupo_id`),
  ADD KEY `idx_materia` (`materia_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_periodo_estado` (`periodo_id`,`estado`),
  ADD KEY `fk_carga_usuario` (`usuario_creacion`),
  ADD KEY `idx_carga_busqueda` (`periodo_id`,`docente_id`,`estado`),
  ADD KEY `idx_carga_grupo_periodo` (`grupo_id`,`periodo_id`,`estado`);

--
-- Indices de la tabla `carga_plantillas`
--
ALTER TABLE `carga_plantillas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_periodo` (`periodo_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_usuario_periodo` (`usuario_id`,`periodo_id`,`estado`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre_docente`),
  ADD KEY `idx_turno` (`turno`),
  ADD KEY `idx_regimen` (`regimen`),
  ADD KEY `idx_docentes_periodo` (`periodo_id`),
  ADD KEY `idx_docentes_estado` (`estado`);

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_grupo` (`codigo_grupo`),
  ADD KEY `idx_generacion` (`generacion`),
  ADD KEY `idx_nivel` (`nivel_educativo`),
  ADD KEY `idx_programa` (`programa_educativo`),
  ADD KEY `idx_codigo` (`codigo_grupo`),
  ADD KEY `idx_grupos_periodo` (`periodo_id`),
  ADD KEY `idx_grupos_codigo` (`codigo_grupo`),
  ADD KEY `idx_grupos_estado` (`estado`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_periodo` (`periodo_id`),
  ADD KEY `idx_periodo_estado` (`periodo_id`,`estado`),
  ADD KEY `idx_fecha_carga` (`fecha_carga`),
  ADD KEY `idx_horarios_periodo` (`periodo_id`);

--
-- Indices de la tabla `periodos`
--
ALTER TABLE `periodos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `programas`
--
ALTER TABLE `programas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `programa_materias`
--
ALTER TABLE `programa_materias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `programa_materia_grado_turno` (`id_programa`,`cve_materia`,`grado`,`turno`),
  ADD KEY `id_programa` (`id_programa`),
  ADD KEY `idx_programa_materias_programa` (`id_programa`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carga_academica`
--
ALTER TABLE `carga_academica`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `carga_plantillas`
--
ALTER TABLE `carga_plantillas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `periodos`
--
ALTER TABLE `periodos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `programa_materias`
--
ALTER TABLE `programa_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1016;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carga_academica`
--
ALTER TABLE `carga_academica`
  ADD CONSTRAINT `fk_carga_docente` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carga_grupo` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carga_materia` FOREIGN KEY (`materia_id`) REFERENCES `programa_materias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carga_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carga_usuario` FOREIGN KEY (`usuario_creacion`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `carga_plantillas`
--
ALTER TABLE `carga_plantillas`
  ADD CONSTRAINT `fk_plantilla_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plantilla_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `fk_docentes_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `fk_grupos_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `fk_horarios_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `programa_materias`
--
ALTER TABLE `programa_materias`
  ADD CONSTRAINT `fk_programa_materias_programa` FOREIGN KEY (`id_programa`) REFERENCES `programas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
