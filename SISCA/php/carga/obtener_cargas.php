<?php


include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    $periodo_id = isset($_GET['periodo_id'])
                    ? intval($_GET['periodo_id'])
                    : (isset($_SESSION['periodo_activo']) ? intval($_SESSION['periodo_activo']) : 0);

    if ($periodo_id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No hay periodo activo seleccionado',
            'data' => []
        ]);
        exit;
    }

    
    $sql = "SELECT
              ca.id,
              ca.periodo_id,
              CONCAT(p.periodo, ' (', p.año, ')') as periodo_texto,
              ca.docente_id,
              d.nombre_docente,
              d.turno as turno_docente,
              d.regimen as regimen_docente,
              ca.grupo_id,
              g.codigo_grupo,
              ca.materia_id,
              pm.cve_materia,
              pm.nombre_materia,
              pm.horas_semanales as horas_materia_plan,
              ca.turno,
              ca.horas,
              ca.horas_tutoria,
              ca.horas_estadia,
              ca.actividades_administrativas,
              (ca.horas + ca.horas_tutoria + ca.horas_estadia) as total_horas_asignadas,
              ca.fecha_creacion
            FROM carga_academica ca
            INNER JOIN periodos p ON ca.periodo_id = p.id
            INNER JOIN docentes d ON ca.docente_id = d.id
            INNER JOIN grupos g ON ca.grupo_id = g.id
            INNER JOIN programa_materias pm ON ca.materia_id = pm.id
            WHERE ca.periodo_id = ?
              AND ca.estado = 'activo'
            ORDER BY d.nombre_docente ASC, ca.fecha_creacion ASC";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $periodo_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $cargas = [];
    while ($row = $result->fetch_assoc()) {
        $cargas[] = [
            'id' => intval($row['id']),
            'periodo_id' => intval($row['periodo_id']),
            'periodo' => $row['periodo_texto'],
            'docente_id' => intval($row['docente_id']),
            'docente' => $row['nombre_docente'],
            'turno_docente' => $row['turno_docente'],
            'regimen' => $row['regimen_docente'],
            'grupo_id' => intval($row['grupo_id']),
            'grupo' => $row['codigo_grupo'],
            'materia_id' => intval($row['materia_id']),
            'clave_materia' => $row['cve_materia'],
            'materia' => $row['nombre_materia'],
            'horas_plan' => intval($row['horas_materia_plan']),
            'turno' => $row['turno'],
            'horas' => intval($row['horas']),
            'horas_tutoria' => intval($row['horas_tutoria']),
            'horas_estadia' => intval($row['horas_estadia']),
            'administrativas' => $row['actividades_administrativas'],
            'total' => intval($row['total_horas_asignadas']),
            'fecha_creacion' => $row['fecha_creacion']
        ];
    }

    $stmt->close();

    
    $sql_stats = "SELECT
                    ca.docente_id,
                    d.nombre_docente,
                    COUNT(*) as total_asignaturas,
                    SUM(ca.horas) as total_horas_materias,
                    SUM(ca.horas_tutoria) as total_horas_tutoria,
                    SUM(ca.horas_estadia) as total_horas_estadia,
                    SUM(ca.horas + ca.horas_tutoria + ca.horas_estadia) as total_horas_general,
                    GROUP_CONCAT(DISTINCT ca.actividades_administrativas SEPARATOR ', ') as actividades_admin
                  FROM carga_academica ca
                  INNER JOIN docentes d ON ca.docente_id = d.id
                  WHERE ca.periodo_id = ?
                    AND ca.estado = 'activo'
                  GROUP BY ca.docente_id, d.nombre_docente";
    
    $stmt_stats = $conn->prepare($sql_stats);
    
    if (!$stmt_stats) {
        throw new Exception('Error al preparar consulta de estadisticas: ' . $conn->error);
    }
    
    $stmt_stats->bind_param('i', $periodo_id);
    $stmt_stats->execute();
    $result_stats = $stmt_stats->get_result();

    $estadisticas = [];
    while ($row = $result_stats->fetch_assoc()) {
        $estadisticas[$row['docente_id']] = [
            'total_asignaturas' => intval($row['total_asignaturas']),
            'total_horas_materias' => intval($row['total_horas_materias']),
            'total_horas_tutoria' => intval($row['total_horas_tutoria']),
            'total_horas_estadia' => intval($row['total_horas_estadia']),
            'total_horas_general' => intval($row['total_horas_general']),
            'actividades_admin' => $row['actividades_admin']
        ];
    }
    $stmt_stats->close();

    echo json_encode([
        'success' => true,
        'periodo_id' => $periodo_id,
        'total_registros' => count($cargas),
        'data' => $cargas,
        'estadisticas' => $estadisticas
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener cargas: ' . $e->getMessage(),
        'data' => []
    ]);
}

$conn->close();
?>