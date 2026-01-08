-- FAQ (Frequently Asked Questions) Tables Migration
-- Add FAQ functionality to existing UAIZOUK database

-- FAQ (Frequently Asked Questions) Table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ Section Content
CREATE TABLE IF NOT EXISTS faq_content (
    id SERIAL PRIMARY KEY,
    section_title VARCHAR(255) NOT NULL DEFAULT 'Perguntas Frequentes',
    section_subtitle TEXT NOT NULL DEFAULT 'Tire suas dúvidas sobre o UAIZOUK',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for FAQ table
CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON faqs (is_active, display_order);

-- Create update timestamp trigger for FAQ tables (only if update function exists)
DO $$
BEGIN
    -- Check if the update function exists before creating triggers
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Create triggers only if they don't already exist
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_faqs_updated_at') THEN
            CREATE TRIGGER update_faqs_updated_at 
            BEFORE UPDATE ON faqs 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_faq_content_updated_at') THEN
            CREATE TRIGGER update_faq_content_updated_at 
            BEFORE UPDATE ON faq_content 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- Insert default FAQ content configuration
INSERT INTO faq_content (id, section_title, section_subtitle) 
VALUES (1, 'Perguntas Frequentes', 'Tire suas dúvidas sobre o UAIZOUK') 
ON CONFLICT (id) DO NOTHING;

-- Insert some sample FAQs (optional - remove if you don't want sample data)
INSERT INTO faqs (question, answer, display_order, is_active) VALUES
('Preciso ter um par para participar do UAIZOUK?', '<p>Não! Você pode se inscrever individualmente e será muito bem recebido(a). O UAIZOUK é conhecido pelo ambiente acolhedor e pela facilidade de integração entre os participantes.</p>', 1, true),
('Sou iniciante, posso participar?', '<p>Claro! O UAIZOUK é para <strong>participantes de todos os níveis</strong>. Temos aulas específicas para iniciantes e você terá a oportunidade de aprender com professores renomados em um ambiente totalmente inclusivo.</p>', 2, true),
('Onde fica o local do evento?', '<p>O UAIZOUK acontece no <strong>Recanto da Lua</strong>, localizado no bairro Chácaras Panorama em Uberlândia-MG. É uma chácara dentro da cidade, oferecendo um ambiente único para o evento.</p>', 3, true),
('Como faço para me inscrever?', '<p>As inscrições podem ser feitas através do nosso site oficial. Clique no botão "QUERO PARTICIPAR" em qualquer seção da página para ser direcionado ao formulário de inscrição.</p>', 4, true)
ON CONFLICT DO NOTHING;