<?php

include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

if (!isset($_GET['periodo_id']) || empty($_GET['periodo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Período no especificado']);
    exit;
}

$periodo_id = intval($_GET['periodo_id']);


$sql = "SELECT h.id, h.periodo_id, h.nombre_archivo, h.nombre_guardado, h.ruta_archivo, 
               h.tamaño, h.fecha_carga, h.usuario_carga, p.periodo, p.año
        FROM horarios h
        INNER JOIN periodos p ON h.periodo_id = p.id
        WHERE h.periodo_id = ? AND h.estado = 'activo'
        ORDER BY h.fecha_carga DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $periodo_id);
$stmt->execute();
$result = $stmt->get_result();

$horarios = [];
while ($row = $result->fetch_assoc()) {
    
    $tamaño_mb = round($row['tamaño'] / (1024 * 1024), 2);
    
    $horarios[] = [
        'id' => $row['id'],
        'periodo_id' => $row['periodo_id'],
        'nombre' => $row['nombre_archivo'],
        'nombre_guardado' => $row['nombre_guardado'],
        'ruta' => $row['ruta_archivo'],
        'tamaño' => $row['tamaño'],
        'tamaño_formato' => $tamaño_mb . ' MB',
        'fecha_carga' => $row['fecha_carga'],
        'usuario' => $row['usuario_carga'],
        'periodo' => $row['periodo'],
        'año' => $row['año']
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    'success' => true,
    'total' => count($horarios),
    'horarios' => $horarios
]);
?>
