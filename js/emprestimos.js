// js/emprestimos.js

window.carregarSelects = function() {
    if (!document.getElementById('selectLivro')) return;

    // Pega as listas síncronas diretamente da memória Excel
    const emprestimos = window.bibliotecaDados?.emprestimos || [];
    const livros = window.bibliotecaDados?.livros || [];
    const usuarios = window.bibliotecaDados?.usuarios || [];
    
    const emprestadosIds = emprestimos.map(emp => parseInt(emp.livroId, 10)).filter(Boolean);

    const extrairNumeroInicial = (codigoStr) => {
        if (!codigoStr) return 0;
        const match = String(codigoStr).match(/^\d+/);
        return match ? parseInt(match, 10) : 0;
    };

    livros.sort((a, b) => extrairNumeroInicial(a.codigo) - extrairNumeroInicial(b.codigo));

    const selectLivro = document.getElementById('selectLivro');
    if (selectLivro) {
        selectLivro.innerHTML = '<option value="">-- Escolha um livro disponível --</option>';
        livros.forEach(l => {
            const idLivro = parseInt(l.id, 10);
            if (!emprestadosIds.includes(idLivro)) {
                const opt = document.createElement('option');
                opt.value = idLivro;
                opt.textContent = `[${l.codigo || '-'}] ${l.titulo || 'Sem Título'}`;
                selectLivro.appendChild(opt);
            }
        });
    }

    usuarios.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));

    const selectUsuario = document.getElementById('selectUsuario');
    if (selectUsuario) {
        selectUsuario.innerHTML = '<option value="">-- Escolha um usuário cadastrado --</option>';
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = parseInt(u.id, 10);
            opt.textContent = u.nome || `Usuário #${u.id}`; 
            selectUsuario.appendChild(opt);
        });
    }
};

window.listarEmprestimos = function(termoPesquisa = "") {
    const tabelaCorpo = document.getElementById("tabelaEmprestimos");
    if (!tabelaCorpo) return;

    const emprestimos = window.bibliotecaDados?.emprestimos || [];
    const livros = window.bibliotecaDados?.livros || [];
    const usuarios = window.bibliotecaDados?.usuarios || [];

    tabelaCorpo.innerHTML = "";
    let contadorEmprestados = 0;

    emprestimos.forEach(emp => {
        const livro = livros.find(l => l.id === emp.livroId);
        const usuario = usuarios.find(u => u.id === emp.usuarioId);

        const tituloLivro = livro ? livro.titulo : "Livro não encontrado";
        const codigoLivro = livro ? livro.codigo : "-";
        const nomeUsuario = usuario ? usuario.nome : "Usuário não encontrado";
        const dataEmp = emp.dataRetirada ? emp.dataRetirada.split("-").reverse().join("/") : "-";
        const dataDev = emp.dataDevolucao ? emp.dataDevolucao.split("-").reverse().join("/") : "-";

        const termo = termoPesquisa.toLowerCase().trim();
        if (termo && !tituloLivro.toLowerCase().includes(termo) && !nomeUsuario.toLowerCase().includes(termo) && !codigoLivro.toLowerCase().includes(termo)) {
            return;
        }

        contadorEmprestados++;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${codigoLivro}</strong></td>
            <td>${tituloLivro}</td>
            <td>${nomeUsuario}</td>
            <td>${dataEmp}</td>
            <td>${dataDev}</td>
            <td class="text-right">
                <button type="button" class="btn-cancelar" style="background-color: #059669; color: white; display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: 500;" onclick="window.darBaixaEmprestimo(${emp.id})">
                    ✓ Dar Baixa
                </button>
            </td>
        `;
        tabelaCorpo.appendChild(tr);
    });

    const totalEmpBadge = document.getElementById("totalEmprestados");
    if (totalEmpBadge) totalEmpBadge.textContent = contadorEmprestados;

    if (contadorEmprestados === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #9ca3af; padding: 1.5rem;">Nenhum livro emprestado no momento.</td></tr>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const campoPesquisa = document.getElementById('campoPesquisaEmprestimo');
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', e => window.listarEmprestimos(e.target.value));
    }

    const formEmprestimo = document.getElementById('emprestimoForm');
    if (formEmprestimo) {
        formEmprestimo.addEventListener('submit', e => {
            e.preventDefault();
            
            const livroId = parseInt(document.getElementById('selectLivro')?.value, 10);
            const usuarioId = parseInt(document.getElementById('selectUsuario')?.value, 10);
            const dataRetirada = document.getElementById('dataRetirada')?.value;
            const dataDevolucao = document.getElementById('dataDevolucao')?.value;

            if (!livroId || !usuarioId || !dataRetirada || !dataDevolucao) {
                alert("Por favor, preencha todos os campos obrigatórios!");
                return;
            }

            if (window.bibliotecaDados) {
                const proximoId = window.bibliotecaDados.emprestimos.length > 0 
                    ? Math.max(...window.bibliotecaDados.emprestimos.map(emp => emp.id || 0)) + 1 
                    : 1;

                window.bibliotecaDados.emprestimos.push({
                    id: proximoId,
                    livroId,
                    usuarioId,
                    dataRetirada,
                    dataDevolucao
                });

                alert("Empréstimo registrado na memória!");
                formEmprestimo.reset();
                if (typeof window.atualizarTudo === "function") window.atualizarTudo();
            }
        });
    }

    // Vincula os botões da Central Excel criados no index.html
    const inputCarregar = document.getElementById('carregarExcelInput');
    if (inputCarregar) {
        inputCarregar.addEventListener('change', e => {
            if (typeof window.processarArquivoExcel === "function") window.processarArquivoExcel(e);
        });
    }

    const btnSalvar = document.getElementById('btnSalvarExcel');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => {
            if (typeof window.gerarPlanilhaExcel === "function") window.gerarPlanilhaExcel();
        });
    }
});

window.darBaixaEmprestimo = function(id) {
    if (confirm("Confirmar devolução e baixa do livro?")) {
        if (window.bibliotecaDados) {
            window.bibliotecaDados.emprestimos = window.bibliotecaDados.emprestimos.filter(emp => emp.id !== parseInt(id, 10));
            if (typeof window.atualizarTudo === "function") window.atualizarTudo();
        }
    }
};
