# Design System - UAIZOUK

Este documento descreve o design system do projeto UAIZOUK, baseado em **shadcn/ui padrão** com cores simplificadas do Tailwind CSS.

## Princípios Fundamentais

1. **Simplicidade**: Usar apenas cores Tailwind padrão
2. **Consistência**: Mesmos padrões em `/inscricao` e `/painel`
3. **shadcn/ui First**: Priorizar componentes do shadcn sem customizações excessivas
4. **Semantic Colors**: Cores apenas para significado (primary, success, destructive)
5. **Spacing Grid**: Usar escala 4px (4, 8, 12, 16, 24, 32, 48, 64)
6. **Typography Scale**: Usar escala padrão (12, 14, 16, 18, 20, 24, 30, 36)

## Paleta de Cores

### Cores Base (Tailwind Padrão)

#### Slate (Backgrounds e Superfícies)
- `slate-50` a `slate-950` - Para backgrounds, cards e superfícies
- **Light Theme**: `slate-50` (background), `white` (cards)
- **Dark Theme**: `slate-900` (background), `slate-800` (cards), `slate-700` (raised)

#### Gray (Textos e Borders)
- `gray-50` a `gray-950` - Para textos secundários e borders
- **Light Theme**: `slate-900` (texto primário), `slate-600` (texto secundário), `slate-400` (texto muted)
- **Dark Theme**: `slate-50` (texto primário), `slate-400` (texto secundário), `slate-500` (texto muted)

#### Yellow (Ações Primárias)
- `yellow-400` / `yellow-500` - Apenas para ações primárias e CTAs
- `yellow-600` - Hover state
- **Uso**: Botões primários, itens ativos, focus rings

#### Green (Success States)
- `green-500` - Estados de sucesso
- **Uso**: Stepper completo, badges de sucesso, confirmações

#### Red (Destructive/Error)
- `red-500` - Estados de erro e ações destrutivas
- **Uso**: Botões de deletar, mensagens de erro, validações

#### Orange (Warning)
- `orange-500` - Estados de aviso
- **Uso**: Badges de aviso, cards de redirecionamento

## Temas

### Light Theme (Landing/Inscrição)

```css
Background: white ou slate-50
Texto: slate-900 (primário), slate-600 (secundário)
Cards: white com border-slate-200
Primary: yellow-500
Borders: slate-200, slate-300
```

### Dark Theme (Painel)

```css
Background: slate-900
Texto: slate-50 (primário), slate-400 (secundário)
Cards: slate-800 com border-slate-700
Primary: yellow-500
Borders: slate-700, slate-600
Raised: slate-700
```

## Espaçamento

Usar escala de 4px:

- `xs`: 4px (`space-y-1`)
- `sm`: 8px (`space-y-2`)
- `md`: 16px (`space-y-4`)
- `lg`: 24px (`space-y-6`)
- `xl`: 32px (`space-y-8`)
- `2xl`: 48px (`space-y-12`)
- `3xl`: 64px

### Espaçamento entre Elementos

- **Label e Input**: `mb-2` (8px)
- **Grupos de Campos**: `mb-6` (24px)
- **Seções**: `space-y-6` (24px)

## Tipografia

### Font Sizes (Tailwind padrão)

- `text-xs`: 12px - Helper text, labels pequenos
- `text-sm`: 14px - Labels, helper text
- `text-base`: 16px - Body text padrão
- `text-lg`: 18px - Section titles
- `text-xl`: 20px - Subtítulos
- `text-2xl`: 24px - Page titles
- `text-3xl`: 30px - Headings grandes
- `text-4xl`: 36px - Hero titles

### Font Weights

- `font-normal`: 400 - Body text
- `font-medium`: 500 - Labels, section titles
- `font-semibold`: 600 - Page titles
- `font-bold`: 700 - Headings destacados

### Font Families

- `font-inter`: Inter (padrão)
- `font-bebas`: Bebas Neue (apenas landing page)
- `font-script`: Great Vibes (apenas landing page)

