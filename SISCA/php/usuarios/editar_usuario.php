<?php
/**
 * Editar Usuario
 * Actualiza datos de usuario existente
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

// Solo Admin puede editar usuarios
if ($_SESSION['area'] !== 'Admin') {
    echo json_encode([
        'success' => false,
        'message' => 'No tiene permisos para editar usuarios'
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
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$area = isset($_POST['area']) ? trim($_POST['area']) : '';
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$nombre_usuario = isset($_POST['nombre_usuario']) ? trim($_POST['nombre_usuario']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$nueva_password = isset($_POST['nueva_password']) ? $_POST['nueva_password'] : '';

// Validaciones básicas
if ($id <= 0 || empty($area) || empty($nombre) || empty($nombre_usuario)) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos'
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
    // Verificar que el usuario existe
    $checkStmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
    $checkStmt->bind_param("i", $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Verificar si el nombre de usuario ya existe (en otro usuario)
    $checkStmt = $conn->prepare("SELECT id FROM usuarios WHERE nombre_usuario = ? AND id != ?");
    $checkStmt->bind_param("si", $nombre_usuario, $id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'El nombre de usuario ya está en uso'
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Si se proporciona nueva contraseña, validar y actualizar
    if (!empty($nueva_password)) {
        // Validar longitud
        if (strlen($nueva_password) < 8) {
            echo json_encode([
                'success' => false,
                'message' => 'La contraseña debe tener al menos 8 caracteres'
            ]);
            exit;
        }

        // Validar complejidad
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', $nueva_password)) {
            echo json_encode([
                'success' => false,
                'message' => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            ]);
            exit;
        }

        // Hashear nueva contraseña
        $password_hash = password_hash($nueva_password, PASSWORD_BCRYPT, ['cost' => 10]);

        // Actualizar con nueva contraseña
        $stmt = $conn->prepare("
            UPDATE usuarios
            SET area = ?, nombre = ?, nombre_usuario = ?, email = ?, contraseña_hash = ?, debe_cambiar_password = 0
            WHERE id = ?
        ");
        $stmt->bind_param("sssssi", $area, $nombre, $nombre_usuario, $email, $password_hash, $id);

    } else {
        // Actualizar sin cambiar contraseña
        $stmt = $conn->prepare("
            UPDATE usuarios
            SET area = ?, nombre = ?, nombre_usuario = ?, email = ?
            WHERE id = ?
        ");
        $stmt->bind_param("ssssi", $area, $nombre, $nombre_usuario, $email, $id);
    }

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar usuario: ' . $stmt->error);
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
