<?php
/**
 * Cambiar Contraseña
 * Permite al usuario cambiar su propia contraseña
 */

session_start();
require_once '../conexion.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar autenticación
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    echo json_encode([
        'success' => false,
        'message' => 'No autorizado'
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

$password_actual = isset($_POST['password_actual']) ? $_POST['password_actual'] : '';
$password_nueva = isset($_POST['password_nueva']) ? $_POST['password_nueva'] : '';
$password_confirmar = isset($_POST['password_confirmar']) ? $_POST['password_confirmar'] : '';

// Validaciones
if (empty($password_actual) || empty($password_nueva) || empty($password_confirmar)) {
    echo json_encode([
        'success' => false,
        'message' => 'Todos los campos son obligatorios'
    ]);
    exit;
}

if ($password_nueva !== $password_confirmar) {
    echo json_encode([
        'success' => false,
        'message' => 'Las contraseñas nuevas no coinciden'
    ]);
    exit;
}

// Validar longitud
if (strlen($password_nueva) < 8) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 8 caracteres'
    ]);
    exit;
}

// Validar complejidad
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/', $password_nueva)) {
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ]);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];

    // Obtener contraseña actual del usuario
    $stmt = $conn->prepare("SELECT contraseña_hash FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }

    $user_data = $result->fetch_assoc();
    $stmt->close();

    // Verificar contraseña actual
    if (!password_verify($password_actual, $user_data['contraseña_hash'])) {
        echo json_encode([
            'success' => false,
            'message' => 'La contraseña actual es incorrecta'
        ]);
        $conn->close();
        exit;
    }

    // Verificar que la nueva contraseña sea diferente de la actual
    if (password_verify($password_nueva, $user_data['contraseña_hash'])) {
        echo json_encode([
            'success' => false,
            'message' => 'La nueva contraseña debe ser diferente de la actual'
        ]);
        $conn->close();
        exit;
    }

    // Hashear nueva contraseña
    $password_hash = password_hash($password_nueva, PASSWORD_BCRYPT, ['cost' => 10]);

    if (!$password_hash) {
        throw new Exception('Error al generar hash de contraseña');
    }

    // Actualizar contraseña
    $updateStmt = $conn->prepare("
        UPDATE usuarios
        SET contraseña_hash = ?, debe_cambiar_password = 0
        WHERE id = ?
    ");

    if (!$updateStmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    $updateStmt->bind_param("si", $password_hash, $user_id);

    if ($updateStmt->execute()) {
        // Limpiar flag de cambio de contraseña en sesión
        unset($_SESSION['debe_cambiar_password']);

        echo json_encode([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    } else {
        throw new Exception('Error al actualizar contraseña: ' . $updateStmt->error);
    }

    $updateStmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
