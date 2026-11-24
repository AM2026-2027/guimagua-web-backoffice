# B: Ecrã de Catálogo de Serviços (Services)

| Campo | Valor |
|---|---|
| Card Trello | #130 — [abrir no Trello](https://trello.com/c/hL50IH4U) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Implementar o CRUD do catálogo de serviços prestados pela Guimágua (manutenção periódica, reparação, análise de água, abertura/fecho de época) com preços base e duração estimada.

## Git & Fronteiras

- **Branch base:** `grupo-b`
- **Novo branch:** `feat/b-services`
- **PR destino:** `grupo-b`
- **Ficheiros autorizados:** `src/features/services-catalog/*` e `src/services/servicesCatalogService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Listagem de serviços com pesquisa, filtro por categoria e estado (`Ativo` / `Inativo`), e ordenação por nome ou preço.
- Formulário controlado para criar/editar serviço (nome, categoria, descrição, preço base em €, duração estimada em minutos e estado ativo).
- Formatação monetária em PT-PT (`Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })`) e conversão numérica segura antes de gravar no Firestore.

## Coleção Firestore (EN — validar com App Android)

- Coleção `services_catalog`: `name`, `category`, `description`, `base_price`, `estimated_duration_min`, `is_active`, `created_at`, `updated_at`.
