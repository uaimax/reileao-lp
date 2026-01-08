#!/bin/bash

# Script para gerenciar webhooks do ASAAS
# Uso: ./manage-asaas-webhooks.sh [create|list|delete] [sandbox|production]

API_BASE="http://localhost:3002/api/asaas/webhooks"

# Função para mostrar ajuda
show_help() {
    echo "🔧 Gerenciador de Webhooks ASAAS"
    echo "================================"
    echo ""
    echo "Uso: $0 [comando] [ambiente]"
    echo ""
    echo "Comandos:"
    echo "  create    - Criar novo webhook"
    echo "  list      - Listar webhooks existentes"
    echo "  delete    - Deletar webhook por ID"
    echo ""
    echo "Ambientes:"
    echo "  sandbox   - Ambiente de teste (padrão)"
    echo "  production - Ambiente de produção"
    echo ""
    echo "Exemplos:"
    echo "  $0 create sandbox"
    echo "  $0 list production"
    echo "  $0 delete wh_123 sandbox"
    echo ""
}

# Função para criar webhook
create_webhook() {
    local environment=$1

    echo "🔧 Criando webhook para ambiente: $environment"
    echo ""

    # Verificar se ngrok está rodando
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)

    if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
        echo "❌ ngrok não está rodando!"
        echo "🚀 Execute primeiro: ./setup-webhook-testing.sh"
        echo ""
        exit 1
    fi

    WEBHOOK_URL="$NGROK_URL/api/webhooks/asaas"

    echo "🌐 URL do webhook: $WEBHOOK_URL"
    echo ""

    # Solicitar informações do usuário
    read -p "📧 Email para notificações: " email
    read -p "🏷️  Nome do webhook: " name

    if [ -z "$email" ] || [ -z "$name" ]; then
        echo "❌ Email e nome são obrigatórios!"
        exit 1
    fi

    echo ""
    echo "🚀 Criando webhook..."

    response=$(curl -s -X POST "$API_BASE" \
        -H "Content-Type: application/json" \
        -d "{
            \"url\": \"$WEBHOOK_URL\",
            \"name\": \"$name\",
            \"email\": \"$email\",
            \"environment\": \"$environment\"
        }")

    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo "✅ Webhook criado com sucesso!"
        echo "$response" | jq '.'
    else
        echo "❌ Erro ao criar webhook:"
        echo "$response" | jq '.'
    fi
}

# Função para listar webhooks
list_webhooks() {
    local environment=$1

    echo "📋 Listando webhooks para ambiente: $environment"
    echo ""

    response=$(curl -s "$API_BASE?environment=$environment")

    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        webhooks=$(echo "$response" | jq -r '.webhooks')
        if [ "$webhooks" = "null" ] || [ "$webhooks" = "[]" ]; then
            echo "📭 Nenhum webhook encontrado para o ambiente $environment"
        else
            echo "📋 Webhooks encontrados:"
            echo "$response" | jq -r '.webhooks[] | "ID: \(.id) | Nome: \(.name) | URL: \(.url) | Ativo: \(.enabled)"'
        fi
    else
        echo "❌ Erro ao listar webhooks:"
        echo "$response" | jq '.'
    fi
}

# Função para deletar webhook
delete_webhook() {
    local webhook_id=$1
    local environment=$2

    if [ -z "$webhook_id" ]; then
        echo "❌ ID do webhook é obrigatório!"
        echo "Uso: $0 delete <webhook_id> [ambiente]"
        exit 1
    fi

    echo "🗑️  Deletando webhook $webhook_id do ambiente: $environment"
    echo ""

    response=$(curl -s -X DELETE "$API_BASE/$webhook_id?environment=$environment")

    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo "✅ Webhook deletado com sucesso!"
        echo "$response" | jq '.'
    else
        echo "❌ Erro ao deletar webhook:"
        echo "$response" | jq '.'
    fi
}

# Função para testar webhook
test_webhook() {
    local environment=$1

    echo "🧪 Testando webhook para ambiente: $environment"
    echo ""

    # Verificar se ngrok está rodando
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null)

    if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
        echo "❌ ngrok não está rodando!"
        echo "🚀 Execute primeiro: ./setup-webhook-testing.sh"
        echo ""
        exit 1
    fi

    WEBHOOK_URL="$NGROK_URL/api/webhooks/asaas"

    echo "🌐 Testando webhook: $WEBHOOK_URL"
    echo ""

    # Teste com evento PAYMENT_RECEIVED
    response=$(curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "event": "PAYMENT_RECEIVED",
            "payment": {
                "id": "pay_test_'$(date +%s)'",
                "status": "RECEIVED",
                "value": 350.00,
                "customer": {
                    "cpfCnpj": "555.509.130-38",
                    "email": "maxmaxparcelado222@yopmail.com"
                }
            }
        }')

    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo "✅ Webhook testado com sucesso!"
        echo "$response" | jq '.'
    else
        echo "❌ Erro ao testar webhook:"
        echo "$response" | jq '.'
    fi
}

# Verificar argumentos
if [ $# -lt 1 ]; then
    show_help
    exit 1
fi

command=$1
environment=${2:-sandbox}

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo "❌ Servidor API não está rodando na porta 3002"
    echo "🚀 Inicie o servidor primeiro:"
    echo "   export DATABASE_URL='sua_url_aqui'"
    echo "   cd api && node index.js"
    echo ""
    exit 1
fi

# Executar comando
case $command in
    "create")
        create_webhook $environment
        ;;
    "list")
        list_webhooks $environment
        ;;
    "delete")
        delete_webhook $2 $environment
        ;;
    "test")
        test_webhook $environment
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Comando inválido: $command"
        echo ""
        show_help
        exit 1
        ;;
esac
