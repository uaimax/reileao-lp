#!/bin/bash

# Script de desenvolvimento para iniciar o projeto completo
# Usa portas não comuns para evitar conflitos com outros projetos

# Não usar set -e para permitir tratamento de erros específicos

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Portas configuráveis (pode ser alterado via variáveis de ambiente)
FRONTEND_PORT=${FRONTEND_PORT:-5173}
API_PORT=${API_PORT:-3002}

echo -e "${BLUE}🚀 Iniciando projeto em modo desenvolvimento...${NC}"
echo -e "${YELLOW}📌 Portas configuradas:${NC}"
echo -e "   Frontend: ${GREEN}${FRONTEND_PORT}${NC}"
echo -e "   API: ${GREEN}${API_PORT}${NC}"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Dependências não encontradas. Instalando...${NC}"
    if ! npm install; then
        echo -e "${RED}❌ Falha ao instalar dependências!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
    echo ""
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}💡 Crie o arquivo .env com as variáveis de ambiente necessárias.${NC}"
    echo -e "${YELLOW}   Exemplo: cp .env.example .env${NC}"
    exit 1
fi

# Carregar variáveis de ambiente do .env
echo -e "${BLUE}📋 Carregando variáveis de ambiente de .env...${NC}"
set -a
source .env
set +a

# Configurar VITE_API_URL automaticamente se não estiver definido
if [ -z "$VITE_API_URL" ]; then
    export VITE_API_URL="http://localhost:${API_PORT}"
    echo -e "${YELLOW}⚠️  VITE_API_URL não estava definido, configurado para: ${VITE_API_URL}${NC}"
else
    echo -e "${GREEN}✅ VITE_API_URL já configurado: ${VITE_API_URL}${NC}"
fi

# Verificar se as portas estão em uso
check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Porta ${port} (${name}) já está em uso!${NC}"
        echo -e "${YELLOW}💡 Você pode:${NC}"
        echo -e "   1. Parar o processo que está usando a porta"
        echo -e "   2. Definir uma porta diferente: ${name}_PORT=<nova_porta> ./dev-start.sh"
        exit 1
    fi
}

echo -e "${BLUE}🔍 Verificando portas...${NC}"
check_port $FRONTEND_PORT "Frontend"
check_port $API_PORT "API"
echo -e "${GREEN}✅ Portas disponíveis${NC}"
echo ""

# Criar arquivo .env temporário para o Vite (se necessário)
# O Vite lê variáveis que começam com VITE_ do process.env
# Mas vamos garantir que está tudo configurado

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando servidores...${NC}"
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        echo -e "${GREEN}✅ API server parado${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend parado${NC}"
    fi
    exit 0
}

# Capturar sinais de interrupção
trap cleanup INT TERM

# Iniciar API server
echo -e "${BLUE}🔧 Iniciando API server na porta ${API_PORT}...${NC}"
export PORT=$API_PORT
node api/index.js > /tmp/api-server.log 2>&1 &
API_PID=$!

# Aguardar API iniciar
echo -e "${YELLOW}⏳ Aguardando API iniciar...${NC}"
sleep 3

# Verificar se a API está rodando
if curl -s http://localhost:${API_PORT}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API server rodando em http://localhost:${API_PORT}${NC}"
else
    echo -e "${RED}❌ API server falhou ao iniciar${NC}"
    echo -e "${YELLOW}📋 Logs da API:${NC}"
    tail -20 /tmp/api-server.log
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# Iniciar Frontend
echo ""
echo -e "${BLUE}🎨 Iniciando Frontend na porta ${FRONTEND_PORT}...${NC}"
export VITE_API_URL="http://localhost:${API_PORT}"
export VITE_PORT=${FRONTEND_PORT}
export PORT=${FRONTEND_PORT}

npm run dev &
FRONTEND_PID=$!

# Aguardar frontend iniciar
sleep 2

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Projeto iniciado com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:${FRONTEND_PORT}"
echo -e "${BLUE}🔧 API:${NC}      http://localhost:${API_PORT}"
echo -e "${BLUE}📊 Health:${NC}   http://localhost:${API_PORT}/api/health"
echo ""
echo -e "${YELLOW}💡 Para parar os servidores, pressione Ctrl+C${NC}"
echo ""

# Manter o script rodando e aguardar processos
wait

