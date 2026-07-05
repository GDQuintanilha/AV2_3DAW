function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        reservaId: params.get('reserva_id'),
        veiculo:   params.get('veiculo'),
        agencia:   params.get('agencia'),
        periodo:   params.get('periodo'),
        motorista: params.get('motorista'),
        valor:     params.get('valor'),
        pagamento: params.get('pagamento')
    };
}

function init() {
    const p = getParams();

    if (!p.reservaId) {
        window.location.href = 'index.html';
        return;
    }

    const pagamentos = {
        credito: 'Cartão de Crédito',
        debito:  'Cartão de Débito',
        pix:     'Pix'
    };

    document.getElementById('confReservaId').textContent  = `#${p.reservaId}`;
    document.getElementById('confVeiculo').textContent    = decodeURIComponent(p.veiculo || '—');
    document.getElementById('confAgencia').textContent    = decodeURIComponent(p.agencia || '—');
    document.getElementById('confPeriodo').textContent    = `${p.periodo} dias`;
    document.getElementById('confMotorista').textContent  = p.motorista === '1' ? 'Sim' : 'Não';
    document.getElementById('confPagamento').textContent  = pagamentos[p.pagamento] || '—';
    document.getElementById('confValor').textContent      = `R$ ${parseFloat(p.valor).toFixed(2).replace('.', ',')}`;
}

document.addEventListener('DOMContentLoaded', init);