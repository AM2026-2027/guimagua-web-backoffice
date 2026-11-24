# A: Ecrã de Dashboard (Visão Geral)

| Campo | Valor |
|---|---|
| Card Trello | #126 — [abrir no Trello](https://trello.com/c/Leddywto) |
| Lista / Sprint | Sprint Backlog A |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Construir o painel principal de entrada do Backoffice com indicadores operacionais (KPIs), atividade recente e alertas críticos em tempo real ou por carregamento assíncrono otimizado.

## Git & Fronteiras

- **Branch base:** `grupo-a`
- **Novo branch:** `feat/a-dashboard`
- **PR destino:** `grupo-a`
- **Ficheiros autorizados:** `src/features/dashboard/*` e `src/services/dashboardService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Cartões de KPI no topo: pedidos abertos, intervenções agendadas para hoje, clientes ativos e artigos com stock abaixo do mínimo.
- Lista de últimos pedidos recebidos com badge de estado e atalho `<Link>` para `/tickets`.
- Secção de alertas rápidos (ex.: stock crítico com atalho para `/inventory` e próximas intervenções com atalho para `/agenda`).
- Gestão de estados de carregamento (`LoadingSpinner`), erro (`ErrorAlert`) e estado vazio quando ainda não existam registos nas coleções.

## Fontes de Dados Firestore (Leitura)

- Leitura agregada/resumida das coleções `tickets`, `agenda_events`, `clients` e `inventory` (evitar leituras em ciclo infinito; respeitar limites do plano Spark).
