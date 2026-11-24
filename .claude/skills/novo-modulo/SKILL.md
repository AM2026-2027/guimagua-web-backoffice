---
name: novo-modulo
description: Arranca a implementação de um módulo do Backoffice Web Guimágua (lê documentação e código, confirma o branch, propõe o plano e pára para aprovação).
argument-hint: "[modulo: dashboard|tickets|agenda|reports|clients|team|services-catalog|inventory] [notas opcionais]"
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash(git branch --show-current) Bash(git status *) Bash(git log *) Bash(git fetch *)
---

Vamos começar a implementação de um módulo do Backoffice Web Guimágua.

Pedido: $ARGUMENTS

Segue as regras de `AGENTS.md`, sobretudo as secções 3 (fronteiras), 4 (modelo de dados), 6 (camadas) e 7 (modo de trabalho). **Nesta fase não cries nem edites ficheiros.**

## 1. Identificar o módulo e o grupo

- O primeiro argumento é o módulo. Aceita também os nomes em português: clientes → `clients`, equipa/técnicos → `team`, serviços → `services-catalog`, inventário/stock → `inventory`, pedidos → `tickets`, relatórios → `reports`.
- Com base na tabela de `docs/modulos.md`, determina o grupo (A/B), a pasta da feature, o serviço autorizado, as coleções e a documentação.
- Se o módulo estiver em falta ou for ambíguo, pergunta e pára.

## 2. Ler a documentação do módulo (só a deste módulo)

Lê, pela ordem indicada em `docs/modulos.md`:
1. O `README.md` de cada ecrã do módulo em `docs/04-backoffice-web/<pasta-docs>/`, **abrindo as imagens PNG** dos protótipos, e as `outras-versoes/` quando existirem.
2. `docs/04-backoffice-web/<pasta-docs>/implementacao/README.md` (spec técnica do grupo). Os nomes de coleções desta spec podem estar desatualizados: prevalece `docs/modelo-dados.md`.
3. Os requisitos RF/RNF e as user stories indicados para o módulo (`docs/01-requisitos/`).
4. `docs/modelo-dados.md`, as regras de validação do dicionário de dados e `docs/decisoes.md`.
5. Os diagramas de sequência ou de estados indicados para o módulo, se existirem.

## 3. Inspecionar o código

- `src/App.jsx`, `src/constants/`, `src/shared/components/`, `src/layout/`.
- `src/features/<pasta-da-feature>/` e o serviço do módulo, se já existirem.
- Serviços existentes que o módulo vai reutilizar (ex.: `userService.js`).

## 4. Confirmar o branch

Executa `git branch --show-current`, `git status --short`, `git fetch origin` e `git log --oneline grupo-<a|b>..origin/main`.
- Se estiveres em `main`, `grupo-a` ou `grupo-b`, ou num branch que não seja `feat/<a|b>-<modulo>…`, avisa e indica os comandos exatos, sem os executar:
  ```
  git checkout grupo-<a|b>
  git pull
  git checkout -b feat/<a|b>-<modulo>
  ```
- Se o último comando listar commits, o branch do grupo está **atrasado em relação à `main`**: avisa que o responsável do grupo tem de sincronizar (PR `main` → `grupo-<a|b>`) antes de se começar.
- Se houver alterações por commitar, avisa antes de qualquer mudança de branch.

## 5. Apresentar o plano

Responde com estas secções, de forma curta:

1. **Resumo do módulo**: o que o utilizador final (admin) consegue fazer, com referência aos ecrãs/protótipos e aos RF/US.
2. **Ficheiros por camada**: `services/`, `hooks/`, `utils/`, `components/`, `pages/`. Para cada ficheiro: criar ou alterar, e a responsabilidade numa linha.
3. **Dados**: coleções lidas e escritas; campos usados (existentes no modelo vs. **campo novo — validar com a equipa Android**); validações (regex e intervalos do dicionário de dados); valores de enums e respetivos rótulos PT-PT.
4. **Estratégia de leitura no Firestore (plano Spark)**: queries, `onSnapshot` vs. `getDocs`, paginação, e uma estimativa das leituras por abertura do ecrã.
5. **Discrepâncias encontradas** entre protótipo, spec do card, requisitos e modelo de dados, com a resolução proposta.
6. **Dúvidas** sobre regras de negócio, cada uma com a tua sugestão.
7. **Ficheiros partilhados**: se for preciso alterar algum, qual e porquê. Se não for, diz explicitamente "nenhum".

## 6. Parar

Termina com: "Aguardo aprovação do plano antes de criar ou editar ficheiros." Não avances sem uma resposta explícita.
