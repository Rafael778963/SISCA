<?php
include '../session_check.php';
include '../conexion.php';

if(isset($_POST['id'])) {
    $id = intval($_POST['id']);

    // Validar que el ID sea válido
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        $conn->close();
        exit;
    }

    // Iniciar transacción para garantizar la integridad de los datos
    $conn->begin_transaction();

    try {
        // 1. Eliminar grupos relacionados con el periodo
        $stmt_grupos = $conn->prepare("DELETE FROM grupos WHERE periodo_id = ?");
        if (!$stmt_grupos) {
            throw new Exception('Error al preparar eliminación de grupos');
        }
        $stmt_grupos->bind_param("i", $id);
        $stmt_grupos->execute();
        $grupos_eliminados = $stmt_grupos->affected_rows;
        $stmt_grupos->close();

        // 2. Los horarios se eliminan automáticamente por la constraint CASCADE
        // No es necesario hacerlo manualmente

        // 3. Eliminar el periodo
        $stmt = $conn->prepare("DELETE FROM periodos WHERE id = ?");
        if (!$stmt) {
            throw new Exception('Error al preparar eliminación del periodo');
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            // Confirmar la transacción
            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Periodo eliminado correctamente',
                'detalles' => [
                    'grupos_eliminados' => $grupos_eliminados
                ]
            ]);
        } else {
            // Revertir la transacción
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'No se encontró el periodo']);
        }

        $stmt->close();

    } catch (Exception $e) {
        // Revertir la transacción en caso de error
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el periodo: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>