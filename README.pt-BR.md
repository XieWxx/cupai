<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
    <img alt="CupAI Logo" src="https://img.shields.io/badge/CupAI-World_Cup_AI_Analysis-2563eb?style=for-the-badge&logo=soccer&logoColor=white">
  </picture>
</p>

<h1 align="center">🏆 CupAI</h1>
<p align="center">
  <strong>Plataforma de Análise de Partidas da Copa do Mundo com IA Personalizada</strong><br>
  <em>世界杯自定义 AI 赛事分析预测平台</em>
</p>

<p align="center">
  <a href="https://cupai.asia/"><img src="https://img.shields.io/badge/Live_Demo-cupai.asia-2563eb?style=flat-square&logo=globe&logoColor=white" alt="Live Demo"></a>
  <a href="https://github.com/XieWxx/cupai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/XieWxx/cupai?style=flat-square&color=2563eb" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue"></a>
  <a href="#"><img src="https://img.shields.io/badge/NestJS-latest-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-latest-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  🌐 README Multilíngue /
  <a href="./README.zh-CN.md">🇨🇳 中文</a> ·
  <a href="./README.en-US.md">🇬🇧 English</a> ·
  <a href="./README.es-ES.md">🇪🇸 Español</a> ·
  <a href="./README.fr-FR.md">🇫🇷 Français</a> ·
  <a href="./README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="./README.ar-SA.md">🇸🇦 العربية</a> ·
  <a href="./README.ja-JP.md">🇯🇵 日本語</a> ·
  <a href="./README.ko-KR.md">🇰🇷 한국어</a>
</p>

---

## Sobre o Projeto

**CupAI** é uma plataforma de análise de partidas da Copa do Mundo **puramente baseada em dados + IA privada do usuário** para torcedores de futebol do mundo inteiro. A plataforma não inclui capacidades de geração de IA integradas; em vez disso, se posiciona como um "provedor abrangente de dados de partidas + suporte de ferramentas de análise". Ela fornece dados subjacentes completos, em tempo real e precisos das partidas, enquanto os usuários configuram seus próprios LLMs privados, personalizam Prompts, ajustam os pesos dos fatores das partidas e realizam de forma independente análises aprofundadas dos jogos.

### Diferenciais Principais

| Recurso | Descrição |
|---------|-----------|
| 🔑 **LLMs Privados do Usuário** | Compatível com Doubao, DeepSeek, GPT, Qwen e mais — os usuários trazem suas próprias chaves API, custo zero de IA para a plataforma |
| 🧩 **Mercado de Prompts Personalizados** | Crie, compartilhe e reutilize modelos de Prompt — construindo a melhor biblioteca de modelos de análise futebolística |
| ⚖️ **Pesos de Fatores Ajustáveis** | 8 categorias de fatores de análise com alocação livre de 0%-100% — construa seu próprio modelo de análise |
| 🤖 **Raciocínio Automatizado por Agente de IA** | Impulsionado por 5 algoritmos proprietários — análise de partidas totalmente automatizada sem operação manual |
| 🌍 **Internacionalização em 8 Idiomas** | zh-CN / en-US / es-ES / fr-FR / pt-BR / ar-SA / ja-JP / ko-KR — cobrindo as principais nações da Copa do Mundo |
| 🛡️ **Análise Esportiva Totalmente Conforme** | Sem apostas, sem jogos de azar — revisão tática pura e raciocínio baseado em dados |

---

## Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| 🖥️ **Frontend** | Vue 3 + Vite + Element Plus | UI responsiva, painéis de dados, rankings |
| ⚡ **Tempo Real** | Socket.io | Placares ao vivo, notificações push instantâneas |
| 📊 **Gráficos** | ECharts | Tendências de precisão, distribuição de pesos, pontuações de sentimento |
| 🌐 **i18n** | vue-i18n (8 idiomas) | Multilíngue, múltiplos fusos horários, adaptação global |
| 🔧 **Backend** | NestJS + TypeORM (TypeScript) | APIs modulares, relay de IA, processamento de dados |
| 🗄️ **Banco de Dados** | MySQL 8.0 | Dados estruturados: usuários, modelos, relatórios, rankings |
| ⚡ **Cache** | Redis | Cache em tempo real, limitação de API, dados quentes |
| ⏰ **Agendador** | node-schedule | Escaneamento automático do Agente, geração de relatórios, inspeção de dados |
| 🌐 **Fonte de Dados** | BSD API | Sincronização em tempo real de partidas/times/classificações/odds |
| 🐳 **Implantação** | Docker + Docker Compose + Nginx | Implantação com um clique, proxy reverso, SSL |

