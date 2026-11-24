# Matriz rastreabilidade

> Texto extraído automaticamente de `matriz-rastreabilidade.pdf` (pdftotext). Tabelas podem ter perdido formatação; em caso de dúvida consultar o PDF original.

```text
GUIMÁGUA — DOCUMENTAÇÃO DE ENGENHARIA
Matriz de Rastreabilidade
Correspondência direta entre User Stories (US), Requisitos Funcionais (RF) e Casos de Uso (UC).

       User Stories (US)                  Requisitos Funcionais (RF)                  Casos de Uso (UC)
               10                                       17                                    27

Mapeamento US → RF → UC
 User Story (US)               Requisitos Funcionais (RF)                        Casos de Uso (UC)
 US01                          RF01: Criar/editar clientes e validar unicidade   UC_RegistarCliente
 Registo e Gestão de           de email.                                          ⌊ UC_ValidarEmail
 Clientes                                                                         (include)
 US02                          RF02: Associar piscina, dimensões e               UC_RegistarPiscina
 Ficha e Equipamentos          equipamentos.                                      ⌊ UC_GerirEquipamentos
 da Piscina                                                                       (include)
 US03                          RF08: Gerir catálogo, inativar e ocultar          UC_GerirConsumiveis
 Catálogo de                   produtos sem perda histórica.                      ⌊ UC_InativarProduto
 Consumíveis                                                                      (extend)
                                                                                  ⌊ UC_VerOcultos (extend)
 US04                          RF04: Gerir perfil e aptidões.                    UC_CriarTecnico
 Gestão de Equipa                                                                 ⌊ UC_Aptidoes (include)
 Técnica                       RF05: Gerar credenciais automáticas.
                                                                                  ⌊ UC_Credenciais
                               RF06: Consultar histórico do técnico.              (include)
 US05                          RF07: Criar catálogo de serviços, checklist       UC_ConfigurarServico
 Configuração de Tipos         ordenável e associar consumíveis                   ⌊ UC_Checklist (include)
 de Serviço                    necessários.                                       ⌊ UC_AssociarProdutos
                                                                                  (include)
 US06                          RF10: Calendário de agendamentos.                 UC_AgendarVisita
 Marcação de Visitas e                                                            ⌊ UC_ValidarHorario
 Calendário                    RF11: Bloquear sobreposições de horário e          (include)
                               validar alertas de stock projetado.
                                                                                  ⌊ UC_VerificarStock
                                                                                  (include)
                                                                                  ⌊ UC_SincDashboard
                                                                                  (include)




Guimágua — Matriz de Rastreabilidade                                                                 Page 1 of 2

 User Story (US)               Requisitos Funcionais (RF)                        Casos de Uso (UC)
 US07                          RF17: Área centralizada para resposta a           UC_ResponderPedidos
 Triagem de Pedidos da         pedidos e orçamentos submetidos por                 ⌊ UC_SubmeterPedido (ator
 App                           clientes.                                           Cliente)
 US08                          RF12: Check-in, checklist, leituras de            UC_ExecutarServico
 Execução de Serviço           pH/Cloro e registo de gastos.                       ⌊ UC_PreencherLeituras
 no Terreno                                                                        (include)
                               RF13: Anexar fotografias.
                                                                                   ⌊ UC_RegistarGastos
                               RF14: Reportar avarias de terreno.                  (include)
                               RF15: Alimentar métricas do dashboard               ⌊ UC_AnexarFotos (extend)
                               central em tempo real.
 US09                          RF09: Cálculo de stock projetado (físico vs       UC_GerirStock
 Controlo de Inventário        comprometido) e abate automático de                ⌊ UC_StockProjetado
 e Abate                       materiais pós-serviço.                              (include)
 US10                          RF03: Histórico auditável de equipamentos         UC_ConsultarHistorico
 Histórico e Relatórios        da piscina.                                         ⌊
                                                                                   UC_HistoricoEquipamentos
                               RF16: Parametrizar limites de alerta (ex:           (extend)
                               pH/Cloro) para visualização do histórico e
                               dashboard.


  Legenda das relações UML: (include) indica um caso de uso obrigatório executado como parte do fluxo
  principal; (extend) indica um comportamento opcional ou condicional; (ator Cliente) identifica o ator externo que
  inicia o caso de uso associado.




Guimágua — Matriz de Rastreabilidade                                                                       Page 2 of 2


```
