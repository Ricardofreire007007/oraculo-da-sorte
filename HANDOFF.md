# Handoff — Oráculo da Sorte

> Documento de transição entre sessões. Lê isto antes de fazeres qualquer recomendação ou avançar com qualquer missão. Este documento substitui memórias parciais ou desatualizadas.

**Última atualização:** sessão de 21 de abril de 2026 (tarde)
**Última pessoa a editar:** Claude (via conversa com Ricardo)

---

## 1. Quem é o Ricardo

- Stakeholder único do projeto Oráculo da Sorte
- Perfil técnico básico: sabe seguir instruções, mas não programa nem usa terminal com fluência
- **Prefere não tocar no PowerShell.** Quer que os agentes façam o trabalho. Quando lhe pedes para colar comandos no terminal, ele desconforta.
- Português europeu nas conversas (não brasileiro). Termos: "ficheiro", "ecrã", "rato", "tela" não.
- Plano Claude **Max** (subscrição, não API key). Limites generosos.
- Trabalha em Windows, VS Code, com pasta `C:\Users\ricar\oraculo-da-sorte`
- Email: ricardofreire007@gmail.com
- Localização: Indaiatuba, São Paulo, Brasil
- Tem outro projeto chamado **infovote** em `C:\Users\ricar\Desktop\infovote` (plataforma de votação com Supabase, eleições, candidatos). Não confundir.

---

## 2. O produto

**Oráculo da Sorte** — web app de geração mística de números para 6 loterias brasileiras.

- **Live em:** https://oraculo-da-sorte.com
- **Repo:** https://github.com/Ricardofreire007007/oraculo-da-sorte (público)
- **Domínio legacy:** https://oraculo-da-sorte.vercel.app (redirect 308 → .com)
- **Loterias:** Mega Sena, Lotofácil, Quina, Lotomania, +Milionária (dual: 6+2 trevos), Timemania (10 números com balizamentos)
- **Features místicas:** tarot, numerologia, anjos, planetária, orixás (a fase da lua é contexto ambiente, não feature)
- **Idioma da app:** pt-BR
- **Mercado:** Brasil
- **Compliance:** LGPD, jogo responsável (CVV 188), restrições de idade, não-afiliação à Caixa

---

## 3. Stack técnica real (verificar package.json antes de assumir)

| Camada | Tecnologia | Notas |
|---|---|---|
| Frontend | React 19.2 + Vite 8 | |
| Routing | react-router-dom 7 | BrowserRouter no main.jsx |
| Auth + DB | Supabase 2.99 | Project: zuspijjuwjrooqeehkq |
| Pagamentos web | Stripe 20.4 | 4 endpoints em api/ |
| Pagamentos mobile | RevenueCat 1.29 | Já integrado, em uso |
| Email | Resend 6.9 | api/send-welcome-email.js |
| Backend | Vercel Functions (api/) | |
| Hosting | Vercel | Auto-deploy via git push |
| Lint | ESLint 9 | 13 erros pré-existentes documentados |
| Testes | Nenhum | Dívida técnica conhecida |
| **Analytics** | **@vercel/analytics 2.0 + @vercel/speed-insights 2.0** | **Adicionado nesta sessão** |

---

## 4. Estrutura do repositório (real)

