const API_CADASTRO = 'http://localhost/AV23DAW/backend/cadastro.php';

function mostrarMensagem(texto, tipo) {
    const el = document.getElementById('mensagemRetorno');
    el.className = tipo === 'sucesso' ? 'mensagem-sucesso' : 'mensagem-erro';
    el.textContent = texto;
    el.classList.remove('oculto');
}

function formatarCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

async function cadastrar() {
    const nome           = document.getElementById('nome').value.trim();
    const email          = document.getElementById('email').value.trim();
    const cpf            = document.getElementById('cpf').value.replace(/\D/g, '');
    const data_nasc      = document.getElementById('dataNasc').value;
    const senha          = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (!nome || !email || !cpf || !data_nasc || !senha || !confirmarSenha) {
        mostrarMensagem('Preencha todos os campos.', 'erro');
        return;
    }

    if (cpf.length !== 11) {
        mostrarMensagem('CPF inválido. Digite os 11 dígitos.', 'erro');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'erro');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem.', 'erro');
        return;
    }

    const btn = document.getElementById('btnCadastrar');
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';

    try {
        const res = await fetch(API_CADASTRO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, cpf, data_nasc, senha })
        });

        const dados = await res.json();

        if (res.ok) {
            mostrarMensagem('✅ Cadastro realizado! Redirecionando para o login...', 'sucesso');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            mostrarMensagem(`❌ ${dados.erro}`, 'erro');
            btn.disabled = false;
            btn.textContent = 'Criar Conta';
        }

    } catch (err) {
        mostrarMensagem('Erro de conexão com o servidor.', 'erro');
        btn.disabled = false;
        btn.textContent = 'Criar Conta';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cpf').addEventListener('input', e => {
        e.target.value = formatarCPF(e.target.value);
    });
    document.getElementById('btnCadastrar').addEventListener('click', cadastrar);
});