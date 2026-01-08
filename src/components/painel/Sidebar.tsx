import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Users,
  MessageSquare,
  HelpCircle,
  Link,
  Globe,
  MapPin,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Star,
  FileText,
  Shield,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'evento',
    label: 'Configurações do Evento',
    icon: Settings,
    children: [
      { id: 'evento-geral', label: 'Geral', icon: Settings },
      { id: 'evento-faq', label: 'FAQ', icon: HelpCircle },
      { id: 'evento-ai-instructions', label: 'Instruções para IA', icon: Bot },
      { id: 'evento-redirecionadores', label: 'Redirecionadores', icon: Link },
        { id: 'inscricoes-config', label: 'Configuração do Formulário', icon: FileText },
        { id: 'inscricoes-view', label: 'Visualizar Inscrições', icon: Users },
    ]
  },
  {
    id: 'artistas',
    label: 'Artistas',
    icon: Users,
  },
  {
    id: 'depoimentos',
    label: 'Depoimentos',
    icon: MessageSquare,
  },
  {
    id: 'bio-links',
    label: 'Links da Bio',
    icon: Globe,
  },
  {
    id: 'primeirinho',
    label: 'PRIMEIRINHO',
    icon: Star,
    children: [
      { id: 'cidades', label: 'Cidades', icon: MapPin },
      { id: 'leads', label: 'Leads', icon: UserCheck },
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: Shield,
  },
];

const Sidebar = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileToggle
}: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['evento']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (isMobileOpen) {
      onMobileToggle();
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = activeTab === item.id || (hasChildren && item.children?.some(child => activeTab === child.id));

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-auto p-3 hover:bg-neon-purple/10 transition-colors min-w-0",
            level > 0 && "ml-4",
            isActive && "bg-neon-purple/20 text-neon-purple border-r-2 border-neon-purple",
            isCollapsed && "px-2"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleItemClick(item.id);
            }
          }}
        >
          <item.icon className={cn("w-5 h-5 flex-shrink-0", isCollapsed && "mx-auto")} />
          {!isCollapsed && (
            <>
              <span className="ml-3 flex-1 text-sm font-medium">{item.label}</span>
              {hasChildren && (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              )}
            </>
          )}
        </Button>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="ml-4 space-y-1">
            {item.children?.map(child => (
              <Button
                key={child.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto p-2 hover:bg-neon-purple/10 transition-colors",
                  activeTab === child.id && "bg-neon-purple/20 text-neon-purple"
                )}
                onClick={() => handleItemClick(child.id)}
              >
                <child.icon className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3 text-sm">{child.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-dark-bg/95 backdrop-blur-sm border-r border-neon-purple/20 z-50 transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neon-purple/20 min-w-0">
          {!isCollapsed && (
            <h2 className="text-lg font-bold gradient-text truncate">Painel UAIZOUK</h2>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex text-soft-white hover:bg-neon-purple/10"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileToggle}
              className="lg:hidden text-soft-white hover:bg-neon-purple/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-neon-purple/20 min-w-0">
            <div className="text-xs text-text-gray truncate">
              UAIZOUK Admin v1.0
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
