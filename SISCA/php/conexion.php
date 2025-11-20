<?php
$servername = "sql303.infinityfree.com";
$username   = "if0_40378542";
$password   = "DDf99AfXCTk";
$database   = "if0_40378542_sisca"; 

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
} else {
    //echo "Conexión exitosa a la base de datos";
}

// $conn->close();
?>