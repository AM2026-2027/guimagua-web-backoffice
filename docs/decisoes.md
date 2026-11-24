# Decisões do projeto

Registo de decisões tomadas e pendentes. Quando um agente encontrar uma pendente relevante para a tarefa, deve indicá-la no plano, aplicar a proposta só se for aprovada e, depois de decidida, atualizar este ficheiro (ficheiro partilhado: alterar só com autorização).

## Tomadas

| Id | Data | Decisão |
|---|---|---|
| D-01 | 24/11/2026 | A web tem **apenas o backoffice de gestão** (role `admin`). O portal web do cliente, a landing page e o catálogo público foram abandonados; o material fica em `docs/_fora-de-ambito/` só como referência. |
| D-02 | 24/11/2026 | O **modelo de dados oficial** é o da App Android (`users`, `clients`, `pools`, `services`, `consumables`, `appointments`, `tickets`, `pool_readings`), descrito em `docs/modelo-dados.md`. As specs do backoffice adaptam-se a ele. |
| D-03 | 24/11/2026 | **Cores:** primária `#0B4F6C`, primária escura `#083B51`, fundo `#F4F7F9`. Aplicadas em `src/styles/base.css` (antes: `#0F4C81` / `#0B3A63` / `#F8FAFC`). |
| D-04 | 24/11/2026 | As regras dos agentes vivem em `AGENTS.md` (partilhado por Gemini, Claude Code e outros). `CLAUDE.md` importa-o; `.agent/skills/guimagua-web/SKILL.md` só aponta para ele. |
| D-05 | 24/11/2026 | **Leituras no plano Spark:** listas pequenas são carregadas uma vez e filtradas no cliente; listas que crescem usam paginação por cursor (RNF-WEB02). |
| D-06 | 24/11/2026 | **Fluxo Git:** mantém-se `feat/<a\|b>-*` → `grupo-<a\|b>` → `main`, com três regras novas: sincronizar os branches de grupo com a `main` depois de cada merge; alterações partilhadas via `chore/*` direto para a `main`; CI (lint + build) obrigatória em todos os PR. |

## Ações pendentes no GitHub (não se resolvem no código)

### G-01: Nomes dos branches de grupo
No GitHub os branches chamam-se `Grupo-A` e `Grupo-B`; os branches locais e a documentação usam `grupo-a` e `grupo-b`. No Windows o Git não distingue maiúsculas e esconde o problema, mas um `git push` a partir de `grupo-a` pode criar no GitHub um segundo branch `grupo-a`, e a CI ou outros sistemas operativos tratam-nos como branches diferentes.

**Ação:** renomear no GitHub (Settings → Branches) para `grupo-a` e `grupo-b`. Depois, cada pessoa corre `git fetch --prune`.

### G-02: Proteger os branches
O commit "Atualização SKILL agente" entrou na `main` sem PR, o que mostra que a `main` não está protegida.

**Ação:** em Settings → Branches (ou Rules), proteger `main`, `grupo-a` e `grupo-b` com:
- PR obrigatório;
- pelo menos 1 aprovação;
- verificação `CI / lint-build` obrigatória;
- push direto bloqueado.

### G-03: Atualizar os branches de grupo
Os branches de grupo no GitHub estão atrasados em relação à `main` (falta-lhes o merge do PR #4 e a atualização da skill). Além disso, o `grupo-b` local tem 2 commits que não foram enviados.

**Ação:** depois do PR `chore/claude-code-setup` entrar na `main`, abrir os PR `main` → `grupo-a` e `main` → `grupo-b`.

## Pendentes

### P-01: Formato dos valores de enums no Firestore
- **Problema:** os roles já estão gravados em minúsculas (`admin`, `technician`…), mas os enums Kotlin do diagrama estão em maiúsculas (`SCHEDULED`, `PENDING`, `MAINTENANCE`). Por omissão, o Firestore grava o nome do enum Kotlin tal como está.
- **Proposta:** todos os valores em minúsculas `snake_case` (`scheduled`, `in_progress`, `completed`, `cancelled`; `pending`, `in_analysis`, `responded`; `maintenance`, `repair`, `commercial_survey`), coerentes com os roles já em produção. A app Android mapeia com `@PropertyName` ou um conversor. Rótulos PT-PT num mapa de constantes no módulo.
- **Decidir com:** equipa Android.

### P-02: Criação de contas de técnicos e comerciais (RF-WEB02)
- **Problema:** o RF-WEB02 pede que o backoffice crie automaticamente a conta no Firebase Auth e envie as credenciais. Com o SDK cliente, `createUserWithEmailAndPassword` termina a sessão do admin. As Cloud Functions e o Admin SDK (necessário também para Custom Claims) não existem no plano Spark.
- **Opções:**
  - (a) Criar a conta numa segunda instância da app Firebase no browser, sem afetar a sessão do admin; gravar `users/{uid}`; enviar `sendPasswordResetEmail` para o colaborador definir a password.
  - (b) Passar ao plano Blaze e usar uma Cloud Function com o Admin SDK.
  - (c) Criação manual na consola.
- **Proposta:** (a). O role fica em `users/{uid}.role`, como já está na `main`. Nota: isto diverge do RNF-GLB01, que fala em Custom Claims.

### P-03: Armazenamento de fotografias e PDFs
- **Problema:** o RNF-GLB04 e o diagrama de repositórios usam Google Drive com Service Account. Uma Service Account não pode estar no browser, e no plano Spark não há backend para a usar. O setup (#104/#120) fala em Firebase Storage. O backoffice precisa de mostrar as fotos dos tickets (#78) e de gerar PDFs de intervenção (RF-WEB08).
- **Opções:** Firebase Storage com regras por role; backend próprio (Blaze/Cloud Run) para o Drive; adiar as fotos no backoffice.
- **Até decidir:** o backoffice não faz upload; mostra apenas a contagem de fotos ou um placeholder.

### P-04: Stock comprometido e projetado
- **Problema:** o ecrã de inventário (#72) mostra stock físico, comprometido e projetado. O modelo só tem `stock_quantity` e `projected_stock`.
- **Proposta:**
  - comprometido = soma de `services.base_consumables` dos `appointments` com estado agendado/em curso, calculado no cliente;
  - projetado = físico − comprometido;
  - `projected_stock` atualizado no serviço da agenda ao criar ou cancelar um agendamento;
  - o abate do stock físico é feito pela app ao concluir a intervenção, numa transação/batch (RNF-TEC02).

### P-05: Limiares de alerta parametrizáveis (RF-WEB05)
- **Problema:** os limiares (ex.: pH 7.2–7.6) devem ser configuráveis, mas não há nenhuma coleção prevista para isso.
- **Proposta:** documento único `settings/alert_thresholds` (coleção nova, a validar com a equipa Android). Até lá, constantes no módulo do dashboard.

### P-06: Origem da "telemetria IoT"
- **Problema:** o dashboard (#63) e a App Cliente falam em telemetria em tempo real e exceções IoT, mas o modelo só tem `pool_readings`, registadas pelos técnicos.
- **Proposta:** tratar como alerta a última `pool_reading` fora dos limiares até existir integração com sensores.

### P-07: Dono do `firestore.rules`
- **Problema:** as regras RBAC (RNF-GLB02) afetam a web e as apps.
- **Proposta:** ficheiro partilhado, alterado só via PR revisto por um elemento de cada equipa.
