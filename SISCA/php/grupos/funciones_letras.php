<?php
/**
 * FUNCIONES DE REORGANIZACIÓN DE LETRAS DE GRUPOS
 *
 * Este archivo contiene funciones para reorganizar las letras de identificación
 * de los grupos cuando uno se da de baja, manteniendo un orden en cascada.
 */

/**
 * Reorganiza las letras de los grupos en cascada cuando uno se da de baja
 *
 * @param mysqli $conn - Conexión a la base de datos
 * @param int $grupoId - ID del grupo que se está dando de baja
 * @return bool - true si se reorganizó exitosamente, false si no
 * @throws Exception
 */
function reorganizarLetrasGrupos($conn, $grupoId) {
    // Obtener información del grupo que se está dando de baja
    $stmt = $conn->prepare("
        SELECT generacion, programa_educativo, grado, turno, letra_identificacion, periodo_id
        FROM grupos
        WHERE id = ?
    ");
    $stmt->bind_param("i", $grupoId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        return false;
    }

    $grupoBaja = $result->fetch_assoc();
    $stmt->close();

    // Si el grupo no tiene letra, no hay nada que reorganizar
    if (empty($grupoBaja['letra_identificacion'])) {
        return true;
    }

    // Obtener todos los grupos ACTIVOS con la misma configuración
    // y con letra mayor a la del grupo que se está dando de baja
    // IMPORTANTE: Excluir el grupo que se está dando de baja
    $stmt = $conn->prepare("
        SELECT id, letra_identificacion, codigo_grupo
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
        $grupoBaja['generacion'],
        $grupoBaja['programa_educativo'],
        $grupoBaja['grado'],
        $grupoBaja['turno'],
        $grupoBaja['periodo_id'],
        $grupoBaja['periodo_id'],
        $grupoId,
        $grupoBaja['letra_identificacion']
    );

    $stmt->execute();
    $result = $stmt->get_result();
    $gruposReorganizar = [];

    while ($row = $result->fetch_assoc()) {
        $gruposReorganizar[] = $row;
    }
    $stmt->close();

    // Si no hay grupos para reorganizar, salir
    if (empty($gruposReorganizar)) {
        return true;
    }

    // Reorganizar las letras en cascada
    $letraActual = $grupoBaja['letra_identificacion'];

    foreach ($gruposReorganizar as $grupo) {
        $nuevaLetra = $letraActual;

        // Generar nuevo código de grupo
        $codigoBase = $grupoBaja['generacion'] .
                     $grupoBaja['programa_educativo'] .
                     $grupoBaja['grado'];
        $nuevoCodigo = $codigoBase . $nuevaLetra . $grupoBaja['turno'];

        // Actualizar el grupo con la nueva letra y código
        $stmtUpdate = $conn->prepare("
            UPDATE grupos
            SET letra_identificacion = ?,
                codigo_grupo = ?
            WHERE id = ?
        ");
        $stmtUpdate->bind_param("ssi", $nuevaLetra, $nuevoCodigo, $grupo['id']);

        if (!$stmtUpdate->execute()) {
            $stmtUpdate->close();
            throw new Exception("Error al reorganizar grupo con ID: " . $grupo['id']);
        }

        $stmtUpdate->close();

        // Pasar a la siguiente letra
        $letraActual = chr(ord($letraActual) + 1);
    }

    return true;
}

/**
 * Encuentra la primera letra disponible para un nuevo grupo
 *
 * @param mysqli $conn - Conexión a la base de datos
 * @param string $generacion
 * @param string $programa
 * @param string $grado
 * @param string $turno
 * @param int $periodoId
 * @return string|null - La letra disponible o null si no hay letra (primer grupo)
 */
function encontrarPrimeraLetraDisponible($conn, $generacion, $programa, $grado, $turno, $periodoId) {
    // Obtener todas las letras usadas para esta configuración (SOLO ACTIVOS)
    $stmt = $conn->prepare("
        SELECT letra_identificacion
        FROM grupos
        WHERE generacion = ?
        AND programa_educativo = ?
        AND grado = ?
        AND turno = ?
        AND (periodo_id = ? OR (periodo_id IS NULL AND ? IS NULL))
        AND estado = 'activo'
        ORDER BY letra_identificacion ASC
    ");

    $stmt->bind_param("ssssii", $generacion, $programa, $grado, $turno, $periodoId, $periodoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $letrasUsadas = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['letra_identificacion'])) {
            $letrasUsadas[] = $row['letra_identificacion'];
        }
    }
    $stmt->close();

    // Si no hay letras usadas, verificar si existe un grupo sin letra
    if (empty($letrasUsadas)) {
        $stmtSinLetra = $conn->prepare("
            SELECT id
            FROM grupos
            WHERE generacion = ?
            AND programa_educativo = ?
            AND grado = ?
            AND turno = ?
            AND (periodo_id = ? OR (periodo_id IS NULL AND ? IS NULL))
            AND estado = 'activo'
            AND letra_identificacion IS NULL
            LIMIT 1
        ");

        $stmtSinLetra->bind_param("ssssii", $generacion, $programa, $grado, $turno, $periodoId, $periodoId);
        $stmtSinLetra->execute();
        $resultSinLetra = $stmtSinLetra->get_result();

        if ($resultSinLetra->num_rows > 0) {
            // Ya existe un grupo sin letra, el nuevo debe tener letra 'B'
            $stmtSinLetra->close();
            return 'B';
        }

        $stmtSinLetra->close();
        return null; // Primer grupo, sin letra
    }

    // Buscar la primera letra disponible en el rango A-Z
    $letraInicio = 'B'; // Empezamos desde B porque el primer grupo no tiene letra

    for ($i = ord($letraInicio); $i <= ord('Z'); $i++) {
        $letra = chr($i);
        if (!in_array($letra, $letrasUsadas)) {
            return $letra;
        }
    }

    // Si llegamos aquí, todas las letras están usadas
    throw new Exception('Se ha alcanzado el límite de grupos para esta configuración');
}
?>
