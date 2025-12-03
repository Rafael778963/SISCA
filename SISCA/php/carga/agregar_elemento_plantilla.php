<?php

include '../session_check.php';
include '../conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $plantilla_id = isset($input['plantilla_id']) ? intval($input['plantilla_id']) : 0;
    $elemento_datos = isset($input['elemento_datos']) ? $input['elemento_datos'] : null;
    $usuario_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;

    if ($plantilla_id <= 0) {
        throw new Exception('ID de plantilla inválido');
    }

    if (!$elemento_datos) {
        throw new Exception('Datos del elemento requeridos');
    }

    if ($usuario_id <= 0) {
        throw new Exception('Usuario no identificado');
    }

    $campos_requeridos = ['docente_id', 'grupo_id', 'materia_id', 'turno', 'horas'];
    foreach ($campos_requeridos as $campo) {
        if (!isset($elemento_datos[$campo])) {
            throw new Exception("Campo requerido faltante: $campo");
        }
    }

    $sql = "SELECT datos_json, periodo_id FROM carga_plantillas
            WHERE id = ? AND usuario_id = ? AND estado = 'activo'";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $plantilla_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Plantilla no encontrada o sin permisos');
    }

    $row = $result->fetch_assoc();
    $periodo_id = $row['periodo_id'];
    $stmt->close();

    $datos = json_decode($row['datos_json'], true);

    if (!isset($datos['cargas']) || !is_array($datos['cargas'])) {
        $datos['cargas'] = [];
    }

    $sql_elemento = "SELECT
                        ca.id,
                        ca.periodo_id,
                        CONCAT(p.periodo, ' (', p.año, ')') as periodo,
                        ca.docente_id,
                        d.nombre_docente as docente,
                        d.turno as turno_docente,
                        d.regimen as regimen,
                        ca.grupo_id,
                        g.codigo_grupo as grupo,
                        ca.materia_id,
                        pm.cve_materia as clave_materia,
                        pm.nombre_materia as materia,
                        pm.horas_semanales as horas_plan,
                        ca.turno,
                        ca.horas,
                        ca.horas_tutoria,
                        ca.horas_estadia,
                        ca.actividades_administrativas as administrativas,
                        (ca.horas + ca.horas_tutoria + ca.horas_estadia) as total,
                        NOW() as fecha_creacion
                     FROM carga_academica ca
                     INNER JOIN periodos p ON ca.periodo_id = p.id
                     INNER JOIN docentes d ON ca.docente_id = d.id
                     INNER JOIN grupos g ON ca.grupo_id = g.id
                     INNER JOIN programa_materias pm ON ca.materia_id = pm.id
                     WHERE ca.docente_id = ?
                       AND ca.grupo_id = ?
                       AND ca.materia_id = ?
                       AND ca.periodo_id = ?
                       AND ca.estado = 'activo'
                     LIMIT 1";

    $stmt_elemento = $conn->prepare($sql_elemento);
    $stmt_elemento->bind_param('iiii',
        $elemento_datos['docente_id'],
        $elemento_datos['grupo_id'],
        $elemento_datos['materia_id'],
        $periodo_id
    );
    $stmt_elemento->execute();
    $result_elemento = $stmt_elemento->get_result();

    if ($result_elemento->num_rows > 0) {
        $nuevo_elemento = $result_elemento->fetch_assoc();
    } else {
        $nuevo_elemento = array_merge([
            'id' => null,
            'periodo_id' => $periodo_id,
            'periodo' => '',
            'horas_tutoria' => 0,
            'horas_estadia' => 0,
            'administrativas' => '',
            'total' => 0,
            'fecha_creacion' => date('Y-m-d H:i:s')
        ], $elemento_datos);
    }
    $stmt_elemento->close();

    $datos['cargas'][] = $nuevo_elemento;

    $datos['total_registros'] = count($datos['cargas']);
    $datos['fecha_guardado'] = date('Y-m-d\TH:i:s.v\Z');

    $datos_json = json_encode($datos);

    $sql_update = "UPDATE carga_plantillas
                   SET datos_json = ?,
                       fecha_modificacion = NOW()
                   WHERE id = ? AND usuario_id = ?";

    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param('sii', $datos_json, $plantilla_id, $usuario_id);

    if (!$stmt_update->execute()) {
        throw new Exception('Error al actualizar la plantilla');
    }

    $stmt_update->close();

    echo json_encode([
        'success' => true,
        'message' => 'Elemento agregado correctamente',
        'datos' => $datos,
        'nuevo_elemento' => $nuevo_elemento
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
