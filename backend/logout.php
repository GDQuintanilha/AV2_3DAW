<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

session_start();
session_destroy();

echo json_encode(['sucesso' => true, 'mensagem' => 'Logout realizado com sucesso.'], JSON_UNESCAPED_UNICODE);