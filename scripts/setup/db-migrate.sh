#!/bin/bash

# Script para verificar e executar migrações do banco de dados
# Uso: ./db-migrate.sh [check|migrate]
#
# Para usar sem senha interativa, configure:
# export PGPASSWORD="sua_senha_aqui"

DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="uaizouk_lp"

# Verificar se PGPASSWORD está configurado
if [ -z "$PGPASSWORD" ]; then
    echo "❌ PGPASSWORD não está configurado!"
    echo "Configure a senha do PostgreSQL com:"
    echo "export PGPASSWORD=\"sua_senha_aqui\""
    echo ""
    echo "Ou execute:"
    echo "PGPASSWORD=\"sua_senha_aqui\" ./db-migrate.sh check"
    exit 1
fi

check_tables() {
    echo "Verificando se as tabelas existem..."

    # Verificar event_form_configs
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1 FROM event_form_configs LIMIT 1;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Tabela event_form_configs existe"
    else
        echo "❌ Tabela event_form_configs não existe"
    fi

    # Verificar event_registrations
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1 FROM event_registrations LIMIT 1;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Tabela event_registrations existe"
    else
        echo "❌ Tabela event_registrations não existe"
    fi
}

migrate_tables() {
    echo "Executando migração das tabelas..."

    # Executar apenas as novas tabelas do schema.sql
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
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
    "

    if [ $? -eq 0 ]; then
        echo "✅ Tabelas criadas com sucesso!"

        # Criar índices
        echo "Criando índices..."
        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
        CREATE INDEX IF NOT EXISTS idx_event_form_configs_event_id ON event_form_configs (event_id);
        CREATE INDEX IF NOT EXISTS idx_event_form_configs_is_active ON event_form_configs (is_active);
        CREATE INDEX IF NOT EXISTS idx_event_form_configs_config_data ON event_form_configs USING GIN (config_data);

        CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_cpf ON event_registrations (cpf);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations (email);
        CREATE INDEX IF NOT EXISTS idx_event_registrations_selected_products ON event_registrations USING GIN (selected_products);

        CREATE UNIQUE INDEX IF NOT EXISTS idx_event_form_configs_unique_active
        ON event_form_configs (event_id)
        WHERE is_active = true;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_cpf_event
        ON event_registrations (event_id, cpf)
        WHERE cpf IS NOT NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_unique_email_event
        ON event_registrations (event_id, email);
        "

        # Adicionar trigger
        echo "Adicionando trigger..."
        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
        CREATE TRIGGER update_event_form_configs_updated_at
            BEFORE UPDATE ON event_form_configs
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        "

        # Inserir dados de exemplo
        echo "Inserindo configuração de exemplo..."
        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
        INSERT INTO event_form_configs (event_id, is_active, config_data) VALUES (
            1,
            true,
            '{
                \"foreignerOption\": {
                    \"enabled\": true
                },
                \"ticketTypes\": [
                    {
                        \"name\": \"Individual\",
                        \"price\": 350.00,
                        \"requiresPartner\": false
                    },
                    {
                        \"name\": \"Dupla\",
                        \"price\": 600.00,
                        \"requiresPartner\": true
                    }
                ],
                \"products\": [
                    {
                        \"name\": \"Camiseta\",
                        \"price\": 85.00,
                        \"options\": [\"P\", \"M\", \"G\", \"GG\"]
                    },
                    {
                        \"name\": \"Combo Alimentação\",
                        \"price\": 145.00,
                        \"options\": [\"Sim\", \"Não\"]
                    }
                ]
            }'::jsonb
        ) ON CONFLICT DO NOTHING;
        "

        echo "✅ Migração concluída com sucesso!"
    else
        echo "❌ Erro ao criar tabelas"
        exit 1
    fi
}

case "$1" in
    "check")
        check_tables
        ;;
    "migrate")
        migrate_tables
        ;;
    *)
        echo "Uso: $0 [check|migrate]"
        echo "  check   - Verifica se as tabelas existem"
        echo "  migrate - Executa a migração das tabelas"
        echo ""
        echo "Configure a senha do PostgreSQL:"
        echo "export PGPASSWORD=\"sua_senha_aqui\""
        exit 1
        ;;
esac