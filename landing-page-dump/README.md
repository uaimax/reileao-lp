# 🎉 Landing Page - Réveillon em Uberlândia | UAIZOUK

Este dump contém todos os arquivos necessários para visualizar e clonar a landing page do evento Réveillon em Uberlândia com Luan e Adriana.

## 📁 Estrutura de Arquivos

```
landing-page-dump/
├── index.html           # HTML standalone com CSS e JS inline
├── README.md            # Este arquivo
├── DATA.json            # Todos os dados/textos do site em formato JSON
└── assets/
    └── images/
        ├── hero-bg.png      # Imagem principal do hero (background)
        ├── map.png          # Imagem do mapa de localização
        └── djs/
            ├── jusanper.png # Foto DJ Ju Sanper
            └── zedolago.png # Foto DJ Zé do Lago
```

## 🎨 Design System

### Cores Principais
- **Amarelo Vibrante (CTA):** `#FFEB3B`
- **Amarelo Hover:** `#FFC107`
- **Background:** `rgb(253, 253, 253)`
- **Foreground/Texto:** `rgb(0, 0, 0)`
- **Texto Secundário:** `#374151` / `#6B7280`
- **Background Alternativo:** `#F9FAFB`
- **Gradiente Tips:** `#FEF3C7` to `#FED7AA`

### Tipografia
- **Títulos:** Bebas Neue (sans-serif)
- **Subtítulos/Datas:** Great Vibes (cursive)
- **Corpo:** Inter (sans-serif)

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📋 Estrutura da Landing Page

A página é composta pelas seguintes seções (na ordem):

1. **Header** - Fixo no topo, muda cor ao scrollar
2. **Hero** - Título principal, data, contador de dias
3. **Por que esse Réveillon** - Texto explicativo da proposta
4. **O que te espera** - Grid de 4 benefícios com ícones
5. **Para quem é?** - Texto sobre público-alvo
6. **Programação** - Informações, dicas e DJs
7. **Como chegar** - Informações de transporte + mapa
8. **Depoimentos** - Grid de vídeos do YouTube (Shorts)
9. **FAQ** - Accordion com 12 perguntas frequentes
10. **Últimas vagas** - CTA final com barra de progresso
11. **Footer** - Logo, links e copyright

## 🔗 Links Importantes (NÃO MODIFICAR)

- **WhatsApp:** `https://wa.me/5513991737852`
- **Google Maps:** `https://maps.app.goo.gl/vTbzGSgfHNEGAG3c7`
- **Instagram:** `https://instagram.com/reileaouberlandia`

## 📅 Informações do Evento

- **Data:** 31/12/2025 a 04/01/2026
- **Check-in:** 31/12/2025 às 14:59
- **Check-out:** 04/01/2026 às 08:59
- **Local:** Espaço Atrium Eventos - Uberlândia, MG
- **Organizadores:** Luan & Adriana
- **Marca:** UAIZOUK

## 🎬 Vídeos de Depoimentos (YouTube Shorts)

| ID | Título |
|---|---|
| 8W12dblQoBI | Minha primeira vez no Reveillon |
| zUk-Z7O_1z4 | Eu criei muitas expectativas com o evento... |
| 3NZK9qozcgQ | Sobre o poder se conectar profundamente... |
| pGAUNM39bNk | Me preocupo com verdadeiramente com quem está aqui... |

## 🔧 Componentes Interativos

### 1. Contador de Dias
- Atualiza automaticamente a cada minuto
- Mostra dias, horas e minutos restantes
- Data alvo: 31/12/2025 às 14:59

### 2. FAQ Accordion
- Abre/fecha ao clicar na pergunta
- Apenas uma resposta aberta por vez
- Animação suave de ícone chevron

### 3. Modal de Vídeos
- Abre ao clicar nos thumbnails de depoimentos
- YouTube embed com autoplay
- Fecha ao clicar fora ou no X

### 4. Modal de DJs
- Abre ao clicar nas fotos dos DJs
- Exibe foto ampliada com nome

### 5. Animação de Pássaros
- 4 pássaros animados (CSS puro)
- Voam da esquerda para a direita
- Loops infinitos com delays variados

### 6. Scroll Animations
- Elementos com classe `animate-on-scroll`
- Fade-in + translate ao entrar na viewport
- IntersectionObserver API

## 🚀 Para Integrar com CMS

Os principais pontos de integração com CMS são:

### Textos Dinâmicos
Consulte o arquivo `DATA.json` que contém todos os textos organizados por seção.

### Imagens
- **Hero:** Substitua `assets/images/hero-bg.png`
- **Mapa:** Substitua `assets/images/map.png`
- **DJs:** Adicione/remova em `assets/images/djs/`

### Configurações
- Progresso das vagas: `70%` (atualmente hardcoded)
- Data do evento: `2025-12-31T14:59:00`
- WhatsApp: `5513991737852`

### FAQ
Array de objetos `{question, answer}` - fácil de mapear de um CMS.

### Vídeos de Depoimentos
Array de objetos `{id, title}` onde `id` é o ID do YouTube.

## ⚠️ Dependências Externas

O HTML carrega os seguintes recursos externos:

1. **Google Fonts** - Bebas Neue, Great Vibes, Inter
2. **Lucide Icons** - CDN unpkg
3. **YouTube Thumbnails** - Para os depoimentos
4. **Bird Animation SVG** - CDN Amazon S3

## 📝 Notas para LLM

Ao integrar com um CMS:

1. **Mantenha a estrutura HTML** - A semântica está otimizada para SEO e acessibilidade
2. **Preserve as animações** - CSS e JS já estão inline e funcionam standalone
3. **Use o DATA.json** - Todos os textos estão lá para facilitar a integração
4. **Não altere os links de negócio** - WhatsApp e Maps são críticos
5. **Mobile-first** - O layout é responsivo, teste em todos os breakpoints
6. **O CTA fixo** - Aparece apenas em mobile, é importante para conversão

---

**Criado em:** Janeiro 2026
**Versão do Dump:** 1.0.0

