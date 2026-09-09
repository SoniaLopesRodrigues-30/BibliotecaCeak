// js/db-config.js

// O sistema armazena os dados em memória RAM compartilhada enquanto está aberto
window.bibliotecaDados = {
    livros: [],
    usuarios: [],
    emprestimos: []
};

// Atalhos utilitários para o ecossistema de scripts
var el = id => document.getElementById(id);
var formatarDataBR = dataISO => dataISO ? dataISO.split('-').reverse().join('/') : '—';

// ===================================================
// 1. FUNÇÃO DE ENTRADA: LEITURA E IMPLANTAÇÃO DO CSV
// ===================================================
window.processarArquivoExcel = function(evento) {
    var arquivo = evento.target.files ? evento.target.files[0] : null;
    if (!arquivo) return;

    var leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            var texto = e.target.result;
            
            // Normaliza quebras de linha do Windows/Mac/Excel para evitar falhas de quebra
            texto = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
            
            // Separa o arquivo consolidado pelas seções identificadoras
            var partes = texto.split("=== ");
            
            var extrairTabela = function(identificador) {
                var parteEncontrada = partes.find(function(p) { return p.indexOf(identificador) === 0; });
                if (!parteEncontrada) return [];
                
                var linhas = parteEncontrada.split("\n");
                linhas.shift(); // Remove a linha do título da seção (ex: LIVROS ===)
                
                if (linhas.length === 0) return [];
                
                // DETECTOR AUTOMÁTICO DE SEPARADOR: Descobre se o Excel salvou com ponto e vírgula (;) ou vírgula (,)
                var primeiraLinhaDados = linhas[0] || "";
                var separador = ";";
                if (primeiraLinhaDados.indexOf(";") === -1 && primeiraLinhaDados.indexOf(",") !== -1) {
                    separador = ",";
                }
                
                var cabecalho = linhas.shift().replace(/\ufeff/g, "").trim().split(separador);
                var resultado = [];
                
                linhas.forEach(function(linha) {
                    var linhaLimpa = linha.trim();
                    if (!linhaLimpa || linhaLimpa.indexOf("===") === 0) return; // Ignora linhas vazias ou próximas seções
                    
                    var colunas = linhaLimpa.split(separador);
                    var item = {};
                    
                    cabecalho.forEach(function(col, index) {
                        var nomeColuna = col.trim();
                        var val = colunas[index] || "";
                        item[nomeColuna] = val.trim();
                    });
                    
                    // Converte estritamente chaves de ID para inteiros para não quebrar buscas e edições
                    if (item.id) item.id = parseInt(item.id, 10);
                    if (item.ID) item.ID = parseInt(item.ID, 10);
                    if (item.livroId) item.livroId = parseInt(item.livroId, 10);
                    if (item.usuarioId) item.usuarioId = parseInt(item.usuarioId, 10);
                    
                    resultado.push(item);
                });
                return resultado;
            };

            // Abastece a memória viva global com as tabelas processadas
            window.bibliotecaDados.livros = extrairTabela("LIVROS ===");
            window.bibliotecaDados.usuarios = extrairTabela("USUARIOS ===");
            window.bibliotecaDados.emprestimos = extrairTabela("EMPRESTIMOS ===");

            // Atualiza o letreiro informativo da barra escura do topo
            var status = document.getElementById('statusArquivo');
            if (status) {
                status.innerText = "🟢 Banco Ativo: " + arquivo.name;
                status.style.color = "#059669";
            }

            // GATILHO FORÇADO: Dá uma folga de processamento para a RAM e redesenha as tabelas nas telas
            setTimeout(function() {
                if (typeof window.listarLivros === "function") window.listarLivros();
                if (typeof window.listarUsuarios === "function") window.listarUsuarios();
                if (typeof window.listarEmprestimos === "function") window.listarEmprestimos();
                if (typeof window.carregarSelects === "function") window.carregarSelects();
                if (typeof window.atualizarTudo === "function") window.atualizarTudo();
            }, 30);

            alert("Dados carregados com sucesso! " + window.bibliotecaDados.livros.length + " livros prontos no acervo.");

        } catch (err) {
            console.error(err);
            alert("Erro ao ler o arquivo de dados. Certifique-se de selecionar o arquivo correto.");
        }
    };
    leitor.readAsText(arquivo, "UTF-8");
};

// ===================================================
// 2. FUNÇÃO DE SAÍDA: GERAÇÃO E DOWNLOAD DO CSV 
// ===================================================
window.gerarPlanilhaExcel = function() {
    try {
        var livros = window.bibliotecaDados?.livros || [];
        var usuarios = window.bibliotecaDados?.usuarios || [];
        var emprestimos = window.bibliotecaDados?.emprestimos || [];

        // Converte os arrays internos estruturados para formato textual de banco CSV (Separador Ponto e Vírgula)
        var converterParaCSV = function(dados, colunas) {
            var linhas = [colunas.join(";")]; // Gera a linha de cabeçalhos
            
            dados.forEach(function(item) {
                var linha = colunas.map(function(col) {
                    var valor = item[col] !== undefined && item[col] !== null ? item[col] : "";
                    // Limpa quebras de linha ou caracteres delimitadores de dentro do texto do campo
                    return String(valor).replace(/[\n\r;]/g, " ");
                });
                linhas.push(linha.join(";"));
            });
            
            return linhas.join("\n");
        };

        // Consolida as três coleções operacionais
        var csvLivros = converterParaCSV(livros, ["id", "codigo", "titulo", "autor", "genero"]);
        var csvUsuarios = converterParaCSV(usuarios, ["id", "nome", "telefone", "email"]);
        var csvEmprestimos = converterParaCSV(emprestimos, ["id", "livroId", "usuarioId", "dataRetirada", "dataDevolucao"]);

        // Monta o arquivo consolidado mestre
        var conteudoConsolidado = "=== LIVROS ===\n" + csvLivros + 
                                  "\n\n=== USUARIOS ===\n" + csvUsuarios + 
                                  "\n\n=== EMPRESTIMOS ===\n" + csvEmprestimos;

        // Dispara o download como documento de texto/csv imune a quebras de acentuação (BOM UTF-8)
        var blob = new Blob(["\ufeff" + conteudoConsolidado], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        var dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        
        link.href = URL.createObjectURL(blob);
        link.download = "banco_biblioteca_ceak_" + dataAtual + ".csv";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert("Arquivo de dados baixado com sucesso como: 'banco_biblioteca_ceak_" + dataAtual + ".csv'!");
    } catch (err) {
        console.error(err);
        alert("Erro ao baixar o arquivo: " + err.message);
    }
};

// ===================================================
// 3. ROTINA GERAL DE ATUALIZAÇÃO DA INTERFACE
// ===================================================
window.atualizarTudo = function() {
    if (typeof window.listarLivros === "function") window.listarLivros();
    if (typeof window.listarUsuarios === "function") window.listarUsuarios();
    if (typeof window.listarEmprestimos === "function") window.listarEmprestimos();
    if (typeof window.carregarSelects === "function") window.carregarSelects();

    var campoData = el('dataRetirada');
    if (campoData && !campoData.value) {
        campoData.value = new Date().toISOString().slice(0, 10);
    }
};