```
oraculo-da-sorte/
├── api/
│   ├── create-checkout.js          ⛔ Stripe — área proibida
│   ├── stripe-webhook.js           ⛔ Stripe — área proibida
│   └── send-welcome-email.js       ⛔ Resend — área proibida
├── public/
│   ├── favicon.svg                 (logo Vite, mantido como fallback)
│   ├── icons.svg                   (sprite SVG da app)
│   ├── manifest.json               (PWA, criado nesta sessão)
│   ├── oraculo-icon-master.svg     (1024x1024, fonte dos ícones)
│   └── icons/
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       └── icon-512.png            (gerados nesta sessão)
├── scripts/
│   └── generate-icons.mjs          (regenera os 8 PNGs a partir do SVG mestre)
├── src/
│   ├── main.jsx                    (entry point com BrowserRouter, AuthProvider, Analytics, SpeedInsights)
│   ├── App.jsx                     (componente principal com PlanPopup inline, 7 sub-componentes)
│   ├── AuthContext.jsx             ⛔ Auth Supabase — área proibida
│   ├── auth.js                     ⛔ Helpers Supabase + signInWithGoogle — área proibida
│   ├── revenuecat.js               (integração mobile billing)
│   ├── oracle.js                   ⛔ Lógica determinística + balizamentos — ÁREA CRÍTICA
│   ├── OnboardingPopup.jsx
│   ├── App.jsx.txt                 ⚠️ backup esquecido (ver TECH-DEBT.md)
│   └── pages/
│       ├── Landing.jsx             (marketing + Pricing inline; 9 unused vars limpos nesta sessão)
│       └── Pricing.jsx             ⚠️ código órfão (rota /pricing sem entry points; ver TECH-DEBT.md)
├── .claude/
│   ├── settings.local.json         (gitignored)
│   └── agents/
│       ├── dev.md
│       ├── qa.md
│       ├── ux.md
│       └── devops.md               (criados nesta sessão)
├── CLAUDE.md                       (manual mestre dos agentes)
├── TECH-DEBT.md                    (dívida documentada)
├── eslint.config.js                (ajustado para reconhecer ambiente Node em api/)
├── index.html                      (SEO e PWA meta tags atualizados)
├── package.json
├── vercel.json
├── vite.config.js                  ⛔ exige aprovação explícita para mudar
└── .env.local                      ⛔⛔⛔ NUNCA ler, NUNCA tocar
```

---

## 5. Áreas proibidas — invioláveis

Os seguintes ficheiros NÃO podem ser modificados sem aprovação explícita do Ricardo por mensagem direta:

1. **`src/oracle.js`** — lógica crítica de geração + 60+ commits de afinação cuidadosa
2. **`src/AuthContext.jsx`** — auth Supabase
3. **`src/auth.js`** — helpers Supabase
4. **`api/*.js`** — Stripe, webhooks, Resend
5. **`src/pages/Pricing.jsx`** — código morto que toca em fluxo de checkout (deixar quieto até decidir reativar ou apagar)
6. **`.env*`** — secrets, NUNCA ler nem tocar
7. **`vite.config.js`** — exige aprovação
8. **`vercel.json`** — exige aprovação

Os agentes podem **LER** estes ficheiros para entender comportamento, mas não modificar.

---

## 6. Configuração externa importante (não código)

### Supabase
- **Project ID:** `zuspijjuwjrooqeehkq`
- **Site URL:** `https://oraculo-da-sorte.com`
- **Redirect URLs:** `https://oraculo-da-sorte.com/**`, Vercel app, `exp://192.168.18.49:8081` (Expo dev), `oraculo://` (deep link mobile)
- **Google OAuth provider:** ativo
- **Client ID guardado no Supabase:** termina em `7lkte` (Client Web do Google)

### Google Cloud Console
- **Projeto:** Oraculo da Sorte
- **4 OAuth Clients** (todos do mesmo projeto):
  - `Oráculo da Sorte Web` (`393538247194-7lkte...`) — usado pelo site Vercel
  - `Oráculo da Sorte iOS` (`393538247194-kf9t8...`) — para versão iOS
  - `Oráculo da Sorte Android` (`393538247194-unkf...`) — para versão Android produção
  - `Oraculo da Sorte Android (debug)` (`393538247194-fed5...`) — para Android dev
- **Web client tem 2 secrets ativos:** `18Gn` (22 mar) e `dOeX` (3 abr) — `dOeX` está em uso pelo Supabase, `18Gn` é dívida de limpeza
- **Authorized JavaScript Origins do Web:** `http://localhost:5173`, `https://oraculo-da-sorte.vercel.app`, `https://oraculo-da-sorte.com` e `https://www.oraculo-da-sorte.com`
- **Authorized Redirect URIs do Web:** `https://zuspijjuwjrooqeehkq.supabase.co/auth/v1/callback` e `https://auth.expo.io/@ricardofreire007/oraculo-mobile`

