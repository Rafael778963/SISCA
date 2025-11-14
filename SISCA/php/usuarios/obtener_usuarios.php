<?php
/**
 * Obtener Usuarios
 * Lista todos los usuarios del sistema
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

// Solo Admin puede ver lista de usuarios
if ($_SESSION['area'] !== 'Admin') {
    echo json_encode([
        'success' => false,
        'message' => 'No tiene permisos para ver usuarios'
    ]);
    exit;
}

try {
    // Obtener parámetros de paginación
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;

    // Filtros opcionales
    $area_filter = isset($_GET['area']) ? trim($_GET['area']) : '';
    $estado_filter = isset($_GET['activo']) ? intval($_GET['activo']) : -1;

    // Construir WHERE clause
    $where_conditions = [];
    $params = [];
    $types = '';

    if (!empty($area_filter)) {
        $where_conditions[] = "area = ?";
        $params[] = $area_filter;
        $types .= 's';
    }

    if ($estado_filter >= 0) {
        $where_conditions[] = "activo = ?";
        $params[] = $estado_filter;
        $types .= 'i';
    }

    $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

    // Contar total de usuarios
    $countSQL = "SELECT COUNT(*) as total FROM usuarios $where_clause";

    if (!empty($params)) {
        $countStmt = $conn->prepare($countSQL);
        $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'];
        $countStmt->close();
    } else {
        $countResult = $conn->query($countSQL);
        $total = $countResult->fetch_assoc()['total'];
    }

    // Obtener usuarios paginados
    $sql = "
        SELECT
            id,
            area,
            nombre,
            nombre_usuario,
            email,
            ultimo_acceso,
            intentos_fallidos,
            bloqueado,
            debe_cambiar_password,
            activo,
            fecha_creacion,
            fecha_modificacion
        FROM usuarios
        $where_clause
        ORDER BY id ASC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Error al preparar consulta: ' . $conn->error);
    }

    // Agregar parámetros de paginación
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = [
            'id' => $row['id'],
            'area' => $row['area'],
            'nombre' => $row['nombre'],
            'nombre_usuario' => $row['nombre_usuario'],
            'email' => $row['email'],
            'ultimo_acceso' => $row['ultimo_acceso'],
            'intentos_fallidos' => $row['intentos_fallidos'],
            'bloqueado' => $row['bloqueado'] == 1,
            'debe_cambiar_password' => $row['debe_cambiar_password'] == 1,
            'activo' => $row['activo'] == 1,
            'fecha_creacion' => $row['fecha_creacion'],
            'fecha_modificacion' => $row['fecha_modificacion']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $usuarios,
        'pagination' => [
            'total' => intval($total),
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);

    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
