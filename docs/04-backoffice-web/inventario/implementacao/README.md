# B: Ecrã de Inventário & Stock (Inventory)

| Campo | Valor |
|---|---|
| Card Trello | #131 — [abrir no Trello](https://trello.com/c/CeUKpEfF) |
| Lista / Sprint | Sprint Backlog B |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Implementar o controlo de inventário de químicos, peças e equipamentos, com gestão de entradas/saídas e alertas automáticos de stock mínimo.

## Git & Fronteiras

- **Branch base:** `grupo-b`
- **Novo branch:** `feat/b-inventory`
- **PR destino:** `grupo-b`
- **Ficheiros autorizados:** `src/features/inventory/*` e `src/services/inventoryService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Tabela de artigos com pesquisa (nome ou SKU), filtro por categoria e filtro rápido **"Apenas stock baixo"** (`quantity <= min_stock`).
- Badge de estado visual derivado (`Em Stock`, `Stock Baixo`, `Esgotado`).
- Formulário controlado para criar/editar artigo (nome, SKU, categoria, unidade, quantidade atual, stock mínimo, preço unitário e fornecedor).
- Ações rápidas de ajuste de stock (`+` / `-`) com validação para nunca permitir quantidades negativas.

## Coleção Firestore (EN — validar com App Android)

- Coleção `inventory`: `name`, `sku`, `category`, `unit`, `quantity`, `min_stock`, `unit_price`, `supplier`, `updated_at`.
