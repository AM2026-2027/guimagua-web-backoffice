# Documentação — Ecossistema Guimágua Smart Pool

Documentação de especificação organizada a partir do quadro Trello **Projeto Guimágua** (exportado a 24/11/2026).
Cada card do Trello deu origem a uma pasta com um `README.md` (descrição, checklists, comentários, links) e os respetivos anexos.
PDFs e DOCX foram convertidos para `.md` (os originais ficam ao lado). Código PlantUML encontrado nos comentários foi guardado em ficheiros `.puml`.

## O sistema

| Componente | Descrição | Stack |
|---|---|---|
| Backoffice Web | Gestão e administração (clientes, piscinas, técnicos, serviços, inventário, agenda, tickets, relatórios). **É a única componente web** — o portal web do cliente foi abandonado. | React + Vite + Tailwind CSS |
| App Cliente | App do cliente final: telemetria da piscina, alertas, pedidos de assistência/orçamento, agendamentos, histórico, compras. | Android nativo (Kotlin) |
| App Guimágua (empresa) | App da equipa interna com login único e perfis **Técnico** (rota, check-in, leituras, consumíveis, evidências) e **Comercial** (vistorias e levantamentos para orçamento). | Android nativo (Kotlin) |
| Backend | Firebase: Auth com Custom Claims (RBAC), Cloud Firestore (com persistência offline nas apps), `firestore.rules`, Cloud Messaging; ficheiros (fotos, PDFs) via Google Drive com Service Account. | Firebase / GCP |

Organização da equipa: dois grupos (**A** e **B**), com branches `grupo-a` / `grupo-b`, branches de funcionalidade `feat/<a|b>-<modulo>` e PR para o branch do grupo; `main` protegida. Repositório web: `AM2026-2027/guimagua-web-backoffice` (GitHub).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [00-projeto](00-projeto/README.md) | Convenções da equipa no Trello, template de prompt para a IA e processo de gestão. |
| [01-requisitos](01-requisitos/README.md) | Requisitos funcionais e não funcionais, user stories do MVP, especificação formal e matriz de rastreabilidade. |
| [02-arquitetura-e-dados](02-arquitetura-e-dados/README.md) | Arquitetura C4, modelo de dados Firestore, dicionário de dados com regras de validação e diagramas UML (sequência, estados, classes). |
| [03-design-system](03-design-system/README.md) | Cores, tipografia, componentes base e layout global (Figma). |
| [04-backoffice-web](04-backoffice-web/README.md) | Um módulo por pasta; dentro, uma pasta por ecrã e `implementacao/` com a spec técnica. |
| [05-app-cliente](05-app-cliente/README.md) | Uma pasta por ecrã + `00-setup/`. |
| [06-app-empresa](06-app-empresa/README.md) | `00-setup/` (projeto, login/RBAC, câmara/GPS) + ecrãs do perfil Técnico. |
| [07-infraestrutura](07-infraestrutura/README.md) | Repositórios Git, proteção de branches e setup do Firebase (Auth, Firestore, regras de segurança). |
| [_fora-de-ambito](_fora-de-ambito/README.md) | Portal web do cliente (abandonado) — **não implementar**. |

Convenções:
- Quando o mesmo ecrã aparece em vários cards, a versão principal fica na pasta do ecrã e as restantes em `outras-versoes/`.
- Cards arquivados no Trello e cards de exemplo do template foram descartados.

## Documentos de referência para implementação

- [modulos.md](modulos.md): mapa módulo → grupo, código, dados e documentação a ler
- [modelo-dados.md](modelo-dados.md): coleções e campos oficiais (alinhados com a App Android); prevalecem sobre os nomes que aparecem nos cards
- [decisoes.md](decisoes.md): decisões tomadas e pendentes (enums, contas de técnicos, fotos/PDFs, stock, limiares, telemetria)
- [prompts/arranque-modulo.md](prompts/arranque-modulo.md): prompt de arranque para agentes sem o comando `/novo-modulo`

Notas sobre a origem destes documentos:
- O export do Trello só traz as últimas 1000 ações (de 20/10/2026 em diante), por isso podem faltar comentários anteriores, sobretudo do Sprint 1.
- Os ficheiros `.puml` foram extraídos dos comentários do Trello e corrigidos à mão (o Trello estragou `*` e `+`); se algum diagrama não renderizar, comparar com a imagem do card.

## Mapa card → pasta

