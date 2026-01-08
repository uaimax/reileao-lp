#!/bin/bash

#
# Script de Backup do Banco de Dados Neon
#
# Este script lê a variável de ambiente UZ_DB_URL_NEON e cria um backup completo
# do banco de dados PostgreSQL usando pg_dump.
#
# Uso:
#   ./scripts/backup-db.sh
#   ou
#   bash scripts/backup-db.sh
#

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}🔄 Iniciando backup do banco de dados...${NC}\n"

# Carregar variáveis de ambiente do .env
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
else
    echo -e "${RED}❌ Erro: Arquivo .env não encontrado em $PROJECT_ROOT${NC}"
    exit 1
fi

# Verificar se a variável de ambiente existe
if [ -z "$UZ_DB_URL_NEON" ]; then
    echo -e "${RED}❌ Erro: Variável de ambiente UZ_DB_URL_NEON não encontrada!${NC}"
    echo -e "${YELLOW}   Certifique-se de que o arquivo .env contém UZ_DB_URL_NEON${NC}"
    exit 1
fi

echo -e "${GREEN}✅ URL do banco de dados encontrada${NC}"

# Extrair informações da URL
# Formato: postgresql://user:password@host:port/database?params
DB_URL="$UZ_DB_URL_NEON"

# Parsear a URL usando sed/awk
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*@[^:]*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/[^/]*/\([^?]*\).*|\1|p')

# Se a porta não estiver na URL, usar padrão
if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
fi

echo -e "   Host: ${DB_HOST}"
echo -e "   Database: ${DB_NAME}\n"

# Verificar se pg_dump está instalado
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ Erro: pg_dump não está instalado!${NC}"
    echo -e "${YELLOW}💡 Instale o PostgreSQL client tools:${NC}"
    echo -e "   Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo -e "   macOS: brew install postgresql"
    exit 1
fi

# Criar diretório de backups se não existir
BACKUPS_DIR="$PROJECT_ROOT/backups"
mkdir -p "$BACKUPS_DIR"
echo -e "${BLUE}📁 Diretório de backups: $BACKUPS_DIR${NC}"

# Gerar nome do arquivo de backup com timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUPS_DIR/backup-${DB_NAME}-${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo -e "\n${BLUE}📦 Criando backup...${NC}"
echo -e "   Arquivo: ${BACKUP_FILE_GZ}\n"

# Executar pg_dump
echo -e "${YELLOW}⏳ Executando pg_dump (isso pode levar alguns minutos)...${NC}\n"

export PGPASSWORD="$DB_PASS"

# Criar backup em formato custom (binário, mais eficiente)
pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    -f "$BACKUP_FILE"

# Verificar se o backup foi criado
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Erro: Backup não foi criado!${NC}"
    exit 1
fi

# Comprimir o backup
echo -e "\n${BLUE}🗜️  Comprimindo backup...${NC}"
gzip -f "$BACKUP_FILE"

# Calcular tamanho do arquivo
FILE_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)

echo -e "\n${GREEN}✅ Backup criado com sucesso!${NC}"
echo -e "   Arquivo: ${BACKUP_FILE_GZ}"
echo -e "   Tamanho: ${FILE_SIZE}"
echo -e "\n${YELLOW}💡 Para restaurar este backup, use:${NC}"
echo -e "   pg_restore -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -c \"${BACKUP_FILE_GZ}\""

# Limpar variável de senha
unset PGPASSWORD

echo -e "\n${GREEN}✨ Concluído!${NC}"