## Componentes

### Cards

#### Light Theme
```tsx
<Card className="bg-white border border-slate-200 shadow-md">
```

#### Dark Theme
```tsx
<Card className="bg-slate-800 border border-slate-700 shadow-md">
```

#### Cards com Accent Bar (Painel)
```tsx
{/* WhatsApp */}
<div className="bg-slate-800 border-l-4 border-l-green-500 shadow-md">

{/* Redirect */}
<div className="bg-slate-800 border-l-4 border-l-orange-500 shadow-md">
```

### Inputs

#### Light Theme
```tsx
<Input className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500" />
```

#### Dark Theme
```tsx
<Input className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500" />
```

### Botões

#### Primary Button
```tsx
<Button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold">
```

#### Secondary Button (Dark Theme)
```tsx
<Button className="bg-slate-900 hover:bg-slate-800 text-white">
```

#### Destructive Button
```tsx
<Button className="border-red-500 text-red-500 hover:bg-red-500/10">
```

### Stepper

```tsx
// Pendente
bg-slate-200 text-slate-500 border-slate-300

// Ativo
bg-yellow-500 text-slate-900 border-yellow-500

// Completo
bg-green-500 text-white border-green-500
```

## Estados de Input

### Default
- Border: `border-slate-300` (light) / `border-slate-600` (dark)
- Background: `bg-white` (light) / `bg-slate-700` (dark)

### Focus
- Border: `border-yellow-500`
- Ring: `focus:ring-2 focus:ring-yellow-500/20`

### Error
- Border: `border-red-500`
- Helper text: `text-red-500`

### Disabled
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`
- Background: `bg-slate-50` (light) / `bg-slate-800` (dark)

## Regras de Uso

### ✅ DO

- Usar cores Tailwind padrão (slate, gray, yellow, green, red, orange)
- Manter consistência entre `/inscricao` e `/painel`
- Usar componentes shadcn/ui sem customizações excessivas
- Seguir escala de espaçamento de 4px
- Usar cores semânticas (primary, success, destructive)

### ❌ DON'T

- Criar cores customizadas sem justificativa
- Usar cores hex diretas (`#FFEB3B`) - usar classes Tailwind
- Misturar temas (light/dark) na mesma página
- Usar cores neon ou gradientes excessivos
- Personalizar componentes shadcn além do necessário

## Arquivos de Referência

- **Design Tokens TypeScript**: `src/lib/design-system.ts`
- **Design Tokens CSS**: `src/styles/design-tokens.css`
- **Tailwind Config**: `tailwind.config.ts`
- **CSS Global**: `src/index.css`

## Exemplos de Uso

### Formulário Light Theme
```tsx
<div className="space-y-6">
  <div className="space-y-2">
    <Label className="text-slate-900 text-sm font-medium">
      Nome Completo
    </Label>
    <Input
      className="bg-white border-slate-300 text-slate-900
                 placeholder:text-slate-400
                 focus:border-yellow-500 focus:ring-yellow-500"
    />
    <p className="text-slate-500 text-xs">Helper text aqui</p>
  </div>
</div>
```

### Formulário Dark Theme
```tsx
<div className="space-y-6">
  <div className="space-y-2">
    <Label className="text-slate-50 text-sm font-medium">
      Nome Completo
    </Label>
    <Input
      className="bg-slate-700 border-slate-600 text-slate-50
                 placeholder:text-slate-400
                 focus:border-yellow-500 focus:ring-yellow-500"
    />
    <p className="text-slate-400 text-xs">Helper text aqui</p>
  </div>
</div>
```

### Card com Accent Bar
```tsx
<div className="p-6 bg-slate-800 rounded-lg border-l-4 border-l-green-500 shadow-md">
  <h4 className="text-lg font-semibold text-green-500">
    Título Colorido
  </h4>
  <p className="text-slate-50 mt-2">
    Conteúdo em cor neutra
  </p>
</div>
```



