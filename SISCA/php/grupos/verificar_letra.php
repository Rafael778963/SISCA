<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $generacion = isset($_GET['generacion']) ? trim($_GET['generacion']) : '';
        $programa = isset($_GET['programa']) ? trim($_GET['programa']) : '';
        $grado = isset($_GET['grado']) ? trim($_GET['grado']) : '';
        $turno = isset($_GET['turno']) ? trim($_GET['turno']) : 'M';
        $periodo_id = isset($_GET['periodo_id']) ? (int)$_GET['periodo_id'] : null;

        if (empty($generacion) || empty($programa) || empty($grado)) {
            throw new Exception('Parámetros incompletos');
        }

        if ($periodo_id === null) {
            throw new Exception('El periodo_id es requerido');
        }

        if (!in_array($turno, ['M', 'N'])) {
            $turno = 'M';
        }

        // Buscar última letra usada para esta configuración en el período activo
        $stmt = $conn->prepare("
            SELECT letra_identificacion
            FROM grupos
            WHERE generacion = ?
            AND programa_educativo = ?
            AND grado = ?
            AND turno = ?
            AND periodo_id = ?
            AND estado = 'activo'
            ORDER BY letra_identificacion DESC
            LIMIT 1
        ");
        $stmt->bind_param("ssssi", $generacion, $programa, $grado, $turno, $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $letraCorrespondiente = null;
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $ultimaLetra = $row['letra_identificacion'];

            if ($ultimaLetra === null) {
                $letraCorrespondiente = 'B';
            } else {
                $letraCorrespondiente = chr(ord($ultimaLetra) + 1);

                if (ord($letraCorrespondiente) > ord('Z')) {
                    throw new Exception('Límite de grupos alcanzado');
                }
            }
        }
        
        $stmt->close();
        
        $turnoTexto = $turno === 'M' ? 'Matutino' : 'Nocturno';
        
        echo json_encode([
            'success' => true,
            'letra' => $letraCorrespondiente,
            'turno' => $turno,
            'mensaje' => $letraCorrespondiente ? 
                "Ya existe este grupo en turno $turnoTexto, se asignará la letra $letraCorrespondiente" : 
                "Grupo disponible sin letra en turno $turnoTexto"
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
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