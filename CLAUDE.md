@AGENTS.md

# Específico do Claude Code

- **Comandos do projeto:**
  - `/novo-modulo <modulo>`: arranca um módulo (lê a documentação e o código, confirma o branch, apresenta o plano e pára).
  - `/fechar-modulo`: prova o trabalho (lint, build, verificação de fronteiras) e prepara o guia de teste e a descrição do PR.
- Para planear, usa o modo de planeamento (Shift+Tab até "plan mode") ou pelo menos respeita a paragem obrigatória da secção 7 do `AGENTS.md`.
- **Protótipos:** os ecrãs Figma estão como PNG nas pastas de `docs/04-backoffice-web/<modulo>/<ecrã>/`. Abre as imagens com a ferramenta Read para as ver antes de propor a UI.
- Lê só a documentação do módulo em causa (via `docs/modulos.md`); não carregues a pasta `docs/` inteira.
- O sistema operativo da equipa é Windows: se `npm run …` falhar por política de execução do PowerShell, usa `npm.cmd run …`.
- Não faças `git commit`, `git push` nem `npm install` sem aprovação explícita na conversa.
