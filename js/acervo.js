// js/acervo.js
let tempoEsperaCodigo;

// ===================================================
// 1. LISTAGEM DOS LIVROS NA TELA
// ===================================================
window.listarLivros = function(termoPesquisa = "") {
    const tabelaCorpo = document.getElementById("tabelaLivros");
    if (!tabelaCorpo) return;

    let livros = window.bibliotecaDados?.livros || [];

    // Ordenação alfabética e numérica DECRESCENTE pelo código
    livros.sort((a, b) => String(b.codigo || b.CODIGO || "").localeCompare(String(a.codigo || a.CODIGO || ""), 'pt-BR', { numeric: true }));

    tabelaCorpo.innerHTML = ""; 
    let contadorResultados = 0;

    livros.forEach(l => {
        const codigo = l.codigo || l.CODIGO || l.Código || l.CÓDIGO || '-';
        const titulo = l.titulo || l.TITULO || l.Título || l.TÍTULO || l.tituloLivro || 'Sem título';
        const autor = l.autor || l.AUTOR || l.Autor || 'Não informado';
        const genero = l.genero || l.GENERO || l.Gênero || l.GÊNERO || l.categoria || '-';
        const idAtual = l.id || l.ID || "";

        const termo = termoPesquisa.toLowerCase().trim();
        
        if (termo && 
            !String(titulo).toLowerCase().includes(termo) && 
            !String(codigo).toLowerCase().includes(termo) &&
            !String(autor).toLowerCase().includes(termo)) {
            return;
        }

        contadorResultados++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="col-codigo"><strong>${codigo}</strong></td>
            <td class="txt-titulo">${titulo}</td>
            <td>${autor}</td>
            <td>${genero}</td>
            <td class="text-right">
                <!-- CORREÇÃO: Passa o ID como string escapada para evitar quebras -->
                <button type="button" class="btn-salvar" style="padding: 4px 8px; font-size: 0.85rem; background-color: #2563eb;" onclick="window.prepararEdicaoLivro('${idAtual}')">✏️</button>
                <button type="button" class="btn-cancelar" style="padding: 4px 8px; font-size: 0.85rem; display: inline-block;" onclick="window.deletarLivro('${idAtual}')">🗑️</button>
            </td>
        `;
        tabelaCorpo.appendChild(tr);
    });

    const totalResultados = document.getElementById("totalLivros");
    if (totalResultados) totalResultados.textContent = contadorResultados;

    if (contadorResultados === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #9ca3af;">Nenhum livro encontrado no acervo.</td></tr>`;
    }
};

// ===================================================
// 2. VERIFICAÇÃO AUTOMÁTICA DE DUPLICIDADE POR CÓDIGO
// ===================================================
window.verificarDuplicidadeLivro = function() {
    const livroId = document.getElementById('livroId');
    const codigoInput = document.getElementById('codigo');
    
    if (livroId && livroId.value) return; 
    if (!codigoInput) return;
    
    const codigoDigitado = codigoInput.value.trim().toLowerCase();
    if (!codigoDigitado) return;

    clearTimeout(tempoEsperaCodigo);
    tempoEsperaCodigo = setTimeout(() => {
        let livros = window.bibliotecaDados?.livros || [];
        const l = livros.find(livro => String(livro.codigo || '').toLowerCase() === codigoDigitado);
        
        if (l) {
            document.getElementById('livroId').value = l.id || l.ID || ""; 
            document.getElementById('titulo').value = l.titulo || l.TITULO || ''; 
            document.getElementById('autor').value = l.autor || l.AUTOR || ''; 
            document.getElementById('genero').value = l.genero || l.GENERO || '';
            
            document.getElementById('formTituloLivro').innerText = "Editar Livro (Encontrado via Código)";
            document.getElementById('btnSalvarLivro').innerText = "Atualizar Livro";
            document.getElementById('btnCancelarLivro').style.display = "inline-block";
        }
    }, 150);
};

// ===================================================
// 3. RESETAR E LIMPAR CAMPOS DO FORMULÁRIO
// ===================================================
window.resetarFormLivro = function(darFoco = true) {
    const form = document.getElementById('livroForm');
    const livroId = document.getElementById('livroId');
    if (form) form.reset();
    if (livroId) livroId.value = "";
    
    const formTitulo = document.getElementById('formTituloLivro');
    const btnSalvar = document.getElementById('btnSalvarLivro');
    const btnCancelar = document.getElementById('btnCancelarLivro');

    if (formTitulo) formTitulo.innerText = "Cadastrar Novo Livro"; 
    if (btnSalvar) btnSalvar.innerText = "Salvar Livro"; 
    if (btnCancelar) btnCancelar.style.display = "none";
    
    if (darFoco) {
        const codigoInput = document.getElementById('codigo');
        if (codigoInput) codigoInput.focus();
    }
};

// ===================================================
// 4. PREPARAR CARREGAMENTO PARA EDIÇÃO NO FORMULÁRIO
// ===================================================
window.prepararEdicaoLivro = function(id) {
    let livros = window.bibliotecaDados?.livros || [];
    // CORREÇÃO: Comparação segura convertendo ambos os lados para String
    const l = livros.find(livro => String(livro.id || livro.ID || "").trim() === String(id).trim());
    if (!l) return;
    
    document.getElementById('livroId').value = l.id || l.ID || ""; 
    document.getElementById('codigo').value = l.codigo || l.CODIGO || ''; 
    document.getElementById('titulo').value = l.titulo || l.TITULO || ''; 
    document.getElementById('autor').value = l.autor || l.AUTOR || ''; 
    document.getElementById('genero').value = l.genero || l.GENERO || '';
    
    document.getElementById('formTituloLivro').innerText = "Editar Livro"; 
    document.getElementById('btnSalvarLivro').innerText = "Atualizar Livro"; 
    document.getElementById('btnCancelarLivro').style.display = "inline-block";
    
    const form = document.getElementById('livroForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// ===================================================
// 5. EXCLUSÃO DE LIVRO DA MEMÓRIA ATUAL
// ===================================================
window.deletarLivro = function(id) {
    if (confirm("Excluir este livro permanentemente da memória atual?")) {
        if (window.bibliotecaDados) {
            // CORREÇÃO: Filtra comparando os IDs como String para evitar incompatibilidade
            window.bibliotecaDados.livros = window.bibliotecaDados.livros.filter(livro => 
                String(livro.id || livro.ID || "").trim() !== String(id).trim()
            );
            if (typeof window.atualizarTudo === "function") window.atualizarTudo();
        }
    }
};

// ===================================================
// 6. MONITORAMENTO E ESCUTAS DE CLIQUES DA TELA
// ===================================================
document.addEventListener("DOMContentLoaded", function() {
    const campoPesquisa = document.getElementById('campoPesquisaLivro');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', e => window.listarLivros(e.target.value));
    }

    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) {
        campoCodigo.addEventListener('input', window.verificarDuplicidadeLivro);
    }

    const btnCancelar = document.getElementById('btnCancelarLivro');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => window.resetarFormLivro(true));
    }

    const formLivro = document.getElementById('livroForm');
    if (formLivro) {
        formLivro.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const id = document.getElementById('livroId').value;
            const dados = { 
                codigo: document.getElementById('codigo').value.trim(), 
                titulo: document.getElementById('titulo').value.trim(), 
                autor: document.getElementById('autor').value.trim(), 
                genero: document.getElementById('genero').value 
            };

            if (window.bibliotecaDados) {
                if (id) {
                    // Modo Edição - CORREÇÃO: Localiza o índice tratando o ID como String
                    const index = window.bibliotecaDados.livros.findIndex(livro => 
                        String(livro.id || livro.ID || "").trim() === String(id).trim()
                    );
                    if (index !== -1) {
                        // Mantém a chave original do ID (seja id ou ID) para não quebrar a estrutura vinda do Excel
                        const chaveId = window.bibliotecaDados.livros[index].ID ? 'ID' : 'id';
                        window.bibliotecaDados.livros[index] = { ...dados, [chaveId]: id };
                    }
                } else {
                    // Modo Cadastro
                    const proximoId = window.bibliotecaDados.livros.length > 0 
                        ? Math.max(...window.bibliotecaDados.livros.map(l => parseInt(l.id || l.ID || 0, 10))) + 1 
                        : 1;
                    window.bibliotecaDados.livros.push({ ...dados, id: String(proximoId) });
                }
                
                window.resetarFormLivro(true); 
                
                if (typeof window.atualizarTudo === "function") {
                    window.atualizarTudo();
                } else if (typeof window.listarLivros === "function") {
                    window.listarLivros();
                }
                
                alert("Alteração gravada na memória! Lembre-se de clicar no botão VERDE do topo para baixar o arquivo definitivo.");
            }
        });
    }
});
