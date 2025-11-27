<?php
/**
 * Obtener datos para filtros del módulo de carga
 * Retorna: docentes, grupos, materias según el periodo activo
 */

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

try {
    $response = [
        'success' => true,
        'docentes' => [],
        'grupos' => [],
        'materias' => [],
        'turnos' => ['Matutino', 'Nocturno', 'Mixto']
    ];

    // Obtener periodo activo de la sesión
    $periodo_id = isset($_SESSION['periodo_activo']) ? $_SESSION['periodo_activo'] : null;

    // FILTRADO ESTRICTO: Solo mostrar datos si hay periodo activo
    // Si no hay periodo, los arrays quedan vacíos

    // 1. OBTENER DOCENTES ACTIVOS (solo del periodo activo)
    if ($periodo_id) {
        $sql_docentes = "SELECT
                            id,
                            nombre_docente,
                            turno,
                            regimen
                         FROM docentes
                         WHERE estado = 'activo'
                           AND periodo_id = ?
                         ORDER BY nombre_docente ASC";

        $stmt_docentes = $conn->prepare($sql_docentes);
        $stmt_docentes->bind_param('i', $periodo_id);
        $stmt_docentes->execute();
        $result_docentes = $stmt_docentes->get_result();

        while ($row = $result_docentes->fetch_assoc()) {
            $response['docentes'][] = [
                'id' => $row['id'],
                'nombre' => $row['nombre_docente'],
                'turno' => $row['turno'],
                'regimen' => $row['regimen'],
                'label' => $row['nombre_docente'] . ' (' . $row['turno'] . ' - ' . $row['regimen'] . ')'
            ];
        }
        $stmt_docentes->close();
    }

    // 2. OBTENER GRUPOS ACTIVOS (solo del periodo activo)
    if ($periodo_id) {
        $sql_grupos = "SELECT
                          id,
                          codigo_grupo,
                          programa_educativo,
                          grado,
                          turno,
                          nivel_educativo
                       FROM grupos
                       WHERE estado = 'activo'
                         AND periodo_id = ?
                       ORDER BY codigo_grupo ASC";

        $stmt_grupos = $conn->prepare($sql_grupos);
        $stmt_grupos->bind_param('i', $periodo_id);
        $stmt_grupos->execute();
        $result_grupos = $stmt_grupos->get_result();

        while ($row = $result_grupos->fetch_assoc()) {
            $turno_letra = $row['turno'] === 'M' ? 'Matutino' : 'Nocturno';
            $response['grupos'][] = [
                'id' => $row['id'],
                'codigo' => $row['codigo_grupo'],
                'programa' => $row['programa_educativo'],
                'grado' => $row['grado'],
                'turno' => $turno_letra,
                'nivel' => $row['nivel_educativo'],
                'label' => $row['codigo_grupo'] . ' (' . $turno_letra . ')'
            ];
        }
        $stmt_grupos->close();
    }

    // 3. OBTENER MATERIAS ACTIVAS
    $sql_materias = "SELECT
                        pm.id,
                        pm.cve_materia,
                        pm.nombre_materia,
                        pm.grado,
                        pm.horas_semanales,
                        pm.turno,
                        pm.id_programa,
                        p.nomenclatura as programa_nomenclatura
                     FROM programa_materias pm
                     INNER JOIN programas p ON pm.id_programa = p.id
                     WHERE pm.activo = 1
                       AND p.activo = 1
                     ORDER BY pm.nombre_materia ASC";

    $result_materias = $conn->query($sql_materias);
    if ($result_materias) {
        while ($row = $result_materias->fetch_assoc()) {
            $response['materias'][] = [
                'id' => $row['id'],
                'clave' => $row['cve_materia'],
                'nombre' => $row['nombre_materia'],
                'grado' => $row['grado'],
                'horas' => $row['horas_semanales'],
                'turno' => $row['turno'],
                'programa_id' => $row['id_programa'],
                'programa' => $row['programa_nomenclatura'],
                'label' => $row['cve_materia'] . ' - ' . $row['nombre_materia'] . ' (' . $row['horas_semanales'] . ' hrs)'
            ];
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener datos: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
