<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || empty($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de archivo no especificado']);
    exit;
}

$archivo_id = intval($data['id']);

// Obtener información del archivo
$sql_select = "SELECT ruta_archivo, nombre_guardado FROM horarios WHERE id = ? AND estado = 'activo'";
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

// Ruta absoluta del archivo
$ruta_absoluta = __DIR__ . '/../../PDFs/horarios/' . str_replace('../../PDFs/horarios/', '', $ruta_archivo);

// Intentar eliminar archivo físico
$archivo_eliminado = true;
if (file_exists($ruta_absoluta)) {
    if (!@unlink($ruta_absoluta)) {
        $archivo_eliminado = false;
    }
}

// Actualizar estado en BD a 'eliminado' (soft delete)
$sql_update = "UPDATE horarios SET estado = 'eliminado' WHERE id = ?";
$stmt = $conn->prepare($sql_update);
$stmt->bind_param("i", $archivo_id);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Archivo eliminado correctamente',
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
