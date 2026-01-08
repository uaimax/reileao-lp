# Schema do Banco de Dados

## Visão Geral

O banco de dados utiliza PostgreSQL com campos JSONB para máxima flexibilidade na configuração de formulários e armazenamento de produtos selecionados.

## Tabelas

### event_form_configs

Configurações dos formulários de inscrição para eventos.

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

#### Campos
- `id`: Chave primária auto-incremento
- `event_id`: ID do evento (atualmente fixo em 1)
- `config_data`: Configuração completa do formulário em JSONB
- `is_active`: Indica se é a configuração ativa (única por evento)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### Constraints
- `is_active` deve ser único por `event_id` (apenas uma configuração ativa)

### event_registrations

Inscrições dos participantes nos eventos.

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

#### Campos
- `id`: Chave primária auto-incremento
- `event_id`: ID do evento
- `cpf`: CPF do participante (opcional para estrangeiros)
- `is_foreigner`: Indica se é participante estrangeiro
- `full_name`: Nome completo
- `email`: Email do participante
- `whatsapp`: Número do WhatsApp (formato internacional)
- `birth_date`: Data de nascimento
- `state`: Estado (opcional para estrangeiros)
- `city`: Cidade (opcional para estrangeiros)
- `ticket_type`: Tipo de ingresso selecionado
- `partner_name`: Nome da dupla (se aplicável)
- `selected_products`: Produtos adicionais selecionados em JSONB
- `total`: Valor total da inscrição
- `terms_accepted`: Aceite dos termos e condições
- `payment_method`: Método de pagamento escolhido
- `installments`: Número de parcelas (padrão: 1)
- `created_at`: Data da inscrição

## Estrutura JSONB

### config_data (event_form_configs)

```json
{
  "eventName": "UAIZOUK",
  "termsAndConditions": "Termos e condições do evento...",
  "foreignerOption": {
    "enabled": true,
    "label": "Sou estrangeiro"
  },
  "ticketTypes": [
    {
      "name": "Individual",
      "price": 350.00,
      "description": "Ingresso individual para o evento",
      "requiresPartner": false
    },
    {
      "name": "Dupla",
      "price": 600.00,
      "description": "Ingresso para duas pessoas",
      "requiresPartner": true
    }
  ],
  "products": [
    {
      "name": "Camiseta",
      "price": 50.00,
      "options": ["P", "M", "G", "GG"],
      "availableUntil": "2025-12-31T23:59:59"
    },
    {
      "name": "Combo Alimentação",
      "price": 80.00,
      "options": ["Sim", "Não"],
      "availableUntil": "2025-11-30T23:59:59"
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

#### Estrutura Detalhada

**eventName**: Nome do evento
**termsAndConditions**: Texto dos termos e condições
**foreignerOption**: Configuração para participantes estrangeiros
- `enabled`: Se a opção está habilitada
- `label`: Texto do checkbox

**ticketTypes**: Array de tipos de ingresso
- `name`: Nome do tipo
- `price`: Preço do ingresso
- `description`: Descrição do ingresso
- `requiresPartner`: Se requer nome da dupla

**products**: Array de produtos adicionais
- `name`: Nome do produto
- `price`: Preço do produto
- `options`: Opções disponíveis
- `availableUntil`: Data limite de disponibilidade

**paymentSettings**: Configurações de pagamento
- `dueDateLimit`: Data limite para vencimento
- `allowPix`: Se PIX está habilitado
- `allowCreditCard`: Se cartão está habilitado
- `pixDiscountPercentage`: Percentual de desconto PIX à vista
- `creditCardFeePercentage`: Percentual de taxa para cartão/PIX parcelado

### selected_products (event_registrations)

```json
{
  "Camiseta": "G",
  "Combo Alimentação": "Sim"
}
```

#### Estrutura
- Chave: Nome do produto
- Valor: Opção selecionada

## Índices Recomendados

```sql
-- Índice para busca por configuração ativa
CREATE INDEX idx_event_form_configs_active 
ON event_form_configs(event_id, is_active) 
WHERE is_active = true;

-- Índice para busca de inscrições por evento
CREATE INDEX idx_event_registrations_event_id 
ON event_registrations(event_id);

-- Índice para busca por email
CREATE INDEX idx_event_registrations_email 
ON event_registrations(email);

-- Índice para busca por CPF
CREATE INDEX idx_event_registrations_cpf 
ON event_registrations(cpf) 
WHERE cpf IS NOT NULL;

-- Índice para busca por data de criação
CREATE INDEX idx_event_registrations_created_at 
ON event_registrations(created_at);
```

## Constraints e Validações

### Constraints de Banco
```sql
-- Apenas uma configuração ativa por evento
ALTER TABLE event_form_configs 
ADD CONSTRAINT unique_active_config 
UNIQUE (event_id, is_active) 
WHERE is_active = true;

-- Validação de email
ALTER TABLE event_registrations 
ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Validação de CPF (formato básico)
ALTER TABLE event_registrations 
ADD CONSTRAINT valid_cpf_format 
CHECK (cpf IS NULL OR cpf ~ '^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$');

-- Validação de estado (apenas siglas válidas)
ALTER TABLE event_registrations 
ADD CONSTRAINT valid_state 
CHECK (state IS NULL OR state IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'));

-- Validação de total positivo
ALTER TABLE event_registrations 
ADD CONSTRAINT positive_total 
CHECK (total > 0);

-- Validação de parcelas
ALTER TABLE event_registrations 
ADD CONSTRAINT valid_installments 
CHECK (installments >= 1 AND installments <= 12);
```

### Validações de Aplicação
- Idade mínima: 18 anos
- Campos obrigatórios baseados em `is_foreigner`
- Validação de produtos disponíveis por data
- Validação de tipos de ingresso que requerem dupla

## Migrações

### Migração Inicial
```sql
-- Criar tabelas
CREATE TABLE event_form_configs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    config_data JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Adicionar constraint única
ALTER TABLE event_form_configs 
ADD CONSTRAINT unique_active_config 
UNIQUE (event_id, is_active) 
WHERE is_active = true;
```

### Migração de Parcelas
```sql
-- Adicionar campo de parcelas
ALTER TABLE event_registrations
ADD COLUMN installments INTEGER NOT NULL DEFAULT 1;

-- Comentário
COMMENT ON COLUMN event_registrations.installments IS 'Number of installments for credit card payments, default to 1 for other methods.';
```

## Backup e Restore

### Backup
```bash
# Backup completo
pg_dump -h localhost -U username -d database_name > backup.sql

# Backup apenas das tabelas do sistema
pg_dump -h localhost -U username -d database_name -t event_form_configs -t event_registrations > inscriptions_backup.sql
```

### Restore
```bash
# Restore completo
psql -h localhost -U username -d database_name < backup.sql

# Restore apenas das tabelas
psql -h localhost -U username -d database_name < inscriptions_backup.sql
```

## Monitoramento

### Queries Úteis
```sql
-- Contar inscrições por evento
SELECT event_id, COUNT(*) as total_inscriptions
FROM event_registrations
GROUP BY event_id;

-- Inscrições por método de pagamento
SELECT payment_method, COUNT(*) as count
FROM event_registrations
GROUP BY payment_method;

-- Inscrições por período
SELECT DATE(created_at) as date, COUNT(*) as count
FROM event_registrations
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Valor total por evento
SELECT event_id, SUM(total) as total_value
FROM event_registrations
GROUP BY event_id;
```

