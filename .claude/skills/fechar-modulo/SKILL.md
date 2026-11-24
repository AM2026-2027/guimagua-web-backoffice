---
name: fechar-modulo
description: Verifica e prova o trabalho de um módulo do Backoffice Web Guimágua antes do PR (fronteiras, camadas, lint, build), e gera o guia de teste e a descrição do PR.
argument-hint: "[modulo opcional]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git branch --show-current) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(npm run lint) Bash(npm run build) Bash(npm.cmd run lint) Bash(npm.cmd run build)
---

Vamos fechar o módulo em curso ($ARGUMENTS) segundo a secção 8 do `AGENTS.md` ("Definição de feito"). **Não faças commit nem push.** Mostra sempre o resultado real de cada verificação, nunca um resumo inventado.

## 1. Contexto

- `git branch --show-current`: o branch tem de ser `feat/a-*` ou `feat/b-*`. Deduz o grupo e o módulo; se o branch não seguir a convenção, assinala-o.
- Ficheiros alterados: `git diff --name-only grupo-<a|b>...HEAD` e `git status --short` (inclui o que ainda não está commitado).

## 2. Fronteiras

Compara a lista de ficheiros alterados com a tabela da secção 3 do `AGENTS.md`:
- ficheiros de **outro grupo** → ❌
- **ficheiros partilhados** → ❌, a menos que a alteração tenha sido aprovada nesta conversa (indica onde)
- `.env.local` ou outro `.env*` (exceto `.env.example`) → ❌

## 3. Camadas e convenções (pesquisa no código do módulo)

- Imports de `firebase/` ou de `config/firebase` fora de `src/services/` → ❌.
- Imports de `react` em `src/services/` → ❌.
- `react-router-dom` em qualquer ficheiro → ❌.
- `key={index}` / `key={i}` ou keys baseadas no índice do `map` → ❌.
- `new Date()` em payloads gravados no Firestore (em vez de `serverTimestamp()`) → ❌.
- Mutação de estado (`.push(`, `.splice(`, `.sort(` sobre arrays de estado) → ⚠️, para rever.
- Coleções e campos usados vs. `docs/modelo-dados.md`: lista os **campos novos** que não estão no modelo.

## 4. Lint e build

Executa `npm run lint` e depois `npm run build` (no Windows, se o PowerShell bloquear scripts: `npm.cmd run lint` / `npm.cmd run build`). Mostra o output. Se houver erros ou avisos nos ficheiros tocados, propõe as correções, mas **não as apliques sem aprovação**.

## 5. Relatório

Apresenta uma tabela com os itens da definição de feito (✅ / ❌ / ⚠️) e, depois:

### Guia de teste no browser
Passos curtos e concretos: abrir a rota; criar, editar e inativar/eliminar; provocar cada erro de validação; confirmar os documentos e campos na consola do Firestore; confirmar estados de carregamento, erro e lista vazia.

### Descrição do PR (pronta a colar)
- **Título:** `feat(<modulo>): …`
- **Resumo**
- **Ecrãs/RF/US cobertos**
- **Coleções e campos**, com destaque para os campos novos a validar com a equipa Android
- **Como testar** (versão curta do guia)
- **Checklist da definição de feito**
- **PR para:** `grupo-<a|b>`
