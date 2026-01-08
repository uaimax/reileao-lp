-- Migration: Add AI Instructions table
-- Description: Creates table for AI instructions that complement the eventSummary
-- Date: 2025-10-07

CREATE TABLE IF NOT EXISTS ai_instructions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ai_instructions_active ON ai_instructions(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_instructions_order ON ai_instructions(order_index);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_instructions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_instructions_updated_at
    BEFORE UPDATE ON ai_instructions
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_instructions_updated_at();

-- Insert some sample data
INSERT INTO ai_instructions (title, content, order_index, is_active) VALUES
('Informações sobre Hospedagem', 'O evento oferece opções de hospedagem próximas ao local. Entre em contato via WhatsApp para mais informações sobre pacotes especiais.', 1, true),
('Política de Cancelamento', 'Cancelamentos até 30 dias antes do evento têm reembolso de 80%. Entre 30-15 dias: 50%. Menos de 15 dias: sem reembolso.', 2, true),
('Recomendações de Vestimenta', 'Traga roupas confortáveis para dançar e sapatos adequados. O evento acontece em ambiente fechado com ar condicionado.', 3, true)
ON CONFLICT DO NOTHING;