### Vercel
- Deploy automático a partir de `main` no GitHub
- Vercel Analytics + Speed Insights ativos (free tier Hobby, 2.500 eventos/mês)
- **Domínios configurados:**
  - `oraculo-da-sorte.com` — production (canónico)
  - `www.oraculo-da-sorte.com` — redirect 308 → `oraculo-da-sorte.com`
  - `oraculo-da-sorte.vercel.app` — redirect 308 → `oraculo-da-sorte.com`

### Cloudflare
- Registrar e DNS provider para `oraculo-da-sorte.com` (US$ 10,46/ano)
- DNS: CNAME apex + CNAME www, ambos para `vercel-dns-017`

### Stripe
- 3 produtos ativos:
  - `consulta` — Pacote 3 Consultas — R$ 6,00 (avulso)
  - `mistico` — Plano Místico — R$ 9,99/semana (subscrição)
  - `sagrado` — Plano Sagrado — R$ 29,99/mês (subscrição)
- Plano antigo `paid` ainda reconhecido como premium no código (legacy)

### RevenueCat
- Ligado e a inicializar bem em produção
- "RevenueCat iniciado com sucesso" + "Offerings encontrados" visível na consola
- Integração mobile preparada mas não publicada

### Expo / Mobile
- Há setup parcial para mobile via Expo (deep link `oraculo://`, redirect Expo, OAuth iOS/Android)
- **Não foi feito por nenhum agente Claude — alguém preparou isto antes**
- Estado real do projeto Expo é desconhecido — não está no repo principal

---

## 7. Sistema de planos

| Plano DB key | Preço | Tipo | É premium? |
|---|---|---|---|
| `free` | grátis | - | ❌ |
| `consulta` | R$ 6,00 | avulso (3 consultas) | ❌ no isPremiumUser() |
| `mistico` | R$ 9,99/semana | subscrição | ✅ |
| `sagrado` | R$ 29,99/mês | subscrição | ✅ |
| `paid` | legacy | subscrição antiga | ✅ |

`isPremiumUser()` em `App.jsx` verifica `['mistico', 'sagrado', 'paid']`.

---

## 8. Eventos analytics instrumentados (nesta sessão)

| Evento | Onde | Quando dispara | Propriedades |
|---|---|---|---|
| `oraculo_login_clicked` | `Landing.jsx:324` | Clique no botão "Entrar com Google" | nenhuma |
| `oraculo_consultation_completed` | `App.jsx:576` (entre setResult e setStep) | Consulta concluída com sucesso | `lottery`, `feature`, `plan` |
| `oraculo_plan_popup_opened` | `App.jsx:560` (else de handleLotterySelect) | Free user vê popup de planos | `lottery`, `feature` |
| `oraculo_checkout_started` (A) | `App.jsx:155` (PlanPopup) | Antes do fetch para /api/create-checkout | `plan` |
| `oraculo_checkout_started` (B) | `Landing.jsx:505` (Pricing inline) | Antes do fetch para /api/create-checkout | `plan` |

**Funil de monetização:** login_clicked → plan_popup_opened → checkout_started → consultation_completed

---

## 9. Dívida técnica conhecida (ver TECH-DEBT.md no repo)

- **13 erros de ESLint restantes**, todos em áreas proibidas ou que exigem discussão
- **Múltiplos clientes Supabase** ("Multiple GoTrueClient instances" warning na consola) — há mais que um sítio a criar clientes; consolidar num singleton
- **4 vulnerabilidades npm** pré-existentes (1 moderate, 3 high) — não corrigidas
- **`src/pages/Pricing.jsx` órfão** — rota sem entry points
- **`src/App.jsx.txt` esquecido** — backup em texto puro versionado no Git
- **Bundle > 500 kB** (1.15 MB sem gzip, 314 kB com gzip) — code-splitting recomendado
- **2 Client Secrets ativos no Google Cloud Console** (`18Gn` e `dOeX`) — desativar `18Gn` após 24-48h de estabilidade
- **Pricing inline em Landing.jsx** + **PlanPopup em App.jsx** + **Pricing.jsx órfão** — 3 implementações de checkout, considerar consolidar

---

## 10. Workflow para sessões com agentes Claude Code

