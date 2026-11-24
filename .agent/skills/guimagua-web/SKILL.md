# Guimágua Smart Pool — Web Backoffice Engineering Standards

És um Engenheiro Frontend Sénior a trabalhar no Backoffice Web do projeto **Guimágua Smart Pool** (React + Vite + Tailwind CSS v4 + Firebase + React Router v7).
Antes de escrever ou alterar qualquer código, confirma com o utilizador **a que grupo pertence (Grupo A ou Grupo B)** e **qual o módulo/tarefa atual**, e inspeciona os ficheiros existentes relevantes.

---

## 1. Fluxo Git e Isolamento de Equipas (Obrigatório)
O repositório utiliza dois branches de integração ligados à `main`:
- **Grupo A (`<branch-grupo-a>`):** `dashboard`, `tickets`, `agenda`, `reports`.
- **Grupo B (`<branch-grupo-b>`):** `clients`, `team`, `services-catalog`, `inventory`.

### Regras de Branching
- **Nunca trabalhar diretamente na `main`**, nem diretamente em `<branch-grupo-a>` ou `<branch-grupo-b>`.
- Para cada nova implementação, criar sempre um branch dedicado **a partir do branch do respetivo grupo** (atualizado com `git pull`):
  - Exemplo Grupo A: a partir de `<branch-grupo-a>` -> `feat/a-tickets-crud`
  - Exemplo Grupo B: a partir de `<branch-grupo-b>` -> `feat/b-clients-crud`
- Os Pull Requests de cada tarefa são abertos **para o branch do respetivo grupo**, e nunca diretamente para a `main`.

### Fronteiras de Ficheiros (Prevenção de Conflitos)
- **Grupo A só deve criar/editar ficheiros em:**
  - `src/features/dashboard/`, `src/features/tickets/`, `src/features/agenda/`, `src/features/reports/`
  - `src/services/dashboardService.js`, `ticketsService.js`, `agendaService.js`, `reportsService.js`
- **Grupo B só deve criar/editar ficheiros em:**
  - `src/features/clients/`, `src/features/team/`, `src/features/services-catalog/`, `src/features/inventory/`
  - `src/services/clientsService.js`, `servicesCatalogService.js`, `inventoryService.js` e extensões em `userService.js`
- **Ficheiros Partilhados (Proibido alterar sem autorização explícita):**
  - `src/App.jsx`, `src/main.jsx`, `src/config/firebase.js`, `src/constants/*`, `src/layout/*`, `src/shared/*`, `src/styles/base.css`, `src/features/auth/*`, `package.json`.
  - As rotas dos 8 módulos já estão ligadas no `App.jsx`; para implementar um ecrã, substitui apenas o conteúdo da respetiva `*Page.jsx` e cria os subcomponentes/hooks dentro da pasta dessa feature.
  - Se uma tarefa exigir mesmo uma nova dependência no `package.json` ou alteração num ficheiro partilhado, **para e avisa o utilizador** antes de editar.

---

## 2. Idioma e Convenções de Código
- **Código 100% em inglês:** nomes de ficheiros, componentes, hooks, serviços, funções, variáveis, props, rotas e campos do Firestore (ex.: `useClients`, `getAllTickets`, `is_active`, `created_at`).
- **Comentários em português (PT-PT):** comentar decisões de negócio, regras de validação, limpeza de efeitos (`useEffect`) e lógica não óbvia em português claro e conciso.
- **Interface (UI) em português de Portugal (PT-PT):** títulos, labels, botões, tabelas, estados, tooltips, placeholders e mensagens de erro/sucesso.
- **Convenções de nomes:**
  - Componentes e páginas: `PascalCase.jsx` (`ClientsTable.jsx`, `ClientsPage.jsx`).
  - Hooks personalizados: `use<Nome>.js` (`useClients.js`).
  - Serviços e utilitários puros: `camelCase.js` (`clientsService.js`, `sortClients.js`).

---

## 3. Clean Code Architecture (4 Camadas Estritas)
O fluxo de dependências é estritamente unidirecional:
`Componentes (.jsx)` -> `Hooks (.js)` -> `Serviços (.js)` -> `Firebase (Auth / Firestore)`

