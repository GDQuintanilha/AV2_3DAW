function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        reservaId: params.get('reserva_id'),
        veiculo:   params.get('veiculo'),
        agencia:   params.get('agencia'),
        periodo:   params.get('periodo'),
        motorista: params.get('motorista'),
        valor:     params.get('valor')
    };
}

function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagemRetorno');
    el.className = tipo === 'sucesso' ? 'mensagemSucesso' : 'mensagemErro';
    el.textContent = texto;
    el.classList.remove('oculto');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function popularResumo(p) {
    document.getElementById('resumoId').textContent      = `#${p.reservaId}`;
    document.getElementById('resumoVeiculo').textContent = decodeURIComponent(p.veiculo || '—');
    document.getElementById('resumoAgencia').textContent = decodeURIComponent(p.agencia || '—');
    document.getElementById('resumoPeriodo').textContent = `${p.periodo} dias`;
    document.getElementById('resumoMotorista').textContent = p.motorista === '1' ? 'Sim' : 'Não';
    document.getElementById('resumoValor').textContent   = `R$ ${parseFloat(p.valor).toFixed(2).replace('.', ',')}`;
}

function popularParcelas(valor) {
    const select = document.getElementById('creditoParcelas');
    const parcelas = [1, 2, 3, 6, 12];
    select.innerHTML = parcelas.map(n => {
        const valorParcela = (valor / n).toFixed(2).replace('.', ',');
        return `<option value="${n}">${n}x de R$ ${valorParcela} ${n === 1 ? '(à vista)' : 'sem juros'}</option>`;
    }).join('');
}

function iniciarTabs() {
    const tabs = document.querySelectorAll('.pagamentoTab');
    const conteudos = document.querySelectorAll('.pagamentoConteudo');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('ativo'));
            conteudos.forEach(c => c.classList.add('oculto'));
            tab.classList.add('ativo');
            document.getElementById(`tab${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.remove('oculto');
        });
    });
}

function formatarNumeroCartao(valor) {
    return valor.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatarValidade(valor) {
    return valor.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
}

function iniciarMascaras() {
    ['creditoNumero', 'debitoNumero'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            e.target.value = formatarNumeroCartao(e.target.value);
        });
    });

    ['creditoValidade', 'debitoValidade'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            e.target.value = formatarValidade(e.target.value);
        });
    });

    ['creditoCvv', 'debitoCvv'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    });
}

function tabAtiva() {
    return document.querySelector('.pagamentoTab.ativo').dataset.tab;
}

function validarPagamento() {
    const tab = tabAtiva();

    if (tab === 'pix') return true;

    const prefix = tab === 'credito' ? 'credito' : 'debito';
    const numero   = document.getElementById(`${prefix}Numero`).value.replace(/\s/g, '');
    const nome     = document.getElementById(`${prefix}Nome`).value.trim();
    const validade = document.getElementById(`${prefix}Validade`).value;
    const cvv      = document.getElementById(`${prefix}Cvv`).value;

    if (numero.length < 16) {
        mostrarMensagem('Número do cartão inválido.', 'erro');
        return false;
    }
    if (!nome) {
        mostrarMensagem('Informe o nome no cartão.', 'erro');
        return false;
    }
    if (validade.length < 5) {
        mostrarMensagem('Validade inválida.', 'erro');
        return false;
    }
    if (cvv.length < 3) {
        mostrarMensagem('CVV inválido.', 'erro');
        return false;
    }

    return true;
}

function confirmarPagamento(p) {
    if (!validarPagamento()) return;

    const btn = document.getElementById('btnPagar');
    btn.disabled = true;
    btn.textContent = 'Processando...';

    setTimeout(() => {
        const params = new URLSearchParams({
            reserva_id: p.reservaId,
            veiculo:    p.veiculo,
            agencia:    p.agencia,
            periodo:    p.periodo,
            motorista:  p.motorista,
            valor:      p.valor,
            pagamento:  tabAtiva()
        });

        window.location.href = `confirmacao.html?${params.toString()}`;
    }, 1500);
}

function iniciarPix() {
    document.getElementById('btnCopiarPix').addEventListener('click', () => {
        navigator.clipboard.writeText('fallscar@pagamentos.com.br');
        document.getElementById('btnCopiarPix').textContent = 'Copiado!';
        setTimeout(() => {
            document.getElementById('btnCopiarPix').textContent = 'Copiar';
        }, 2000);
    });
}

function init() {
    const p = getParams();

    if (!p.reservaId) {
        window.location.href = 'index.html';
        return;
    }

    popularResumo(p);
    popularParcelas(parseFloat(p.valor));
    iniciarTabs();
    iniciarMascaras();
    iniciarPix();

    document.getElementById('btnPagar').addEventListener('click', () => confirmarPagamento(p));
}

document.addEventListener('DOMContentLoaded', init);