1. Lê o `CLAUDE.md` na raiz do repo (manual mestre)
2. Lê o `.claude/agents/<relevante>.md` antes de qualquer tarefa específica
3. Verifica se a tarefa toca em área proibida — se sim, pede aprovação ao Ricardo primeiro
4. Apresenta plano em bullets antes de executar
5. **Mostra diff antes de gravar** (especialmente em ficheiros sensíveis)
6. Lint após cada alteração (`npm run lint`)
7. Build após alterações estruturais (`npm run build`)
8. Commits atómicos com mensagens em português
9. **NUNCA fazer `git push` automático** — Ricardo aprova manualmente
10. Após missões grandes, atualizar este handoff

---

## 11. Modos de trabalho com o Ricardo

- **Modo A (checkpoints)** — agente para a cada paragem importante e Ricardo aprova com `1`/`yes`. Recomendado para áreas sensíveis e primeiras missões.
- **Modo C (autónomo "Opção C")** — agente faz tudo sem parar entre passos. Para missões repetitivas e seguras. Ricardo gosta desta opção quando o trabalho é claro.
- **Modo híbrido** — autónomo nos passos seguros + checkpoint visual em alterações sensíveis. **É o modo preferido para a maioria das sessões.**

---

## 12. Histórico recente (sessão de 11 abril 2026)

**16+ commits feitos, todos em produção:**

1. `8d50e3f` chore: adicionar CLAUDE.md e configuração de subagentes
2. `cb8e230` feat: melhorar SEO e PWA meta tags no index.html
3. `d093494` chore: configurar ESLint para reconhecer ambiente Node em api/
4. `a75f6cb` fix: estabilizar estrelas do Landing com useMemo e remover unused vars
5. `a88862f` feat: adicionar manifest.json do PWA com referências aos ícones
6. `19428b3` chore: adicionar script de geração de ícones PWA com sharp
7. `90a177f` feat: adicionar 8 ícones PWA gerados a partir do SVG mestre
8. `1d8e598` chore: adicionar SVG mestre do ícone do Oráculo
9. `68b2461` docs: registar dívida técnica conhecida em TECH-DEBT.md
10. `075c482` feat: usar ícone do PWA como favicon do browser
11. `5815882` feat: integrar Vercel Analytics e Speed Insights
12. `d402b21` docs: registar código morto Pricing.jsx e backup App.jsx.txt
13. `d401129` feat(analytics): rastrear login e início de checkout no Landing
14. `55ada54` feat(analytics): rastrear consultas, popup de planos e checkout

**Bug crítico de OAuth também resolvido nesta sessão (sem código):**
- O Supabase tinha o Client ID do iOS (`kf9t8`) em vez do Web (`7lkte`) — provavelmente trocado a 3 de abril por engano
- Fix: trocar Client ID no dashboard do Supabase, secret manteve-se
- Tempo de fix: 5 minutos
- **Não foi causado pelos commits desta sessão**

### Sessão de 12 abril 2026 (manhã)

1. Limpeza completa da base de dados Supabase: 6 utilizadores apagados, ficou só Ricardo com plano free
2. Compra do domínio `oraculo-da-sorte.com` na Cloudflare (US$ 10,46/ano)
3. Configuração DNS na Cloudflare (CNAME apex + CNAME www, ambos para `vercel-dns-017`)
4. Adição dos domínios à Vercel: `oraculo-da-sorte.com` (production), `www.oraculo-da-sorte.com` (redirect 308 → sem-www), `oraculo-da-sorte.vercel.app` (redirect 308 → .com)
5. Atualização do Site URL e Redirect URLs no Supabase
6. Atualização das Authorized JavaScript Origins no Google OAuth (4 entries)
7. Corrigido bug crítico de OAuth — Client ID no Supabase estava do iOS em vez do Web (já documentado acima na sessão de 11 abril)
8. Commit `92bf929`: `index.html` atualizado com canonical link e `og:url` para o domínio novo
9. 3 diagramas criados pelo Claude (linear, funil de monetização, completo com ramos) — não estão no repo, são visuais inline da conversa
10. `HANDOFF.md` trazido manualmente do Downloads para a raiz do repo (não estava versionado)

