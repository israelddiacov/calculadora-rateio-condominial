/**
 * Calculadora Universal de Rateio Condominial
 * Divisão justa e proporcional de despesas compartilhadas (Água, Gás, Luz, Manutenção, etc.)
 */

// 1. Tipos de Despesas Pré-configurados
const TIPOS_DESPESA = {
  agua: {
    nome: 'Água e Esgoto',
    icone: 'fa-droplet',
    corIcone: '#0284c7',
    temVolume: true,
    unidadeVolume: 'm³',
    labelVolume: 'Consumo Total (m³)',
    placeholderVolume: 'Ex: 40',
    emoji: '💧'
  },
  gas: {
    nome: 'Gás Central',
    icone: 'fa-fire-flame-simple',
    corIcone: '#ea580c',
    temVolume: true,
    unidadeVolume: 'm³',
    labelVolume: 'Consumo Total (m³ ou kg)',
    placeholderVolume: 'Ex: 25',
    emoji: '🔥'
  },
  energia: {
    nome: 'Energia Elétrica',
    icone: 'fa-bolt',
    corIcone: '#eab308',
    temVolume: true,
    unidadeVolume: 'kWh',
    labelVolume: 'Consumo Total (kWh)',
    placeholderVolume: 'Ex: 280',
    emoji: '⚡'
  },
  limpeza: {
    nome: 'Limpeza e Faxina',
    icone: 'fa-broom',
    corIcone: '#10b981',
    temVolume: false,
    unidadeVolume: '',
    labelVolume: '',
    placeholderVolume: '',
    emoji: '🧹'
  },
  manutencao: {
    nome: 'Manutenção e Obras',
    icone: 'fa-wrench',
    corIcone: '#6366f1',
    temVolume: false,
    unidadeVolume: '',
    labelVolume: '',
    placeholderVolume: '',
    emoji: '🛠️'
  },
  outro: {
    nome: 'Despesa Compartilhada',
    icone: 'fa-file-invoice-dollar',
    corIcone: '#64748b',
    temVolume: false,
    unidadeVolume: '',
    labelVolume: '',
    placeholderVolume: '',
    emoji: '📋'
  }
};

