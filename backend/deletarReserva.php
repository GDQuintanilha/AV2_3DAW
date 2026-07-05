<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['id']) || empty($dados['cpf'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID e CPF obrigatórios.']);
    exit;
}

$cpf = preg_replace('/\D/', '', $dados['cpf']);
$pdo = getConnection();

$stmtVerifica = $pdo->prepare('SELECT id FROM reservas WHERE id = ? AND cliente_cpf = ?');
$stmtVerifica->execute([$dados['id'], $cpf]);

if (!$stmtVerifica->fetch()) {
    http_response_code(403);
    echo json_encode(['erro' => 'Reserva não encontrada ou não pertence a este usuário.']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM reservas WHERE id = ?');
$stmt->execute([$dados['id']]);

echo json_encode(['sucesso' => true, 'mensagem' => 'Reserva cancelada com sucesso.'], JSON_UNESCAPED_UNICODE);