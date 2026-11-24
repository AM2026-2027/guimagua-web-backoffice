# Guimágua Smart Pool — Backoffice Web: regras de engenharia

Regras para qualquer agente de IA (Claude Code, Gemini, outros) e para qualquer pessoa que trabalhe neste repositório.
Atua como Engenheiro Frontend Sénior. Em caso de conflito entre este ficheiro e outro documento, este ficheiro prevalece; se o conflito for relevante, pára e pergunta.

## 1. Contexto do produto

- **Guimágua**: empresa de construção, remodelação e manutenção de piscinas.
- **Ecossistema**: este **Backoffice Web** (gestão interna, acesso só para `admin`) + **App Cliente** e **App Guimágua** (perfis técnico e comercial), ambas Android/Kotlin noutro repositório. Todos partilham o **mesmo projeto Firebase** (Auth + Cloud Firestore).
- **Não existe portal web para clientes.** Não implementar landing page, registo de clientes nem áreas de cliente na web. O material em `docs/_fora-de-ambito/` é só referência visual.
- Documentação: `docs/README.md` (índice), `docs/modulos.md` (mapa módulo → requisitos, protótipos, specs), `docs/modelo-dados.md` (modelo de dados oficial), `docs/decisoes.md` (decisões tomadas e pendentes).
- **Precedência:** `AGENTS.md` > `docs/decisoes.md` > `docs/modelo-dados.md` > specs dos cards e protótipos. Os cards do Trello são anteriores às decisões; quando contradizem uma decisão (ex.: a spec do `team` diz que as contas se criam na consola), prevalece a decisão.

## 2. O que já existe na `main` (ler antes de propor)

- Configuração e constantes: `src/config/firebase.js`, `src/constants/roles.js`, `src/constants/modules.js`.
- Serviços: `src/services/authService.js`, `src/services/userService.js` (`users/{uid}` com `{ name, email, role, is_active }`).
- Autenticação e RBAC: `src/features/auth/` (`AuthContext.js`, `AuthProvider.jsx`, `useAuth.js`, `RequireAuth.jsx`, `RequireRole.jsx`, `AuthForm.jsx`, `AuthPage.jsx`). Roles: `admin`, `client`, `technician`, `commercial`; o backoffice é restrito a `admin`.
- Layout e partilhados: `src/layout/{MainLayout,Sidebar,Header,Footer}.jsx`, `src/shared/components/{LoadingSpinner,ErrorAlert,MessagePage,ModulePlaceholder}.jsx`, `src/styles/base.css`.
- Rotas em `src/App.jsx`: os 8 módulos (`/dashboard`, `/tickets`, `/agenda`, `/clients`, `/team`, `/services`, `/inventory`, `/reports`), `/auth`, `/sem-acesso` (403) e `*` (404).
- Cada módulo já tem a página de entrada `src/features/<modulo>/pages/<Nome>Page.jsx` (com `ModulePlaceholder`, ou uma saudação no caso do dashboard), já ligada à rota. A implementação substitui o conteúdo dessa página; não se cria uma rota nova. No módulo `services-catalog` a página é `ServicesPage.jsx`.
- Variáveis de ambiente: `.env.local` (não versionado) com as chaves `VITE_FIREBASE_*` listadas em `.env.example`.

## 3. Grupos, branches e fronteiras

| Grupo | Branch de integração | Módulos (pasta em `src/features/`) | Serviços que pode editar (`src/services/`) |
|---|---|---|---|
| A | `grupo-a` | `dashboard`, `tickets`, `agenda`, `reports` | `dashboardService.js`, `ticketsService.js`, `agendaService.js`, `reportsService.js` |
| B | `grupo-b` | `clients`, `team`, `services-catalog`, `inventory` | `clientsService.js`, `servicesCatalogService.js`, `inventoryService.js` e extensões em `userService.js` |

**Fluxo Git:** `feat/<a|b>-<modulo>` → PR para `grupo-<a|b>` → aprovação → PR de `grupo-<a|b>` para `main`.

- **Nunca trabalhar diretamente** em `main`, `grupo-a` ou `grupo-b`, nem fazer push para esses branches; só entram alterações por PR. O GitHub não está a impor esta regra (plano gratuito, G-02), por isso depende de todos a cumprirem.
- **Criar um branch de funcionalidade:** a partir do branch do grupo atualizado: `git checkout grupo-<a|b>` → `git pull` → `git checkout -b feat/<a|b>-<modulo>` (ex.: `feat/b-clients-crud`).
  - Um módulo ou ecrã por PR.
  - Branches curtos: idealmente fazer merge em menos de uma semana.
- **Sincronizar com a `main`:** sempre que a `main` recebe um merge, o responsável de cada grupo traz a `main` para o branch do grupo (PR `main` → `grupo-<a|b>`) antes de começarem features novas.
  - Antes de começar, confirmar com `git log --oneline grupo-<a|b>..origin/main`: se a lista não estiver vazia, o branch do grupo está atrasado e é preciso avisar.
