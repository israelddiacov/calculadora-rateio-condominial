# 💧 Calculadora de Rateio de Água do Condomínio (6 Unidades)

Aplicação web estática, transparente e de fácil acesso para calcular a divisão justa e proporcional da conta de água unificada (1 hidrômetro para todo o prédio).

Desenvolvido para condomínios com perfil misto (**moradores residenciais e atividades comerciais/prestação de serviços**).

---

## 🏢 Layout do Prédio e Premissas Iniciais

O prédio possui **6 apartamentos (2 por andar)** com a seguinte distribuição padrão:

| Apartamento | Andar | Perfil | Ocupação / Atividade | Peso (Pontos) | Justificativa do Peso |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Ap 1** | 1º Andar | Residencial | 1 adulto | **1,0** | 1 habitante padrão (banhos, pia, máquina) |
| **Ap 2** | 1º Andar | Comercial | Salão de cabeleireiro | **4,0** | Múltiplos lavatórios diários (10-25L cada), clientes, esterilização, toalhas |
| **Ap 3** | 2º Andar | Residencial | 3 adultos | **3,0** | 3 residentes padrão |
| **Ap 4** | 2º Andar | Comercial/Técnico | Dentista protético | **2,5** | Uso técnico contínuo em bancada (polimento, recorte de gesso, pias técnicas) |
| **Ap 5** | 3º Andar | Residencial | 4 adultos | **4,0** | 4 residentes padrão |
| **Ap 6** | 3º Andar | Residencial | 3 adultos | **3,0** | 3 residentes padrão |

* **Soma inicial dos pesos:** `1,0 + 4,0 + 3,0 + 2,5 + 4,0 + 3,0 = 17,5 pontos`
* **Parcela de Área Comum:** Configurada inicialmente em **0%**, podendo ser ativada e ajustada a qualquer momento (ex: 10%, 15%, 20%) pelo painel de **Configurações**.

---

## 🧮 Metodologia de Cálculo

1. **Parcela de Área Comum (Taxa Fixa / Conservação):**
   $$\text{Valor Comum Total} = \text{Valor da Fatura} \times \text{Percentual Comum}$$
   $$\text{Parcela Comum por Apartamento} = \frac{\text{Valor Comum Total}}{6}$$

2. **Parcela de Consumo Variável:**
   $$\text{Valor do Consumo} = \text{Valor da Fatura} - \text{Valor Comum Total}$$
   $$\text{Valor por Ponto (R\$/ponto)} = \frac{\text{Valor do Consumo}}{\sum \text{Pesos}}$$
   $$\text{Consumo do Apartamento} = \text{Peso do Ap} \times \text{Valor por Ponto}$$

3. **Total a Pagar por Unidade:**
   $$\text{Total} = \text{Parcela Comum} + \text{Consumo Individual}$$

> 💡 **Precisão Contábil:** O sistema implementa o método dos maiores restos (*Largest Remainder Method*), garantindo que a soma dos boletos feche **centavo por centavo** com o valor da fatura da concessionária, sem sobras nem faltas.

---

## ✨ Recursos da Aplicação

- **Cálculo em Tempo Real:** Digite o valor da conta e veja o resultado de todos os apartamentos instantaneamente.
- **Botão "Copiar para WhatsApp":** Gera uma mensagem elegante e explicativa pronta para enviar no grupo de moradores.
- **Impressão e PDF:** Layout formatado para gerar um relatório de rateio formal pronto para arquivo ou mural.
- **Gráficos Interativos:** Gráfico de rosca e barras mostrando a proporção de cada unidade.
- **Compartilhamento por Link:** Codifica os valores preenchidos na URL para qualquer morador abrir e ver os mesmos números.
- **Painel de Configurações:** Permite alterar moradores, pesos ou taxa de área comum a qualquer momento, salvando automaticamente no navegador (`localStorage`).
- **Mobile First:** Totalmente adaptado para celulares, tablets e computadores.

---

## 🚀 Como Hospedar no GitHub Pages

1. Crie um novo repositório no seu GitHub (ex: `calculadora-agua-predio`).
2. Faça o push dos arquivos para o repositório:
   ```bash
   git init
   git add .
   git commit -m "feat: calculadora de rateio de agua do condominio"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/calculadora-agua-predio.git
   git push -u origin main
   ```
3. No GitHub:
   - Acesse **Settings** > **Pages**
   - Em **Branch**, selecione `main` e pasta `/ (root)`
   - Clique em **Save**
4. O link público ficará disponível em:
   `https://SEU_USUARIO.github.io/calculadora-agua-predio/`
