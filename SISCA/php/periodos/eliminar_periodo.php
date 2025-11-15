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

    // Iniciar transacción para asegurar integridad
    $conn->begin_transaction();

    try {
        // 1. Obtener todos los horarios del período
        $sql_horarios = "SELECT id, ruta_archivo FROM horarios WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql_horarios);
        if (!$stmt) {
            throw new Exception('Error en la consulta de horarios: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $horarios = [];

        while ($row = $result->fetch_assoc()) {
            $horarios[] = $row;
        }
        $stmt->close();

        // 2. Eliminar archivos físicos de cada horario
        $archivos_eliminados = 0;
        $archivos_no_eliminados = 0;

        foreach ($horarios as $horario) {
            $ruta_archivo = $horario['ruta_archivo'];
            $ruta_absoluta = __DIR__ . '/../../PDFs/horarios/' . str_replace('../../PDFs/horarios/', '', $ruta_archivo);

            if (file_exists($ruta_absoluta)) {
                if (@unlink($ruta_absoluta)) {
                    $archivos_eliminados++;
                } else {
                    $archivos_no_eliminados++;
                }
            }
        }

        // 3. Eliminar todos los registros de horarios de la BD
        $sql_delete_horarios = "DELETE FROM horarios WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql_delete_horarios);
        if (!$stmt) {
            throw new Exception('Error al preparar eliminación de horarios: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new Exception('Error al eliminar horarios: ' . $stmt->error);
        }
        $horarios_eliminados = $stmt->affected_rows;
        $stmt->close();

        // 4. Eliminar carpeta del período
        $periodo_dir = __DIR__ . '/../../PDFs/horarios/periodo_' . $id . '/';
        $carpeta_eliminada = false;

        if (is_dir($periodo_dir)) {
            // Asegurarse de que está vacía (en caso de que quedaran archivos)
            $archivos_restantes = array_diff(scandir($periodo_dir), ['.', '..']);
            if (empty($archivos_restantes)) {
                if (@rmdir($periodo_dir)) {
                    $carpeta_eliminada = true;
                }
            }
        } else {
            // Si la carpeta no existe, consideramos que fue eliminada
            $carpeta_eliminada = true;
        }

        // 5. Eliminar todos los grupos asociados al período
        $sql_delete_grupos = "DELETE FROM grupos WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql_delete_grupos);
        if (!$stmt) {
            throw new Exception('Error al preparar eliminación de grupos: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new Exception('Error al eliminar grupos: ' . $stmt->error);
        }
        $grupos_eliminados = $stmt->affected_rows;
        $stmt->close();

        // 6. Eliminar todos los docentes del período de la BD
        $sql_delete_docentes = "DELETE FROM docentes WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql_delete_docentes);
        if (!$stmt) {
            throw new Exception('Error al preparar eliminación de docentes: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new Exception('Error al eliminar docentes: ' . $stmt->error);
        }
        $docentes_eliminados = $stmt->affected_rows;
        $stmt->close();

        // 7. Eliminar el período de la BD
        $sql_delete_periodo = "DELETE FROM periodos WHERE id = ?";
        $stmt = $conn->prepare($sql_delete_periodo);
        if (!$stmt) {
            throw new Exception('Error al preparar eliminación de período: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            throw new Exception('Error al eliminar período: ' . $stmt->error);
        }

        if ($stmt->affected_rows === 0) {
            throw new Exception('No se encontró el período');
        }

        $stmt->close();

        // Confirmar transacción
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Período y todos sus datos asociados eliminados correctamente',
            'detalles' => [
                'periodo_id' => $id,
                'archivos_pdf_eliminados' => $archivos_eliminados,
                'archivos_no_eliminados' => $archivos_no_eliminados,
                'horarios_eliminados' => $horarios_eliminados,
                'grupos_eliminados' => $grupos_eliminados,
                'docentes_eliminados' => $docentes_eliminados,
                'carpeta_eliminada' => $carpeta_eliminada
            ]
        ]);

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar período: ' . $e->getMessage()
        ]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'ID no recibido']);
}

$conn->close();
?>