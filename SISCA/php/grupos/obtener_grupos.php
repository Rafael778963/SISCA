<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Filtro de estado (activo/inactivo)
        $estado = isset($_GET['estado']) ? $_GET['estado'] : 'activo';
        
        $sql = "SELECT id, codigo_grupo, generacion, nivel_educativo, programa_educativo, grado, letra_identificacion, turno, estado, fecha_creacion 
                FROM grupos 
                WHERE estado = ?
                ORDER BY id ASC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $estado);
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