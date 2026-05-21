# Studio Modesto — Sistema de Gestão & Portal do Cliente

<div align="center">
  <p align="center">
    <strong>Um portal editorial e sistema integrado de gerenciamento de alta performance para o Studio Modesto.</strong>
  </p>
  <p align="center">
    <a href="#-estética-e-design">Aparência Editorial</a> &bull;
    <a href="#-funcionalidades">Funcionalidades</a> &bull;
    <a href="#-tecnologias">Tecnologias</a> &bull;
    <a href="#-execução-local">Execução Local</a> &bull;
    <a href="#-estrutura">Estrutura do Projeto</a>
  </p>
</div>

---

## 🖤 A Filosofia Studio Modesto

O **Studio Modesto** foi redesenhado para transcender a experiência comum de salão de beleza. Inspirado pelas identidades visuais de marcas de luxo e moda conceitual (como *Celine* e *Aesop*), o projeto adota uma estética **editorial atemporal**, focada no minimalismo, assimetria sofisticada, linhas finas e tipografia dramática.

> *"Menos excessos, mais significado. Transformando beleza em arte desde 2012."*

---

## 🎨 Estética e Design (Editorial System)

O design foi fundamentado sob uma paleta de cores extremamente reduzida e refinada, estruturada diretamente no `src/index.css` através do Tailwind CSS v4:

*   **Creme (`#F5F0E8` / `bg-aura-cream`)**: O tom de fundo primário, quente, que emana conforto visual e sofisticação.
*   **Carvão (`#1A1714` / `text-aura-charcoal`)**: O tom de contraste principal para textos, contornos finos e botões rígidos.
*   **Ouro (`#B8986A` / `text-aura-gold`)**: Tom de destaque aplicado de forma pontual para realçar elementos nobres.
*   **Tipografia**:
    *   **Serifada**: `Cormorant Garamond` — Utilizada para cabeçalhos imponentes, títulos em itálico e a logo conceitual do salão.
    *   **Sans-serif**: `Plus Jakarta Sans` — Utilizada para textos de apoio, botões e navegação para máxima legibilidade.

---

## ⚙️ Funcionalidades

O sistema está dividido em duas frentes completas: a **Landing Page Pública (com Portal de Agendamento)** e o **Painel Administrativo (`/admin`)**.

### 🌟 Portal Público e Agendamento
*   **Landing Page Editorial**: Apresentação minimalista das especialidades (Cabelo, Manicure/Pedicure e Estética Facial) com imagens artísticas e espaçamento generoso.
*   **Fluxo de Agendamento Interativo (Booking Flow)**: Permite ao cliente escolher serviços, profissionais, datas e horários de forma totalmente guiada e fluida.
*   **Botão Magnético Integrado**: Interação de micro-animação *premium* nos botões principais baseados na física do ponteiro.
*   **Botão Flutuante de WhatsApp**: Canal direto de comunicação com mensagem personalizada configurada.

### 💼 Painel Administrativo (`/admin`)
Um ecossistema completo e protegido por rotas privadas para a operação diária do salão:
1.  **Dashboard**: Visão geral de faturamento diário/mensal, taxa de ocupação dos profissionais, atendimentos agendados e alertas rápidos.
2.  **Agenda / Calendário**: Gerenciador interativo de horários e compromissos com exibição diária/semanal e fácil atribuição de profissionais.
3.  **Clientes**: CRM com cadastro completo, preferências, histórico detalhado de serviços consumidos e observações.
4.  **Estoque (Inventário)**: Gestão de insumos do salão e produtos de revenda, com alertas de quantidade mínima.
5.  **Módulo Financeiro**: Fluxo de caixa, despesas, comissões de profissionais e relatórios de lucratividade.
6.  **Profissionais**: Controle de escalas de trabalho, serviços habilitados por profissional e gerenciamento de comissões individualizadas.
7.  **Marketing**: Disparo de campanhas promocionais, programas de fidelização de clientes e segmentações inteligentes.
8.  **Relatórios**: Gráficos analíticos e relatórios gerenciais consolidados para tomadas de decisão estratégicas.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as ferramentas mais modernas do ecossistema React:

*   **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/) (Para desenvolvimento ultrarrápido).
*   **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com integração via plugin `@tailwindcss/vite` nativo.
*   **Animações**: [Motion for React](https://motion.dev/) (para transições extremamente fluidas e micro-animações premium).
*   **Ícones**: [Lucide React](https://lucide.dev/).
*   **Gráficos**: [Recharts](https://recharts.org/) (usado nas análises do painel administrativo).
*   **Agendamento**: [React Day Picker](https://react-day-picker.js.org/) + [date-fns](https://date-fns.org/).
*   **Roteamento**: [React Router DOM v7](https://reactrouter.com/).

---

## 🚀 Execução Local

Siga os passos abaixo para rodar o projeto em sua máquina de desenvolvimento:

### Pré-requisitos
*   **Node.js** (versão 18 ou superior recomendada)
*   **npm** ou **yarn**

### Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
   ```bash
   cd salao
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie e configure o seu arquivo `.env` local com base nas suas credenciais de banco/serviço (se aplicável).

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra o navegador em [http://localhost:3000](http://localhost:3000) para visualizar o portal.

### Build de Produção

Para gerar a versão otimizada para implantação (produção):
```bash
npm run build
```

---

## 📂 Estrutura do Projeto

Abaixo está o mapeamento dos principais diretórios e arquivos de código:

```text
salao/
├── public/                 # Assets públicos (imagens de tratamentos, logos, etc.)
├── src/
│   ├── components/         # Componentes compartilhados
│   │   ├── layout/         # Layout geral do painel, cabeçalho e navegação lateral
│   │   └── FloatingWhatsApp.tsx
│   ├── contexts/           # Provedores de Estado (ex: Autenticação, Agendamentos)
│   ├── lib/                # Configurações de clientes externos (Supabase)
│   ├── pages/              # Páginas e fluxos principais
│   │   ├── BookingFlow.tsx      # Fluxo guiado de agendamentos
│   │   ├── Dashboard.tsx        # Gráficos e cards de performance
│   │   ├── Calendar.tsx         # Agenda administrativa
│   │   ├── LandingPage.tsx      # Landing Page Editorial pública
│   │   └── ...                  # Demais módulos administrativos (Finance, Customers...)
│   ├── App.tsx             # Roteamento e definição de rotas públicas/privadas
│   ├── index.css           # Variáveis do Design System (Creme, Carvão, Ouro)
│   └── main.tsx            # Inicialização do React
├── tsconfig.json           # Configurações do TypeScript
└── vite.config.ts          # Configurações de plugins e build do Vite
```

---

<div align="center">
  <p>Desenvolvido com sofisticação para o <strong>Studio Modesto</strong>.</p>
</div>
