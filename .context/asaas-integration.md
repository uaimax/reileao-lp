# Integração ASAAS

## Visão Geral

Integração com a API do ASAAS para processamento de pagamentos via PIX e cartão de crédito, com suporte a parcelamento e alternância entre ambientes sandbox e produção.

## Configuração

### Variáveis de Ambiente

```bash
# Chaves da API
ASAAS_API_KEY_SANDBOX=your_sandbox_key_here
ASAAS_API_KEY_PRODUCTION=your_production_key_here

# Controle de ambiente
ASAAS_SANDBOX=true  # true para sandbox, false para produção
```

### URLs da API

- **Sandbox**: `https://api-sandbox.asaas.com/v3/checkouts`
- **Produção**: `https://api.asaas.com/v3/checkouts`

## Fluxo de Pagamento

### 1. Criação da Inscrição
```javascript
// Usuário preenche formulário
const registration = await apiClient.createRegistration({
  event_id: 1,
  full_name: "João Silva",
  email: "joao@example.com",
  // ... outros campos
  payment_method: "pix",
  total: 551.95
});
```

### 2. Criação do Checkout
```javascript
// Sistema cria checkout ASAAS
const checkout = await apiClient.createCheckout(registration.id);
```

### 3. Redirecionamento
```javascript
// Usuário é redirecionado para ASAAS
window.location.href = checkout.checkout.link;
```

### 4. Retorno
```javascript
// Após pagamento, usuário retorna para confirmação
// URL: https://uaizouk.com/inscricao/confirmacao/{id}
```

## Estrutura do Payload

### Payload Completo para ASAAS

```json
{
  "billingTypes": ["PIX", "CREDIT_CARD"],
  "chargeTypes": ["DETACHED", "INSTALLMENT"],
  "minutesToExpire": 30,
  "externalReference": "registration-15",
  "callback": {
    "successUrl": "https://uaizouk.com/inscricao/confirmacao/15",
    "cancelUrl": "https://uaizouk.com/inscricao",
    "expiredUrl": "https://uaizouk.com/inscricao"
  },
  "items": [
    {
      "externalReference": "ticket-15",
      "name": "Inscrição UAIZOUK",
      "description": "Inscrição para UAIZOUK - Individual + Camiseta: G, Combo Alimentação: Sim - PIX à Vista",
      "quantity": 1,
      "value": 551.95
    }
  ],
  "customerData": {
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "11999999999",
    "cpfCnpj": "11144477735",
    "address": "Endereço não informado",
    "addressNumber": "0",
    "postalCode": "01310100",
    "province": "SP"
  }
}
```

### Campos Obrigatórios

#### billingTypes
- `["PIX"]` - Apenas PIX
- `["CREDIT_CARD"]` - Apenas cartão
- `["PIX", "CREDIT_CARD"]` - Ambos

#### chargeTypes
- `["DETACHED"]` - Pagamento à vista
- `["DETACHED", "INSTALLMENT"]` - Pagamento parcelado

#### customerData
- `name`: Nome completo
- `email`: Email válido
- `phone`: Telefone no formato nacional (ex: "11999999999")
- `cpfCnpj`: CPF ou CNPJ válido
- `address`: Endereço (obrigatório para cartão)
- `addressNumber`: Número do endereço (obrigatório para cartão)
- `postalCode`: CEP (obrigatório para cartão)
- `province`: Estado (obrigatório para cartão)

## Lógica de Negócio

### Determinação do Ambiente

```javascript
const isSandbox = process.env.ASAAS_SANDBOX === 'true';
const asaasApiKey = isSandbox ? 
  process.env.ASAAS_API_KEY_SANDBOX : 
  process.env.ASAAS_API_KEY_PRODUCTION;
const asaasUrl = isSandbox ? 
  'https://api-sandbox.asaas.com/v3/checkouts' : 
  'https://api.asaas.com/v3/checkouts';
```

### Cálculo de Parcelas

```javascript
const calculateMaxInstallments = (dueDateLimit) => {
  if (!dueDateLimit) return 1;
  
  const today = new Date();
  const limitDate = new Date(dueDateLimit);
  
  // Calcula diferença em meses
  const monthsDiff = (limitDate.getFullYear() - today.getFullYear()) * 12 + 
                    (limitDate.getMonth() - today.getMonth());
  
  // Margem de segurança de 1 mês
  const maxInstallments = Math.max(1, monthsDiff - 1);
  
  // Máximo de 12 parcelas
  return Math.min(maxInstallments, 12);
};
```

### Aplicação de Taxas

