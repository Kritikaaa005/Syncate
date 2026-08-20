// LOCATION: syncate-mobile/src/constants/guestTheme.ts
// (replaces the existing file)
//
// Added cyclePhaseColors at the bottom — this is the ONE place phase
// colors/labels live now. The calendar screen reads from here, and
// anything else that ever needs to show a phase color (CycleSummaryCard
// could eventually switch to this too, though it isn't touched today)
// should read from here rather than picking its own hex values.

export type GuestThemeColors = {
  background: string;
  card: string;
  border: string;

  primary: string;
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

      primary: "#F2386A",
      primarySoft: "#FCE7EF",
      primaryButton: "#F4467A",

      text: "#1E1730",
      muted: "#8D8A99",

      inputBackground: "#FFFFFF",
      inputBorder: "#F6B7CA",

      sparkle: "#F7A1BB",
      shadow: "#F4467A",
    },

    dark: {
      background: "#17111C",
      card: "#221A28",
      border: "#3A2A38",

      primary: "#FF7CA3",
      primarySoft: "#3A2430",
      primaryButton: "#FF6F98",

      text: "#F3EDF1",
      muted: "#B7ACB8",

      inputBackground: "#211923",
      inputBorder: "#754257",

      sparkle: "#FF7CA3",
      shadow: "#FF7CA3",
    },
  },
};

// === NEW: matches the backend's phase "key" values exactly
// (cycle_tracking/services.py get_cycle_phase) — "menstrual" here has
// to spell the same as "menstrual" there, since the calendar screen
// uses this key to look up which color to paint each day.
export type CyclePhaseKey =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal";

export type CyclePhaseThemeEntry = {
  // solid color — dots, the legend swatch, "today" ring
  color: string;
  // pale background tint — fills a whole calendar day cell without
  // being too loud when you're looking at 30 of them at once
  soft: string;
  label: string;
};

export const cyclePhaseColors: {
  light: Record<CyclePhaseKey, CyclePhaseThemeEntry>;
  dark: Record<CyclePhaseKey, CyclePhaseThemeEntry>;
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
