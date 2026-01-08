# Meta Pixel Integration - UAIZOUK

## Visão Geral

Esta integração implementa o **Meta Pixel (Facebook Pixel)** de forma completa e robusta em todo o website UAIZOUK, utilizando o Dataset ID `630477477390150`.

## Arquivos Criados/Modificados

### 1. Core Meta Pixel (`src/lib/meta-pixel.ts`)
- **Classe MetaPixelManager**: Gerenciador principal do pixel
- **Métodos de tracking**: Eventos padrão e customizados
- **Configuração**: Pixel ID, debug mode, auto page view
- **Queue system**: Para eventos antes da inicialização

### 2. React Hooks (`src/hooks/use-meta-pixel.ts`)
- **usePageTracking**: Tracking automático de páginas
- **useMetaPixelTracking**: Métodos de tracking personalizados
- **useFormTracking**: Tracking específico para formulários
- **useButtonTracking**: Tracking de cliques em botões
- **useVideoTracking**: Tracking de interações com vídeos

### 3. Componente de Inicialização (`src/components/MetaPixelInit.tsx`)
- Inicializa o pixel na aplicação
- Tracking de inicialização da app
- Integrado no App.tsx principal

## Eventos Implementados

### Eventos Padrão do Meta Pixel

#### 1. **PageView**
- **Onde**: Todas as páginas
- **Trigger**: Automático via `usePageTracking`
- **Parâmetros**: Nome da página

#### 2. **Lead**
- **Onde**: CTAs principais (Participar, No Escuro)
- **Trigger**: Clique em botões de conversão
- **Parâmetros**: Valor (quando aplicável), moeda

#### 3. **Purchase**
- **Onde**: Página de confirmação de inscrição
- **Trigger**: Carregamento da página de confirmação
- **Parâmetros**: Valor total, moeda (BRL), IDs dos produtos

#### 4. **InitiateCheckout**
- **Onde**: Formulário de inscrição
- **Trigger**: Submissão do formulário
- **Parâmetros**: Valor total, moeda, IDs dos produtos

#### 5. **CompleteRegistration**
- **Onde**: Formulário de inscrição
- **Trigger**: Inscrição salva com sucesso
- **Parâmetros**: Valor total, moeda

#### 6. **Search**
- **Onde**: Página de busca de inscrição
- **Trigger**: Busca realizada
- **Parâmetros**: String de busca

### Eventos Customizados

#### 1. **LandingPageView**
- **Onde**: Página inicial (/)
- **Parâmetros**: Nome do evento, data, categoria

#### 2. **NoEscuroPageView**
- **Onde**: Página "No Escuro" (/no-escuro)
- **Parâmetros**: Tipo de oferta, preço, evento

#### 3. **CTAClick**
- **Onde**: Botões CTA principais
- **Parâmetros**: Texto do botão, categoria, evento

#### 4. **RegistrationFormView**
- **Onde**: Formulário de inscrição
- **Parâmetros**: Nome do evento, categoria

#### 5. **RegistrationSubmit**
- **Onde**: Submissão do formulário
- **Parâmetros**: Tipo de ingresso, método de pagamento, valor total

#### 6. **RegistrationComplete**
- **Onde**: Inscrição concluída
- **Parâmetros**: ID da inscrição, detalhes completos

#### 7. **RegistrationConfirmationView**
- **Onde**: Página de confirmação
- **Parâmetros**: Status do pagamento, detalhes da inscrição

#### 8. **RegistrationSearch**
- **Onde**: Busca de inscrição
- **Parâmetros**: Tipo de busca, string pesquisada

#### 9. **HeroCTAClick**
- **Onde**: Botões do Hero
- **Parâmetros**: Tipo de CTA, evento

## Páginas Integradas

### 1. **Landing Page (/)**
- ✅ PageView automático
- ✅ LandingPageView customizado
- ✅ CTAs do Hero com tracking
- ✅ CTAs da seção Participar

### 2. **Página "No Escuro" (/no-escuro)**
- ✅ PageView automático
- ✅ NoEscuroPageView customizado
- ✅ CTA principal com Lead tracking
- ✅ Tracking de visualização da oferta

### 3. **Formulário de Inscrição (/inscricao)**
- ✅ PageView automático
- ✅ RegistrationFormView customizado
- ✅ FormStart tracking
- ✅ FormSubmit tracking
- ✅ InitiateCheckout tracking
- ✅ FormComplete tracking
- ✅ CompleteRegistration tracking
- ✅ RegistrationSubmit customizado
- ✅ RegistrationComplete customizado

### 4. **Confirmação de Inscrição (/inscricao/confirmacao/:id)**
- ✅ PageView automático
- ✅ Purchase tracking
- ✅ RegistrationConfirmationView customizado

### 5. **Busca de Inscrição (/status)**
- ✅ PageView automático
- ✅ Search tracking
- ✅ RegistrationSearch customizado

