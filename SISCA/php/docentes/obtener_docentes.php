<?php
include '../session_check.php';
include '../conexion.php';

try {
    // ============================================
    // CONFIGURACIÓN DE PAGINACIÓN
    // ============================================
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = 10;
    $offset = ($page - 1) * $limit;
    
    // ============================================
    // CONSTRUIR FILTROS DINÁMICOS
    // ============================================
    $where = [];
    $params = [];
    $types = '';

    // Filtro de período (importante para mostrar solo docentes del período activo)
    if (!empty($_GET['periodo_id'])) {
        $where[] = "periodo_id = ?";
        $params[] = intval($_GET['periodo_id']);
        $types .= 'i';
    }

    // Filtro de estado (activo/inactivo)
    $estado = isset($_GET['estado']) ? $_GET['estado'] : 'activo';
    $where[] = "estado = ?";
    $params[] = $estado;
    $types .= 's';

    // Filtro por nombre
    if (!empty($_GET['nombre_docente'])) {
        $where[] = "nombre_docente LIKE ?";
        $params[] = '%' . $_GET['nombre_docente'] . '%';
        $types .= 's';
    }

    // Filtro por turno
    if (!empty($_GET['turno'])) {
        $where[] = "turno = ?";
        $params[] = $_GET['turno'];
        $types .= 's';
    }

    // Filtro por régimen
    if (!empty($_GET['regimen'])) {
        $where[] = "regimen = ?";
        $params[] = $_GET['regimen'];
        $types .= 's';
    }
    
    $whereSQL = 'WHERE ' . implode(' AND ', $where);
    
    // ============================================
    // CONTAR TOTAL DE REGISTROS
    // ============================================
    $countSQL = "SELECT COUNT(*) as total FROM docentes $whereSQL";
    $stmtCount = $conn->prepare($countSQL);
    $stmtCount->bind_param($types, ...$params);
    $stmtCount->execute();
    $totalResult = $stmtCount->get_result();
    $total = $totalResult->fetch_assoc()['total'];
    $stmtCount->close();
    
    // ============================================
    // OBTENER REGISTROS PAGINADOS
    // ============================================
    $sql = "SELECT * FROM docentes $whereSQL ORDER BY id ASC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Construir array de docentes
    $docentes = [];
    while ($row = $result->fetch_assoc()) {
        $docentes[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $docentes,
        'total' => intval($total),
        'page' => $page,
        'totalPages' => ceil($total / $limit)
    ]);
    
    $stmt->close();
    
    //Manejo de errores
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>