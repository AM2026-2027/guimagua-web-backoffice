# Dicionario dados regras validacao

> Texto extraído automaticamente de `dicionario-dados-regras-validacao.pdf` (pdftotext). Tabelas podem ter perdido formatação; em caso de dúvida consultar o PDF original.

```text
GUIMÁGUA — DOCUMENTAÇÃO DE ENGENHARIA
Dicionário de Dados e Regras de Validação
Definição das entidades, tipos de dados, restrições de integridade e validações aplicadas ao modelo de
dados do ecossistema.

 Entidade / Coleção                                Domínio Funcional                                      Atributos
 1. Clientes                                       Perfis e contactos de clientes                             5
 2. Piscinas                                       Instalações e equipamentos associados                      5
 3. Técnicos                                       Colaboradores, viaturas e aptidões                         5
 4. Catálogo_Consumíveis                           Materiais, preços e stock físico                           5
 5. Catálogo_Serviços                              Tipologias de intervenção e checklists                     4
 6. Agendamentos                                   Planeamento e ciclo de vida de visitas                     5
 7. Leituras_Piscina                               Parâmetros físico-químicos registados                      5
 8. Pedidos_APP                                    Pedidos de orçamento e assistência                         5
 Total Geral (8 Entidades)                                                                                   39

1. Clientes
 Atributo                 Tipo               Regra de Validação                     Descrição
 nome_completo            String             min_length: 3,                         Nome ou designação social do
                                             max_length: 100                        cliente.
 email                    String             ^[a-zA-Z0-9._%+-]+@[a-                 Endereço de email (garantia de
                                             zA-Z0-9.-]+\.[a-zA-Z]                  unicidade no backend).
                                             {2,}$

 telefone                 String             ^(?:\+351\s?)?                         Formato português obrigatório
                                             (?:9[1236]\d{7}|2\d{8})$               (+351 opcional, seguido de 9
                                                                                    dígitos válidos móvel ou fixo).
 nif                      String             ^\d{9}$                                Exatamente 9 dígitos numéricos.
 estado                   String             ENUM: ['ativo',                        Prevenção de eliminação de
                                             'inativo']                             registos (soft delete).




Guimágua — Dicionário de Dados e Regras de Validação                                                          Page 1 of 4

2. Piscinas
 Atributo                 Tipo               Regra de Validação       Descrição
 cliente_id               Ref (String)       NOT NULL, existente em   Chave estrangeira lógica para o
                                             clientes                 cliente.
 morada_local             String             min_length: 10           Localização física da instalação.
 dimensoes                String             ^\d+(\.\d+)?\s*x\s*\d+   Formato LxP (ex: 12x5 ou
                                             (\.\d+)?$                10.5x4).
 volume_m3                Number             > 0                      Volume de água em metros
                                                                      cúbicos estritamente positivo.
 equipamentos             Array              length >= 0              Lista de IDs ou descrições dos
                                                                      equipamentos instalados.

3. Técnicos
 Atributo                 Tipo               Regra de Validação       Descrição
 nome                     String             min_length: 3            Nome do colaborador.
 email                    String             ^[a-zA-Z0-9._%+-]+@[a-   Utilizado para Firebase Auth.
                                             zA-Z0-9.-]+\.[a-zA-Z]
                                             {2,}$

 telefone                 String             ^(?:\+351\s?)?           Apenas números móveis válidos
                                             (?:9[1236]\d{7})$        em Portugal.
 viatura                  String             ^[A-Z0-9]{2}-[A-Z0-9]    Formato padrão de matrícula
                                             {2}-[A-Z0-9]{2}$         portuguesa.
 aptidoes                 Array              length > 0               Mapeamento das tipologias de
                                                                      serviço habilitadas.

4. Catálogo_Consumíveis
 Atributo                 Tipo               Regra de Validação       Descrição
 sku                      String             ^[A-Z0-9-]+$             Identificador único alfanumérico
                                                                      sem espaços (ex: CR-PH-001).
 nome                     String             min_length: 3            Designação do produto.
 preco_unitario           Number             >= 0                     Custo em euros (aceita 0 para
                                                                      ofertas/serviços incluídos).
 stock_fisico             Integer            >= 0                     Quantidade real em armazém
                                                                      (não pode ser negativa).

Guimágua — Dicionário de Dados e Regras de Validação                                            Page 2 of 4

 Atributo                 Tipo               Regra de Validação         Descrição
 estado                   String             ENUM: ['ativo',            Controlo de inativação sem
                                             'oculto']                  impacto no histórico.

5. Catálogo_Serviços
 Atributo                 Tipo               Regra de Validação         Descrição
 titulo                   String             min_length: 5              Nome da intervenção (ex:
                                                                        Tratamento Químico).
 duracao_minutos          Integer            >= 15, <= 480              Tempo estimado por defeito (entre
                                                                        15 min e 8 horas).
 checklist                Array              length > 0                 Lista sequencial de passos a
                                                                        realizar.
 produtos_base            Array              Pode ser vazio             Lista de SKU de consumíveis
                                                                        predefinidos.

6. Agendamentos
 Atributo                 Tipo               Regra de Validação         Descrição
 cliente_id               Ref (String)       NOT NULL                   Referência ao cliente.
 tecnico_id               Ref (String)       NOT NULL                   Referência ao técnico alocado.
 data_inicio              Timestamp          > Data Atual (na           Momento do início previsto.
                                             criação)

 data_fim                 Timestamp          > data_inicio              Momento de conclusão previsto.
 estado                   String             ENUM: ['pendente',         Ciclo de vida da intervenção.
                                             'em_curso', 'concluido']


7. Leituras_Piscina
 Atributo                 Tipo               Regra de Validação         Descrição
 agendamento_id           Ref (String)       NOT NULL                   Ligação à intervenção de origem.
 ph                       Number             >= 6.8 e <= 8.2            Nível de acidez/alcalinidade da
                          (Float)                                       água. Fora destes limites levanta
                                                                        erro de integridade.
 cloro_livre              Number             >= 0.5 e <= 3.0            Concentração em partes por
                          (Float)                                       milhão (ppm).



Guimágua — Dicionário de Dados e Regras de Validação                                             Page 3 of 4

 Atributo                 Tipo               Regra de Validação    Descrição
 temperatura              Number             >= 0.0 e <= 45.0      Registo térmico da água em
                          (Float)                                  graus Celsius (°C).
 data_leitura             Timestamp          NOT NULL              Data/hora exata do registo na App
                                                                   Móvel.

8. Pedidos_APP
 Atributo                 Tipo               Regra de Validação    Descrição
 cliente_id               Ref (String)       NOT NULL              Quem originou o pedido.
 tipo_pedido              String             ENUM: ['orcamento',   Classificação do suporte pedido.
                                             'visita']

 descricao                String             min_length: 10,       Explicação textual da avaria ou
                                             max_length: 1000      necessidade.
 fotos                    Array              Máximo 5 itens        Links diretos para os objetos no
                                                                   Firebase Storage.
 estado                   String             ENUM: ['pendente',    Controlo de triagem no backoffice.
                                             'em_analise',
                                             'respondido']




Guimágua — Dicionário de Dados e Regras de Validação                                         Page 4 of 4


```
