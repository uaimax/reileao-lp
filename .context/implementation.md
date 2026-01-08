# Implementação Atual do Sistema

## Visão Geral

Sistema de inscrições dinâmico para eventos com painel administrativo, formulário de inscrição progressivo e integração com ASAAS para pagamentos.

## Estrutura do Projeto

```
uaizouk-lp-dinamic/
├── .context/                 # Documentação e contexto
├── .cursor/                  # Configurações do Cursor
├── api/                      # Backend Express.js
│   ├── index.js             # Servidor principal
│   └── setup-and-run.sh     # Script de setup
├── src/                      # Frontend React
│   ├── components/          # Componentes React
│   │   └── painel/         # Componentes administrativos
│   ├── lib/                 # Utilitários e configurações
│   ├── pages/               # Páginas principais
│   └── styles/              # Estilos CSS
├── schema.sql               # Schema do banco de dados
└── .env                     # Variáveis de ambiente
```

## Backend (API)

### Tecnologias
- **Express.js**: Framework web
- **PostgreSQL**: Banco de dados
- **Drizzle ORM**: ORM TypeScript
- **ASAAS API**: Gateway de pagamentos

### Endpoints Principais

#### Configuração do Formulário
- `GET /api/form-config` - Buscar configuração ativa
- `POST /api/form-config` - Criar nova configuração
- `PUT /api/form-config/:id` - Atualizar configuração

#### Inscrições
- `POST /api/registrations` - Criar nova inscrição
- `GET /api/registrations/:id` - Buscar inscrição por ID
- `GET /api/registrations` - Listar todas as inscrições

#### Pagamentos
- `POST /api/checkout/create` - Criar checkout ASAAS

### Configurações de Ambiente

#### Variáveis Obrigatórias
```bash
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/database

# ASAAS (pelo menos uma)
ASAAS_API_KEY_SANDBOX=your_sandbox_key
ASAAS_API_KEY_PRODUCTION=your_production_key

# Controle de ambiente
ASAAS_SANDBOX=true  # ou false para produção
```

## Frontend (React)

### Tecnologias
- **React 18**: Framework frontend
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Shadcn UI**: Componentes
- **React Hook Form**: Gerenciamento de formulários
- **React Phone Number Input**: Campo de telefone internacional

### Componentes Principais

#### Administrativos
- `FormConfigManager.tsx` - Configuração do formulário
- `RegistrationsView.tsx` - Visualização de inscrições
- `Sidebar.tsx` - Menu lateral

#### Públicos
- `RegistrationForm.tsx` - Formulário de inscrição
- `RegistrationConfirmation.tsx` - Página de confirmação

### Funcionalidades

#### Formulário de Inscrição
- **Progressive Disclosure**: Seções aparecem sequencialmente
- **Validação**: Apenas no submit
- **WhatsApp Internacional**: Com seletor de país
- **Produtos Dinâmicos**: Baseados na configuração
- **Cálculo de Preços**: Com taxas e descontos

#### Painel Administrativo
- **Configuração Visual**: Interface para configurar formulário
- **Preview JSON**: Visualização da configuração
- **Gerenciamento de Inscrições**: Lista com filtros
- **Exportação CSV**: Para análise de dados

## Banco de Dados

### Tabelas Principais

#### event_form_configs
```sql
CREATE TABLE event_form_configs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    config_data JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### event_registrations
```sql
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    cpf VARCHAR(14),
    is_foreigner BOOLEAN NOT NULL DEFAULT false,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    state VARCHAR(2),
    city VARCHAR(255),
    ticket_type VARCHAR(100) NOT NULL,
    partner_name VARCHAR(255),
    selected_products JSONB,
    total DECIMAL(10,2) NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    payment_method VARCHAR(50),
    installments INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Estrutura JSONB

#### config_data (event_form_configs)
```json
{
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
```

#### selected_products (event_registrations)
```json
{
  "Camiseta": "G",
  "Combo Alimentação": "Sim"
}
```

## Integração ASAAS

### Configuração
- **Sandbox**: `https://api-sandbox.asaas.com/v3/checkouts`
- **Produção**: `https://api.asaas.com/v3/checkouts`
- **Alternância**: Via variável `ASAAS_SANDBOX`

### Fluxo de Pagamento
1. Usuário preenche formulário
2. Sistema salva inscrição no banco
3. Sistema cria checkout ASAAS
4. Usuário é redirecionado para ASAAS
5. Após pagamento, retorna para confirmação

### Dados Enviados para ASAAS
```json
{
  "billingTypes": ["PIX", "CREDIT_CARD"],
  "chargeTypes": ["DETACHED", "INSTALLMENT"],
  "minutesToExpire": 30,
  "externalReference": "registration-{id}",
  "callback": {
    "successUrl": "https://uaizouk.com/inscricao/confirmacao/{id}",
    "cancelUrl": "https://uaizouk.com/inscricao",
    "expiredUrl": "https://uaizouk.com/inscricao"
  },
  "items": [{
    "name": "Inscrição UAIZOUK",
    "description": "Inscrição para UAIZOUK - Individual + Camiseta: G - PIX à Vista",
    "quantity": 1,
    "value": 551.95
  }],
  "customerData": {
    "name": "Nome do Cliente",
    "email": "email@example.com",
    "phone": "11987654321",
    "cpfCnpj": "11144477735",
    "address": "Endereço não informado",
    "addressNumber": "0",
    "postalCode": "01310100",
    "province": "SP"
  }
}
```

## Lógica de Negócio

### Cálculo de Preços
- **Base**: Soma do ingresso + produtos selecionados
- **PIX à vista**: Base - desconto (5%)
- **PIX parcelado**: Base + taxa (5%)
- **Cartão de crédito**: Base + taxa (5%)

### Validações
- **Idade mínima**: 18 anos
- **Campos obrigatórios**: Nome, email, WhatsApp, data nascimento
- **Brasileiros**: CPF, estado, cidade obrigatórios
- **Estrangeiros**: Campos brasileiros opcionais
- **Ingressos com dupla**: Nome da dupla obrigatório

### Máximo de Parcelas
- Calculado automaticamente baseado na data limite
- Diferença em meses entre hoje e data limite
- Margem de segurança de 1 mês
- Máximo de 12 parcelas

## Estado Atual

### Funcionalidades Implementadas
✅ Configuração dinâmica do formulário
✅ Formulário de inscrição progressivo
✅ Integração ASAAS (PIX e cartão)
✅ Painel administrativo
✅ Visualização de inscrições
✅ Cálculo automático de parcelas
✅ Campo WhatsApp internacional
✅ Alternância sandbox/produção
✅ Descrição detalhada de itens

### Funcionalidades Pendentes
⏳ Deploy em produção
⏳ Configuração de chave PIX no ASAAS
⏳ Testes de integração completos
⏳ Monitoramento e logs
⏳ Backup automático

## Próximos Passos

1. **Configurar chave PIX no ASAAS**
2. **Deploy em produção**
3. **Configurar domínio e SSL**
4. **Implementar monitoramento**
5. **Criar backup automático**
6. **Documentar processo de deploy**

