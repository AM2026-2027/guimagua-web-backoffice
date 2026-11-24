# Fluxo de interacao e passos do modal de checkout

> Convertido automaticamente de `fluxo-de-interacao-e-passos-do-modal-de-checkout.docx` (pandoc).

# Fluxo de Interação e Passos do Modal de Checkout

O modal é acionado diretamente a partir de um alerta de parâmetros (ex: botão "Comprar Recomendado" no card de aviso) ou pela loja de consumíveis da app.

\[ Alerta de Parâmetro / Loja \]

│

▼ (Clica em "Comprar Rapidamente")

\[ 1. Modal: Resumo do Carrinho \] ──(Altera Quantidades / Confirma)

│

▼

\[ 2. Morada e Método de Envio \] ──(Entrega ao Domicílio vs Recolha na Guimágua - Ponte)

│

▼

\[ 3. Método de Pagamento \] ──────(MB Way / Multibanco / Cartão / Conta Corrente B2B)

│

▼ (Submeter Encomenda)

\[ 4. Estado de Confirmação \] ────(Referência de Encomenda + Seguir Estado)

## 1\. Especificação da UI / Componentes (Passo a Passo)

### Ecrã 1: Resumo do Carrinho / Produto Sugerido

  - Cabeçalho do Modal: Compra Rápida de Consumíveis (com botão de fechar X).

  - Lista de Itens:
    
      - Imagem do produto, Nome (ex: Cloro Rápido Granulado 5kg), Preço unitário.
    
      - Seletor de quantidade (+ / -).

  - Resumo de Custos:
    
      - Subtotal dos produtos.
    
      - Portes de envio (ou Grátis para recolha nas instalações da Guimágua em Ponte).
    
      - Total a Pagar.

### Ecrã 2: Morada de Entrega e Opção de Recolha

  - Seletor de Opção de Obtenção:
    
      - Entrega na Morada Registada (Usa a morada principal da piscina ou perfil).
    
      - Recolha em Loja - Guimágua (Ponte, Guimarães) (Sem custos de envio).

  - Se a entrega ao domicílio for selecionada, exibe um resumo da morada com opção de editar ou adicionar notas de entrega (ex: "Deixar à entrada da garagem").

### Ecrã 3: Método de Pagamento (Foco no mercado nacional / B2B)

  - Opções de Pagamento:
    
      - MB Way (Introdução do número de telemóvel para notificação imediata).
    
      - Referência Multibanco (Geração de entidade, referência e montante).
    
      - Cartão de Crédito / Débito (Apple Pay / Google Pay / Stripe).
    
      - Faturar em Conta Corrente (Exclusivo para clientes B2B com contrato ativo).

### Ecrã 4: Confirmação de Sucesso

  - Ícone: Ícone de sucesso animado (Check verde).

  - Mensagem: Encomenda \#GW-2026-849 registada com sucesso\!

  - Detalhes: Informação sobre o prazo estimado de entrega ou aviso de que está pronta para recolha.

  - Ação: Botão Ver Estado da Encomenda ou Voltar ao Dashboard.

3\. Estrutura do Payload (API Endpoint)

Pedido (POST /api/v1/checkout/orders)

JSON

{

"customer\_id": "cust\_uuid\_123456",

"pool\_id": "pool\_uuid\_987654",

"items": \[

{

"product\_id": "prod\_cloro\_5kg",

"quantity": 1,

"unit\_price": 24.50

}

\],

"fulfillment\_method": "delivery", // ou "store\_pickup"

"shipping\_address": {

"street": "Rua das Pias, 45",

"postal\_code": "4805-000",

"city": "Ponte, Guimarães",

"notes": "Deixar na portaria."

},

"payment\_method": "mbway", // "mbway", "multibanco", "card", "b2b\_account"

"payment\_details": {

"phone\_number": "+351912345678" // Específico para MB Way

}

}

Resposta Padrão (201 Created)

JSON

{

"success": true,

"order\_id": "ord\_uuid\_987654",

"order\_number": "GW-2026-849",

"total\_amount": 24.50,

"status": "pending\_payment",

"payment\_reference\_data": {

"entity": null,

"reference": null,

"mbway\_status": "pending\_approval"

},

"message": "Encomenda criada com sucesso. Por favor, aprove o pagamento por MB Way."

}
