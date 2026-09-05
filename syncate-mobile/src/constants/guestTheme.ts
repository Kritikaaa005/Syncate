import { accentThemes, type AccentTheme } from "./accentThemes";

export type GuestThemeColors = {
  background: string;
  card: string;
  border: string;

  primary: string;
  secondary: string;
  soft: string;
  primarySoft: string;
  primaryButton: string;

  text: string;
  muted: string;

  inputBackground: string;
  inputBorder: string;

  sparkle: string;
  shadow: string;
};

export const guestTheme: {
  mode: {
    light: GuestThemeColors;
    dark: GuestThemeColors;
  };
} = {
  mode: {
    light: {
      background: "#F8FBFF",
      card: "#FFFFFF",
      border: "#E8EEF8",

      primary: accentThemes.blush.primary,
      secondary: accentThemes.blush.secondary,
      soft: accentThemes.blush.soft,
      primarySoft: accentThemes.blush.soft,
      primaryButton: accentThemes.blush.primary,

      text: "#1E1730",
      muted: "#8D8A99",

      inputBackground: "#FFFFFF",
      inputBorder: accentThemes.blush.secondary,

      sparkle: accentThemes.blush.secondary,
      shadow: accentThemes.blush.primary,
    },

    dark: {
      background: "#17111C",
      card: "#221A28",
      border: "#3A2A38",

      primary: accentThemes.blush.primary,
      secondary: accentThemes.blush.secondary,
      soft: `${accentThemes.blush.primary}33`,
      primarySoft: `${accentThemes.blush.primary}33`,
      primaryButton: accentThemes.blush.primary,

      text: "#F3EDF1",
      muted: "#B7ACB8",

      inputBackground: "#211923",
      inputBorder: `${accentThemes.blush.primary}99`,

      sparkle: accentThemes.blush.secondary,
      shadow: accentThemes.blush.primary,
    },
  },
};

export function resolveGuestTheme(
  accent: AccentTheme,
  isDark: boolean
): GuestThemeColors {
  const neutrals = guestTheme.mode[isDark ? "dark" : "light"];

  return {
    ...neutrals,
    primary: accent.primary,
    secondary: accent.secondary,
    soft: isDark ? `${accent.primary}33` : accent.soft,
    primarySoft: isDark ? `${accent.primary}33` : accent.soft,
    primaryButton: accent.primary,
    inputBorder: isDark ? `${accent.primary}99` : accent.secondary,
    sparkle: accent.secondary,
    shadow: accent.primary,
  };
}
