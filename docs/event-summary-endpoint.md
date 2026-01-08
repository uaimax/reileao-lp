# Endpoint Event Summary - UAIZOUK

## Visão Geral

O endpoint `/api/event-summary` retorna um resumo estruturado do evento UAIZOUK em formato JSON com uma única chave, otimizado para uso em templates e sistemas automatizados.

## URL do Endpoint

```
GET /api/event-summary
```

## Formato de Resposta

O endpoint retorna um JSON com uma única chave `eventSummary`:

```json
{
  "eventSummary": "🎉 PACOTE NO ESCURO - UAIZOUK 2026\nDATA: 4–7 SET 2026, Uberlândia–MG\nLOCAL: Uberlândia, MG (4.000m² de natureza)\nINSCRIÇÕES: https://uaizouk.com.br/2026\nWHATSAPP: Ativo - 5513991737852\n\n💰 PREÇO ESPECIAL: A partir de R$ 499 (para quem confia no processo)\n⏰ DURAÇÃO: 4 dias de evento (4 a 7 de setembro de 2026)\n📍 LOCAL EXATO: Será revelado aos inscritos\n\n🎯 CONCEITO DO PACOTE NO ESCURO:\n- Sem grade engessada, sem fórmulas prontas\n- Sem ambiente competitivo, COM propósito\n- Um espaço onde movimento encontra propósito\n- Onde cada pessoa constrói junto e traz sua personalidade\n- Onde dançar é consequência, não o único objetivo\n- Não é sobre competir, mas sobre se conectar\n\n📊 ESTATÍSTICAS GERAIS:\n- 3190 Participantes\n- 56 Professores\n- 25 DJs\n- 300 Horas de balada\n\n🎭 ARTISTAS: Serão revelados conforme o processo evolui\n\n❓ FAQ ESPECÍFICO DO PACOTE NO ESCURO:\nQ: Por que não revelam os artistas desde o começo?\nR: Porque fazemos questão de deixar um período especial para trazer pessoas que vêm pela jornada, não pelo destino.\n\nQ: Teremos campeonato ou competição oficial?\nR: Não teremos competições com pontuação. Focaremos em brincadeiras, dinâmicas, momentos de troca e vulnerabilidade. O troféu maior é sair com 50 novos amigos, não com uma medalha.\n\nQ: Quando encerra esse lote no escuro?\nR: O lote encerra por número de vagas ou por confirmação de novos detalhes. Pode ser a qualquer momento conforme as inscrições evoluem.\n\nÚLTIMA ATUALIZAÇÃO: 07/10/2025 20:15:08"
}
```

## Uso em Templates

### SendPulse
```
Campo de Resposta: $[eventSummary]
URL: http://localhost:8080/api/event-summary
Método: GET
Tipo: JSON
```

### Outros Sistemas
```javascript
// JavaScript
const response = await fetch('http://localhost:8080/api/event-summary');
const data = await response.json();
const summary = data.eventSummary;

// Python
import requests
response = requests.get('http://localhost:8080/api/event-summary')
summary = response.json()['eventSummary']
```

## Características

### ✅ **Formato Simples**
- JSON com uma única chave `eventSummary`
- Fácil de usar em qualquer sistema
- Sem necessidade de parsing complexo

### ✅ **Cache Inteligente**
- Cache de 30 minutos
- Invalidação automática quando dados são atualizados
- Verificação de timestamps do banco de dados

### ✅ **Sempre Atualizado**
- Dados sempre sincronizados com o banco
- Invalidação automática em caso de mudanças
- Fallback para dados mock em modo diagnóstico

### ✅ **Informações Específicas do Pacote No Escuro**
- Conceito único: sem grade engessada, sem fórmulas prontas
- Filosofia: movimento encontra propósito, conexão acima de competição
- Preço especial: R$ 499 para quem confia no processo
- Duração: 4 dias de evento
- Local: 4.000m² de natureza (endereço revelado aos inscritos)

### ✅ **FAQ Específico**
- Por que não revelam artistas desde o começo?
- Ausência de competições oficiais (foco em conexão)
- Política de encerramento do lote (por vagas ou detalhes)

## Headers e Cache

- **Content-Type**: `application/json; charset=utf-8`
- **Cache-Control**: `public, max-age=1800` (30 minutos)
- **CORS**: Habilitado para todas as origens
- **Encoding**: UTF-8

## Tratamento de Erros

### Resposta de Erro
```json
{
  "error": "Erro ao gerar resumo do evento"
}
```

### Códigos de Status HTTP
- `200`: Sucesso
- `500`: Erro interno do servidor

## Exemplo de Uso Completo

### 1. Requisição
```bash
curl -s http://localhost:8080/api/event-summary
```

