// js/usuarios.js

// Expõe a listagem globalmente para que o db-config.js consiga chamá-la no atualizarTudo()
window.listarUsuarios = function(termo = '') {
    const tabela = document.getElementById('tabelaUsuarios');
    if (!tabela) return;
    tabela.innerHTML = '';
    
    let contador = 0;
    const busca = termo.toLowerCase().trim();
    
    // Busca dados diretamente da memória do arquivo Excel
    let usuarios = window.bibliotecaDados?.usuarios || [];

    // Ordenação alfabética simples por nome do usuário
    usuarios.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));

    usuarios.forEach(u => {
        if (!busca || (u.nome || '').toLowerCase().includes(busca) || (u.telefone || '').toLowerCase().includes(busca)) {
            contador++;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>👤 ${u.nome}</strong></td>
                <td>${u.telefone || '—'}</td>
                <td>${u.email || '—'}</td>
                <td class="text-right">
                    <button type="button" class="btn-salvar" style="padding: 4px 8px; font-size: 0.85rem; background-color: #2563eb;" onclick="window.prepararEdicaoUsuario(${u.id})">✏️</button>
                    <button type="button" class="btn-cancelar" style="padding: 4px 8px; font-size: 0.85rem; display: inline-block;" onclick="window.deletarUsuario(${u.id})">🗑️</button>
                </td>
            `;
            tabela.appendChild(tr);
        }
    });

    const totalContainer = document.getElementById('totalUsuarios');
    if (totalContainer) totalContainer.innerText = contador;
    
    if (contador === 0) {
        tabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #9ca3af;">Nenhum usuário encontrado.</td></tr>`;
    }
};

window.resetarFormUsuario = function() {
    const form = document.getElementById('usuarioForm');
    const usuarioId = document.getElementById('usuarioId');
    if (form) form.reset();
    if (usuarioId) usuarioId.value = "";
    
    document.getElementById('formTituloUsuario').innerText = "Cadastrar Novo Usuário"; 
    document.getElementById('btnSalvarUsuario').innerText = "Salvar Usuário"; 
    document.getElementById('btnCancelarUsuario').style.display = "none";
};

window.prepararEdicaoUsuario = function(id) {
    let usuarios = window.bibliotecaDados?.usuarios || [];
    const u = usuarios.find(usuario => usuario.id === parseInt(id, 10));
    if (!u) return;
    
    document.getElementById('usuarioId').value = u.id; 
    document.getElementById('nomeUsuario').value = u.nome; 
    document.getElementById('telefoneUsuario').value = u.telefone || ''; 
    document.getElementById('emailUsuario').value = u.email || '';
    
    document.getElementById('formTituloUsuario').innerText = "Editar Usuário"; 
    document.getElementById('btnSalvarUsuario').innerText = "Atualizar Usuário"; 
    document.getElementById('btnCancelarUsuario').style.display = "inline-block";
    
    const form = document.getElementById('usuarioForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.deletarUsuario = function(id) {
    if (confirm("Excluir este usuário permanentemente?")) {
        if (window.bibliotecaDados) {
            window.bibliotecaDados.usuarios = window.bibliotecaDados.usuarios.filter(usuario => usuario.id !== parseInt(id, 10));
            if (typeof window.atualizarTudo === "function") window.atualizarTudo();
        }
    }
};

// Monitoramento dos eventos locais de digitação e envio
document.addEventListener("DOMContentLoaded", function() {
    const campoPesquisa = document.getElementById('campoPesquisaUsuario');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', e => window.listarUsuarios(e.target.value));
    }

    const btnCancelar = document.getElementById('btnCancelarUsuario');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', window.resetarFormUsuario);
    }

    const formUsuario = document.getElementById('usuarioForm');
    if (formUsuario) {
        formUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('usuarioId').value;
            const dados = { 
                nome: document.getElementById('nomeUsuario').value.trim(), 
                telefone: document.getElementById('telefoneUsuario').value.trim(), 
                email: document.getElementById('emailUsuario').value.trim() 
            };

            if (window.bibliotecaDados) {
                if (id) {
                    const index = window.bibliotecaDados.usuarios.findIndex(usuario => usuario.id === parseInt(id, 10));
                    if (index !== -1) {
                        window.bibliotecaDados.usuarios[index] = { ...dados, id: parseInt(id, 10) };
                    }
                } else {
                    const proximoId = window.bibliotecaDados.usuarios.length > 0 
                        ? Math.max(...window.bibliotecaDados.usuarios.map(u => u.id || 0)) + 1 
                        : 1;
                    window.bibliotecaDados.usuarios.push({ ...dados, id: proximoId });
                }
                
                window.resetarFormUsuario(); 
                if (typeof window.atualizarTudo === "function") window.atualizarTudo(); 
            }
        });
    }
});
