<?php
include '../session_check.php';
include '../conexion.php';

try {
    
    
    
    $data = [
        'turnos' => [],
        'regimenes' => []
    ];
    
    
    
    
    $turnosResult = $conn->query("SELECT DISTINCT turno FROM docentes WHERE turno IS NOT NULL AND turno != '' ORDER BY turno");
    
    if ($turnosResult) {
        while ($row = $turnosResult->fetch_assoc()) {
            $data['turnos'][] = $row['turno'];
        }
    }
    
    
    
    
    $regimenesResult = $conn->query("SELECT DISTINCT regimen FROM docentes WHERE regimen IS NOT NULL AND regimen != '' ORDER BY regimen");
    
    if ($regimenesResult) {
        while ($row = $regimenesResult->fetch_assoc()) {
            $data['regimenes'][] = $row['regimen'];
        }
    }
    
    
    
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>