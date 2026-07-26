// Destination: constants/guestLandingData.ts
// Merged from the original src/constants/guestTheme.ts + guestLanding.ts
// (both files were identical duplicates in the source repo aside from
// guestTheme.ts also holding the color tokens, which now live in ./guestTheme).

// Destination: constants/guestLandingData.ts

import {
  Baby,
  Bell,
  BookOpen,
  CalendarDays,
  Heart,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react-native";

export type GuestAction = {
  titleKey: string;
  descriptionKey: string;
  buttonTextKey: string;
  to: "/guest/predict" | "/guest/articles";
  icon: LucideIcon;
};

export const guestActions: GuestAction[] = [
  {
    titleKey: "action_quick_prediction_title",
    descriptionKey: "action_quick_prediction_description",
    buttonTextKey: "action_quick_prediction_button",
    to: "/guest/predict",
    icon: CalendarDays,
  },
  {
    titleKey: "action_educational_title",
    descriptionKey: "action_educational_description",
    buttonTextKey: "action_educational_button",
    to: "/guest/articles",
    icon: BookOpen,
  },
];

export type MoreFeature = {
  labelKey: string;
  icon: LucideIcon;
};

export const moreFeatures: MoreFeature[] = [
  { labelKey: "feature_save_cycle_history", icon: CalendarDays },
  { labelKey: "feature_ai_assistant", icon: Sparkles },
  { labelKey: "feature_track_symptoms", icon: Heart },
  { labelKey: "feature_pregnancy_tracking", icon: Baby },
  { labelKey: "feature_medication_reminders", icon: Bell },
  { labelKey: "feature_community_support", icon: Users },
];