<?php
/**
 * SCRIPT DE PRUEBA Y DEBUG - REORGANIZACIÓN DE LETRAS
 *
 * Este script ayuda a probar y depurar el sistema de reorganización de letras
 *
 * USO:
 * 1. Accede a este archivo desde el navegador:
 *    http://localhost/SISCA/SISCA/php/grupos/test_reorganizacion.php
 *
 * 2. Agrega el parámetro de acción:
 *    ?accion=listar              - Ver grupos activos
 *    ?accion=simular&id=X        - Simular baja del grupo con ID X
 *    ?accion=verificar           - Verificar integridad de letras
 */

include '../conexion.php';
include 'funciones_letras.php';

// Configuración
$accion = $_GET['accion'] ?? 'listar';
$grupoId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$periodoId = isset($_GET['periodo']) ? (int)$_GET['periodo'] : null;

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug - Reorganización de Letras</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 20px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:hover { background-color: #f5f5f5; }
        .activo { color: green; font-weight: bold; }
        .inactivo { color: red; }
        .letra {
            font-weight: bold;
            font-size: 1.2em;
            color: #2196F3;
        }
        .sin-letra {
            color: #999;
            font-style: italic;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 5px;
        }
        .button:hover { background: #45a049; }
        .button.danger { background: #f44336; }
        .button.danger:hover { background: #da190b; }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
        }
        .error-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px;
            margin: 20px 0;
        }
        .success-box {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>🔧 Debug - Sistema de Reorganización de Letras</h1>

    <div class="info-box">
        <strong>Acciones disponibles:</strong><br>
        <a href="?accion=listar" class="button">📋 Listar Grupos</a>
        <a href="?accion=verificar" class="button">✔️ Verificar Integridad</a>
    </div>
</div>

<?php

// ==============================================
// ACCIÓN: LISTAR GRUPOS
// ==============================================
if ($accion === 'listar') {
    echo '<div class="container">';
    echo '<h2>Grupos Activos</h2>';

    $sql = "SELECT id, codigo_grupo, generacion, programa_educativo, grado,
                   letra_identificacion, turno, periodo_id, estado,
                   fecha_creacion, fecha_modificacion
            FROM grupos
            WHERE estado = 'activo'
            ORDER BY periodo_id, generacion, programa_educativo, grado, letra_identificacion ASC";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo '<table>';
        echo '<tr>
                <th>ID</th>
                <th>Código</th>
                <th>Gen</th>
                <th>Programa</th>
                <th>Grado</th>
                <th>Letra</th>
                <th>Turno</th>
                <th>Periodo ID</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>';

        while ($row = $result->fetch_assoc()) {
            $letra = empty($row['letra_identificacion'])
                ? '<span class="sin-letra">sin letra</span>'
                : '<span class="letra">' . $row['letra_identificacion'] . '</span>';

            $estado = $row['estado'] === 'activo'
                ? '<span class="activo">ACTIVO</span>'
                : '<span class="inactivo">INACTIVO</span>';

            echo '<tr>';
            echo '<td>' . $row['id'] . '</td>';
            echo '<td><code>' . $row['codigo_grupo'] . '</code></td>';
            echo '<td>' . $row['generacion'] . '</td>';
            echo '<td>' . $row['programa_educativo'] . '</td>';
            echo '<td>' . $row['grado'] . '</td>';
            echo '<td>' . $letra . '</td>';
            echo '<td>' . $row['turno'] . '</td>';
            echo '<td>' . ($row['periodo_id'] ?? 'NULL') . '</td>';
            echo '<td>' . $estado . '</td>';
            echo '<td><a href="?accion=simular&id=' . $row['id'] . '" class="button danger">Simular Baja</a></td>';
            echo '</tr>';
        }

        echo '</table>';
    } else {
        echo '<div class="warning-box">No hay grupos activos en la base de datos.</div>';
    }

    echo '</div>';
}

// ==============================================
// ACCIÓN: SIMULAR REORGANIZACIÓN
// ==============================================
elseif ($accion === 'simular' && $grupoId > 0) {
    echo '<div class="container">';
    echo '<h2>Simulación de Baja del Grupo ID: ' . $grupoId . '</h2>';

    // Obtener información del grupo
    $stmt = $conn->prepare("SELECT * FROM grupos WHERE id = ?");
    $stmt->bind_param("i", $grupoId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo '<div class="error-box">❌ Grupo no encontrado.</div>';
        echo '<a href="?accion=listar" class="button">← Volver</a>';
        echo '</div>';
        exit;
    }

    $grupo = $result->fetch_assoc();
    $stmt->close();

    echo '<div class="info-box">';
    echo '<strong>Grupo a dar de baja:</strong><br>';
    echo 'Código: <code>' . $grupo['codigo_grupo'] . '</code><br>';
    echo 'Letra: ' . ($grupo['letra_identificacion'] ?? 'sin letra') . '<br>';
    echo 'Periodo ID: ' . ($grupo['periodo_id'] ?? 'NULL') . '<br>';
    echo '</div>';

    // Simular: Buscar grupos que serían afectados
    if (!empty($grupo['letra_identificacion'])) {
        $stmt = $conn->prepare("
            SELECT id, codigo_grupo, letra_identificacion
            FROM grupos
            WHERE generacion = ?
            AND programa_educativo = ?
            AND grado = ?
            AND turno = ?
            AND (periodo_id = ? OR (periodo_id IS NULL AND ? IS NULL))
            AND estado = 'activo'
            AND id != ?
            AND letra_identificacion > ?
            ORDER BY letra_identificacion ASC
        ");

        $stmt->bind_param(
            "ssssiiiis",
            $grupo['generacion'],
            $grupo['programa_educativo'],
            $grupo['grado'],
            $grupo['turno'],
            $grupo['periodo_id'],
            $grupo['periodo_id'],
            $grupoId,
            $grupo['letra_identificacion']
        );

        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo '<div class="success-box">';
            echo '<strong>✅ Se reorganizarían los siguientes grupos:</strong><br><br>';
            echo '<table>';
            echo '<tr><th>ID</th><th>Código Actual</th><th>Letra Actual</th><th>Nueva Letra</th><th>Nuevo Código</th></tr>';

            $letraActual = $grupo['letra_identificacion'];
            while ($row = $result->fetch_assoc()) {
                $nuevoCodigo = $grupo['generacion'] . $grupo['programa_educativo'] . $grupo['grado'] . $letraActual . $grupo['turno'];

                echo '<tr>';
                echo '<td>' . $row['id'] . '</td>';
                echo '<td><code>' . $row['codigo_grupo'] . '</code></td>';
                echo '<td class="letra">' . $row['letra_identificacion'] . '</td>';
                echo '<td class="letra">' . $letraActual . '</td>';
                echo '<td><code>' . $nuevoCodigo . '</code></td>';
                echo '</tr>';

                $letraActual = chr(ord($letraActual) + 1);
            }

            echo '</table>';
            echo '</div>';
        } else {
            echo '<div class="warning-box">⚠️ No hay grupos para reorganizar (no hay grupos con letras mayores).</div>';
        }

        $stmt->close();
    } else {
        echo '<div class="warning-box">⚠️ Este grupo no tiene letra, no se reorganizará nada.</div>';
    }

    echo '<a href="?accion=listar" class="button">← Volver</a>';
    echo '</div>';
}

// ==============================================
// ACCIÓN: VERIFICAR INTEGRIDAD
// ==============================================
elseif ($accion === 'verificar') {
    echo '<div class="container">';
    echo '<h2>Verificación de Integridad</h2>';

    $sql = "SELECT generacion, programa_educativo, grado, turno, periodo_id,
                   GROUP_CONCAT(letra_identificacion ORDER BY letra_identificacion) as letras,
                   COUNT(*) as total
            FROM grupos
            WHERE estado = 'activo'
            GROUP BY generacion, programa_educativo, grado, turno, periodo_id
            HAVING COUNT(*) > 1";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo '<div class="info-box"><strong>Configuraciones con múltiples grupos:</strong></div>';
        echo '<table>';
        echo '<tr><th>Generación</th><th>Programa</th><th>Grado</th><th>Turno</th><th>Periodo</th><th>Letras</th><th>Total</th><th>Estado</th></tr>';

        while ($row = $result->fetch_assoc()) {
            $letras = explode(',', $row['letras']);
            $letrasLimpias = array_filter($letras, function($l) { return !empty($l); });

            // Verificar secuencia
            $secuenciaCorrecta = true;
            if (!empty($letrasLimpias)) {
                $letrasOrdenadas = $letrasLimpias;
                sort($letrasOrdenadas);

                $letraEsperada = 'B';
                foreach ($letrasOrdenadas as $letra) {
                    if ($letra !== $letraEsperada) {
                        $secuenciaCorrecta = false;
                        break;
                    }
                    $letraEsperada = chr(ord($letraEsperada) + 1);
                }
            }

            $estadoTexto = $secuenciaCorrecta
                ? '<span class="activo">✅ OK</span>'
                : '<span class="inactivo">❌ Secuencia incorrecta</span>';

            echo '<tr>';
            echo '<td>' . $row['generacion'] . '</td>';
            echo '<td>' . $row['programa_educativo'] . '</td>';
            echo '<td>' . $row['grado'] . '</td>';
            echo '<td>' . $row['turno'] . '</td>';
            echo '<td>' . ($row['periodo_id'] ?? 'NULL') . '</td>';
            echo '<td>' . (empty($row['letras']) ? 'sin letra' : $row['letras']) . '</td>';
            echo '<td>' . $row['total'] . '</td>';
            echo '<td>' . $estadoTexto . '</td>';
            echo '</tr>';
        }

        echo '</table>';
    } else {
        echo '<div class="success-box">✅ No hay configuraciones con múltiples grupos.</div>';
    }

    echo '<a href="?accion=listar" class="button">← Volver</a>';
    echo '</div>';
}

$conn->close();
?>

</body>
</html>
