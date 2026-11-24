# B: Ecrã de Equipa & Utilizadores (Team)

| Campo | Valor |
|---|---|
| Card Trello | #129 — [abrir no Trello](https://trello.com/c/AJj16eyu) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Implementar a gestão de membros da equipa e permissões (RBAC), permitindo consultar utilizadores, alterar perfis (`role`) e ativar/desativar contas.

## Git & Fronteiras

- **Branch base:** `grupo-b`
- **Novo branch:** `feat/b-team`
- **PR destino:** `grupo-b`
- **Ficheiros autorizados:** `src/features/team/*` e extensões em `src/services/userService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Listagem de utilizadores com pesquisa por nome/email e filtro por role (`admin`, `technician`, `commercial`, `client` — usar constantes de `src/constants/roles.js`).
- Edição de dados do perfil (`name`, `role`, `is_active`, `phone`) diretamente em modal ou painel lateral.
- **Regra de segurança obrigatória:** impedir que o administrador autenticado (`useAuth().user.uid`) altere o próprio `role` ou desative a própria conta.
- Indicação clara de que a criação de credenciais de login ocorre no Firebase Authentication (ou fluxo alinhado com o backend do grupo).

## Coleção Firestore (EN — já definida)

- Coleção `users/{uid}`: `name`, `email`, `role`, `is_active`, `phone`, `updated_at`.
