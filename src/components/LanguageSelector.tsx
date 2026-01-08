import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();

  const currentLanguageData = languages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
          data-testid="language-selector"
        >
          <Languages className="h-4 w-4 mr-2" />
          <span className="mr-1">{currentLanguageData?.flag}</span>
          <span className="hidden sm:inline">{currentLanguageData?.name}</span>
          <span className="sm:hidden">{currentLanguageData?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border-slate-200">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className={`cursor-pointer hover:bg-slate-100 ${
              currentLanguage === language.code ? 'bg-slate-100 text-yellow-600 font-medium' : 'text-slate-600'
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
