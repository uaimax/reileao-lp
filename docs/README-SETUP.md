#!/bin/bash

# Script para executar migração do banco de dados
# Execute este script manualmente com a senha correta do PostgreSQL

echo "🚀 Sistema de Formulário de Eventos - Setup"
echo ""
echo "📋 Para executar a migração do banco de dados, execute:"
echo ""
echo "export PGPASSWORD=\"SUA_SENHA_AQUI\""
echo "psql -h localhost -U postgres -d uaizouk_lp -f migrate-event-form.sql"
echo ""
echo "💡 Ou execute diretamente:"
echo "PGPASSWORD=\"SUA_SENHA_AQUI\" psql -h localhost -U postgres -d uaizouk_lp -f migrate-event-form.sql"
echo ""
echo "🎯 Sistema já está rodando!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Painel Admin: http://localhost:5173/painel"
echo "📝 Formulário: http://localhost:5173/inscricao"
echo ""
echo "📋 Para testar o sistema:"
echo "1. Acesse o painel admin: http://localhost:5173/painel"
echo "2. Vá em 'Configuração do Formulário'"
echo "3. Configure os tipos de ingresso e produtos"
echo "4. Salve a configuração"
echo "5. Acesse: http://localhost:5173/inscricao"
echo "6. Teste o formulário de inscrição"
echo ""
echo "⚠️  IMPORTANTE: Execute a migração do banco primeiro!"

