const acoesKey = 'voluntario-acoes';
let acoes = JSON.parse(localStorage.getItem(acoesKey)) || [];

const tabelaAcoes = document.getElementById('tabela-acoes');
const totalAcoesEl = document.getElementById('total-acoes');
const acoesPendentesEl = document.getElementById('acoes-pendentes');
const acoesEmAndamentoEl = document.getElementById('acoes-em-andamento');
const acoesConcluidasEl = document.getElementById('acoes-concluidas');
const modal = document.getElementById('modal-acao');
const formAcao = document.getElementById('form-acao');
const acaoIdInput = document.getElementById('acao-id');
const modalTitulo = document.getElementById('modal-titulo');

// FUNÇÕES PRINCIPAIS DE CRUD E RENDERIZAÇÃO
function renderizarAcoes() {
    tabelaAcoes.innerHTML = '';
    acoes.forEach(acao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${acao.nome}</div>
                <div class="text-sm text-gray-500">${acao.objetivo}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${acao.comunidade}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${acao.responsavel}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-opacity-20 bg-current" data-status="${acao.status}">${acao.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editarAcao('${acao.id}')" class="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                <button onclick="excluirAcao('${acao.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
        `;
        tabelaAcoes.appendChild(tr);
    });
    atualizarDashboard();
}

function salvarAcoes() {
    localStorage.setItem(acoesKey, JSON.stringify(acoes));
}

function atualizarDashboard() {
    totalAcoesEl.textContent = acoes.length;
    acoesPendentesEl.textContent = acoes.filter(a => a.status === 'Pendente').length;
    acoesEmAndamentoEl.textContent = acoes.filter(a => a.status === 'Em Andamento').length;
    acoesConcluidasEl.textContent = acoes.filter(a => a.status === 'Concluída').length;
}

function abrirModal(acao = null) {
    modal.classList.add('open');
    if (acao) {
        modalTitulo.textContent = 'Editar Ação';
        acaoIdInput.value = acao.id;
        document.getElementById('acao-nome').value = acao.nome;
        document.getElementById('acao-comunidade').value = acao.comunidade;
        document.getElementById('acao-responsavel').value = acao.responsavel;
        document.getElementById('acao-objetivo').value = acao.objetivo;
        document.getElementById('acao-status').value = acao.status;
    } else {
        modalTitulo.textContent = 'Adicionar Nova Ação';
        formAcao.reset();
        acaoIdInput.value = '';
    }
}

function fecharModal() {
    modal.classList.remove('open');
}

function excluirAcao(id) {
    if (confirm('Tem certeza que deseja excluir esta ação?')) {
        acoes = acoes.filter(acao => acao.id !== id);
        salvarAcoes();
        renderizarAcoes();
    }
}

function editarAcao(id) {
    const acao = acoes.find(a => a.id === id);
    if (acao) {
        abrirModal(acao);
        
    }
}

// EVENT LISTENERS
// Adiciona um listener para fechar o modal quando clicar no botão 'x' ou fora da área branca
document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);

modal.addEventListener('click', (e) => {
    // Verifica se o clique foi diretamente no plano de fundo escuro do modal
    if (e.target.id === 'modal-acao') {
        fecharModal();
    }    
});

// Fechar modal ao clicar no X
document.getElementById('btn-fechar-modal').onclick = function() {
    document.getElementById('modal-acao').style.display = 'none';
};

// Opcional: abrir modal ao clicar no botão "Adicionar Ação"
document.getElementById('btn-abrir-modal').onclick = function() {
    document.getElementById('modal-acao').style.display = 'flex';
};

// Opcional: esconder modal ao carregar a página
window.onload = function() {
    document.getElementById('modal-acao').style.display = 'none';
};

formAcao.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = acaoIdInput.value;
    const novaAcao = {
        nome: document.getElementById('acao-nome').value,
        comunidade: document.getElementById('acao-comunidade').value,
        responsavel: document.getElementById('acao-responsavel').value,
        objetivo: document.getElementById('acao-objetivo').value,
        status: document.getElementById('acao-status').value,
    };

    if (id) {
        const index = acoes.findIndex(a => a.id === id);
        if (index !== -1) {
            acoes[index] = { ...acoes[index], ...novaAcao };
        }
    } else {
        novaAcao.id = 'acao-' + Date.now();
        acoes.push(novaAcao);
    }

    salvarAcoes();
    renderizarAcoes();
    fecharModal();
});

// FUNÇÕES DE IMPORTAÇÃO/EXPORTAÇÃO
document.getElementById('btn-exportar').addEventListener('click', () => {
    const dataStr = JSON.stringify(acoes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acoes_voluntariado.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('btn-importar').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedAcoes = JSON.parse(event.target.result);
                    if (Array.isArray(importedAcoes)) {
                        acoes = importedAcoes;
                        salvarAcoes();
                        renderizarAcoes();
                        alert('Dados importados com sucesso!');
                    } else {
                        alert('O arquivo JSON não contém uma lista válida de ações.');
                    }
                } catch (error) {
                    alert('Erro ao ler o arquivo JSON. Certifique-se de que o formato está correto.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
});

// Inicialização
renderizarAcoes();