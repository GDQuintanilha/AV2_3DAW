const API_VEICULOS = 'http://localhost/AV23DAW/backend/veiculos.php';
const API_AGENCIAS = 'http://localhost/AV23DAW/backend/agencias.php';
const API_RESERVAS = 'http://localhost/AV23DAW/backend/reservas.php';

let todosVeiculos = [];
let todasAgencias = [];

function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagemRetorno');
    el.className = tipo === 'sucesso' ? 'mensagemSucesso' : 'mensagemErro';
    el.textContent = texto;
    el.classList.remove('oculto');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function atualizarResumo() {
    const veiculo = todosVeiculos.find(v => v.id == document.getElementById('selectVeiculo').value);
    const periodo = parseInt(document.getElementById('selectPeriodo').value);
    const comMotorista = document.getElementById('checkMotorista').checked;
    const resumo = document.getElementById('resumoPreco');
    const valorEl = document.getElementById('valorEstimado');

    if (!veiculo || !periodo) {
        resumo.classList.add('oculto');
        return;
    }

    let total = veiculo.preco_diaria * periodo;
    if (comMotorista) total += 150 * periodo;

    valorEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    resumo.classList.remove('oculto');
}

function popularVeiculosPorAgencia(agenciaId) {
    const select = document.getElementById('selectVeiculo');
    select.innerHTML = '<option value="">Selecione o veículo</option>';

    if (!agenciaId) {
        select.innerHTML = '<option value="">Selecione a agência primeiro</option>';
        return;
    }

    const veiculosFiltrados = todosVeiculos.filter(v =>
        v.status === 'livre' &&
        v.agencias.some(ag => ag.id == agenciaId)
    );

    if (!veiculosFiltrados.length) {
        select.innerHTML = '<option value="">Nenhum veículo disponível nesta agência</option>';
        return;
    }

    veiculosFiltrados.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.marca} ${v.nome} (${v.categoria}) — R$ ${v.preco_diaria.toFixed(2)}/dia`;
        select.appendChild(opt);
    });
}

function popularAgencias() {
    const select = document.getElementById('selectAgencia');
    select.innerHTML = '<option value="">Selecione a agência</option>';

    todasAgencias.forEach(ag => {
        const opt = document.createElement('option');
        opt.value = ag.id;
        opt.textContent = ag.nome;
        select.appendChild(opt);
    });

    select.addEventListener('change', () => {
        popularVeiculosPorAgencia(select.value);
        document.getElementById('resumoPreco').classList.add('oculto');
    });
}

function popularListaAgencias() {
    const lista = document.getElementById('listaAgenciasInfo');
    lista.innerHTML = todasAgencias.map(a => `<li>${a.nome}</li>`).join('');
}

function validarCNH(emissao) {
    const dataEmissao = new Date(emissao);
    const hoje = new Date();
    const diffAnos = (hoje - dataEmissao) / (1000 * 60 * 60 * 24 * 365.25);
    return diffAnos >= 2;
}

function formatarCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

async function enviarReserva() {
    const veiculo_id    = document.getElementById('selectVeiculo').value;
    const agencia_id    = document.getElementById('selectAgencia').value;
    const periodo_dias  = document.getElementById('selectPeriodo').value;
    const com_motorista = document.getElementById('checkMotorista').checked;
    const cliente_nome  = document.getElementById('clienteNome').value.trim();
    const cliente_cpf   = document.getElementById('clienteCpf').value.replace(/\D/g, '');
    const cliente_nasc  = document.getElementById('clienteNasc').value;
    const cnh_numero    = document.getElementById('cnhNumero').value.trim();
    const cnh_emissao   = document.getElementById('cnhEmissao').value;

    if (!veiculo_id || !agencia_id || !periodo_dias || !cliente_nome || !cliente_cpf || !cliente_nasc || !cnh_numero || !cnh_emissao) {
        mostrarMensagem('Preencha todos os campos antes de continuar.', 'erro');
        return;
    }

    if (cliente_cpf.length !== 11) {
        mostrarMensagem('CPF inválido. Digite os 11 dígitos.', 'erro');
        return;
    }

    if (!validarCNH(cnh_emissao)) {
        mostrarMensagem('Sua CNH deve ter mais de 2 anos de emissão para alugar conosco.', 'erro');
        return;
    }

    const btn = document.getElementById('btnReservar');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const res = await fetch(API_RESERVAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                veiculo_id,
                agencia_id,
                periodo_dias:  parseInt(periodo_dias),
                com_motorista: com_motorista ? 1 : 0,
                cliente_nome,
                cliente_cpf,
                cliente_nasc,
                cnh_numero,
                cnh_emissao
            })
        });

        const dados = await res.json();

        if (res.ok) {
            const veiculo = todosVeiculos.find(v => v.id == veiculo_id);
            const agencia = todasAgencias.find(a => a.id == agencia_id);

            const params = new URLSearchParams({
                reserva_id: dados.reserva_id,
                veiculo:    encodeURIComponent(`${veiculo.marca} ${veiculo.nome}`),
                agencia:    encodeURIComponent(agencia.nome),
                periodo:    periodo_dias,
                motorista:  com_motorista ? '1' : '0',
                valor:      dados.valor_total
            });

            window.location.href = `pagamento.html?${params.toString()}`;
        } else {
            mostrarMensagem(`❌ ${dados.erro}`, 'erro');
            btn.disabled = false;
            btn.textContent = 'Confirmar Simulação';
        }

    } catch (err) {
        mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        btn.disabled = false;
        btn.textContent = 'Confirmar Simulação';
    }
}

async function init() {
    try {
        const [resVeiculos, resAgencias] = await Promise.all([
            fetch(API_VEICULOS),
            fetch(API_AGENCIAS)
        ]);

        todosVeiculos = await resVeiculos.json();
        todasAgencias = await resAgencias.json();

        popularAgencias();
        popularListaAgencias();

        document.getElementById('selectVeiculo').addEventListener('change', atualizarResumo);
        document.getElementById('selectPeriodo').addEventListener('change', atualizarResumo);
        document.getElementById('checkMotorista').addEventListener('change', atualizarResumo);
        document.getElementById('clienteCpf').addEventListener('input', e => {
            e.target.value = formatarCPF(e.target.value);
        });
        document.getElementById('btnReservar').addEventListener('click', enviarReserva);

    } catch (err) {
        mostrarMensagem('Erro ao carregar dados. Verifique se o servidor está ativo.', 'erro');
    }
}

document.addEventListener('DOMContentLoaded', init);