---
name: fechar-modulo
description: Fecha um módulo do Backoffice Web Guimágua. Verifica e prova o trabalho (fronteiras, camadas, lint, build), faz commit e push do branch de funcionalidade, abre o PR para o branch do grupo e faz merge quando o PR tiver aprovação e CI verde.
argument-hint: "[modulo opcional]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git branch --show-current) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git fetch *) Bash(npm run lint) Bash(npm run build) Bash(npm.cmd run lint) Bash(npm.cmd run build) Bash(gh auth status) Bash(gh pr view *) Bash(gh pr list *) Bash(gh pr checks *)
---

Vamos fechar o módulo em curso ($ARGUMENTS) segundo as secções 7 e 8 do `AGENTS.md`.

Regras desta skill:
- Mostra sempre o output real de cada comando.
- **Pede confirmação explícita antes de cada passo que muda alguma coisa fora do teu PC**: commit, push, criar o PR e merge.
- Esta skill **nunca** faz merge para a `main`, nunca faz push para `main`/`grupo-*` e nunca usa `--admin` nem `--force`. A promoção para a `main` e o deploy fazem-se com `/publicar`.
- A skill pode ser corrida várias vezes: se o PR já existir, salta para o passo 8.

## 1. Contexto

- `git branch --show-current`: tem de ser `feat/a-*` ou `feat/b-*`. Deduz o grupo (`grupo-a` / `grupo-b`) e o módulo. Noutro branch, pára.
- `git fetch origin`. Depois, `git status --short` e `git diff --name-only origin/grupo-<a|b>...HEAD` para listar os ficheiros alterados, incluindo os não commitados.
- `gh pr list --head <branch> --state open --json number,url`: se já houver PR aberto, vai para o passo 8.
- `gh auth status`: se o `gh` não estiver instalado ou autenticado, indica `winget install GitHub.cli` e `gh auth login`, e faz só os passos 2 a 5.

## 2. Fronteiras

Compara os ficheiros alterados com a secção 3 do `AGENTS.md`:
- ficheiros de **outro grupo** → ❌
- **ficheiros partilhados** → ❌, a menos que estejam autorizados (decisão em `docs/decisoes.md` ou aprovação nesta conversa; indica qual)
- qualquer `.env*` exceto `.env.example` → ❌

## 3. Camadas e convenções (no código do módulo)

- Imports de `firebase/` ou de `config/firebase` fora de `src/services/` → ❌.
- Imports de `react` em `src/services/` → ❌.
- `react-router-dom` → ❌.
- `key={index}` / `key={i}` ou keys baseadas no índice do `map` → ❌.
- `new Date()` em payloads gravados no Firestore (em vez de `serverTimestamp()`) → ❌.
- Enums que não estejam em minúsculas `snake_case` (D-07) → ❌.
- Mutação de estado (`.push(`, `.splice(`, `.sort(` sobre arrays de estado) → ⚠️, para rever.
- Coleções e campos vs. `docs/modelo-dados.md`: lista os **campos novos**.

## 4. Lint e build

Executa `npm run lint` e depois `npm run build` (no Windows, se o PowerShell bloquear scripts: `npm.cmd run …`). Se houver erros ou avisos nos ficheiros tocados, propõe as correções e **pára**: só continua depois de estarem corrigidos e verificados de novo.

## 5. Relatório

Apresenta uma tabela com a definição de feito (✅ / ❌ / ⚠️). Se houver algum ❌, **pára aqui**.

Depois, apresenta:
- o **guia de teste no browser**: passos concretos e o que confirmar na consola do Firestore;
- a **descrição do PR**, seguindo `.github/pull_request_template.md`, preenchida.

## 6. Commit (pede confirmação)

- Mostra os ficheiros a incluir e a mensagem proposta: `feat(<modulo>): <resumo>`, Conventional Commits, em PT-PT.
- Depois do "sim": `git add` só desses ficheiros (nunca `git add -A` às cegas) e `git commit`.

## 7. Push e PR (pede confirmação)

- `git push -u origin <branch-atual>`, só se o branch atual for `feat/*`.
- `gh pr create --base grupo-<a|b> --head <branch-atual> --title "feat(<modulo>): …" --body-file <ficheiro temporário com a descrição do passo 5>`.
- Mostra o URL do PR e pede ao utilizador para pedir revisão a um colega do grupo.

## 8. Estado do PR

- `gh pr checks <n>`: código de saída 0 = CI verde, 8 = ainda a correr, outro = falhou.
- `gh pr view <n> --json author,reviews,mergeable,state,url`. Como o GitHub não exige revisões neste repositório (G-02), conta tu as aprovações: tem de haver **pelo menos uma review `APPROVED` de alguém que não seja o autor do PR** e nenhuma `CHANGES_REQUESTED` posterior dessa pessoa.
- Resultados possíveis:
  - CI a correr ou sem aprovação: diz exatamente o que falta e **termina** ("corre `/fechar-modulo` outra vez quando houver aprovação").
  - CI falhou: mostra o erro e propõe a correção (novo commit e push, com confirmação).
  - `mergeable` = `CONFLICTING`: explica o conflito; resolve-se trazendo o `grupo-<a|b>` para o branch (com confirmação).

## 9. Merge para o grupo (pede confirmação)

Só com CI verde, aprovação válida e sem conflitos:
- `gh pr merge <n> --squash --delete-branch`;
- depois: `git checkout grupo-<a|b>` e `git pull`;
- resume: PR fundido, branch apagado, e o próximo passo (`/novo-modulo` para outro ecrã, ou o responsável do grupo corre `/publicar` quando quiserem levar o grupo para a `main`).
