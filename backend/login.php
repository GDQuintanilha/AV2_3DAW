<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

session_start();

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['email']) || empty($dados['senha'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail e senha são obrigatórios.']);
    exit;
}

$pdo = getConnection();

$stmt = $pdo->prepare('SELECT id, nome, email, cpf, senha_hash FROM usuarios WHERE email = ?');
$stmt->execute([$dados['email']]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($dados['senha'], $usuario['senha_hash'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'E-mail ou senha incorretos.']);
    exit;
}

$_SESSION['usuario_id']   = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];

echo json_encode([
    'sucesso'  => true,
    'mensagem' => 'Login realizado com sucesso!',
    'usuario'  => [
        'id'    => $usuario['id'],
        'nome'  => $usuario['nome'],
        'email' => $usuario['email'],
        'cpf'   => $usuario['cpf']
    ]
], JSON_UNESCAPED_UNICODE);