<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$campos = ['nome', 'email', 'senha', 'cpf', 'data_nasc'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        http_response_code(400);
        echo json_encode(['erro' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

if (!filter_var($dados['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail inválido.']);
    exit;
}

$cpf = preg_replace('/\D/', '', $dados['cpf']);
if (strlen($cpf) !== 11) {
    http_response_code(400);
    echo json_encode(['erro' => 'CPF inválido.']);
    exit;
}

if (strlen($dados['senha']) < 6) {
    http_response_code(400);
    echo json_encode(['erro' => 'A senha deve ter pelo menos 6 caracteres.']);
    exit;
}

$pdo = getConnection();

$stmtVerifica = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? OR cpf = ?');
$stmtVerifica->execute([$dados['email'], $cpf]);
if ($stmtVerifica->fetch()) {
    http_response_code(409);
    echo json_encode(['erro' => 'E-mail ou CPF já cadastrado.']);
    exit;
}

$senhaHash = password_hash($dados['senha'], PASSWORD_BCRYPT);

$stmt = $pdo->prepare('
    INSERT INTO usuarios (nome, email, senha_hash, cpf, data_nasc)
    VALUES (:nome, :email, :senha_hash, :cpf, :data_nasc)
');

$stmt->execute([
    ':nome'       => $dados['nome'],
    ':email'      => $dados['email'],
    ':senha_hash' => $senhaHash,
    ':cpf'        => $cpf,
    ':data_nasc'  => $dados['data_nasc']
]);

http_response_code(201);
echo json_encode(['sucesso' => true, 'mensagem' => 'Cadastro realizado com sucesso!'], JSON_UNESCAPED_UNICODE);