### Sessão de 12 abril 2026 (tarde)

1. Implementação completa de paywall com trial diário e créditos consumíveis
2. Schema BD: adicionadas 2 colunas em profiles (`creditos_restantes` integer, `ultima_consulta_megasena` timestamptz)
3. `App.jsx`: 2 helpers puros (`isInTrialPeriod`, `usouMegasenaHoje`) + função `temAcesso` (5 cenários) + `registarConsumo` + modificação de `handleLotterySelect`
4. Webhook Stripe: agora credita +3 ao `creditos_restantes` quando plano `consulta` é comprado (acumula com saldo existente)
5. `Landing.jsx`: botão "Comece grátis" tornado clicável (`window.location.href = "/app"`)
6. UI feedback: badge no header (X créditos / 1 grátis hoje / próxima grátis amanhã) + mensagem dourada no `LotterySelection`
7. Investigação: confirmado que banner de comunidade antigo (commits `f0f33de`, `5b86531`, `4996e74`) usava números hardcoded — nunca houve cruzamento real com sorteios
8. Bug encontrado e resolvido: UPDATE via supabase client anon falhava silenciosamente (`data: null`). Fix: `await supabase.auth.getUser()` antes de cada UPDATE para "acordar" a sessão. Padrão importante para futuro.
9. Commits: `24f03d1` (paywall), `160b555` (debug), `4327bba` (debug+select), `f1a70e8` (cleanup), `d5e3cb6` (wake up session)

### Sessão de 21 de Abril de 2026 (tarde) — Fase 1 Refactor Mobile

Baseado em proposta world-class discutida com Claude (web). Entregou 6 commits atómicos focados em UX mobile da Landing, zero risco em áreas proibidas, validados em iPhone real.

Commits (`b719994` → `0dd4912`):
1. `b719994` feat(landing): menu hamburger com drawer em mobile
2. `73c12d9` fix(landing): centrar conteudo e remover colunas fantasma em mobile
3. `bc87e81` refactor(landing): hero compacto e cristal visivel em mobile
4. `d81202e` feat(landing): planos em carrossel horizontal com snap scroll
5. `3770443` feat(landing): sticky CTA no fundo em mobile
6. `0dd4912` polish(landing): stats horizontais, tipografia fluida, Cinzel letter-spacing

Mudanças principais:
- Menu hamburger (<768px) com drawer full-screen, a11y (aria-modal, ESC, scroll lock), traços que animam para X
- Conteúdo centrado em mobile via `.hero-grid` colapsando 2-col→1-col
- Cristal reduzido de 220px para 110px em mobile, reordenado via `order: -1` (DOM intacto)
- H1 tipografia `clamp(1.75rem, 6.5vw, 3.5rem)`, hero padding 80px/20px/48px (poupa ~72px vertical)
- Planos em carrossel horizontal com `scroll-snap-type: x mandatory` em mobile, grid desktop preservado. Destaque movido de Premium Anual para Místico (+ badge "Mais escolhido"). Premium Anual mantém apenas badge "Melhor Valor" (factual).
- Sticky CTA no fundo (mobile-only) com `safe-area-inset-bottom`, track event `oraculo_sticky_cta_clicked`, `z-index: 50` (abaixo do drawer 99)
- Stats em barra horizontal com border top/bottom dourados ténues e separadores verticais via `::before`
- Tipografia fluida pontual em logo navbar e stat numbers
- Cinzel letter-spacing 0.1em→0.2em em usos ≤11px (`.orbit-label`, `.plan-top-badge`, badge "Melhor Valor", "Aviso Legal")

Commit 7 (viewport) não foi necessário — teste 1.2 em iPhone confirmou que pinch-out já mantém layout mobile após os 6 commits obrigatórios.

Validação iPhone real (Safari):
- T1.1 página completa sem necessidade de zoom out: ✅
- T1.2 pinch-out mantém layout mobile: ✅
- T1.3 hamburger + drawer: ✅
- T1.4 hero: ✅
- T1.5 stats bar: ✅
- T1.6 carrossel de planos: ✅
- T1.7 sticky CTA: ✅
- T1.8 sticky + drawer interação: ✅