### 2. Resposta
```json
{
  "eventSummary": "🎉 PACOTE NO ESCURO - UAIZOUK 2026\nDATA: 4–7 SET 2026, Uberlândia–MG\nLOCAL: Uberlândia, MG (4.000m² de natureza)\nINSCRIÇÕES: https://uaizouk.com.br/2026\nWHATSAPP: Ativo - 5513991737852\n\n💰 PREÇO ESPECIAL: A partir de R$ 499 (para quem confia no processo)\n⏰ DURAÇÃO: 4 dias de evento (4 a 7 de setembro de 2026)\n📍 LOCAL EXATO: Será revelado aos inscritos\n\n🎯 CONCEITO DO PACOTE NO ESCURO:\n- Sem grade engessada, sem fórmulas prontas\n- Sem ambiente competitivo, COM propósito\n- Um espaço onde movimento encontra propósito\n- Onde cada pessoa constrói junto e traz sua personalidade\n- Onde dançar é consequência, não o único objetivo\n- Não é sobre competir, mas sobre se conectar\n\n📊 ESTATÍSTICAS GERAIS:\n- 3190 Participantes\n- 56 Professores\n- 25 DJs\n- 300 Horas de balada\n\n🎭 ARTISTAS: Serão revelados conforme o processo evolui\n\n❓ FAQ ESPECÍFICO DO PACOTE NO ESCURO:\nQ: Por que não revelam os artistas desde o começo?\nR: Porque fazemos questão de deixar um período especial para trazer pessoas que vêm pela jornada, não pelo destino.\n\nQ: Teremos campeonato ou competição oficial?\nR: Não teremos competições com pontuação. Focaremos em brincadeiras, dinâmicas, momentos de troca e vulnerabilidade. O troféu maior é sair com 50 novos amigos, não com uma medalha.\n\nQ: Quando encerra esse lote no escuro?\nR: O lote encerra por número de vagas ou por confirmação de novos detalhes. Pode ser a qualquer momento conforme as inscrições evoluem.\n\nÚLTIMA ATUALIZAÇÃO: 07/10/2025 20:15:08"
}
```

### 3. Uso no Código
```javascript
async function getEventSummary() {
  try {
    const response = await fetch('http://localhost:8080/api/event-summary');
    const data = await response.json();
    return data.eventSummary;
  } catch (error) {
    console.error('Erro ao buscar resumo do evento:', error);
    return 'Erro ao carregar informações do evento.';
  }
}

// Uso
const summary = await getEventSummary();
console.log(summary);
```

## Casos de Uso

### 1. **Chatbots e Assistentes**
```javascript
const summary = await fetch('/api/event-summary').then(r => r.json());
const eventInfo = summary.eventSummary;
// Use eventInfo diretamente no chatbot
```

### 2. **Templates de Email**
```javascript
const response = await fetch('/api/event-summary');
const data = await response.json();
const emailBody = `
Olá! Aqui estão as informações do UAIZOUK:

${data.eventSummary}

Esperamos você lá!
`;
```

### 3. **Notificações Push**
```javascript
const summary = await fetch('/api/event-summary').then(r => r.json());
const notification = `UAIZOUK: ${summary.eventSummary.split('\n')[0]}`;
```

### 4. **Integração com SendPulse**
```
Campo: $[eventSummary]
URL: http://localhost:8080/api/event-summary
Tipo: JSON
Chave: eventSummary
```

## Vantagens do Formato JSON

### ✅ **Simplicidade**
- Uma única chave para acessar
- Formato padrão e universal
- Fácil integração com qualquer sistema

### ✅ **Flexibilidade**
- Pode ser usado em templates
- Fácil de processar programaticamente
- Suporte nativo em todas as linguagens

### ✅ **Manutenibilidade**
- Estrutura simples e clara
- Fácil de modificar se necessário
- Documentação clara

## Comparação com Versões Anteriores

| Versão | Formato | Uso | Complexidade |
|--------|---------|-----|--------------|
| `/api/structured-data` | JSON complexo | Processamento | Alta |
| `/api/event-summary` (texto) | Texto simples | Templates | Média |
| `/api/event-summary` (atual) | JSON simples | Universal | Baixa |

## Troubleshooting

### Problema: Resposta não é JSON válido
**Soluções:**
1. Verificar se servidor está rodando
2. Verificar headers Content-Type
3. Testar endpoint manualmente

### Problema: Chave `eventSummary` não existe
**Soluções:**
1. Verificar estrutura da resposta
2. Verificar se endpoint está correto
3. Verificar logs do servidor

### Problema: Dados não atualizam
**Soluções:**
1. Verificar cache do servidor (30 minutos)
2. Verificar timestamps do banco
3. Forçar atualização no banco

## Próximos Passos

1. **Configure o campo** no seu sistema com `$[eventSummary]`
2. **Teste o endpoint** manualmente
3. **Implemente cache** no lado do cliente se necessário
4. **Monitore logs** para verificar funcionamento
5. **Teste com usuários** reais

---

**Última atualização**: Outubro 2024
**Versão**: 2.0
**Mantenedor**: Equipe UAIZOUK