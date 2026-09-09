// js/app.js

document.addEventListener("DOMContentLoaded", function() {
    console.log("Sistema Biblioteca CEAK carregado com sucesso!");
    console.log("Modo de operacao: Arquivo Consolidado (.csv)");

    // Executa a atualizacao inicial das tabelas vazias
    if (typeof window.atualizarTudo === "function") {
        window.atualizarTudo();
    }

    // 1) Escuta o campo de abrir/carregar o arquivo de dados
    const inputCarregar = document.getElementById('carregarExcelInput');
    if (inputCarregar) {
        inputCarregar.addEventListener('change', function(e) {
            if (typeof window.processarArquivoExcel === "function") {
                window.processarArquivoExcel(e);
            } else {
                alert("A funcao de leitura ainda nao foi carregada no db-config.js");
            }
        });
    }

    // 2) Escuta o botao verde de salvar as alteracoes
    const botaoVerdeTopo = document.getElementById('btnSalvarExcelTopo');
    if (botaoVerdeTopo) {
        botaoVerdeTopo.onclick = function() {
            if (typeof window.gerarPlanilhaExcel === "function") {
                window.gerarPlanilhaExcel();
            } else {
                alert("A funcao de salvamento ainda nao foi carregada no db-config.js");
            }
        };
    }
});
