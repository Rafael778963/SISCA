<?php
include '../session_check.php';
include '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

if (!isset($_POST['periodo_id']) || empty($_POST['periodo_id'])) {
    echo json_encode(['success' => false, 'message' => 'Período no especificado']);
    exit;
}

$periodo_id = intval($_POST['periodo_id']);
$usuario = $_SESSION['username'] ?? 'Sistema';

$sql_check = "SELECT id FROM periodos WHERE id = ?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("i", $periodo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Período inválido']);
    exit;
}
$stmt->close();

$base_dir = '../../PDFs/horarios/';
$absolute_dir = __DIR__ . '/../../PDFs/horarios/';

if (!is_dir($absolute_dir)) {
    if (!mkdir($absolute_dir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el directorio de almacenamiento']);
        exit;
    }
}

$periodo_dir = $absolute_dir . 'periodo_' . $periodo_id . '/';
if (!is_dir($periodo_dir)) {
    if (!mkdir($periodo_dir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el directorio del período']);
        exit;
    }
}

$archivos_guardados = [];
$errores = [];
$max_file_size = 50 * 1024 * 1024;

if (!isset($_FILES['files']) || empty($_FILES['files']['name'][0])) {
    echo json_encode(['success' => false, 'message' => 'No se seleccionaron archivos']);
    exit;
}

$files_count = count($_FILES['files']['name']);

for ($i = 0; $i < $files_count; $i++) {
    $file_name = $_FILES['files']['name'][$i];
    $file_tmp = $_FILES['files']['tmp_name'][$i];
    $file_error = $_FILES['files']['error'][$i];
    $file_size = $_FILES['files']['size'][$i];

    if ($file_error !== UPLOAD_ERR_OK) {
        $errores[] = "Error al cargar '$file_name': código de error $file_error";
        continue;
    }

    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    if ($file_ext !== 'pdf') {
        $errores[] = "'$file_name' no es un archivo PDF válido";
        continue;
    }

    if ($file_size > $max_file_size) {
        $errores[] = "'$file_name' excede el tamaño máximo permitido (50MB)";
        continue;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file_tmp);
    finfo_close($finfo);

    if ($mime_type !== 'application/pdf') {
        $errores[] = "'$file_name' no es un PDF válido (MIME: $mime_type)";
        continue;
    }

    $timestamp = time();
    $random_str = substr(md5(uniqid()), 0, 8);
    $nombre_original = pathinfo($file_name, PATHINFO_FILENAME);
    $nombre_guardado = $nombre_original . '_' . $timestamp . '_' . $random_str . '.pdf';

    $ruta_destino = $periodo_dir . $nombre_guardado;
    $ruta_relativa = $base_dir . 'periodo_' . $periodo_id . '/' . $nombre_guardado;

    if (!move_uploaded_file($file_tmp, $ruta_destino)) {
        $errores[] = "No se pudo guardar '$file_name'";
        continue;
    }

    $sql_insert = "INSERT INTO horarios (periodo_id, nombre_archivo, nombre_guardado, ruta_archivo, tamaño, usuario_carga)
                   VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql_insert);
    if (!$stmt) {
        $errores[] = "Error en la base de datos para '$file_name': " . $conn->error;
        @unlink($ruta_destino);
        continue;
    }

    $stmt->bind_param("isssii", $periodo_id, $file_name, $nombre_guardado, $ruta_relativa, $file_size, $usuario);

    if ($stmt->execute()) {
        $archivos_guardados[] = [
            'id' => $stmt->insert_id,
            'nombre' => $file_name,
            'tamaño' => $file_size,
            'ruta' => $ruta_relativa
        ];
    } else {
        $errores[] = "Error al registrar '$file_name' en BD: " . $stmt->error;
        @unlink($ruta_destino);
    }

    $stmt->close();
}

$response = [
    'success' => count($archivos_guardados) > 0,
    'guardados' => $archivos_guardados,
    'total_guardados' => count($archivos_guardados),
    'total_intentos' => $files_count,
    'errores' => $errores
];

if (count($errores) > 0) {
    $response['message'] = count($archivos_guardados) > 0 
        ? 'Se guardaron ' . count($archivos_guardados) . ' archivo(s), pero hubo errores'
        : 'No se pudo guardar ningún archivo';
} else {
    $response['message'] = 'Se guardaron ' . count($archivos_guardados) . ' archivo(s) correctamente';
}

$conn->close();
echo json_encode($response);
?>