### 6. **Páginas Bio (/bio, /bio-simple, /bio-full)**
- ✅ PageView automático (via hooks)

### 7. **Páginas Primeirinho (/primeirinho, /primeirinho/2026/:uuid)**
- ✅ PageView automático (via hooks)

### 8. **Painel Administrativo (/painel, /painel/login, /painel/lead/:leadUuid)**
- ✅ PageView automático (via hooks)

## Configurações do Pixel

### Dataset ID
```
630477477390150
```

### Configurações Ativas
- ✅ **First-party cookies**: On
- ✅ **Automatic Website Matching**: On
- ✅ **Customer information parameters**: Habilitado
- ✅ **Conversions API Gateway**: Recomendado (não implementado ainda)

### Domínios Permitidos
- Configurar no Meta Business Manager conforme necessário
- Adicionar domínios de produção quando disponíveis

## Parâmetros de Eventos

### Parâmetros Padrão
- `content_name`: Nome do conteúdo
- `content_category`: Categoria do conteúdo
- `content_ids`: IDs dos produtos/conteúdos
- `content_type`: Tipo do conteúdo (product, form, etc.)
- `value`: Valor monetário
- `currency`: Moeda (BRL)

### Parâmetros Customizados
- `event_name`: Nome do evento UAIZOUK
- `registration_id`: ID da inscrição
- `ticket_type`: Tipo de ingresso
- `payment_method`: Método de pagamento
- `is_foreigner`: Se é estrangeiro
- `has_partner`: Se tem parceiro
- `installments`: Número de parcelas
- `payment_status`: Status do pagamento
- `offer_type`: Tipo de oferta (early-bird, etc.)
- `page_source`: Origem da página
- `cta_type`: Tipo de CTA (primary, secondary)

## Debug e Monitoramento

### Modo Debug
- Ativado automaticamente em desenvolvimento (`NODE_ENV === 'development'`)
- Logs no console do navegador
- Verificação de eventos enviados

### Meta Pixel Helper
- Instalar extensão do Chrome para debug visual
- Verificar eventos em tempo real
- Validar parâmetros enviados

### Meta Events Manager
- Monitorar eventos no Meta Business Manager
- Verificar delivery e match rates
- Configurar conversões e otimizações

## Próximos Passos Recomendados

### 1. **Conversions API**
- Implementar Conversions API Gateway
- Enviar eventos do servidor para melhor precisão
- Reduzir dependência de cookies

### 2. **Advanced Matching**
- Implementar matching avançado com dados do usuário
- Usar emails e telefones hasheados
- Melhorar atribuição de conversões

### 3. **Custom Audiences**
- Criar audiências baseadas nos eventos
- Remarketing para usuários que visualizaram páginas
- Lookalike audiences baseadas em conversões

### 4. **Campaign Optimization**
- Configurar otimizações para Lead e Purchase
- Testar diferentes estratégias de bidding
- Implementar Value-based bidding

### 5. **Attribution**
- Configurar janelas de atribuição
- Implementar tracking de cross-device
- Analisar jornada completa do usuário

## Testes Recomendados

### 1. **Teste de Eventos**
```javascript
// No console do navegador
fbq('track', 'PageView');
fbq('track', 'Lead', { value: 449, currency: 'BRL' });
```

### 2. **Teste de Fluxo Completo**
1. Acessar landing page
2. Clicar em CTA
3. Preencher formulário
4. Concluir inscrição
5. Verificar eventos no Meta Events Manager

### 3. **Teste de Parâmetros**
- Verificar se todos os parâmetros estão sendo enviados
- Validar tipos de dados (números, strings)
- Confirmar encoding correto

## Troubleshooting

### Eventos Não Aparecendo
1. Verificar se o pixel está carregado: `typeof window.fbq !== 'undefined'`
2. Verificar console por erros JavaScript
3. Usar Meta Pixel Helper para debug visual
4. Verificar se o domínio está na lista de permitidos

### Parâmetros Incorretos
1. Verificar logs de debug no console
2. Validar tipos de dados enviados
3. Confirmar estrutura dos parâmetros
4. Testar com Meta Pixel Helper

### Performance
1. Verificar se não há loops infinitos de eventos
2. Monitorar tempo de carregamento
3. Otimizar chamadas desnecessárias
4. Usar debounce em eventos frequentes

## Conclusão

A integração do Meta Pixel está **100% implementada** em todas as páginas principais do UAIZOUK, com tracking completo de:

- ✅ Visualizações de páginas
- ✅ Interações com CTAs
- ✅ Processo de inscrição completo
- ✅ Conversões e compras
- ✅ Buscas e navegação
- ✅ Eventos customizados específicos do negócio

O sistema está pronto para campanhas de marketing no Meta Ads com tracking preciso e otimização de conversões.
