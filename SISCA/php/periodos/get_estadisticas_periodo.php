<?php
session_start();
header('Content-Type: application/json');

require_once '../conexion.php';

$periodo_id = isset($_GET['periodo_id']) ? intval($_GET['periodo_id']) : null;

$response = array();

try {
    $sql_periodos = "SELECT COUNT(*) as total FROM periodos";
    $result_periodos = $conn->query($sql_periodos);
    $total_periodos = $result_periodos->fetch_assoc()['total'];

    if (!$periodo_id) {
        $sql_grupos = "SELECT COUNT(*) as total FROM grupos WHERE estado = 'activo'";
        $result_grupos = $conn->query($sql_grupos);
        $total_grupos = $result_grupos->fetch_assoc()['total'];

        $sql_docentes = "SELECT COUNT(*) as total FROM docentes WHERE estado = 'activo'";
        $result_docentes = $conn->query($sql_docentes);
        $total_docentes = $result_docentes->fetch_assoc()['total'];

        $sql_carga_docentes = "SELECT COUNT(DISTINCT docente_id) as total
                               FROM carga_academica
                               WHERE estado = 'activo'";
        $result_carga = $conn->query($sql_carga_docentes);
        $total_carga_docentes = $result_carga->fetch_assoc()['total'];
    } else {
        $sql_grupos = "SELECT COUNT(*) as total FROM grupos WHERE periodo_id = ? AND estado = 'activo'";
        $stmt_grupos = $conn->prepare($sql_grupos);
        $stmt_grupos->bind_param("i", $periodo_id);
        $stmt_grupos->execute();
        $result_grupos = $stmt_grupos->get_result();
        $total_grupos = $result_grupos->fetch_assoc()['total'];
        $stmt_grupos->close();

        $sql_docentes = "SELECT COUNT(*) as total FROM docentes WHERE periodo_id = ? AND estado = 'activo'";
        $stmt_docentes = $conn->prepare($sql_docentes);
        $stmt_docentes->bind_param("i", $periodo_id);
        $stmt_docentes->execute();
        $result_docentes = $stmt_docentes->get_result();
        $total_docentes = $result_docentes->fetch_assoc()['total'];
        $stmt_docentes->close();

        $sql_carga_docentes = "SELECT COUNT(DISTINCT docente_id) as total
                               FROM carga_academica
                               WHERE periodo_id = ? AND estado = 'activo'";
        $stmt_carga = $conn->prepare($sql_carga_docentes);
        $stmt_carga->bind_param("i", $periodo_id);
        $stmt_carga->execute();
        $result_carga = $stmt_carga->get_result();
        $total_carga_docentes = $result_carga->fetch_assoc()['total'];
        $stmt_carga->close();
    }

    $response = array(
        'success' => true,
        'data' => array(
            'periodos' => $total_periodos,
            'grupos' => $total_grupos,
            'docentes' => $total_docentes,
            'carga_docentes' => $total_carga_docentes
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
