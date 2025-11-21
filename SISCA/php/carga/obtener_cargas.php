<?php
/**
 * Obtener cargas académicas del periodo activo
 * Filtra por periodo y retorna datos agrupados por docente
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    // Obtener periodo desde parámetro o sesión
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

    // OBTENER CARGAS usando la vista
    $sql = "SELECT
              id,
              periodo_id,
              periodo_texto,
              docente_id,
              nombre_docente,
              turno_docente,
              regimen_docente,
              grupo_id,
              codigo_grupo,
              materia_id,
              cve_materia,
              nombre_materia,
              horas_materia_plan,
              turno,
              horas,
              horas_clase,
              horas_tutoria,
              horas_estadia,
              actividades_administrativas,
              total_horas_asignadas,
              fecha_creacion,
              fecha_modificacion
            FROM vista_carga_academica
            WHERE periodo_id = ?
            ORDER BY nombre_docente ASC, fecha_creacion ASC";

    $stmt = $conn->prepare($sql);
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
            'horas_clase' => intval($row['horas_clase']),
            'horas_tutoria' => intval($row['horas_tutoria']),
            'horas_estadia' => intval($row['horas_estadia']),
            'administrativas' => $row['actividades_administrativas'],
            'total' => intval($row['total_horas_asignadas']),
            'fecha_creacion' => $row['fecha_creacion'],
            'fecha_modificacion' => $row['fecha_modificacion']
        ];
    }

    $stmt->close();

    // OBTENER ESTADÍSTICAS por docente
    $sql_stats = "SELECT * FROM vista_estadisticas_carga_docente WHERE periodo_id = ?";
    $stmt_stats = $conn->prepare($sql_stats);
    $stmt_stats->bind_param('i', $periodo_id);
    $stmt_stats->execute();
    $result_stats = $stmt_stats->get_result();

    $estadisticas = [];
    while ($row = $result_stats->fetch_assoc()) {
        $estadisticas[$row['docente_id']] = [
            'total_asignaturas' => intval($row['total_asignaturas']),
            'total_horas_materias' => intval($row['total_horas_materias']),
            'total_horas_clase' => intval($row['total_horas_clase']),
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
