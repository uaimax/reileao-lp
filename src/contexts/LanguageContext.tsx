import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';
import { getStorageKey } from '@/lib/site-config';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const STORAGE_KEY = getStorageKey('language');

const translations: Record<Language, Record<string, string>> = {
  pt: ptTranslations,
  en: enTranslations
};

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'pt';

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) return 'en';
  return 'pt';
}

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'pt';

  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language;
    if (stored && (stored === 'pt' || stored === 'en')) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }

  return getBrowserLanguage();
}

function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => getStoredLanguage());

  useEffect(() => {
    setStoredLanguage(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[currentLanguage][key];
    if (!translation) {
      console.warn(`Missing translation for key "${key}" in language "${currentLanguage}"`);
      return key;
    }

    // Replace placeholders like {0}, {1}, etc. with values from replacements
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

