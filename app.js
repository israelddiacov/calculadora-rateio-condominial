/**
 * Calculadora de Rateio de Água - Condomínio 6 Apartamentos
 * Lógica de cálculo, persistência e interface interativa
 */

// 1. Dados Padrão Iniciais do Prédio
const CONFIG_PADRAO = {
  taxaComumPercent: 0, // Parcela comum configurada inicialmente em 0% conforme solicitado
  apartamentos: [
    {
      id: 1,
      nome: 'Apartamento 01',
      andar: '1º Andar',
      tipo: 'Residencial',
      ocupantesDesc: '1 adulto',
      peso: 1.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 2,
      nome: 'Apartamento 02',
      andar: '1º Andar',
      tipo: 'Comercial',
      ocupantesDesc: 'Salão de Cabeleireiro',
      peso: 4.0,
      badgeClass: 'badge-comercial'
    },
    {
      id: 3,
      nome: 'Apartamento 03',
      andar: '2º Andar',
      tipo: 'Residencial',
      ocupantesDesc: '3 adultos',
      peso: 3.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 4,
      nome: 'Apartamento 04',
      andar: '2º Andar',
      tipo: 'Comercial',
      ocupantesDesc: 'Dentista Protético',
      peso: 2.5,
      badgeClass: 'badge-comercial'
    },
    {
      id: 5,
      nome: 'Apartamento 05',
      andar: '3º Andar',
      tipo: 'Residencial',
      ocupantesDesc: '4 adultos',
      peso: 4.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 6,
      nome: 'Apartamento 06',
      andar: '3º Andar',
      tipo: 'Residencial',
      ocupantesDesc: '3 adultos',
      peso: 3.0,
      badgeClass: 'badge-residencial'
    }
  ]
};

// Estado da Aplicação
let configAtual = carregarConfiguracao();
let chartPizza = null;
let chartBarras = null;

// Formatação Monetária BRL
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
};

const formatarNumero = (valor, decimais = 2) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais
  }).format(valor || 0);
};

