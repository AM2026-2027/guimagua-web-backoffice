# App piscinas funcionalidades

> Texto extraído automaticamente de `app-piscinas-funcionalidades.pdf` (pdftotext). Tabelas podem ter perdido formatação; em caso de dúvida consultar o PDF original.

```text
           App Piscinas — Levantamento de Funcionalidades

                                           Marta

                                  29 de setembro de 2026


1    Enquadramento

O projeto é uma aplicação móvel para os clientes da Guimagua, uma empresa de construção
de piscinas, com um backoﬃce web para a própria empresa. Como o cliente ainda não tem
requisitos deﬁnidos, este documento organiza as ideias do brainstorming feito em aula a 29 de
setembro de 2026. Serve de ponto de partida para validar com o cliente.
No quadro, as ideias ﬁcaram em dois lados: o que o cliente (dono da piscina) faz na app e o
que a Guimagua gere no backoﬃce. Nenhuma funcionalidade está aprovada nesta fase.


2    Perﬁs de utilizador

O quadro identiﬁca dois perﬁs. A estes junta-se o vendedor da Guimagua, que usa a app para
fazer orçamentos junto do cliente.

 Perﬁl              Plataforma      Quem é                Objetivo principal

 Cliente            App móvel       Proprietário da       Acompanhar o estado da piscina,
                                    piscina               as manutenções e os custos, e
                                                          contactar a empresa
 Guimagua           Backoﬃce        Equipa de gestão da   Apresentar a empresa,
                    web             empresa               acompanhar o dashboard e gerir
                                                          os dados que alimentam a app
 Vendedor /         App móvel       Comercial da          Fazer o orçamento na hora e
 orçamentista                       Guimagua, no          mostrar ao cliente, com IA, como
                                    terreno com o         a piscina vai ﬁcar
                                    cliente
 Técnico            App móvel       Técnico de            Consultar os serviços do dia e
 (proposta)                         manutenção da         registar cada visita: tarefas,
                                    Guimagua              leituras, produtos e fotograﬁas


Os técnicos não aparecem no quadro. As funcionalidades propostas para eles estão na secção 5.


3    Aplicação móvel (cliente)

As oito ideias do lado do cliente agrupam-se em cinco áreas. A coluna “N.ž” mantém a numeração
original do quadro. As descrições são uma primeira interpretação, a conﬁrmar com o cliente.

                                              1

 Área               N.ž    Funcionalidade           Descrição proposta

 Monitorização       1     Estatísticas de          Histórico e gráﬁcos dos valores medidos na
 da piscina                leituras                 piscina (por exemplo pH, cloro e
                                                    temperatura)
 Monitorização       6     Alertas                  Notiﬁcações quando uma leitura sai dos
 da piscina                                         limites ou há uma manutenção pendente
 Monitorização       7     IoT: leitura de          Recolha automática de leituras a partir de
 da piscina                sensores                 sensores instalados na piscina (destacado
                                                    no quadro)
 Controlo            7     IoT: controlo de         Ligar e desligar as luzes, abrir e fechar a
 remoto                    equipamentos             cobertura da piscina e controlar outros
                                                    equipamentos (por exemplo bomba ou
                                                    aquecimento) a partir da app
 Monitorização       8     Integração com           Previsão do tempo para ajustar
 da piscina                meteorologia             recomendações, por exemplo antes de
                                                    chuva forte ou calor
 Manutenção          2     Estimativas de           Previsão de quando será necessária a
                           manutenções              próxima manutenção
 Manutenção          3     Agendar                  Manual: o cliente escolhe a data.
                           manutenções              Automático: o sistema propõe ou marca
                                                    a data com base nas estimativas
 Comercial e         4     Pedir orçamento ou       Pedido de orçamento para obras ou
 contacto                  visita                   serviços, ou de uma visita técnica
 Comercial e         5     Chat                     Conversa direta com a Guimagua
 contacto
 Comercial e         —     Promoções                Banner na app com promoções de
 contacto                  personalizadas           produtos (por exemplo um aspirador de
                                                    piscina), escolhidas a partir dos consumos
                                                    e das leituras do cliente
 Financeiro          1     Estatísticas             Resumo dos gastos do cliente com
                           ﬁnanceiras               manutenções, produtos e serviços



4    Aplicação móvel (vendedor / orçamentista)

O vendedor usa a app para fazer orçamentos no local, junto do cliente. Não precisa das estatísti-
cas ﬁnanceiras nem das leituras das piscinas: trabalha só com o catálogo de materiais, a tabela
de preços e os seus orçamentos.

 Funcionalidade              Descrição proposta

 Orçamento em tempo          O vendedor escolhe com o cliente os materiais e as opções, e o
 real                        preço atualiza na hora
 Simulação da piscina        A partir de uma fotograﬁa do terreno, a IA gera uma imagem de
 com IA                      como a piscina vai ﬁcar com os materiais escolhidos




                                                2

5    Aplicação móvel (técnico) — proposta

Os técnicos são quem vai mais vezes à piscina. Com uma vista própria na app, passam a ser a
principal fonte de leituras e de histórico enquanto não houver sensores IoT.

 Área              Funcionalidade            Descrição proposta

 Planeamento       Agenda de serviços        Lista dos serviços atribuídos para o dia, com
                                             morada, contacto do cliente e navegação até ao
                                             local
 Planeamento       Ficha da piscina          Dimensões, volume de água, equipamentos
                                             instalados (bomba, ﬁltro, clorador) e histórico de
                                             intervenções
 Registo           Registo de                Checklist por tipo de serviço (limpeza, lavagem
                   manutenção                do ﬁltro, tratamento químico), com hora de
                                             início e de ﬁm
 Registo           Registo de leituras       Valores medidos na visita (pH, cloro,
                                             temperatura, alcalinidade), que alimentam as
                                             estatísticas e os alertas do cliente
 Registo           Produtos e materiais      Quantidades usadas em cada visita, que
                   gastos                    alimentam as estatísticas ﬁnanceiras e o controlo
                                             de stock
 Registo           Fotograﬁas antes e        Prova do trabalho feito e registo do estado da
                   depois                    piscina
 Fecho da visita   Conﬁrmação do             Assinatura no ecrã ou conﬁrmação na app do
                   cliente                   cliente
 Fecho da visita   Relatório automático      Resumo enviado ao cliente com as tarefas, as
                                             leituras e as fotograﬁas
 Fecho da visita   Reportar avaria           Registo de um problema com fotograﬁas, que
                                             gera um pedido de orçamento para o vendedor ou
                                             para o backoﬃce
 Suporte           Modo oﬄine                Registo sem rede, com sincronização quando
                                             houver ligação


No backoﬃce, isto implica atribuir serviços aos técnicos e consultar os registos de cada visita.


6    Backoﬃce web (Guimagua)

O backoﬃce tem três funções: apresentar a empresa, mostrar um dashboard e, sobretudo, gerir
os dados que alimentam a app móvel. As ideias do quadro que não são ecrãs do backoﬃce
passaram para a secção 7.

 Área                 Funcionalidade           Descrição proposta

 Apresentação da      Site institucional       Página pública com a empresa, os serviços,
 empresa                                       piscinas construídas e contactos



                                                3

 Área                 Funcionalidade           Descrição proposta

 Dashboard            Estatísticas             Visão agregada da faturação e das leituras de
                                               todas as piscinas (do quadro: ﬁnanceiras e
                                               leituras)
 Dashboard            Alertas                  Acompanhamento dos alertas gerados nas
                                               piscinas dos clientes, para a empresa poder agir
 Dados para a app     Clientes e piscinas     Registo dos clientes e das suas piscinas
                                              (dimensões, equipamentos), que alimenta a
                                              ﬁcha da piscina
 Dados para a app     Catálogo de materiais   Materiais, opções e preços usados pelo
                      e preços                vendedor nos orçamentos, e consulta dos
                                              orçamentos feitos
 Dados para a app     Serviços e técnicos      Tipos de serviço com as respetivas checklists, e
                                               atribuição dos serviços aos técnicos
 Dados para a app     Limites dos alertas      Valores de referência (por exemplo pH e cloro)
                                               que disparam os alertas na app
 Dados para a app     Campanhas e              Criação dos banners e escolha dos produtos em
                      promoções                promoção mostrados na app
 Dados para a app     Pedidos e chat           Resposta aos pedidos de orçamento ou visita e
                                               às mensagens dos clientes



7    Outros componentes (servidor e serviços externos)

Estas ideias não são ecrãs da app nem do backoﬃce. Correm no servidor ou dependem de
serviços externos, e fornecem dados às duas plataformas.

 Componente               Função                                          Usado por

 Algoritmo de             Escolhe o banner a mostrar a cada cliente a     App do cliente
 promoções                partir dos consumos e das leituras
 Machine learning com     Modelos treinados com o histórico de            Estimativas e
 leituras                 leituras para prever problemas e                alertas da app;
                          necessidades de manutenção                      dashboard
 Serviço de IA para       Gera a imagem da piscina a partir da foto       App do vendedor
 simulação                do terreno e dos materiais escolhidos
 Integração IoT           Recebe as leituras dos sensores e envia         App do cliente
                          comandos aos equipamentos (luzes,
                          cobertura)
 API de meteorologia      Fornece a previsão do tempo                     App do cliente
 Notiﬁcações push         Envia alertas, lembretes e mensagens para       Todas as vistas da
                          os telemóveis                                   app


Várias ideias dependem das leituras: estatísticas, alertas, estimativas, agendamento automático,
promoções e machine learning. Por isso, a forma de obter essas leituras (sensores IoT ou registo
pelo técnico) é a primeira decisão técnica do projeto.


                                               4

8    Proposta de priorização

A proposta começa por um MVP que funciona sem sensores, com leituras registadas manual-
mente. As funcionalidades que dependem de hardware ou de histórico de dados ﬁcam para
depois. A prioridade de cada linha pode ser alterada após a reunião com o cliente.

 Funcionalidade              Plataforma        Prioridade   Justiﬁcação

 Pedir orçamento ou visita   App (cliente)     Essencial    Contacto base com a empresa, sem
                                               (MVP)        dependências técnicas
Agendar manutenções          App (cliente)     Essencial    Valor imediato para o cliente e para
(manual)                                       (MVP)        a empresa
Estatísticas de leituras     App (cliente) e   Essencial    Mostra os dados de que as outras
                             dashboard         (MVP)        funcionalidades dependem
 Alertas (lembretes e        App (cliente) e   Essencial    Regras simples, sem necessidade de
 limites ﬁxos)               dashboard         (MVP)        sensores
 Orçamento em tempo real     App (vendedor)    Essencial    Requisito conﬁrmado: o vendedor
                                               (MVP)        faz o orçamento no local, com o
                                                            cliente
 Simulação da piscina com    App (vendedor)    Essencial    Requisito conﬁrmado e principal
 IA (foto do terreno)        e servidor        (MVP)        diferenciador. É o maior risco
                                                            técnico, por isso convém prototipar
                                                            cedo
 Agenda de serviços          App (técnico)     Essencial    Contrapartida do agendamento
                                               (MVP)        feito pelo cliente
 Registo de manutenção e     App (técnico)     Essencial    Fonte das leituras enquanto não
 de leituras                                   (MVP)        houver sensores, e base do histórico
                                                            de cada piscina
 Site institucional          Backoﬃce          Essencial    Apresenta a empresa, com esforço
                                               (MVP)        baixo
 Catálogo de materiais e     Backoﬃce          Essencial    Sem ele não há orçamento em
 preços                                        (MVP)        tempo real
 Clientes, piscinas,         Backoﬃce          Essencial    Alimenta a ﬁcha da piscina e a
 serviços e técnicos                           (MVP)        agenda dos técnicos
 Pedidos e chat              Backoﬃce          Essencial    Contrapartida dos pedidos feitos na
                                               (MVP)        app

 Chat                        App (cliente)     Desejável    Útil, mas exige deﬁnir quem
                                                            responde
 Estatísticas ﬁnanceiras     App (cliente) e   Desejável    Depende de a empresa
                             dashboard                      disponibilizar dados de faturação
 Estimativas de              App (cliente)     Desejável    Pode começar com regras simples,
 manutenções                                                antes de machine learning
 Agendamento automático      App (cliente)     Desejável    Depende das estimativas
 Integração com              App (cliente) e   Desejável    Usa uma API externa, com esforço
 meteorologia                servidor                       moderado
 Banner de promoções         App (cliente) e   Desejável    Primeira versão com regras
 com regras simples          backoﬃce                       deﬁnidas pela Guimagua (por
                                                            exemplo, cloro baixo leva a uma
                                                            promoção de cloro), antes do
                                                            algoritmo

                                                                     Continua na página seguinte




                                                 5

 Funcionalidade             Plataforma        Prioridade      Justiﬁcação

 Ficha da piscina           App (técnico)     Desejável       Depende de a empresa ter os dados
                                                              dos equipamentos de cada piscina
 Produtos e materiais       App (técnico)     Desejável       Alimenta as estatísticas ﬁnanceiras
 gastos                                                       e o controlo de stock
 Fotograﬁas, conﬁrmação e   App (técnico)     Desejável       Dá ao cliente prova do serviço feito
 relatório ao cliente
 Reportar avaria            App (técnico)     Desejável       Liga a manutenção a novos
                                                              orçamentos
 Modo oﬄine                 App (técnico e    Desejável       Necessário se não houver rede no
                            vendedor)                         terreno, mas com esforço técnico
                                                              elevado

 IoT: sensores e controlo   App (cliente) e   Futuro          Inclui leituras automáticas e
 de equipamentos            servidor                          controlo de luzes, cobertura e
                                                              outros equipamentos. Depende de
                                                              hardware compatível e de acesso a
                                                              equipamentos reais
 Machine learning com       Servidor          Futuro          Precisa de meses de histórico de
 leituras                                                     leituras
 Algoritmo inteligente de   Servidor          Futuro          Escolhe o banner a partir dos
 promoções                                                    consumos e das leituras de cada
                                                              cliente. Precisa de histórico desses
                                                              dados



9     Questões a validar com o cliente

As respostas a estas perguntas fecham o âmbito do MVP.

    □ A app destina-se só a clientes com piscinas construídas pela Guimagua, ou a qualquer
      proprietário?
    □ A Guimagua já instala sensores ou equipamentos controláveis à distância (luzes, cobertura
      automática, bomba)? Se sim, de que marca e com que protocolo comunicam?
    □ Sem sensores, quem regista as leituras: o cliente ou o técnico?
    □ Quantos técnicos tem a Guimagua, e como recebem e registam hoje o trabalho (papel,
      telefone, outra aplicação)?
    □ Cliente, vendedor e técnico usam a mesma app com perﬁs diferentes, ou apps separadas?
    □ Que informação ﬁnanceira o cliente deve ver: faturas, pagamentos ou apenas totais?
    □ Existe um catálogo de materiais com tabela de preços estruturada, que permita ao vendedor
      calcular o orçamento na hora?
    □ Que serviço de IA vai gerar a simulação a partir da foto do terreno, e com que custo por
      imagem e tempo de resposta aceitável?
    □ O vendedor usa telemóvel ou tablet? Há rede no terreno, ou a app tem de funcionar sem
      ligação?
    □ Que produtos entram nas promoções, e que dados de consumo de cada cliente existem
      (compras de produtos, faturas)?

                                                6

    □ Como se obtém o consentimento dos clientes para usar os seus consumos e leituras em
      promoções (RGPD)?
    □ Quem responde ao chat, e em que horário?

Depois da reunião, o passo seguinte é ﬁxar as prioridades na tabela acima e escrever as user
stories do MVP.


A     Quadro original

Fotograﬁa do quadro no ﬁm da sessão de brainstorming, com a coluna do cliente à esquerda e a
da Guimagua à direita.




               Figura 1: Quadro do brainstorming de 29 de setembro de 2026.




                                             7


```
