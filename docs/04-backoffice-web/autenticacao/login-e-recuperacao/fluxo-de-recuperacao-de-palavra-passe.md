# Fluxo de recuperacao de palavra passe

> Convertido automaticamente de `fluxo-de-recuperacao-de-palavra-passe.docx` (pandoc).

# Fluxo de Recuperação de Palavra Passe

1\. Especificação da UI / Componentes (UX & Layout)

## Ecrã 1: Introdução do E-mail

Cabeçalho:

  - Título: Recuperar Palavra-passe

  - Subtítulo: Introduza o e-mail associado à sua conta Guimágua para receber as instruções de redefinição.

  - Botão Fechar (X no canto superior direito ou gesto de swipe-down em mobile).

Campo de Input:

  - Label: E-mail

  - Placeholder: exemplo@email.com

  - Tipo de teclado: email-address (com autocompletar e correção desativada).

  - Ícone à esquerda: Ícone de envelope (Mail).

  - Validação Inline: Mensagem de erro sob o campo caso o formato seja inválido (ex.: "Por favor, introduza um e-mail válido.").

Ações:

  - Botão Principal: Enviar Instruções (desativado até o e-mail ter um formato válido).

  - Botão Secundário / Link: Voltar ao Login.

## Ecrã 2: Confirmação de Envio (Estado de Sucesso)

  - Para prevenir User Enumeration (ataques de enumeração de contas por razões de segurança/RGPD), a mensagem deve confirmar o envio sem explicitar categoricamente se o e-mail existe ou não na base de dados.

  - Ilustração / Ícone: Ícone de confirmação/sucesso (ex.: Envelope com um visto verde).

  - Título: Verifique a sua caixa de entrada

  - Texto Informativo:
    
      - Se o e-mail \[utilizador@dominio.com\] estiver registado na plataforma Guimágua, enviámos um hiperligação com as instruções para redefinir a sua palavra-passe.

  - Dicas Adicionais:
    
      - Não recebeu o e-mail? Verifique a pasta de Spam/Lixo Eletrónico.

  - Ações:

  - Botão Contador (Reenvio): Reenviar e-mail em 60s (desativado temporariamente com cronómetro para evitar spam de pedidos).

  - Botão Concluir: Voltar ao Login.

## 2\. Comportamento Técnico & Requisitos de Segurança

A. Validação e Segurança

  - Prevenção de User Enumeration: A resposta da API para o cliente deve ser idêntica (ex.: HTTP 200 OK com mensagem genérica) quer o e-mail exista na base de dados quer não.

  - Rate Limiting: Limite de 3 pedidos por IP/E-mail a cada 15 minutos para evitar abuso da API de envio de e-mails (Transactional Emails via SendGrid/AWS SES/Resend).

  - Validade do Token de Redefinição: O link enviado por e-mail deve expirar em 15 a 30 minutos e ser de utilização única (single-use token).

B. Gestão de Estado Offline / Conectividade

  - Como a app da Guimágua prevê utilização em locais com fraca cobertura de rede (ex.: casas de máquinas ou terrenos afastados):

  - Se a app estiver sem acesso à internet ao clicar em Enviar Instruções:

  - Exibir Banner/Toast de aviso: "Sem ligação à internet. Ligue-se a uma rede para solicitar a redefinição."

  - Impedir a submissão até que o estado de rede volte a estar online.

## 3\. Estrutura do Payload (API Endpoint)

Pedido (POST /api/v1/auth/forgot-password)

JSON

{

"email": "cliente@exemplo.pt",

"client\_app": "customer" // ou "staff" (para diferenciar os templates de e-mail se necessário)

}

Resposta Padrão (200 OK)

JSON

{

"success": true,

"message": "Se o e-mail estiver registado, as instruções de redefinição foram enviadas."

}
