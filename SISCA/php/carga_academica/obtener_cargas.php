<?php
include '../session_check.php';
include '../conexion.php';

// Parámetros de filtrado opcionales
$periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;
$docente_id = isset($_GET['docente_id']) ? intval($_GET['docente_id']) : null;
$grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : null;
$estado = isset($_GET['estado']) ? trim($_GET['estado']) : 'activo';

// Construir query con filtros dinámicos
$sql = "
    SELECT ca.*,
           d.nombre_docente,
           d.turno as docente_turno,
           d.regimen as docente_regimen,
           pm.nombre_materia,
           pm.cve_materia,
           pm.horas_semanales as materia_horas,
           g.codigo_grupo,
           g.nivel_educativo,
           g.grado,
           prog.nombre as programa_nombre,
           prog.nomenclatura as programa_nomenclatura,
           p.periodo,
           p.año
    FROM carga_academica ca
    INNER JOIN docentes d ON ca.docente_id = d.id
    INNER JOIN programa_materias pm ON ca.programa_materia_id = pm.id
    INNER JOIN grupos g ON ca.grupo_id = g.id
    INNER JOIN programas prog ON g.programa_id = prog.id
    INNER JOIN periodos p ON ca.periodo_id = p.id
    WHERE 1=1
";

$params = [];
$types = "";

if ($periodo_id !== null) {
    $sql .= " AND ca.periodo_id = ?";
    $params[] = $periodo_id;
    $types .= "i";
}

if ($docente_id !== null) {
    $sql .= " AND ca.docente_id = ?";
    $params[] = $docente_id;
    $types .= "i";
}

if ($grupo_id !== null) {
    $sql .= " AND ca.grupo_id = ?";
    $params[] = $grupo_id;
    $types .= "i";
}

if ($estado !== null && $estado !== '') {
    $sql .= " AND ca.estado = ?";
    $params[] = $estado;
    $types .= "s";
}

$sql .= " ORDER BY p.año DESC, p.id DESC, d.nombre_docente ASC";

// Preparar y ejecutar la consulta
$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$cargas = [];
while ($row = $result->fetch_assoc()) {
    $cargas[] = $row;
}

// Estadísticas adicionales si se solicitan
$includeStats = isset($_GET['include_stats']) && $_GET['include_stats'] === 'true';

if ($includeStats && $periodo_id !== null) {
    // Obtener estadísticas del periodo
    $statsStmt = $conn->prepare("
        SELECT
            COUNT(*) as total_asignaciones,
            COUNT(DISTINCT docente_id) as total_docentes,
            COUNT(DISTINCT grupo_id) as total_grupos,
            SUM(horas_asignadas) as total_horas
        FROM carga_academica
        WHERE periodo_id = ? AND estado = 'activo'
    ");
    $statsStmt->bind_param("i", $periodo_id);
    $statsStmt->execute();
    $statsResult = $statsStmt->get_result();
    $stats = $statsResult->fetch_assoc();
    $statsStmt->close();

    echo json_encode([
        'success' => true,
        'data' => $cargas,
        'stats' => $stats
    ]);
} else {
    echo json_encode([
        'success' => true,
        'data' => $cargas
    ]);
}

$stmt->close();
$conn->close();
?>
