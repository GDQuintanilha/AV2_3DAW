<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$cpf = $_GET['cpf'] ?? '';

if (empty($cpf)) {
    http_response_code(400);
    echo json_encode(['erro' => 'CPF obrigatório.']);
    exit;
}

$cpf = preg_replace('/\D/', '', $cpf);

$pdo = getConnection();

$stmt = $pdo->prepare("
    SELECT
        r.id,
        r.periodo_dias,
        r.com_motorista,
        r.valor_total,
        r.criado_em,
        r.cliente_nome,
        r.cliente_cpf,
        r.cliente_nasc,
        r.cnh_numero,
        r.cnh_emissao,
        v.id AS veiculo_id,
        v.nome AS veiculo_nome,
        v.marca AS veiculo_marca,
        a.id AS agencia_id,
        a.nome AS agencia_nome
    FROM reservas r
    INNER JOIN veiculos v ON v.id = r.veiculo_id
    INNER JOIN agencias a ON a.id = r.agencia_id
    WHERE r.cliente_cpf = ?
    ORDER BY r.criado_em DESC
");

$stmt->execute([$cpf]);
$reservas = $stmt->fetchAll();

foreach ($reservas as &$r) {
    $r['com_motorista'] = (bool) $r['com_motorista'];
    $r['valor_total']   = (float) $r['valor_total'];
}

echo json_encode($reservas, JSON_UNESCAPED_UNICODE);