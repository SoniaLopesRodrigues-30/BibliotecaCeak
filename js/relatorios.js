// js/relatorios.js

// Função para formatar datas da tabela do Excel (AAAA-MM-DD) para formato BR (DD/MM/AAAA)
const formatarDataLocal = (dataISO) => {
    if (!dataISO) return "___/___/______";
    return dataISO.split("-").reverse().join("/");
};

// =================================================== 
// VERSÃO COMPACTA EXPANDIDA: FICHAS GERADAS A PARTIR DA TABELA DO EXCEL
// =================================================== 
window.imprimirFichasLivros = function() {
    // Busca as tabelas lidas diretamente do arquivo Excel carregado na memória RAM
    const livros = window.bibliotecaDados?.livros || [];
    const emprestimos = window.bibliotecaDados?.emprestimos || [];
    
    if (livros.length === 0) {
        alert("Não há dados de livros na tabela do Excel. Importe o arquivo primeiro.");
        return;
    }

    // Ordena os livros por ordem baseada no número inicial do código (idêntico ao js/emprestimos.js)
    const extrairNumeroInicial = (codigoStr) => {
        if (!codigoStr) return 0;
        const match = String(codigoStr).match(/^\d+/);
        return match ? parseInt(match, 10) : 0;
    };
    livros.sort((a, b) => extrairNumeroInicial(a.codigo) - extrairNumeroInicial(b.codigo));

    const janelaImpressao = window.open("", "_blank");
    
    let htmlFichas = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Fichas de Retirada - Excel</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 10px;
                    color: #000;
                    background: #fff;
                }
                /* Layout em duas colunas para aproveitar a folha impressa */
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
                    page-break-inside: avoid; /* Evita cortar a ficha no meio entre páginas */
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
                .linha-vazia td {
                    height: 22px;
                    color: #a3a3a3;
                    border-style: solid dotted;
                }
            </style>
        </head>
        <body>
            <div class="grade-fichas">
    `;

    livros.forEach(livro => {
        // CORREÇÃO: Varre o histórico convertendo e comparando os IDs exatamente como no js/emprestimos.js
        const idLivroAlvo = parseInt(livro.id, 10);
        const historicoLivro = emprestimos.filter(emp => parseInt(emp.livroId, 10) === idLivroAlvo);

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

        // 1. Mostra os registros reais salvos que vieram da tabela do Excel para este livro
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

        // 2. Garante o total de 7 linhas por ficha (completando com no mínimo 3 linhas pontilhadas em branco)
        const linhasFaltantes = Math.max(7 - linhasRenderizadas, 3); 
        
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
};

// Ativa o gatilho de impressão ao clicar no botão após a página carregar
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
