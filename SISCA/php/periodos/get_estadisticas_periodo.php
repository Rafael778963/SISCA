<?php
include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    // Obtener el periodo_id del parámetro GET
    $periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;

    $estadisticas = [];

    // ============================================
    // 1. PERÍODOS ACTIVOS (Total, no depende del periodo seleccionado)
    // ============================================
    $sql = "SELECT COUNT(*) as total FROM periodos WHERE estado = 'activo'";
    $result = $conn->query($sql);
    $estadisticas['periodos_activos'] = $result->fetch_assoc()['total'];

    // ============================================
    // 2. GRUPOS REGISTRADOS (Filtrado por periodo)
    // ============================================
    if ($periodo_id) {
        $sql = "SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ? AND estado = 'activo'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['grupos_registrados'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        // Si no hay periodo seleccionado, contar todos los grupos activos
        $sql = "SELECT COUNT(*) as total FROM grupos WHERE estado = 'activo'";
        $result = $conn->query($sql);
        $estadisticas['grupos_registrados'] = $result->fetch_assoc()['total'];
    }

    // ============================================
    // 3. DOCENTES REGISTRADOS (Filtrado por periodo si existe)
    // ============================================
    if ($periodo_id) {
        // Verificar si la tabla docentes tiene la columna periodo_id
        $sql = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo' AND (periodo_id = ? OR periodo_id IS NULL)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['docentes_registrados'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        $sql = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo'";
        $result = $conn->query($sql);
        $estadisticas['docentes_registrados'] = $result->fetch_assoc()['total'];
    }

    // ============================================
    // 4. HORAS DE TUTORÍA (Por periodo)
    // ============================================
    // Verificar si existe la tabla tutoria
    $sql = "SHOW TABLES LIKE 'tutoria'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0 && $periodo_id) {
        // Si la tabla existe, intentar contar horas
        $sql = "SELECT SUM(horas_asignadas) as total FROM tutoria WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $estadisticas['horas_tutoria'] = $row['total'] ? $row['total'] : 0;
        $stmt->close();
    } else {
        $estadisticas['horas_tutoria'] = 0;
    }

    // ============================================
    // 5. PLAN DE ESTUDIOS REGISTRADOS (Total)
    // ============================================
    // Verificar si existe la tabla plan_estudios o programa_materias
    $sql = "SHOW TABLES LIKE 'programa_materias'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $sql = "SELECT COUNT(DISTINCT programa_educativo) as total FROM programa_materias";
        $result = $conn->query($sql);
        $estadisticas['plan_estudios'] = $result->fetch_assoc()['total'];
    } else {
        $estadisticas['plan_estudios'] = 0;
    }

    // ============================================
    // 6. REPORTES GENERADOS (Por periodo)
    // ============================================
    $sql = "SHOW TABLES LIKE 'reportes'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0 && $periodo_id) {
        $sql = "SELECT COUNT(*) as total FROM reportes WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['reportes_generados'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        $estadisticas['reportes_generados'] = 0;
    }

    // ============================================
    // 7. CARTAS DE ASIGNACIÓN (Por periodo)
    // ============================================
    $sql = "SHOW TABLES LIKE 'carta_asignacion'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0 && $periodo_id) {
        $sql = "SELECT COUNT(*) as total FROM carta_asignacion WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['cartas_emitidas'] = $result->fetch_assoc()['total'];
        $stmt->close();
    } else {
        $estadisticas['cartas_emitidas'] = 0;
    }

    // ============================================
    // 8. ASIGNACIONES DE CARGA (Por periodo)
    // ============================================
    $sql = "SHOW TABLES LIKE 'carga'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0 && $periodo_id) {
        $sql = "SELECT COUNT(*) as total FROM carga WHERE periodo_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $estadisticas['asignaciones_carga'] = $result->fetch_assoc()['total'];
        $stmt->close();
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
