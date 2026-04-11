# Dívida técnica do Oráculo da Sorte

Lista de problemas conhecidos a resolver em sessões futuras dedicadas. Cada item deve ser tratado isoladamente, com revisão e testes.

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
