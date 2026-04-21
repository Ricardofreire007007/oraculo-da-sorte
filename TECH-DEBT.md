# Dívida técnica do Oráculo da Sorte

Lista de problemas conhecidos a resolver em sessões futuras dedicadas. Cada item deve ser tratado isoladamente, com revisão e testes.

## Bugs descobertos em 21/04/2026

Durante o teste do primeiro pagamento real e validação do fix do onboarding em mobile emulation.

### Crítica — bloqueador de conversão

**1. OAuth 403 `disallowed_useragent` em WebViews in-app**

Utilizadores que tentam logar Google dentro do Instagram, TikTok ou Facebook Messenger recebem erro 403 "Esta app não está em conformidade com a Política de 'Utilizar navegadores seguros' da Google". Resultado: zero conversão de tráfego social. Solução típica: forçar o link a abrir em browser externo (Safari/Chrome) em vez de WebView. Investigar: `window.open`, `target="_blank"` com prompts de "Abrir em Safari", detectar user agent de WebView e mostrar aviso. Descoberto a 21/04 ao tentar validar OAuth em DevTools mobile emulation (reproduz o mesmo erro).

### Alta — quebra funcional parcial

**2. Botão SAIR não funciona em mobile**

Clicar em "SAIR" no header não faz logout. Console: "Multiple GoTrueClient instances detected" + "Lock was not released within 5000ms". É manifestação adicional do bug Multiple GoTrueClient conhecido (ver secção "Múltiplos clientes Supabase"); o workaround de localStorage só cobriu o checkout. Confirma que o refactor singleton Supabase também precisa de incluir a lógica de signOut.

**3. Gate de `/app` não valida campos críticos do perfil**

Utilizador com `data_nascimento=NULL` consegue entrar na `/app` sem ser redirecionado para onboarding. Provavelmente o gate actual valida apenas `onboarding_done`, mas o frontend depois usa `onboarding_done` de forma inconsistente (ignora-o noutros pontos). Resultado: perfis podem estar em estado parcial e ainda permitir acesso. Recomendação: gate único robusto que exige todos os campos críticos (`data_nascimento`, `nome`, `cidade` ou `birth_city`) preenchidos antes de permitir entrada.

**4. Crash no render com dados parciais**

`Uncaught TypeError: Cannot read properties of null (reading 'replace')` em `index-Dqf3k_kM.js:33:45707`. Dispara quando o utilizador tem perfil com `data_nascimento=NULL` e a `/app` tenta renderizar a consulta de entrada. Origem provável: `src/oracle.js` ou lógica de geração assume que data está sempre preenchida e chama `.replace()` nela sem null check. Fix: adicionar validação ou short-circuit se campos críticos forem null (redirecionar para onboarding em vez de tentar renderizar).

### Média — UX degradada

**5. Bug 1a — Geocoding de cidade falha silenciosamente no onboarding**

Reportado pela amiga em iPhone 12 Safari. Digitou "Sao paulo" em SUA LOCALIZAÇÃO e a lista de autocomplete (cidade / lat / lng / timezone) não apareceu, mostrando "Não foi possível detectar automaticamente. Digite sua cidade". API usada: `api.bigdatacloud.net/data/reverse-geocode-client` (pública, sem API key), em `src/OnboardingPopup.jsx:39`. Hipóteses: quota esgotada, CORS, timeout 10s muito curto em mobile 4G, ou a API está a devolver resultado vazio e o componente não trata. Não investigado a fundo.

### Bugs do dia que FORAM fixados

- **Bug 1b — Scroll do botão Continuar no onboarding** → fix em `src/OnboardingPopup.jsx` (commit `f63c227`), validação em iPhone real pendente
- **Opção X — Créditos desbloqueiam qualquer loteria** → fix em `src/App.jsx` (commit `162cc26`)
- **Nome pessoal e email gmail expostos nas páginas legais** → fix em `src/pages/Privacidade.jsx` + `src/pages/Termos.jsx` (commit `4e412f2`)

## Lint errors em áreas proibidas (13 totais)

- `src/oracle.js` — 3 unused vars (lifeNum, location, birthDetail). Trivial de remover, mas oracle.js é área crítica.
- `src/AuthContext.jsx` — 1 warning de react-refresh/only-export-components. Resolve-se separando helpers do contexto.
- `src/pages/Pricing.jsx` — 4 problemas (immutability + unused vars). Toca em fluxo de checkout, exige revisão cuidadosa.
- Restantes 5 erros dispersos em ficheiros seguros, não prioritários.

## Múltiplos clientes Supabase

A consola do browser reporta "Multiple GoTrueClient instances detected". Há pelo menos 2 sítios a criar clientes Supabase no boot da app. Suspeitos: src/auth.js, src/AuthContext.jsx, src/lib/supabase.js. Investigar e consolidar num único client singleton.

## npm audit — 4 vulnerabilidades

- 1 moderate, 3 high (em dependências transitivas pré-existentes, não causadas pelo sharp)
- Correr `npm audit` para listar quais
- `npm audit fix` pode mudar versões de dependências de produção — exige sessão dedicada com testes pós-fix

## Bundle size warning

Vite reporta chunk principal > 500 kB (1144 kB sem gzip, 312 kB com gzip). Resolver com code-splitting:
- React.lazy() para páginas (Landing, Pricing, etc.)
- Importação dinâmica de bibliotecas pesadas (RevenueCat, Supabase)
- Manual chunks no vite.config.js

## Cliente Supabase órfão removido (resolvido)

✓ Removido o cliente Supabase morto do Landing.jsx (commit a75f6cb)

## Código morto e ficheiros órfãos

### `src/pages/Pricing.jsx` — página órfã

Página de pricing standalone registada como rota `/pricing` em `main.jsx`, mas sem qualquer entry point no UI vivo. Zero `href="/pricing"`, zero `navigate("/pricing")` no código. Só acessível por URL directa.

Contém:
- 4 erros de lint pré-existentes (react-hooks/immutability, unused vars)
- Variável `result` morta (linha 499)
- `window.location.href = '/app'` redundante após `return`
- Função `handleCheckout` duplicada (existe versão funcional em `App.jsx` PlanPopup e em `Landing.jsx`)

Decisão a tomar numa sessão futura: ou (a) reactivar e instrumentar, ou (b) apagar o ficheiro e remover a rota do `main.jsx`. Por agora, fica intocado.

### `src/App.jsx.txt` — backup esquecido

Ficheiro de backup em texto puro do `App.jsx` que não é bundlado mas está versionado no Git público. Considerar apagar do repo ou mover para `.gitignore`.

## Wake up Supabase session (workaround)

Padrão actual de chamar `await supabase.auth.getUser()` antes de UPDATEs em `registarConsumo` (`App.jsx`) é workaround para um bug onde o client anon falha silenciosamente (retorna `data: null`, `error: null`). Investigar causa raiz na próxima auditoria: pode ser configuração do client (`autoRefreshToken`, `persistSession`) ou bug conhecido do `supabase-js`. Se for causa raiz documentada, criar issue.

## Banner de comunidade real

O banner antigo (commit `f0f33de`, removido em `717c07c`) usava números hardcoded (`247 wins`, `R$ 184.930`). Nunca houve cruzamento real com sorteios. Implementação real requer:
- Tabela `lottery_results` (resultados oficiais das loterias)
- Tabela `generated_numbers` (registo de cada consulta gerada — actualmente não existe, geração é 100% client-side)
- Lógica de cruzamento + endpoint `/api/stats` + componente `Banner.jsx` + job recorrente
- Estimativa: 4-8h de trabalho
