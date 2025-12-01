<?php


include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    
    $nombre_plantilla = trim($_POST['nombre_plantilla'] ?? '');
    $descripcion = trim($_POST['descripcion'] ?? '');
    $datos_json = $_POST['datos_json'] ?? '';
    $periodo_id = isset($_POST['periodo_id']) ? intval($_POST['periodo_id']) : 0;

    
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

    
    if (empty($nombre_plantilla)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El nombre de la plantilla es requerido'
        ]);
        exit;
    }

    if (strlen($nombre_plantilla) > 100) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El nombre de la plantilla es muy largo (máximo 100 caracteres)'
        ]);
        exit;
    }

    if (empty($datos_json)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No hay datos para guardar'
        ]);
        exit;
    }

    
    $datos_array = json_decode($datos_json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Datos JSON inválidos: ' . json_last_error_msg()
        ]);
        exit;
    }

    if ($periodo_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No hay periodo activo seleccionado'
        ]);
        exit;
    }

    if ($usuario_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no identificado'
        ]);
        exit;
    }

    
    $sql_check = "SELECT id FROM plan_estudios_plantillas
                  WHERE usuario_id = ?
                    AND nombre_plantilla = ?
                    AND periodo_id = ?
                    AND estado = 'activo'";

    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param('isi', $usuario_id, $nombre_plantilla, $periodo_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        
        $row = $result_check->fetch_assoc();
        $plantilla_id = $row['id'];

        $sql_update = "UPDATE plan_estudios_plantillas
                       SET datos_json = ?,
                           descripcion = ?,
                           fecha_modificacion = CURRENT_TIMESTAMP
                       WHERE id = ?";

        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param('ssi', $datos_json, $descripcion, $plantilla_id);

        if ($stmt_update->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Plantilla actualizada exitosamente',
                'id' => $plantilla_id,
                'accion' => 'actualizada'
            ]);
        } else {
            throw new Exception('Error al actualizar: ' . $stmt_update->error);
        }

        $stmt_update->close();

    } else {
        
        $sql_insert = "INSERT INTO plan_estudios_plantillas (
                          nombre_plantilla,
                          descripcion,
                          periodo_id,
                          usuario_id,
                          datos_json,
                          estado
                       ) VALUES (?, ?, ?, ?, ?, 'activo')";

        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bind_param('ssiis', $nombre_plantilla, $descripcion, $periodo_id, $usuario_id, $datos_json);

        if ($stmt_insert->execute()) {
            $nuevo_id = $conn->insert_id;

            echo json_encode([
                'success' => true,
                'message' => 'Plantilla guardada exitosamente',
                'id' => $nuevo_id,
                'accion' => 'creada'
            ]);
        } else {
            throw new Exception('Error al insertar: ' . $stmt_insert->error);
        }

        $stmt_insert->close();
    }

    $stmt_check->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar plantilla: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
