# Analise tecnica de classes funcoes e testes guimagua

> Texto extraído automaticamente de `analise-tecnica-de-classes-funcoes-e-testes-guimagua.pdf` (pdftotext). Tabelas podem ter perdido formatação; em caso de dúvida consultar o PDF original.

```text
GUIMÁGUA SMART POOL · ARQUITETURA MOBILE (KOTLIN / MVVM)
Análise Técnica de Classes, Funções, Validações e
Testes
Especificação funcional da camada de domínio, repositórios, ViewModels, programação funcional
com lambdas, estratégia de alertas e guião de testes RBAC.
Projeto:  Guimágua — Ecossistema Micro-ERP (Web + Grupo:        Grupo 01
          Mobile)
Unidades: Projeto de Computação Móvel Avançada ·  Stack Mobile: Kotlin · Jetpack Compose · MVVM
          PWADM
Backend: Firebase (Auth, Firestore, FCM) + Google Âmbito:       App Cliente, App Técnico e App
          Drive API                                             Comercial


   Enquadramento Arquitetónico: A aplicação móvel segue o padrão MVVM com fluxo unidirecional
   de dados ( StateFlow<UiState> ), separando a interface declarativa em Jetpack Compose, a lógica
   de negócio nos ViewModels, a comunicação externa nos Repositórios e o mapeamento direto das 8
   coleções do Cloud Firestore. As aplicações de Técnico e Comercial partilham a mesma base de
   código, adaptando os ecrãs consoante a tipologia do serviço. O armazenamento de fotografias e
   relatórios PDF opera via Google Drive API com Service Account da GCP (estratégia custo zero,
   sem autenticação Google pelo utilizador final).

1. Análise Funcional das Classes por Camada
Após a consolidação do diagrama de classes global unificado, procedeu-se à análise sistemática de
cada classe e das funções estritamente necessárias para satisfazer os requisitos funcionais (RF) e
não funcionais (RNF) definidos para o ecossistema Guimágua.
1.1 Camada de Domínio (8 Coleções Firestore, Tipos Embutidos e Enums)
As 8 coleções estruturadas no Cloud Firestore correspondem de forma biunívoca (1-para-1) a Data
Classes imutáveis em Kotlin. Cada modelo encapsula métodos puros de validação de domínio,
prevenindo a duplicação de regras de negócio nos ecrãs e nos ViewModels.

 Classe (Coleção)           Funções de Domínio               Papel Técnico                    Requisitos
 User                        hasRole(target)                 Valida o perfil de acesso RBAC (via RF-WEB02
  users                      canPerformService(skil          Custom Claims), gere o              RF-GLB01
                            l)                                fcm_token para notificações Push RNF-GLB01
                                                             e verifica as especialidades
                                                             atribuídas no backoffice.




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                       Page 1 of 8

 Classe (Coleção)           Funções de Domínio               Papel Técnico                          Requisitos
 Client                     hasValidContact()                Liga a conta de autenticação           RF-WEB01
  clients                                                    ( user_id ) ao perfil do cliente e     RNF-CLI01
                                                             garante integridade dos contactos
                                                             (telefone, morada e email único) e
                                                             estado de atividade.
 Pool                        hasInstalledEquipment(          Representa cada instalação             RF-WEB01
  pools                     name)                            aquática associada a um cliente        RF-CLI01
                                                             (dimensões, volume em m³,
                                                             tratamento e lista de equipamentos
                                                             instalados).
 Appointment                canCheckIn()                     Gere o ciclo de vida da                RF-WEB08
  appointments              isChecklistComplete()            visita/intervenção, resultados da      RF-TEC01–04
                            requiresBudgetAlert()            checklist, notas de campo, reporte     RF-COM01–03
                                                             de anomalias, IDs de fotos e link do
                                                             relatório PDF no Drive.
 PoolReading                 isWaterBalanced(minPh,          Armazena leituras físico-químicas      RF-WEB05
  pool_readings             maxPh)                           (pH, cloro livre, temperatura,         RF-CLI01
                                                             salinidade e timestamp) e avalia       RF-TEC02
                                                             conformidade face aos limiares
                                                             configurados.
 Ticket                     isUrgent()                       Modela pedidos de assistência,         RF-WEB06
  tickets                   canBeEdited()                    avarias ou orçamentos submetidos       RF-CLI02
                                                             pelo cliente, incluindo prioridade,
                                                             anexos fotográficos e controlo de
                                                             estado na triagem.
 Service                    isCommercialSurvey()             Define o catálogo de serviços          RF-WEB03
  services                                                   (duração padrão e checklist base) e    RF-COM02
                                                             distingue visitas de tipologia
                                                             "Orçamento / Vistoria" para adaptar
                                                             a interface partilhada.
 Consumable                  hasSufficientStock(qty          Controla stock atual, stock projetado RF-WEB03
  consumables               )                                e inativação segura de produtos       RF-TEC02
                             isBelowThreshold(min)           químicos e peças; suporta o abate
                                                             de materiais via
                                                              ConsumableUsage embutido.


Tipos Auxiliares de Domínio: A classe embutida ConsumableUsage(consumable_id, quantity_used) regista
os consumíveis abatidos dentro de cada Appointment . Quatro enumerações tipadas eliminam erros de texto livre:
 UserRole (ADMIN, CLIENT, TECHNICIAN, COMMERCIAL), ServiceType (MAINTENANCE, REPAIR,
COMMERCIAL_SURVEY), AppointmentStatus (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED) e
 TicketStatus (PENDING, IN_ANALYSIS, RESPONDED).




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                             Page 2 of 8

1.2 Camada de Repositórios e Serviços Externos
A camada de dados isola toda a comunicação com o Firebase e a Google Drive API. As operações
pontuais são funções suspend que devolvem Result<T> para tratamento seguro de falhas,
enquanto a telemetria utiliza Flow<T> para atualizações reativas em tempo real.

 Repositório              Funções de Leitura e Escrita             Comportamento Técnico              Requisitos
 AuthRepository           Leitura: getCurrentUserId() ,            Executa autenticação unificada, RF-GLB01
 Firebase Auth &           isUserLoggedIn() ,                      extrai Custom Claims do token RNF-GLB01
 FCM                       getCurrentUserRole() ,                  para encaminhamento RBAC e
                           getCurrentUserProfile() .               sincroniza o token FCM do
                          Escrita: loginUser() ,                   dispositivo na coleção users .
                           sendPasswordReset() ,
                           syncFcmToken() , logout() .

 FirestoreRepository Leitura / Tempo Real:                         Ativa a cache offline do SDK       RF-CLI01–03
 Cloud Firestore      getClientByUserId() ,                        para trabalho em caves de          RF-TEC01–04
                      getClientPools() ,                           máquinas sem rede e executa        RNF-TEC01–02
                          observePoolTelemetry() ,                  WriteBatch atómico no fecho       RF-COM01–03
                          getNextAppointment() ,                   da intervenção (atualiza visita,   RNF-GLB02
                          getDailyAppointments() ,                 cria leitura e abate stock em
                          getAppointmentById() ,                   bloco único).
                          getClientReports() ,
                          getConsumables() ,
                          getServiceCatalog() .
                          Escrita: registerCheckIn() ,
                          updateAppointmentStatus() ,
                          closeInterventionBatch() ,
                          saveCommercialSurvey() ,
                          reportAnomaly() ,
                          submitTicket() .

 DriveStorageRepos        Leitura: getReportPdfLink() ,            Autenticação OAuth2 server-to-     RF-WEB08
 itory                     downloadReportPdf() .                   server via Service Account da      RF-CLI03
 +                        Escrita: uploadPhotoToDrive() ,          GCP. Antes de qualquer envio,      RF-TEC03
 ImageCompressor           uploadMultiplePhotos() ,                o ImageCompressor reduz            RNF-COM01
 Google Drive API          getValidAccessToken() .                 localmente cada fotografia para    RNF-GLB04
                          Utilitário: compressImage() ,            menos de 1.5 MB (1 572 864
                           isWithinSizeLimit() .                   bytes).

1.3 Camada de ViewModels, Estados Imutáveis (UiState) e Prioridade
Cada ecrã observa exclusivamente um StateFlow<UiState> imutável gerido pelo respetivo
 ViewModel . Esta arquitetura garante sobrevivência a alterações de configuração e assegura que os
campos preenchidos nos formulários nunca se perdem em caso de falha de rede ou validação.




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                              Page 3 of 8

 ViewModel / UiState          Funções Nucleares a Implementar                   Dependências     Sprint
 LoginViewModel                onEmailChanged() , onPasswordChanged() ,          AuthRepositor   Sprint 1
  LoginUiState                 togglePasswordVisibility() ,                     y
                               validateCredentials() , submitLogin() ,
                               checkActiveSession() ,
                               requestPasswordReset() ,
                               dismissErrorPopup() .

 ClientDashboardViewM          loadClientPools() , selectPool() ,                AuthRepositor   Sprint 2
 odel                          loadTelemetry() ,                                y
  ClientDashboardUiS           loadNextAppointment() ,                           FirestoreRepo
 tate                          evaluateWaterQuality() ,                         sitory
                               refreshDashboard() , logout() .

 TechDashboardViewM            loadTodayRoute() , filterRoute() ,                AuthRepositor   Sprint 2
 odel                          calculateRouteProgress() ,                       y
  TechDashboardUiSta           startCheckIn() , openWorkOrder() ,                FirestoreRepo
 te                            clearAlert() .                                   sitory

 ClientTicketsViewMode         updateTicketField() ,                             FirestoreRepo   Sprint 2
 l                             attachCameraPhoto() ,                            sitory
  ClientTicketsUiSta           removeAttachedPhoto() ,                           DriveStorageR
 te                            validateTicketForm() ,                           epository
                               createNewTicket() ,
                               loadReportsHistory() , filterReports() ,
                               downloadReport() .

 InterventionViewModel         loadIntervention() , markTaskDone() ,             FirestoreRepo   Sprint 2 / 3
  InterventionUiStat           saveWaterReadings() , addConsumable() ,          sitory
 e                             removeConsumable() ,                              DriveStorageR
                               attachEvidencePhoto() ,                          epository
                               flagAnomalyForBudget() ,
                               validateFields() ,
                               finalizeIntervention() .

 SurveyViewModel               loadSurvey() , toggleViabilityItem() ,            FirestoreRepo   Sprint 3
  SurveyUiState                saveMeasurements() ,                             sitory
                               calculateEstimatedVolume() ,                      DriveStorageR
                               updateFieldNotes() , attachSitePhoto() ,         epository
                               validateSurvey() , submitSurvey() .


2. Catálogo de Funções Lambda e Programação Funcional
Em conformidade com as diretrizes de desenvolvimento em Kotlin e Jetpack Compose, o projeto
aplica programação funcional em quatro contextos concretos que desacoplam a interface gráfica, o
roteamento de perfis, os carregamentos assíncronos e a filtragem de coleções em memória.
2.1 Lambdas de Eventos de Interface (State Hoisting no Jetpack Compose)
Os Composables não comunicam diretamente com o Firebase nem alteram o estado global. Todas
as interações do utilizador sobem para o ViewModel através de parâmetros funcionais, tornando os
ecrãs testáveis e reutilizáveis:
Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                      Page 4 of 8

  // Ecrã de Login (Sprint 1)
  onEmailChange: (String) -> Unit
  onPasswordChange: (String) -> Unit
  onSubmitClick: () -> Unit

  // Ecrã de Intervenção Técnica e Vistoria Comercial
  onToggleTask: (taskName: String, isDone: Boolean) -> Unit
  onAddConsumable: (consumable: Consumable, quantity: Int) -> Unit
  onDimensionsChange: (length: Double, width: Double, dMin: Double, dMax: Double) ->
  Unit


2.2 Lambdas de Callback e Navegação Condicional (RBAC e Tipologia)
Os ViewModels não detêm referências ao controlador de navegação ( NavController ). Em vez
disso, recebem funções lambda de sucesso e erro para disparar o encaminhamento de ecrã após a
resolução assíncrona das Custom Claims ou da tipologia da visita:
  // Encaminhamento pós-login baseado em UserRole (RNF-GLB01)
  fun submitLogin(
      onRoleResolved: (UserRole) -> Unit,
      onAccessDenied: (String) -> Unit
  )

  // Adaptação dinâmica entre Técnico (Manutenção) e Comercial (Vistoria)
  fun openWorkOrder(
      appointment: Appointment,
      onNavigate: (ServiceType) -> Unit
  )


2.3 Lambdas de Progresso Assíncrono (Upload Multimédia)
Durante o envio de evidências fotográficas comprimidas para a Google Drive API, uma lambda de
progresso notifica continuamente a interface sobre a percentagem de transferência concluída:
  // Reporte de progresso em tempo real ao UiState (RNF-COM01 & RNF-GLB04)
  suspend fun uploadPhotoToDrive(
      file: File,
      folderId: String,
      onProgress: (percent: Int) -> Unit
  ): Result<String>


2.4 Funções de Ordem Superior (Predicados de Filtragem)
Em vez de multiplicar métodos rígidos de pesquisa, os ViewModels expõem funções de ordem
superior que recebem um predicado booleano para filtrar rotas diárias e históricos de relatórios de
forma declarativa:




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                Page 5 of 8

  // Filtragem dinâmica de rota no TechDashboardViewModel
  fun filterRoute(predicate: (Appointment) -> Boolean): List<Appointment> =
      _uiState.value.todayAppointments.filter(predicate)

  // Filtragem combinada por ano ou pesquisa textual no ClientTicketsViewModel
  fun filterReports(predicate: (Appointment) -> Boolean): List<Appointment> =
      _uiState.value.reportsHistory.filter(predicate)


3. Regras de Validação e Estratégia de Alertas
A estratégia de fiabilidade e experiência de utilizador combina validações síncronas imediatas antes
de qualquer chamada de rede, feedback visual padronizado (erros inline, AlertDialog e
Snackbar / Toast ) e alertas remotos assíncronos via Firebase Cloud Messaging (FCM).


 Contexto / Ecrã        Regras de Validação                     Mecanismo de Alerta      Comportamento de UX
 Login &                Campos obrigatórios não vazios;         Erros inline sob os      Preserva o email digitado
 Recuperação            email validado por padrão               campos de texto +        e limpa apenas a palavra-
                         Patterns.EMAIL_ADDRESS ;                AlertDialog             passe em caso de falha
                        palavra-passe ≥ 6 caracteres;           (Popup) para             de autenticação
                        conta ativa ( is_active ==              credenciais inválidas    (RNF-GLB03).
                        true ) e perfil mobile autorizado.      ou acesso negado.
 Intervenção            pH dentro da escala física válida       Erros inline nos         Mantém os valores no
 Técnica                (0.0–14.0); cloro e temperatura         campos numéricos +       InterventionUiState
                        numéricos válidos; tarefas               Snackbar / Toast        ; sem rede, a escrita fica
                        obrigatórias da checklist               de sucesso ou aviso de   em cache local para
                        concluídas; quantidade abatida ≤        modo offline.            sincronização posterior
                        stock disponível na carrinha.                                    (RNF-TEC01).
 Vistoria               Comprimento, largura e                   Toast informativo de    Comprime as imagens
 Comercial              profundidades estritamente              compressão concluída     silenciosamente no
                        superiores a 0; verificação             + erro inline em         dispositivo e exibe barra
                        automática do limite de 1.5 MB por      dimensões inválidas.     de progresso durante o
                        fotografia antes da submissão                                    upload para o Drive.
                        (RNF-COM01).
 Pedidos de             Seleção obrigatória de piscina e         AlertDialog de          Se ocorrer falha de
 Assistência            tipologia; descrição preenchida         Confirmação com          ligação, o texto e as fotos
                        (máximo 500 caracteres); limite de      referência do ticket     locais permanecem
                        4 fotografias anexadas por pedido.      criado ou Toast de       intactos no
                                                                Erro.                     ClientTicketsUiStat
                                                                                         e (RNF-GLB03).

 Alertas Remotos        Desvio crítico de parâmetros de         Push Notifications       App Cliente recebe avisos
 (Sistema)              água face aos limiares                  entregues via Firebase   críticos da piscina; App
                        configurados (ex.: pH fora de 7.2–      Cloud Messaging          Técnico/Comercial recebe
                        7.6) ou atribuição de agendamento       (FCM) (RF-GLB01).        notificações imediatas de
                        urgente no Backoffice Web.                                       despacho urgente.




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                              Page 6 of 8

4. Plano de Testes de Utilização e Controlo de Acessos (RBAC)
O plano de testes abaixo formaliza a validação das regras de interface, do encaminhamento estrito
por perfil (Role-Based Access Control), das regras de segurança no servidor ( firestore.rules ) e
da resiliência em operação offline.

 ID         Cenário / Conta            Passos de Execução               Resultado Esperado               Requisitos
 TC-01      Validação Local            1. Premir "Entrar" sem           Bloqueia o pedido ao             RNF-GLB03
            Campos vazios ou           preencher credenciais.           Firebase; exibe erros inline e
            email mal formatado        2. Inserir texto sem @ no        abre AlertDialog com a
                                       email e submeter.                mensagem correspondente.
 TC-02      Acesso Cliente             1. Introduzir credenciais        Valida Custom Claim              RF-CLI01
             cliente@guimagua.         válidas de cliente.               CLIENT ; encaminha para         RNF-GLB01
            pt                         2. Submeter autenticação.         ClientDashboardScreen ;
                                                                        apresenta telemetria e
                                                                        apenas as piscinas do titular.
 TC-03      Acesso Técnico             1. Iniciar sessão como           Valida Custom Claim              RF-TEC01
             tecnico@guimagua.         técnico.                          TECHNICIAN ; abre               RF-TEC02
            pt                         2. Selecionar uma visita de       TechDashboardScreen e           RNF-GLB01
                                       manutenção na rota diária.       carrega
                                                                         InterventionScreen com
                                                                        leituras químicas e abate de
                                                                        stock.
 TC-04      Acesso Comercial           1. Iniciar sessão como           Valida Custom Claim              RF-COM01
             comercial@guimagu         comercial.                        COMMERCIAL ; reutiliza o        RF-COM02
            a.pt                       2. Abrir uma visita de           dashboard operacional e          RNF-GLB01
                                       tipologia "Orçamento /           encaminha para
                                       Vistoria".                        SiteSurveyScreen ,
                                                                        ocultando campos químicos.
 TC-05      Acesso Bloqueado           1. Tentar login mobile com       Autorização rejeitada;           RNF-GLB01
            Perfil ADMIN na App        conta ADMIN (exclusiva do        utilizador permanece no          RNF-GLB03
            ou conta inativa           Backoffice) ou utilizador com     LoginScreen e visualiza
                                        is_active = false .              AlertDialog "Acesso
                                                                        Negado".
 TC-06      Isolamento Backend         1. Com sessão ativa do           O servidor Firestore recusa a    RNF-GLB02
            Regras                     Cliente A, tentar consultar      leitura com                      RNF-CLI01
             firestore.rules           diretamente o documento de        PERMISSION_DENIED ,
                                       uma piscina do Cliente B.        garantindo privacidade e
                                                                        conformidade RGPD.
 TC-07      Resiliência Offline        1. Ativar Modo Avião durante     A cache local preserva todos RNF-TEC01
            Fecho de intervenção       uma intervenção.                 os dados sem perda e o SDK RNF-TEC02
            sem rede                   2. Registar leituras, abater     sincroniza o WriteBatch      RNF-GLB03
                                       consumíveis e finalizar.         automaticamente assim que
                                       3. Reativar rede.                a ligação regressa.




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes                               Page 7 of 8

5. Sequência de Implementação no Android Studio (Arranque Sprint 1)
Com a arquitetura MVVM, o diagrama de classes global e o plano de testes validados, a transição
para o desenvolvimento em Kotlin no Android Studio segue uma sequência incremental de quatro
blocos base, permitindo testar de imediato a autenticação real e o encaminhamento por perfil:
1. Camada de Domínio ( model/ ): Implementação das 8 Data Classes espelho do Firestore ( User ,
    Client , Pool , Appointment , PoolReading , Ticket , Service , Consumable ), do tipo embutido
    ConsumableUsage e dos 4 Enums .
2. Camada de Autenticação ( data/repository/AuthRepository.kt ): Ligação ao Firebase Auth
   para validação de credenciais, leitura de Custom Claims e sincronização do token FCM.
3. Gestão de Estado ( ui/login/LoginViewModel.kt ): Definição do LoginUiState imutável,
   funções de validação local, preservação de campos e invocação das lambdas de roteamento
   RBAC.
4. Primeira Interface ( ui/login/LoginScreen.kt ): Construção do ecrã em Jetpack Compose
   segundo o UI Kit Guimágua, integrando state hoisting por lambdas, indicadores de erro inline e
    AlertDialog nativo de validação.




Guimágua Smart Pool · Grupo 01 — Análise Técnica de Classes, Funções e Testes            Page 8 of 8


```
