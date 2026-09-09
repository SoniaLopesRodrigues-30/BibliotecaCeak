// js/relatorios.js

// Função para buscar todos os dados de forma assíncrona
const buscarDadosTabela = (nomeTabela) => {
    return new Promise((resolve) => {
        if (typeof transacaoDB === "function") {
            transacaoDB(nomeTabela, "readonly", store => {
                const req = store.getAll();
                req.onsuccess = e => resolve(e.target.result || []);
                req.onerror = () => resolve([]);
            });
        } else {
            resolve([]);
        }
    });
};

// Função para formatar datas ISO (AAAA-MM-DD) para BR (DD/MM/AAAA)
const formatarDataLocal = (dataISO) => {
    if (!dataISO) return "___/___/______";
    return dataISO.split("-").reverse().join("/");
};

// =================================================== 
// VERSÃO COMPACTA EXPANDIDA: FICHAS COM 7 LINHAS DE DATAS
// =================================================== 
window.imprimirFichasLivros = function() {
    Promise.all([
        buscarDadosTabela("livros"),
        buscarDadosTabela("emprestimos"),
        buscarDadosTabela("usuarios")
    ]).then(([livros, emprestimos, usuarios]) => {
        
        if (livros.length === 0) {
            alert("Não há livros cadastrados no acervo para gerar fichas.");
            return;
        }

        // Ordena por ordem decrescente de código
        livros.sort((a, b) => String(b.codigo || "").localeCompare(String(a.codigo || ""), 'pt-BR', { numeric: true }));

        const janelaImpressao = window.open("", "_blank");
        
        let htmlFichas = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Fichas Compactas de Retirada</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 10px;
                        color: #000;
                        background: #fff;
                    }
                    /* Layout em duas colunas na folha para maximizar o espaço */
                    .grade-fichas {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
                        gap: 15px;
                    }
                    .ficha-compacta {
                        border: 1.5px solid #000;
                        padding: 10px;
                        box-sizing: border-box;
                        background: #fff;
                        page-break-inside: avoid; /* Impede o corte da ficha entre folhas */
                        font-size: 0.85rem;
                    }
                    .info-livro {
                        margin-bottom: 6px;
                        border-bottom: 1.5px solid #000;
                        padding-bottom: 4px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .info-livro strong {
                        font-size: 0.9rem;
                    }
                    .codigo-badge {
                        font-family: monospace;
                        font-weight: bold;
                        background-color: #f3f4f6;
                        padding: 1px 4px;
                        border: 1px solid #000;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 4px 6px;
                        text-align: center;
                        font-size: 0.8rem;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    /* Linhas manuais compactas com efeito pontilhado elegante */
                    .linha-vazia td {
                        height: 22px;
                        color: #a3a3a3;
                        border-style: solid dotted; /* Bordas internas das colunas pontilhadas */
                    }
                </style>
            </head>
            <body>
                <div class="grade-fichas">
        `;

        livros.forEach(livro => {
            const historicoLivro = emprestimos.filter(emp => parseInt(emp.livroId, 10) === parseInt(livro.id, 10));

            htmlFichas += `
                <div class="ficha-compacta">
                    <div class="info-livro">
                        <span class="codigo-badge">${livro.codigo || "-"}</span> 
                        <strong>${livro.titulo || "Sem Título"}</strong>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">Data Retirada</th>
                                <th style="width: 50%;">Data Devolução</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            let linhasRenderizadas = 0;

            // Mostra os registros reais existentes no banco para este livro
            if (historicoLivro.length > 0) {
                historicoLivro.forEach(emp => {
                    htmlFichas += `
                        <tr>
                            <td>${formatarDataLocal(emp.dataRetirada)}</td>
                            <td>${formatarDataLocal(emp.dataDevolucao)}</td>
                        </tr>
                    `;
                    linhasRenderizadas++;
                });
            }

            // CORREÇÃO: Garante um total de 7 linhas por ficha (completando com linhas em branco)
            const linhasFaltantes = Math.max(7 - linhasRenderizadas, 3); // Garante no mínimo 3 linhas em branco mesmo se houver muito histórico
            
            for (let i = 0; i < linhasFaltantes; i++) {
                htmlFichas += `
                    <tr class="linha-vazia">
                        <td>.. / .. / ....</td>
                        <td>.. / .. / ....</td>
                    </tr>
                `;
            }

            htmlFichas += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        htmlFichas += `
                </div>
            </body>
            </html>
        `;

        janelaImpressao.document.write(htmlFichas);
        janelaImpressao.document.close();
        
        janelaImpressao.onload = function() {
            janelaImpressao.print();
            janelaImpressao.close();
        };
    }).catch(err => {
        console.error("Erro ao gerar fichas expandidas:", err);
        alert("Ocorreu um erro ao carregar as fichas dos livros.");
    });
};

// Ativa o gatilho de impressão quando o DOM estiver pronto e mapeia o botão da Central de Backup
document.addEventListener("DOMContentLoaded", function() {
    const btnFichas = document.getElementById("btnImprimirFichas");
    if (btnFichas) {
        btnFichas.addEventListener("click", function() {
            if (typeof window.imprimirFichasLivros === "function") {
                window.imprimirFichasLivros();
            }
        });
    }
});
