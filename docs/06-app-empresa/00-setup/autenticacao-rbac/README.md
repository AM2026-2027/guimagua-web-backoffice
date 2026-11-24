# B: Autenticação Central e RBAC Dinâmico (App Guimágua)

| Campo | Valor |
|---|---|
| Card Trello | #110 — [abrir no Trello](https://trello.com/c/hMSh07zT) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | APP, Frontend, Backend |
| Responsáveis | Pedro Ponteira, Mxthias pa |
| Última atividade | 2026-11-22 |

## Descrição

- Implementar o ecrã de login unificado e a lógica de encaminhamento conforme o papel do funcionário.
- **Critérios de Aceitação:**
  - Implementar o formulário de Login.
  - Após sucesso no login, consultar a base de dados ou _Custom Claims_ para validar se o utilizador é `Técnico` ou `Comercial`.
  - Se for **Técnico**, injetar dinamicamente no ecrã principal a aba de navegação "Serviços do Dia".
  - Se for **Comercial**, injetar dinamicamente no ecrã principal a aba de navegação "Orçamentos/Vistorias".
