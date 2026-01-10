#!/bin/bash

# Script para limpar cache do Vite e garantir que variáveis de ambiente sejam recarregadas

echo "🧹 Limpando cache do Vite..."

# Remover diretórios de cache
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf build

# Limpar cache do npm (opcional)
# npm cache clean --force

echo "✅ Cache limpo!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Certifique-se de que VITE_SITE_NAME no .env está SEM aspas:"
echo "      VITE_SITE_NAME=NOVO_NOME_DO_SITE"
echo "      (não use: VITE_SITE_NAME='NOVO_NOME_DO_SITE')"
echo ""
echo "   2. Reinicie o servidor de desenvolvimento:"
echo "      ./dev-start.sh"
echo ""
echo "   3. No navegador, pressione Ctrl+Shift+R (ou Cmd+Shift+R no Mac)"
echo "      para fazer um hard refresh e limpar o cache do navegador"
echo ""
echo "   4. Verifique o console do navegador (F12) para ver o log de debug"
echo "      que mostra o valor de SITE_NAME sendo lido"



