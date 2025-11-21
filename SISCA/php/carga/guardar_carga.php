<?php
/**
 * Guardar una nueva carga académica
 * Valida datos y crea registro en carga_academica
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    // Obtener datos del formulario
    $turno = trim($_POST['turno'] ?? '');
    $grupo_id = intval($_POST['grupo'] ?? 0);
    $materia_id = intval($_POST['asignatura'] ?? 0);
    $docente_id = intval($_POST['docente'] ?? 0);
    $horas = intval($_POST['horas'] ?? 0);
    $horas_clase = intval($_POST['hrsClase'] ?? 0);
    $horas_tutoria = intval($_POST['tutoria'] ?? 0);
    $horas_estadia = intval($_POST['estadia'] ?? 0);
    $actividades_admin = trim($_POST['administrativas'] ?? '');

    // Obtener periodo activo y usuario
    $periodo_id = isset($_SESSION['periodo_activo']) ? intval($_SESSION['periodo_activo']) : 0;
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

    // VALIDACIONES
    $errores = [];

    if (empty($turno) || !in_array($turno, ['Matutino', 'Vespertino', 'Mixto'])) {
        $errores[] = 'Turno inválido';
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
        $errores[] = 'Horas de tutoría no puede ser negativo';
    }

    if ($horas_estadia < 0) {
        $errores[] = 'Horas de estadía no puede ser negativo';
    }

    if ($periodo_id <= 0) {
        $errores[] = 'No hay periodo activo seleccionado';
    }

    // Si hay errores, retornar
    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Errores de validación',
            'errores' => $errores
        ]);
        exit;
    }

    // VERIFICAR QUE NO EXISTA YA LA MISMA ASIGNACIÓN
    $sql_check = "SELECT id FROM carga_academica
                  WHERE periodo_id = ?
                    AND docente_id = ?
                    AND grupo_id = ?
                    AND materia_id = ?
                    AND estado = 'activo'";

    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param('iiii', $periodo_id, $docente_id, $grupo_id, $materia_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Esta asignatura ya está asignada a este docente en este grupo'
        ]);
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();

    // INSERTAR REGISTRO
    $sql_insert = "INSERT INTO carga_academica (
                      periodo_id,
                      docente_id,
                      grupo_id,
                      materia_id,
                      turno,
                      horas,
                      horas_clase,
                      horas_tutoria,
                      horas_estadia,
                      actividades_administrativas,
                      usuario_creacion,
                      estado
                   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')";

    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param(
        'iiiisiiiisi',
        $periodo_id,
        $docente_id,
        $grupo_id,
        $materia_id,
        $turno,
        $horas,
        $horas_clase,
        $horas_tutoria,
        $horas_estadia,
        $actividades_admin,
        $usuario_id
    );

    if ($stmt_insert->execute()) {
        $nuevo_id = $conn->insert_id;

        // Obtener el registro completo recién creado
        $sql_get = "SELECT * FROM vista_carga_academica WHERE id = ?";
        $stmt_get = $conn->prepare($sql_get);
        $stmt_get->bind_param('i', $nuevo_id);
        $stmt_get->execute();
        $result_get = $stmt_get->get_result();
        $registro = $result_get->fetch_assoc();
        $stmt_get->close();

        echo json_encode([
            'success' => true,
            'message' => 'Carga académica guardada exitosamente',
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
