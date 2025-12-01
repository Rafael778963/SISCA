<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = intval($_POST['id']);
        
        if (empty($id)) {
            throw new Exception('ID de grupo no especificado');
        }
        
        
        $stmt = $conn->prepare("SELECT id, codigo_grupo, estado FROM grupos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Grupo no encontrado');
        }
        
        $grupo = $result->fetch_assoc();
        
        
        if ($grupo['estado'] !== 'inactivo') {
            throw new Exception('Solo se pueden eliminar grupos inactivos. Primero da de baja el grupo.');
        }
        
        $stmt->close();
        
        
        $stmt = $conn->prepare("DELETE FROM grupos WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Grupo eliminado definitivamente',
                'data' => [
                    'id' => $id,
                    'codigo_grupo' => $grupo['codigo_grupo']
                ]
            ]);
        } else {
            throw new Exception('Error al eliminar el grupo: ' . $stmt->error);
        }
        
        $stmt->close();
        
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