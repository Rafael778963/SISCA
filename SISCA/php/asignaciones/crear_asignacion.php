<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $docente_id = isset($_POST['docente_id']) ? intval($_POST['docente_id']) : 0;
        $materia_id = isset($_POST['materia_id']) ? intval($_POST['materia_id']) : 0;
        $grupo_id = isset($_POST['grupo_id']) ? intval($_POST['grupo_id']) : 0;
        $periodo_id = isset($_POST['periodo_id']) ? intval($_POST['periodo_id']) : 0;
        $observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : null;

        // Validaciones básicas
        if ($docente_id <= 0 || $materia_id <= 0 || $grupo_id <= 0 || $periodo_id <= 0) {
            throw new Exception('Todos los campos son obligatorios');
        }

        // Validar que el docente existe
        $stmt = $conn->prepare("SELECT id, nombre_docente FROM docentes WHERE id = ? AND estado = 'activo'");
        $stmt->bind_param("i", $docente_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception('El docente seleccionado no existe o está inactivo');
        }
        $docente = $result->fetch_assoc();
        $stmt->close();

        // Validar que la materia existe
        $stmt = $conn->prepare("SELECT id, nombre_materia, cve_materia FROM programa_materias WHERE id = ? AND activo = 1");
        $stmt->bind_param("i", $materia_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception('La materia seleccionada no existe o está inactiva');
        }
        $materia = $result->fetch_assoc();
        $stmt->close();

        // Validar que el grupo existe
        $stmt = $conn->prepare("SELECT id, codigo_grupo FROM grupos WHERE id = ? AND estado = 'activo'");
        $stmt->bind_param("i", $grupo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception('El grupo seleccionado no existe o está inactivo');
        }
        $grupo = $result->fetch_assoc();
        $stmt->close();

        // Validar que el periodo existe
        $stmt = $conn->prepare("SELECT id, periodo FROM periodos WHERE id = ?");
        $stmt->bind_param("i", $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            throw new Exception('El periodo seleccionado no existe');
        }
        $periodo = $result->fetch_assoc();
        $stmt->close();

        // Verificar que no exista ya esta asignación
        $stmt = $conn->prepare("SELECT id FROM asignaciones WHERE docente_id = ? AND materia_id = ? AND grupo_id = ? AND periodo_id = ?");
        $stmt->bind_param("iiii", $docente_id, $materia_id, $grupo_id, $periodo_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            throw new Exception('Esta asignación ya existe');
        }
        $stmt->close();

        // Insertar la nueva asignación
        $stmt = $conn->prepare("
            INSERT INTO asignaciones (docente_id, materia_id, grupo_id, periodo_id, observaciones)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iiiis", $docente_id, $materia_id, $grupo_id, $periodo_id, $observaciones);

        if ($stmt->execute()) {
            $idInsertado = $stmt->insert_id;
            echo json_encode([
                'success' => true,
                'message' => 'Asignación creada exitosamente',
                'data' => [
                    'id' => $idInsertado,
                    'docente_id' => $docente_id,
                    'docente_nombre' => $docente['nombre_docente'],
                    'materia_id' => $materia_id,
                    'materia_nombre' => $materia['nombre_materia'],
                    'materia_cve' => $materia['cve_materia'],
                    'grupo_id' => $grupo_id,
                    'grupo_codigo' => $grupo['codigo_grupo'],
                    'periodo_id' => $periodo_id,
                    'periodo_nombre' => $periodo['periodo'],
                    'observaciones' => $observaciones
                ]
            ]);
        } else {
            throw new Exception('Error al crear la asignación: ' . $stmt->error);
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
