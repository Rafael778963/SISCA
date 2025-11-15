<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $generacion = trim($_POST['generacion']);
        $nivel = trim($_POST['nivel']);
        $programa = trim($_POST['programa']);
        $grado = trim($_POST['grado']);
        $turno = isset($_POST['turno']) ? trim($_POST['turno']) : 'M';
        $periodo_id = isset($_POST['periodo_id']) ? (int)$_POST['periodo_id'] : null;

        // Validaciones básicas
        if (empty($generacion) || empty($nivel) || empty($programa) || empty($grado)) {
            throw new Exception('Todos los campos son obligatorios');
        }

        if (empty($periodo_id)) {
            throw new Exception('Debe seleccionar un período activo antes de guardar');
        }
        
        if (strlen($generacion) !== 2 || !is_numeric($generacion)) {
            throw new Exception('La generación debe tener 2 dígitos numéricos');
        }
        
        if ($grado < 1 || $grado > 9) {
            throw new Exception('El grado debe estar entre 1 y 9');
        }
        
        // Validar turno
        if (!in_array($turno, ['M', 'N'])) {
            throw new Exception('Turno inválido. Debe ser M (Matutino) o N (Nocturno)');
        }
        
        // Generar código base del grupo
        $codigoBase = $generacion . $programa . $grado;
        
        // Buscar si ya existe ese código base con el mismo turno y obtener la siguiente letra
        $stmt = $conn->prepare("
            SELECT letra_identificacion 
            FROM grupos 
            WHERE generacion = ? 
            AND programa_educativo = ? 
            AND grado = ? 
            AND turno = ?
            ORDER BY letra_identificacion DESC 
            LIMIT 1
        ");
        $stmt->bind_param("ssss", $generacion, $programa, $grado, $turno);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $letraIdentificacion = null;
        $codigoCompleto = $codigoBase . $turno; // Agregar turno al final
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $ultimaLetra = $row['letra_identificacion'];
            
            if ($ultimaLetra === null) {
                // Si existe un grupo sin letra, el siguiente será con 'B'
                $letraIdentificacion = 'B';
            } else {
                // Incrementar la letra
                $letraIdentificacion = chr(ord($ultimaLetra) + 1);
                
                // Validar que no exceda la Z
                if (ord($letraIdentificacion) > ord('Z')) {
                    throw new Exception('Se ha alcanzado el límite de grupos con esta configuración y turno');
                }
            }
            // Insertar letra antes del turno
            $codigoCompleto = $codigoBase . $letraIdentificacion . $turno;
        }
        
        $stmt->close();
        
        // Insertar el nuevo grupo
        $stmt = $conn->prepare("
            INSERT INTO grupos (codigo_grupo, generacion, nivel_educativo, programa_educativo, grado, letra_identificacion, turno, periodo_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssssssi", $codigoCompleto, $generacion, $nivel, $programa, $grado, $letraIdentificacion, $turno, $periodo_id);
        
        if ($stmt->execute()) {
            $idInsertado = $stmt->insert_id;
            echo json_encode([
                'success' => true,
                'message' => 'Grupo guardado exitosamente',
                'data' => [
                    'id' => $idInsertado,
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
            throw new Exception('Error al guardar el grupo: ' . $stmt->error);
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