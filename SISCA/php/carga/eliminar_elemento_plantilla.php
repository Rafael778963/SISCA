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
    
    $input = json_decode(file_get_contents('php://input'), true);

    $plantilla_id = isset($input['plantilla_id']) ? intval($input['plantilla_id']) : 0;
    $elemento_index = isset($input['elemento_index']) ? intval($input['elemento_index']) : -1;
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

    
    if ($plantilla_id <= 0) {
        throw new Exception('ID de plantilla inválido');
    }

    if ($elemento_index < 0) {
        throw new Exception('Índice de elemento inválido');
    }

    if ($usuario_id <= 0) {
        throw new Exception('Usuario no identificado');
    }

    
    $sql = "SELECT datos_json FROM carga_plantillas
            WHERE id = ? AND usuario_id = ? AND estado = 'activo'";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $plantilla_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Plantilla no encontrada o sin permisos');
    }

    $row = $result->fetch_assoc();
    $stmt->close();

    
    $datos = json_decode($row['datos_json'], true);

    if (!isset($datos['cargas']) || !is_array($datos['cargas'])) {
        throw new Exception('Formato de plantilla inválido');
    }

    
    if (!isset($datos['cargas'][$elemento_index])) {
        throw new Exception('Elemento no encontrado en la plantilla');
    }

    
    $elemento_eliminado = $datos['cargas'][$elemento_index];

    
    array_splice($datos['cargas'], $elemento_index, 1);

    
    $datos['cargas'] = array_values($datos['cargas']);

    
    $datos['total_registros'] = count($datos['cargas']);
    $datos['fecha_guardado'] = date('Y-m-d\TH:i:s.v\Z');

    
    $datos_json = json_encode($datos);

    $sql_update = "UPDATE carga_plantillas
                   SET datos_json = ?,
                       fecha_modificacion = NOW()
                   WHERE id = ? AND usuario_id = ?";

    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param('sii', $datos_json, $plantilla_id, $usuario_id);

    if (!$stmt_update->execute()) {
        throw new Exception('Error al actualizar la plantilla');
    }

    $stmt_update->close();

    echo json_encode([
        'success' => true,
        'message' => 'Elemento eliminado correctamente',
        'datos' => $datos,
        'elemento_eliminado' => $elemento_eliminado
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