---

## Início Rápido

### Pré-requisitos

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **Redis** >= 6.x
- **Docker** & **Docker Compose** (opcional)

### Implantação Docker com Um Clique

```bash
git clone https://github.com/XieWxx/cupai.git
cd cupai
cp .env.example .env
docker compose up -d
```

Acesse no navegador: `http://localhost:3000`

### Desenvolvimento Local

```bash
pnpm install
pnpm dev:server   # Iniciar backend (porta 3002)
pnpm dev:web      # Iniciar frontend (porta 5173)
```

> A primeira execução requer a configuração de `apps/server/.env` (consulte `.env.example`), e certifique-se de que MySQL e Redis estejam em execução

---

## Estrutura do Projeto

```
cupai/
├── apps/
│   ├── web/                   # Frontend (Vue 3 + Vite)
│   │   └── src/
│   │       ├── views/         # Páginas (12 visões principais)
│   │       ├── stores/        # Gerenciamento de estado Pinia
│   │       ├── locales/       # i18n em 8 idiomas
│   │       ├── api/           # Camada de requisições API + WebSocket
│   │       └── components/    # Componentes compartilhados
│   └── server/                # Backend (NestJS)
│       └── src/
│           ├── modules/       # 8 módulos de negócio
│           │   ├── user/      # Módulo de usuários
│           │   ├── ai/        # Módulo de relay de IA
│           │   ├── match/     # Dados de partidas + classificações + sentimento
│           │   ├── prompt/    # Mercado de Prompts + validação
│           │   ├── ranking/   # Rankings
│           │   ├── agent/     # Agente + interação + análise
│           │   ├── bsd/       # Sincronização de fonte de dados BSD
│           │   └── risk/      # Controle de riscos + palavras sensíveis
│           ├── config/        # Configuração Redis + limitação
│           └── common/        # Guards + filtros
├── packages/
│   ├── types/                 # Definições de tipos unificadas
│   ├── constants/             # Constantes de negócio
│   └── utils/                 # Funções utilitárias comuns
├── docs/                      # Documentação de API + soluções de fonte de dados
├── docker/                    # Configuração Nginx
├── deploy/                    # Dados iniciais init.sql
└── docker-compose.yml
```

---

## Roteiro de Versões

### V1.0 — Versão Fundamental ✅

- [x] Estrutura de projeto Monorepo (pnpm workspace)
- [x] Esqueleto frontend e backend (Vue3 + NestJS + TypeScript)
- [x] Registro/login/autenticação JWT de usuários
- [x] Gerenciamento de configuração de IA (criptografia de chaves API multi-modelo)
- [x] Gerenciamento de modelos de pesos (8 fatores personalizáveis)
- [x] CRUD de modelos Prompt + básicos do mercado
- [x] Centro de dados de partidas (times/jogadores/histórico/ambiente)
- [x] Geração manual de análises + controle de acesso público/privado
- [x] Funcionalidades básicas da praça de análise
- [x] Solução de implantação Docker

### V1.1 — Melhoria do Ecossistema ✅

- [x] Cache Redis substituindo cache em memória
- [x] Guarda de limitação de API (estratégia de 3 níveis)
- [x] Ciclo completo de análise IA (montar Prompt → chamar IA → salvar relatório)
- [x] Interação comunitária de likes/favoritos
- [x] Sistema de rankings (ranking de usuários + ranking de modelos)
- [x] Tarefas agendadas do Agente com chamadas reais de IA
- [x] Protocolo de autorização do Agente + acionamento manual
- [x] Melhoria do controle de riscos: revisão secundária de conteúdo IA + palavras sensíveis persistentes
- [x] Tema escuro do frontend + push em tempo real WebSocket

### V1.2 — Experiência Aprofundada ✅

- [x] Melhoria da página de detalhes da partida (placar + dados de 8 fatores + rastreabilidade da fonte)
- [x] Validação de modelos Prompt (detecção de variáveis + pré-visualização + validação na criação)
- [x] Funcionalidade de classificações (pontos do grupo + análise de cenários de classificação)
- [x] Gerenciamento de favoritos do usuário
- [x] Renderização Markdown na praça de análise + rastreabilidade de snapshots de pesos
- [x] Expansão i18n para 8 idiomas (zh/en/es/fr/pt/ar/ja/ko)
- [x] Arquivos README multilíngues

