<?php
// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Si no hay periodo seleccionado, establecer el periodo más reciente
if (!isset($_SESSION['periodo_activo'])) {
    include_once 'conexion.php';

    $stmt = $conn->prepare("SELECT id, periodo, año FROM periodos ORDER BY año DESC, id DESC LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $periodo = $result->fetch_assoc();
        $_SESSION['periodo_activo'] = $periodo['id'];
        $_SESSION['periodo_nombre'] = $periodo['periodo'];
        $_SESSION['periodo_año'] = $periodo['año'];
    } else {
        // Si no hay periodos, crear uno por defecto
        $_SESSION['periodo_activo'] = 1;
        $_SESSION['periodo_nombre'] = 'Periodo no definido';
        $_SESSION['periodo_año'] = date('Y');
    }

    $stmt->close();
}

// Función para obtener el periodo activo
function get_periodo_activo() {
    return isset($_SESSION['periodo_activo']) ? $_SESSION['periodo_activo'] : 1;
}

// Función para obtener el nombre del periodo activo
function get_periodo_nombre() {
    return isset($_SESSION['periodo_nombre']) ? $_SESSION['periodo_nombre'] : 'Sin periodo';
}

// Función para obtener el año del periodo activo
function get_periodo_año() {
    return isset($_SESSION['periodo_año']) ? $_SESSION['periodo_año'] : date('Y');
}

// Función para cambiar el periodo activo
function set_periodo_activo($periodo_id, $periodo_nombre = null, $periodo_año = null) {
    $_SESSION['periodo_activo'] = $periodo_id;
    if ($periodo_nombre !== null) {
        $_SESSION['periodo_nombre'] = $periodo_nombre;
    }
    if ($periodo_año !== null) {
        $_SESSION['periodo_año'] = $periodo_año;
    }
}
?>
