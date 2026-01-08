
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { useLayout } from '@/hooks/useLayout';
import Sidebar from '@/components/painel/Sidebar';
import Topbar from '@/components/painel/Topbar';
import CommandPalette from '@/components/painel/CommandPalette';
import EventConfigManager from '@/components/painel/EventConfigManager';
import ArtistasManager from '@/components/painel/ArtistasManager';
import DepoimentosManager from '@/components/painel/DepoimentosManager';
import RedirecionadoresManager from '@/components/painel/RedirecionadoresManager';
import BioLinksManager from '@/components/painel/BioLinksManager';
import FaqManager from '@/components/painel/FaqManager';
import AIInstructionsManager from '@/components/painel/AIInstructionsManager';
import CidadesManager from '@/components/painel/CidadesManager';
import LeadsManager from '@/components/painel/LeadsManager';
import FormConfigManager from '@/components/painel/FormConfigManager';
import RegistrationsView from '@/components/painel/RegistrationsView';
import UsersManager from '@/components/painel/UsersManager';

const Painel = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [activeTab, setActiveTab] = useState('evento');
  const [userEmail, setUserEmail] = useState<string>('');
  const {
    isSidebarCollapsed,
    isMobileMenuOpen,
    isCommandPaletteOpen,
    toggleSidebar,
    toggleMobileMenu,
    toggleCommandPalette,
    closeAllModals,
  } = useLayout();

  useEffect(() => {
    const validateAuth = async () => {
      const isAuth = localStorage.getItem('painelAuth');
      const userStr = localStorage.getItem('painelUser');

      if (!isAuth || !userStr) {
        navigate('/painel/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        await apiClient.verifyAuth(user.email);
        setUserEmail(user.email);
        setIsValidating(false);
      } catch (error) {
        localStorage.removeItem('painelAuth');
        localStorage.removeItem('painelUser');
        navigate('/painel/login');
      }
    };

    validateAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('painelAuth');
    localStorage.removeItem('painelUser');
    navigate('/painel/login');
  };

  if (isValidating) {
    return (
      <div className="theme-painel min-h-screen bg-background flex items-center justify-center">
        <div className="text-slate-50">Validando acesso...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'evento':
      case 'evento-geral':
        return <EventConfigManager />;
      case 'evento-faq':
        return <FaqManager />;
      case 'evento-ai-instructions':
        return <AIInstructionsManager />;
      case 'evento-redirecionadores':
        return <RedirecionadoresManager />;
      case 'inscricoes-config':
        return <FormConfigManager />;
      case 'inscricoes-view':
        return <RegistrationsView />;
      case 'artistas':
        return <ArtistasManager />;
      case 'depoimentos':
        return <DepoimentosManager />;
      case 'bio-links':
        return <BioLinksManager />;
      case 'cidades':
        return <CidadesManager />;
      case 'leads':
        return <LeadsManager />;
      case 'usuarios':
        return <UsersManager />;
      default:
        return <EventConfigManager />;
    }
  };

  return (
    <div className="theme-painel min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={toggleMobileMenu}
      />

      {/* Main Layout */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Topbar */}
        <Topbar
          onLogout={handleLogout}
          onMobileMenuToggle={toggleMobileMenu}
          onCommandPaletteOpen={toggleCommandPalette}
          userEmail={userEmail}
          onNavigate={(path) => {
            if (path.includes('?tab=')) {
              const tab = path.split('?tab=')[1];
              setActiveTab(tab);
            } else {
              navigate(path);
            }
          }}
        />

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => toggleCommandPalette()}
        onNavigate={(tab) => {
          setActiveTab(tab);
          closeAllModals();
        }}
      />
    </div>
  );
};

export default Painel;
