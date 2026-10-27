# 🏢 Calculadora Universal de Rateio Condominial

Aplicação web pública, interativa e de fácil acesso para calcular a **divisão justa, transparente e proporcional de despesas compartilhadas** em condomínios, vilas, conjuntos residenciais ou imóveis com perfil misto (residencial e comercial).

---

## 🚀 Acesso Online (GitHub Pages)

A aplicação está disponível publicamente para qualquer morador ou síndico acessar pelo celular ou computador:  
👉 **[https://israelddiacov.github.io/calculadora-rateio-condominial/](https://israelddiacov.github.io/calculadora-rateio-condominial/)**

---

## ✨ Recursos da Aplicação

- **Múltiplos Tipos de Despesas:**
  - 💧 **Água e Esgoto:** Hidrômetro unificado, com acompanhamento de volume em $\text{m}^3$.
  - 🔥 **Gás Central:** Botijão ou central de GLP compartilhada (acompanhamento em $\text{m}^3$ ou $\text{kg}$).
  - ⚡ **Energia Elétrica:** Conta compartilhada ou luz de áreas comuns (em $\text{kWh}$).
  - 🧹 **Limpeza e Faxina:** Produtos, diarista e manutenção predial.
  - 🛠️ **Manutenção e Obras:** Reformas, conserto de portão, interfone ou pintura.
  - ✏️ **Despesa Personalizada:** Permite digitar livremente o nome de qualquer rateio.
- **Divisão Ponderada por Ocupação e Atividade:**
  - Unidades residenciais recebem peso correspondente ao número de moradores (ex: 1 pessoa = 1.0 pto, 3 pessoas = 3.0 ptos).
  - Unidades comerciais ou comércios recebem pesos proporcionais à sua demanda de recursos.
- **Gerenciamento Dinâmico de Unidades:**
  - Adicione ou remova livremente quantos apartamentos, casas ou salas o condomínio possuir.
  - Ajuste nomes, andares, descrições e pesos a qualquer momento.
- **Balões Explicativos (Tooltips):**
  - Passe o mouse sobre qualquer campo ou botão para ver dicas instantâneas sobre o que preencher e como funciona.
- **Parcela Fixa Opcional:**
  - Permite destinar uma fração da conta (ex: 10%, 15% ou 20%) para ser dividida em cotas rigorosamente iguais entre todas as unidades (cobrindo tarifas de disponibilidade da rede ou despesas mínimas), rateando o restante pelos pesos.
- **Precisão Contábil de Centavos:**
  - Algoritmo financeiro (*Largest Remainder Method*) que garante que a soma dos boletos individuais feche **centavo por centavo** com a fatura da concessionária.
- **Comunicação Pronta para WhatsApp:**
  - Botão com 1 clique para gerar e copiar um relatório formatado com emojis, detalhes e instruções de pagamento.
- **Relatório Formal A4 (PDF):**
  - Botão para imprimir ou salvar em PDF em formato limpo para mídias físicas, mural ou prestação de contas.

---

## 🧮 Metodologia de Cálculo

1. **Parcela Fixa Compartilhada (se ativada):**
   $$\text{Valor Fixo Total} = \text{Valor da Fatura} \times \text{Percentual Fixo}$$
   $$\text{Cota Fixa por Unidade} = \frac{\text{Valor Fixo Total}}{\text{Total de Unidades}}$$

2. **Parcela Variável (Ponderada):**
   $$\text{Saldo Variável} = \text{Valor da Fatura} - \text{Valor Fixo Total}$$
   $$\text{Custo por Ponto} = \frac{\text{Saldo Variável}}{\sum \text{Pesos de Todas as Unidades}}$$
   $$\text{Consumo Individual} = \text{Peso da Unidade} \times \text{Custo por Ponto}$$

3. **Total a Pagar:**
   $$\text{Total} = \text{Cota Fixa por Unidade} + \text{Consumo Individual}$$

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Moderno:** Design responsivo, tipografia com Google Fonts (*Plus Jakarta Sans*), ícones Font Awesome e tooltips flutuantes nativos.
- **JavaScript Puro (ES6+):** Rápido, sem dependências pesadas, com persistência em `localStorage` e integração com Query Strings na URL.
- **Chart.js:** Gráficos dinâmicos de rosca e barras para visualização clara das proporções.
