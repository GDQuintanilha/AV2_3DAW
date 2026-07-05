<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/db.php';

$pdo = getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (empty($dados['id']) || empty($dados['cpf'])) {
        http_response_code(400);
        echo json_encode(['erro' => 'ID e CPF obrigatórios para edição.']);
        exit;
    }

    $cpf = preg_replace('/\D/', '', $dados['cpf']);

    $stmtVerifica = $pdo->prepare('SELECT id FROM reservas WHERE id = ? AND cliente_cpf = ?');
    $stmtVerifica->execute([$dados['id'], $cpf]);

    if (!$stmtVerifica->fetch()) {
        http_response_code(403);
        echo json_encode(['erro' => 'Reserva não encontrada ou não pertence a este usuário.']);
        exit;
    }

    $periodosValidos = [7, 15, 30];
    if (!in_array((int) $dados['periodo_dias'], $periodosValidos)) {
        http_response_code(400);
        echo json_encode(['erro' => 'Período inválido. Use 7, 15 ou 30 dias.']);
        exit;
    }

    $stmtVeiculo = $pdo->prepare('SELECT preco_diaria FROM veiculos WHERE id = ?');
    $stmtVeiculo->execute([$dados['veiculo_id']]);
    $veiculo = $stmtVeiculo->fetch();

    if (!$veiculo) {
        http_response_code(404);
        echo json_encode(['erro' => 'Veículo não encontrado.']);
        exit;
    }

    $valorTotal = $veiculo['preco_diaria'] * (int) $dados['periodo_dias'];
    if ($dados['com_motorista']) $valorTotal += 150 * (int) $dados['periodo_dias'];

    $stmtUpdate = $pdo->prepare('
        UPDATE reservas SET
            veiculo_id    = :veiculo_id,
            agencia_id    = :agencia_id,
            periodo_dias  = :periodo_dias,
            com_motorista = :com_motorista,
            valor_total   = :valor_total
        WHERE id = :id
    ');

    $stmtUpdate->execute([
        ':veiculo_id'    => $dados['veiculo_id'],
        ':agencia_id'    => $dados['agencia_id'],
        ':periodo_dias'  => (int) $dados['periodo_dias'],
        ':com_motorista' => (int) $dados['com_motorista'],
        ':valor_total'   => $valorTotal,
        ':id'            => $dados['id']
    ]);

    http_response_code(200);
    echo json_encode([
        'sucesso'     => true,
        'mensagem'    => 'Reserva atualizada com sucesso!',
        'reserva_id'  => $dados['id'],
        'valor_total' => $valorTotal
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$campos = ['veiculo_id', 'agencia_id', 'cliente_nome', 'cliente_cpf', 'cliente_nasc', 'cnh_numero', 'cnh_emissao', 'periodo_dias'];
foreach ($campos as $campo) {
    if (empty($dados[$campo])) {
        http_response_code(400);
        echo json_encode(['erro' => "Campo obrigatório ausente: $campo"]);
        exit;
    }
}

if (!isset($dados['com_motorista'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Campo obrigatório ausente: com_motorista']);
    exit;
}

$periodosValidos = [7, 15, 30];
if (!in_array((int) $dados['periodo_dias'], $periodosValidos)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Período inválido. Use 7, 15 ou 30 dias.']);
    exit;
}

$emissaoCNH = new DateTime($dados['cnh_emissao']);
$hoje = new DateTime();
$diff = $hoje->diff($emissaoCNH);
$anosDeHabilitacao = $diff->y;

if ($anosDeHabilitacao < 2) {
    http_response_code(422);
    echo json_encode(['erro' => 'CNH deve ter mais de 2 anos de emissão.']);
    exit;
}

$stmtVeiculo = $pdo->prepare('SELECT preco_diaria, status FROM veiculos WHERE id = ?');
$stmtVeiculo->execute([$dados['veiculo_id']]);
$veiculo = $stmtVeiculo->fetch();

if (!$veiculo) {
    http_response_code(404);
    echo json_encode(['erro' => 'Veículo não encontrado.']);
    exit;
}

if ($veiculo['status'] !== 'livre') {
    http_response_code(422);
    echo json_encode(['erro' => 'Veículo indisponível para reserva.']);
    exit;
}

$valorTotal = $veiculo['preco_diaria'] * (int) $dados['periodo_dias'];
if ($dados['com_motorista']) $valorTotal += 150 * (int) $dados['periodo_dias'];

$sql = "
    INSERT INTO reservas
        (veiculo_id, agencia_id, cliente_nome, cliente_cpf, cliente_nasc, cnh_numero, cnh_emissao, periodo_dias, com_motorista, valor_total)
    VALUES
        (:veiculo_id, :agencia_id, :cliente_nome, :cliente_cpf, :cliente_nasc, :cnh_numero, :cnh_emissao, :periodo_dias, :com_motorista, :valor_total)
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':veiculo_id'    => $dados['veiculo_id'],
    ':agencia_id'    => $dados['agencia_id'],
    ':cliente_nome'  => $dados['cliente_nome'],
    ':cliente_cpf'   => $dados['cliente_cpf'],
    ':cliente_nasc'  => $dados['cliente_nasc'],
    ':cnh_numero'    => $dados['cnh_numero'],
    ':cnh_emissao'   => $dados['cnh_emissao'],
    ':periodo_dias'  => (int) $dados['periodo_dias'],
    ':com_motorista' => (int) $dados['com_motorista'],
    ':valor_total'   => $valorTotal,
]);

http_response_code(201);
echo json_encode([
    'sucesso'     => true,
    'mensagem'    => 'Reserva realizada com sucesso!',
    'reserva_id'  => $pdo->lastInsertId(),
    'valor_total' => $valorTotal
], JSON_UNESCAPED_UNICODE);