// 2. Dados de Demonstração Inicial (Exemplo Didático e Equilibrado)
const CONFIG_PADRAO = {
  tipoDespesaKey: 'agua',
  nomeCustomDespesa: '',
  taxaComumPercent: 0,
  unidades: [
    {
      id: 1,
      nome: 'Unidade 101',
      local: '1º Andar',
      tipo: 'Residencial',
      descricao: '1 morador',
      peso: 1.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 2,
      nome: 'Unidade 102',
      local: '1º Andar',
      tipo: 'Residencial',
      descricao: '2 moradores',
      peso: 2.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 3,
      nome: 'Unidade 201',
      local: '2º Andar',
      tipo: 'Residencial',
      descricao: '3 moradores',
      peso: 3.0,
      badgeClass: 'badge-residencial'
    },
    {
      id: 4,
      nome: 'Unidade 202',
      local: '2º Andar',
      tipo: 'Comercial',
      descricao: 'Comércio / Atividade Diferenciada',
      peso: 2.0,
      badgeClass: 'badge-comercial'
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
    const salvo = localStorage.getItem('calc_rateio_universal_v2');
    if (salvo) {
      const parsed = JSON.parse(salvo);
      // Compatibilidade
      if (parsed.apartamentos && !parsed.unidades) {
        parsed.unidades = parsed.apartamentos;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage:', e);
  }
  return JSON.parse(JSON.stringify(CONFIG_PADRAO));
}

function salvarConfiguracao(novaConfig) {
  try {
    localStorage.setItem('calc_rateio_universal_v2', JSON.stringify(novaConfig));
    configAtual = novaConfig;
    mostrarToast('Configurações salvas com sucesso!');
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
}

function resetarConfiguracao() {
  configAtual = JSON.parse(JSON.stringify(CONFIG_PADRAO));
  localStorage.removeItem('calc_rateio_universal_v2');
  mostrarToast('Configurações restauradas para o exemplo padrão!');
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
// Sistema de Tooltip Pop-up Flutuante
// -------------------------------------------------------------
function inicializarTooltips() {
  const tooltip = document.getElementById('floating-tooltip');
  if (!tooltip) return;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      const text = target.getAttribute('data-tooltip');
      if (text) {
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        posicionarTooltip(e, tooltip);
      }
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (tooltip.classList.contains('visible')) {
      posicionarTooltip(e, tooltip);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      tooltip.classList.remove('visible');
    }
  });
}

function posicionarTooltip(e, tooltip) {
  const padding = 12;
  let x = e.clientX + padding;
  let y = e.clientY + padding;

  // Evita ultrapassar a borda direita da tela
  if (x + tooltip.offsetWidth > window.innerWidth - 10) {
    x = e.clientX - tooltip.offsetWidth - padding;
  }

  // Evita ultrapassar o fundo da tela
  if (y + tooltip.offsetHeight > window.innerHeight - 10) {
    y = e.clientY - tooltip.offsetHeight - padding;
  }

  tooltip.style.left = `${Math.max(10, x)}px`;
  tooltip.style.top = `${Math.max(10, y)}px`;
}

// -------------------------------------------------------------
// Obtenção dos Metadados da Despesa Atual
// -------------------------------------------------------------
function getMetaDespesaAtual() {
  const key = configAtual.tipoDespesaKey || 'agua';
  const base = TIPOS_DESPESA[key] || TIPOS_DESPESA.agua;
  
  let nomeExibicao = base.nome;
  if (key === 'outro' && configAtual.nomeCustomDespesa) {
    nomeExibicao = configAtual.nomeCustomDespesa;
  }

  return {
    ...base,
    key,
    nomeFinal: nomeExibicao
  };
}

// -------------------------------------------------------------
// Algoritmo de Cálculo Preciso com Ajuste de Centavos
// -------------------------------------------------------------
function calcularRateio(valorTotal, volumeTotal = 0) {
  const taxaComumPct = (configAtual.taxaComumPercent || 0) / 100;
  const numUnidades = configAtual.unidades.length || 1;
  
  // Parcela Fixa Mínima (divisão igualitária)
  const valorTotalComum = Math.round(valorTotal * taxaComumPct * 100) / 100;
  const valorTotalConsumo = valorTotal - valorTotalComum;
  
  // Divisão da taxa comum em partes iguais
  const comumPorUnidadeBase = Math.floor((valorTotalComum / numUnidades) * 100) / 100;
  let centavosComumSobra = Math.round((valorTotalComum - (comumPorUnidadeBase * numUnidades)) * 100);

  // Soma de todos os pesos
  const somaPesos = configAtual.unidades.reduce((acc, u) => acc + (parseFloat(u.peso) || 1), 0);
  const custoPorPonto = somaPesos > 0 ? (valorTotalConsumo / somaPesos) : 0;

  // Cálculo individual
  const resultados = configAtual.unidades.map((u) => {
    let parcelaComum = comumPorUnidadeBase;
    if (centavosComumSobra > 0) {
      parcelaComum += 0.01;
      centavosComumSobra--;
    }

    const p = parseFloat(u.peso) || 1;
    const consumoCalculado = p * custoPorPonto;
    const volumeEstimado = somaPesos > 0 ? ((p / somaPesos) * volumeTotal) : 0;

    return {
      ...u,
      peso: p,
      parcelaComum: Math.round(parcelaComum * 100) / 100,
      parcelaConsumoCrua: consumoCalculado,
      volumeEstimado: Math.round(volumeEstimado * 10) / 10
    };
  });

  // Ajuste fino de centavos na parcela de consumo (Largest Remainder Method)
  let somaConsumoArredondado = 0;
  resultados.forEach(item => {
    item.parcelaConsumo = Math.floor(item.parcelaConsumoCrua * 100) / 100;
    item.fracaoResidual = (item.parcelaConsumoCrua * 100) - Math.floor(item.parcelaConsumoCrua * 100);
    somaConsumoArredondado += item.parcelaConsumo;
  });

  let centavosConsumoSobra = Math.round((valorTotalConsumo - somaConsumoArredondado) * 100);
  const ordenadosPorSobra = [...resultados].sort((a, b) => b.fracaoResidual - a.fracaoResidual);
  for (let i = 0; i < centavosConsumoSobra; i++) {
    ordenadosPorSobra[i % ordenadosPorSobra.length].parcelaConsumo += 0.01;
  }

  // Montagem final do total a pagar
  resultados.forEach(item => {
    item.parcelaConsumo = Math.round(item.parcelaConsumo * 100) / 100;
    item.totalPagar = Math.round((item.parcelaComum + item.parcelaConsumo) * 100) / 100;
    item.percentual = valorTotal > 0 ? ((item.totalPagar / valorTotal) * 100) : (100 / numUnidades);
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
  const meta = getMetaDespesaAtual();

  // 1. Atualizar Título e Ícones do Cabeçalho
  const headerIcon = document.getElementById('header-logo-icon');
  if (headerIcon) {
    headerIcon.innerHTML = `<i class="fa-solid ${meta.icone}"></i>`;
  }
  document.getElementById('header-title').textContent = `Rateio de ${meta.nomeFinal}`;
  document.getElementById('header-subtitle').textContent = `Divisão justa e transparente para condomínios e prédios compartilhados`;
  document.getElementById('badge-tipo-despesa').textContent = meta.nomeFinal;

  // 2. Controle do campo de medição física (m³, kWh, etc.)
  const boxVolume = document.getElementById('box-campo-volume');
  const txtLabelVolume = document.getElementById('txt-label-volume');
  const inputVolume = document.getElementById('input-volume');
  const thVolume = document.getElementById('th-consumo-estimado');

  if (meta.temVolume) {
    boxVolume.style.display = 'flex';
    txtLabelVolume.textContent = meta.labelVolume;
    inputVolume.placeholder = meta.placeholderVolume;
    thVolume.style.display = '';
  } else {
    boxVolume.style.display = 'none';
    thVolume.style.display = 'none';
  }

  // 3. Captura dos Dados do Formulário
  const inputValor = document.getElementById('input-valor');
  const inputMes = document.getElementById('input-mes');
  const inputVencimento = document.getElementById('input-vencimento');

  const valorTotal = parseFloat(inputValor.value) || 0;
  const volumeTotal = meta.temVolume ? (parseFloat(inputVolume.value) || 0) : 0;
  const mesRef = inputMes.value.trim() || 'Mês Atual';
  const vencimento = inputVencimento.value;

  const dados = calcularRateio(valorTotal, volumeTotal);

  // 4. Atualizar Indicador de Taxa Fixa
  const lblTaxaComum = document.getElementById('lbl-taxa-comum');
  if (lblTaxaComum) {
    if (configAtual.taxaComumPercent === 0) {
      lblTaxaComum.innerHTML = `<strong>0% (Desativada)</strong>`;
    } else {
      lblTaxaComum.innerHTML = `<strong>${configAtual.taxaComumPercent}% (${formatarMoeda(dados.valorTotalComum)})</strong>`;
    }
  }

  // 5. Atualizar Cards de Resumo Superior
  document.getElementById('resumo-total').textContent = formatarMoeda(valorTotal);
  document.getElementById('resumo-pesos').textContent = `${formatarNumero(dados.somaPesos, 1)} pts`;
  document.getElementById('resumo-custo-ponto').textContent = formatarMoeda(dados.custoPorPonto);
  
  const comumPorUnidadeMedia = dados.resultados.length > 0 ? (dados.valorTotalComum / dados.resultados.length) : 0;
  document.getElementById('resumo-comum-ap').textContent = formatarMoeda(comumPorUnidadeMedia);

  // 6. Preencher Tabela e Cards Mobile
  const tabelaCorpo = document.getElementById('tabela-corpo');
  tabelaCorpo.innerHTML = '';

  const mobileContainer = document.getElementById('mobile-cards');
  mobileContainer.innerHTML = '';

  let totalComumVerif = 0;
  let totalConsumoVerif = 0;
  let totalGeralVerif = 0;

  dados.resultados.forEach(item => {
    totalComumVerif += item.parcelaComum;
    totalConsumoVerif += item.parcelaConsumo;
    totalGeralVerif += item.totalPagar;

    const volumeTxt = (meta.temVolume && volumeTotal > 0) 
      ? `${formatarNumero(item.volumeEstimado, 1)} ${meta.unidadeVolume}` 
      : '-';

    // Linha da Tabela
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.nome}</strong></td>
      <td><span class="badge badge-andar">${item.local || 'Geral'}</span></td>
      <td><span class="badge ${item.badgeClass || 'badge-residencial'}">${item.tipo}: ${item.descricao}</span></td>
      <td class="text-center"><strong>${formatarNumero(item.peso, 1)}</strong></td>
      <td class="text-right text-muted">${formatarMoeda(item.parcelaComum)}</td>
      <td class="text-right">${formatarMoeda(item.parcelaConsumo)}</td>
      <td class="text-right ap-total-destaque">${formatarMoeda(item.totalPagar)}</td>
      <td class="text-center"><strong>${formatarNumero(item.percentual, 1)}%</strong></td>
      ${meta.temVolume ? `<td class="text-center text-muted">${volumeTxt}</td>` : ''}
    `;
    tabelaCorpo.appendChild(tr);

    // Card Mobile
    const cardMob = document.createElement('div');
    cardMob.className = 'mobile-card-ap';
    cardMob.innerHTML = `
      <div class="mobile-card-top">
        <strong>${item.nome} (${item.local || 'Geral'})</strong>
        <span class="badge ${item.badgeClass || 'badge-residencial'}">${item.tipo}</span>
      </div>
      <div class="mobile-card-desc">
        <i class="fa-solid fa-tag"></i> ${item.descricao} &bull; <strong>Peso: ${formatarNumero(item.peso, 1)} pts</strong>
      </div>
      <div class="mobile-card-line">
        <span class="text-muted">Parcela Fixa:</span>
        <span>${formatarMoeda(item.parcelaComum)}</span>
      </div>
      <div class="mobile-card-line">
        <span class="text-muted">Consumo Individual:</span>
        <span>${formatarMoeda(item.parcelaConsumo)}</span>
      </div>
      ${meta.temVolume && volumeTotal > 0 ? `
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
  
  const tfootVolume = document.getElementById('tfoot-volume-total');
  if (meta.temVolume) {
    tfootVolume.style.display = '';
    tfootVolume.innerHTML = volumeTotal > 0 ? `<strong>${formatarNumero(volumeTotal, 1)} ${meta.unidadeVolume}</strong>` : '<strong>-</strong>';
  } else {
    tfootVolume.style.display = 'none';
  }

  // Cabeçalho de Impressão
  document.getElementById('print-title').textContent = `Demonstrativo de Rateio: ${meta.nomeFinal}`;
  const printMeta = document.getElementById('print-meta-info');
  if (printMeta) {
    let vencTxt = '';
    if (vencimento) {
      const d = vencimento.split('-');
      vencTxt = ` | Vencimento: ${d[2]}/${d[1]}/${d[0]}`;
    }
    const volStr = (meta.temVolume && volumeTotal > 0) ? ` (${formatarNumero(volumeTotal, 1)} ${meta.unidadeVolume})` : '';
    printMeta.innerHTML = `
      <strong>Referência:</strong> ${mesRef}${vencTxt}<br>
      <strong>Valor Total da Fatura:</strong> ${formatarMoeda(valorTotal)}${volStr}
    `;
  }

  // 7. Atualizar Gráficos
  atualizarGraficos(dados);
}

// -------------------------------------------------------------
// Gráficos Chart.js
// -------------------------------------------------------------
function atualizarGraficos(dados) {
  const nomes = dados.resultados.map(r => r.nome);
  const valores = dados.resultados.map(r => r.totalPagar);
  const percentuais = dados.resultados.map(r => r.percentual.toFixed(1));

  const paletaCores = [
    '#0284c7', '#38bdf8', '#0ea5e9', '#0369a1',
    '#f97316', '#a855f7', '#10b981', '#f59e0b',
    '#6366f1', '#ec4899', '#14b8a6', '#84cc16'
  ];
  const cores = dados.resultados.map((_, i) => paletaCores[i % paletaCores.length]);

  // Gráfico Pizza
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
  const meta = getMetaDespesaAtual();
  const inputValor = document.getElementById('input-valor');
  const inputMes = document.getElementById('input-mes');
  const inputVolume = document.getElementById('input-volume');
  const inputVencimento = document.getElementById('input-vencimento');

  const valorTotal = parseFloat(inputValor.value) || 0;
  const mesRef = inputMes.value.trim() || 'Mês Vigente';
  const volumeTotal = meta.temVolume ? (parseFloat(inputVolume.value) || 0) : 0;
  const vencimento = inputVencimento.value;

  if (valorTotal <= 0) {
    mostrarToast('Por favor, informe o valor total da despesa primeiro.');
    inputValor.focus();
    return;
  }

  const dados = calcularRateio(valorTotal, volumeTotal);

  let dataVencFormatada = '';
  if (vencimento) {
    const parts = vencimento.split('-');
    dataVencFormatada = `📅 *Vencimento:* ${parts[2]}/${parts[1]}/${parts[0]}\n`;
  }

  let volTxt = (meta.temVolume && volumeTotal > 0) ? ` (${formatarNumero(volumeTotal, 1)} ${meta.unidadeVolume})` : '';

  let msg = `${meta.emoji} *DEMONSTRATIVO DE RATEIO - ${meta.nomeFinal.toUpperCase()}*\n`;
  msg += `🏢 *Condomínio / Referência:* ${mesRef}\n`;
  msg += `💰 *Valor Total da Fatura:* ${formatarMoeda(valorTotal)}${volTxt}\n`;
  if (dataVencFormatada) msg += dataVencFormatada;
  
  if (configAtual.taxaComumPercent > 0) {
    msg += `⚖️ *Critério:* ${configAtual.taxaComumPercent}% Parcela Fixa Compartilhada + Consumo Ponderado\n`;
  } else {
    msg += `⚖️ *Critério:* Rateio Proporcional Ponderado por Ocupação/Uso\n`;
  }
  msg += `----------------------------------------\n`;
  msg += `*VALORES POR UNIDADE:*\n\n`;

  dados.resultados.forEach(item => {
    msg += `🔹 *${item.nome}* (${item.tipo} - ${item.descricao})\n`;
    msg += `   └ *Valor a pagar: ${formatarMoeda(item.totalPagar)}* (${formatarNumero(item.percentual, 1)}%)\n\n`;
  });

  msg += `----------------------------------------\n`;
  msg += `✅ *Total Conferido:* ${formatarMoeda(valorTotal)}\n`;
  msg += `🔗 *Consultar demonstrativo online:* ${window.location.href}\n`;
  msg += `_Favor realizar o acerto até a data do vencimento._`;

  navigator.clipboard.writeText(msg).then(() => {
    mostrarToast('Mensagem copiada para o WhatsApp com sucesso!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = msg;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    mostrarToast('Mensagem copiada!');
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
  params.set('tipo', configAtual.tipoDespesaKey);
  if (configAtual.tipoDespesaKey === 'outro' && configAtual.nomeCustomDespesa) {
    params.set('custom', configAtual.nomeCustomDespesa);
  }
  if (inputValor.value) params.set('valor', inputValor.value);
  if (inputMes.value) params.set('mes', inputMes.value);
  if (inputVolume.value) params.set('vol', inputVolume.value);
  if (inputVencimento.value) params.set('venc', inputVencimento.value);

  const urlFinal = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

  navigator.clipboard.writeText(urlFinal).then(() => {
    mostrarToast('Link direto com os valores copiado!');
  });
}

function carregarValoresDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get('tipo');
  const custom = params.get('custom');
  const valor = params.get('valor');
  const mes = params.get('mes');
  const vol = params.get('vol');
  const venc = params.get('venc');

  if (tipo && TIPOS_DESPESA[tipo]) {
    configAtual.tipoDespesaKey = tipo;
  }
  if (custom) {
    configAtual.nomeCustomDespesa = custom;
    document.getElementById('input-custom-nome').value = custom;
  }

  if (valor) document.getElementById('input-valor').value = valor;
  if (mes) document.getElementById('input-mes').value = mes;
  if (vol) document.getElementById('input-volume').value = vol;
  if (venc) document.getElementById('input-vencimento').value = venc;

  // Se URL estiver limpa, carrega exemplo didático
  if (!valor && !document.getElementById('input-valor').value) {
    document.getElementById('input-valor').value = '600.00';
    document.getElementById('input-mes').value = 'Mês Atual';
    document.getElementById('input-volume').value = '35';
  }
}

// -------------------------------------------------------------
// Modal de Configurações das Unidades
// -------------------------------------------------------------
function abrirModalConfig() {
  const modal = document.getElementById('modal-config');
  const rangeTaxa = document.getElementById('cfg-taxa-comum');
  const lblTaxa = document.getElementById('cfg-taxa-comum-val');

  rangeTaxa.value = configAtual.taxaComumPercent || 0;
  lblTaxa.textContent = rangeTaxa.value;

  rangeTaxa.oninput = () => {
    lblTaxa.textContent = rangeTaxa.value;
  };

  renderizarTabelaConfig();
  modal.classList.add('open');
}

function renderizarTabelaConfig() {
  const corpoTabela = document.getElementById('config-tabela-corpo');
  corpoTabela.innerHTML = '';

  configAtual.unidades.forEach((u, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" class="cfg-nome" data-index="${index}" value="${u.nome}" placeholder="Ex: Ap 101, Sala 1" />
      </td>
      <td>
        <input type="text" class="cfg-local" data-index="${index}" value="${u.local || ''}" placeholder="Ex: 1º Andar" />
      </td>
      <td>
        <select class="cfg-tipo" data-index="${index}">
          <option value="Residencial" ${u.tipo === 'Residencial' ? 'selected' : ''}>Residencial</option>
          <option value="Comercial" ${u.tipo === 'Comercial' ? 'selected' : ''}>Comercial</option>
          <option value="Outro" ${u.tipo === 'Outro' ? 'selected' : ''}>Outro</option>
        </select>
      </td>
      <td>
        <input type="text" class="cfg-desc" data-index="${index}" value="${u.descricao}" placeholder="Ex: 2 moradores, Escritório..." />
      </td>
      <td>
        <input type="number" step="0.5" min="0.5" class="cfg-peso" data-index="${index}" value="${u.peso}" />
      </td>
      <td class="text-center">
        <button type="button" class="btn-danger-outline btn-del-unidade tooltip-btn" data-index="${index}" data-tooltip="Excluir esta unidade do cálculo">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });

  // Eventos de Exclusão de Linha
  corpoTabela.querySelectorAll('.btn-del-unidade').forEach(btn => {
    btn.onclick = (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      if (configAtual.unidades.length <= 2) {
        alert('O rateio precisa ter no mínimo 2 unidades para ser calculado.');
        return;
      }
      lerInputsConfigAtual();
      configAtual.unidades.splice(idx, 1);
      renderizarTabelaConfig();
    };
  });
}

function lerInputsConfigAtual() {
  const inputsNome = document.querySelectorAll('.cfg-nome');
  const inputsLocal = document.querySelectorAll('.cfg-local');
  const inputsTipo = document.querySelectorAll('.cfg-tipo');
  const inputsDesc = document.querySelectorAll('.cfg-desc');
  const inputsPeso = document.querySelectorAll('.cfg-peso');

  inputsNome.forEach((inp, index) => {
    if (configAtual.unidades[index]) {
      configAtual.unidades[index].nome = inp.value.trim() || `Unidade ${index + 1}`;
      configAtual.unidades[index].local = inputsLocal[index].value.trim() || 'Geral';
      configAtual.unidades[index].tipo = inputsTipo[index].value;
      configAtual.unidades[index].descricao = inputsDesc[index].value.trim() || 'Residencial';
      configAtual.unidades[index].peso = parseFloat(inputsPeso[index].value) || 1.0;
      configAtual.unidades[index].badgeClass = inputsTipo[index].value === 'Comercial' ? 'badge-comercial' : 'badge-residencial';
    }
  });
}

function adicionarNovaUnidade() {
  lerInputsConfigAtual();
  const proximoNumero = configAtual.unidades.length + 1;
  configAtual.unidades.push({
    id: Date.now(),
    nome: `Unidade ${proximoNumero}`,
    local: 'Geral',
    tipo: 'Residencial',
    descricao: '1 morador',
    peso: 1.0,
    badgeClass: 'badge-residencial'
  });
  renderizarTabelaConfig();
}

function fecharModalConfig() {
  document.getElementById('modal-config').classList.remove('open');
}

function salvarAlteracoesConfig() {
  lerInputsConfigAtual();
  const rangeTaxa = document.getElementById('cfg-taxa-comum');
  configAtual.taxaComumPercent = parseInt(rangeTaxa.value, 10) || 0;

  salvarConfiguracao(configAtual);
  fecharModalConfig();
  atualizarTela();
}

// -------------------------------------------------------------
// Configuração dos Chips de Tipo de Despesa
// -------------------------------------------------------------
function inicializarChipsTipo() {
  const chips = document.querySelectorAll('#chips-tipo-despesa .chip');
  const boxCustom = document.getElementById('box-custom-despesa');
  const inputCustom = document.getElementById('input-custom-nome');

  // Ativar chip salvo
  chips.forEach(chip => {
    const tipo = chip.getAttribute('data-tipo');
    if (tipo === configAtual.tipoDespesaKey) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }

    chip.onclick = () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      configAtual.tipoDespesaKey = tipo;
      if (tipo === 'outro') {
        boxCustom.style.display = 'block';
        inputCustom.focus();
      } else {
        boxCustom.style.display = 'none';
      }

      salvarConfiguracao(configAtual);
      atualizarTela();
    };
  });

  if (configAtual.tipoDespesaKey === 'outro') {
    boxCustom.style.display = 'block';
    if (configAtual.nomeCustomDespesa) {
      inputCustom.value = configAtual.nomeCustomDespesa;
    }
  }

  inputCustom.oninput = () => {
    configAtual.nomeCustomDespesa = inputCustom.value.trim();
    atualizarTela();
  };
}

// -------------------------------------------------------------
// Inicialização de Eventos
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  inicializarTooltips();
  carregarValoresDaUrl();
  inicializarChipsTipo();

  // Eventos de Recálculo em Tempo Real
  ['input-valor', 'input-mes', 'input-volume', 'input-vencimento'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', atualizarTela);
  });

  document.getElementById('btn-calcular')?.addEventListener('click', () => {
    atualizarTela();
    mostrarToast('Cálculo atualizado com sucesso!');
  });

  // Ações
  document.getElementById('btn-copiar-whatsapp')?.addEventListener('click', copiarParaWhatsApp);
  document.getElementById('btn-compartilhar-link')?.addEventListener('click', compartilharLink);
  document.getElementById('btn-imprimir')?.addEventListener('click', () => window.print());

  // Modais de Configuração
  document.getElementById('btn-config')?.addEventListener('click', abrirModalConfig);
  document.getElementById('btn-alterar-taxa')?.addEventListener('click', abrirModalConfig);
  document.getElementById('btn-close-config')?.addEventListener('click', fecharModalConfig);
  document.getElementById('btn-add-unidade')?.addEventListener('click', adicionarNovaUnidade);
  document.getElementById('btn-salvar-config')?.addEventListener('click', salvarAlteracoesConfig);
  document.getElementById('btn-reset-config')?.addEventListener('click', () => {
    if (confirm('Deseja restaurar as unidades para o modelo de exemplo padrão?')) {
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
