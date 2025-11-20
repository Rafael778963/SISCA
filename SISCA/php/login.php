<?php
ob_start();
session_start();

ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0);
ini_set('session.use_only_cookies', 1);
ob_end_clean();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Metodo no permitido'
    ]);
    exit;
}

$usuario = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';
if (empty($usuario) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Complete todos los campos'
    ]);
    exit;
}

$conn = new mysqli("sql303.infinityfree.com", "if0_40378542", "DDf99AfXCTk", "if0_40378542_sisca");

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexion a la base de datos'
    ]);
    exit;
}

$conn->set_charset("utf8");

$stmt = $conn->prepare("SELECT id, area, nombre, nombre_usuario FROM usuarios WHERE nombre_usuario = ? AND contraseña = ?");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("ss", $usuario, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user_data = $result->fetch_assoc();
    session_regenerate_id(true);
    
    $_SESSION['user_id'] = $user_data['id'];
    $_SESSION['username'] = $user_data['nombre_usuario'];
    $_SESSION['username_name'] = $user_data['nombre'];
    $_SESSION['area'] = $user_data['area'];
    $_SESSION['logged_in'] = true;
    $_SESSION['last_activity'] = time();
    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $_SESSION['user_agent'] = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    
    echo json_encode([
        'success' => true,
        'redirect' => 'index.html',
        'message' => 'Login exitoso'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Contraseña incorrectos'
    ]);
}

$stmt->close();
$conn->close();
?>