<?php
session_start();
include "../conexion.php";

// Validar que haya sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "No hay usuario en sesión"]);
    exit;
}

$usuario_id = $_SESSION['user_id'];

// Obtener contraseña del usuario logueado
$sql = "SELECT contraseña FROM usuarios WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

$row = $result->fetch_assoc();
$pwdBD = $row['contraseña'];

$pwdIngresada = $_POST['password'] ?? '';

// Comparar si NO están encriptadas:
if ($pwdIngresada === $pwdBD) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}

$conn->close();
