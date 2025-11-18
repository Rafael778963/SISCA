<?php
// ============================================
// GUARDAR NUEVO PERIODO
// ============================================

include '../session_check.php';
include '../conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $periodo = trim($_POST['periodo'] ?? '');
    $anio = (int)($_POST['anio'] ?? 0);

    if (empty($periodo) || $anio <= 0) {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
        $conn->close();
        exit;
    }

    // ============================================
    // VERIFICAR SI YA EXISTE EL PERIODO
    // ============================================

    $check_stmt = $conn->prepare("SELECT id FROM periodos WHERE periodo = ? AND año = ?");
    if (!$check_stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en la consulta.']);
        $conn->close();
        exit;
    }

    $check_stmt->bind_param("si", $periodo, $anio);
    $check_stmt->execute();
    $result = $check_stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Este periodo y año ya existen.']);
        $check_stmt->close();
    } else {
        $check_stmt->close();

        // ============================================
        // INSERTAR NUEVO PERIODO
        // ============================================

        $insert_stmt = $conn->prepare("INSERT INTO periodos (periodo, año) VALUES (?, ?)");
        if (!$insert_stmt) {
            echo json_encode(['success' => false, 'message' => 'Error en la consulta.']);
            $conn->close();
            exit;
        }

        $insert_stmt->bind_param("si", $periodo, $anio);

        if ($insert_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => '¡Datos guardados correctamente!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $conn->error]);
        }

        $insert_stmt->close();
    }
}

$conn->close();
