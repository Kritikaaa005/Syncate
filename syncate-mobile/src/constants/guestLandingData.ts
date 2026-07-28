// Destination: constants/guestLandingData.ts
// Merged from the original src/constants/guestTheme.ts + guestLanding.ts
// (both files were identical duplicates in the source repo aside from
// guestTheme.ts also holding the color tokens, which now live in ./guestTheme).

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
  title: string;
  description: string;
  buttonText: string;
  to: "/guest/predict" | "/guest/articles";
  icon: LucideIcon;
};

export const guestActions: GuestAction[] = [
  {
    title: "Quick Prediction",
    description:
      "Log a few details and get your next period, ovulation, and cycle phases instantly.",
    buttonText: "Predict My Cycle",
    to: "/guest/predict",
    icon: CalendarDays,
  },
  {
    title: "Educational Content",
    description:
      "Explore articles and guides about periods, hormones, wellness, and more.",
    buttonText: "Explore Articles",
    to: "/guest/articles",
    icon: BookOpen,
  },
];

export type MoreFeature = {
  label: string;
  icon: LucideIcon;
};

export const moreFeatures: MoreFeature[] = [
  { label: "Save cycle history", icon: CalendarDays },
  { label: "AI Health Assistant", icon: Sparkles },
  { label: "Track symptoms & moods", icon: Heart },
  { label: "Pregnancy tracking", icon: Baby },
  { label: "Medication reminders", icon: Bell },
  { label: "Community support", icon: Users },
];