- **Alterações a ficheiros partilhados:** branch `chore/<descricao>` a partir da `main`, PR direto para a `main`, revisto por um elemento de cada grupo; depois, sincronizar os dois grupos.
- **CI:** cada PR corre `lint` e `build` (`.github/workflows/ci.yml`). Só se faz merge com a CI verde.
- **Ler outros módulos:** um módulo pode ler coleções de outros módulos a partir do **seu próprio** serviço. Nunca editar o serviço ou a pasta de outro grupo.
- **Ficheiros partilhados (não alterar sem autorização explícita):**
  - código: `src/App.jsx`, `src/main.jsx`, `src/config/firebase.js`, `src/constants/*`, `src/layout/*`, `src/shared/*`, `src/styles/base.css`, `src/features/auth/*`;
  - configuração: `index.html`, `vite.config.js`, `eslint.config.js`, `package.json`, `package-lock.json`, `firestore.rules`, `storage.rules`, `firebase.json`, `.github/*`;
  - agentes e documentação: `AGENTS.md`, `CLAUDE.md`, `.claude/*`, `.agent/*`, `docs/modelo-dados.md`, `docs/decisoes.md`.

  Se a tarefa exigir uma dependência nova ou alterar um ficheiro partilhado: **pára e justifica antes de mexer**.

## 4. Modelo de dados

- A fonte de verdade é `docs/modelo-dados.md`, alinhado com a App Android: `users`, `clients`, `pools`, `services`, `consumables`, `appointments`, `tickets`, `pool_readings` e `settings` (limiares de alerta).
- O modelo de dados **prevalece** sobre nomes antigos que aparecem nas specs dos cards (`agenda_events`, `services_catalog`, `inventory` como coleção, dados da piscina dentro de `clients`, nomes em português do dicionário de dados).
- As **regras de validação** (regex de email, telefone +351, NIF, intervalos de pH, cloro e temperatura, matrícula) vêm do dicionário de dados: `docs/02-arquitetura-e-dados/dicionario-dados/`.
- Campos: inglês, `snake_case`. Campos novos só podem ser **acrescentados** (nunca renomear nem remover campos existentes) e têm de aparecer no plano marcados como "campo novo — validar com a equipa Android".
- Timestamps de auditoria (`created_at`, `updated_at`) usam sempre `serverTimestamp()`, nunca `new Date()`.

## 5. Restrições que não mudam

1. **Stack fechada** (versões em `package.json`; Node 22):
   - React 19 + Vite 8;
   - Tailwind CSS v4: tokens em `@theme` no `src/styles/base.css` (`primary`, `primary-dark`, `background`); não há `tailwind.config.js`;
   - Firebase JS SDK v13 modular (Auth + Firestore);
   - React Router v8: importar sempre de `"react-router"`, nunca de `"react-router-dom"`; o `BrowserRouter` está em `src/main.jsx`;
   - ESLint 10 (`eslint.config.js`).

   Qualquer mudança à stack tem de ser justificada antes.
2. **Quotas gratuitas do Firebase:** o projeto está no plano Spark. A passagem a Blaze está pendente (P-08) e é só por causa do Storage. Em qualquer dos planos, o código tem de caber nas quotas gratuitas e **não se usam Cloud Functions**.
   - Listas pequenas (ex.: `services`, `users`) podem ser carregadas uma vez e filtradas e ordenadas no cliente, sem pedidos repetidos.
   - Listas que crescem (`clients`, `consumables`, histórico de `appointments` e `tickets`) usam paginação por cursor (`limit` + `startAfter`), conforme o RNF-WEB02, e `where` quando reduz leituras.
   - Nunca criar subscrições em ciclo (dependências de `useEffect` estáveis; limpar sempre o `onSnapshot`).
3. **Datas:** fuso `Europe/Lisbon`, formatação PT-PT.
4. **Idioma:** código 100% em inglês (ficheiros, componentes, hooks, serviços, variáveis, props, campos Firestore). Comentários em PT-PT a explicar regras de negócio, validações e limpeza de efeitos. Interface em PT-PT: desktop-first, funcional em ecrãs menores e acessível (labels associados, `aria-label`, foco visível, contraste adequado).
5. **Valores de enums** (estados, roles, tipos): guardar no Firestore em **minúsculas `snake_case`** (ex.: `scheduled`, `in_analysis`, `commercial_survey`) e mostrar o rótulo PT-PT na UI através de um mapa de constantes no `utils/` do módulo (D-07).
6. **Segurança:**
   - Nunca pedir para colar chaves, tokens ou passwords no chat; nunca ler nem commitar `.env.local`.
   - Nunca contornar `RequireAuth` ou `RequireRole`.
   - Em `team`, o administrador autenticado não pode alterar o próprio `role` nem desativar a própria conta.
   - **Contas de técnicos e comerciais:** só no módulo `team`, seguindo o fluxo da D-08 (instância secundária do Auth, password temporária nunca mostrada, email de definição de password). Em mais nenhum sítio se criam contas.
   - **Ficheiros (fotos, PDFs):** só no Firebase Storage, nos caminhos da D-09; nunca no Google Drive. Enquanto a P-08 (plano Blaze) não estiver feita, não implementar upload nem download: mostrar um placeholder.
