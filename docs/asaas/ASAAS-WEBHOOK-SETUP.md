# Configuração do Webhook ASAAS

## Visão Geral

O sistema agora suporta webhooks do ASAAS para atualização automática do status de pagamento das inscrições. Quando o ASAAS notifica sobre mudanças no status de um pagamento, nosso sistema automaticamente atualiza o registro correspondente.

## Endpoint do Webhook

```
POST /api/webhooks/asaas
```

## Configuração no ASAAS

### 1. Acesse o Painel ASAAS
- Faça login no painel do ASAAS
- Vá para **Configurações** > **Webhooks**

### 2. Configure o Webhook
- **URL**: `https://seu-dominio.com/api/webhooks/asaas`
- **Eventos**: Selecione os eventos que deseja receber:
  - `PAYMENT_CREATED` - Criação de nova cobrança
  - `PAYMENT_RECEIVED` - Pagamento recebido
  - `PAYMENT_CONFIRMED` - Pagamento confirmado
  - `PAYMENT_OVERDUE` - Pagamento em atraso
  - `PAYMENT_REFUNDED` - Pagamento estornado
  - `PAYMENT_PARTIALLY_REFUNDED` - Pagamento parcialmente estornado
  - `PAYMENT_CHARGEBACK_REQUESTED` - Chargeback solicitado
  - `PAYMENT_CHARGEBACK_DISPUTE` - Chargeback em disputa
  - `PAYMENT_AWAITING_CHARGEBACK_REVERSAL` - Aguardando reversão de chargeback

### 3. Ambiente de Desenvolvimento
Para desenvolvimento local, use uma ferramenta como ngrok:
```bash
ngrok http 3002
```
Use a URL do ngrok: `https://seu-ngrok-url.ngrok.io/api/webhooks/asaas`

## Mapeamento de Status

| Status ASAAS | Status Sistema | Descrição |
|--------------|----------------|-----------|
| `PENDING` | `pending` | Aguardando pagamento |
| `RECEIVED` | `paid` | Pagamento recebido |
| `CONFIRMED` | `paid` | Pagamento confirmado |
| `OVERDUE` | `overdue` | Pagamento em atraso |
| `REFUNDED` | `refunded` | Pagamento estornado |
| `PARTIALLY_REFUNDED` | `refunded` | Pagamento parcialmente estornado |
| `RECEIVED_IN_CASH` | `paid` | Recebido em dinheiro |
| `CHARGEBACK_REQUESTED` | `chargeback` | Chargeback solicitado |
| `CHARGEBACK_DISPUTE` | `chargeback` | Chargeback em disputa |
| `AWAITING_CHARGEBACK_REVERSAL` | `chargeback` | Aguardando reversão |

## Identificação de Registros

O sistema tenta encontrar o registro correspondente na seguinte ordem:

1. **Por ASAAS Payment ID** (mais confiável)
   - Campo: `asaas_payment_id` na tabela `event_registrations`

2. **Por External Reference**
   - Campo: `externalReference` no webhook (se configurado)

3. **Por CPF do Cliente**
   - Campo: `customer.cpfCnpj` no webhook

4. **Por Email do Cliente**
   - Campo: `customer.email` no webhook

## Endpoints Relacionados

### Atualizar ASAAS Payment ID
```
PUT /api/registrations/:id/asaas-payment-id
```

**Body:**
```json
{
  "asaasPaymentId": "pay_123456789"
}
```

### Criar Registro com ASAAS Payment ID
```
POST /api/registrations
```

**Body:**
```json
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678901",
  "asaasPaymentId": "pay_123456789",
  // ... outros campos
}
```

## Logs e Monitoramento

O sistema registra todas as atividades do webhook:

```
🔔 ASAAS Webhook received: PAYMENT_RECEIVED
💳 Payment ID: pay_123456789
💰 Amount: 350.00
📊 Status: RECEIVED
✅ Updated registration 17: João Silva (joao@example.com) -> paid
📝 Webhook Event: PAYMENT_RECEIVED | Payment: pay_123456789 | Registration: 17 | Status: paid
```

## Tratamento de Erros

- **Webhook inválido**: Retorna 400 com erro
- **Registro não encontrado**: Log de aviso, mas retorna 200
- **Erro interno**: Log de erro, mas retorna 200 para evitar retries

## Segurança

- O webhook sempre retorna 200 para evitar retries desnecessários
- Logs detalhados para auditoria
- Validação de dados recebidos
- Mapeamento seguro de status

## Testando o Webhook

### Teste Manual
```bash
curl -X POST "http://localhost:3002/api/webhooks/asaas" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_123",
      "status": "RECEIVED",
      "value": 350.00,
      "customer": {
        "cpfCnpj": "12345678901",
        "email": "joao@example.com"
      }
    }
  }'
```

### Resposta Esperada
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "event": "PAYMENT_RECEIVED",
  "paymentId": "pay_test_123",
  "registrationId": 17,
  "newStatus": "paid"
}
```

## Fluxo Completo

1. **Cliente faz inscrição** → Sistema cria registro
2. **Sistema cria cobrança no ASAAS** → ASAAS retorna payment ID
3. **Sistema atualiza registro** com `asaas_payment_id`
4. **Cliente paga** → ASAAS processa pagamento
5. **ASAAS envia webhook** → Sistema atualiza status automaticamente
6. **Painel admin** → Status atualizado em tempo real

## Troubleshooting

### Webhook não está funcionando
1. Verifique se a URL está correta
2. Confirme se o servidor está rodando
3. Verifique os logs do servidor
4. Teste com curl manualmente

### Registro não encontrado
1. Verifique se o `asaas_payment_id` está configurado
2. Confirme se o CPF/email está correto
3. Verifique se o registro existe no banco

### Status não atualiza
1. Verifique o mapeamento de status
2. Confirme se o webhook está sendo recebido
3. Verifique os logs para erros
