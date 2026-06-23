const API_VEICULOS = 'http://localhost/AV23DAW/backend/veiculos.php';

let todosVeiculos = [];

function badgeStatus(status) {
    const labels = {
        livre:      'Disponível',
        alugado:    'Alugado',
        reservado:  'Reservado',
        manutencao: 'Em Manutenção'
    };
    return `<span class="badge badge--${status}">${labels[status] || status}</span>`;
}

function renderizarCard(veiculo) {
    const listaAgencias = veiculo.agencias.map(ag =>
        `<li>${ag.nome}</li>`
    ).join('');

    return `
        <div class="card">
            <div class="card__img--placeholder">🚗</div>
            <div class="card__body">
                <span class="card__categoria">${veiculo.categoria}</span>
                <span class="card__nome">${veiculo.marca} ${veiculo.nome}</span>
                <div class="card__specs">
                    <span>${veiculo.ano}</span>
                    <span>${veiculo.cambio}</span>
                    <span>${veiculo.combustivel}</span>
                    <span>${veiculo.portas} portas</span>
                    ${veiculo.ar_cond ? '<span>Ar-cond.</span>' : ''}
                </div>
                <div class="card__agencias">
                    <p>Disponível em:</p>
                    <ul>${listaAgencias}</ul>
                </div>
            </div>
            <div class="card__footer">
                <div class="card__preco">
                    R$ ${veiculo.preco_diaria.toFixed(2)} <small>/dia</small>
                </div>
                ${badgeStatus(veiculo.status)}
            </div>
        </div>
    `;
}

function renderizarCatalogo(veiculos) {
    const container = document.getElementById('catalogoContainer');

    if (!veiculos.length) {
        container.innerHTML = '<p class="erro-msg">Nenhum veículo encontrado.</p>';
        return;
    }

    const porCategoria = {};
    veiculos.forEach(v => {
        if (!porCategoria[v.categoria]) porCategoria[v.categoria] = [];
        porCategoria[v.categoria].push(v);
    });

    container.innerHTML = Object.entries(porCategoria).map(([categoria, veics]) => `
        <div class="categoria-bloco">
            <h2>${categoria}</h2>
            <div class="cards-grid">
                ${veics.map(renderizarCard).join('')}
            </div>
        </div>
    `).join('');
}

function filtrarVeiculos(termo) {
    if (!termo.trim()) return todosVeiculos;
    const t = termo.toLowerCase();
    return todosVeiculos.filter(v =>
        v.nome.toLowerCase().includes(t) ||
        v.categoria.toLowerCase().includes(t) ||
        v.marca.toLowerCase().includes(t)
    );
}

function iniciarBusca() {
    document.getElementById('campoBusca').addEventListener('input', e => {
        renderizarCatalogo(filtrarVeiculos(e.target.value));
    });
}

async function init() {
    const container = document.getElementById('catalogoContainer');
    container.innerHTML = '<p class="loading">Carregando veículos...</p>';

    try {
        const res = await fetch(API_VEICULOS);
        todosVeiculos = await res.json();
        renderizarCatalogo(todosVeiculos);
        iniciarBusca();
    } catch (err) {
        container.innerHTML = '<p class="erro-msg">Erro ao carregar o catálogo. Verifique se o servidor está ativo.</p>';
    }
}

document.addEventListener('DOMContentLoaded', init);