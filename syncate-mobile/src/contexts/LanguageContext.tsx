// LOCATION: syncate-mobile/src/contexts/LanguageContext.tsx
//
// First-stage app-wide language state.
// The selector is global, but only screens that explicitly read this context
// are translated for now. English remains the fallback.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppLanguage = "en" | "ne";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "syncate.app-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    let cancelled = false;

    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!cancelled && (stored === "en" || stored === "ne")) {
          setLanguageState(stored);
        }
      } catch {
        // Language preference is convenience state. If local storage fails,
        // keep English rather than blocking the app.
      }
    };

    void loadLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);

    void AsyncStorage.setItem(STORAGE_KEY, nextLanguage).catch(() => {
      // Keep the in-memory selection even if persistence fails.
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ne" : "en");
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
