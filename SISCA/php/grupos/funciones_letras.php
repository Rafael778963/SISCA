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

    if (empty($grupoBaja['letra_identificacion'])) {
        return true;
    }

    $stmt = $conn->prepare("
        SELECT id, letra_identificacion, codigo_grupo
        FROM grupos
        WHERE generacion = ?
        AND programa_educativo = ?
        AND grado = ?
        AND turno = ?
        AND periodo_id = ?
        AND estado = 'activo'
        AND letra_identificacion > ?
        ORDER BY letra_identificacion ASC
    ");

    $stmt->bind_param(
        "ssssss",
        $grupoBaja['generacion'],
        $grupoBaja['programa_educativo'],
        $grupoBaja['grado'],
        $grupoBaja['turno'],
        $grupoBaja['periodo_id'],
        $grupoBaja['letra_identificacion']
    );

    $stmt->execute();
    $result = $stmt->get_result();
    $gruposReorganizar = [];

    while ($row = $result->fetch_assoc()) {
        $gruposReorganizar[] = $row;
    }
    $stmt->close();

    if (empty($gruposReorganizar)) {
        return true;
    }

    $letraActual = $grupoBaja['letra_identificacion'];

    foreach ($gruposReorganizar as $grupo) {
        $nuevaLetra = $letraActual;

        $codigoBase = $grupoBaja['generacion'] .
                     $grupoBaja['programa_educativo'] .
                     $grupoBaja['grado'];
        $nuevoCodigo = $codigoBase . $nuevaLetra . $grupoBaja['turno'];

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
    $stmt = $conn->prepare("
        SELECT letra_identificacion
        FROM grupos
        WHERE generacion = ?
        AND programa_educativo = ?
        AND grado = ?
        AND turno = ?
        AND periodo_id = ?
        AND estado = 'activo'
        ORDER BY letra_identificacion ASC
    ");

    $stmt->bind_param("sssss", $generacion, $programa, $grado, $turno, $periodoId);
    $stmt->execute();
    $result = $stmt->get_result();

    $letrasUsadas = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['letra_identificacion'])) {
            $letrasUsadas[] = $row['letra_identificacion'];
        }
    }
    $stmt->close();

    if (empty($letrasUsadas)) {
        $stmtSinLetra = $conn->prepare("
            SELECT id
            FROM grupos
            WHERE generacion = ?
            AND programa_educativo = ?
            AND grado = ?
            AND turno = ?
            AND periodo_id = ?
            AND estado = 'activo'
            AND letra_identificacion IS NULL
            LIMIT 1
        ");

        $stmtSinLetra->bind_param("sssss", $generacion, $programa, $grado, $turno, $periodoId);
        $stmtSinLetra->execute();
        $resultSinLetra = $stmtSinLetra->get_result();

        if ($resultSinLetra->num_rows > 0) {
            $stmtSinLetra->close();
            return 'B';
        }

        $stmtSinLetra->close();
        return null;
    }

    $letraInicio = 'B';

    for ($i = ord($letraInicio); $i <= ord('Z'); $i++) {
        $letra = chr($i);
        if (!in_array($letra, $letrasUsadas)) {
            return $letra;
        }
    }

    throw new Exception('Se ha alcanzado el límite de grupos para esta configuración');
}
?>
