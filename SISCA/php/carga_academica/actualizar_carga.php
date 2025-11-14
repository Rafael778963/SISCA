<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = intval($_POST['id'] ?? 0);
        $horas_asignadas = intval($_POST['horas_asignadas'] ?? 0);
        $observaciones = trim($_POST['observaciones'] ?? '');
        $estado = trim($_POST['estado'] ?? 'activo');

        // Validaciones
        if ($id <= 0) {
            throw new Exception('ID no válido');
        }

        if ($horas_asignadas < 0) {
            throw new Exception('Las horas asignadas deben ser un número positivo');
        }

        if (!in_array($estado, ['activo', 'cancelado', 'completado'])) {
            throw new Exception('Estado no válido. Debe ser: activo, cancelado o completado');
        }

        // Verificar que la carga académica existe
        $stmt = $conn->prepare("SELECT id FROM carga_academica WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception('La carga académica no existe');
        }
        $stmt->close();

        // Actualizar la carga académica
        $stmt = $conn->prepare("
            UPDATE carga_academica
            SET horas_asignadas = ?,
                observaciones = ?,
                estado = ?
            WHERE id = ?
        ");
        $stmt->bind_param("issi", $horas_asignadas, $observaciones, $estado, $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                // Obtener información completa de la carga actualizada
                $stmt = $conn->prepare("
                    SELECT ca.*,
                           d.nombre_docente,
                           pm.nombre_materia,
                           g.codigo_grupo,
                           p.periodo, p.año
                    FROM carga_academica ca
                    INNER JOIN docentes d ON ca.docente_id = d.id
                    INNER JOIN programa_materias pm ON ca.programa_materia_id = pm.id
                    INNER JOIN grupos g ON ca.grupo_id = g.id
                    INNER JOIN periodos p ON ca.periodo_id = p.id
                    WHERE ca.id = ?
                ");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $carga = $result->fetch_assoc();

                echo json_encode([
                    'success' => true,
                    'message' => 'Carga académica actualizada exitosamente',
                    'data' => $carga
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => 'No se realizaron cambios (los datos son idénticos)'
                ]);
            }
        } else {
            throw new Exception('Error al actualizar la carga académica: ' . $stmt->error);
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
