@AGENTS.md

# Específico do Claude Code

- **Comandos do projeto:**
  - `/novo-modulo <modulo>`: lê a documentação e o código, confirma o branch, apresenta o plano e pára.
  - `/fechar-modulo`: prova o trabalho (lint, build, fronteiras); faz commit, push e PR para o grupo; faz merge quando houver aprovação e CI verde (nos PR do product owner basta a CI verde, D-15). Pode ser corrido de novo para ver o estado do PR.
  - `/publicar grupo-a|grupo-b`: para o responsável do grupo. Faz o PR do grupo para a `main`, sincroniza os grupos e faz o deploy de produção (Firebase Hosting).
- **Pré-requisitos na máquina:**
  - GitHub CLI: `winget install GitHub.cli` e depois `gh auth login`.
  - Só para quem publica: `npx firebase-tools login` e, uma vez, `npx firebase-tools use --add`, que preenche o `.firebaserc`.
- Para planear, usa o modo de planeamento (Shift+Tab até "plan mode") ou pelo menos respeita a paragem obrigatória da secção 7 do `AGENTS.md`.
- **Protótipos:** os ecrãs Figma estão como PNG nas pastas de `docs/04-backoffice-web/<modulo>/<ecrã>/`. Abre as imagens com a ferramenta Read para as ver antes de propor a UI.
- Lê só a documentação do módulo em causa (via `docs/modulos.md`); não carregues a pasta `docs/` inteira.
- O sistema operativo da equipa é Windows: se `npm run …` falhar por política de execução do PowerShell, usa `npm.cmd run …`.
- Fora das skills, não faças `git commit`, `git push`, `gh pr merge`, deploy nem `npm install` sem aprovação explícita na conversa.