Deploy: via branch `fase1-mobile` → PR #1 → merge para `main` → Vercel production.

Ficheiros alterados (único): `src/pages/Landing.jsx` (+315 linhas, -34 linhas).

Áreas proibidas: zero tocadas. Commit 7 opcional (`index.html`) dispensado.

Tech-debt anotado para sessão futura (não-bloqueante):
- Padding nav 32px→20px pode apertar logo em ≥1024px (verificar)
- Drawer sem focus trap (Tab sai para página por baixo)
- Altura dos 2 botões sticky CTA pode destoar (`btn-primary` vs `btn-outline`)
- Separador vertical do `.hero-stats` a `left: 0` pode ficar apertado contra texto anterior em iPhones pequenos (alternativa: `left: -8px` ou `:not(:last-child)` com `right: 0`)
- Rings do cristal (inset -30 e -55) em 110px box dão boxes externos 170/220px — se em iPhone real tocarem margens, reduzir para -20/-35

Próximo passo: medir conversão 7-10 dias com Vercel Analytics (scroll depth, clicks no sticky) antes de decidir Fase 2 (smart plan selector + bottom sheet + price anchoring).

---

## 13. Próximos passos possíveis (Ricardo decide)

### ~~Migração para domínio próprio~~ ✅ CONCLUÍDO (12 abril 2026)

### Caminho A — Validação com utilizadores (recomendado)
- Vercel Analytics + 4 eventos custom já estão a recolher dados
- Esperar 24-72h e analisar tendências
- Partilhar URL com 10-20 pessoas
- Tomar decisões baseadas em dados, não em suposições

### Caminho B — Mobile (Google Play / App Store)
- Há setup parcial para mobile (Expo, RevenueCat, OAuth iOS/Android)
- Estado do projeto Expo é desconhecido — investigar antes de avançar
- Custo: US$ 25 (Google Play) + US$ 99/ano (Apple)

### Caminho C — Polish técnico
- Resolver Multiple GoTrueClient
- Code-splitting do bundle
- Adicionar testes ao oracle.js (sem alterar lógica)
- Limpar erros lint restantes

### Caminho D — Auditoria de segurança
- 4 vulnerabilidades npm
- Desativar Client Secret antigo (`18Gn`) no Google Cloud Console depois de 24-48h de estabilidade do `dOeX`
- Decidir destino do Pricing.jsx órfão e do App.jsx.txt

### Caminho F — Stripe test → live
- Migrar do modo de teste para produção (sessão dedicada de 1-2h)
- Requer: Termos de Serviço, Política de Privacidade, validação SRF do CPF

### Caminho G — Banner de comunidade real
- Cruzamento de números gerados com resultados oficiais dos sorteios
- Só vale a pena depois de >50 utilizadores reais

### Caminho E — Novas features
- Depende dos dados que vierem do Caminho A

---

## 14. Notas para o próximo Claude

- **Não confies nas memórias do Ricardo guardadas sobre o projeto** — estavam parcialmente desatualizadas (mencionavam 5 loterias monolíticas e nenhuma referência a Stripe/RevenueCat). Este handoff é a fonte de verdade.
- **Não assumas que sabes onde está cada coisa.** Verifica sempre com `view`, `grep` ou pedindo URLs ao Ricardo.
- **Descobertas inesperadas são frequentes** neste projeto: já encontrei RevenueCat, Expo, 4 OAuth clients, código órfão, backups esquecidos, e provavelmente há mais. Investiga antes de assumir.
- **O Ricardo prefere honestidade brutal a otimismo cego.** Diz "isto pode partir X" em vez de "vai correr bem".
- **O Ricardo aprende rápido.** Já passou de "não toco no PowerShell" para "compreendo diffs de git e aprovo eventos analytics em modo híbrido" numa sessão.
- **Português europeu nas conversas.**
- **Quando uma missão fica muito grande, divide em sessões.** O Ricardo cansa-se (e o agente também). Melhor 3 sessões boas do que 1 sessão exausta.
