const API_VEICULOS = 'http://localhost/AV23DAW/backend/veiculos.php';

let todosVeiculos = [];

function badgeStatus(status) {
    const labels = {
        livre:      'Disponível',
        alugado:    'Alugado',
        reservado:  'Reservado',
        manutencao: 'Em Manutenção'
    };
    const classes = {
        livre:      'badgeLivre',
        alugado:    'badgeAlugado',
        reservado:  'badgeReservado',
        manutencao: 'badgeManutencao'
    };
    return `<span class="badge ${classes[status] || ''}">${labels[status] || status}</span>`;
}

function renderizarCard(veiculo) {
    const listaAgencias = veiculo.agencias.map(ag =>
        `<li>${ag.nome}</li>`
    ).join('');

    const imgHtml = veiculo.foto_url
        ? `<img class="cardImg" src="${veiculo.foto_url}" alt="${veiculo.nome}">`
        : `<div class="cardImgPlaceholder">🚗</div>`;

    return `
        <div class="card">
            ${imgHtml}
            <div class="cardBody">
                <span class="cardCategoria">${veiculo.categoria}</span>
                <span class="cardNome">${veiculo.marca} ${veiculo.nome}</span>
                <div class="cardSpecs">
                    <span>${veiculo.ano}</span>
                    <span>${veiculo.cambio}</span>
                    <span>${veiculo.combustivel}</span>
                    <span>${veiculo.portas} portas</span>
                    ${veiculo.ar_cond ? '<span>Ar-cond.</span>' : ''}
                </div>
                <div class="cardAgencias">
                    <p>Disponível em:</p>
                    <ul>${listaAgencias}</ul>
                </div>
            </div>
            <div class="cardFooter">
                <div class="cardPreco">
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
        container.innerHTML = '<p class="erroMsg">Nenhum veículo encontrado.</p>';
        return;
    }

    const porCategoria = {};
    veiculos.forEach(v => {
        if (!porCategoria[v.categoria]) porCategoria[v.categoria] = [];
        porCategoria[v.categoria].push(v);
    });

    container.innerHTML = Object.entries(porCategoria).map(([categoria, veics]) => `
        <div class="categoriaBloco">
            <h2>${categoria}</h2>
            <div class="cardsGrid">
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
        container.innerHTML = '<p class="erroMsg">Erro ao carregar o catálogo. Verifique se o servidor está ativo.</p>';
    }
}

document.addEventListener('DOMContentLoaded', init);