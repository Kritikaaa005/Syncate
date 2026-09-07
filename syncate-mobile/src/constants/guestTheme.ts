// LOCATION: syncate-mobile/src/constants/guestTheme.ts

import {
  accentThemes,
  type AccentTheme,
} from "./accentThemes";

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


/**
 * Builds the active UI theme from:
 * - the current light/dark mode
 * - the user's selected accent theme
 */
export function resolveGuestTheme(
  accent: AccentTheme,
  isDark: boolean
): GuestThemeColors {
  const neutrals =
    guestTheme.mode[
      isDark ? "dark" : "light"
    ];

  return {
    ...neutrals,

    primary: accent.primary,
    secondary: accent.secondary,

    soft: isDark
      ? `${accent.primary}33`
      : accent.soft,

    primarySoft: isDark
      ? `${accent.primary}33`
      : accent.soft,

    primaryButton: accent.primary,

    inputBorder: isDark
      ? `${accent.primary}99`
      : accent.secondary,

    sparkle: accent.secondary,
    shadow: accent.primary,
  };
}


// === Cycle phase colors ===
// These keys match the backend's cycle phase values exactly.
// The calendar and other cycle UI depend on these names.

export type CyclePhaseKey =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal";

export type CyclePhaseThemeEntry = {
  // Solid color — dots, legend swatches, today ring, etc.
  color: string;

  // Pale background tint for calendar cells.
  soft: string;

  label: string;
};

export const cyclePhaseColors: {
  light: Record<
    CyclePhaseKey,
    CyclePhaseThemeEntry
  >;
  dark: Record<
    CyclePhaseKey,
    CyclePhaseThemeEntry
  >;
} = {
  light: {
    menstrual: {
      color: "#F2386A",
      soft: "#FCE0E9",
      label: "Menstrual",
    },

    follicular: {
      color: "#4A9DF2",
      soft: "#DFEDFD",
      label: "Follicular",
    },

    ovulation: {
      color: "#F2A63E",
      soft: "#FCEBD3",
      label: "Ovulation",
    },

    luteal: {
      color: "#8B6FD9",
      soft: "#E9E3FA",
      label: "Luteal",
    },
  },

  dark: {
    menstrual: {
      color: "#FF7CA3",
      soft: "#3A2430",
      label: "Menstrual",
    },

    follicular: {
      color: "#7CB8FF",
      soft: "#1F2E3D",
      label: "Follicular",
    },

    ovulation: {
      color: "#F2C572",
      soft: "#3A311E",
      label: "Ovulation",
    },

    luteal: {
      color: "#B39CF0",
      soft: "#2C2540",
      label: "Luteal",
    },
  },
};