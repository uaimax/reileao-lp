-- Adicionar campos para breakdown de valores de pagamento
-- Isso permite mostrar como o valor final foi calculado

-- Adicionar valor base (antes de taxas/descontos)
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS base_total DECIMAL(10,2);

-- Adicionar valor do desconto (PIX à vista)
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Adicionar valor da taxa (PIX parcelado/cartão)
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0;

-- Adicionar percentual da taxa aplicada
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS fee_percentage DECIMAL(5,2) DEFAULT 0;

-- Adicionar comentários para documentação
COMMENT ON COLUMN event_registrations.base_total IS 'Valor base antes de taxas ou descontos';
COMMENT ON COLUMN event_registrations.discount_amount IS 'Valor do desconto aplicado (PIX à vista)';
COMMENT ON COLUMN event_registrations.fee_amount IS 'Valor da taxa aplicada (PIX parcelado/cartão)';
COMMENT ON COLUMN event_registrations.fee_percentage IS 'Percentual da taxa aplicada (5%, 10%, etc)';

-- Atualizar registros existentes com valores padrão
-- Para registros antigos, assumir que o total é o base_total
UPDATE event_registrations
SET
    base_total = total,
    discount_amount = 0,
    fee_amount = 0,
    fee_percentage = 0
WHERE base_total IS NULL;

-- Verificar a migração
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'event_registrations'
AND column_name IN ('base_total', 'discount_amount', 'fee_amount', 'fee_percentage')
ORDER BY ordinal_position;

