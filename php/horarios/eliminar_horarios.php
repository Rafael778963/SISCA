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

try {
    // Iniciar transacción
    $conn->begin_transaction();

    // Obtener información del archivo
    $sql_select = "SELECT ruta_archivo, nombre_guardado, periodo_id FROM horarios WHERE id = ? AND estado = 'activo'";
    $stmt = $conn->prepare($sql_select);

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    $stmt->bind_param("i", $archivo_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Archivo no encontrado o ya fue eliminado']);
        exit;
    }

    $row = $result->fetch_assoc();
    $ruta_archivo = $row['ruta_archivo'];
    $nombre_guardado = $row['nombre_guardado'];
    $periodo_id = $row['periodo_id'];
    $stmt->close();

    // Ruta absoluta del archivo
    $ruta_absoluta = __DIR__ . '/../../PDFs/horarios/' . str_replace('../../PDFs/horarios/', '', $ruta_archivo);

    // Intentar eliminar archivo físico
    $archivo_eliminado = true;
    $error_archivo = null;

    if (file_exists($ruta_absoluta)) {
        if (!@unlink($ruta_absoluta)) {
            $archivo_eliminado = false;
            $error_archivo = 'No se pudo eliminar el archivo físico, pero el registro fue marcado como eliminado';
        }
    } else {
        // El archivo no existe, pero podemos marcarlo como eliminado
        $error_archivo = 'El archivo físico ya no existe en el servidor';
    }

    // Actualizar estado en BD a 'eliminado' (soft delete)
    $sql_update = "UPDATE horarios SET estado = 'eliminado' WHERE id = ?";
    $stmt = $conn->prepare($sql_update);

    if (!$stmt) {
        throw new Exception('Error al preparar actualización: ' . $conn->error);
    }

    $stmt->bind_param("i", $archivo_id);

    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el registro: ' . $stmt->error);
    }

    $stmt->close();

    // Confirmar transacción
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Archivo eliminado correctamente',
        'archivo_eliminado' => $archivo_eliminado,
        'advertencia' => $error_archivo,
        'id' => $archivo_id,
        'periodo_id' => $periodo_id
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar el archivo: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
