# Decisões do projeto

Registo das decisões tomadas e das que estão pendentes. Quando um agente encontrar uma pendente relevante para a tarefa, deve indicá-la no plano e não avançar nessa parte sem aprovação.
Este ficheiro é partilhado: só se altera com autorização, via PR `chore/*` para a `main`.

## Tomadas

| Id | Data | Decisão |
|---|---|---|
| D-01 | 24/11/2026 | A web tem **apenas o backoffice de gestão** (role `admin`). O portal web do cliente, a landing page e o catálogo público foram abandonados; o material fica em `docs/_fora-de-ambito/` só como referência. |
| D-02 | 24/11/2026 | O **modelo de dados oficial** é o da App Android, descrito em `docs/modelo-dados.md`. As specs do backoffice adaptam-se a ele. |
| D-03 | 24/11/2026 | **Cores:** primária `#0B4F6C`, primária escura `#083B51`, fundo `#F4F7F9`. Aplicadas em `src/styles/base.css` (antes: `#0F4C81` / `#0B3A63` / `#F8FAFC`). |
| D-04 | 24/11/2026 | As regras dos agentes vivem em `AGENTS.md` (partilhado por Gemini, Claude Code e outros). `CLAUDE.md` importa-o; `.agent/skills/guimagua-web/SKILL.md` só aponta para ele. |
| D-05 | 24/11/2026 | **Leituras no Firestore:** listas pequenas são carregadas uma vez e filtradas no cliente; listas que crescem usam paginação por cursor (RNF-WEB02). |
| D-06 | 24/11/2026 | **Fluxo Git:** `feat/<a\|b>-*` → `grupo-<a\|b>` → `main`. Os branches de grupo são sincronizados com a `main` depois de cada merge; as alterações partilhadas entram via `chore/*` direto para a `main`; a CI (lint + build) é obrigatória em todos os PR. |
| D-07 | 24/11/2026 | **Enums em minúsculas `snake_case`** no Firestore, coerentes com os roles já em uso. Valores em `docs/modelo-dados.md`. A app Android mapeia com `@PropertyName` ou um conversor. A UI mostra rótulos PT-PT a partir de um mapa de constantes. |
| D-08 | 24/11/2026 | **Contas de técnicos e comerciais** são criadas **manualmente pelo admin** no backoffice, no módulo `team` (aba "Equipa & Técnicos"). O fluxo técnico está descrito mais abaixo. As contas de clientes continuam a ser criadas pela App Cliente. |
| D-09 | 24/11/2026 | **Fotografias e PDFs ficam apenas no Firebase Storage.** O Google Drive com Service Account (RNF-GLB04, `DriveStorageRepository`) foi abandonado; comunicar à equipa Android. Requer o plano Blaze, ativo desde 24/11/2026 (D-14). |
| D-10 | 24/11/2026 | **Stock** (antiga P-04): comprometido = soma de `services.base_consumables` dos `appointments` com estado `scheduled`/`in_progress`, calculado no cliente; projetado = físico − comprometido; o serviço da agenda atualiza `consumables.projected_stock` ao criar ou cancelar um agendamento; a app abate o stock físico ao concluir a intervenção, numa transação/batch (RNF-TEC02). |
| D-11 | 24/11/2026 | **Limiares de alerta** (antiga P-05): documento único `settings/alert_thresholds` (coleção nova `settings`), editável pelo admin no módulo `dashboard`. Campos em `docs/modelo-dados.md`. |
| D-12 | 24/11/2026 | **Telemetria** (antiga P-06): enquanto não houver integração com sensores, um alerta é a última `pool_reading` de cada piscina fora dos limiares de `settings/alert_thresholds`. |
| D-13 | 24/11/2026 | **Regras de segurança** (antiga P-07): `firestore.rules` e `storage.rules` são ficheiros partilhados, alterados só via PR revisto por um elemento de cada equipa (web e Android). |
| D-14 | 24/11/2026 | **Plano Blaze** (antiga P-08): ativado em período de teste, sem custos. Mantém-se a regra de ficar dentro das quotas gratuitas e de não usar Cloud Functions. **Antes do fim do período de teste**, confirmar na consola da Google Cloud a data de fim e o que acontece à conta de faturação, para o Storage não deixar de funcionar a meio do projeto. |
| D-15 | 24/11/2026 | **Aprovação dos PR do product owner:** os PR abertos pelo product owner (conta GitHub `ldcc9298-arch`) não precisam de revisão nem de aprovação de outra pessoa; basta a CI verde e não haver conflitos. Vale para PR de módulo, de promoção (`grupo-<a\|b>` → `main`) e `chore/*`. Para os PR dos restantes elementos, mantém-se a regra de pelo menos uma aprovação de alguém que não seja o autor. |
| D-16 | 26/11/2026 | **Primeiro acesso e reposição da palavra-passe da equipa** (altera a D-08). A conta é criada com uma palavra-passe temporária, mostrada **uma única vez** ao admin, que a passa ao colaborador. O documento `users/{uid}` fica com `must_change_password: true` e a App obriga a escolher uma palavra-passe nova no início de sessão seguinte, pondo depois o campo a `false`. **Reposição:** o backoffice envia o link do Firebase para o email da conta (um endereço a que a Guimágua tem acesso, por exemplo um alias com `+` do email do admin), o admin define uma palavra-passe genérica e o campo volta a `true`. Não há SMS nem servidor, por isso não há custos. A viatura deixa de estar no técnico: passa a ser atribuída no agendamento. **O backoffice tem uma única conta `admin`**, que não é criada nem editada no módulo `team`: o `team` só gere técnicos e comerciais, que precisam de conta para aceder à App Guimágua. Os administradores não têm especialidades. **Acesso com nome de utilizador:** cada conta tem um `username`, gerado pelo backoffice a partir do nome (`primeiro.ultimo`; se já existir, `primeiro.inicialDoSegundoNome.ultimo`; se ainda existir, acrescenta-se um número). O email da conta no Firebase Auth é derivado dele: `<local>+<username>@<domínio>`, com a base definida em `VITE_STAFF_EMAIL_BASE` (por exemplo, um Gmail a que a Guimágua tem acesso). O técnico entra na App só com o `username`, e a App monta o email com a mesma base. O domínio tem de ser de uma caixa real, para os links de reposição chegarem. O `username` e o email não mudam depois de criados. |