| Card | Título | Pasta |
|---|---|---|
| #4 | Lista de requisitos | [01-requisitos/lista-requisitos](01-requisitos/lista-requisitos/README.md) |
| #14 | Escrita das User Stories do MVP | [01-requisitos/user-stories-mvp](01-requisitos/user-stories-mvp/README.md) |
| #15 | Gestão de Impedimentos | [00-projeto/gestao-impedimentos](00-projeto/gestao-impedimentos/README.md) |
| #17 | Diagrama de Sequência: Gestão de Clientes | [02-arquitetura-e-dados/diagramas-sequencia/gestao-clientes](02-arquitetura-e-dados/diagramas-sequencia/gestao-clientes/README.md) |
| #18 | Diagrama de Sequência: Autenticação | [02-arquitetura-e-dados/diagramas-sequencia/autenticacao](02-arquitetura-e-dados/diagramas-sequencia/autenticacao/README.md) |
| #19 | Design System e Layout Base (Figma) | [03-design-system/design-system-layout-base](03-design-system/design-system-layout-base/README.md) |
| #20 | Prototipagem: Clientes e Técnicos (Figma) | [04-backoffice-web/00-prototipos-iniciais/clientes-e-tecnicos](04-backoffice-web/00-prototipos-iniciais/clientes-e-tecnicos/README.md) |
| #23 | Diagrama de Sequência: Agendamento | [02-arquitetura-e-dados/diagramas-sequencia/agendamento](02-arquitetura-e-dados/diagramas-sequencia/agendamento/README.md) |
| #24 | Diagrama de Estados: Ciclo do Serviço | [02-arquitetura-e-dados/diagrama-estados-servico](02-arquitetura-e-dados/diagrama-estados-servico/README.md) |
| #25 | Prototipagem: Serviços e Consumíveis (Figma) | [04-backoffice-web/00-prototipos-iniciais/servicos-e-consumiveis](04-backoffice-web/00-prototipos-iniciais/servicos-e-consumiveis/README.md) |
| #26 | Prototipagem: Dashboard e Calendário (Figma) | [04-backoffice-web/00-prototipos-iniciais/dashboard-e-calendario](04-backoffice-web/00-prototipos-iniciais/dashboard-e-calendario/README.md) |
| #30 | Modelo Relacional Base de Dados | [02-arquitetura-e-dados/modelo-dados](02-arquitetura-e-dados/modelo-dados/README.md) |
| #31 | Diagrama arquitetura C4 | [02-arquitetura-e-dados/arquitetura-c4](02-arquitetura-e-dados/arquitetura-c4/README.md) |
| #32 | Diagrama de Sequência: Catálogo de Consumíveis e Preços | [02-arquitetura-e-dados/diagramas-sequencia/catalogo-consumiveis-precos](02-arquitetura-e-dados/diagramas-sequencia/catalogo-consumiveis-precos/README.md) |
| #33 | Diagrama de Sequência: Registo e Gestão de Técnicos | [02-arquitetura-e-dados/diagramas-sequencia/registo-gestao-tecnicos](02-arquitetura-e-dados/diagramas-sequencia/registo-gestao-tecnicos/README.md) |
| #34 | Diagrama de Sequência: Registo de Intervenção e Leituras pelo Técnico | [02-arquitetura-e-dados/diagramas-sequencia/registo-intervencao-leituras](02-arquitetura-e-dados/diagramas-sequencia/registo-intervencao-leituras/README.md) |
| #35 | Elaborar Matriz de Rastreabilidade de Engenharia de Software | [01-requisitos/matriz-rastreabilidade](01-requisitos/matriz-rastreabilidade/README.md) |
| #36 | Dicionário de Dados e Regras Formais de Validação | [02-arquitetura-e-dados/dicionario-dados](02-arquitetura-e-dados/dicionario-dados/README.md) |
| #46 | Landing Page Institucional e Catálogo Público | [_fora-de-ambito/portal-cliente-web/landing-page-catalogo-publico](_fora-de-ambito/portal-cliente-web/landing-page-catalogo-publico/README.md) |
| #47 | Ecrã de Autenticação e Registo (Login) | [_fora-de-ambito/portal-cliente-web/login-e-registo-cliente](_fora-de-ambito/portal-cliente-web/login-e-registo-cliente/README.md) |
| #48 | Painel do Cliente — "A Minha Piscina" e Telemetria | [_fora-de-ambito/portal-cliente-web/painel-a-minha-piscina](_fora-de-ambito/portal-cliente-web/painel-a-minha-piscina/README.md) |
| #49 | Área de Ações Rápidas, Pedidos de Orçamento e Visitas | [_fora-de-ambito/portal-cliente-web/acoes-rapidas-orcamentos-visitas](_fora-de-ambito/portal-cliente-web/acoes-rapidas-orcamentos-visitas/README.md) |
| #54 | Criação e Configuração do Repositório Git | [07-infraestrutura/repositorio-e-firebase/outras-versoes/card-54-criacao-e-configuracao-do-repositorio-git](07-infraestrutura/repositorio-e-firebase/outras-versoes/card-54-criacao-e-configuracao-do-repositorio-git/README.md) |
| #62 | Ecrã de Autenticação | [04-backoffice-web/autenticacao/login-e-recuperacao/outras-versoes/card-62-ecra-de-autenticacao](04-backoffice-web/autenticacao/login-e-recuperacao/outras-versoes/card-62-ecra-de-autenticacao/README.md) |
| #63 | Ecrã Dashboard | [04-backoffice-web/dashboard/ecra-dashboard](04-backoffice-web/dashboard/ecra-dashboard/README.md) |
| #64 | Ecrã Lista de Clientes | [04-backoffice-web/clientes-e-piscinas/lista-clientes](04-backoffice-web/clientes-e-piscinas/lista-clientes/README.md) |
| #65 | Modal Novo Cliente | [04-backoffice-web/clientes-e-piscinas/modal-novo-cliente](04-backoffice-web/clientes-e-piscinas/modal-novo-cliente/README.md) |
| #66 | Ecrã Ficha do Cliente | [04-backoffice-web/clientes-e-piscinas/ficha-cliente](04-backoffice-web/clientes-e-piscinas/ficha-cliente/README.md) |
| #67 | Ecrã Detalhe da Piscina | [04-backoffice-web/clientes-e-piscinas/detalhe-piscina](04-backoffice-web/clientes-e-piscinas/detalhe-piscina/README.md) |
| #68 | Ecrã Lista de Técnicos | [04-backoffice-web/equipa-tecnicos/lista-tecnicos](04-backoffice-web/equipa-tecnicos/lista-tecnicos/README.md) |
| #69 | Modal Ficha de Técnico | [04-backoffice-web/equipa-tecnicos/modal-ficha-tecnico](04-backoffice-web/equipa-tecnicos/modal-ficha-tecnico/README.md) |
| #70 | Ecrã Lista de Serviços | [04-backoffice-web/servicos/lista-servicos](04-backoffice-web/servicos/lista-servicos/README.md) |
| #71 | Ecrã Editor de Serviço | [04-backoffice-web/servicos/editor-servico](04-backoffice-web/servicos/editor-servico/README.md) |
| #72 | Ecrã Lista de Inventário | [04-backoffice-web/inventario/lista-inventario](04-backoffice-web/inventario/lista-inventario/README.md) |
| #73 | Modal Editor de Artigo | [04-backoffice-web/inventario/modal-editor-artigo](04-backoffice-web/inventario/modal-editor-artigo/README.md) |
| #74 | Ecrã Calendário Geral | [04-backoffice-web/agenda/calendario-geral](04-backoffice-web/agenda/calendario-geral/README.md) |
| #75 | Ecrã Detalhe do Dia | [04-backoffice-web/agenda/detalhe-do-dia](04-backoffice-web/agenda/detalhe-do-dia/README.md) |
| #76 | Modal Novo Agendamento | [04-backoffice-web/agenda/modal-novo-agendamento](04-backoffice-web/agenda/modal-novo-agendamento/README.md) |
| #77 | Ecrã Lista de Tickets | [04-backoffice-web/tickets/lista-tickets](04-backoffice-web/tickets/lista-tickets/README.md) |
| #78 | Ecrã Detalhe do Ticket | [04-backoffice-web/tickets/detalhe-ticket](04-backoffice-web/tickets/detalhe-ticket/README.md) |
| #79 | Landing Page (Página Inicial) | [_fora-de-ambito/portal-cliente-web/landing-page-catalogo-publico/outras-versoes/card-79-landing-page-pagina-inicial](_fora-de-ambito/portal-cliente-web/landing-page-catalogo-publico/outras-versoes/card-79-landing-page-pagina-inicial/README.md) |
| #80 | Ecrã de Login & Registo | [_fora-de-ambito/portal-cliente-web/login-e-registo-cliente/outras-versoes/card-80-ecra-de-login-registo](_fora-de-ambito/portal-cliente-web/login-e-registo-cliente/outras-versoes/card-80-ecra-de-login-registo/README.md) |
| #81 | Autenticação e Recuperação | [04-backoffice-web/autenticacao/login-e-recuperacao](04-backoffice-web/autenticacao/login-e-recuperacao/README.md) |
| #83 | Alerta de Ação Corretiva (Upsell) | [05-app-cliente/alerta-acao-corretiva/outras-versoes/card-83-alerta-de-acao-corretiva-upsell](05-app-cliente/alerta-acao-corretiva/outras-versoes/card-83-alerta-de-acao-corretiva-upsell/README.md) |
| #84 | Seletor de Múltiplas Piscinas | [05-app-cliente/seletor-multiplas-piscinas](05-app-cliente/seletor-multiplas-piscinas/README.md) |
| #85 | Modal de Pedido de Avaria/Orçamento | [05-app-cliente/pedido-avaria-orcamento](05-app-cliente/pedido-avaria-orcamento/README.md) |
| #86 | Modal de Agendamento de Manutenção | [05-app-cliente/agendamento-manutencao](05-app-cliente/agendamento-manutencao/README.md) |
| #87 | Ecrã de Histórico de Intervenções | [05-app-cliente/historico-e-faturacao/outras-versoes/card-87-ecra-de-historico-de-intervencoes](05-app-cliente/historico-e-faturacao/outras-versoes/card-87-ecra-de-historico-de-intervencoes/README.md) |
| #88 | Modal de Checkout/Compra Rápida | [05-app-cliente/checkout-compra-rapida](05-app-cliente/checkout-compra-rapida/README.md) |
| #89 | Ecrã de Perfil de Cliente | [05-app-cliente/perfil-cliente](05-app-cliente/perfil-cliente/README.md) |
| #93 | Cliente: Registo de Novo Cliente | [05-app-cliente/registo-novo-cliente](05-app-cliente/registo-novo-cliente/README.md) |
| #94 | Cliente: Dashboard "A Minha Piscina" | [05-app-cliente/dashboard-a-minha-piscina](05-app-cliente/dashboard-a-minha-piscina/README.md) |
| #95 | Cliente: Ecrã de Alerta e Ação Corretiva | [05-app-cliente/alerta-acao-corretiva](05-app-cliente/alerta-acao-corretiva/README.md) |
| #96 | Cliente: Formulário de Assistência/Orçamento | [05-app-cliente/pedido-avaria-orcamento/outras-versoes/card-96-cliente-formulario-de-assistencia-orcamento](05-app-cliente/pedido-avaria-orcamento/outras-versoes/card-96-cliente-formulario-de-assistencia-orcamento/README.md) |
| #97 | Cliente: Histórico e Faturação | [05-app-cliente/historico-e-faturacao](05-app-cliente/historico-e-faturacao/README.md) |
| #98 | Técnico: Dashboard do Técnico (Agenda do Dia) | [06-app-empresa/tecnico/agenda-do-dia](06-app-empresa/tecnico/agenda-do-dia/README.md) |
| #99 | Técnico: Ecrã de Execução de Serviço (Check-in) | [06-app-empresa/tecnico/execucao-servico-checkin](06-app-empresa/tecnico/execucao-servico-checkin/README.md) |
| #100 | Técnico: Registo de Consumíveis | [06-app-empresa/tecnico/registo-consumiveis](06-app-empresa/tecnico/registo-consumiveis/README.md) |
| #101 | Técnico: Ecrã de Finalização e Evidências | [06-app-empresa/tecnico/finalizacao-evidencias](06-app-empresa/tecnico/finalizacao-evidencias/README.md) |
| #103 | LABELS | [00-projeto/convencoes-labels](00-projeto/convencoes-labels/README.md) |
| #104 | Setup do Firebase e Regras de Segurança | [07-infraestrutura/repositorio-e-firebase/outras-versoes/card-104-setup-do-firebase-e-regras-de-seguranca](07-infraestrutura/repositorio-e-firebase/outras-versoes/card-104-setup-do-firebase-e-regras-de-seguranca/README.md) |
| #105 | Setup do Repositório Git | [07-infraestrutura/repositorio-e-firebase/outras-versoes/card-105-setup-do-repositorio-git](07-infraestrutura/repositorio-e-firebase/outras-versoes/card-105-setup-do-repositorio-git/README.md) |
| #106 | A: Inicialização do Projeto React e Tailwind (Web) | [04-backoffice-web/00-setup/inicializacao-react-tailwind](04-backoffice-web/00-setup/inicializacao-react-tailwind/README.md) |
| #107 | A: Autenticação e Roteamento Privado (Web) | [04-backoffice-web/autenticacao/implementacao-auth-rotas-privadas](04-backoffice-web/autenticacao/implementacao-auth-rotas-privadas/README.md) |
| #108 | A: Setup Base da App Cliente (Kotlin) | [05-app-cliente/00-setup/setup-base-kotlin](05-app-cliente/00-setup/setup-base-kotlin/README.md) |
| #109 | B: Setup Base da App Guimágua (Kotlin) | [06-app-empresa/00-setup/setup-base-kotlin](06-app-empresa/00-setup/setup-base-kotlin/README.md) |
| #110 | B: Autenticação Central e RBAC Dinâmico (App Guimágua) | [06-app-empresa/00-setup/autenticacao-rbac](06-app-empresa/00-setup/autenticacao-rbac/README.md) |
| #111 | B: Setup de Interfaces Nativas (Câmara e GPS) | [06-app-empresa/00-setup/camara-e-gps](06-app-empresa/00-setup/camara-e-gps/README.md) |
| #112 | Diagrama de Classes - Modelos de Dados (Data Classes) | [02-arquitetura-e-dados/diagramas-classes-mobile/01-modelos-dados](02-arquitetura-e-dados/diagramas-classes-mobile/01-modelos-dados/README.md) |
| #113 | Diagrama de Classes - Repositórios e Serviços (Backend) | [02-arquitetura-e-dados/diagramas-classes-mobile/02-repositorios-servicos](02-arquitetura-e-dados/diagramas-classes-mobile/02-repositorios-servicos/README.md) |
| #114 | Diagrama de Classes - ViewModels (App Técnico e Comercial) | [02-arquitetura-e-dados/diagramas-classes-mobile/03-viewmodels-app-empresa](02-arquitetura-e-dados/diagramas-classes-mobile/03-viewmodels-app-empresa/README.md) |
| #115 | Diagrama de Classes - ViewModels (App Cliente) e Ecrãs de Login | [02-arquitetura-e-dados/diagramas-classes-mobile/04-viewmodels-app-cliente-login](02-arquitetura-e-dados/diagramas-classes-mobile/04-viewmodels-app-cliente-login/README.md) |
| #116 | Diagrama de Classes - Global | [02-arquitetura-e-dados/diagramas-classes-mobile/05-global](02-arquitetura-e-dados/diagramas-classes-mobile/05-global/README.md) |
| #117 | Análise Funcional das Classes (Por Camada) | [02-arquitetura-e-dados/diagramas-classes-mobile/06-analise-funcional-classes](02-arquitetura-e-dados/diagramas-classes-mobile/06-analise-funcional-classes/README.md) |
| #120 | Configuração inicial do repositório e Firebase | [07-infraestrutura/repositorio-e-firebase](07-infraestrutura/repositorio-e-firebase/README.md) |
| #123 | Prompt AI WEB | [00-projeto/prompt-ai-web](00-projeto/prompt-ai-web/README.md) |
| #124 | A: Ecrã de Tickets (Pedidos & Orçamentos) | [04-backoffice-web/tickets/implementacao](04-backoffice-web/tickets/implementacao/README.md) |
| #125 | A: Ecrã de Agenda (Planeamento & Rotas) | [04-backoffice-web/agenda/implementacao](04-backoffice-web/agenda/implementacao/README.md) |
| #126 | A: Ecrã de Dashboard (Visão Geral) | [04-backoffice-web/dashboard/implementacao](04-backoffice-web/dashboard/implementacao/README.md) |
| #127 | A: Ecrã de Relatórios (Reports & Histórico) | [04-backoffice-web/relatorios/implementacao](04-backoffice-web/relatorios/implementacao/README.md) |
| #128 | B: Entidades Base & Catálogos | [04-backoffice-web/clientes-e-piscinas/implementacao](04-backoffice-web/clientes-e-piscinas/implementacao/README.md) |
| #129 | B: Ecrã de Equipa & Utilizadores (Team) | [04-backoffice-web/equipa-tecnicos/implementacao](04-backoffice-web/equipa-tecnicos/implementacao/README.md) |
| #130 | B: Ecrã de Catálogo de Serviços (Services) | [04-backoffice-web/servicos/implementacao](04-backoffice-web/servicos/implementacao/README.md) |
| #131 | B: Ecrã de Inventário & Stock (Inventory) | [04-backoffice-web/inventario/implementacao](04-backoffice-web/inventario/implementacao/README.md) |
