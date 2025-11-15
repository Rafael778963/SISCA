<?php
include '../session_check.php';
include '../conexion.php';
include '../periodo_session.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Filtro de estado (activo/inactivo)
        $estado = isset($_GET['estado']) ? $_GET['estado'] : 'activo';

        // Filtro por periodo activo (se puede anular con periodo_id=all)
        $periodo_filtro = isset($_GET['periodo_id']) && $_GET['periodo_id'] === 'all' ? null : get_periodo_activo();

        $sql = "SELECT g.id, g.periodo_id, g.codigo_grupo, g.generacion, g.nivel_educativo, g.programa_educativo, g.grado, g.letra_identificacion, g.turno, g.estado, g.fecha_creacion, p.periodo, p.año
                FROM grupos g
                LEFT JOIN periodos p ON g.periodo_id = p.id
                WHERE g.estado = ?";

        if ($periodo_filtro !== null) {
            $sql .= " AND g.periodo_id = ?";
        }

        $sql .= " ORDER BY g.id ASC";

        $stmt = $conn->prepare($sql);

        if ($periodo_filtro !== null) {
            $stmt->bind_param("si", $estado, $periodo_filtro);
        } else {
            $stmt->bind_param("s", $estado);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        
        $grupos = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                // Si turno es null, asignar 'M' por defecto para compatibilidad
                if ($row['turno'] === null) {
                    $row['turno'] = 'M';
                }
                $grupos[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $grupos
        ]);
        
        $stmt->close();
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los grupos: ' . $e->getMessage()
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