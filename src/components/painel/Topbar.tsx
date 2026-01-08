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
import { SITE_NAME } from '@/lib/site-config';

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
    <header className="sticky top-0 z-40 bg-slate-800 backdrop-blur-sm border-b border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side - Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden text-slate-400 hover:bg-slate-700 hover:text-slate-50"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-slate-50">
              {SITE_NAME} Admin
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCommandPaletteOpen}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-slate-50 hover:bg-slate-700"
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
              <div className="text-sm font-medium text-slate-50">
                {userEmail || 'Admin'}
              </div>
              <div className="text-xs text-slate-400">
                Administrador
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:bg-slate-700 hover:text-slate-50"
            >
              <User className="w-5 h-5" />
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500/10 hover:border-red-500"
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
