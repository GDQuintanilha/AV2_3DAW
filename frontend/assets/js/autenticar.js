const API_LOGOUT = 'http://localhost/AV23DAW/backend/logout.php';

function getUsuario() {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
}

async function logout() {
    await fetch(API_LOGOUT, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

function renderizarHeader() {
    const usuario = getUsuario();
    const areaUsuario = document.getElementById('areaUsuario');
    if (!areaUsuario) return;

    if (usuario) {
        areaUsuario.innerHTML = `
            <span class="headerUsuario">Olá, ${usuario.nome.split(' ')[0]}</span>
            <a href="minhasReservas.html" class="btn btnBranco">Minhas Reservas</a>
            <button class="btn btnBranco" id="btnLogout">Sair</button>
        `;
        document.getElementById('btnLogout').addEventListener('click', logout);
    } else {
        areaUsuario.innerHTML = `
            <a href="login.html" class="btn btnOutline">Entrar</a>
            <a href="cadastro.html" class="btn btnBranco">Cadastrar</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', renderizarHeader);