7. **Identidade visual:**
   - Usar as classes `bg-primary`, `text-primary`, `hover:bg-primary-dark` e `bg-background` em vez de cores hexadecimais soltas: primária `#0B4F6C`, primária escura `#083B51`, fundo `#F4F7F9`, cartões brancos com borda subtil (`border-slate-200`). A fonte de verdade é `src/styles/base.css`.
   - Reutilizar `LoadingSpinner`, `ErrorAlert` e `MessagePage`.
   - Seguir os protótipos Figma em `docs/04-backoffice-web/<modulo>/`.

## 6. Arquitetura em 4 camadas

Fluxo unidirecional obrigatório: `Componentes (.jsx)` → `Hooks (.js)` → `Serviços (.js)` → `Firebase`.

- **Serviços** (`src/services/*.js`):
  - JavaScript puro, proibido importar `react`.
  - Única camada que importa `firebase/*` e `src/config/firebase.js`.
  - Devolve objetos normalizados `{ id: doc.id, ...doc.data() }`.
- **Hooks** (`src/features/<modulo>/hooks/use<Modulo>.js`):
  - Gerem estado (`items`, `loading`, `error`) e subscrições com limpeza (`let ignore = false` ou `return unsubscribe`).
  - As operações CRUD devolvem `true`/`false`.
  - Atualizações sempre imutáveis (`setItems((prev) => ...)` com spread, `.map()`, `.filter()`); proibido `.push()`, `.splice()` ou `.sort()` sobre o estado.
- **Domínio / utilitários** (`src/features/<modulo>/utils/*.js`): funções puras, sem Firestore nem estado React (`validate`, `sort*`, `toFormState`, `toPayload`, mapas de rótulos).
- **Componentes e páginas** (`src/features/<modulo>/components/` e `pages/`):
  - Proibido importar `firebase/*` ou chamar `src/services/*`.
  - Tabelas e formulários são apresentacionais (dados e callbacks por props); o estado vive na `*Page.jsx`.
  - Listas sempre com `key={item.id}`.
  - Formulários:
    - inputs controlados com um handler único por `name`;
    - `noValidate` e validação em JS;
    - `Number(...)` explícito;
    - `key` para reset/edição, sem `useEffect` a copiar props;
    - `try / catch / finally` com `disabled={saving}`;
    - feedback de sucesso/erro sem apagar os dados preenchidos em caso de falha (RNF-GLB03).
  - Não duplicar estado derivado: filtros, ordenação e contadores são calculados na renderização.

## 7. Modo de trabalho: Planear → Aprovar → Executar → Provar

1. **Planear (sem escrever código):**
   - Ler a documentação do módulo (`docs/modulos.md`) e o código existente da feature e dos serviços ligados.
   - Confirmar o branch (`git branch --show-current`) e avisar se for `main`, `grupo-a` ou `grupo-b`.
   - Apresentar um plano curto com:
     - ficheiros a criar ou alterar, por camada;
     - coleções e campos (existentes vs. novos);
     - estratégia de leitura no Firestore;
     - dúvidas, cada uma com uma proposta.
   - **Parar e esperar aprovação** antes de editar, instalar pacotes ou fazer commits.
2. **Executar:** só o módulo aprovado, sem tocar em módulos de outros grupos.
3. **Provar (nunca dizer apenas "funciona"):**
   - Correr `npm run lint` e `npm run build` (no Windows, se o PowerShell bloquear scripts: `npm.cmd run lint` / `npm.cmd run build`) e mostrar o resultado real.
   - Confirmar que nenhum ficheiro fora de `src/services/` importa `firebase/*`.
4. **Guia de teste:** terminar com passos concretos para testar no browser e confirmar na consola do Firestore.
5. **Sessões longas:** resumir o estado (feito / falta / decisões) para se poder retomar numa sessão nova.

## 8. Definição de "feito" (cada módulo/PR)

- Branch `feat/a-*` ou `feat/b-*` criado a partir de `grupo-a` ou `grupo-b` (que não pode estar atrasado em relação à `main`).
- CI verde no PR.
- Quatro camadas respeitadas e zero imports de `firebase/*` fora de `src/services/`.
- Coleções e campos conforme `docs/modelo-dados.md`; campos novos listados na descrição do PR.
- Código em inglês, comentários e UI em PT-PT, tema Guimágua.
- `lint` e `build` com 0 erros e 0 avisos nos ficheiros tocados.
- Fluxos principais testados localmente contra o Firebase real.
- Sem `.env.local` nem alterações não autorizadas a ficheiros partilhados no diff.