```javascript
const calculateFinalTotal = (baseTotal, paymentMethod) => {
  const { pixDiscountPercentage = 5, creditCardFeePercentage = 5 } = config.paymentSettings;
  
  if (paymentMethod === 'pix') {
    // PIX à vista: sem taxa do sistema (desconto)
    return baseTotal * (1 - pixDiscountPercentage / 100);
  } else if (paymentMethod === 'pix_installment') {
    // PIX parcelado: com taxa do sistema
    return baseTotal * (1 + creditCardFeePercentage / 100);
  } else if (paymentMethod === 'credit_card') {
    // Cartão: com taxa do sistema
    return baseTotal * (1 + creditCardFeePercentage / 100);
  }
  
  return baseTotal;
};
```

## Tratamento de Erros

### Erros Comuns

#### 1. Campo phoneNumber obrigatório
```json
{
  "errors": [
    {
      "code": "invalid_object",
      "description": "O campo phoneNumber deve ser informado."
    }
  ]
}
```

**Solução**: Usar campo `phone` (não `phoneNumber`) com formato nacional.

#### 2. Chave PIX não configurada
```json
{
  "errors": [
    {
      "code": "invalid_object",
      "description": "Para gerar cobranças com Pix é necessário criar uma chave Pix no Asaas."
    }
  ]
}
```

**Solução**: Configurar chave PIX no painel ASAAS.

#### 3. Parcelamento sem INSTALLMENT
```json
{
  "errors": [
    {
      "code": "invalid_object",
      "description": "O tipo de cobrança DETACHED deve ser informado junto com o tipo de cobrança INSTALLMENT"
    }
  ]
}
```

**Solução**: Incluir ambos `DETACHED` e `INSTALLMENT` para parcelamento.

### Tratamento no Código

```javascript
try {
  const asaasResponse = await fetch(asaasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    },
    body: JSON.stringify(asaasPayload)
  });

  const asaasData = await asaasResponse.json();

  if (!asaasResponse.ok) {
    console.error('ASAAS API Error:', asaasData);
    return res.status(400).json({
      error: 'Erro ao criar checkout ASAAS',
      details: asaasData.errors?.[0]?.description || 'Erro desconhecido'
    });
  }

  // Sucesso
  res.json({
    success: true,
    checkout: asaasData,
    message: 'Checkout ASAAS criado com sucesso'
  });

} catch (error) {
  console.error('Error creating ASAAS checkout:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: error.message
  });
}
```

## Configuração de Produção

### 1. Chave PIX
- Acessar painel ASAAS
- Configurar chave PIX
- Testar com valor baixo

### 2. Webhooks (Opcional)
```javascript
// Endpoint para receber notificações
app.post('/api/webhooks/asaas', (req, res) => {
  const { event, payment } = req.body;
  
  if (event === 'PAYMENT_CONFIRMED') {
    // Atualizar status da inscrição
    // Enviar email de confirmação
  }
  
  res.status(200).json({ received: true });
});
```

### 3. Monitoramento
- Logs de transações
- Alertas de falhas
- Dashboard de conversão

## Testes

### Sandbox
```bash
# Testar com sandbox
export ASAAS_SANDBOX=true
curl -X POST http://localhost:3002/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": 15}'
```

### Produção
```bash
# Testar com produção
export ASAAS_SANDBOX=false
curl -X POST http://localhost:3002/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": 15}'
```

## Segurança

### Implementado
- Validação de dados antes do envio
- Sanitização de inputs
- Logs de transações
- Tratamento de erros

### Recomendado para Produção
- Validação de webhooks
- Assinatura de requisições
- Rate limiting
- Monitoramento de fraudes

## Troubleshooting

### Problema: Checkout não é criado
1. Verificar chaves da API
2. Verificar formato dos dados
3. Verificar logs do servidor
4. Testar com sandbox primeiro

### Problema: Pagamento não é processado
1. Verificar configuração da chave PIX
2. Verificar dados do cliente
3. Verificar limites da conta
4. Contatar suporte ASAAS

### Problema: Redirecionamento não funciona
1. Verificar URLs de callback
2. Verificar configuração de CORS
3. Verificar certificado SSL
4. Testar em diferentes navegadores

## Referências

- [Documentação ASAAS](https://docs.asaas.com/)
- [API de Checkouts](https://docs.asaas.com/reference/criar-checkout)
- [Webhooks](https://docs.asaas.com/reference/webhooks)
- [Códigos de Erro](https://docs.asaas.com/reference/codigos-de-erro)

