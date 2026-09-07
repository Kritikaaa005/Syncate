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
import {
  accentThemes,
  isAccentThemeId,
  type AccentTheme,
  type AccentThemeId,
} from "@/constants/accentThemes";
import { resolveGuestTheme, type GuestThemeColors } from "@/constants/guestTheme";

interface ThemeContextValue {
  isDark: boolean;
  setIsDark: Dispatch<SetStateAction<boolean>>;
  toggleDark: () => void;
  accentThemeId: AccentThemeId;
  accentTheme: AccentTheme;
  setAccentTheme: (themeId: AccentThemeId) => void;
  colors: GuestThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "syncate-theme"; // stores "dark" | "light"
const ACCENT_STORAGE_KEY = "syncate-accent-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // OS-level preference, used only as a fallback until AsyncStorage resolves.
  const systemColorScheme = useColorScheme();

  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === "dark");
  const [isHydrated, setIsHydrated] = useState(false);
  const [accentThemeId, setAccentThemeId] = useState<AccentThemeId>("blush");
  const [isAccentHydrated, setIsAccentHydrated] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(ACCENT_STORAGE_KEY)
      .then((stored) => {
        if (isMounted) {
          setAccentThemeId(isAccentThemeId(stored) ? stored : "blush");
        }
      })
      .catch(() => {
        if (isMounted) setAccentThemeId("blush");
      })
      .finally(() => {
        if (isMounted) setIsAccentHydrated(true);
      });

    return () => { isMounted = false; };
  }, []);

  // Persist every time it changes, so it survives navigation and app restarts.
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark, isHydrated]);

  useEffect(() => {
    if (!isAccentHydrated) return;
    AsyncStorage.setItem(ACCENT_STORAGE_KEY, accentThemeId).catch(() => {
      // A storage failure should not prevent the in-memory theme from working.
    });
  }, [accentThemeId, isAccentHydrated]);

  const toggleDark = () => setIsDark((prev) => !prev);
  const accentTheme = accentThemes[accentThemeId];
  const colors = resolveGuestTheme(accentTheme, isDark);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, toggleDark, accentThemeId, accentTheme, setAccentTheme: setAccentThemeId, colors }}>
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
