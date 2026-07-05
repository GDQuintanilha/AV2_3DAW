const API_RESERVAS_USUARIO = 'http://localhost/AV23DAW/backend/minhasReservas.php';
const API_DELETAR = 'http://localhost/AV23DAW/backend/deletarReserva.php';
const API_VEICULOS = 'http://localhost/AV23DAW/backend/veiculos.php';
const API_AGENCIAS = 'http://localhost/AV23DAW/backend/agencias.php';

let usuario = null;
let todasReservas = [];

function getUsuario() {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
}

function mostrarLoading() {
    document.getElementById('reservasContainer').innerHTML = '<p class="loading">Carregando reservas...</p>';
}

function mostrarErro(msg) {
    document.getElementById('reservasContainer').innerHTML = `<p class="erroMsg">${msg}</p>`;
}

function formatarData(dataStr) {
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR');
}

function renderizarReservas() {
    const container = document.getElementById('reservasContainer');

    if (!todasReservas.length) {
        container.innerHTML = '<p class="semReservas">Você ainda não possui reservas.</p>';
        return;
    }

    container.innerHTML = todasReservas.map(r => `
        <div class="reservaCard" id="reserva-${r.id}">
            <div class="reservaHeader">
                <span class="reservaId">Reserva #${r.id}</span>
                <span class="reservaData">Criada em ${formatarData(r.criado_em)}</span>
            </div>
            <div class="reservaBody">
                <div class="reservaInfo">
                    <div class="reservaItem">
                        <span>Veículo</span>
                        <strong>${r.veiculo_marca} ${r.veiculo_nome}</strong>
                    </div>
                    <div class="reservaItem">
                        <span>Agência</span>
                        <strong>${r.agencia_nome}</strong>
                    </div>
                    <div class="reservaItem">
                        <span>Período</span>
                        <strong>${r.periodo_dias} dias</strong>
                    </div>
                    <div class="reservaItem">
                        <span>Motorista</span>
                        <strong>${r.com_motorista ? 'Sim' : 'Não'}</strong>
                    </div>
                </div>
                <div class="reservaTotal">
                    <span>Total</span>
                    <strong>R$ ${r.valor_total.toFixed(2).replace('.', ',')}</strong>
                </div>
            </div>
            <div class="reservaAcoes">
                <button class="btn btnDanger" onclick="confirmarExclusao(${r.id})">🗑️ Cancelar Reserva</button>
            </div>
        </div>
    `).join('');
}

async function confirmarExclusao(id) {
    if (!confirm(`Tem certeza que deseja cancelar a reserva #${id}?`)) return;

    try {
        const res = await fetch(API_DELETAR, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, cpf: usuario.cpf })
        });

        const dados = await res.json();

        if (res.ok) {
            todasReservas = todasReservas.filter(r => r.id !== id);
            renderizarReservas();
        } else {
            alert(dados.erro);
        }

    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
}

async function init() {
    usuario = getUsuario();

    mostrarLoading();

    try {
        const resReservas = await fetch(`${API_RESERVAS_USUARIO}?cpf=${usuario.cpf}`);
        todasReservas = await resReservas.json();
        renderizarReservas();

    } catch (err) {
        mostrarErro('Erro ao carregar reservas. Verifique se o servidor está ativo.');
    }
}

document.addEventListener('DOMContentLoaded', init);