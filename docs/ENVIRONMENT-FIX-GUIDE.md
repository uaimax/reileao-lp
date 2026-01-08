# Guia de Correção - Problema de Variáveis de Ambiente

## 🔍 **Problema Identificado:**

A API não está conseguindo carregar as variáveis de ambiente do arquivo `.env`, mesmo que o arquivo exista e esteja configurado corretamente.

### **Sintomas:**
- ❌ `DATABASE_URL is not set`
- ❌ `ASAAS_SANDBOX: undefined`
- ❌ `ASAAS_API_KEY_SANDBOX: ❌ No`
- ❌ `ASAAS_API_KEY_PRODUCTION: ❌ No`

## 🔧 **Correções Implementadas:**

### 1. **Correção do dotenv.config()**
```javascript
// ANTES (INCORRETO):
dotenv.config({ path: '../.env' });

// DEPOIS (CORRETO):
dotenv.config();
```

### 2. **Debug Adicionado**
Adicionado debug para verificar:
- Diretório atual de trabalho
- Status do carregamento do .env
- Erros específicos

## 🚀 **Soluções para Testar:**

### **Solução 1: Reiniciar o Servidor**
```bash
# Parar o servidor atual (Ctrl+C)
# Depois executar:
npm run dev:full
```

### **Solução 2: Testar Carregamento de Variáveis**
```bash
# Executar o script de teste:
node test-env.js
```

### **Solução 3: Verificar Arquivo .env**
```bash
# Verificar se o arquivo existe e tem as variáveis:
ls -la .env
cat .env
```

### **Solução 4: Executar API Separadamente**
```bash
# Parar o servidor atual
# Executar apenas a API:
npm run dev:api
```

## 🔍 **Diagnóstico:**

### **Verificar se o problema foi resolvido:**
1. **Reiniciar o servidor** com `npm run dev:full`
2. **Verificar os logs** da API:
   - Deve mostrar: `✅ .env loaded successfully`
   - Deve mostrar: `DATABASE_URL loaded: ✅ Yes`
   - Deve mostrar: `ASAAS_SANDBOX: true`

### **Se ainda houver problemas:**
1. **Executar**: `node test-env.js`
2. **Verificar** se o arquivo `.env` está no diretório correto
3. **Verificar** se as variáveis estão definidas corretamente

## 📋 **Variáveis Esperadas no .env:**

```bash
DATABASE_URL='postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech/uaizouklp?sslmode=require'
VITE_API_URL='http://localhost:3002'
ASAAS_SANDBOX=true
ASAAS_API_KEY_SANDBOX='$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRmMDJhZjI3LTg3MzgtNGEzNS04MDQ1LWQyODk5ZjM5MjJlMjo6JGFhY2hfYmU1YTlmODktZDAyZi00MzA4LThmNDctNGI0YWQ5MzI5MDkx'
ASAAS_API_KEY_PRODUCTION='$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh'
```

## 🎯 **Próximos Passos:**

1. **Reiniciar o servidor** com as correções aplicadas
2. **Verificar os logs** para confirmar que as variáveis foram carregadas
3. **Testar a API** acessando: `http://localhost:3002/api/health`
4. **Testar o frontend** acessando: `http://localhost:8080/inscricao`

## ✅ **Status Esperado Após Correção:**

```
🔍 Current working directory: /home/uaimax/projects/uaizouk-site/uaizouk-lp-dinamic
🔍 Looking for .env file...
✅ .env loaded successfully
🔧 ASAAS Environment Debug:
📁 ASAAS_SANDBOX: true
🔑 ASAAS_API_KEY_SANDBOX: ✅ Yes
🔑 ASAAS_API_KEY_PRODUCTION: ✅ Yes
🔧 Development mode detected
📁 DATABASE_URL loaded: ✅ Yes
🌐 NODE_ENV: undefined
```

---

**Data**: 2025-01-02  
**Status**: 🔧 Correções aplicadas - Aguardando teste