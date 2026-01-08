# 🔧 Correções Implementadas na API ASAAS

## 📋 Resumo das Correções

### ✅ 1. Configuração de Ambiente
- **Mudança**: Alterado `ASAAS_SANDBOX=false` para `ASAAS_SANDBOX=true` no `.env`
- **Motivo**: Para usar ambiente sandbox nos testes em vez de produção
- **Impacto**: Evita cobranças reais durante testes

### ✅ 2. Debug de Variáveis de Ambiente
- **Adicionado**: Logs detalhados para verificar carregamento das variáveis ASAAS
- **Logs**: Verificação de `ASAAS_SANDBOX`, `ASAAS_API_KEY_SANDBOX`, `ASAAS_API_KEY_PRODUCTION`
- **Localização**: Início da API (`api/index.js` linhas 16-22)

### ✅ 3. Validação de Dados Prévia
- **Adicionado**: Validação obrigatória antes de enviar para ASAAS
- **Campos validados**:
  - `customer` (obrigatório)
  - `billingType` (obrigatório)
  - `dueDate` (obrigatório)
  - `value` ou `totalValue` (dependendo do tipo)
  - `installmentCount` (para parceladas, deve ser >= 2)
- **Localização**: `api/index.js` linhas 2838-2865

### ✅ 4. Estrutura Correta para Cobranças
- **Cobranças parceladas**: Usa `installmentCount` + `totalValue`
- **Cobranças únicas**: Usa `value`
- **Conforme**: Documentação oficial da ASAAS
- **Localização**: `api/index.js` linhas 2805-2834

### ✅ 5. Tratamento de Erros Melhorado
- **Erros de validação**: Retorna 400 com mensagem específica
- **Erros da API ASAAS**: Retorna 400 com detalhes da ASAAS
- **Erros internos**: Retorna 500 com contexto
- **Logs detalhados**: Stack trace e contexto completo
- **Localização**: `api/index.js` linhas 2938-2968

### ✅ 6. Logs de Debug Aprimorados
- **Dados do registro**: Log completo dos dados recebidos
- **Customer ID**: Verificação se foi obtido corretamente
- **Payload da cobrança**: Log detalhado do que será enviado para ASAAS
- **Dados do cliente**: Log dos dados antes de criar cliente
- **URL e API Key**: Verificação da configuração ASAAS

## 🧪 Plano de Testes

### Teste 1: Verificação de Ambiente
```bash
# Iniciar API e verificar logs
cd api && node index.js

# Logs esperados:
# 🔧 ASAAS Environment Debug:
# 📁 ASAAS_SANDBOX: true
# 🔑 ASAAS_API_KEY_SANDBOX: ✅ Yes
# 🔑 ASAAS_API_KEY_PRODUCTION: ✅ Yes
```

### Teste 2: Criação de Registro
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

# Resultado esperado: Status 201 com dados do registro
```

### Teste 3: Criação de Cobrança PIX
```bash
curl -X POST http://localhost:3002/api/charges/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": <ID_DO_REGISTRO>}'

# Logs esperados:
# 🔄 Iniciando busca/criação de cliente para cobrança...
# 📋 Dados do registro: { id: X, fullName: "...", ... }
# 🔍 Iniciando busca de cliente ASAAS...
# 🌐 ASAAS URL: https://api-sandbox.asaas.com/v3
# 🔑 API Key configurada: ✅ Sim
# 🆔 Customer ID obtido: cus_xxxxx
# 📊 Criando cobrança única: R$ 100.00
# ✅ Validação de dados concluída
# ✅ Cobrança ASAAS criada: { id: "pay_xxxxx", ... }

# Resultado esperado: Status 201 com dados da cobrança
```

### Teste 4: Cobrança Parcelada
```bash
# Criar registro com parcelas
curl -X POST http://localhost:3002/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "fullName": "Test User Installment",
    "email": "test.installment@example.com",
    "whatsapp": "+55 11 99999-9998",
    "birthDate": "1990-01-01",
    "cpf": "12345678902",
    "state": "SP",
    "city": "São Paulo",
    "ticketType": "Individual",
    "selectedProducts": {},
    "paymentMethod": "pix_installment",
    "total": 300.00,
    "isForeigner": false,
    "termsAccepted": true
  }'

# Criar cobrança parcelada
curl -X POST http://localhost:3002/api/charges/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": <ID_DO_REGISTRO>}'

# Logs esperados:
# 📊 Criando cobrança parcelada: 6x de R$ 50.00
# 📊 Payload da cobrança parcelada: {
#   "customer": "cus_xxxxx",
#   "billingType": "PIX",
#   "installmentCount": 6,
#   "totalValue": 300
# }

# Resultado esperado: Status 201 com dados da cobrança parcelada
```

### Teste 5: Validação de Erros
```bash
# Teste com dados inválidos
curl -X POST http://localhost:3002/api/charges/create \
  -H "Content-Type: application/json" \
  -d '{"registrationId": 99999}'

# Resultado esperado: Status 404 - "Inscrição não encontrada"

# Teste sem registrationId
curl -X POST http://localhost:3002/api/charges/create \
  -H "Content-Type: application/json" \
  -d '{}'

# Resultado esperado: Status 400 - "ID da inscrição é obrigatório"
```

## 🎯 Resultados Esperados

### ✅ Sucessos Esperados:
1. **API inicia** com logs de debug das variáveis ASAAS
2. **Registros são criados** com status 201
3. **Cobranças são criadas** com status 201 (não mais 500)
4. **Logs detalhados** mostram todo o processo
5. **Validação funciona** e retorna erros específicos
6. **Estrutura correta** para cobranças parceladas e únicas

### ❌ Problemas que Devem Ser Resolvidos:
1. **Erro 500** nos endpoints de charges → Deve retornar 201 ou 400
2. **Logs genéricos** → Deve mostrar logs detalhados
3. **Validação insuficiente** → Deve validar antes de enviar para ASAAS
4. **Estrutura incorreta** → Deve usar campos corretos da ASAAS

## 🚀 Próximos Passos

1. **Reiniciar API** com as correções aplicadas
2. **Executar testes** usando os comandos acima
3. **Verificar logs** para confirmar que as correções estão funcionando
4. **Executar testes do Playwright** para validar integração completa
5. **Documentar resultados** e marcar subtask como concluída

## 📝 Arquivos Modificados

- `api/index.js`: Correções principais na API
- `.env`: Configuração para sandbox
- `test-api.js`: Script de teste criado
- `ASAAS-CORRECTIONS-SUMMARY.md`: Este resumo

## 🔍 Debugging

Se ainda houver problemas, verificar:
1. **Variáveis de ambiente** estão carregadas corretamente
2. **Chaves da ASAAS** são válidas e funcionais
3. **Conectividade** com a API sandbox da ASAAS
4. **Dados do banco** estão corretos
5. **Logs detalhados** mostram onde está falhando