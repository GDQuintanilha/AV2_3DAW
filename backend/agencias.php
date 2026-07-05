<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config/db.php';

$pdo = getConnection();
$stmt = $pdo->query('SELECT id, nome, endereco, latitude, longitude FROM agencias');
$agencias = $stmt->fetchAll();

echo json_encode($agencias);