### V1.3 — Edição Baseada em Dados ✅

- [x] Integração da fonte de dados BSD (sincronização em tempo real de partidas/times/classificações/odds)
- [x] Módulo de análise de sentimento (visão geral de sentimento + linha do tempo + agregação multidimensional)
- [x] Frontend totalmente conectado às APIs reais do backend (Mock removido por padrão)
- [x] Padronização da documentação de API (api-spec.md v1.5)
- [x] Página de detalhes da partida com dados completos do backend (predição IA + sentimento + relatório dimensional + escalação de jogadores)

### V1.4 — Edição Global Completa (Planejado)

- [ ] Identificação precisa de sentimento internacional
- [ ] Aprimoramento do sistema de conformidade transfronteiriça
- [ ] Monitoramento de dados e alertas, recuperação automática de anomalias

---

## Contribuindo

Acolhemos calorosamente as contribuições da comunidade! Seja código, documentação, traduções ou relatórios de bugs — cada contribuição é valiosa.

### Como Contribuir

1. Faça **Fork** deste repositório
2. Crie uma branch de funcionalidade: `git checkout -b feat/amazing-feature`
3. Confirme suas mudanças: `git commit -m 'feat: add amazing feature'`
4. Empurre a branch: `git push origin feat/amazing-feature`
5. Envie um **Pull Request**

> Para diretrizes detalhadas de contribuição, consulte [CONTRIBUTING.md](./CONTRIBUTING.md)
> Por favor leia o [Código de Conduta](./CODE_OF_CONDUCT.md) antes de contribuir

### Áreas de Contribuição

| Área | Descrição |
|------|-----------|
| 💻 **Desenvolvimento de Código** | Desenvolvimento de funcionalidades frontend/backend, otimização de algoritmos, correção de bugs |
| 🎨 **Design UI/UX** | Melhorias no design de páginas, melhorias na experiência de interação |
| 🌍 **Internacionalização** | Tradução e revisão para 8 idiomas |
| 📝 **Documentação** | Guias de desenvolvimento, tutoriais de uso |
| 🧪 **Testes** | Testes unitários, testes E2E, testes de desempenho |
| 🐛 **Relatórios de Bugs** | Submissão de issues, reprodução de problemas |
| 📣 **Comunidade** | Contribuições de modelos Prompt, compartilhamento de conteúdo comunitário |

### Contribuidores

<a href="https://github.com/XieWxx/cupai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XieWxx/cupai" />
</a>

---

## Declaração de Conformidade

Todos os resultados de análise de IA nesta plataforma são **exclusivamente para análise de entretenimento de dados esportivos e referência tática**, e não constituem nenhum conselho de apostas, jogos de azar ou previsão de resultados. A plataforma bloqueia completamente termos e funcionalidades relacionadas a apostas. Todo o conteúdo gerado por usuários é automaticamente revisado pelo controle de riscos, em total conformidade com as leis e regulamentos brasileiros e chineses, bem como com os requisitos de conformidade do RGPD.

---

## 💖 Patrocínio / Doação

Se o CupAI te ajuda, considere uma pequena doação para impulsionar o desenvolvimento contínuo ☕
Todas as doações vão para a renovação da API de dados BSD, manutenção do servidor e operações da comunidade.

| WeChat Pay | Alipay |
| :---: | :---: |
| ![WeChat Pay](./weixin.JPG) | ![Alipay](./zhifubao.JPG) |

> ⚠️ As doações são totalmente voluntárias e não concedem direitos adicionais nem compromissos comerciais.
> A plataforma mantém uma política de **zero apostas, zero jogos de azar**.

---

## Licença

Este projeto está licenciado sob a [Apache License 2.0](./LICENSE).

CupAI © 2024-2026 — Feito com ❤️ pela comunidade CupAI e colaboradores.

---

<p align="center">
  <sub>Se este projeto te ajuda, nos dê uma ⭐ Star!</sub>
  <br><br>
  <a href="https://star-history.com/#XieWxx/cupai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date&theme=dark" />
      <img width="500" alt="Star History Chart" src="https://api.star-history.com/svg?repos=XieWxx/cupai&type=Date" />
    </picture>
  </a>
</p>
