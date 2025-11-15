<?php
/**
 * Script de mantenimiento para limpiar registros y archivos de horarios eliminados
 *
 * Funciones:
 * 1. Limpia registros marcados como 'eliminado' en la BD
 * 2. Elimina archivos huérfanos (en disco pero no en BD)
 * 3. Proporciona reporte detallado
 *
 * Uso: Llamar con POST con action especificada
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? $data['action'] : '';

try {
    $conn->begin_transaction();

    switch ($action) {
        case 'limpiar_registros_eliminados':
            // Elimina registros marcados como 'eliminado' de la BD
            $stmt = $conn->prepare("DELETE FROM horarios WHERE estado = 'eliminado'");
            if (!$stmt) {
                throw new Exception('Error al preparar consulta: ' . $conn->error);
            }

            $stmt->execute();
            $registros_eliminados = $stmt->affected_rows;
            $stmt->close();

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => "Se eliminaron $registros_eliminados registros marcados como 'eliminado'",
                'registros_eliminados' => $registros_eliminados
            ]);
            break;

        case 'limpiar_archivos_huerfanos':
            // Encuentra y elimina archivos huérfanos (en disco pero no en BD)
            $archivos_huerfanos = [];
            $archivos_eliminados = 0;

            // Obtener todas las rutas de archivos en BD
            $stmt = $conn->prepare("SELECT ruta_archivo FROM horarios WHERE ruta_archivo IS NOT NULL");
            if (!$stmt) {
                throw new Exception('Error al obtener rutas: ' . $conn->error);
            }

            $stmt->execute();
            $result = $stmt->get_result();

            $rutas_bd = [];
            while ($row = $result->fetch_assoc()) {
                $rutas_bd[] = $row['ruta_archivo'];
            }
            $stmt->close();

            // Escanear directorio de horarios
            $dir_horarios = __DIR__ . '/../../PDFs/horarios';
            if (is_dir($dir_horarios)) {
                $folders = scandir($dir_horarios);

                foreach ($folders as $folder) {
                    if ($folder === '.' || $folder === '..') continue;

                    $folder_path = $dir_horarios . '/' . $folder;
                    if (!is_dir($folder_path)) continue;

                    $files = scandir($folder_path);

                    foreach ($files as $file) {
                        if ($file === '.' || $file === '..') continue;

                        $file_path = $folder_path . '/' . $file;
                        $relative_path = 'PDFs/horarios/' . $folder . '/' . $file;

                        // Verificar si el archivo está en BD
                        if (!in_array($relative_path, $rutas_bd)) {
                            $archivos_huerfanos[] = $relative_path;

                            // Eliminar archivo huérfano
                            if (@unlink($file_path)) {
                                $archivos_eliminados++;
                            }
                        }
                    }
                }
            }

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => "Se encontraron y eliminaron $archivos_eliminados archivos huérfanos",
                'archivos_encontrados' => count($archivos_huerfanos),
                'archivos_eliminados' => $archivos_eliminados,
                'archivos' => $archivos_huerfanos
            ]);
            break;

        case 'diagnostico':
            // Realiza un diagnóstico completo
            // 1. Contar registros activos
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM horarios WHERE estado = 'activo'");
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $registros_activos = $row['total'];
            $stmt->close();

            // 2. Contar registros eliminados
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM horarios WHERE estado = 'eliminado'");
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $registros_eliminados = $row['total'];
            $stmt->close();

            // 3. Verificar archivos huérfanos
            $archivos_totales_disco = 0;
            $stmt = $conn->prepare("SELECT ruta_archivo FROM horarios WHERE ruta_archivo IS NOT NULL");
            $stmt->execute();
            $result = $stmt->get_result();

            $rutas_bd = [];
            while ($row = $result->fetch_assoc()) {
                $rutas_bd[] = $row['ruta_archivo'];
            }
            $stmt->close();

            $archivos_huerfanos_count = 0;
            $dir_horarios = __DIR__ . '/../../PDFs/horarios';
            if (is_dir($dir_horarios)) {
                $folders = scandir($dir_horarios);

                foreach ($folders as $folder) {
                    if ($folder === '.' || $folder === '..') continue;

                    $folder_path = $dir_horarios . '/' . $folder;
                    if (!is_dir($folder_path)) continue;

                    $files = scandir($folder_path);

                    foreach ($files as $file) {
                        if ($file === '.' || $file === '..') continue;

                        $archivos_totales_disco++;
                        $relative_path = 'PDFs/horarios/' . $folder . '/' . $file;

                        if (!in_array($relative_path, $rutas_bd)) {
                            $archivos_huerfanos_count++;
                        }
                    }
                }
            }

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Diagnóstico completado',
                'diagnostico' => [
                    'registros_activos' => $registros_activos,
                    'registros_eliminados' => $registros_eliminados,
                    'archivos_totales_en_disco' => $archivos_totales_disco,
                    'archivos_huerfanos' => $archivos_huerfanos_count,
                    'consistencia' => ($registros_activos === $archivos_totales_disco - $archivos_huerfanos_count) ? 'OK' : 'INCONSISTENCIA DETECTADA'
                ]
            ]);
            break;

        default:
            throw new Exception("Acción no reconocida: $action");
    }

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Error durante la operación: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>
