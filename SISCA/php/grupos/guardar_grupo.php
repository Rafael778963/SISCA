<?php
include '../session_check.php';
include '../conexion.php';
include 'funciones_letras.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $generacion = trim($_POST['generacion']);
        $nivel = trim($_POST['nivel']);
        $programa = trim($_POST['programa']);
        $grado = trim($_POST['grado']);
        $turno = isset($_POST['turno']) ? trim($_POST['turno']) : 'M';
        $periodo_id = isset($_POST['periodo_id']) ? (int)$_POST['periodo_id'] : null;

        
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
        
        
        if (!in_array($turno, ['M', 'N'])) {
            throw new Exception('Turno inválido. Debe ser M (Matutino) o N (Nocturno)');
        }
        
        
        $codigoBase = $generacion . $programa . $grado;

        
        
        $letraIdentificacion = encontrarPrimeraLetraDisponible(
            $conn,
            $generacion,
            $programa,
            $grado,
            $turno,
            $periodo_id
        );

        
        if ($letraIdentificacion !== null) {
            $codigoCompleto = $codigoBase . $letraIdentificacion . $turno;
        } else {
            
            $codigoCompleto = $codigoBase . $turno;
        }
        
        
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