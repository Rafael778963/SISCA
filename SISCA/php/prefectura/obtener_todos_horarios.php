<?php
// ============================================
// OBTENER TODOS LOS HORARIOS ACTIVOS
// ============================================

include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// ============================================
// CONSULTA DE HORARIOS CON INFORMACIÓN DE PERIODO
// ============================================

try {
    $sql = "SELECT h.id, h.periodo_id, h.nombre_archivo, h.nombre_guardado, h.ruta_archivo,
                   h.tamaño, h.fecha_carga, h.usuario_carga, p.periodo, p.año,
                   CONCAT(p.periodo, ' - ', p.año) as periodo_completo
            FROM horarios h
            INNER JOIN periodos p ON h.periodo_id = p.id
            WHERE h.estado = 'activo'
            ORDER BY h.fecha_carga DESC";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $horarios = [];

    while ($row = $result->fetch_assoc()) {
        $horarios[] = [
            'id' => $row['id'],
            'periodo_id' => $row['periodo_id'],
            'nombre' => $row['nombre_archivo'],
            'nombre_guardado' => $row['nombre_guardado'],
            'ruta' => $row['ruta_archivo'],
            'tamaño' => $row['tamaño'],
            'fecha_carga' => $row['fecha_carga'],
            'usuario' => $row['usuario_carga'],
            'periodo' => $row['periodo'],
            'año' => $row['año'],
            'periodo_completo' => $row['periodo_completo']
        ];
    }

    $result->free();

    echo json_encode([
        'success' => true,
        'total' => count($horarios),
        'horarios' => $horarios
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
