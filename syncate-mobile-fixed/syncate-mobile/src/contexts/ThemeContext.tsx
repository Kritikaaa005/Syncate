// Destination: context/ThemeContext.tsx
// Ported from src/pages/guest/ThemeContext.tsx.
// localStorage -> AsyncStorage (React Native-compatible persistence).
// window.matchMedia -> React Native's built-in useColorScheme() hook.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

interface ThemeContextValue {
  isDark: boolean;
  setIsDark: Dispatch<SetStateAction<boolean>>;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "syncate-theme"; // stores "dark" | "light"

export function ThemeProvider({ children }: { children: ReactNode }) {
  // OS-level preference, used only as a fallback until AsyncStorage resolves.
  const systemColorScheme = useColorScheme();

  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === "dark");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load the persisted choice once on mount (AsyncStorage is async, unlike
  // localStorage, so this can't happen synchronously during useState init).
  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) return;

        if (stored === "dark") {
          setIsDark(true);
        } else if (stored === "light") {
          setIsDark(false);
        } else {
          // No explicit choice made yet — fall back to the OS preference.
          setIsDark(systemColorScheme === "dark");
        }
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every time it changes, so it survives navigation and app restarts.
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark, isHydrated]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
