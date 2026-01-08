# 🧪 Plano de Execução dos Testes - API ASAAS

## 🚨 Status Atual
- **Shell corrompido**: Não é possível executar comandos no terminal atual
- **Correções implementadas**: Todas as correções foram aplicadas no código
- **Próximo passo**: Reiniciar terminal/shell e executar testes

## 📋 Correções Implementadas (Para Referência)

### ✅ 1. Configuração de Ambiente
- `ASAAS_SANDBOX=true` no `.env`
- Debug de variáveis de ambiente na API

### ✅ 2. Validação de Dados
- Validação obrigatória antes de enviar para ASAAS
- Mensagens de erro específicas

### ✅ 3. Estrutura Correta para Cobranças
- Cobranças parceladas: `installmentCount` + `totalValue`
- Cobranças únicas: `value`

### ✅ 4. Tratamento de Erros Melhorado
- Erros de validação: 400 com mensagem específica
- Erros da API ASAAS: 400 com detalhes
- Erros internos: 500 com contexto

### ✅ 5. Logs de Debug Aprimorados
- Logs detalhados em cada etapa
- Verificação de dados e configurações

## 🚀 Plano de Execução (Quando Shell for Corrigido)

### Passo 1: Reiniciar Terminal
```bash
# Fechar terminal atual e abrir novo
# Ou reiniciar sessão
```

### Passo 2: Verificar Ambiente
```bash
cd /home/uaimax/projects/uaizouk-site/uaizouk-lp-dinamic
pwd
ls -la
```

### Passo 3: Iniciar API com Correções
```bash
cd api
node index.js
```

**Logs esperados:**
```
🚀 API Server running on port 3002
📊 Health check: http://localhost:3002/api/health
🔗 Test DB: http://localhost:3002/api/test-db
🔧 ASAAS Environment Debug:
📁 ASAAS_SANDBOX: true
🔑 ASAAS_API_KEY_SANDBOX: ✅ Yes
🔑 ASAAS_API_KEY_PRODUCTION: ✅ Yes
```

### Passo 4: Testar Endpoint de Health
```bash
# Em outro terminal
curl http://localhost:3002/api/health
```

**Resultado esperado:**
```json
{"status":"OK","timestamp":"2025-10-02T..."}
```

### Passo 5: Testar Criação de Registro
```bash
curl -X POST http://localhost:3002/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "fullName": "Test User",
    "email": "test@example.com",
    "whatsapp": "+55 11 99999-9999",
    "birthDate": "1990-01-01",
    "cpf": "12345678901",
    "state": "SP",
    "city": "São Paulo",
    "ticketType": "Individual",
    "selectedProducts": {},
    "paymentMethod": "pix",
    "total": 100.00,
    "isForeigner": false,
    "termsAccepted": true
  }'
```

**Resultado esperado:**
- Status: 201
- Resposta com dados do registro criado

### Passo 6: Testar Criação de Cobrança
```bash
curl -X POST http://localhost:3002/api/charges/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": <ID_DO_REGISTRO>}'
```

**Logs esperados na API:**
```
🔄 Iniciando busca/criação de cliente para cobrança...
📋 Dados do registro: { id: X, fullName: "...", ... }
🔍 Iniciando busca de cliente ASAAS...
🌐 ASAAS URL: https://api-sandbox.asaas.com/v3
🔑 API Key configurada: ✅ Sim
🆔 Customer ID obtido: cus_xxxxx
📊 Criando cobrança única: R$ 100.00
✅ Validação de dados concluída
✅ Cobrança ASAAS criada: { id: "pay_xxxxx", ... }
```

**Resultado esperado:**
- Status: 201 (não mais 500)
- Resposta com dados da cobrança criada

### Passo 7: Executar Testes do Playwright
```bash
# Teste específico de criação de registro
npx playwright test tests/integration/api-endpoints.spec.ts -g "should create registration successfully" --reporter=line

# Teste específico de usuário estrangeiro
npx playwright test tests/integration/api-endpoints.spec.ts -g "should handle foreign user registration" --reporter=line

# Teste específico de cobrança PIX
npx playwright test tests/integration/api-endpoints.spec.ts -g "should create PIX charge successfully" --reporter=line

# Teste específico de cobrança parcelada
npx playwright test tests/integration/api-endpoints.spec.ts -g "should create PIX installment charge" --reporter=line

# Teste específico de webhook
npx playwright test tests/integration/api-endpoints.spec.ts -g "should handle payment confirmation webhook" --reporter=line
```

### Passo 8: Executar Todos os Testes de Integração
```bash
npx playwright test tests/integration/ --reporter=line
```

## 🎯 Resultados Esperados

### ✅ Sucessos Esperados:
1. **API inicia** com logs de debug das variáveis ASAAS
2. **Registros são criados** com status 201
3. **Cobranças são criadas** com status 201 (não mais 500)
4. **Logs detalhados** mostram todo o processo
5. **Validação funciona** e retorna erros específicos
6. **Estrutura correta** para cobranças parceladas e únicas
7. **Webhooks funcionam** com status 200
8. **Configuração funciona** com status 200

### ❌ Problemas que Devem Ser Resolvidos:
1. **Erro 500** nos endpoints de charges → Deve retornar 201 ou 400
2. **Logs genéricos** → Deve mostrar logs detalhados
3. **Validação insuficiente** → Deve validar antes de enviar para ASAAS
4. **Estrutura incorreta** → Deve usar campos corretos da ASAAS

## 📊 Script de Teste Automatizado

Criado arquivo `test-api.js` que pode ser executado:

```bash
node test-api.js
```

Este script testa:
1. Health check da API
2. Criação de registro
3. Criação de cobrança
4. Validação de erros

## 🔍 Debugging

Se ainda houver problemas:

1. **Verificar logs da API** para identificar onde está falhando
2. **Verificar variáveis de ambiente** estão carregadas
3. **Verificar chaves da ASAAS** são válidas
4. **Verificar conectividade** com API sandbox da ASAAS
5. **Verificar dados do banco** estão corretos

## 📝 Arquivos Modificados

- `api/index.js`: Correções principais na API
- `.env`: Configuração para sandbox
- `test-api.js`: Script de teste criado
- `ASAAS-CORRECTIONS-SUMMARY.md`: Documentação das correções
- `TEST-EXECUTION-PLAN.md`: Este plano de execução

## 🚀 Próximos Passos

1. **Reiniciar terminal/shell**
2. **Seguir este plano de execução**
3. **Verificar que todos os testes passam**
4. **Documentar resultados**
5. **Marcar subtask 9.3 como concluída**

---

**Nota**: Este plano foi criado devido ao problema do shell corrompido. Quando o shell for corrigido, seguir este plano passo a passo para validar todas as correções implementadas.