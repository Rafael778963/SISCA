<?php


include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    $plantilla_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

    if ($plantilla_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de plantilla inválido'
        ]);
        exit;
    }

    if ($usuario_id <= 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no identificado'
        ]);
        exit;
    }

    
    $sql = "SELECT
              cp.id,
              cp.nombre_plantilla,
              cp.descripcion,
              cp.periodo_id,
              p.periodo,
              p.año,
              CONCAT(p.periodo, ' (', p.año, ')') as periodo_texto,
              cp.datos_json,
              cp.fecha_creacion,
              cp.fecha_modificacion
            FROM carga_plantillas cp
            INNER JOIN periodos p ON cp.periodo_id = p.id
            WHERE cp.id = ?
              AND cp.usuario_id = ?
              AND cp.estado = 'activo'";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $plantilla_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Plantilla no encontrada'
        ]);
        $stmt->close();
        exit;
    }

    $row = $result->fetch_assoc();
    $stmt->close();

    
    $datos = json_decode($row['datos_json'], true);

    echo json_encode([
        'success' => true,
        'plantilla' => [
            'id' => intval($row['id']),
            'nombre' => $row['nombre_plantilla'],
            'descripcion' => $row['descripcion'],
            'periodo_id' => intval($row['periodo_id']),
            'periodo' => $row['periodo'],
            'año' => intval($row['año']),
            'periodo_texto' => $row['periodo_texto'],
            'fecha_creacion' => $row['fecha_creacion'],
            'fecha_modificacion' => $row['fecha_modificacion']
        ],
        'datos' => $datos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar plantilla: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
