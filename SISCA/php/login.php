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

$conn = new mysqli("localhost", "root", "", "sisca");

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexion a la base de datos'
    ]);
    exit;
}

$conn->set_charset("utf8");

// Primero buscar al usuario
$stmt = $conn->prepare("SELECT id, area, nombre, nombre_usuario, contraseña_hash, debe_cambiar_password, intentos_fallidos, bloqueado FROM usuarios WHERE nombre_usuario = ? AND activo = 1");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("s", $usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user_data = $result->fetch_assoc();

    // Verificar si el usuario está bloqueado
    if ($user_data['bloqueado'] == 1) {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario bloqueado. Contacte al administrador.'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }

    // Verificar contraseña hasheada
    if (password_verify($password, $user_data['contraseña_hash'])) {
        // Contraseña correcta

        // Resetear intentos fallidos
        $resetStmt = $conn->prepare("UPDATE usuarios SET intentos_fallidos = 0, ultimo_acceso = NOW() WHERE id = ?");
        $resetStmt->bind_param("i", $user_data['id']);
        $resetStmt->execute();
        $resetStmt->close();

        // Regenerar ID de sesión para prevenir session fixation
        session_regenerate_id(true);

        $_SESSION['user_id'] = $user_data['id'];
        $_SESSION['username'] = $user_data['nombre_usuario'];
        $_SESSION['username_name'] = $user_data['nombre'];
        $_SESSION['area'] = $user_data['area'];
        $_SESSION['logged_in'] = true;
        $_SESSION['last_activity'] = time();
        $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
        $_SESSION['user_agent'] = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';

        // Verificar si debe cambiar contraseña
        if ($user_data['debe_cambiar_password'] == 1) {
            $_SESSION['debe_cambiar_password'] = true;
            echo json_encode([
                'success' => true,
                'redirect' => 'cambiar_password.html',
                'message' => 'Debe cambiar su contraseña',
                'force_password_change' => true
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'redirect' => 'index.html',
                'message' => 'Login exitoso'
            ]);
        }
    } else {
        // Contraseña incorrecta

        // Incrementar intentos fallidos
        $intentos = $user_data['intentos_fallidos'] + 1;
        $bloqueado = ($intentos >= 5) ? 1 : 0;

        $updateStmt = $conn->prepare("UPDATE usuarios SET intentos_fallidos = ?, bloqueado = ?, fecha_bloqueo = IF(? = 1, NOW(), NULL) WHERE id = ?");
        $updateStmt->bind_param("iiii", $intentos, $bloqueado, $bloqueado, $user_data['id']);
        $updateStmt->execute();
        $updateStmt->close();

        if ($bloqueado) {
            echo json_encode([
                'success' => false,
                'message' => 'Usuario bloqueado por múltiples intentos fallidos. Contacte al administrador.'
            ]);
        } else {
            $intentosRestantes = 5 - $intentos;
            echo json_encode([
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos. Intentos restantes: ' . $intentosRestantes
            ]);
        }
    }
} else {
    // Usuario no encontrado
    echo json_encode([
        'success' => false,
        'message' => 'Usuario o contraseña incorrectos'
    ]);
}

$stmt->close();
$conn->close();
?>