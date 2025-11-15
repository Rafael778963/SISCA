<?php
include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    // Obtener el periodo_id del parámetro GET
    $periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;

    $estadisticas = [];

    // ============================================
    // FUNCIÓN AUXILIAR: Verificar si una columna existe en una tabla
    // ============================================
    function columnaExiste($conn, $tabla, $columna) {
        $sql = "SELECT COUNT(*) as existe
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = 'sisca'
                AND TABLE_NAME = ?
                AND COLUMN_NAME = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $tabla, $columna);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row['existe'] > 0;
    }

    // ============================================
    // FUNCIÓN AUXILIAR: Verificar si una tabla existe
    // ============================================
    function tablaExiste($conn, $tabla) {
        $result = $conn->query("SHOW TABLES LIKE '$tabla'");
        return $result->num_rows > 0;
    }

    // ============================================
    // 1. PERÍODOS ACTIVOS (Total, no depende del periodo seleccionado)
    // ============================================
    $sql = "SELECT COUNT(*) as total FROM periodos WHERE estado = 'activo'";
    $result = $conn->query($sql);
    $estadisticas['periodos_activos'] = $result->fetch_assoc()['total'];

    // ============================================
    // 2. GRUPOS REGISTRADOS (Filtrado por periodo si la columna existe)
    // ============================================
    if ($periodo_id && columnaExiste($conn, 'grupos', 'periodo_id')) {
        $sql = "SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ? AND estado = 'activo'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['grupos_registrados'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        // Si no hay periodo o no existe la columna, contar todos los grupos activos
        $sql = "SELECT COUNT(*) as total FROM grupos WHERE estado = 'activo'";
        $result = $conn->query($sql);
        $estadisticas['grupos_registrados'] = $result->fetch_assoc()['total'];
    }

    // ============================================
    // 3. DOCENTES REGISTRADOS (Filtrado por periodo si la columna existe)
    // ============================================
    if ($periodo_id && columnaExiste($conn, 'docentes', 'periodo_id')) {
        $sql = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo' AND (periodo_id = ? OR periodo_id IS NULL)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['docentes_registrados'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        // Si no hay periodo o no existe la columna, contar todos los docentes activos
        $sql = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo'";
        $result = $conn->query($sql);
        $estadisticas['docentes_registrados'] = $result->fetch_assoc()['total'];
    }

    // ============================================
    // 4. HORAS DE TUTORÍA (Por periodo)
    // ============================================
    if (tablaExiste($conn, 'tutoria') && $periodo_id && columnaExiste($conn, 'tutoria', 'periodo_id') && columnaExiste($conn, 'tutoria', 'horas_asignadas')) {
        $sql = "SELECT SUM(horas_asignadas) as total FROM tutoria WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $estadisticas['horas_tutoria'] = $row['total'] ? intval($row['total']) : 0;
        $stmt->close();
    } elseif (tablaExiste($conn, 'tutoria') && columnaExiste($conn, 'tutoria', 'horas_asignadas')) {
        // Si la tabla existe pero no tiene periodo_id o no hay periodo seleccionado
        $sql = "SELECT SUM(horas_asignadas) as total FROM tutoria";
        $result = $conn->query($sql);
        $row = $result->fetch_assoc();
        $estadisticas['horas_tutoria'] = $row['total'] ? intval($row['total']) : 0;
    } else {
        $estadisticas['horas_tutoria'] = 0;
    }

    // ============================================
    // 5. PLAN DE ESTUDIOS REGISTRADOS (Total)
    // ============================================
    if (tablaExiste($conn, 'programa_materias')) {
        $sql = "SELECT COUNT(DISTINCT programa_educativo) as total FROM programa_materias";
        $result = $conn->query($sql);
        $estadisticas['plan_estudios'] = intval($result->fetch_assoc()['total']);
    } else {
        $estadisticas['plan_estudios'] = 0;
    }

    // ============================================
    // 6. REPORTES GENERADOS (Por periodo)
    // ============================================
    if (tablaExiste($conn, 'reportes') && $periodo_id && columnaExiste($conn, 'reportes', 'periodo_id')) {
        $sql = "SELECT COUNT(*) as total FROM reportes WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['reportes_generados'] = intval($result->fetch_assoc()['total']);
        $stmt->close();
    } elseif (tablaExiste($conn, 'reportes')) {
        $sql = "SELECT COUNT(*) as total FROM reportes";
        $result = $conn->query($sql);
        $estadisticas['reportes_generados'] = intval($result->fetch_assoc()['total']);
    } else {
        $estadisticas['reportes_generados'] = 0;
    }

    // ============================================
    // 7. CARTAS DE ASIGNACIÓN (Por periodo)
    // ============================================
    if (tablaExiste($conn, 'carta_asignacion') && $periodo_id && columnaExiste($conn, 'carta_asignacion', 'periodo_id')) {
        $sql = "SELECT COUNT(*) as total FROM carta_asignacion WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['cartas_emitidas'] = intval($result->fetch_assoc()['total']);
        $stmt->close();
    } elseif (tablaExiste($conn, 'carta_asignacion')) {
        $sql = "SELECT COUNT(*) as total FROM carta_asignacion";
        $result = $conn->query($sql);
        $estadisticas['cartas_emitidas'] = intval($result->fetch_assoc()['total']);
    } else {
        $estadisticas['cartas_emitidas'] = 0;
    }

    // ============================================
    // 8. ASIGNACIONES DE CARGA (Por periodo)
    // ============================================
    if (tablaExiste($conn, 'carga') && $periodo_id && columnaExiste($conn, 'carga', 'periodo_id')) {
        $sql = "SELECT COUNT(*) as total FROM carga WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['asignaciones_carga'] = intval($result->fetch_assoc()['total']);
        $stmt->close();
    } elseif (tablaExiste($conn, 'carga')) {
        $sql = "SELECT COUNT(*) as total FROM carga";
        $result = $conn->query($sql);
        $estadisticas['asignaciones_carga'] = intval($result->fetch_assoc()['total']);
    } else {
        $estadisticas['asignaciones_carga'] = 0;
    }

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'periodo_id' => $periodo_id,
        'estadisticas' => $estadisticas
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
