# Guia de Teste de Webhooks ASAAS

## Visão Geral

Este guia explica como testar webhooks do ASAAS em ambiente de desenvolvimento local usando ngrok para expor o localhost.

## Pré-requisitos

1. **Chaves de API ASAAS** configuradas no `.env`:
   - `ASAAS_API_KEY_SANDBOX`
   - `ASAAS_API_KEY_PRODUCTION`

2. **ngrok** instalado e configurado
3. **Servidor API** rodando na porta 3002

## Passo a Passo

### 1. Iniciar o Servidor

```bash
# Definir DATABASE_URL
export DATABASE_URL='postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech/uaizouklp?sslmode=require'

# Iniciar servidor
cd api && node index.js
```

### 2. Configurar ngrok

```bash
# Instalar ngrok (se não tiver)
# macOS: brew install ngrok
# Linux: snap install ngrok
# Windows: Baixar de https://ngrok.com/download

# Configurar autenticação (primeira vez)
ngrok config add-authtoken SEU_TOKEN_NGROK

# Iniciar ngrok
ngrok http 3002
```

### 3. Usar Scripts Automatizados

#### Opção A: Script Completo
```bash
# Executar script que configura tudo automaticamente
./setup-webhook-testing.sh
```

#### Opção B: Script de Gerenciamento
```bash
# Listar webhooks existentes
./manage-asaas-webhooks.sh list sandbox

# Criar novo webhook
./manage-asaas-webhooks.sh create sandbox

# Testar webhook
./manage-asaas-webhooks.sh test sandbox

# Deletar webhook
./manage-asaas-webhooks.sh delete wh_123 sandbox
```

### 4. Configuração Manual

#### Obter URL do ngrok
```bash
# Verificar URL pública
curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'
```

#### Criar Webhook via API
```bash
curl -X POST "http://localhost:3002/api/asaas/webhooks" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-ngrok-url.ngrok.io/api/webhooks/asaas",
    "name": "Uaizouk Webhook Local",
    "email": "seu-email@exemplo.com",
    "environment": "sandbox"
  }'
```

#### Listar Webhooks
```bash
curl "http://localhost:3002/api/asaas/webhooks?environment=sandbox"
```

#### Testar Webhook Manualmente
```bash
curl -X POST "https://seu-ngrok-url.ngrok.io/api/webhooks/asaas" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_123",
      "status": "RECEIVED",
      "value": 350.00,
      "customer": {
        "cpfCnpj": "555.509.130-38",
        "email": "maxmaxparcelado222@yopmail.com"
      }
    }
  }'
```

## Endpoints Disponíveis

### Gerenciamento de Webhooks
- `POST /api/asaas/webhooks` - Criar webhook
- `GET /api/asaas/webhooks` - Listar webhooks
- `DELETE /api/asaas/webhooks/:id` - Deletar webhook

### Recebimento de Webhooks
- `POST /api/webhooks/asaas` - Endpoint que recebe webhooks do ASAAS

### Gerenciamento de Registros
- `PUT /api/registrations/:id/asaas-payment-id` - Atualizar payment ID
- `GET /api/registrations` - Listar registros (inclui asaas_payment_id)

## Eventos Suportados

O webhook está configurado para receber os seguintes eventos:

- `PAYMENT_CREATED` - Criação de nova cobrança
- `PAYMENT_RECEIVED` - Pagamento recebido
- `PAYMENT_CONFIRMED` - Pagamento confirmado
- `PAYMENT_OVERDUE` - Pagamento em atraso
- `PAYMENT_REFUNDED` - Pagamento estornado
- `PAYMENT_PARTIALLY_REFUNDED` - Pagamento parcialmente estornado
- `PAYMENT_CHARGEBACK_REQUESTED` - Chargeback solicitado
- `PAYMENT_CHARGEBACK_DISPUTE` - Chargeback em disputa
- `PAYMENT_AWAITING_CHARGEBACK_REVERSAL` - Aguardando reversão
- `PAYMENT_ANTICIPATED` - Pagamento antecipado
- `PAYMENT_DELETED` - Cobrança deletada
- `PAYMENT_RESTORED` - Cobrança restaurada
- `PAYMENT_UPDATED` - Cobrança atualizada
- `PAYMENT_AUTHORIZED` - Pagamento autorizado
- `PAYMENT_APPROVED_BY_RISK_ANALYSIS` - Aprovado por análise de risco
- `PAYMENT_REPROVED_BY_RISK_ANALYSIS` - Reprovado por análise de risco
- `PAYMENT_AWAITING_RISK_ANALYSIS` - Aguardando análise de risco

