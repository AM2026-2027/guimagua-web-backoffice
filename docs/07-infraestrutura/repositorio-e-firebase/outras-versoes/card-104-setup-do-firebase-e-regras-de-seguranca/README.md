# Setup do Firebase e Regras de Segurança

| Campo | Valor |
|---|---|
| Card Trello | #104 — [abrir no Trello](https://trello.com/c/Rcpcc2zt) |
| Lista / Sprint | 17.11.2026 Sprint 4 WEB |
| Etiquetas | Backend, Setup / DevOps |
| Responsáveis | Leandro Castro |
| Última atividade | 2026-11-20 |

## Descrição

- Inicializar o projeto no Firebase, ativando Authentication, Cloud Firestore e Storage.
- **Critérios de Aceitação:**
  - Criar as 8 coleções vazias definidas no Dicionário de Dados.
  - Aplicar o ficheiro `firestore.rules` com as regras de segurança RBAC.
  - Criar manualmente 3 utilizadores de teste no Auth (1 Cliente, 1 Técnico, 1 Comercial) e adicionar-lhes os respetivos _Custom Claims_ ou um documento correspondente na coleção `utilizadores` para definir o seu papel.
