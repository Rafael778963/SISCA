<?php
session_start();
header('Content-Type: application/json');

require_once '../conexion.php';

// Obtener el periodo_id de la petición
$periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;

$response = array();

try {
    // Contar total de periodos
    $sql_periodos = "SELECT COUNT(*) as total FROM periodos";
    $result_periodos = $conn->query($sql_periodos);
    $total_periodos = $result_periodos->fetch_assoc()['total'];

    // Contar total de docentes activos (SIEMPRE el total, no filtrado por periodo)
    $sql_docentes = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo'";
    $result_docentes = $conn->query($sql_docentes);
    $total_docentes = $result_docentes->fetch_assoc()['total'];

    // Si no hay periodo seleccionado, devolver totales generales
    if (!$periodo_id) {
        // Contar total de grupos activos
        $sql_grupos = "SELECT COUNT(*) as total FROM grupos WHERE estado = 'activo'";
        $result_grupos = $conn->query($sql_grupos);
        $total_grupos = $result_grupos->fetch_assoc()['total'];
    } else {
        // Contar grupos del periodo específico
        $sql_grupos = "SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ? AND estado = 'activo'";
        $stmt_grupos = $conn->prepare($sql_grupos);
        $stmt_grupos->bind_param("i", $periodo_id);
        $stmt_grupos->execute();
        $result_grupos = $stmt_grupos->get_result();
        $total_grupos = $result_grupos->fetch_assoc()['total'];
        $stmt_grupos->close();
    }

    $response = array(
        'success' => true,
        'data' => array(
            'periodos' => $total_periodos,
            'grupos' => $total_grupos,
            'docentes' => $total_docentes
        )
    );

} catch (Exception $e) {
    $response = array(
        'success' => false,
        'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
    );
}

$conn->close();
echo json_encode($response);
?>
