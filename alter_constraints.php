<?php
// Script para alterar las restricciones FK de docentes y grupos
// Cambia de ON DELETE SET NULL a ON DELETE CASCADE

$servername = "localhost";
$username = "root";
$password = "";
$database = "sisca";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Desactivar temporalmente las restricciones FK
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

try {
    // Alterar FK para docentes
    echo "Alterando restricción FK para docentes...\n";

    // Primero, eliminar la restricción antigua
    if (!$conn->query("ALTER TABLE `docentes` DROP FOREIGN KEY `fk_docentes_periodo`")) {
        throw new Exception("Error al eliminar FK docentes: " . $conn->error);
    }
    echo "✓ Restricción FK docentes eliminada\n";

    // Luego, agregar la nueva restricción
    if (!$conn->query("ALTER TABLE `docentes` ADD CONSTRAINT `fk_docentes_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE")) {
        throw new Exception("Error al agregar FK docentes: " . $conn->error);
    }
    echo "✓ Nueva restricción FK docentes agregada (ON DELETE CASCADE)\n";

    // Alterar FK para grupos
    echo "\nAlterando restricción FK para grupos...\n";

    // Primero, eliminar la restricción antigua
    if (!$conn->query("ALTER TABLE `grupos` DROP FOREIGN KEY `fk_grupos_periodo`")) {
        throw new Exception("Error al eliminar FK grupos: " . $conn->error);
    }
    echo "✓ Restricción FK grupos eliminada\n";

    // Luego, agregar la nueva restricción
    if (!$conn->query("ALTER TABLE `grupos` ADD CONSTRAINT `fk_grupos_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE")) {
        throw new Exception("Error al agregar FK grupos: " . $conn->error);
    }
    echo "✓ Nueva restricción FK grupos agregada (ON DELETE CASCADE)\n";

    // Reactivar las restricciones FK
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

    echo "\n✓ ¡Altización completada exitosamente!\n";
    echo "Las restricciones FK para docentes y grupos ahora usan ON DELETE CASCADE\n";

} catch (Exception $e) {
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");
    die("Error: " . $e->getMessage() . "\n");
}

$conn->close();
?>
