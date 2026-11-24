# Mapa de módulos do Backoffice Web

Para cada módulo: grupo, código, dados e documentação a ler antes de planear. Caminhos relativos a `docs/`.
Requisitos: `01-requisitos/lista-requisitos/README.md` · User stories: `01-requisitos/user-stories-mvp/README.md` · Modelo: `modelo-dados.md` · Validações: `02-arquitetura-e-dados/dicionario-dados/` · Decisões: `decisoes.md` · Design system: `03-design-system/`

| Módulo | Rota | Grupo | Branch | Pasta da feature | Serviço | Escreve em | Lê de |
|---|---|---|---|---|---|---|---|
| dashboard | `/dashboard` | A | `feat/a-dashboard` | `src/features/dashboard/` | `dashboardService.js` | `settings/alert_thresholds` (D-11) | `appointments`, `tickets`, `pool_readings`, `consumables`, `users`, `settings` |
| tickets | `/tickets` | A | `feat/a-tickets` | `src/features/tickets/` | `ticketsService.js` | `tickets` | `clients`, `pools` |
| agenda | `/agenda` | A | `feat/a-agenda` | `src/features/agenda/` | `agendaService.js` | `appointments` (e `consumables.projected_stock`, D-10) | `users`, `clients`, `pools`, `services`, `consumables`, `tickets` |
| reports | `/reports` | A | `feat/a-reports` | `src/features/reports/` | `reportsService.js` | — | `appointments`, `pool_readings`, `clients`, `pools`, `users` |
| clients | `/clients` | B | `feat/b-clients` | `src/features/clients/` | `clientsService.js` (inclui `pools`) | `clients`, `pools` | `appointments`, `pool_readings` (histórico da piscina) |
| team | `/team` | B | `feat/b-team` | `src/features/team/` | extensões em `userService.js` | `users` | — |
| services-catalog | `/services` | B | `feat/b-services` | `src/features/services-catalog/` | `servicesCatalogService.js` | `services` | `consumables` |
| inventory | `/inventory` | B | `feat/b-inventory` | `src/features/inventory/` | `inventoryService.js` | `consumables` | `appointments`, `services` (stock comprometido, D-10) |

As specs `implementacao/` de cada módulo são as dos cards do Trello: os nomes de coleções/campos lá indicados podem estar desatualizados, prevalece `modelo-dados.md`.

---

## dashboard (Grupo A)
- Ecrãs: `04-backoffice-web/dashboard/ecra-dashboard/`
- Spec: `04-backoffice-web/dashboard/implementacao/` (card #126)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/dashboard-e-calendario/`
- Requisitos: RF-WEB05 (dashboard e alertas), RNF-WEB01
- Decisões: D-11 (limiares editáveis neste módulo), D-12 (alerta = última leitura fora dos limiares)

## tickets (Grupo A)
- Ecrãs: `04-backoffice-web/tickets/lista-tickets/`, `04-backoffice-web/tickets/detalhe-ticket/`
- Spec: `04-backoffice-web/tickets/implementacao/` (card #124, **sem descrição**: o plano tem de propor o âmbito)
- Requisitos: RF-WEB06 (triagem: Pendente → Em Análise → Respondido) · US07
- Contexto (origem dos pedidos na app): `05-app-cliente/pedido-avaria-orcamento/`, `05-app-cliente/agendamento-manutencao/`
- Decisões: D-07 (estados `pending`/`in_analysis`/`responded`), D-09 (fotos no Storage: placeholder até à P-08)

## agenda (Grupo A)
- Ecrãs: `04-backoffice-web/agenda/calendario-geral/`, `04-backoffice-web/agenda/detalhe-do-dia/`, `04-backoffice-web/agenda/modal-novo-agendamento/`
- Spec: `04-backoffice-web/agenda/implementacao/` (card #125; usar `appointments`, não `agenda_events`)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/dashboard-e-calendario/`
- Requisitos: RF-WEB04 (agendamento e prevenção de conflitos) · US06
- Diagramas: `02-arquitetura-e-dados/diagramas-sequencia/agendamento/`, `02-arquitetura-e-dados/diagrama-estados-servico/`
- Decisões: D-07 (estados), D-10 (stock projetado e alerta de rutura)

## reports (Grupo A)
- Spec: `04-backoffice-web/relatorios/implementacao/` (card #127, **sem descrição** e sem protótipo: o plano tem de propor o âmbito)
- Requisitos: RF-WEB07 (auditoria e histórico), RF-WEB08 (geração de PDFs) · US10
- Contexto: `05-app-cliente/historico-e-faturacao/`
- Decisões: D-09 (PDF em `appointments/{id}/report.pdf`: bloqueado até à P-08; gerar PDF exige uma dependência nova, a justificar no plano)

## clients (Grupo B)
- Ecrãs: `04-backoffice-web/clientes-e-piscinas/lista-clientes/`, `.../modal-novo-cliente/`, `.../ficha-cliente/`, `.../detalhe-piscina/`
- Spec: `04-backoffice-web/clientes-e-piscinas/implementacao/` (card #128; as piscinas passam para a coleção `pools`)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/clientes-e-tecnicos/`
- Requisitos: RF-WEB01 · US01, US02
- Diagramas: `02-arquitetura-e-dados/diagramas-sequencia/gestao-clientes/`

## team (Grupo B)
- Ecrãs: `04-backoffice-web/equipa-tecnicos/lista-tecnicos/`, `.../modal-ficha-tecnico/`
- Spec: `04-backoffice-web/equipa-tecnicos/implementacao/` (card #129)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/clientes-e-tecnicos/`
- Requisitos: RF-WEB02 · US04
- Diagramas: `02-arquitetura-e-dados/diagramas-sequencia/registo-gestao-tecnicos/`
- Decisões: D-08 (criação de contas pelo admin: fluxo e alteração autorizada a `src/config/firebase.js`)

## services-catalog (Grupo B)
- Ecrãs: `04-backoffice-web/servicos/lista-servicos/`, `04-backoffice-web/servicos/editor-servico/`
- Spec: `04-backoffice-web/servicos/implementacao/` (card #130; usar `services`, não `services_catalog`)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/servicos-e-consumiveis/`
- Requisitos: RF-WEB03 · US05
- Decisões: D-07 (`type`: `maintenance`/`repair`/`commercial_survey`)

## inventory (Grupo B)
- Ecrãs: `04-backoffice-web/inventario/lista-inventario/`, `04-backoffice-web/inventario/modal-editor-artigo/`
- Spec: `04-backoffice-web/inventario/implementacao/` (card #131; usar `consumables`, não `inventory`)
- Protótipo inicial: `04-backoffice-web/00-prototipos-iniciais/servicos-e-consumiveis/`
- Requisitos: RF-WEB03 · US03, US09
- Diagramas: `02-arquitetura-e-dados/diagramas-sequencia/catalogo-consumiveis-precos/`
- Decisões: D-10 (físico, comprometido, projetado)

## Já implementado
- **Autenticação e RBAC** (cards #81, #107): `04-backoffice-web/autenticacao/`. Só serve de referência; os ficheiros são partilhados.
