import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n, { changeLanguage as changeLng } from '@/i18n';

type Language = 'en' | 'ne';
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean; // Nepali is LTR, but keep this hook for future languages
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(i18n.language as Language);

  useEffect(() => {
    const handler = (lng: string) => setLang(lng as Language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  const setLanguage = async (lang: Language) => {
    await changeLng(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}