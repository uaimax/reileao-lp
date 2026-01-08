# Endpoint de Dados Estruturados - UAIZOUK

## Visão Geral

O endpoint `/api/structured-data` fornece todas as informações dinâmicas da página raiz "/" em formato JSON estruturado, otimizado para consumo por IAs e sistemas automatizados. Este endpoint serve como uma **fonte única de verdade** para todas as informações do evento UAIZOUK.

## URL do Endpoint

```
GET /api/structured-data
```

## Características

- **Formato**: JSON estruturado
- **Cache**: 5 minutos (300 segundos)
- **CORS**: Habilitado para todos os domínios
- **Encoding**: UTF-8
- **Content-Type**: `application/json`

## Estrutura dos Dados

### Metadata
```json
{
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "version": "1.0",
    "purpose": "AI-consumable structured data for UAIZOUK event information",
    "source": "UAIZOUK Landing Page Database"
  }
}
```

### Evento (Event)
```json
{
  "event": {
    "title": "UAIZOUK 2025",
    "subtitle": "UMA IMERSÃO NAS POSSIBILIDADES DO ZOUK BRASILEIRO",
    "tagline": "Muita aula. Muita dança. Muito Zouk.",
    "dateDisplay": "5–7 SET 2025, Uberlândia–MG",
    "countdownTarget": "2025-09-05T17:00:00.000Z",
    "countdownText": "A experiência completa inicia em:",
    "registrationUrl": "https://uaizouk.com.br/inscricoes",
    "whatsappNumber": "5534988364084",
    "whatsappMessage": "Oi! Quero mais informações sobre o UAIZOUK",
    "whatsappEnabled": true,
    "heroVideoUrl": "https://www.youtube.com/embed/..."
  }
}
```

### Estatísticas (Stats)
```json
{
  "stats": {
    "sectionTitle": "Já passaram pelo UAIZOUK mais de",
    "participants": {
      "count": 3190,
      "label": "Participantes"
    },
    "teachers": {
      "count": 56,
      "label": "Professores"
    },
    "djs": {
      "count": 25,
      "label": "DJs"
    },
    "partyHours": {
      "count": 300,
      "label": "Horas de balada"
    }
  }
}
```

### Artistas (Artists)
```json
{
  "artists": {
    "sectionTitle": "Professores Confirmados",
    "sectionSubtitle": "Conheça quem vai ministrar as aulas",
    "list": [
      {
        "id": 1,
        "name": "Luan e Adriana",
        "role": "Professores Confirmados",
        "cityState": "SP",
        "photoUrl": "https://images.unsplash.com/...",
        "description": "Professores renomados de Zouk",
        "promotionalVideoUrl": null,
        "displayOrder": 1,
        "isActive": true
      }
    ]
  }
}
```

### FAQ
```json
{
  "faq": {
    "sectionTitle": "Perguntas Frequentes",
    "sectionSubtitle": "Tire suas dúvidas sobre o evento",
    "questions": [
      {
        "id": 1,
        "question": "Quando acontece o UAIZOUK?",
        "answer": "O evento acontece de 5 a 7 de setembro de 2025...",
        "displayOrder": 1,
        "isActive": true
      }
    ]
  }
}
```

### Localização (Location)
```json
{
  "location": {
    "sectionTitle": "Onde acontece",
    "sectionSubtitle": "Uberlândia-MG",
    "city": "Uberlândia",
    "state": "MG",
    "country": "Brasil",
    "description": "Descrição do local...",
    "imageUrl": "https://images.unsplash.com/...",
    "mapEmbedUrl": "https://maps.google.com/embed/..."
  }
}
```

## Exemplo de Uso

### JavaScript/Node.js
```javascript
const response = await fetch('/api/structured-data');
const data = await response.json();

console.log('Evento:', data.event.title);
console.log('Data:', data.event.dateDisplay);
console.log('Artistas confirmados:', data.artists.list.length);
console.log('Total de participantes:', data.stats.participants.count);
```

### Python
```python
import requests
import json

response = requests.get('/api/structured-data')
data = response.json()

print(f"Evento: {data['event']['title']}")
print(f"Data: {data['event']['dateDisplay']}")
print(f"Artistas confirmados: {len(data['artists']['list'])}")
print(f"Total de participantes: {data['stats']['participants']['count']}")
```

### cURL
```bash
curl -X GET "https://uaizouk.com.br/api/structured-data" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json"
```

## Casos de Uso

### 1. Chatbots e Assistentes Virtuais
- Responder perguntas sobre o evento
- Fornecer informações atualizadas sobre datas, localização, artistas
- Verificar status de inscrições

### 2. Sistemas de Notificação
- Enviar lembretes sobre datas importantes
- Notificar sobre novos artistas confirmados
- Alertar sobre mudanças no evento

### 3. Integrações com Redes Sociais
- Postar automaticamente sobre novos artistas
- Compartilhar estatísticas do evento
- Sincronizar informações entre plataformas

### 4. Análise de Dados
- Monitorar crescimento do evento
- Analisar engajamento com diferentes seções
- Gerar relatórios automáticos

### 5. Aplicações Mobile
- Sincronizar dados offline
- Notificações push personalizadas
- Compartilhamento de informações

## Interface Web

Acesse `/structured-data` para visualizar os dados em uma interface amigável que inclui:

- **Visualização estruturada** dos dados
- **JSON raw** para desenvolvedores
- **Botões de ação**: copiar, baixar, atualizar
- **Metadata** do sistema
- **Estatísticas** em tempo real

## Tratamento de Erros

### Respostas de Erro
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch structured data",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Códigos de Status HTTP
- `200`: Sucesso
- `500`: Erro interno do servidor
- `503`: Serviço temporariamente indisponível

## Cache e Performance

- **Cache**: 5 minutos para otimizar performance
- **Headers**: Inclui `Cache-Control` apropriado
- **CORS**: Configurado para permitir acesso de qualquer origem
- **Compressão**: Suporta compressão gzip

## Segurança

- **Apenas leitura**: Endpoint somente GET
- **Sem autenticação**: Dados públicos do evento
- **Rate limiting**: Implementado no nível do servidor
- **Validação**: Dados validados antes do retorno

## Monitoramento

O endpoint inclui logs para:
- Requisições bem-sucedidas
- Erros de banco de dados
- Tempo de resposta
- Uso de cache

## Atualizações

Os dados são atualizados automaticamente quando:
- Novos artistas são adicionados
- Informações do evento são modificadas
- FAQs são atualizadas
- Estatísticas são recalculadas

## Suporte

Para dúvidas ou problemas com o endpoint:
- Verifique os logs do servidor
- Confirme se o banco de dados está acessível
- Teste com dados mock se necessário
- Consulte a documentação da API principal

---

**Última atualização**: Janeiro 2024
**Versão**: 1.0
**Mantenedor**: Equipe UAIZOUK
