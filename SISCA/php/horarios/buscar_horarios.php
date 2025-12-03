<?php

include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;
$busqueda = isset($_GET['q']) ? trim($_GET['q']) : '';

$sql = "SELECT h.id, h.periodo_id, h.nombre_archivo, h.nombre_guardado, h.ruta_archivo, 
               h.tamaño, h.fecha_carga, h.usuario_carga, p.periodo, p.año
        FROM horarios h
        INNER JOIN periodos p ON h.periodo_id = p.id
        WHERE h.estado = 'activo'";

$params = [];
$types = '';

if ($periodo_id) {
    $sql .= " AND h.periodo_id = ?";
    $params[] = $periodo_id;
    $types .= 'i';
}

if (!empty($busqueda)) {
    $sql .= " AND h.nombre_archivo LIKE ?";
    $search_term = '%' . $busqueda . '%';
    $params[] = $search_term;
    $types .= 's';
}

$sql .= " ORDER BY h.fecha_carga DESC LIMIT 100";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

if (count($params) > 0) {
    $stmt->bind_param($types, ...$params);
}

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
    'horarios' => $horarios,
    'busqueda' => $busqueda
]);
