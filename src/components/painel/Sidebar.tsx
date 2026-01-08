import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-config';
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
        {level === 0 && (
          <div className="px-3 py-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {item.label}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-auto p-3 transition-all duration-200 min-w-0",
            level > 0 && "ml-4 pl-6",
            level === 0 && "mb-1",
            isActive && level === 0 && "bg-yellow-500 text-slate-900 font-semibold",
            !isActive && level === 0 && "text-slate-400 hover:bg-slate-800 hover:text-slate-50",
            isActive && level > 0 && "bg-slate-800 text-yellow-500 border-l-2 border-yellow-500",
            !isActive && level > 0 && "text-slate-400 hover:bg-slate-800 hover:text-slate-50",
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
              <span className="ml-3 flex-1 text-sm">{item.label}</span>
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
          <div className="ml-4 space-y-0.5 mt-1">
            {item.children?.map(child => (
              <Button
                key={child.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto p-2.5 transition-all duration-200",
                  activeTab === child.id && "bg-slate-800 text-yellow-500 border-l-2 border-yellow-500",
                  activeTab !== child.id && "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
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
        "fixed left-0 top-0 h-full bg-slate-900 backdrop-blur-sm border-r border-slate-700 z-50 transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 min-w-0">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-slate-50 truncate">Painel {SITE_NAME}</h2>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileToggle}
              className="lg:hidden text-slate-400 hover:bg-slate-800 hover:text-slate-50"
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
          <div className="p-4 border-t border-slate-700 min-w-0 bg-slate-800">
            <div className="text-xs text-slate-400 font-medium truncate">
              {SITE_NAME} Admin v1.0
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
