const API_LOGIN = 'http://localhost/AV23DAW/backend/login.php';

function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagemRetorno');
    el.className = tipo === 'sucesso' ? 'mensagem-sucesso' : 'mensagem-erro';
    el.textContent = texto;
    el.classList.remove('oculto');
}

async function login() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        mostrarMensagem('Preencha e-mail e senha.', 'erro');
        return;
    }

    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const res = await fetch(API_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });

        const dados = await res.json();

        if (res.ok) {
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));
            mostrarMensagem('✅ Login realizado! Redirecionando...', 'sucesso');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            mostrarMensagem(`❌ ${dados.erro}`, 'erro');
            btn.disabled = false;
            btn.textContent = 'Entrar';
        }

    } catch (err) {
        mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnLogin').addEventListener('click', login);
    document.getElementById('senha').addEventListener('keydown', e => {
        if (e.key === 'Enter') login();
    });
});