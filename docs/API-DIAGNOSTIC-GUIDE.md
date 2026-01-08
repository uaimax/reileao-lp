# Guia de Diagnóstico - API Health Check

## 🔍 **Problema Atual:**

A API não está respondendo em `http://localhost:3002/api/health` porque:
1. As variáveis de ambiente não estão sendo carregadas
2. A API falha ao inicializar devido ao `DATABASE_URL` não encontrado

## 🔧 **Correções Aplicadas:**

### 1. **API Modificada para Modo Diagnóstico**
- ✅ Removido erro fatal quando `DATABASE_URL` não está definido
- ✅ API agora inicia mesmo sem variáveis de ambiente
- ✅ Endpoint `/api/health` funciona em modo diagnóstico

### 2. **Health Check Melhorado**
- ✅ Mostra status das variáveis de ambiente
- ✅ Indica se está em modo diagnóstico
- ✅ Testa conexão com banco quando disponível

## 🚀 **Para Testar Agora:**

### **1. Reiniciar o Servidor:**
```bash
# Parar o servidor atual (Ctrl+C)
# Depois executar:
npm run dev:full
```

### **2. Verificar os Logs:**
Deve mostrar:
```
🔍 Current working directory: /home/uaimax/projects/uaizouk-site/uaizouk-lp-dinamic
🔍 Looking for .env file...
✅ .env loaded successfully
🔧 Running in diagnostic mode - API will start but database features will be disabled
```

### **3. Testar Health Check:**
```bash
curl http://localhost:3002/api/health
```

**Resposta Esperada:**
```json
{
  "status": "OK (Diagnostic Mode)",
  "database": "Not connected - DATABASE_URL not set",
  "timestamp": "2025-01-02T...",
  "environment": {
    "DATABASE_URL": "Not set",
    "ASAAS_SANDBOX": "undefined",
    "ASAAS_API_KEY_SANDBOX": "Not set"
  },
  "message": "API is running in diagnostic mode. Check environment variables."
}
```

## 🔍 **Diagnóstico das Variáveis:**

### **Se as variáveis ainda não estão sendo carregadas:**

1. **Verificar arquivo .env:**
   ```bash
   ls -la .env
   cat .env
   ```

2. **Verificar se está no diretório correto:**
   ```bash
   pwd
   # Deve mostrar: /home/uaimax/projects/uaizouk-site/uaizouk-lp-dinamic
   ```

3. **Testar carregamento manual:**
   ```bash
   node test-env.js
   ```

## 🎯 **Possíveis Causas:**

### **1. Arquivo .env não está no local correto**
- Verificar se está em `/home/uaimax/projects/uaizouk-site/uaizouk-lp-dinamic/.env`

### **2. Permissões do arquivo .env**
- Verificar se o arquivo é legível

### **3. Formato do arquivo .env**
- Verificar se não há caracteres especiais
- Verificar se as aspas estão corretas

## 📋 **Solução Definitiva:**

### **Se o problema persistir:**

1. **Criar novo arquivo .env:**
   ```bash
   cp .env .env.backup
   rm .env
   ```

2. **Recriar arquivo .env:**
   ```bash
   cat > .env << 'EOF'
   DATABASE_URL='postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech/uaizouklp?sslmode=require'
   VITE_API_URL='http://localhost:3002'
   ASAAS_SANDBOX=true
   ASAAS_API_KEY_SANDBOX='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRmMDJhZjI3LTg3MzgtNGEzNS04MDQ1LWQyODk5ZjM5MjJlMjo6JGFhY2hfYmU1YTlmODktZDAyZi00MzA4LThmNDctNGI0YWQ5MzI5MDkx'
   ASAAS_API_KEY_PRODUCTION='$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh'
   EOF
   ```

3. **Reiniciar servidor:**
   ```bash
   npm run dev:full
   ```

## ✅ **Status Esperado Após Correção:**

```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-01-02T...",
  "environment": {
    "DATABASE_URL": "Set",
    "ASAAS_SANDBOX": "true",
    "ASAAS_API_KEY_SANDBOX": "Set"
  }
}
```

---

**Próximo Passo**: Reiniciar o servidor e testar `http://localhost:3002/api/health`