# Oráculo da Sorte — Manual para Agentes Claude

> Este ficheiro é lido automaticamente pelo Claude Code e por todos os subagentes antes de qualquer tarefa neste repositório. Define o contexto do projeto, regras invioláveis e padrões de trabalho. **Lê na íntegra antes de qualquer ação.**

---

## 1. Visão geral do projeto

**Oráculo da Sorte** é uma web app de geração mística de números para loterias brasileiras. Combina sistemas espirituais (tarot, numerologia, anjos, astrologia planetária, orixás) com constraints estatísticos invisíveis para gerar sugestões personalizadas.

- **Live em:** https://oraculo-da-sorte.vercel.app
- **Stakeholder único:** Ricardo (perfil técnico básico, prefere instruções diretas e em português europeu)
- **Estado:** Produção, com utilizadores reais e pagamentos ativos
- **Idioma da app:** pt-BR (mercado brasileiro)
- **Idioma das interações com o Ricardo:** português europeu

---

## 2. Stack técnica (verificar `package.json` antes de assumir versões)

| Camada | Tecnologia | Versão atual |
|---|---|---|
| Frontend | React | 19.2 |
| Bundler | Vite | 8 |
| Routing | react-router-dom | 7 |
| Auth + DB | Supabase | 2.99 |
| Pagamentos web | Stripe | 20.4 |
| Pagamentos mobile (futuro) | RevenueCat | 1.29 |
| Email transacional | Resend | 6.9 |
| Backend | Vercel Functions (em `/api`) | - |
| Hosting | Vercel | - |
| Lint | ESLint | 9 |
| Testes | **Nenhum (a adicionar pelo agente QA)** | - |

---

## 3. Loterias suportadas (6)

Mega Sena, Lotofácil, Quina, Lotomania, +Milionária (mecânica dual: 6 números + 2 trevos), Timemania (10 números com balizamentos especiais).

## 4. Features místicas (5)

`tarot`, `numerologia`, `anjos`, `planetaria`, `orixas`. A fase da lua aparece como contexto ambiente em todas, **não** como feature separada.

## 5. Sistema de planos

| Plano | Preço | Tipo | ID no DB |
|---|---|---|---|
| Livre | Grátis | - | `free` |
| 3 Consultas | R$ 6,00 | Avulso | `consulta` |
| Místico | R$ 9,99/semana | Subscrição | `mistico` |
| Sagrado | R$ 29,99/mês | Subscrição | `sagrado` |
| Premium (legacy) | - | Subscrição antiga | `paid` |

A função `isPremiumUser()` em `src/App.jsx` considera premium: `mistico`, `sagrado`, `paid`.

---

## 6. Estrutura do repositório

```
oraculo-da-sorte/
├── api/                    # Vercel serverless functions (Stripe, webhooks)
├── public/                 # Assets estáticos (ícones PWA, manifest)
├── src/
│   ├── App.jsx             # Componente principal (contém 7 sub-componentes inline a extrair)
│   ├── AuthContext.jsx     # ⛔ Contexto de auth Supabase — ÁREA PROIBIDA
│   ├── oracle.js           # ⛔ LÓGICA CRÍTICA DE GERAÇÃO — ÁREA PROIBIDA
│   └── ...
├── .env.local              # ⛔ Secrets — NUNCA ler, NUNCA commitar
├── package.json
├── vercel.json
└── vite.config.js
```

---

## 7. ⛔ ÁREAS PROIBIDAS — exigem aprovação humana explícita

Os agentes **NÃO PODEM** modificar os seguintes ficheiros sem o Ricardo dar luz verde explícita por mensagem:

1. **`src/oracle.js`** — Contém a lógica determinística de geração, balizamentos estatísticos, fases lunares e dados das 6 loterias. Já passou por muitos commits de afinação cuidadosa. Qualquer alteração aqui pode partir o produto. **Os agentes podem ler este ficheiro** (para entender comportamento ou escrever testes), mas não modificar.

2. **`api/create-checkout.js`** e qualquer ficheiro em `/api` relacionado com Stripe — Erros aqui causam problemas legais e financeiros.

3. **`src/AuthContext.jsx`** — Lógica de autenticação Supabase. Erros aqui partem o login de todos os utilizadores.

4. **`.env.local`, `.env`, qualquer ficheiro com secrets** — NUNCA ler, NUNCA escrever, NUNCA commitar. Se precisares de saber se uma variável existe, pergunta ao Ricardo.

5. **Qualquer ficheiro em `/api` que use `SUPABASE_SERVICE_ROLE_KEY`** — risco de exposição de dados.

**Se uma tarefa exigir mudança numa destas áreas, o agente deve PARAR, explicar o que precisa de mudar e porquê, e esperar pela aprovação do Ricardo antes de avançar.**

---

## 8. ✅ Áreas seguras para os agentes trabalharem livremente

