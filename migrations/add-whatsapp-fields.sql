-- Adicionar campos do WhatsApp na tabela event_config
ALTER TABLE event_config 
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Oi! Quero mais informações sobre o UAIZOUK',
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT TRUE;

-- Atualizar registro existente com valores padrão se existir
UPDATE event_config 
SET 
  whatsapp_number = COALESCE(whatsapp_number, ''),
  whatsapp_message = COALESCE(whatsapp_message, 'Oi! Quero mais informações sobre o UAIZOUK'),
  whatsapp_enabled = COALESCE(whatsapp_enabled, TRUE)
WHERE id = 1;