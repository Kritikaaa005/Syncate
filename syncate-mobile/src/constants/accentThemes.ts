export type AccentThemeId =
  | "blush"
  | "lavender"
  | "sage"
  | "ocean"
  | "peach";

export type AccentTheme = {
  id: AccentThemeId;
  name: string;
  primary: string;
  secondary: string;
  soft: string;
};

export const accentThemes: Record<AccentThemeId, AccentTheme> = {
  blush: { id: "blush", name: "Blush", primary: "#F2386A", secondary: "#F7A1BB", soft: "#FCE7EF" },
  lavender: { id: "lavender", name: "Lavender", primary: "#7C5CFC", secondary: "#B7A4FF", soft: "#EFEAFF" },
  sage: { id: "sage", name: "Sage", primary: "#4F8A70", secondary: "#91B5A1", soft: "#E9F3ED" },
  ocean: { id: "ocean", name: "Ocean", primary: "#2F80ED", secondary: "#82B6F4", soft: "#E7F1FF" },
  peach: { id: "peach", name: "Peach", primary: "#E76F51", secondary: "#F2A28C", soft: "#FBEAE5" },
};

export const accentThemeIds = Object.keys(accentThemes) as AccentThemeId[];

export function isAccentThemeId(value: string | null): value is AccentThemeId {
  return value !== null && Object.prototype.hasOwnProperty.call(accentThemes, value);
}
