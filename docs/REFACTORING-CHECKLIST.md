# Checklist de Refatoração do Design System

## Objetivo
Remover todas as cores customizadas e usar apenas Tailwind CSS padrão (slate, gray, yellow, green, red, orange).

## Padrões a Substituir

| Padrão Antigo | Novo Padrão |
|---------------|-------------|
| `glass-effect border-neon-purple/30` | `bg-slate-800 border-slate-700` |
| `text-soft-white` | `text-slate-50` |
| `text-text-gray` | `text-slate-400` |
| `text-neon-magenta` | `text-slate-50` |
| `text-neon-cyan` | `text-yellow-500` |
| `text-neon-purple` | `text-yellow-500` |
| `bg-dark-bg` ou `bg-dark-bg/50` | `bg-slate-700` |
| `border-neon-purple/30` | `border-slate-600` |
| `btn-neon` | `bg-yellow-500 hover:bg-yellow-600 text-slate-900` |
| `hover:text-dark-bg` | `hover:text-slate-900` |
| `bg-[#...]` | Usar classe Tailwind correspondente |
| `text-[#...]` | Usar classe Tailwind correspondente |
| `border-[#...]` | Usar classe Tailwind correspondente |

---

## Componentes do Painel (16 arquivos - 338 ocorrências) ✅ CONCLUÍDO

### Alta Prioridade (Mais ocorrências)

- [x] **RegistrationsView.tsx** ✅
- [x] **BioLinksManager.tsx** ✅
- [x] **LeadsManager.tsx** ✅
- [x] **CidadesManager.tsx** ✅
- [x] **RedirecionadoresManager.tsx** ✅
- [x] **EventConfigManager.tsx** ✅
- [x] **UsersManager.tsx** ✅
- [x] **ArtistasManager.tsx** ✅
- [x] **DepoimentosManager.tsx** ✅

### Média Prioridade

- [x] **EventoConfig.tsx** ✅
- [x] **Notifications.tsx** ✅
- [x] **RegistrationsViewSimple.tsx** ✅
- [x] **CommandPalette.tsx** ✅
- [x] **FormConfigManager.tsx** ✅

### Baixa Prioridade

- [x] **FaqManager.tsx** ✅
- [x] **AIInstructionsManager.tsx** ✅
- [x] **RegistrationsViewTest.tsx** ✅

---

## Componentes da Landing Page / Reveillon ✅ CONCLUÍDO

- [x] **TestimonialCarousel.tsx** ✅
- [x] **LastSpotsSection.tsx** ✅
- [x] **ProgressBar.tsx** ✅

---

## Progresso

- **Total de arquivos do painel**: 16
- **Arquivos concluídos**: 16
- **Ocorrências restantes no painel**: 0
- **Progresso**: 100% ✅

---

## Comandos Úteis para Verificação

```bash
# Verificar ocorrências restantes no painel
grep -r "glass-effect\|neon-\|text-gray\|dark-bg\|soft-white\|btn-neon\|text-text-gray" src/components/painel --include="*.tsx" | wc -l

# Verificar cores hex diretas em src/
grep -r "bg-\[#\|text-\[#\|border-\[#" src/ --include="*.tsx" | wc -l
```

---

## Última Atualização
Data: 2026-01-08 - Todos os componentes do painel foram refatorados!

