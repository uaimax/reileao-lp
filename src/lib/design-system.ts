/**
 * Design System Tokens
 *
 * Este arquivo contém os tokens de design do sistema, baseado em shadcn/ui padrão
 * com cores simplificadas do Tailwind.
 *
 * Princípios:
 * - Usar apenas cores Tailwind padrão (slate, gray, yellow, green, red)
 * - Manter consistência entre /inscricao e /painel
 * - Priorizar componentes shadcn/ui sem customizações excessivas
 */

// ============================================================================
// CORES
// ============================================================================

export const colors = {
  // Backgrounds (Light Theme - Landing/Inscrição)
  light: {
    background: 'bg-white',
    surface: 'bg-slate-50',
    card: 'bg-white',
    muted: 'bg-slate-100',
  },

  // Backgrounds (Dark Theme - Painel)
  dark: {
    background: 'bg-slate-900',
    surface: 'bg-slate-800',
    card: 'bg-slate-800',
    raised: 'bg-slate-700',
    muted: 'bg-slate-800',
  },

  // Text Colors
  text: {
    primary: 'text-slate-900',      // Light theme
    secondary: 'text-slate-600',    // Light theme
    muted: 'text-slate-500',        // Light theme
    primaryDark: 'text-slate-50',    // Dark theme
    secondaryDark: 'text-slate-400', // Dark theme
    mutedDark: 'text-slate-500',     // Dark theme
  },

  // Borders
  border: {
    light: 'border-slate-200',
    medium: 'border-slate-300',
    dark: 'border-slate-700',
    darker: 'border-slate-600',
  },

  // Semantic Colors
  semantic: {
    primary: 'bg-yellow-500',
    primaryHover: 'hover:bg-yellow-600',
    primaryText: 'text-yellow-500',
    success: 'bg-green-500',
    successText: 'text-green-500',
    destructive: 'bg-red-500',
    destructiveText: 'text-red-500',
    warning: 'bg-orange-500',
    warningText: 'text-orange-500',
  },

  // Input States
  input: {
    light: {
      bg: 'bg-white',
      border: 'border-slate-300',
      focus: 'focus:border-yellow-500 focus:ring-yellow-500',
      placeholder: 'placeholder:text-slate-400',
    },
    dark: {
      bg: 'bg-slate-700',
      border: 'border-slate-600',
      focus: 'focus:border-yellow-500 focus:ring-yellow-500',
      placeholder: 'placeholder:text-slate-400',
    },
  },
} as const;

// ============================================================================
// ESPAÇAMENTO
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// Tailwind spacing classes
export const spacingClasses = {
  xs: 'space-y-1',      // 4px
  sm: 'space-y-2',     // 8px
  md: 'space-y-4',     // 16px
  lg: 'space-y-6',     // 24px
  xl: 'space-y-8',     // 32px
  '2xl': 'space-y-12', // 48px
} as const;

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const typography = {
  // Font Sizes (Tailwind padrão)
  xs: 'text-xs',      // 12px
  sm: 'text-sm',      // 14px
  base: 'text-base',  // 16px
  lg: 'text-lg',      // 18px
  xl: 'text-xl',      // 20px
  '2xl': 'text-2xl',  // 24px
  '3xl': 'text-3xl',  // 30px
  '4xl': 'text-4xl',  // 36px

  // Font Weights
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',

  // Line Heights
  tight: 'leading-tight',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
} as const;

// ============================================================================
// BORDAS E RADIUS
// ============================================================================

export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm',   // 2px
  md: 'rounded-md',   // 6px
  lg: 'rounded-lg',   // 8px
  xl: 'rounded-xl',   // 12px
  full: 'rounded-full',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  base: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retorna classes para um card no tema light
 */
export function getLightCardClasses(variant: 'default' | 'bordered' = 'default') {
  const base = `${colors.light.card} ${shadows.md} ${radius.lg}`;
  return variant === 'bordered'
    ? `${base} ${colors.border.light} border`
    : base;
}

/**
 * Retorna classes para um card no tema dark
 */
export function getDarkCardClasses(variant: 'default' | 'bordered' = 'default') {
  const base = `${colors.dark.card} ${shadows.md} ${radius.lg}`;
  return variant === 'bordered'
    ? `${base} ${colors.border.dark} border`
    : base;
}

/**
 * Retorna classes para um botão primário
 */
export function getPrimaryButtonClasses() {
  return `${colors.semantic.primary} ${colors.semantic.primaryHover} text-slate-900 font-semibold ${radius.lg} ${transitions.base}`;
}

/**
 * Retorna classes para input no tema light
 */
export function getLightInputClasses() {
  return `${colors.input.light.bg} ${colors.input.light.border} border ${colors.input.light.focus} ${colors.input.light.placeholder} ${radius.md}`;
}

/**
 * Retorna classes para input no tema dark
 */
export function getDarkInputClasses() {
  return `${colors.input.dark.bg} ${colors.input.dark.border} border ${colors.text.primaryDark} ${colors.input.dark.focus} ${colors.input.dark.placeholder} ${radius.md}`;
}

