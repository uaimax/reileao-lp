#!/bin/bash

# Script para configurar webhook testing com ngrok
# Este script ajuda a configurar o ambiente para testar webhooks do ASAAS em localhost

echo "🚀 Configurando ambiente para teste de webhooks ASAAS"
echo "=================================================="

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok não está instalado!"
    echo "📥 Instale o ngrok:"
    echo "   - Acesse: https://ngrok.com/download"
    echo "   - Ou use: brew install ngrok (macOS)"
    echo "   - Ou use: snap install ngrok (Linux)"
    echo ""
    echo "🔑 Após instalar, configure sua autenticação:"
    echo "   ngrok config add-authtoken SEU_TOKEN_AQUI"
    echo ""
    exit 1
fi

echo "✅ ngrok encontrado"

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo "❌ Servidor API não está rodando na porta 3002"
    echo "🚀 Inicie o servidor primeiro:"
    echo "   export DATABASE_URL='sua_url_aqui'"
    echo "   cd api && node index.js"
    echo ""
    exit 1
fi

echo "✅ Servidor API está rodando"

# Iniciar ngrok
echo "🌐 Iniciando ngrok na porta 3002..."
echo "📋 Aguarde alguns segundos para o ngrok inicializar..."
echo ""

# Iniciar ngrok em background
ngrok http 3002 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Aguardar ngrok inicializar
sleep 5

# Obter URL pública do ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    echo "❌ Falha ao obter URL do ngrok"
    echo "🔍 Verifique se o ngrok está rodando:"
    echo "   curl http://localhost:4040/api/tunnels"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ ngrok iniciado com sucesso!"
echo "🌐 URL pública: $NGROK_URL"
echo ""

# URL do webhook
WEBHOOK_URL="$NGROK_URL/api/webhooks/asaas"

echo "📋 Informações para configurar o webhook:"
echo "=========================================="
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo "📧 Email: seu-email@exemplo.com"
echo "🏷️  Nome: Uaizouk Webhook Local"
echo "🌍 Ambiente: sandbox"
echo ""

echo "🧪 Para testar o webhook, execute:"
echo "=================================="
echo ""

echo "# 1. Criar webhook no ASAAS:"
echo "curl -X POST 'http://localhost:3002/api/asaas/webhooks' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"url\": \"$WEBHOOK_URL\","
echo "    \"name\": \"Uaizouk Webhook Local\","
echo "    \"email\": \"seu-email@exemplo.com\","
echo "    \"environment\": \"sandbox\""
echo "  }'"
echo ""

echo "# 2. Listar webhooks existentes:"
echo "curl 'http://localhost:3002/api/asaas/webhooks?environment=sandbox'"
echo ""

echo "# 3. Testar webhook manualmente:"
echo "curl -X POST '$WEBHOOK_URL' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"event\": \"PAYMENT_RECEIVED\","
echo "    \"payment\": {"
echo "      \"id\": \"pay_test_123\","
echo "      \"status\": \"RECEIVED\","
echo "      \"value\": 350.00,"
echo "      \"customer\": {"
echo "        \"cpfCnpj\": \"555.509.130-38\","
echo "        \"email\": \"maxmaxparcelado222@yopmail.com\""
echo "      }"
echo "    }"
echo "  }'"
echo ""

echo "# 4. Verificar logs do servidor para ver se o webhook foi processado"
echo ""

echo "🛑 Para parar o ngrok:"
echo "kill $NGROK_PID"
echo ""

echo "📝 Logs do ngrok estão sendo salvos em: ngrok.log"
echo ""

# Salvar informações em arquivo para referência
cat > webhook-test-info.txt << EOF
Webhook Testing Information
==========================

NGROK_URL: $NGROK_URL
WEBHOOK_URL: $WEBHOOK_URL
NGROK_PID: $NGROK_PID

Para parar o ngrok:
kill $NGROK_PID

Para verificar status:
curl http://localhost:4040/api/tunnels

Para testar webhook:
curl -X POST '$WEBHOOK_URL' -H 'Content-Type: application/json' -d '{"event":"PAYMENT_RECEIVED","payment":{"id":"pay_test","status":"RECEIVED","value":350,"customer":{"cpfCnpj":"555.509.130-38","email":"maxmaxparcelado222@yopmail.com"}}}'
EOF

echo "💾 Informações salvas em: webhook-test-info.txt"
echo ""
echo "🎯 Pronto! Agora você pode configurar o webhook no ASAAS usando a URL acima."
echo "📱 Acesse o painel do ASAAS e configure o webhook com:"
echo "   URL: $WEBHOOK_URL"
echo ""

# Manter o script rodando para mostrar logs
echo "📊 Logs do ngrok (Ctrl+C para parar):"
echo "====================================="
tail -f ngrok.log
