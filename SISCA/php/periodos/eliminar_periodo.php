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
        $stmt_horarios = $conn->prepare("SELECT ruta_archivo FROM horarios WHERE periodo_id = ?");
        if (!$stmt_horarios) {
            throw new Exception('Error al obtener horarios del periodo');
        }
        $stmt_horarios->bind_param("i", $id);
        $stmt_horarios->execute();
        $result_horarios = $stmt_horarios->get_result();

        $archivos_eliminados = 0;
        $rutas_archivos = [];

        // Recopilar todas las rutas de archivos
        while ($row = $result_horarios->fetch_assoc()) {
            $rutas_archivos[] = $row['ruta_archivo'];
        }
        $stmt_horarios->close();

        // Eliminar los archivos físicos
        foreach ($rutas_archivos as $ruta) {
            // La ruta en BD es relativa, construir ruta absoluta
            $ruta_completa = '../../' . $ruta;
            if (file_exists($ruta_completa)) {
                if (unlink($ruta_completa)) {
                    $archivos_eliminados++;
                }
            }
        }

        // Intentar eliminar la carpeta del periodo si existe y está vacía
        $carpeta_periodo = "../../PDFs/horarios/periodo_" . $id;
        if (is_dir($carpeta_periodo)) {
            // Eliminar la carpeta solo si está vacía
            @rmdir($carpeta_periodo);
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

        // 3. Eliminar el periodo (esto eliminará los horarios de la BD automáticamente por CASCADE)
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
                    'grupos_eliminados' => $grupos_eliminados,
                    'archivos_eliminados' => $archivos_eliminados
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