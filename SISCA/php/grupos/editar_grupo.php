<?php
include '../session_check.php';
include '../conexion.php';
include 'funciones_letras.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = intval($_POST['id']);
        $generacion = trim($_POST['generacion']);
        $nivel = trim($_POST['nivel']);
        $programa = trim($_POST['programa']);
        $grado = trim($_POST['grado']);
        $turno = isset($_POST['turno']) ? trim($_POST['turno']) : 'M';
        $periodo_id = isset($_POST['periodo_id']) ? (int)$_POST['periodo_id'] : null;

        if (empty($id) || empty($generacion) || empty($nivel) || empty($programa) || empty($grado)) {
            throw new Exception('Todos los campos son obligatorios');
        }

        if ($periodo_id === null) {
            throw new Exception('El periodo_id es requerido');
        }

        if (strlen($generacion) !== 2 || !is_numeric($generacion)) {
            throw new Exception('La generación debe tener 2 dígitos numéricos');
        }

        if ($grado < 1 || $grado > 9) {
            throw new Exception('El grado debe estar entre 1 y 9');
        }

        if (!in_array($turno, ['M', 'N'])) {
            throw new Exception('Turno inválido. Debe ser M (Matutino) o N (Nocturno)');
        }

        $stmt = $conn->prepare("SELECT generacion, programa_educativo, grado, letra_identificacion, turno FROM grupos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Grupo no encontrado');
        }

        $datosActuales = $result->fetch_assoc();
        $stmt->close();

        $cambioConfiguracion = (
            $datosActuales['generacion'] !== $generacion ||
            $datosActuales['programa_educativo'] !== $programa ||
            $datosActuales['grado'] !== $grado ||
            $datosActuales['turno'] !== $turno
        );

        $codigoBase = $generacion . $programa . $grado;
        $letraIdentificacion = $datosActuales['letra_identificacion'];
        $codigoCompleto = $codigoBase . $turno;

        // ============================================
        // SI CAMBIÓ LA CONFIGURACIÓN, REORGANIZAR
        // ============================================
        if ($cambioConfiguracion) {
            // Marcar temporalmente como inactivo para evitar conflictos
            $stmtTemp = $conn->prepare("UPDATE grupos SET estado = 'inactivo' WHERE id = ?");
            $stmtTemp->bind_param("i", $id);
            $stmtTemp->execute();
            $stmtTemp->close();

            reorganizarLetrasGrupos($conn, $id);

            // Calcular letra para la nueva configuración
            $stmt = $conn->prepare("
                SELECT letra_identificacion
                FROM grupos
                WHERE generacion = ?
                AND programa_educativo = ?
                AND grado = ?
                AND turno = ?
                AND periodo_id = ?
                AND estado = 'activo'
                AND id != ?
                ORDER BY letra_identificacion DESC
                LIMIT 1
            ");
            $stmt->bind_param("ssssii", $generacion, $programa, $grado, $turno, $periodo_id, $id);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $ultimaLetra = $row['letra_identificacion'];

                if ($ultimaLetra === null) {
                    $letraIdentificacion = 'B';
                } else {
                    $letraIdentificacion = chr(ord($ultimaLetra) + 1);

                    if (ord($letraIdentificacion) > ord('Z')) {
                        throw new Exception('Se ha alcanzado el límite de grupos con esta configuración y turno');
                    }
                }
            } else {
                $letraIdentificacion = null;
            }

            $stmt->close();
        }

        if ($letraIdentificacion !== null) {
            $codigoCompleto = $codigoBase . $letraIdentificacion . $turno;
        } else {
            $codigoCompleto = $codigoBase . $turno;
        }

        $stmt = $conn->prepare("
            UPDATE grupos
            SET codigo_grupo = ?, generacion = ?, nivel_educativo = ?, programa_educativo = ?, grado = ?, letra_identificacion = ?, turno = ?, estado = 'activo'
            WHERE id = ?
        ");
        $stmt->bind_param("sssssssi", $codigoCompleto, $generacion, $nivel, $programa, $grado, $letraIdentificacion, $turno, $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Grupo actualizado exitosamente',
                'data' => [
                    'id' => $id,
                    'codigo_grupo' => $codigoCompleto,
                    'generacion' => $generacion,
                    'nivel_educativo' => $nivel,
                    'programa_educativo' => $programa,
                    'grado' => $grado,
                    'letra_identificacion' => $letraIdentificacion,
                    'turno' => $turno
                ]
            ]);
        } else {
            throw new Exception('Error al actualizar el grupo: ' . $stmt->error);
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