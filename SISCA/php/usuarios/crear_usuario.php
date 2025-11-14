<?php
/**
 * Crear Usuario
 * Crea un nuevo usuario con contraseña hasheada
 */

session_start();
require_once '../conexion.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar autenticación y permisos
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
    ]);
    exit;
}

// Solo Admin puede crear usuarios
if ($_SESSION['area'] !== 'Admin') {
    echo json_encode([
        'success' => false,
        'message' => 'No tiene permisos para crear usuarios'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Validar datos recibidos
$area = isset($_POST['area']) ? trim($_POST['area']) : '';
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$nombre_usuario = isset($_POST['nombre_usuario']) ? trim($_POST['nombre_usuario']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : null;

// Validaciones
if (empty($area) || empty($nombre) || empty($nombre_usuario) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios'
    ]);
    exit;
}

// Validar longitud de contraseña
if (strlen($password) < 8) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 8 caracteres'
    ]);
    exit;
}

// Validar complejidad de contraseña
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', $password)) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ]);
    exit;
}

// Validar email si se proporciona
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email inválido'
    ]);
    exit;
}

try {
    // Verificar si el nombre de usuario ya existe
    $checkStmt = $conn->prepare("SELECT id FROM usuarios WHERE nombre_usuario = ?");
    $checkStmt->bind_param("s", $nombre_usuario);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'El nombre de usuario ya existe'
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Hashear contraseña con bcrypt
    $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    if (!$password_hash) {
        throw new Exception('Error al generar hash de contraseña');
    }

    // Insertar usuario
    $stmt = $conn->prepare("
        INSERT INTO usuarios (area, nombre, nombre_usuario, contraseña_hash, email, debe_cambiar_password, activo)
        VALUES (?, ?, ?, ?, ?, 0, 1)
    ");

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    $stmt->bind_param("sssss", $area, $nombre, $nombre_usuario, $password_hash, $email);

    if ($stmt->execute()) {
        $nuevo_id = $conn->insert_id;

        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'id' => $nuevo_id
        ]);
    } else {
        throw new Exception('Error al crear usuario: ' . $stmt->error);
    }

    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
