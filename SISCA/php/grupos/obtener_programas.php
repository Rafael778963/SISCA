<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $nivel = isset($_GET['nivel']) ? trim($_GET['nivel']) : '';

        if (empty($nivel)) {
            $sql = "SELECT id, nomenclatura, nombre, nivel, activo
                    FROM programas
                    WHERE activo = 1
                    ORDER BY nivel, nombre";

            $result = $conn->query($sql);
            
            $programasPorNivel = [
                'TSU' => [],
                'I' => [],
                'L' => []
            ];
            
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    if (isset($programasPorNivel[$row['nivel']])) {
                        $programasPorNivel[$row['nivel']][] = [
                            'id' => $row['id'],
                            'codigo' => $row['nomenclatura'],
                            'nombre' => $row['nombre'],
                            'nivel' => $row['nivel']
                        ];
                    }
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $programasPorNivel
            ]);
            
        } else {
            // Si se especifica nivel, devolver solo programas de ese nivel
            $stmt = $conn->prepare("
                SELECT id, nomenclatura, nombre, nivel, activo 
                FROM programas 
                WHERE nivel = ? AND activo = 1 
                ORDER BY nombre
            ");
            $stmt->bind_param("s", $nivel);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $programas = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $programas[] = [
                        'id' => $row['id'],
                        'codigo' => $row['nomenclatura'],
                        'nombre' => $row['nombre'],
                        'nivel' => $row['nivel']
                    ];
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $programas
            ]);
            
            $stmt->close();
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los programas: ' . $e->getMessage()
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