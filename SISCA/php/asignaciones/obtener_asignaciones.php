<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Filtros opcionales
        $periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;
        $docente_id = isset($_GET['docente_id']) ? intval($_GET['docente_id']) : null;
        $grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : null;
        $estado = isset($_GET['estado']) ? $_GET['estado'] : 'activo';

        // Construir consulta base
        $sql = "SELECT
                    a.id,
                    a.docente_id,
                    d.nombre_docente,
                    d.turno as docente_turno,
                    d.regimen as docente_regimen,
                    a.materia_id,
                    pm.cve_materia,
                    pm.nombre_materia,
                    pm.grado as materia_grado,
                    pm.horas_semanales,
                    a.grupo_id,
                    g.codigo_grupo,
                    g.nivel_educativo,
                    g.programa_educativo,
                    a.periodo_id,
                    p.periodo,
                    p.año,
                    a.estado,
                    a.observaciones,
                    a.fecha_asignacion,
                    a.fecha_modificacion
                FROM asignaciones a
                INNER JOIN docentes d ON a.docente_id = d.id
                INNER JOIN programa_materias pm ON a.materia_id = pm.id
                INNER JOIN grupos g ON a.grupo_id = g.id
                INNER JOIN periodos p ON a.periodo_id = p.id
                WHERE a.estado = ?";

        $params = [$estado];
        $types = "s";

        // Agregar filtros si existen
        if ($periodo_id !== null && $periodo_id > 0) {
            $sql .= " AND a.periodo_id = ?";
            $params[] = $periodo_id;
            $types .= "i";
        }

        if ($docente_id !== null && $docente_id > 0) {
            $sql .= " AND a.docente_id = ?";
            $params[] = $docente_id;
            $types .= "i";
        }

        if ($grupo_id !== null && $grupo_id > 0) {
            $sql .= " AND a.grupo_id = ?";
            $params[] = $grupo_id;
            $types .= "i";
        }

        $sql .= " ORDER BY p.año DESC, p.periodo ASC, g.codigo_grupo ASC, pm.grado ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $asignaciones = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $asignaciones[] = $row;
            }
        }

        echo json_encode([
            'success' => true,
            'data' => $asignaciones,
            'total' => count($asignaciones)
        ]);

        $stmt->close();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener las asignaciones: ' . $e->getMessage()
        ]);
    }

} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}

$conn->close();
?>
