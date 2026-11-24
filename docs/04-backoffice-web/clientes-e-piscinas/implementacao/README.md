# B: Entidades Base & Catálogos

| Campo | Valor |
|---|---|
| Card Trello | #128 — [abrir no Trello](https://trello.com/c/fSbyFhCr) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Implementar o CRUD completo de clientes e respetivos dados da piscina, servindo de base para pedidos e agendamentos.

## Git & Fronteiras

- **Branch base:** `grupo-b`
- **Novo branch:** `feat/b-clients`
- **PR destino:** `grupo-b`
- **Ficheiros autorizados:** `src/features/clients/*` e `src/services/clientsService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Tabela de clientes com pesquisa instantânea (nome, email, telefone ou NIF) e filtro por estado (`Ativo` / `Inativo`).
- Formulário controlado para criar e editar cliente + características da piscina (tipo de piscina, volume em m³, morada e notas técnicas).
- Validação explícita em JS (email válido, NIF com 9 dígitos opcional/obrigatório, volume numérico positivo).
- Opção para desativar/reativar cliente (`is_active`) ou eliminar com confirmação explícita.

## Coleção Firestore (EN — validar com App Android)

- Coleção `clients`: `name`, `email`, `phone`, `nif`, `address`, `pool_type`, `pool_volume_m3`, `notes`, `is_active`, `created_at`, `updated_at`.