// -------------------------------------------------------------
// Armazenamento Local (localStorage)
// -------------------------------------------------------------
function carregarConfiguracao() {
  try {
    const salvo = localStorage.getItem('calc_agua_config_v1');
    if (salvo) {
      return JSON.parse(salvo);
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage:', e);
  }
  return JSON.parse(JSON.stringify(CONFIG_PADRAO));
}

function salvarConfiguracao(novaConfig) {
  try {
    localStorage.setItem('calc_agua_config_v1', JSON.stringify(novaConfig));
    configAtual = novaConfig;
    mostrarToast('Configurações salvas com sucesso!');
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
}

function resetarConfiguracao() {
  configAtual = JSON.parse(JSON.stringify(CONFIG_PADRAO));
  localStorage.removeItem('calc_agua_config_v1');
  mostrarToast('Configurações restauradas para o padrão inicial!');
}

// -------------------------------------------------------------
// Notificações Toast
// -------------------------------------------------------------
function mostrarToast(mensagem) {
  const toast = document.getElementById('toast-msg');
  if (!toast) return;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${mensagem}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// -------------------------------------------------------------
// Algoritmo de Cálculo Preciso com Ajuste de Centavos
// -------------------------------------------------------------
function calcularRateio(valorTotal, volumeTotal = 0) {
  const taxaComumPct = (configAtual.taxaComumPercent || 0) / 100;
  const numAps = configAtual.apartamentos.length;
  
  // Parcela Comum (divisão igualitária)
  const valorTotalComum = Math.round(valorTotal * taxaComumPct * 100) / 100;
  const valorTotalConsumo = valorTotal - valorTotalComum;
  
  // Divisão da taxa comum em 6 partes
  const comumPorApBase = Math.floor((valorTotalComum / numAps) * 100) / 100;
  let centavosComumSobra = Math.round((valorTotalComum - (comumPorApBase * numAps)) * 100);

  // Soma de todos os pesos
  const somaPesos = configAtual.apartamentos.reduce((acc, ap) => acc + Number(ap.peso), 0);
  const custoPorPonto = somaPesos > 0 ? (valorTotalConsumo / somaPesos) : 0;

  // Cálculo individual
  const resultados = configAtual.apartamentos.map((ap, index) => {
    // Parcela Comum com distribuição de centavos residuais
    let parcelaComum = comumPorApBase;
    if (centavosComumSobra > 0) {
      parcelaComum += 0.01;
      centavosComumSobra--;
    }

    // Parcela Consumo proporcional
    const consumoCalculado = (Number(ap.peso) * custoPorPonto);
    const volumeEstimado = somaPesos > 0 ? ((Number(ap.peso) / somaPesos) * volumeTotal) : 0;

    return {
      ...ap,
      parcelaComum: Math.round(parcelaComum * 100) / 100,
      parcelaConsumoCrua: consumoCalculado,
      volumeEstimado: Math.round(volumeEstimado * 10) / 10
    };
  });

  // Ajuste fino de centavos na parcela de consumo (Largest Remainder Method)
  // Garante que a soma total seja 100% exata ao centavo da conta
  let somaConsumoArredondado = 0;
  resultados.forEach(item => {
    item.parcelaConsumo = Math.floor(item.parcelaConsumoCrua * 100) / 100;
    item.fracaoResidual = (item.parcelaConsumoCrua * 100) - Math.floor(item.parcelaConsumoCrua * 100);
    somaConsumoArredondado += item.parcelaConsumo;
  });

  let centavosConsumoSobra = Math.round((valorTotalConsumo - somaConsumoArredondado) * 100);
  
  // Ordena por maior fração residual para distribuir centavos faltantes
  const ordenadosPorSobra = [...resultados].sort((a, b) => b.fracaoResidual - a.fracaoResidual);
  for (let i = 0; i < centavosConsumoSobra; i++) {
    ordenadosPorSobra[i % ordenadosPorSobra.length].parcelaConsumo += 0.01;
  }

  // Montagem final do total a pagar
  resultados.forEach(item => {
    item.parcelaConsumo = Math.round(item.parcelaConsumo * 100) / 100;
    item.totalPagar = Math.round((item.parcelaComum + item.parcelaConsumo) * 100) / 100;
    item.percentual = valorTotal > 0 ? ((item.totalPagar / valorTotal) * 100) : (100 / numAps);
  });

  return {
    valorTotal,
    valorTotalComum,
    valorTotalConsumo,
    somaPesos,
    custoPorPonto,
    taxaComumPct,
    volumeTotal,
    resultados
  };
}

// -------------------------------------------------------------
// Renderização da Interface
// -------------------------------------------------------------
function atualizarTela() {
  const inputValor = document.getElementById('input-valor');
  const inputMes = document.getElementById('input-mes');
  const inputVolume = document.getElementById('input-volume');
  const inputVencimento = document.getElementById('input-vencimento');

  const valorTotal = parseFloat(inputValor.value) || 0;
  const volumeTotal = parseFloat(inputVolume.value) || 0;
  const mesRef = inputMes.value.trim() || 'Mês Atual';
  const vencimento = inputVencimento.value;

  const dados = calcularRateio(valorTotal, volumeTotal);

  // Atualizar Indicador de Taxa Comum no Formulário
  const lblTaxaComum = document.getElementById('lbl-taxa-comum');
  if (lblTaxaComum) {
    if (configAtual.taxaComumPercent === 0) {
      lblTaxaComum.innerHTML = `<strong>0% (Desativada)</strong>`;
    } else {
      lblTaxaComum.innerHTML = `<strong>${configAtual.taxaComumPercent}% (${formatarMoeda(dados.valorTotalComum)})</strong>`;
    }
  }

  // Atualizar Cards de Resumo Superior
  document.getElementById('resumo-total').textContent = formatarMoeda(valorTotal);
  document.getElementById('resumo-pesos').textContent = `${formatarNumero(dados.somaPesos, 1)} pts`;
  document.getElementById('resumo-custo-ponto').textContent = formatarMoeda(dados.custoPorPonto);
  
  const comumPorApMedia = dados.resultados.length > 0 ? (dados.valorTotalComum / dados.resultados.length) : 0;
  document.getElementById('resumo-comum-ap').textContent = formatarMoeda(comumPorApMedia);

  // Preencher Tabela Desktop
  const tabelaCorpo = document.getElementById('tabela-corpo');
  tabelaCorpo.innerHTML = '';

  // Preencher Cards Mobile
  const mobileContainer = document.getElementById('mobile-cards');
  mobileContainer.innerHTML = '';

  let totalComumVerif = 0;
  let totalConsumoVerif = 0;
  let totalGeralVerif = 0;

  dados.resultados.forEach(item => {
    totalComumVerif += item.parcelaComum;
    totalConsumoVerif += item.parcelaConsumo;
    totalGeralVerif += item.totalPagar;

    const volumeTxt = volumeTotal > 0 ? `${formatarNumero(item.volumeEstimado, 1)} m³` : '-';

    // 1. Linha da Tabela
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.nome}</strong></td>
      <td><span class="badge badge-andar">${item.andar}</span></td>
      <td><span class="badge ${item.badgeClass}">${item.tipo}: ${item.ocupantesDesc}</span></td>
      <td class="text-center"><strong>${formatarNumero(item.peso, 1)}</strong></td>
      <td class="text-right text-muted">${formatarMoeda(item.parcelaComum)}</td>
      <td class="text-right">${formatarMoeda(item.parcelaConsumo)}</td>
      <td class="text-right ap-total-destaque">${formatarMoeda(item.totalPagar)}</td>
      <td class="text-center"><strong>${formatarNumero(item.percentual, 1)}%</strong></td>
      <td class="text-center text-muted">${volumeTxt}</td>
    `;
    tabelaCorpo.appendChild(tr);

    // 2. Card Mobile
    const cardMob = document.createElement('div');
    cardMob.className = 'mobile-card-ap';
    cardMob.innerHTML = `
      <div class="mobile-card-top">
        <strong>${item.nome} (${item.andar})</strong>
        <span class="badge ${item.badgeClass}">${item.tipo}</span>
      </div>
      <div class="mobile-card-desc">
        <i class="fa-solid fa-tag"></i> ${item.ocupantesDesc} &bull; <strong>Peso: ${formatarNumero(item.peso, 1)} pts</strong>
      </div>
      <div class="mobile-card-line">
        <span class="text-muted">Taxa de Área Comum:</span>
        <span>${formatarMoeda(item.parcelaComum)}</span>
      </div>
      <div class="mobile-card-line">
        <span class="text-muted">Consumo Individual:</span>
        <span>${formatarMoeda(item.parcelaConsumo)}</span>
      </div>
      ${volumeTotal > 0 ? `
      <div class="mobile-card-line">
        <span class="text-muted">Consumo Estimado:</span>
        <span>${volumeTxt}</span>
      </div>` : ''}
      <div class="mobile-card-total">
        <span><strong>Total a Pagar:</strong></span>
        <span class="ap-total-destaque">${formatarMoeda(item.totalPagar)}</span>
      </div>
    `;
    mobileContainer.appendChild(cardMob);
  });

  // Totais do Rodapé da Tabela
  document.getElementById('tfoot-peso-total').innerHTML = `<strong>${formatarNumero(dados.somaPesos, 1)} pts</strong>`;
  document.getElementById('tfoot-comum-total').innerHTML = `<strong>${formatarMoeda(totalComumVerif)}</strong>`;
  document.getElementById('tfoot-consumo-total').innerHTML = `<strong>${formatarMoeda(totalConsumoVerif)}</strong>`;
  document.getElementById('tfoot-geral-total').innerHTML = `<strong>${formatarMoeda(totalGeralVerif)}</strong>`;
  document.getElementById('tfoot-volume-total').innerHTML = volumeTotal > 0 ? `<strong>${formatarNumero(volumeTotal, 1)} m³</strong>` : '<strong>-</strong>';

  // Cabeçalho de Impressão
  const printMeta = document.getElementById('print-meta-info');
  if (printMeta) {
    let vencTxt = '';
    if (vencimento) {
      const d = vencimento.split('-');
      vencTxt = ` | Vencimento: ${d[2]}/${d[1]}/${d[0]}`;
    }
    printMeta.innerHTML = `
      <strong>Referência:</strong> ${mesRef}${vencTxt}<br>
      <strong>Valor Fatura:</strong> ${formatarMoeda(valorTotal)} ${volumeTotal > 0 ? `(${formatarNumero(volumeTotal, 1)} m³)` : ''}
    `;
  }

  // Atualizar Gráficos
  atualizarGraficos(dados);
}

// -------------------------------------------------------------
// Gráficos Chart.js
// -------------------------------------------------------------
function atualizarGraficos(dados) {
  const nomes = dados.resultados.map(r => r.nome);
  const valores = dados.resultados.map(r => r.totalPagar);
  const percentuais = dados.resultados.map(r => r.percentual.toFixed(1));

  const cores = [
    '#38bdf8', // Ap 1 (Azul claro)
    '#f97316', // Ap 2 (Laranja Salão)
    '#60a5fa', // Ap 3 (Azul)
    '#a855f7', // Ap 4 (Roxo Protético)
    '#3b82f6', // Ap 5 (Azul Royal)
    '#0284c7'  // Ap 6 (Ciano Escuro)
  ];

  // Gráfico Pizza / Rosca
  const ctxPizza = document.getElementById('chart-pizza')?.getContext('2d');
  if (ctxPizza) {
    if (chartPizza) chartPizza.destroy();
    chartPizza = new Chart(ctxPizza, {
      type: 'doughnut',
      data: {
        labels: nomes,
        datasets: [{
          data: valores,
          backgroundColor: cores,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${formatarMoeda(context.raw)} (${percentuais[context.dataIndex]}%)`
            }
          }
        }
      }
    });
  }

  // Gráfico Barras
  const ctxBarras = document.getElementById('chart-barras')?.getContext('2d');
  if (ctxBarras) {
    if (chartBarras) chartBarras.destroy();
    chartBarras = new Chart(ctxBarras, {
      type: 'bar',
      data: {
        labels: nomes,
        datasets: [{
          label: 'Valor a Pagar (R$)',
          data: valores,
          backgroundColor: cores,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Total: ${formatarMoeda(context.raw)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`
            }
          }
        }
      }
    });
  }
}

// -------------------------------------------------------------
// Gerador de Mensagem para WhatsApp
// -------------------------------------------------------------
function copiarParaWhatsApp() {
  const inputValor = document.getElementById('input-valor');
  const inputMes = document.getElementById('input-mes');
  const inputVolume = document.getElementById('input-volume');
  const inputVencimento = document.getElementById('input-vencimento');

  const valorTotal = parseFloat(inputValor.value) || 0;
  const mesRef = inputMes.value.trim() || 'Mês Vigente';
  const volumeTotal = parseFloat(inputVolume.value) || 0;
  const vencimento = inputVencimento.value;

  if (valorTotal <= 0) {
    mostrarToast('Por favor, informe o valor da conta primeiro.');
    inputValor.focus();
    return;
  }

  const dados = calcularRateio(valorTotal, volumeTotal);

  let dataVencFormatada = '';
  if (vencimento) {
    const parts = vencimento.split('-');
    dataVencFormatada = `📅 *Vencimento:* ${parts[2]}/${parts[1]}/${parts[0]}\n`;
  }

  let volTxt = volumeTotal > 0 ? ` (${formatarNumero(volumeTotal, 1)} m³)` : '';

  let msg = `💧 *DEMONSTRATIVO DE RATEIO DA CONTA DE ÁGUA*\n`;
  msg += `🏢 *Condomínio - Referência:* ${mesRef}\n`;
  msg += `💰 *Valor Total da Fatura:* ${formatarMoeda(valorTotal)}${volTxt}\n`;
  if (dataVencFormatada) msg += dataVencFormatada;
  
  if (configAtual.taxaComumPercent > 0) {
    msg += `⚖️ *Critério:* ${configAtual.taxaComumPercent}% Área Comum (${formatarMoeda(dados.valorTotalComum)}) + Consumo Ponderado\n`;
  } else {
    msg += `⚖️ *Critério:* Rateio Ponderado por Ocupantes / Atividade Comercial\n`;
  }
  msg += `----------------------------------------\n`;
  msg += `*VALORES POR APARTAMENTO:*\n\n`;

  dados.resultados.forEach(item => {
    msg += `🔹 *${item.nome}* (${item.tipo} - ${item.ocupantesDesc})\n`;
    msg += `   └ *Valor a pagar: ${formatarMoeda(item.totalPagar)}* (${formatarNumero(item.percentual, 1)}%)\n\n`;
  });

  msg += `----------------------------------------\n`;
  msg += `✅ *Total Conferido:* ${formatarMoeda(valorTotal)}\n`;
  msg += `🔗 *Ver demonstrativo online detalhado:* ${window.location.href}\n`;
  msg += `_Favor realizar o pagamento até a data do vencimento._`;

  navigator.clipboard.writeText(msg).then(() => {
    mostrarToast('Texto formatado copiado! Basta colar no grupo do WhatsApp.');
  }).catch(() => {
    // Fallback caso clipboard API falhe
    const textarea = document.createElement('textarea');
    textarea.value = msg;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    mostrarToast('Texto copiado com sucesso!');
  });
}

// -------------------------------------------------------------
// Compartilhar Link com Valores na URL
// -------------------------------------------------------------
function compartilharLink() {
  const inputValor = document.getElementById('input-valor');
  const inputMes = document.getElementById('input-mes');
  const inputVolume = document.getElementById('input-volume');
  const inputVencimento = document.getElementById('input-vencimento');

  const params = new URLSearchParams();
  if (inputValor.value) params.set('valor', inputValor.value);
  if (inputMes.value) params.set('mes', inputMes.value);
  if (inputVolume.value) params.set('m3', inputVolume.value);
  if (inputVencimento.value) params.set('venc', inputVencimento.value);

  const urlFinal = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

  navigator.clipboard.writeText(urlFinal).then(() => {
    mostrarToast('Link direto com os valores copiado para a área de transferência!');
  });
}

function carregarValoresDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const valor = params.get('valor');
  const mes = params.get('mes');
  const m3 = params.get('m3');
  const venc = params.get('venc');

  if (valor) document.getElementById('input-valor').value = valor;
  if (mes) document.getElementById('input-mes').value = mes;
  if (m3) document.getElementById('input-volume').value = m3;
  if (venc) document.getElementById('input-vencimento').value = venc;

  // Valor padrão de demonstração se URL estiver limpa e campo vazio
  if (!valor && !document.getElementById('input-valor').value) {
    document.getElementById('input-valor').value = '1000.00';
    document.getElementById('input-mes').value = 'Outubro / 2026';
    document.getElementById('input-volume').value = '42';
  }
}

// -------------------------------------------------------------
// Modal de Configurações
// -------------------------------------------------------------
function abrirModalConfig() {
  const modal = document.getElementById('modal-config');
  const rangeTaxa = document.getElementById('cfg-taxa-comum');
  const lblTaxa = document.getElementById('cfg-taxa-comum-val');
  const corpoTabela = document.getElementById('config-tabela-corpo');

  rangeTaxa.value = configAtual.taxaComumPercent || 0;
  lblTaxa.textContent = rangeTaxa.value;

  rangeTaxa.oninput = () => {
    lblTaxa.textContent = rangeTaxa.value;
  };

  corpoTabela.innerHTML = '';
  configAtual.apartamentos.forEach((ap, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${ap.nome}</strong></td>
      <td>${ap.andar}</td>
      <td>
        <select class="cfg-tipo" data-index="${index}">
          <option value="Residencial" ${ap.tipo === 'Residencial' ? 'selected' : ''}>Residencial</option>
          <option value="Comercial" ${ap.tipo === 'Comercial' ? 'selected' : ''}>Comercial</option>
        </select>
      </td>
      <td>
        <input type="text" class="cfg-desc" data-index="${index}" value="${ap.ocupantesDesc}" />
      </td>
      <td>
        <input type="number" step="0.5" min="0.5" class="cfg-peso" data-index="${index}" value="${ap.peso}" />
      </td>
    `;
    corpoTabela.appendChild(tr);
  });

  modal.classList.add('open');
}

function fecharModalConfig() {
  document.getElementById('modal-config').classList.remove('open');
}

function salvarAlteracoesConfig() {
  const rangeTaxa = document.getElementById('cfg-taxa-comum');
  const novaTaxa = parseInt(rangeTaxa.value, 10) || 0;

  const inputsTipo = document.querySelectorAll('.cfg-tipo');
  const inputsDesc = document.querySelectorAll('.cfg-desc');
  const inputsPeso = document.querySelectorAll('.cfg-peso');

  const novosAps = configAtual.apartamentos.map((ap, index) => {
    const tipo = inputsTipo[index].value;
    const ocupantesDesc = inputsDesc[index].value.trim() || ap.ocupantesDesc;
    const peso = parseFloat(inputsPeso[index].value) || 1.0;
    const badgeClass = tipo === 'Comercial' ? 'badge-comercial' : 'badge-residencial';

    return {
      ...ap,
      tipo,
      ocupantesDesc,
      peso,
      badgeClass
    };
  });

  const novaConfig = {
    taxaComumPercent: novaTaxa,
    apartamentos: novosAps
  };

  salvarConfiguracao(novaConfig);
  fecharModalConfig();
  atualizarTela();
}

// -------------------------------------------------------------
// Inicialização de Eventos
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarValoresDaUrl();

  // Eventos de Input e Recálculo em Tempo Real
  ['input-valor', 'input-mes', 'input-volume', 'input-vencimento'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', atualizarTela);
  });

  document.getElementById('btn-calcular')?.addEventListener('click', () => {
    atualizarTela();
    mostrarToast('Cálculo atualizado!');
  });

  // Ações
  document.getElementById('btn-copiar-whatsapp')?.addEventListener('click', copiarParaWhatsApp);
  document.getElementById('btn-compartilhar-link')?.addEventListener('click', compartilharLink);
  document.getElementById('btn-imprimir')?.addEventListener('click', () => window.print());

  // Modais
  document.getElementById('btn-config')?.addEventListener('click', abrirModalConfig);
  document.getElementById('btn-alterar-taxa')?.addEventListener('click', abrirModalConfig);
  document.getElementById('btn-close-config')?.addEventListener('click', fecharModalConfig);
  document.getElementById('btn-salvar-config')?.addEventListener('click', salvarAlteracoesConfig);
  document.getElementById('btn-reset-config')?.addEventListener('click', () => {
    if (confirm('Deseja restaurar as configurações para os valores de fábrica do condomínio?')) {
      resetarConfiguracao();
      abrirModalConfig();
      atualizarTela();
    }
  });

  // Modal Explicação
  const modalExplica = document.getElementById('modal-explica');
  document.getElementById('btn-explica')?.addEventListener('click', () => modalExplica.classList.add('open'));
  document.getElementById('btn-close-explica')?.addEventListener('click', () => modalExplica.classList.remove('open'));
  document.getElementById('btn-ok-explica')?.addEventListener('click', () => modalExplica.classList.remove('open'));

  // Fechar modais ao clicar no fundo
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
    }
  });

  // Primeira renderização
  atualizarTela();
});
