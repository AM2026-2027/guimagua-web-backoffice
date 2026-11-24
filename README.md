# Guimágua Smart Pool — Backoffice Web

Backoffice de gestão interna da Guimágua (clientes e piscinas, equipa, serviços, inventário, agenda, pedidos e relatórios). Partilha o projeto Firebase (Auth + Cloud Firestore) com as apps Android (App Cliente e App Guimágua).

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Firebase JS SDK v13 · React Router v8 · Node 22

## Arranque

```bash
npm install
cp .env.example .env.local   # preencher as chaves VITE_FIREBASE_* (pedir ao responsável do projeto)
npm run dev
```

Outros comandos: `npm run lint`, `npm run build`, `npm run preview`. No Windows, se o PowerShell bloquear scripts, usa `npm.cmd run …`.

## Estrutura

```
src/
  config/      ligação ao Firebase
  constants/   roles e módulos (menu)
  services/    única camada que fala com o Firebase
  features/    um módulo por pasta (pages/, components/, hooks/, utils/)
  layout/      sidebar, header, footer
  shared/      componentes reutilizáveis
docs/          especificação completa (requisitos, protótipos, modelo de dados, decisões)
```

## Como trabalhamos

- Regras de engenharia e fronteiras entre grupos: [`AGENTS.md`](AGENTS.md). Valem para pessoas e para os agentes de IA.
- Fluxo Git: `feat/<a|b>-<modulo>` → PR para `grupo-<a|b>` → PR para `main`. Alterações partilhadas entram via `chore/*` direto para a `main`. Cada PR corre lint e build na CI.
- Documentação por módulo: [`docs/modulos.md`](docs/modulos.md) · modelo de dados: [`docs/modelo-dados.md`](docs/modelo-dados.md) · decisões: [`docs/decisoes.md`](docs/decisoes.md).

### Com o Claude Code

Na raiz do repositório, num branch `feat/<a|b>-<modulo>`:
1. `claude`
2. `/novo-modulo <modulo>`: lê a documentação e o código, propõe o plano e espera aprovação.
3. Implementar.
4. `/fechar-modulo`: lint, build, verificação de fronteiras, guia de teste e descrição do PR.

Com outros agentes: [`docs/prompts/arranque-modulo.md`](docs/prompts/arranque-modulo.md).
