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
        // 1. Obtener y eliminar archivos físicos de horarios antes de eliminar registros
        $stmt_horarios = $conn->prepare("SELECT id, ruta_archivo FROM horarios WHERE periodo_id = ?");
        if (!$stmt_horarios) {
            throw new Exception('Error al obtener horarios del periodo');
        }
        $stmt_horarios->bind_param("i", $id);
        $stmt_horarios->execute();
        $result_horarios = $stmt_horarios->get_result();

        $archivos_eliminados = 0;
        $horarios_totales = 0;
        $rutas_archivos = [];

        // Recopilar todas las rutas de archivos
        while ($row = $result_horarios->fetch_assoc()) {
            $rutas_archivos[] = $row['ruta_archivo'];
            $horarios_totales++;
        }
        $stmt_horarios->close();

        // Eliminar los archivos físicos
        foreach ($rutas_archivos as $ruta) {
            // Construir ruta absoluta correctamente
            $ruta_absoluta = __DIR__ . '/../../' . $ruta;

            // Normalizar la ruta
            $ruta_absoluta = str_replace('\\', '/', $ruta_absoluta);

            if (file_exists($ruta_absoluta)) {
                if (@unlink($ruta_absoluta)) {
                    $archivos_eliminados++;
                }
            }
        }

        // Intentar eliminar la carpeta del periodo si existe y está vacía
        $carpeta_periodo = __DIR__ . '/../../PDFs/horarios/periodo_' . $id;
        if (is_dir($carpeta_periodo)) {
            // Verificar que esté vacía antes de eliminar
            if (count(array_diff(scandir($carpeta_periodo), array('.', '..'))) === 0) {
                @rmdir($carpeta_periodo);
            }
        }

        // 2. Eliminar grupos relacionados con el periodo
        $stmt_grupos = $conn->prepare("DELETE FROM grupos WHERE periodo_id = ?");
        if (!$stmt_grupos) {
            throw new Exception('Error al preparar eliminación de grupos');
        }
        $stmt_grupos->bind_param("i", $id);
        $stmt_grupos->execute();
        $grupos_eliminados = $stmt_grupos->affected_rows;
        $stmt_grupos->close();

        // 3. Obtener count de horarios antes de eliminar el periodo
        $stmt_count = $conn->prepare("SELECT COUNT(*) as total FROM horarios WHERE periodo_id = ?");
        if (!$stmt_count) {
            throw new Exception('Error al contar horarios del periodo');
        }
        $stmt_count->bind_param("i", $id);
        $stmt_count->execute();
        $result_count = $stmt_count->get_result();
        $count_row = $result_count->fetch_assoc();
        $horarios_bd_eliminados = $count_row['total'];
        $stmt_count->close();

        // 4. Eliminar el periodo (esto eliminará los horarios de la BD automáticamente por CASCADE)
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
                'message' => 'Periodo eliminado correctamente con todos sus datos',
                'detalles' => [
                    'grupos_eliminados' => $grupos_eliminados,
                    'horarios_eliminados_bd' => $horarios_bd_eliminados,
                    'archivos_pdf_eliminados' => $archivos_eliminados,
                    'archivos_totales_periodo' => $horarios_totales
                ]
            ]);
        } else {
            // Revertir la transacción
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'No se encontró el periodo especificado']);
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