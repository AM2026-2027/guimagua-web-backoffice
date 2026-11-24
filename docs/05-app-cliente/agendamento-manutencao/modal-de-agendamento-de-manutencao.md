# Modal de agendamento de manutencao

> Convertido automaticamente de `modal-de-agendamento-de-manutencao.docx` (pandoc).

# Modal de Agendamento de Manutenção

## 1\. Especificação da UI / UX (Ecrã de Solicitação de Serviço)

O ecrã é acedido a partir do Dashboard do Cliente (botão rápido "Agendar Intervenção" ou "Solicitar Serviço").

Cabeçalho:

  - Título: Agendar Manutenção

  - Subtítulo: Selecione o tipo de serviço e a sua preferência de data e hora.

Campos do Formulário:

  - Seleção da Piscina (se aplicável - essencial B2B ou clientes com múltiplas piscinas):
    
      - Componente: Dropdown / Seletor de Cartões.
    
      - Opções: Ex: "Piscina Principal (Morada A)", "Piscina Interior (Morada B)".

  - Tipo de Serviço:
    
      - Componente: Lista de seleção em grelha ou dropdown com chips/ícones.
    
      - Opções MVP:
        
          - Limpeza de Filtro (Exemplo solicitado)
        
          - Ajuste de Parâmetros / Tratamento de Choque
        
          - Manutenção Preventiva Geral
        
          - Outro Serviço / Avarias

  - Data e Hora Preferenciais:
    
      - Data: DatePicker nativo (bloqueando dias passados e fins de semana/feriados, consoante a política da Guimágua).
    
      - TimeSlot (Período do dia): Seleção de janela horária para otimizar a rota dos técnicos:
        
          - Manhã (09:00 - 13:00)
        
          - Tarde (14:00 - 18:00)
        
          - Horário Flexível (Qualquer horário)

  - Observações / Notas Adicionais:
    
      - Componente: Textarea (Multiline).
    
      - Placeholder: Ex: Portão traseiro aberto, cão no quintal, atenção ao nível de água...

  - Anexo de Fotografia (Opcional):
    
      - Componente: Botão de câmara/galeria ("Adicionar Foto do Estado da Piscina"). Útil para o técnico avaliar antecipadamente se precisa de levar produtos específicos.

  - Ações:
    
      - Botão Principal: Submeter Pedido de Agendamento (Ativo apenas quando a Piscina, o Serviço e a Data/Hora estão preenchidos).

## 2\. Comportamento e Regras de Negócio (Fase 1)

  - Estado Inicial do Pedido: Quando o cliente submete, o pedido entra automaticamente com o estado Pendente de Confirmação no sistema da Guimágua.

  - Notificações: O cliente recebe uma confirmação visual imediata na app ("Pedido submetido com sucesso. A Guimágua irá confirmar a data brevemente"). No painel da empresa, gera-se uma notificação para o gestor de operações atribuir o técnico.

  - Resiliência Offline: Se o cliente estiver sem rede ao submeter, a app guarda o pedido localmente (SQLite/WatermelonDB) e sincroniza automaticamente assim que houver conectividade.

## 3\. Estrutura do Payload (API Endpoint)

Pedido (POST /api/v1/maintenance/requests)

JSON

{

"pool\_id": "pool\_uuid\_987654",

"service\_type": "filter\_cleaning",

"preferred\_date": "2026-06-15",

"preferred\_timeslot": "morning", // "morning", "afternoon", "flexible"

"notes": "Portão lateral aberto para acesso à casa de máquinas.",

"attachment\_url": "https://storage.guimagua.pt/uploads/pool\_123.jpg" // Opcional

}

Resposta Padrão (201 Created)

JSON

{

"success": true,

"request\_id": "req\_uuid\_123456",

"status": "pending\_confirmation",

"message": "Pedido de agendamento registado com sucesso."

}
