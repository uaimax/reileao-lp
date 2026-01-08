-- Migração das tabelas do sistema de formulário de eventos
-- Execute este arquivo com: psql -h localhost -U postgres -d uaizouk_lp -f migrate-event-form.sql

-- Event Form Configurations Table
CREATE TABLE IF NOT EXISTS event_form_configs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event_config(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES event_config(id) ON DELETE CASCADE,
    cpf VARCHAR(14),
    is_foreigner BOOLEAN NOT NULL DEFAULT false,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    state VARCHAR(2),
    city VARCHAR(255),
    ticket_type VARCHAR(100) NOT NULL,
    partner_name TEXT,
    selected_products JSONB,
    total DECIMAL(10,2) NOT NULL,
    terms_accepted BOOLEAN NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for event form system
CREATE INDEX IF NOT EXISTS idx_event_form_configs_event_id ON event_form_configs (event_id);
CREATE INDEX IF NOT EXISTS idx_event_form_configs_is_active ON event_form_configs (is_active);
CREATE INDEX IF NOT EXISTS idx_event_form_configs_config_data ON event_form_configs USING GIN (config_data);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_cpf ON event_registrations (cpf);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations (email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_selected_products ON event_registrations USING GIN (selected_products);

-- Create unique constraint for active configuration (only one active per event)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_form_configs_unique_active
ON event_form_configs (event_id)
WHERE is_active = true;

-- Create composite unique constraint for duplicate prevention (CPF + event_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_cpf_event
ON event_registrations (event_id, cpf)
WHERE cpf IS NOT NULL;

-- Create composite unique constraint for duplicate prevention (email + event_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_email_event
ON event_registrations (event_id, email);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_event_form_configs_updated_at
    BEFORE UPDATE ON event_form_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample configuration data
INSERT INTO event_form_configs (event_id, is_active, config_data) VALUES (
    1,
    true,
    '{
        "foreignerOption": {
            "enabled": true
        },
        "ticketTypes": [
            {
                "name": "Individual",
                "price": 350.00,
                "requiresPartner": false
            },
            {
                "name": "Dupla",
                "price": 600.00,
                "requiresPartner": true
            }
        ],
        "products": [
            {
                "name": "Camiseta",
                "price": 85.00,
                "options": ["P", "M", "G", "GG"]
            },
            {
                "name": "Combo Alimentação",
                "price": 145.00,
                "options": ["Sim", "Não"]
            }
        ]
    }'::jsonb
) ON CONFLICT DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 'event_form_configs' as tabela, count(*) as registros FROM event_form_configs
UNION ALL
SELECT 'event_registrations' as tabela, count(*) as registros FROM event_registrations;

