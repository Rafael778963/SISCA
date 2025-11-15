<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $docente_id = isset($_POST['docente_id']) ? intval($_POST['docente_id']) : 0;
        $materia_id = isset($_POST['materia_id']) ? intval($_POST['materia_id']) : 0;
        $grupo_id = isset($_POST['grupo_id']) ? intval($_POST['grupo_id']) : 0;
        $periodo_id = isset($_POST['periodo_id']) ? intval($_POST['periodo_id']) : 0;
        $estado = isset($_POST['estado']) ? $_POST['estado'] : 'activo';
        $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : null;

        // Validaciones básicas
        if ($id <= 0 || $docente_id <= 0 || $materia_id <= 0 || $grupo_id <= 0 || $periodo_id <= 0) {
            throw new Exception('Todos los campos son obligatorios');
        }

        // Validar que la asignación existe
        $stmt = $conn->prepare("SELECT id FROM asignaciones WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception('La asignación no existe');
        }
        $stmt->close();

        // Validar que no exista otra asignación con los mismos datos (excepto la actual)
        $stmt = $conn->prepare("
            SELECT id FROM asignaciones
            WHERE docente_id = ? AND materia_id = ? AND grupo_id = ? AND periodo_id = ? AND id != ?
        ");
        $stmt->bind_param("iiiii", $docente_id, $materia_id, $grupo_id, $periodo_id, $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            throw new Exception('Ya existe otra asignación con estos mismos datos');
        }
        $stmt->close();

        // Actualizar la asignación
        $stmt = $conn->prepare("
            UPDATE asignaciones
            SET docente_id = ?, materia_id = ?, grupo_id = ?, periodo_id = ?, estado = ?, observaciones = ?
            WHERE id = ?
        ");
        $stmt->bind_param("iiiissi", $docente_id, $materia_id, $grupo_id, $periodo_id, $estado, $observaciones, $id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Asignación actualizada exitosamente',
                'data' => [
                    'id' => $id,
                    'docente_id' => $docente_id,
                    'materia_id' => $materia_id,
                    'grupo_id' => $grupo_id,
                    'periodo_id' => $periodo_id,
                    'estado' => $estado,
                    'observaciones' => $observaciones
                ]
            ]);
        } else {
            throw new Exception('Error al actualizar la asignación: ' . $stmt->error);
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
