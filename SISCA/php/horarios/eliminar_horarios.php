<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php:

if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de archivo no especificado']);
    exit;
}

$archivo_id = intval($data['id']);


$sql_select = "SELECT ruta_archivo, nombre_guardado FROM horarios WHERE id = ?";
$stmt = $conn->prepare($sql_select);
$stmt->bind_param("i", $archivo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'Archivo no encontrado']);
    exit;
}

$row = $result->fetch_assoc();
$ruta_archivo = $row['ruta_archivo'];
$nombre_guardado = $row['nombre_guardado'];
$stmt->close();


$ruta_absoluta = __DIR__ . '/../../PDFs/horarios/' . str_replace('../../PDFs/horarios/', '', $ruta_archivo);


$archivo_eliminado = true;
if (file_exists($ruta_absoluta)) {
    if (!@unlink($ruta_absoluta)) {
        $archivo_eliminado = false;
    }
}


$sql_delete = "DELETE FROM horarios WHERE id = ?";
$stmt = $conn->prepare($sql_delete);
$stmt->bind_param("i", $archivo_id);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Archivo eliminado correctamente de la BD y del servidor',
        'archivo_eliminado' => $archivo_eliminado,
        'id' => $archivo_id
    ]);
} else {
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar el archivo: ' . $stmt->error
    ]);
}
