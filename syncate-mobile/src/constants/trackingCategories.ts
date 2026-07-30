export type TrackingCategoryId =
  | "flow" | "symptoms" | "mood" | "discharge"
  | "sexual_health" | "medication" | "lifestyle" | "fertility" | "notes";

export interface TrackingOption {
  id: string;
  label: string;
}

export interface TrackingCategory {
  id: TrackingCategoryId;
  emoji: string;
  label: string;
  multiSelect: boolean; // can user pick more than one option?
  options?: TrackingOption[]; // absent for free-text / numeric categories
}

export const TRACKING_CATEGORIES: TrackingCategory[] = [
  {
    id: "flow", emoji: "🩸", label: "Flow", multiSelect: false,
    options: ["spotting", "light", "medium", "heavy", "very_heavy"].map(id => ({ id, label: id.replace("_", " ") })),
  },
  {
    id: "symptoms", emoji: "🤒", label: "Symptoms", multiSelect: true,
    options: [
      "cramps","headache","migraine","back_pain","breast_tenderness","bloating","fatigue",
      "acne","nausea","dizziness","constipation","diarrhea","food_cravings","increased_appetite","trouble_sleeping",
    ].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "mood", emoji: "😊", label: "Mood", multiSelect: true,
    options: [
      "happy","calm","energetic","neutral","irritable","mood_swings",
      "anxious","stressed","sad","emotional","low_motivation",
    ].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "discharge", emoji: "💧", label: "Discharge", multiSelect: false,
    options: ["none","dry","sticky","creamy","watery","egg_white","brown","unusual"].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "sexual_health", emoji: "❤️", label: "Sexual Activity", multiSelect: true,
    options: ["had_sex","protected_sex","unprotected_sex","high_sex_drive","low_sex_drive"].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "medication", emoji: "💊", label: "Medication", multiSelect: true,
    options: ["painkiller","birth_control","emergency_contraception","other"].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "lifestyle", emoji: "🏃", label: "Lifestyle", multiSelect: true,
    options: ["water_intake","exercise","sleep_duration","stress_level","alcohol","smoking"].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  {
    id: "fertility", emoji: "🌡️", label: "Fertility", multiSelect: true,
    options: ["ovulation_positive","ovulation_negative","cervical_mucus","basal_body_temp"].map(id => ({ id, label: id.replace(/_/g, " ") })),
  },
  { id: "notes", emoji: "📝", label: "Notes", multiSelect: false }, // free text, handled specially
];