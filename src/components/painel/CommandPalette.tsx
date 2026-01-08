import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Settings,
  Users,
  MessageSquare,
  HelpCircle,
  Link,
  Globe,
  MapPin,
  UserCheck,
  Command,
  ArrowRight,
  Star
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  category: string;
}

const commandItems: CommandItem[] = [
  // Configurações do Evento
  {
    id: 'evento',
    label: 'Configurações do Evento',
    description: 'Configurações gerais do evento',
    icon: Settings,
    keywords: ['configurações', 'evento', 'geral', 'settings'],
    category: 'Configurações'
  },
  {
    id: 'evento-geral',
    label: 'Configurações Gerais',
    description: 'Título, data, vídeo e configurações básicas',
    icon: Settings,
    keywords: ['geral', 'básico', 'título', 'data'],
    category: 'Configurações'
  },
  {
    id: 'evento-faq',
    label: 'FAQ',
    description: 'Gerenciar perguntas frequentes',
    icon: HelpCircle,
    keywords: ['faq', 'perguntas', 'ajuda'],
    category: 'Configurações'
  },
  {
    id: 'evento-redirecionadores',
    label: 'Redirecionadores',
    description: 'Gerenciar redirecionamentos de URL',
    icon: Link,
    keywords: ['redirecionadores', 'redirect', 'url'],
    category: 'Configurações'
  },

  // Conteúdo
  {
    id: 'artistas',
    label: 'Artistas',
    description: 'Gerenciar lista de artistas',
    icon: Users,
    keywords: ['artistas', 'performers', 'dançarinos'],
    category: 'Conteúdo'
  },
  {
    id: 'depoimentos',
    label: 'Depoimentos',
    description: 'Gerenciar depoimentos de participantes',
    icon: MessageSquare,
    keywords: ['depoimentos', 'testimonials', 'comentários'],
    category: 'Conteúdo'
  },
  {
    id: 'bio-links',
    label: 'Links da Bio',
    description: 'Gerenciar links da página de bio',
    icon: Globe,
    keywords: ['bio', 'links', 'social'],
    category: 'Conteúdo'
  },

  // PRIMEIRINHO
  {
    id: 'cidades',
    label: 'Cidades',
    description: 'Gerenciar cidades participantes',
    icon: MapPin,
    keywords: ['cidades', 'localização', 'endereços', 'primeirinho'],
    category: 'PRIMEIRINHO'
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Gerenciar leads do programa PRIMEIRINHO',
    icon: UserCheck,
    keywords: ['leads', 'primeirinho', 'inscrições'],
    category: 'PRIMEIRINHO'
  }
];

const CommandPalette = ({ isOpen, onClose, onNavigate }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = commandItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onNavigate(filteredItems[selectedIndex].id);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onNavigate, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite para buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-50 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto"
        >
          {Object.keys(groupedItems).length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum resultado encontrado</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item, index) => {
                      const globalIndex = filteredItems.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-selected={isSelected}
                          onClick={() => {
                            onNavigate(item.id);
                            onClose();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                            isSelected
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "text-slate-50 hover:bg-slate-700"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-slate-400 truncate">
                              {item.description}
                            </div>
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-700 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>↑↓ navegar</span>
            <span>↵ selecionar</span>
            <span>esc fechar</span>
          </div>
          <div>
            {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
