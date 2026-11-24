---
name: publicar
description: Promove o branch de um grupo (grupo-a ou grupo-b) para a main do Backoffice Web Guimágua, sincroniza os dois grupos com a main e faz o deploy de produção no Firebase Hosting.
argument-hint: "[grupo-a|grupo-b]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git branch --show-current) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git fetch *) Bash(npm run lint) Bash(npm run build) Bash(npm.cmd run lint) Bash(npm.cmd run build) Bash(gh auth status) Bash(gh pr view *) Bash(gh pr list *) Bash(gh pr checks *)
---

Vamos publicar o trabalho do **$ARGUMENTS** (fluxo D-06 em `docs/decisoes.md`). Esta skill é para o responsável do grupo.

Regras:
- Mostra sempre o output real.
- **Pede confirmação explícita antes de cada passo que muda alguma coisa** (criar ou fazer merge de PR, deploy).
- Nunca faças push direto para `main`/`grupo-*`, nunca uses `--admin`, `--force` nem `--delete-branch` nesta skill (os branches de grupo são permanentes).
- O deploy é **só de hosting** (`--only hosting`). As regras do Firestore e do Storage são partilhadas com a equipa Android (D-13) e nunca se publicam aqui.

## 0. Pré-requisitos

- O argumento tem de ser `grupo-a` ou `grupo-b`. Se faltar, pergunta.
- `gh auth status` tem de estar OK; se não, indica `winget install GitHub.cli` e `gh auth login`, e pára.
- `.firebaserc` não pode conter `SUBSTITUIR-PELO-ID-DO-PROJETO-FIREBASE`. Se contiver, indica `npx firebase-tools login` e `npx firebase-tools use --add`, e pára.
- O ficheiro `.env.local` tem de existir: confirma só que existe, **sem o ler**. O build de produção usa as variáveis `VITE_FIREBASE_*` dele.
- `git status --short` tem de estar limpo.

## 1. O que vai ser publicado

- `git fetch origin --prune`.
- `git log --oneline origin/main..origin/$ARGUMENTS`: se estiver vazio, não há nada para promover; salta para o passo 4, se o utilizador quiser só fazer deploy da `main` atual.
- Mostra a lista de commits/PR que vão entrar na `main`.

## 2. PR do grupo para a main

- `gh pr list --base main --head $ARGUMENTS --state open --json number,url`. Se não houver PR, cria-o (com confirmação): `gh pr create --base main --head $ARGUMENTS --title "release($ARGUMENTS): <resumo>" --body "<lista dos PR incluídos>"`.
- `gh pr checks <n>`: 0 = verde, 8 = a correr, outro = falhou.
- `gh pr view <n> --json author,reviews,mergeable,url`: tem de haver **pelo menos uma review `APPROVED` de alguém que não seja o autor**, de preferência alguém do outro grupo, porque passa a afetar todos. Exceção (D-15): se o autor do PR for o product owner (`ldcc9298-arch`), não é precisa aprovação.
- Se faltar CI ou aprovação: diz o que falta e termina.
- Com tudo verde, e após confirmação: `gh pr merge <n> --merge` (merge commit, para manter o histórico do grupo).

## 3. Sincronizar os dois grupos com a main

Para `grupo-a` e `grupo-b`:
- `git log --oneline origin/<grupo>..origin/main`: se houver commits, cria um PR `main` → `<grupo>` (`gh pr create --base <grupo> --head main --title "sync: main → <grupo>"`).
- Estes PR só trazem código já aprovado na `main`, por isso podem ser fundidos **sem nova revisão**, desde que a CI esteja verde e não haja conflitos: `gh pr merge <n> --merge`, com confirmação.
- Se houver conflitos, pára e explica: resolve-os o responsável desse grupo.

## 4. Deploy de produção (pede confirmação)

- `git checkout main` e `git pull`. Confirma que o `HEAD` é igual a `origin/main`.
- `npm run lint` e `npm run build` (ou `npm.cmd …`). Se algum falhar, pára.
- Mostra o projeto de destino (de `.firebaserc`) e o commit que vai ser publicado, e pede confirmação.
- `npx firebase-tools deploy --only hosting`.
- Mostra o URL publicado (`https://<projeto>.web.app`) e sugere um teste rápido: login com o admin, navegar pelos módulos, refrescar uma rota interna (ex.: `/clients`) para confirmar que não dá 404.

## 5. Resumo

Indica os PR fundidos, os grupos sincronizados, o commit publicado e o URL. Lembra os colegas de fazerem `git pull` no branch do seu grupo.
