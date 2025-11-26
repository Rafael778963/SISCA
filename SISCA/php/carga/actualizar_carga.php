<?php
/**
 * Actualizar una carga academica existente
 * Valida datos y actualiza registro en carga_academica
 */

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
    $id = intval($_POST['id'] ?? 0);

    if ($id <= 0) {
        throw new Exception('ID de carga invalido');
    }

    $turno = trim($_POST['turno'] ?? '');
    $grupo_id = intval($_POST['grupo'] ?? 0);
    $materia_id = intval($_POST['asignatura'] ?? 0);
    $docente_id = intval($_POST['docente'] ?? 0);
    $horas = intval($_POST['horas'] ?? 0);
    $horas_clase = intval($_POST['hrsClase'] ?? 0);
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

    if ($horas_clase < 0) {
        $errores[] = 'Horas de clase no puede ser negativo';
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

    // Verificar que la carga existe
    $sql_verify = "SELECT id FROM carga_academica
                   WHERE id = ?
                     AND periodo_id = ?
                     AND estado = 'activo'";

    $stmt_verify = $conn->prepare($sql_verify);
    $stmt_verify->bind_param('ii', $id, $periodo_id);
    $stmt_verify->execute();
    $result_verify = $stmt_verify->get_result();

    if ($result_verify->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Carga no encontrada o no pertenece al periodo activo'
        ]);
        $stmt_verify->close();
        exit;
    }
    $stmt_verify->close();

    // Actualizar registro SIN usuario_modificacion ni fecha_modificacion
    $sql_update = "UPDATE carga_academica SET
                      docente_id = ?,
                      grupo_id = ?,
                      materia_id = ?,
                      turno = ?,
                      horas = ?,
                      horas_clase = ?,
                      horas_tutoria = ?,
                      horas_estadia = ?,
                      actividades_administrativas = ?
                   WHERE id = ?
                     AND periodo_id = ?";

    $stmt_update = $conn->prepare($sql_update);
    
    if (!$stmt_update) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }
    
    $stmt_update->bind_param(
        'iiisiiiisii',
        $docente_id,
        $grupo_id,
        $materia_id,
        $turno,
        $horas,
        $horas_clase,
        $horas_tutoria,
        $horas_estadia,
        $actividades_admin,
        $id,
        $periodo_id
    );

    if ($stmt_update->execute()) {
        $sql_get = "SELECT 
                      ca.id,
                      ca.periodo_id,
                      CONCAT(p.periodo, ' (', p.año, ')') as periodo_texto,
                      ca.docente_id,
                      d.nombre_docente,
                      d.turno as turno_docente,
                      d.regimen as regimen_docente,
                      ca.grupo_id,
                      g.codigo_grupo,
                      ca.materia_id,
                      pm.cve_materia as clave_materia,
                      pm.nombre_materia as materia,
                      pm.horas_semanales as horas_plan,
                      ca.turno,
                      ca.horas,
                      ca.horas_clase,
                      ca.horas_tutoria,
                      ca.horas_estadia,
                      ca.actividades_administrativas as administrativas,
                      (ca.horas + ca.horas_clase + ca.horas_tutoria + ca.horas_estadia) as total,
                      ca.fecha_creacion
                    FROM carga_academica ca
                    INNER JOIN periodos p ON ca.periodo_id = p.id
                    INNER JOIN docentes d ON ca.docente_id = d.id
                    INNER JOIN grupos g ON ca.grupo_id = g.id
                    INNER JOIN programa_materias pm ON ca.materia_id = pm.id
                    WHERE ca.id = ? AND ca.estado = 'activo'";
        
        $stmt_get = $conn->prepare($sql_get);
        $stmt_get->bind_param('i', $id);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        $registro = $result_get->fetch_assoc();
        $stmt_get->close();

        echo json_encode([
            'success' => true,
            'message' => 'Carga academica actualizada exitosamente',
            'id' => $id,
            'data' => $registro
        ]);
    } else {
        throw new Exception('Error al actualizar: ' . $stmt_update->error);
    }

    $stmt_update->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar: ' . $e->getMessage()
    ]);
}

$conn->close();
?>