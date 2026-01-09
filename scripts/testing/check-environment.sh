#!/bin/bash

# Nome do projeto - configurável via variável de ambiente
SITE_NAME="${SITE_NAME:-${VITE_SITE_NAME:-Meu Projeto}}"

echo "🔍 Verificando ambiente do projeto $SITE_NAME..."
echo "=============================================="

# Verificar diretório atual
echo "📁 Diretório atual:"
pwd
echo ""

# Verificar arquivos essenciais
echo "📄 Arquivos essenciais:"
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json não encontrado"
fi

if [ -f "api/index.js" ]; then
    echo "✅ api/index.js encontrado"
else
    echo "❌ api/index.js não encontrado"
fi

if [ -f ".env" ]; then
    echo "✅ .env encontrado"
else
    echo "❌ .env não encontrado"
fi

echo ""

# Verificar dependências
echo "📦 Verificando dependências:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules encontrado"
else
    echo "❌ node_modules não encontrado - execute: npm install"
fi

echo ""

# Verificar processos Node.js
echo "🔄 Processos Node.js ativos:"
NODE_PROCESSES=$(ps aux | grep node | grep -v grep | wc -l)
if [ $NODE_PROCESSES -gt 0 ]; then
    echo "✅ $NODE_PROCESSES processo(s) Node.js ativo(s):"
    ps aux | grep node | grep -v grep
else
    echo "⚠️  Nenhum processo Node.js ativo"
fi

echo ""

# Verificar portas
echo "🌐 Verificando portas:"
if netstat -tuln | grep -q ":3002"; then
    echo "✅ Porta 3002 (API) em uso"
else
    echo "⚠️  Porta 3002 (API) não está em uso"
fi

if netstat -tuln | grep -q ":5173"; then
    echo "✅ Porta 5173 (Vite) em uso"
else
    echo "⚠️  Porta 5173 (Vite) não está em uso"
fi

echo ""

# Verificar conectividade com banco
echo "🗄️  Verificando conectividade com banco:"
if [ -f ".env" ]; then
    DATABASE_URL=$(grep "DATABASE_URL" .env | cut -d'=' -f2 | tr -d "'")
    if [ ! -z "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL configurado"
        echo "   Host: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
    else
        echo "❌ DATABASE_URL não configurado"
    fi
else
    echo "❌ Arquivo .env não encontrado"
fi

echo ""

# Verificar configuração ASAAS
echo "💳 Verificando configuração ASAAS:"
if [ -f ".env" ]; then
    if grep -q "ASAAS_SANDBOX=true" .env; then
        echo "✅ ASAAS_SANDBOX configurado como true"
    else
        echo "⚠️  ASAAS_SANDBOX não configurado como true"
    fi

    if grep -q "ASAAS_API_KEY_SANDBOX" .env; then
        echo "✅ ASAAS_API_KEY_SANDBOX configurado"
    else
        echo "❌ ASAAS_API_KEY_SANDBOX não configurado"
    fi
else
    echo "❌ Arquivo .env não encontrado"
fi

echo ""

# Verificar testes
echo "🧪 Verificando testes:"
if [ -d "tests" ]; then
    echo "✅ Diretório tests encontrado"
    TEST_COUNT=$(find tests -name "*.spec.ts" -o -name "*.test.js" | wc -l)
    echo "   $TEST_COUNT arquivo(s) de teste encontrado(s)"
else
    echo "❌ Diretório tests não encontrado"
fi

echo ""

# Verificar Playwright
echo "🎭 Verificando Playwright:"
if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts encontrado"
else
    echo "❌ playwright.config.ts não encontrado"
fi

echo ""

# Resumo do status
echo "📊 RESUMO DO STATUS:"
echo "==================="

# Verificar se tudo está OK
ISSUES=0

if [ ! -f "package.json" ]; then ISSUES=$((ISSUES + 1)); fi
if [ ! -f "api/index.js" ]; then ISSUES=$((ISSUES + 1)); fi
if [ ! -f ".env" ]; then ISSUES=$((ISSUES + 1)); fi
if [ ! -d "node_modules" ]; then ISSUES=$((ISSUES + 1)); fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ Ambiente configurado corretamente!"
    echo ""
    echo "🚀 Para iniciar o ambiente:"
    echo "   npm run dev:full    # Inicia frontend + API"
    echo "   npm run dev         # Apenas frontend"
    echo "   npm run dev:api     # Apenas API"
    echo ""
    echo "🧪 Para executar testes:"
    echo "   npm test            # Testes Playwright"
    echo "   npm run test:headed # Testes com interface"
    echo "   npm run test:ui     # Interface de testes"
else
    echo "⚠️  $ISSUES problema(s) encontrado(s)"
    echo ""
    echo "🔧 Para corrigir:"
    echo "   npm install         # Instalar dependências"
    echo "   Verificar arquivos essenciais"
fi

echo ""
echo "✨ Verificação concluída!"