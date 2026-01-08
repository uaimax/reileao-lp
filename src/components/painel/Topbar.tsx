import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  LogOut,
  Menu,
  Command,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Notifications from './Notifications';

interface TopbarProps {
  onLogout: () => void;
  onMobileMenuToggle: () => void;
  onCommandPaletteOpen: () => void;
  userEmail?: string;
  onNavigate?: (path: string) => void;
}

const Topbar = ({
  onLogout,
  onMobileMenuToggle,
  onCommandPaletteOpen,
  userEmail,
  onNavigate
}: TopbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca global aqui
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur-sm border-b border-neon-purple/20">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side - Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden text-soft-white hover:bg-neon-purple/10"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold gradient-text">
              UAIZOUK Admin
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-gray" />
            <Input
              type="text"
              placeholder="Buscar... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-bg/50 border-neon-purple/30 text-soft-white placeholder:text-text-gray focus:border-neon-purple"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCommandPaletteOpen}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-text-gray hover:text-soft-white"
            >
              <Command className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Right side - Notifications + User menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {userEmail && onNavigate && (
            <Notifications userEmail={userEmail} onNavigate={onNavigate} />
          )}

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-soft-white">
                {userEmail || 'Admin'}
              </div>
              <div className="text-xs text-text-gray">
                Administrador
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-soft-white hover:bg-neon-purple/10"
            >
              <User className="w-5 h-5" />
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
