# Configuração inicial do repositório e Firebase

| Campo | Valor |
|---|---|
| Card Trello | #120 — [abrir no Trello](https://trello.com/c/FOS7Pwrr) |
| Lista / Sprint | 17.11.2026 Sprint 4 WEB |
| Etiquetas | Backend, Setup / DevOps |
| Responsáveis | Leandro Castro |
| Última atividade | 2026-11-20 |

> Existem outras versões deste ecrã/tarefa em [`outras-versoes/`](outras-versoes/):

> - [#104 — Setup do Firebase e Regras de Segurança (17.11.2026 Sprint 4 WEB)](outras-versoes/card-104-setup-do-firebase-e-regras-de-seguranca/README.md)
> - [#105 — Setup do Repositório Git (17.11.2026 Sprint 4 WEB)](outras-versoes/card-105-setup-do-repositorio-git/README.md)
> - [#54 — Criação e Configuração do Repositório Git (27.10.2026 Sprint 3 WEB)](outras-versoes/card-54-criacao-e-configuracao-do-repositorio-git/README.md)

## Descrição

Configuração inicial da infraestrutura do projeto, incluindo a criação dos repositórios Git e a preparação do Firebase com regras de segurança.

Inclui:
- Criação dos repositórios para o Web Backoffice (React) e para as APPs, ou definição de um monorepo conforme a preferência.
- Configuração da proteção da _branch_ `main`, bloqueando _commits_ diretos e exigindo _Pull Requests_.
- Inicialização do projeto no Firebase com Authentication, Cloud Firestore e Storage.
- Criação das 8 coleções vazias definidas no Dicionário de Dados.
- Aplicação do ficheiro `firestore.rules` com as regras de segurança RBAC.
- Criação manual de 3 utilizadores de teste no Auth (1 Cliente, 1 Técnico, 1 Comercial) e atribuição dos respetivos _Custom Claims_ ou documento equivalente na coleção `utilizadores` para definir o papel de cada um.

---

- **Setup do Repositório Git**
- Criar os repositórios para alojar o código e definir regras de contribuição.
- **Critérios de Aceitação:**
  - Criar um repositório para o Web Backoffice (React) e repositórios para as APPs (ou um monorepo, dependendo da preferência).
  - Configurar proteção da _branch_ `main` (bloquear _commits_ diretos, obrigar a _Pull Requests_).

- **Setup do Firebase e Regras de Segurança**
- Inicializar o projeto no Firebase, ativando Authentication, Cloud Firestore e Storage.
- **Critérios de Aceitação:**
  - Criar as 8 coleções vazias definidas no Dicionário de Dados.
  - Aplicar o ficheiro `firestore.rules` com as regras de segurança RBAC.
  - Criar manualmente 3 utilizadores de teste no Auth (1 Cliente, 1 Técnico, 1 Comercial) e adicionar-lhes os respetivos _Custom Claims_ ou um documento correspondente na coleção `utilizadores` para definir o seu papel.