### D-08: fluxo de criação de contas no módulo `team` (com as alterações da D-16)

1. O admin preenche um formulário com nome, telefone, role (`technician` ou `commercial`) e especialidades; o `username` e o email são gerados (D-16). A viatura não está no técnico e a conta `admin` não é gerida no `team` (D-16).
2. A conta é criada numa **instância secundária** do Firebase, para não terminar a sessão do admin:
   - em `src/config/firebase.js`: `initializeApp(firebaseConfig, 'secondary')` + `initializeAuth(secondaryApp, { persistence: inMemoryPersistence })`, exportado como `secondaryAuth`;
   - esta alteração ao ficheiro partilhado fica **autorizada por esta decisão**, no PR do módulo `team`, com revisão de um elemento de cada grupo.
3. Em `userService.js`, uma função `createStaffAccount()`:
   - `createUserWithEmailAndPassword(secondaryAuth, email, <palavra-passe temporária>)`, com a palavra-passe gerada com `crypto.getRandomValues`, mostrada uma única vez ao admin e nunca guardada (D-16);
   - `signOut(secondaryAuth)`;
   - `setDoc(doc(db, 'users', uid), { name, username, email, role, phone, specialties, is_active: true, must_change_password: true, created_at: serverTimestamp(), updated_at: serverTimestamp() })`.
   - Entregar a palavra-passe temporária ao colaborador equivale a "disparar as credenciais" do RF-WEB02.
   - Reposição (D-16): `sendPasswordResetEmail(auth, email)` para o email da conta, mais `must_change_password: true`.
4. **Erros:**
   - se a conta Auth for criada mas o documento falhar, mostrar o erro e permitir repetir só a gravação do documento (guardar o `uid` no estado);
   - sem o Admin SDK não é possível apagar contas Auth a partir do browser: retirar o acesso = `is_active: false`, que o `AuthProvider` já trata.
5. O role fica em `users/{uid}.role`, não em Custom Claims, que exigem o Admin SDK. Isto diverge do RNF-GLB01, e o `firestore.rules` usa o documento `users/{uid}`.
6. Continua a valer a regra de que o admin autenticado não pode alterar o próprio role nem desativar a própria conta.

### D-09: organização do Firebase Storage

| Ficheiro | Caminho no Storage | Quem escreve |
|---|---|---|
| Fotos de pedidos | `tickets/{ticketId}/{nomeFicheiro}` | App Cliente |
| Fotos da intervenção | `appointments/{appointmentId}/photos/{nomeFicheiro}` | App Guimágua (técnico) |
| Fotos de vistoria comercial | `appointments/{appointmentId}/survey/{nomeFicheiro}` | App Guimágua (comercial) |
| Relatório PDF | `appointments/{appointmentId}/report.pdf` | Backoffice (RF-WEB08) |

- O Firestore guarda os **caminhos** (`photo_paths`, `report_pdf_path`), não URLs. O backoffice obtém o URL com `getDownloadURL` no serviço do módulo.
- As fotos são comprimidas no dispositivo antes do upload (máx. 1,5 MB, RNF-COM01).
- O `getStorage` é acrescentado a `src/config/firebase.js` no primeiro módulo que precisar dele (`tickets` ou `reports`), com a mesma regra de revisão da D-08.

## Pendentes

Nenhuma de momento.

### Antiga P-08: plano Blaze (resolvida, ver D-14)
O Cloud Storage for Firebase deixou de estar disponível no plano Spark: num projeto Spark não há acesso a buckets e as chamadas à API devolvem erros 402/403. O uso gratuito mantém-se no Blaze (fonte: firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

## Ações no GitHub

| Id | Estado | Ação |
|---|---|---|
| G-01 | ✅ Feito | Branches de grupo renomeados para `grupo-a` e `grupo-b`. Cada pessoa deve correr `git fetch --prune` e confirmar que o branch local segue `origin/grupo-a` ou `origin/grupo-b`. |
| G-02 | ⚠️ Indisponível | A proteção de branches em repositórios privados de organizações exige um plano pago do GitHub. Mitigação: (1) regra de equipa de que só se entra por PR com a CI verde; (2) as regras `deny` do `.claude/settings.json` bloqueiam o push do Claude Code para `main` e `grupo-*`; (3) vale a pena confirmar se o docente pode obter o GitHub Team gratuito para a organização via GitHub Education. |
| G-03 | 🔁 Contínuo | `grupo-a` e `grupo-b` sincronizam-se com a `main` por PR (`main` → `grupo-<a\|b>`) depois de **cada** merge na `main` (D-06), feito pelo responsável do grupo. Antes de começar uma feature, confirmar com `git fetch origin` e `git log --oneline origin/grupo-<a\|b>..origin/main`: se a lista não estiver vazia, o grupo está atrasado. Nunca fazer push direto para os branches de grupo, nem de commits de sincronização feitos localmente. |