## Mapeamento de Status

| Evento ASAAS | Status Sistema | Descrição |
|--------------|----------------|-----------|
| `PAYMENT_RECEIVED` | `paid` | Pagamento recebido |
| `PAYMENT_CONFIRMED` | `paid` | Pagamento confirmado |
| `PAYMENT_OVERDUE` | `overdue` | Pagamento em atraso |
| `PAYMENT_REFUNDED` | `refunded` | Pagamento estornado |
| `PAYMENT_PARTIALLY_REFUNDED` | `refunded` | Pagamento parcialmente estornado |
| `CHARGEBACK_*` | `chargeback` | Chargeback em andamento |
| `PAYMENT_PENDING` | `pending` | Aguardando pagamento |

## Identificação de Registros

O sistema tenta encontrar registros na seguinte ordem:

1. **Por ASAAS Payment ID** (mais confiável)
   - Campo: `asaas_payment_id` na tabela

2. **Por External Reference**
   - Campo: `externalReference` no webhook

3. **Por CPF do Cliente**
   - Campo: `customer.cpfCnpj` no webhook

4. **Por Email do Cliente**
   - Campo: `customer.email` no webhook

## Logs e Monitoramento

O sistema registra todas as atividades:

```
🔔 ASAAS Webhook received: PAYMENT_RECEIVED
💳 Payment ID: pay_123456789
💰 Amount: 350.00
📊 Status: RECEIVED
✅ Updated registration 17: João Silva (joao@example.com) -> paid
📝 Webhook Event: PAYMENT_RECEIVED | Payment: pay_123456789 | Registration: 17 | Status: paid
```

## Troubleshooting

### Webhook não recebe eventos
1. Verificar se ngrok está rodando
2. Confirmar URL do webhook no ASAAS
3. Verificar logs do servidor
4. Testar webhook manualmente

### Registro não encontrado
1. Verificar se `asaas_payment_id` está configurado
2. Confirmar CPF/email no webhook
3. Verificar se registro existe no banco

### Erro de API Key
1. Verificar se chaves estão no `.env`
2. Confirmar ambiente (sandbox/production)
3. Verificar se servidor foi reiniciado após mudanças

## Exemplo Completo

```bash
# 1. Iniciar servidor
export DATABASE_URL='sua_url_aqui'
cd api && node index.js &

# 2. Iniciar ngrok
ngrok http 3002

# 3. Obter URL (exemplo: https://abc123.ngrok.io)
NGROK_URL="https://abc123.ngrok.io"

# 4. Criar webhook
curl -X POST "http://localhost:3002/api/asaas/webhooks" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$NGROK_URL/api/webhooks/asaas\",
    \"name\": \"Uaizouk Webhook Local\",
    \"email\": \"seu-email@exemplo.com\",
    \"environment\": \"sandbox\"
  }"

# 5. Testar webhook
curl -X POST "$NGROK_URL/api/webhooks/asaas" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test_123",
      "status": "RECEIVED",
      "value": 350.00,
      "customer": {
        "cpfCnpj": "555.509.130-38",
        "email": "maxmaxparcelado222@yopmail.com"
      }
    }
  }'

# 6. Verificar se status foi atualizado
curl "http://localhost:3002/api/registrations" | jq '.[] | select(.id == 17) | {id, fullName, paymentStatus}'
```

## Próximos Passos

1. **Configurar webhook no ASAAS** usando a URL do ngrok
2. **Testar com pagamentos reais** no sandbox
3. **Monitorar logs** para verificar funcionamento
4. **Configurar para produção** quando estiver pronto
5. **Implementar alertas** para falhas de webhook
