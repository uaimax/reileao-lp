#!/bin/bash

# Script para executar migração e iniciar API com .env
echo "🚀 Configurando sistema de formulário de eventos..."

# Carregar variáveis do .env
if [ -f "../.env" ]; then
    echo "📁 Carregando variáveis do .env..."
    export $(grep -v '^#' ../.env | xargs)
    echo "✅ Variáveis carregadas"
else
    echo "❌ Arquivo .env não encontrado"
    exit 1
fi

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está definida no .env"
    exit 1
fi

echo "🔗 DATABASE_URL: ${DATABASE_URL:0:20}..."

# Executar migração usando DATABASE_URL
echo "📦 Executando migração do banco..."
psql "$DATABASE_URL" -f ../migrate-event-form.sql

if [ $? -eq 0 ]; then
    echo "✅ Migração executada com sucesso!"
else
    echo "❌ Erro na migração"
    exit 1
fi

echo "🎯 Sistema pronto!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Painel Admin: http://localhost:8080/painel"
echo "📝 Formulário: http://localhost:8080/inscricao"
echo ""
echo "🚀 Iniciando API..."
node index.js

