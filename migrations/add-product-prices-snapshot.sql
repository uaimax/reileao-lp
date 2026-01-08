-- Adicionar campos para snapshot de preços de produtos
-- Isso cria um "log permanente" dos valores no momento da inscrição

-- Adicionar preço do ingresso no momento da compra
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2);

-- Adicionar JSON com detalhes dos produtos (nome, opção escolhida, preço)
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS products_snapshot JSONB;

-- Adicionar comentários para documentação
COMMENT ON COLUMN event_registrations.ticket_price IS 'Preço do ingresso no momento da compra (snapshot)';
COMMENT ON COLUMN event_registrations.products_snapshot IS 'Snapshot dos produtos adicionais com preços no momento da compra: [{"name": "Combo", "option": "Sim", "price": 210}]';

-- Criar índice GIN no JSONB para buscas eficientes
CREATE INDEX IF NOT EXISTS idx_event_registrations_products_snapshot
ON event_registrations USING GIN (products_snapshot);

-- Verificar a migração
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
AND column_name IN ('ticket_price', 'products_snapshot')
ORDER BY ordinal_position;

