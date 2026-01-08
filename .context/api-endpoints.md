# Documentação da API

## Visão Geral

API RESTful desenvolvida em Express.js para gerenciar configurações de formulários e inscrições de eventos, com integração ao ASAAS para processamento de pagamentos.

## Base URL

- **Desenvolvimento**: `http://localhost:3002`
- **Produção**: `https://uaizouk.com` (a ser configurado)

## Autenticação

Atualmente não há autenticação implementada. Em produção, será necessário implementar autenticação para o painel administrativo.

## Endpoints

### Configuração do Formulário

#### GET /api/form-config

Busca a configuração ativa do formulário.

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "event_id": 1,
  "config_data": {
    "eventName": "UAIZOUK",
    "termsAndConditions": "Termos e condições...",
    "foreignerOption": {
      "enabled": true,
      "label": "Sou estrangeiro"
    },
    "ticketTypes": [
      {
        "name": "Individual",
        "price": 350.00,
        "description": "Ingresso individual",
        "requiresPartner": false
      }
    ],
    "products": [
      {
        "name": "Camiseta",
        "price": 50.00,
        "options": ["P", "M", "G", "GG"],
        "availableUntil": "2025-12-31T23:59:59"
      }
    ],
    "paymentSettings": {
      "dueDateLimit": "2025-12-31",
      "allowPix": true,
      "allowCreditCard": true,
      "pixDiscountPercentage": 5,
      "creditCardFeePercentage": 5
    }
  },
  "is_active": true,
  "created_at": "2025-10-02T10:00:00Z",
  "updated_at": "2025-10-02T10:00:00Z"
}
```

**Resposta de Erro (404)**:
```json
{
  "error": "Nenhuma configuração ativa encontrada"
}
```

#### POST /api/form-config

Cria uma nova configuração do formulário, desativando automaticamente a anterior.

**Corpo da Requisição**:
```json
{
  "event_id": 1,
  "config_data": {
    "eventName": "UAIZOUK",
    "termsAndConditions": "Termos e condições...",
    "foreignerOption": {
      "enabled": true,
      "label": "Sou estrangeiro"
    },
    "ticketTypes": [
      {
        "name": "Individual",
        "price": 350.00,
        "description": "Ingresso individual",
        "requiresPartner": false
      }
    ],
    "products": [
      {
        "name": "Camiseta",
        "price": 50.00,
        "options": ["P", "M", "G", "GG"],
        "availableUntil": "2025-12-31T23:59:59"
      }
    ],
    "paymentSettings": {
      "dueDateLimit": "2025-12-31",
      "allowPix": true,
      "allowCreditCard": true,
      "pixDiscountPercentage": 5,
      "creditCardFeePercentage": 5
    }
  }
}
```

**Resposta de Sucesso (201)**:
```json
{
  "id": 2,
  "event_id": 1,
  "config_data": { /* configuração criada */ },
  "is_active": true,
  "created_at": "2025-10-02T10:00:00Z",
  "updated_at": "2025-10-02T10:00:00Z"
}
```

#### PUT /api/form-config/:id

Atualiza uma configuração existente.

**Parâmetros**:
- `id` (path): ID da configuração

**Corpo da Requisição**: Mesmo formato do POST

**Resposta de Sucesso (200)**:
```json
{
  "id": 1,
  "event_id": 1,
  "config_data": { /* configuração atualizada */ },
  "is_active": true,
  "created_at": "2025-10-02T10:00:00Z",
  "updated_at": "2025-10-02T11:00:00Z"
}
```

### Inscrições

#### POST /api/registrations

Cria uma nova inscrição no evento.

**Corpo da Requisição**:
```json
{
  "event_id": 1,
  "cpf": "111.444.777-35",
  "is_foreigner": false,
  "full_name": "João Silva",
  "email": "joao@example.com",
  "whatsapp": "+5511999999999",
  "birth_date": "1990-01-01",
  "state": "SP",
  "city": "São Paulo",
  "ticket_type": "Individual",
  "partner_name": null,
  "selected_products": {
    "Camiseta": "G",
    "Combo Alimentação": "Sim"
  },
  "total": 551.95,
  "terms_accepted": true,
  "payment_method": "pix",
  "installments": 1
}
```

**Resposta de Sucesso (201)**:
```json
{
  "id": 15,
  "event_id": 1,
  "cpf": "111.444.777-35",
  "is_foreigner": false,
  "full_name": "João Silva",
  "email": "joao@example.com",
  "whatsapp": "+5511999999999",
  "birth_date": "1990-01-01",
  "state": "SP",
  "city": "São Paulo",
  "ticket_type": "Individual",
  "partner_name": null,
  "selected_products": {
    "Camiseta": "G",
    "Combo Alimentação": "Sim"
  },
  "total": 551.95,
  "terms_accepted": true,
  "payment_method": "pix",
  "installments": 1,
  "created_at": "2025-10-02T10:00:00Z"
}
```

**Resposta de Erro (400)**:
```json
{
  "error": "Dados inválidos",
  "details": [
    "Nome completo é obrigatório",
    "Email é obrigatório"
  ]
}
```

#### GET /api/registrations/:id

Busca uma inscrição específica por ID.

**Parâmetros**:
- `id` (path): ID da inscrição

**Resposta de Sucesso (200)**:
```json
{
  "id": 15,
  "event_id": 1,
  "cpf": "111.444.777-35",
  "is_foreigner": false,
  "full_name": "João Silva",
  "email": "joao@example.com",
  "whatsapp": "+5511999999999",
  "birth_date": "1990-01-01",
  "state": "SP",
  "city": "São Paulo",
  "ticket_type": "Individual",
  "partner_name": null,
  "selected_products": {
    "Camiseta": "G",
    "Combo Alimentação": "Sim"
  },
  "total": 551.95,
  "terms_accepted": true,
  "payment_method": "pix",
  "installments": 1,
  "created_at": "2025-10-02T10:00:00Z"
}
```

**Resposta de Erro (404)**:
```json
{
  "error": "Inscrição não encontrada"
}
```

#### GET /api/registrations

Lista todas as inscrições com filtros opcionais.

**Query Parameters**:
- `search` (opcional): Busca por nome ou email
- `payment_status` (opcional): Filtro por status de pagamento
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 50)

**Exemplo**: `GET /api/registrations?search=João&payment_status=pending&page=1&limit=10`

**Resposta de Sucesso (200)**:
```json
{
  "registrations": [
    {
      "id": 15,
      "event_id": 1,
      "full_name": "João Silva",
      "email": "joao@example.com",
      "ticket_type": "Individual",
      "total": 551.95,
      "payment_method": "pix",
      "created_at": "2025-10-02T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Pagamentos

#### POST /api/checkout/create

Cria um checkout no ASAAS para processamento de pagamento.

**Corpo da Requisição**:
```json
{
  "registrationId": 15
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "checkout": {
    "id": "6e30b19f-0f24-47e9-93dd-1a2b7f13ba9c",
    "link": "https://www.asaas.com/checkoutSession/show/6e30b19f-0f24-47e9-93dd-1a2b7f13ba9c",
    "status": "ACTIVE",
    "minutesToExpire": 30,
    "externalReference": "registration-15",
    "billingTypes": ["PIX"],
    "chargeTypes": ["DETACHED"],
    "callback": {
      "cancelUrl": "https://uaizouk.com/inscricao",
      "successUrl": "https://uaizouk.com/inscricao/confirmacao/15",
      "expiredUrl": "https://uaizouk.com/inscricao"
    },
    "items": [
      {
        "name": "Inscrição UAIZOUK",
        "description": "Inscrição para UAIZOUK - Individual + Camiseta: G, Combo Alimentação: Sim - PIX à Vista",
        "externalReference": "ticket-15",
        "quantity": 1,
        "value": 551.95
      }
    ],
    "customerData": {
      "email": "joao@example.com",
      "name": "João Silva",
      "cpfCnpj": "11144477735",
      "phoneNumber": "11999999999",
      "address": "Endereço não informado",
      "addressNumber": "0",
      "complement": null,
      "postalCode": "01310100",
      "province": "SP",
      "cityId": 15873,
      "cityName": "São Paulo - São Paulo"
    }
  },
  "message": "Checkout ASAAS criado com sucesso"
}
```

**Resposta de Erro (400)**:
```json
{
  "error": "Inscrição não encontrada"
}
```

**Resposta de Erro (500)**:
```json
{
  "error": "Erro ao criar checkout ASAAS",
  "details": "O campo phoneNumber deve ser informado."
}
```

### Utilitários

#### GET /api/health

Verifica a saúde da API.

**Resposta de Sucesso (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-02T10:00:00Z",
  "version": "1.0.0"
}
```

#### GET /api/test-db

Testa a conexão com o banco de dados.

**Resposta de Sucesso (200)**:
```json
{
  "status": "connected",
  "timestamp": "2025-10-02T10:00:00Z"
}
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação ou dados inválidos
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## Tratamento de Erros

### Formato Padrão de Erro
```json
{
  "error": "Descrição do erro",
  "details": "Detalhes adicionais (opcional)"
}
```

### Erros Comuns

#### Validação de Dados
```json
{
  "error": "Dados inválidos",
  "details": [
    "Nome completo é obrigatório",
    "Email é obrigatório",
    "CPF é obrigatório para brasileiros"
  ]
}
```

#### Recurso Não Encontrado
```json
{
  "error": "Inscrição não encontrada"
}
```

#### Erro de Banco de Dados
```json
{
  "error": "Erro interno do servidor",
  "details": "Falha na conexão com o banco de dados"
}
```

#### Erro ASAAS
```json
{
  "error": "Erro ao criar checkout ASAAS",
  "details": "O campo phoneNumber deve ser informado."
}
```

## Rate Limiting

Atualmente não há rate limiting implementado. Em produção, será necessário implementar para prevenir abuso.

## CORS

Configurado para permitir requisições de:
- `http://localhost:8080` (desenvolvimento)
- `https://uaizouk.com` (produção)

## Logs

A API gera logs para:
- Requisições recebidas
- Erros de validação
- Erros de banco de dados
- Erros da API ASAAS
- Criação de checkouts

## Monitoramento

### Métricas Importantes
- Número de inscrições por dia
- Taxa de sucesso de checkouts
- Tempo de resposta da API
- Erros por endpoint

### Alertas Recomendados
- Taxa de erro > 5%
- Tempo de resposta > 2s
- Falha na conexão com banco
- Falha na API ASAAS

## Segurança

### Implementado
- Sanitização de inputs
- Validação de dados
- CORS configurado

### Pendente para Produção
- Autenticação e autorização
- Rate limiting
- HTTPS obrigatório
- Validação de tokens
- Logs de auditoria
- Backup automático

