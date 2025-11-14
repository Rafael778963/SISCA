<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $periodo_id = intval($_POST['periodo_id'] ?? 0);
        $docente_id = intval($_POST['docente_id'] ?? 0);
        $programa_materia_id = intval($_POST['programa_materia_id'] ?? 0);
        $grupo_id = intval($_POST['grupo_id'] ?? 0);
        $horas_asignadas = intval($_POST['horas_asignadas'] ?? 0);
        $observaciones = trim($_POST['observaciones'] ?? '');

        // Validaciones
        if ($periodo_id <= 0) {
            throw new Exception('Periodo no válido');
        }
        if ($docente_id <= 0) {
            throw new Exception('Docente no válido');
        }
        if ($programa_materia_id <= 0) {
            throw new Exception('Materia no válida');
        }
        if ($grupo_id <= 0) {
            throw new Exception('Grupo no válido');
        }
        if ($horas_asignadas < 0) {
            throw new Exception('Las horas asignadas deben ser un número positivo');
        }

        // Verificar que el periodo existe y está activo
        $stmt = $conn->prepare("SELECT id FROM periodos WHERE id = ? AND activo = 1");
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception('El periodo seleccionado no existe o no está activo');
        }
        $stmt->close();

        // Verificar que el docente existe y está activo
        $stmt = $conn->prepare("SELECT id FROM docentes WHERE id = ? AND estado = 'activo'");
        $stmt->bind_param("i", $docente_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception('El docente seleccionado no existe o no está activo');
        }
        $stmt->close();

        // Verificar que la materia existe y está activa
        $stmt = $conn->prepare("SELECT id FROM programa_materias WHERE id = ? AND activo = 1");
        $stmt->bind_param("i", $programa_materia_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception('La materia seleccionada no existe o no está activa');
        }
        $stmt->close();

        // Verificar que el grupo existe y está activo
        $stmt = $conn->prepare("SELECT id FROM grupos WHERE id = ? AND estado = 'activo'");
        $stmt->bind_param("i", $grupo_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            throw new Exception('El grupo seleccionado no existe o no está activo');
        }
        $stmt->close();

        // Verificar si ya existe esta asignación (unique constraint)
        $stmt = $conn->prepare("
            SELECT id FROM carga_academica
            WHERE periodo_id = ? AND docente_id = ? AND programa_materia_id = ? AND grupo_id = ?
        ");
        $stmt->bind_param("iiii", $periodo_id, $docente_id, $programa_materia_id, $grupo_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception('Esta asignación ya existe para el docente, materia y grupo en este periodo');
        }
        $stmt->close();

        // Obtener el ID del usuario que realiza la asignación
        $usuario_asigno_id = $_SESSION['usuario_id'] ?? null;

        // Insertar la carga académica
        $stmt = $conn->prepare("
            INSERT INTO carga_academica
            (periodo_id, docente_id, programa_materia_id, grupo_id, horas_asignadas, observaciones, usuario_asigno_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iiiissi", $periodo_id, $docente_id, $programa_materia_id, $grupo_id, $horas_asignadas, $observaciones, $usuario_asigno_id);

        if ($stmt->execute()) {
            $idInsertado = $stmt->insert_id;

            // Obtener información completa de la carga insertada
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
            $stmt->bind_param("i", $idInsertado);
            $stmt->execute();
            $result = $stmt->get_result();
            $carga = $result->fetch_assoc();

            echo json_encode([
                'success' => true,
                'message' => 'Carga académica guardada exitosamente',
                'data' => $carga
            ]);
        } else {
            throw new Exception('Error al guardar la carga académica: ' . $stmt->error);
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
