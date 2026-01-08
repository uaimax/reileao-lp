# Endpoint SendPulse - UAIZOUK

## Visão Geral

O endpoint `/api/sendpulse-field` retorna um resumo compacto e visual do evento UAIZOUK, otimizado para uso como campo de resposta no SendPulse usando a sintaxe `$[eventinfo]`.

## URL do Endpoint

```
GET /api/sendpulse-field
```

## Formato de Resposta

O endpoint retorna um texto compacto e visual com emojis:

```
🎉 UAIZOUK 2026 - 4–7 SET 2026 em Uberlândia, MG

📊 3190 participantes • 56 professores • 25 DJs

🎭 Artistas serão divulgados em breve

📝 FAQ: Preciso ter um par para participar do UAIZOUK? • Sou iniciante, posso participar?

🔗 Inscrições: https://uaizouk.com.br/2026
📱 WhatsApp: 5513991737852

Última atualização: 07/10/2025
```

## Uso no SendPulse

### Configuração do Campo de Resposta

1. **No SendPulse**, vá para a configuração do campo de resposta
2. **Digite**: `$[eventinfo]`
3. **Configure a URL**: `http://localhost:8080/api/sendpulse-field`

### Exemplo de Configuração

```
Campo de Resposta: $[eventinfo]
URL: http://localhost:8080/api/sendpulse-field
Método: GET
Tipo: Texto
```

### Resultado no Chat

Quando o usuário perguntar sobre o evento, o SendPulse irá:

1. Fazer uma requisição GET para `/api/sendpulse-field`
2. Receber o resumo formatado
3. Exibir para o usuário como resposta

## Características do Formato

### ✅ **Compacto**
- Informações essenciais em formato conciso
- Ideal para exibição em chat/mensagens

### ✅ **Visual**
- Emojis para facilitar leitura
- Formatação clara e organizada

### ✅ **Atualizado**
- Cache inteligente de 30 minutos
- Invalidação automática quando há mudanças

### ✅ **Informativo**
- Estatísticas principais
- Links importantes
- FAQ resumido

## Exemplo de Uso Prático

### Cenário: Usuário pergunta "Me fale sobre o UAIZOUK"

**Configuração no SendPulse:**
```
Campo: $[eventinfo]
URL: http://localhost:8080/api/sendpulse-field
```

**Resposta automática:**
```
🎉 UAIZOUK 2026 - 4–7 SET 2026 em Uberlândia, MG

📊 3190 participantes • 56 professores • 25 DJs

🎭 Artistas serão divulgados em breve

📝 FAQ: Preciso ter um par para participar do UAIZOUK? • Sou iniciante, posso participar?

🔗 Inscrições: https://uaizouk.com.br/2026
📱 WhatsApp: 5513991737852

Última atualização: 07/10/2025
```

## Comparação com Outros Endpoints

| Endpoint | Formato | Uso | Tamanho |
|----------|---------|-----|---------|
| `/api/structured-data` | JSON | Processamento | Grande |
| `/api/event-summary` | Texto detalhado | Templates IA | Médio |
| `/api/sendpulse-field` | Texto compacto | SendPulse | Pequeno |

## Headers e Cache

- **Content-Type**: `text/plain; charset=utf-8`
- **Cache-Control**: `public, max-age=1800` (30 minutos)
- **CORS**: Habilitado para todas as origens
- **Encoding**: UTF-8

## Tratamento de Erros

### Resposta de Erro
```
Erro ao gerar campo do evento
```

### Códigos de Status HTTP
- `200`: Sucesso
- `500`: Erro interno do servidor

## Configuração Avançada no SendPulse

### Múltiplos Campos

Você pode criar vários campos para diferentes aspectos:

```
$[eventinfo] → /api/sendpulse-field (resumo geral)
$[eventdate] → /api/event-date (apenas data)
$[eventstats] → /api/event-stats (apenas estatísticas)
```

### Cache no SendPulse

O SendPulse pode ter seu próprio cache. Para garantir dados sempre atualizados:

1. **Configure timeout baixo** no SendPulse (ex: 5 minutos)
2. **Use cache inteligente** do servidor (30 minutos)
3. **Monitore logs** para verificar atualizações

## Exemplo de Implementação Completa

### 1. Configuração no SendPulse

```
Campo de Resposta: $[eventinfo]
URL: http://localhost:8080/api/sendpulse-field
Método: GET
Timeout: 10 segundos
Cache: 5 minutos
Tipo: Texto
```

### 2. Teste Manual

```bash
curl -s http://localhost:8080/api/sendpulse-field
```

### 3. Monitoramento

```javascript
// Verificar se endpoint está funcionando
async function checkSendPulseEndpoint() {
  try {
    const response = await fetch('http://localhost:8080/api/sendpulse-field');
    const text = await response.text();
    console.log('SendPulse field:', text);
    return text;
  } catch (error) {
    console.error('Erro no endpoint SendPulse:', error);
    return 'Erro ao carregar informações do evento.';
  }
}
```

## Troubleshooting

### Problema: SendPulse não consegue acessar o endpoint

**Soluções:**
1. Verificar se servidor está rodando na porta 8080
2. Verificar configuração de CORS
3. Testar endpoint manualmente com curl

### Problema: Dados não atualizam

**Soluções:**
1. Verificar cache do SendPulse
2. Verificar cache do servidor (30 minutos)
3. Forçar atualização no banco de dados

### Problema: Formato não aparece corretamente

**Soluções:**
1. Verificar encoding UTF-8
2. Verificar se emojis são suportados
3. Testar em diferentes dispositivos

## Próximos Passos

1. **Configure o campo** no SendPulse com `$[eventinfo]`
2. **Teste o endpoint** manualmente
3. **Configure timeout** apropriado no SendPulse
4. **Monitore logs** para verificar funcionamento
5. **Teste com usuários** reais

---

**Última atualização**: Outubro 2024
**Versão**: 1.0
**Mantenedor**: Equipe UAIZOUK
