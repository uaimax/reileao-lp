# Estratégia Recomendada: Contexto Dinâmico + Cache Inteligente

## 🎯 Abordagem Híbrida (Mais Simples)

### 1. **Contexto Dinâmico no Prompt**
```javascript
// No seu bot, adicione isso no prompt do sistema:
const systemPrompt = `
Você é um assistente do UAIZOUK 2026. Use estas informações atualizadas:

EVENTO: UAIZOUK 2026
DATA: 4–7 SET 2026, Uberlândia–MG
INSCRIÇÕES: https://uaizouk.com.br/2026
WHATSAPP: Ativo - 5513991737852
ESTATÍSTICAS: 3.190 participantes, 56 professores, 25 DJs, 300h de balada
LOCAL: Uberlândia, MG - Recanto da Lua, Chácaras Panorama

Para informações mais detalhadas, faça um GET em:
http://localhost:8080/api/structured-data

Sempre busque dados atualizados quando necessário.
`;
```

### 2. **Cache Inteligente no Bot**
```javascript
class UAIZOUKDataCache {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutos
  }

  async getData() {
    const now = Date.now();

    // Se cache é válido, retorna ele
    if (this.cache && this.lastFetch && (now - this.lastFetch) < this.cacheDuration) {
      return this.cache;
    }

    // Senão, busca dados atualizados
    try {
      const response = await fetch('http://localhost:8080/api/structured-data');
      this.cache = await response.json();
      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return this.cache; // Retorna cache antigo se houver erro
    }
  }

  // Método para buscar informação específica
  async getEventInfo() {
    const data = await this.getData();
    return {
      title: data.event.title,
      date: data.event.dateDisplay,
      url: data.event.registrationUrl,
      whatsapp: data.event.whatsappEnabled
    };
  }

  async getFAQ() {
    const data = await this.getData();
    return data.faq.questions;
  }

  async getStats() {
    const data = await this.getData();
    return data.stats;
  }
}

// Uso no bot
const dataCache = new UAIZOUKDataCache();

// Quando usuário pergunta sobre o evento
const eventInfo = await dataCache.getEventInfo();
// Responde com dados atualizados
```

### 3. **Implementação Simples no Bot**
```javascript
// Exemplo prático para seu bot
async function handleUserQuestion(question) {
  // Busca dados atualizados (com cache de 5min)
  const data = await dataCache.getData();

  // Analisa a pergunta e responde com dados específicos
  if (question.includes('data') || question.includes('quando')) {
    return `O UAIZOUK 2026 acontece ${data.event.dateDisplay}. ${data.event.countdownText}`;
  }

  if (question.includes('inscrição') || question.includes('participar')) {
    return `Para se inscrever, acesse: ${data.event.registrationUrl}`;
  }

  if (question.includes('artistas') || question.includes('professores')) {
    const artistCount = data.artists.list.length;
    return `Temos ${artistCount} artistas confirmados. Veja a lista completa em: ${data.event.registrationUrl}`;
  }

  // Para outras perguntas, usa FAQ
  const relevantFAQ = data.faq.questions.find(faq =>
    faq.question.toLowerCase().includes(question.toLowerCase())
  );

  if (relevantFAQ) {
    return relevantFAQ.answer;
  }

  return 'Não encontrei essa informação específica. Que tal perguntar sobre datas, inscrições ou artistas?';
}
```

## 🚀 **Por que essa abordagem é melhor:**

### **1. Simplicidade**
- Não precisa configurar Vector Store
- Não precisa gerenciar embeddings
- Implementação direta no código do bot

### **2. Eficiência**
- Cache de 5 minutos (mesmo do endpoint)
- Dados sempre atualizados quando necessário
- Sem custos adicionais

### **3. Flexibilidade**
- Pode buscar dados específicos conforme necessário
- Fácil de debugar e manter
- Controle total sobre quando atualizar

### **4. Performance**
- Resposta rápida para perguntas simples
- Busca dados apenas quando necessário
- Fallback para cache em caso de erro

## 📋 **Implementação Passo a Passo:**

### **Passo 1: Adicione o cache no seu bot**
```javascript
const dataCache = new UAIZOUKDataCache();
```

### **Passo 2: Modifique o prompt do sistema**
```javascript
const systemPrompt = `
Você é um assistente do UAIZOUK 2026.
Para informações atualizadas, sempre consulte os dados em tempo real.
`;
```

### **Passo 3: Implemente handlers específicos**
```javascript
// Para perguntas sobre datas
if (question.includes('data')) {
  const data = await dataCache.getData();
  return `O evento acontece ${data.event.dateDisplay}`;
}
```

## 🎯 **Recomendação Final:**

**Use a abordagem híbrida (GET direto + cache inteligente)** porque:

1. ✅ **Mais simples** que Vector Store
2. ✅ **Mais eficiente** que GET toda vez
3. ✅ **Mais flexível** que dados estáticos
4. ✅ **Sem custos adicionais**
5. ✅ **Fácil de implementar e manter**

Essa estratégia te dá o melhor dos dois mundos: dados sempre atualizados com performance otimizada! 🚀
