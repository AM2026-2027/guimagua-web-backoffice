# Especificacao requisitos

> Texto extraído automaticamente de `especificacao-requisitos.pdf` (pdftotext). Tabelas podem ter perdido formatação; em caso de dúvida consultar o PDF original.

```text
GUIMÁGUA — ESPECIFICAÇÃO TÉCNICA
Especificação de Requisitos do Sistema
Levantamento consolidado de Requisitos Funcionais (RF) e Requisitos Não Funcionais (RNF) por módulo
do ecossistema.

 Módulo / Área do Sistema                                            RF                 RNF                Total
 1. Backoffice WEB (Gestão e Administração)                           8                  2                  10
 2. APP Cliente (Portal do Cliente)                                   3                  1                   4
 3. APP Técnico (Manutenção e Reparação)                              4                  2                   6
 4. APP Comercial (Orçamentistas e Vendedores)                        3                  1                   4
 5. Requisitos Globais (Transversais ao Sistema)                      1                  4                   5
 Total Geral                                                          19                 10                 29

1. Backoffice WEB (Gestão e Administração)
Requisitos Funcionais (RF)
 Código           Especificação do Requisito
 RF-WEB01         Clientes e Piscinas: O sistema deve permitir criar, editar, listar e inativar perfis de clientes
                  (nome, morada, telefone, email único) e associar-lhes uma ou mais piscinas (morada local,
                  dimensões, volume m³ e equipamentos instalados).
 RF-WEB02         Gestão de Técnicos e Credenciais: O sistema deve permitir criar e editar perfis de técnicos
                  e comerciais, definindo as suas aptidões. A criação do perfil deve provisionar
                  automaticamente a conta no Firebase Auth e disparar as credenciais de acesso para as
                  respetivas APPs.
 RF-WEB03         Catálogo e Inventário: O sistema deve permitir configurar o catálogo de tipos de serviço
                  (checklists e consumíveis base) e gerir os materiais (inativação/ocultação segura). Deve
                  calcular o stock projetado e abater automaticamente o stock após serviços concluídos.
 RF-WEB04         Agendamento e Prevenção de Conflitos: O calendário interativo deve permitir agendar
                  intervenções/visitas comerciais, bloqueando ativamente a sobreposição de horários para o
                  mesmo colaborador e alertando para roturas de stock projetado.
 RF-WEB05         Dashboard e Alertas: O sistema deve apresentar um painel com métricas em tempo real e
                  alertas centralizados. Deve permitir parametrizar os limiares de segurança (ex: pH entre 7.2 e
                  7.6) que disparam estes avisos.
 RF-WEB06         Triagem de Tickets: O sistema deve ter uma área dedicada para listar, analisar e alterar o
                  estado (Pendente, Em Análise, Respondido) de pedidos de assistência e aprovação de
                  orçamentos submetidos pelos clientes.

Guimágua — Especificação de Requisitos do Sistema                                                           Page 1 of 4

 Código           Especificação do Requisito
 RF-WEB07         Auditoria e Histórico: O sistema deve centralizar o histórico de rotas dos colaboradores,
                  relatórios de intervenção e alterações aos equipamentos da piscina.
 RF-WEB08         Geração de PDFs: O Backoffice Web deve compilar os dados das intervenções concluídas
                  (leituras, checklist, consumíveis e fotos) num relatório PDF timbrado e armazená-lo numa
                  pasta centralizada utilizando a Google Drive API, guardando o link de acesso no Firestore
                  para que a App Cliente o possa visualizar de forma assíncrona.

Requisitos Não Funcionais (RNF)
 Código            Especificação do Requisito
 RNF-WEB01         Stack e UI/UX: O backoffice deve ser desenvolvido em React (Tailwind CSS), respeitando a
                   identidade visual da Guimágua, com uma abordagem desktop-first totalmente compatível
                   com tablets e browsers modernos (Chrome, Firefox, Safari, Edge).
 RNF-WEB02         Performance de Listagens: As listagens pesadas (clientes, inventário, histórico) devem
                   usar paginação por cursores no Firestore, garantindo renderização inferior a 2 segundos.

2. APP Cliente (Portal do Cliente)
Requisitos Funcionais (RF)
 Código           Especificação do Requisito
 RF-CLI01         Dashboard de Telemetria: A aplicação deve permitir ao cliente visualizar o estado em tempo
                  real da sua piscina (ou alternar entre várias piscinas), exibindo os parâmetros físico-químicos
                  e a data da próxima visita agendada.
 RF-CLI02         Submissão de Pedidos: A aplicação deve permitir ao cliente reportar avarias, solicitar
                  orçamentos para remodelações ou pedir visitas técnicas urgentes, permitindo anexar
                  fotografias diretamente do smartphone.
 RF-CLI03         Arquivo de Relatórios: A aplicação deve disponibilizar o acesso ao histórico de
                  manutenções realizadas, permitindo consultar ou descarregar os relatórios finais emitidos
                  pelos técnicos.

Requisitos Não Funcionais (RNF)
 Código           Especificação do Requisito
 RNF-CLI01        Privacidade e RGPD: A comunicação deve ser cifrada (HTTPS/TLS 1.3). Os dados pessoais
                  e as informações financeiras/moradas apresentadas na App devem ser tratadas com
                  encriptação e em total conformidade com o RGPD.




Guimágua — Especificação de Requisitos do Sistema                                                        Page 2 of 4

3. APP Técnico (Manutenção e Reparação)
Requisitos Funcionais (RF)
 Código           Especificação do Requisito
 RF-TEC01         Rota e Check-in: A aplicação deve permitir ao técnico visualizar a sua rota diária e registar o
                  início do trabalho (Check-in) na morada da piscina.
 RF-TEC02         Execução e Leituras: O técnico deve conseguir validar as tarefas da checklist dinâmica,
                  introduzir as leituras da água (pH, cloro, temperatura) e discriminar as quantidades de
                  produtos consumidos da sua carrinha.
 RF-TEC03         Evidências Fotográficas: A aplicação deve permitir tirar fotos do estado geral da piscina ou
                  reparações efetuadas, anexando-as diretamente ao relatório da intervenção.
 RF-TEC04         Reporte de Anomalias no Terreno: O técnico deve conseguir sinalizar equipamentos
                  avariados no terreno, encaminhando automaticamente esse alerta para o backoffice gerar um
                  orçamento.

Requisitos Não Funcionais (RNF)
 Código           Especificação do Requisito
 RNF-TEC01        Persistência Offline: A aplicação deve suportar o trabalho em zonas sem rede (ex: caves de
                  máquinas isoladas). A cache do SDK deve guardar as leituras e sincronizar automaticamente
                  as escritas mal a ligação seja retomada.
 RNF-TEC02        Integridade Transacional: O fecho de uma intervenção na App, que abate stock e atualiza a
                  ficha da piscina, deve usar WriteBatch (transações atómicas do Firestore) para evitar perdas
                  ou duplicações de dados em caso de falha de rede a meio do envio.

4. APP Comercial (Orçamentistas e Vendedores)
  Nota: Esta aplicação partilha a mesma base de código da App do Técnico, mas a interface adapta-se aos
  serviços de tipologia "Orçamento / Vistoria", ocultando campos químicos.

Requisitos Funcionais (RF)
 Código           Especificação do Requisito
 RF-COM01         Gestão de Visitas Comerciais: O comercial deve visualizar na sua agenda as visitas de
                  avaliação de novas obras, remodelações ou clientes angariados.
 RF-COM02         Levantamento de Requisitos de Obra: A aplicação deve fornecer uma checklist de vistoria
                  focada na estrutura (ex: medições, estado do revestimento, localização da casa das
                  máquinas) em vez de parâmetros químicos.




Guimágua — Especificação de Requisitos do Sistema                                                        Page 3 of 4

 Código           Especificação do Requisito
 RF-COM03         Captura Multimédia para Orçamentação: A aplicação deve permitir a captura intensiva de
                  fotografias do espaço e anexação de notas de voz/texto livres para fundamentar a elaboração
                  do orçamento no backoffice.

Requisitos Não Funcionais (RNF)
 Código            Especificação do Requisito
 RNF-COM01         Otimização Multimédia Automática: Dado o elevado volume de fotografias tiradas em
                   levantamentos de obra, a aplicação deve realizar a compressão agressiva das imagens
                   localmente no dispositivo (limite de 1.5 MB por foto) antes do upload, para poupar dados
                   móveis e acelerar a sincronização.

5. Requisitos Globais (Transversais ao Sistema)
Requisitos Funcionais (RF)
 Código           Especificação do Requisito
 RF-GLB01         Notificações Push bidirecionais: O sistema deve utilizar o Firebase Cloud Messaging
                  (FCM) para comunicar exclusivamente com as APPs. A App Cliente recebe alertas de
                  parâmetros críticos de água, e a App Técnico/Comercial recebe notificações de novos
                  agendamentos urgentes inseridos pelo Backoffice Web.

Requisitos Não Funcionais (RNF)
 Código           Especificação do Requisito
 RNF-GLB01        Autenticação Unificada e RBAC: Todo o ecossistema partilha o Firebase Auth. O
                  encaminhamento para o perfil correto (Cliente, Técnico, Comercial, Admin) é feito com base
                  nas Custom Claims atribuídas, limitando acessos de forma estrita.
 RNF-GLB02        Segurança Firestore: Devem existir regras rígidas (firestore.rules) no backend que impeçam
                  um cliente de ler os dados de outro, ou um técnico de alterar preços no catálogo, bloqueando
                  falhas a nível de servidor. A segurança dos ficheiros multimédia e relatórios será garantida
                  pela gestão de permissões da Service Account do Google Drive.
 RNF-GLB03        Tolerância a Falhas e UX: Todas as aplicações (WEB e APPs) devem fornecer feedback
                  imediato (toasts de sucesso/erro). Em caso de submissões falhadas, os dados preenchidos
                  nos formulários não devem ser apagados.
 RNF-GLB04        Integração de Armazenamento e Service Account: O upload e download de artefactos
                  (fotografias e relatórios PDF) submetidos pelas APPs ou gerados pelo Backoffice será
                  processado de forma invisível para o utilizador via server-to-server, utilizando uma Service
                  Account da Google Cloud Platform (GCP). Os utilizadores finais não precisarão de possuir ou
                  autenticar-se com uma conta Google.



Guimágua — Especificação de Requisitos do Sistema                                                      Page 4 of 4


```
