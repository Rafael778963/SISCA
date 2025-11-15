<?php
include '../session_check.php';
include '../conexion.php';

try {
    // ============================================
    // ESTRUCTURA DE DATOS
    // ============================================
    $data = [
        'turnos' => [],
        'regimenes' => []
    ];
    
    // ============================================
    // OBTENER TURNOS ÚNICOS
    // ============================================
    $turnosResult = $conn->query("SELECT DISTINCT turno FROM docentes WHERE turno IS NOT NULL AND turno != '' ORDER BY turno");
    
    if ($turnosResult) {
        while ($row = $turnosResult->fetch_assoc()) {
            $data['turnos'][] = $row['turno'];
        }
    }
    
    // ============================================
    // OBTENER REGÍMENES ÚNICOS
    // ============================================
    $regimenesResult = $conn->query("SELECT DISTINCT regimen FROM docentes WHERE regimen IS NOT NULL AND regimen != '' ORDER BY regimen");
    
    if ($regimenesResult) {
        while ($row = $regimenesResult->fetch_assoc()) {
            $data['regimenes'][] = $row['regimen'];
        }
    }
    
    // ============================================
    // RESPUESTA EXITOSA
    // ============================================
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    
    //Manejo de errores
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>