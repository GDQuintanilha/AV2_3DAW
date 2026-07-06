<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config/db.php';

$pdo = getConnection();
$stmt = $pdo->query('SELECT id, nome, endereco FROM agencias');
$agencias = $stmt->fetchAll();

echo json_encode($agencias, JSON_UNESCAPED_UNICODE);
