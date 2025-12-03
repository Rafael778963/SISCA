<?php
include '../session_check.php';
include '../conexion.php';

$sql = "SELECT * FROM periodos ORDER BY id DESC";
$result = $conn->query($sql);

$periodos = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Construir el texto del periodo combinando periodo y año
        $row['texto'] = $row['periodo'] . ' ' . $row['año'];
        $periodos[] = $row;
    }
}

echo json_encode($periodos);
$conn->close();
?>
