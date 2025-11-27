<?php
/**
 * Obtener plantillas del usuario actual
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
    $periodo_id = isset($_GET['periodo_id'])
                    ? intval($_GET['periodo_id'])
                    : (isset($_SESSION['periodo_activo']) ? intval($_SESSION['periodo_activo']) : 0);

    if ($usuario_id <= 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no identificado',
            'data' => []
        ]);
        exit;
    }

    // Construir query base
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
            WHERE cp.usuario_id = ?
              AND cp.estado = 'activo'";

    $params_types = 'i';
    $params_values = [$usuario_id];

    // Filtrar por periodo si se especifica
    if ($periodo_id > 0) {
        $sql .= " AND cp.periodo_id = ?";
        $params_types .= 'i';
        $params_values[] = $periodo_id;
    }

    $sql .= " ORDER BY cp.fecha_modificacion DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($params_types, ...$params_values);
    $stmt->execute();
    $result = $stmt->get_result();

    $plantillas = [];
    while ($row = $result->fetch_assoc()) {
        // Decodificar JSON para obtener información adicional
        $datos = json_decode($row['datos_json'], true);
        $num_registros = isset($datos['cargas']) ? count($datos['cargas']) : 0;

        $plantillas[] = [
            'id' => intval($row['id']),
            'nombre' => $row['nombre_plantilla'],
            'descripcion' => $row['descripcion'],
            'periodo_id' => intval($row['periodo_id']),
            'periodo' => $row['periodo'],
            'año' => intval($row['año']),
            'periodo_texto' => $row['periodo_texto'],
            'num_registros' => $num_registros,
            'fecha_creacion' => $row['fecha_creacion'],
            'fecha_modificacion' => $row['fecha_modificacion'],
            'datos_json' => $row['datos_json']
        ];
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'total' => count($plantillas),
        'data' => $plantillas
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener plantillas: ' . $e->getMessage(),
        'data' => []
    ]);
}

$conn->close();
?>
