// Destination: constants/guestTheme.ts

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