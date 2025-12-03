<?php

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metodo no permitido'
    ]);
    exit;
}

try {
    $turno = trim($_POST['turno'] ?? '');
    $grupo_id = intval($_POST['grupo'] ?? 0);
    $materia_id = intval($_POST['asignatura'] ?? 0);
    $docente_id = intval($_POST['docente'] ?? 0);
    $horas = intval($_POST['horas'] ?? 0);
    $horas_tutoria = intval($_POST['tutoria'] ?? 0);
    $horas_estadia = intval($_POST['estadia'] ?? 0);
    $actividades_admin = trim($_POST['administrativas'] ?? '');

    $periodo_id = isset($_SESSION['periodo_activo']) ? intval($_SESSION['periodo_activo']) : 0;

    $errores = [];

    if (empty($turno) || !in_array($turno, ['Matutino', 'Nocturno', 'Mixto'])) {
        $errores[] = 'Turno invalido';
    }

    if ($grupo_id <= 0) {
        $errores[] = 'Grupo requerido';
    }

    if ($materia_id <= 0) {
        $errores[] = 'Asignatura requerida';
    }

    if ($docente_id <= 0) {
        $errores[] = 'Docente requerido';
    }

    if ($horas < 0) {
        $errores[] = 'Horas no puede ser negativo';
    }

    if ($horas_tutoria < 0) {
        $errores[] = 'Horas de tutoria no puede ser negativo';
    }

    if ($horas_estadia < 0) {
        $errores[] = 'Horas de estadia no puede ser negativo';
    }

    if ($periodo_id <= 0) {
        $errores[] = 'No hay periodo activo seleccionado';
    }

    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Errores de validacion',
            'errores' => $errores
        ]);
        exit;
    }

    $sql_insert = "INSERT INTO carga_academica (
                      periodo_id,
                      docente_id,
                      grupo_id,
                      materia_id,
                      turno,
                      horas,
                      horas_tutoria,
                      horas_estadia,
                      actividades_administrativas,
                      estado
                   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')";

    $stmt_insert = $conn->prepare($sql_insert);

    if (!$stmt_insert) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    $stmt_insert->bind_param(
        'iiiisiiis',
        $periodo_id,
        $docente_id,
        $grupo_id,
        $materia_id,
        $turno,
        $horas,
        $horas_tutoria,
        $horas_estadia,
        $actividades_admin
    );

    if ($stmt_insert->execute()) {
        $nuevo_id = $conn->insert_id;

        $sql_get = "SELECT
                      ca.id,
                      ca.periodo_id,
                      CONCAT(p.periodo, ' (', p.año, ')') as periodo,
                      ca.docente_id,
                      d.nombre_docente as docente,
                      d.turno as turno_docente,
                      d.regimen as regimen,
                      ca.grupo_id,
                      g.codigo_grupo as grupo,
                      ca.materia_id,
                      pm.cve_materia as clave_materia,
                      pm.nombre_materia as materia,
                      pm.horas_semanales as horas_plan,
                      ca.turno,
                      ca.horas,
                      ca.horas_tutoria,
                      ca.horas_estadia,
                      ca.actividades_administrativas as administrativas,
                      (ca.horas + ca.horas_tutoria + ca.horas_estadia) as total,
                      ca.fecha_creacion
                    FROM carga_academica ca
                    INNER JOIN periodos p ON ca.periodo_id = p.id
                    INNER JOIN docentes d ON ca.docente_id = d.id
                    INNER JOIN grupos g ON ca.grupo_id = g.id
                    INNER JOIN programa_materias pm ON ca.materia_id = pm.id
                    WHERE ca.id = ? AND ca.estado = 'activo'";
        
        $stmt_get = $conn->prepare($sql_get);
        $stmt_get->bind_param('i', $nuevo_id);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        $registro = $result_get->fetch_assoc();
        $stmt_get->close();

        echo json_encode([
            'success' => true,
            'message' => 'Carga academica guardada exitosamente',
            'id' => $nuevo_id,
            'data' => $registro
        ]);
    } else {
        throw new Exception('Error al insertar: ' . $stmt_insert->error);
    }

    $stmt_insert->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar: ' . $e->getMessage()
    ]);
}

$conn->close();
?>