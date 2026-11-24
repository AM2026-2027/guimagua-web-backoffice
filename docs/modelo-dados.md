# Modelo de dados oficial — Cloud Firestore

**Fonte de verdade** para coleções e campos, partilhada pelo Backoffice Web e pelas apps Android.
Coleções: `users`, `clients`, `pools`, `services`, `consumables`, `appointments`, `tickets`, `pool_readings` e `settings` (nova, D-11).
Base: diagrama de classes de domínio da app (`docs/02-arquitetura-e-dados/diagramas-classes-mobile/05-global/diagrama-01.puml`, card #112). Decisão D-02 em `docs/decisoes.md`.

Prevalece sobre:
- os nomes em português do modelo #30 e do dicionário de dados (`clientes`, `piscinas`, `utilizadores`…);
- os nomes das specs de implementação do backoffice (`agenda_events`, `services_catalog`, `inventory`, piscina dentro de `clients`).

As **regras de validação** (regex, intervalos, comprimentos) continuam a vir do dicionário de dados: `docs/02-arquitetura-e-dados/dicionario-dados/`.

Legenda da coluna Origem:
- **base**: campo do modelo Android, não renomear nem remover;
- **proposto**: campo pedido pelos ecrãs/specs do backoffice, ainda a validar com a equipa Android. Ao usá-lo, assinalar no plano e no PR.

- **alterado**: campo do modelo Android renomeado por uma decisão; comunicar à equipa Android.

Convenções:
- nomes em inglês `snake_case`;
- ids de documento gerados pelo Firestore, exceto em `users`, onde o id é o `uid` do Auth;
- `created_at`/`updated_at` com `serverTimestamp()`;
- **valores de enums em minúsculas `snake_case` (D-07)**;
- ficheiros no Firebase Storage referenciados por **caminho**, não por URL (D-09).

---

## `users/{uid}`: contas do sistema (admin, técnicos, comerciais, clientes)

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `email` | string | base | Igual ao do Firebase Auth |
| `name` | string | base | |
| `role` | enum | base | `admin`, `client`, `technician`, `commercial`. As contas de técnicos e comerciais são criadas pelo admin no módulo `team` (D-08) |
| `specialties` | string[] | base | Aptidões/especialidades (ids de `services` ou tipologias) |
| `fcm_token` | string? | base | Gerido pelas apps; o backoffice não altera |
| `is_active` | boolean | base | Soft delete |
| `phone` | string | proposto | Telemóvel PT (regex do dicionário, secção Técnicos) |
| `vehicle_plate` | string? | proposto | Matrícula da viatura atribuída (`AA-00-AA`) |
| `created_at`, `updated_at` | timestamp | proposto | |

## `clients`: clientes (proprietários)

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `user_id` | string? | base | `uid` da conta da App Cliente; `null` se criado no backoffice sem conta |
| `name` | string | base | 3–100 caracteres |
| `email` | string | base | Único (validar no serviço antes de gravar) |
| `phone` | string | base | `+351` opcional + 9 dígitos (móvel ou fixo) |
| `address` | string | base | Morada de faturação |
| `is_active` | boolean | base | Soft delete |
| `nif` | string? | proposto | Exatamente 9 dígitos |
| `notes` | string? | proposto | |
| `created_at`, `updated_at` | timestamp | proposto | |

## `pools`: piscinas (um cliente pode ter várias, RF-WEB01)

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `client_id` | string | base | Ref. a `clients` |
| `local_address` | string | base | ≥ 10 caracteres |
| `dimensions` | string | base | Formato `LxP` (ex.: `12x5`, `10.5x4`) |
| `volume_m3` | number | base | > 0 |
| `treatment_type` | string | base | Ex.: cloro, sal |
| `equipment` | string[] | base | Equipamentos instalados |
| `name` | string | proposto | Rótulo para o seletor de piscinas da app (ex.: "Piscina Exterior") |
| `is_active` | boolean | proposto | |
| `notes` | string? | proposto | Notas técnicas |
| `created_at`, `updated_at` | timestamp | proposto | |

## `services`: catálogo de tipos de serviço

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `name` | string | base | |
| `type` | enum | base | `maintenance` (manutenção), `repair` (reparação), `commercial_survey` (vistoria comercial) |
| `default_duration_min` | number | base | Usar em vez de `estimated_duration_min` da spec antiga |
| `checklist_template` | string[] | base | Ordem = ordem da checklist |
| `is_active` | boolean | base | |
| `description` | string? | proposto | |
| `base_price` | number | proposto | Euros; formatar com `Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })` |
| `base_consumables` | `{ consumable_id, quantity }[]` | proposto | "Produtos obrigatórios" do editor de serviço; relação Service–Consumable do diagrama |
| `created_at`, `updated_at` | timestamp | proposto | |

## `consumables`: consumíveis, materiais e stock

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `name` | string | base | |
| `unit` | string | base | L, kg, un… |
| `stock_quantity` | number | base | Stock físico |
| `projected_stock` | number | base | Stock projetado = físico − comprometido. Atualizado pelo serviço da agenda (D-10) |
| `is_active` | boolean | base | Inativação segura (nunca apagar) |
| `description` | string? | proposto | |
| `unit_price` | number | proposto | Euros |
| `min_stock` | number | proposto | Limiar de rutura |
| `sku`, `category`, `supplier` | string? | proposto | |
| `created_at`, `updated_at` | timestamp | proposto | |

## `appointments`: agendamentos e intervenções (a agenda usa esta coleção, não `agenda_events`)

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `pool_id` | string | base | |
| `tech_id` | string | base | `uid` do técnico ou comercial |
| `service_id` | string | base | |
| `date` | timestamp | base | Início previsto (apresentar em `Europe/Lisbon`) |
| `checkin_timestamp` | timestamp? | base | Preenchido pela app |
| `status` | enum | base | `scheduled` (agendado), `in_progress` (em curso), `completed` (concluído), `cancelled` (cancelado) |
| `checklist_results` | map<string, boolean> | base | Preenchido pela app |
| `notes` | string | base | |
| `anomaly_reported` | boolean | base | |
| `photo_paths` | string[] | alterado (era `photo_drive_ids`, D-09) | Caminhos no Storage: `appointments/{id}/photos/…` ou `…/survey/…` |
| `report_pdf_path` | string? | alterado (era `report_pdf_drive_link`, D-09) | `appointments/{id}/report.pdf`, gerado pelo backoffice (RF-WEB08) |
| `consumables_used` | `{ consumable_id, quantity_used }[]` | proposto | `ConsumableUsage` embebido no diagrama, sem nome de campo definido |
| `end_date` | timestamp? | proposto | Fim previsto; alternativa: `date + services.default_duration_min` |
| `client_id` | string | proposto | Desnormalizado para filtros sem leituras extra |
| `ticket_id` | string? | proposto | Quando o agendamento nasce de um pedido |
| `client_name`, `tech_name` | string | proposto | Desnormalização opcional para poupar leituras (quotas gratuitas) |
| `created_at`, `updated_at` | timestamp | proposto | |

Ciclo de vida: `docs/02-arquitetura-e-dados/diagrama-estados-servico/`. Regras do agendamento (RF-WEB04): bloquear sobreposição de horário para o mesmo colaborador e alertar para rutura de stock projetado.

## `tickets`: pedidos de assistência e orçamento (criados na App Cliente)

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `client_id` | string | base | |
| `pool_id` | string | base | |
| `category` | string | base | Minúsculas `snake_case`. Valores a fechar com a App Cliente no plano do módulo `tickets` (ex.: `breakdown`, `quote`, `maintenance`) |
| `description` | string | base | |
| `status` | enum | base | `pending` (pendente), `in_analysis` (em análise), `responded` (respondido) |
| `priority` | string | base | Minúsculas `snake_case` (ex.: `low`, `normal`, `high`) |
| `photo_paths` | string[] | alterado (era `photo_drive_ids`, D-09) | Fotos do cliente: `tickets/{id}/…` |
| `created_at` | timestamp | base | |
| `response_message` | string? | proposto | Resposta do gestor |
| `responded_at`, `updated_at` | timestamp? | proposto | |
| `appointment_id` | string? | proposto | Visita marcada a partir do pedido |

## `pool_readings`: leituras físico-químicas

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `appointment_id` | string | base | |
| `pool_id` | string | base | |
| `ph_level` | number | base | Válido 6.8–8.2; alerta fora dos limiares de `settings/alert_thresholds` (D-11, D-12) |
| `chlorine_ppm` | number | base | Válido 0.5–3.0 |
| `temperature_c` | number | base | Válido 0–45 |
| `salinity_gl` | number? | base | |
| `timestamp` | timestamp | base | |

## `settings/alert_thresholds`: limiares de alerta (coleção nova, D-11)

Documento único, editado pelo admin no módulo `dashboard`. Comunicar à equipa Android (a App Cliente usa os mesmos limiares nos alertas).

| Campo | Tipo | Origem | Notas |
|---|---|---|---|
| `ph_min`, `ph_max` | number | novo (D-11) | Valores iniciais 7.2 e 7.6 (RF-WEB05) |
| `chlorine_min_ppm`, `chlorine_max_ppm` | number | novo (D-11) | Têm de estar dentro do intervalo válido 0.5–3.0 |
| `temperature_min_c`, `temperature_max_c` | number | novo (D-11) | Têm de estar dentro do intervalo válido 0–45 |
| `updated_at` | timestamp | novo (D-11) | |
| `updated_by` | string | novo (D-11) | `uid` do admin |

## Ficheiros (Firebase Storage, D-09)

Caminhos: `tickets/{ticketId}/…`, `appointments/{appointmentId}/photos/…`, `appointments/{appointmentId}/survey/…`, `appointments/{appointmentId}/report.pdf`. Exige o plano Blaze (ativo, D-14).

## Relações

- Um `client` tem várias `pools`; uma `pool` tem vários `appointments` e vários `tickets`.
- Um `appointment` tem um `service` e um técnico (`users`); regista várias `pool_readings` e vários `consumables_used`.
- Um `service` prevê `base_consumables`.
- Um `user` com role `client` pode estar ligado a um `client` (`clients.user_id`).
