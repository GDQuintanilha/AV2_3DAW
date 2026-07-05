<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once 'config/db.php';

$pdo = getConnection();

$sqlVeiculos = "
    SELECT
        v.id,
        v.nome,
        v.marca,
        v.ano,
        v.cambio,
        v.combustivel,
        v.portas,
        v.ar_cond,
        v.preco_diaria,
        v.foto,
        v.foto_url,
        v.status,
        c.nome AS categoria
    FROM veiculos v
    INNER JOIN categorias c ON c.id = v.categoria_id
    ORDER BY c.nome, v.nome
";

$sqlAgencias = "
    SELECT e.veiculo_id, a.id, a.nome
    FROM estoque e
    INNER JOIN agencias a ON a.id = e.agencia_id
";

$veiculos = $pdo->query($sqlVeiculos)->fetchAll();
$agenciasRows = $pdo->query($sqlAgencias)->fetchAll();

$agenciasPorVeiculo = [];
foreach ($agenciasRows as $row) {
    $agenciasPorVeiculo[$row['veiculo_id']][] = [
        'id'   => (int) $row['id'],
        'nome' => $row['nome']
    ];
}

$veiculos = array_map(function($v) use ($agenciasPorVeiculo) {
    $v['ar_cond']      = (bool) $v['ar_cond'];
    $v['preco_diaria'] = (float) $v['preco_diaria'];
    $v['agencias']     = $agenciasPorVeiculo[$v['id']] ?? [];
    return $v;
}, $veiculos);

echo json_encode($veiculos, JSON_UNESCAPED_UNICODE);