- Sub-componentes UI dentro do `src/App.jsx` (extrair para ficheiros próprios é encorajado)
- Criar novos componentes em `src/components/`
- Adicionar testes (criar `src/__tests__/` ou ficheiros `*.test.jsx`)
- Configuração de ESLint, Prettier, Vitest
- Pasta `public/` (manifest, ícones PWA, robots.txt, sitemap)
- README.md, CLAUDE.md, documentação
- Comentários em código existente
- Otimizações de performance que não alterem comportamento

---

## 9. Princípios invioláveis do produto

1. **Determinismo absoluto.** Mesmos inputs (data nascimento, nome, loteria, feature, dia, posições astronómicas) → sempre os mesmos números. O resultado só muda se algum input ou variável astronómica mudar. **Nunca introduzir aleatoriedade não-seedada.**

2. **Constraints estatísticos invisíveis.** As regras de paridade, baixo/alto e soma melhoram a qualidade dos números mas **nunca aparecem como UI configurável** ao utilizador.

3. **Compliance legal.** A app tem disclaimers de entretenimento, LGPD, restrições de idade, não-afiliação à Caixa, jogo responsável (CVV 188). **Nunca remover estes disclaimers.** Nunca adicionar copy que sugira garantia de vitória ou aumento de chances.

4. **Mobile-first.** A UI é desenhada para 480px max-width. Qualquer componente novo deve ser testado primeiro em mobile.

---

## 10. Padrões de código

### A respeitar
- React 19 functional components com hooks
- Imports relativos com `./` ou `../`
- Tipo `module` (ESM, não CommonJS)
- ESLint deve passar sempre antes de qualquer commit (`npm run lint`)
- Mensagens de commit em português, formato `tipo: descrição`

### A migrar gradualmente (não tudo de uma vez)
- `var` → `const` / `let` (o código atual usa muito `var`, herança de geração antiga)
- Sub-componentes inline em `App.jsx` → ficheiros próprios em `src/components/`

### A NÃO fazer sem aprovação explícita
- Introduzir TypeScript (decisão arquitetural grande)
- Introduzir Tailwind, styled-components ou outras frameworks de CSS
- Migrar estilos inline para CSS modules
- Introduzir state managers (Zustand, Redux) — useState chega
- Adicionar dependências novas sem justificação clara

---

## 11. Workflow obrigatório de cada tarefa

Cada agente deve seguir este ciclo, sem exceções:

1. **Ler** `CLAUDE.md` (este ficheiro) e o ficheiro do próprio agente em `.claude/agents/`
2. **Entender** o pedido — se ambíguo, pedir clarificação ao Ricardo antes de tocar em código
3. **Verificar** se a tarefa cai em área proibida — se sim, parar e pedir aprovação
4. **Planear** — apresentar plano em bullet points antes de executar
5. **Executar** — uma alteração de cada vez, ficheiro a ficheiro
6. **Validar** — correr `npm run lint`; se houver testes, correr `npm test`
7. **Apresentar diff** — mostrar o que mudou antes de qualquer commit
8. **Esperar aprovação** do Ricardo
9. **Commit** com mensagem clara em português (ex: `refactor: extrair FeatureSelection para componente próprio`)

---

## 12. ⛔ Proibido fazer push automático

**Nenhum agente pode executar `git push` sozinho.** O push é sempre feito pelo Ricardo manualmente, depois de inspecionar os commits localmente. Os agentes podem fazer `git add` e `git commit`, mas nunca `git push`.

---

## 13. Comunicação com o Ricardo

- Sempre em **português europeu** (ex: "ficheiro" não "arquivo", "ecrã" não "tela", "rato" não "mouse")
- Direto, sem rodeios, sem floreados
- Quando explicar opções técnicas, dar **uma recomendação clara** em vez de listar prós/contras infinitos
- Confirmar antes de qualquer ação destrutiva ou irreversível
- Se o Ricardo pedir algo que pode quebrar o produto, **avisar primeiro, executar depois (com confirmação)**

---

## 14. Quando pedir ajuda ao Ricardo

- Quando uma tarefa exige acesso a contas externas (Vercel, Supabase, Stripe dashboard)
- Quando precisa de uma decisão de produto (não técnica)
- Quando uma alteração toca em área proibida
- Quando o teste local passa mas há dúvidas sobre impacto em produção
- Quando precisa de uma chave de API ou variável de ambiente

---

## 15. Subagentes disponíveis

Este projeto tem 4 subagentes especializados em `.claude/agents/`:

- **dev** — Desenvolvedor: refactoring, novas features, manutenção de código
- **qa** — Qualidade: testes, cobertura, validação de determinismo
- **ux** — Design e experiência: UI, responsividade, copy, acessibilidade
- **devops** — Infraestrutura: build, deploy, PWA, analytics, mobile prep

Cada um tem um ficheiro próprio com a sua identidade e regras específicas. Lê o teu antes de começar.