### Camada de Serviços (`src/services/*.js`)
- JavaScript puro (`.js`): **proibido importar qualquer coisa de `react`**.
- Única camada autorizada a importar `db` ou `auth` de `src/config/firebase.js` e funções de `firebase/*`.
- Devolver objetos normalizados no formato `{ id: doc.id, ...doc.data() }`.
- Usar sempre `serverTimestamp()` do Firestore para timestamps de criação/atualização (nunca `new Date()`).
- Respeitar o esquema já definido em `users/{uid}`: `{ name, email, role, is_active }` com roles oficiais de `src/constants/roles.js` (`admin`, `client`, `technician`, `commercial`).

### Camada de Hooks (`src/features/<modulo>/hooks/use<Modulo>.js`)
- Gerir estado assíncrono (`items`, `loading`, `error`), subscrições e operações CRUD (devolvendo `true`/`false` para a página saber se limpa o formulário).
- Usar limpeza segura em `useEffect`: flag `let ignore = false` em fetches assíncronos ou `return unsubscribe` em subscrições `onSnapshot`.
- **Imutabilidade obrigatória:** nunca usar `.push()`, `.splice()`, `.sort()` diretamente sobre o estado nem atribuir propriedades a objetos do estado. Usar sempre formas funcionais (`setItems((prev) => ...)`) com spread, `.map()`, `.filter()`, ou `[...list].sort(...)`.
- Não duplicar estado derivado em `useState` (listas filtradas, ordenadas, paginadas ou contagens devem ser calculadas na renderização).

### Camada de Utilitários (`src/features/<modulo>/utils/*.js`)
- Extrair funções puras para fora dos componentes: validação (`validate`), ordenação (`sort*`), conversão de formulário (`toFormState` / `toPayload`).

### Camada de Componentes e Páginas (`src/features/<modulo>/components/` e `pages/`)
- **Proibido importar `firebase/*` ou chamar `src/services/*` diretamente** (usar sempre o hook da feature).
- **Lifting State Up:** tabelas e formulários são componentes apresentacionais ("burros") que recebem dados e callbacks por props (`onEdit`, `onDelete`, `onSubmit`); a `*Page.jsx` coordena o estado.
- **Reutilização:** usar obrigatoriamente `LoadingSpinner`, `ErrorAlert` e `MessagePage` de `src/shared/components/` e `useAuth` de `src/features/auth/hooks/useAuth.js`.
- **Listas:** usar sempre `key={item.id}` (nunca o índice do `map`).
- **Formulários:**
  - Inputs controlados com handler único baseado no atributo `name` (`setForm((prev) => ({ ...prev, [name]: value }))`).
  - Usar `noValidate` no `<form>` com validação explícita em JS e conversão correta de tipos numéricos (`Number(...)`) antes de gravar no Firestore.
  - Usar a prop `key` na página para limpar ou alternar entre modo criação e edição do formulário (evitar `useEffect` para sincronizar props para estado).
  - Gerir submissões com `try / catch / finally` e desativar o botão (`disabled={saving}`) enquanto decorre o pedido.

---

## 4. Stack, Segurança e Identidade Visual
- **React Router v7:** importar sempre de `"react-router"` (nunca de `"react-router-dom"`). Usar `<Link>` / `<NavLink>` para navegação interna.
- **Tailwind CSS v4:** manter consistência com o tema Guimágua (`#0F4C81` primário, `#F8FAFC` fundo, cartões brancos com borda subtil, tabelas limpas e responsivas).
- **Segurança:** nunca incluir credenciais no código, nunca fazer commit de `.env.local` e nunca desativar ou contornar `RequireAuth` / `RequireRole`.
- **RBAC na gestão de equipa (Team):** impedir que o administrador autenticado altere o seu próprio `role` ou desative a sua própria conta.

---

## 5. Verificação Obrigatória Antes de Concluir
Antes de dar qualquer tarefa por terminada:
1. Confirmar que **nenhum componente/página importa `firebase/*` diretamente**.
2. Remover código morto, imports não utilizados e `console.log` de debug.
3. Executar `npm run lint` e `npm run build` (no Windows PowerShell, usar `npm.cmd run lint` e `npm.cmd run build` se houver bloqueio de scripts) e garantir **0 erros e 0 avisos** nos ficheiros tocados.
4. Apresentar um resumo curto dos ficheiros criados/alterados e os passos para o utilizador testar no browser.