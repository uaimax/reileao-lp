#!/bin/bash

# Script para executar migração do banco de dados
# Este script usa PGPASSWORD para evitar prompt de senha

echo "🚀 Executando migração do sistema de formulário de eventos..."

# Configurar senha do PostgreSQL (ajuste conforme necessário)
export PGPASSWORD="postgres"

# Verificar se as tabelas já existem
echo "📋 Verificando se as tabelas já existem..."
psql -h localhost -U postgres -d uaizouk_lp -c "SELECT 1 FROM event_form_configs LIMIT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Tabelas já existem! Pulando migração."
else
    echo "📦 Executando migração..."
    psql -h localhost -U postgres -d uaizouk_lp -f migrate-event-form.sql

    if [ $? -eq 0 ]; then
        echo "✅ Migração executada com sucesso!"
    else
        echo "❌ Erro na migração. Verifique as credenciais do banco."
        echo "💡 Dica: Ajuste a senha no script se necessário"
    fi
fi

echo "🎯 Sistema pronto para teste!"
echo "📱 Acesse: http://localhost:5173"
echo "🔧 Painel Admin: http://localhost:5173/painel"
echo "📝 Formulário: http://localhost:5173/inscricao"

