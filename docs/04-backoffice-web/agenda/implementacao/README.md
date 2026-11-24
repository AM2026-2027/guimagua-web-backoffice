# A: Ecrã de Agenda (Planeamento & Rotas)

| Campo | Valor |
|---|---|
| Card Trello | #125 — [abrir no Trello](https://trello.com/c/vsPvzYVa) |
| Lista / Sprint | Sprint Backlog A |
| Etiquetas | Frontend |
| Responsáveis | — |
| Última atividade | 2026-11-24 |

## Descrição

## Objetivo

Implementar o ecrã de agendamento e distribuição de intervenções pelos técnicos de campo, com vista diária/semanal ou lista cronológica.

## Git & Fronteiras

- **Branch base:** `grupo-a`
- **Novo branch:** `feat/a-agenda`
- **PR destino:** `grupo-a`
- **Ficheiros autorizados:** `src/features/agenda/*` e `src/services/agendaService.js`
- **Proibido alterar:** `src/App.jsx`, `src/layout/*`, `src/shared/*`, `src/features/auth/*`, `package.json`

## Requisitos Funcionais (UI em PT-PT)

- Listagem/vista de intervenções agendadas filtráveis por data, técnico (`role: "technician"`) e estado (`Agendado`, `Em Curso`, `Concluído`, `Cancelado`).
- Formulário controlado para agendar/reagendar uma intervenção (associar pedido/cliente, técnico, data, hora início/fim e observações).
- Validação de datas/horas em fuso `Europe/Lisbon` (impedir hora de fim anterior à hora de início).
- Destaque visual claro para intervenções do dia atual.

## Coleção Firestore (EN — validar com App Android)

- Coleção `agenda_events` (ou agendamentos ligados a `tickets`): `ticket_id`, `client_id`, `client_name`, `technician_id`, `technician_name`, `scheduled_date`, `start_time`, `end_time`, `status`, `notes`, `created_at`, `updated_at`.
