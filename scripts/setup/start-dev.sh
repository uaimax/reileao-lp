#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Nome do projeto - configurável via variável de ambiente
SITE_NAME="${SITE_NAME:-${VITE_SITE_NAME:-Meu Projeto}}"

echo -e "${GREEN}🚀 Iniciando desenvolvimento ${SITE_NAME} LP${NC}"
echo -e "${BLUE}======================================${NC}"

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Crie o arquivo .env com:"
    echo "DATABASE_URL='sua_url_do_banco'"
    echo "VITE_API_URL='http://localhost:3002'"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Verificar se o banco está acessível
echo -e "${YELLOW}🔍 Verificando conexão com banco...${NC}"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado! Instale o Node.js primeiro.${NC}"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Dependências OK${NC}"

# Matar processos na porta 3002 se existirem
if lsof -ti:3002 &> /dev/null; then
    echo -e "${YELLOW}🔄 Matando processo na porta 3002...${NC}"
    kill -9 $(lsof -ti:3002) 2>/dev/null || true
fi

# Matar processos na porta 8080 se existirem
if lsof -ti:8080 &> /dev/null; then
    echo -e "${YELLOW}🔄 Matando processo na porta 8080...${NC}"
    kill -9 $(lsof -ti:8080) 2>/dev/null || true
fi

echo -e "${GREEN}🎯 Iniciando servidores...${NC}"
echo -e "${BLUE}• API: http://localhost:3002${NC}"
echo -e "${BLUE}• Frontend: http://localhost:8080${NC}"
echo -e "${BLUE}• Painel: http://localhost:8080/painel${NC}"
echo ""
echo -e "${YELLOW}Para parar os servidores, pressione Ctrl+C${NC}"
echo ""

# Executar API em background
echo -e "${GREEN}🔧 Iniciando API...${NC}"
npm run api &
API_PID=$!

# Aguardar um pouco para a API inicializar
sleep 3

# Executar Vite em background
echo -e "${GREEN}🎨 Iniciando Frontend...${NC}"
npm run dev &
VITE_PID=$!

# Aguardar um pouco para o Vite inicializar
sleep 3

# Função para cleanup quando o script for interrompido
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando servidores...${NC}"
    kill $API_PID 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true

    # Matar processos nas portas caso ainda existam
    kill -9 $(lsof -ti:3002) 2>/dev/null || true
    kill -9 $(lsof -ti:8080) 2>/dev/null || true

    echo -e "${GREEN}✅ Servidores parados${NC}"
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Exibir URLs de teste
echo -e "${GREEN}✅ Servidores iniciados!${NC}"
echo ""
echo -e "${BLUE}🔗 URLs úteis:${NC}"
echo -e "• Frontend: ${GREEN}http://localhost:8080${NC}"
echo -e "• API Health: ${GREEN}http://localhost:3002/api/health${NC}"
echo -e "• API Debug: ${GREEN}http://localhost:3002/api/debug${NC}"
echo -e "• Painel: ${GREEN}http://localhost:8080/painel${NC}"
echo ""
echo -e "${YELLOW}👀 Monitorando logs (Ctrl+C para parar)...${NC}"

# Aguardar indefinidamente
wait