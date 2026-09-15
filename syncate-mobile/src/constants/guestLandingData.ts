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
  title: string;
  titleNe: string;
  description: string;
  descriptionNe: string;
  buttonText: string;
  buttonTextNe: string;
  to: "/guest/predict" | "/guest/articles";
  icon: LucideIcon;
};

export const guestActions: GuestAction[] = [
  {
    title: "Quick Prediction",
    titleNe: "महिनावारी अनुमान",
    description:
      "Log a few details and get your next period, ovulation, and cycle phases instantly.",
    descriptionNe:
      "केही विवरण दिनुहोस् र अर्को महिनावारी, अण्डोत्सर्ग र चक्रका चरणहरूको अनुमान हेर्नुहोस्।",
    buttonText: "Predict My Cycle",
    buttonTextNe: "मेरो चक्र अनुमान गर्नुहोस्",
    to: "/guest/predict",
    icon: CalendarDays,
  },
  {
    title: "Educational Content",
    titleNe: "स्वास्थ्य जानकारी",
    description:
      "Explore articles and guides about periods, hormones, wellness, and more.",
    descriptionNe:
      "महिनावारी, हर्मोन, स्वास्थ्य र जीवनशैलीसम्बन्धी लेख तथा मार्गदर्शन पढ्नुहोस्।",
    buttonText: "Explore Articles",
    buttonTextNe: "लेखहरू हेर्नुहोस्",
    to: "/guest/articles",
    icon: BookOpen,
  },
];

export type MoreFeature = {
  label: string;
  labelNe: string;
  icon: LucideIcon;
};

export const moreFeatures: MoreFeature[] = [
  {
    label: "Save cycle history",
    labelNe: "चक्रको इतिहास सुरक्षित राख्नुहोस्",
    icon: CalendarDays,
  },
  {
    label: "AI Health Assistant",
    labelNe: "AI स्वास्थ्य सहायक",
    icon: Sparkles,
  },
  {
    label: "Track symptoms & moods",
    labelNe: "लक्षण र मुड ट्र्याक गर्नुहोस्",
    icon: Heart,
  },
  {
    label: "Pregnancy tracking",
    labelNe: "गर्भावस्था ट्र्याकिङ",
    icon: Baby,
  },
  {
    label: "Medication reminders",
    labelNe: "औषधि सम्झाउने",
    icon: Bell,
  },
  {
    label: "Community support",
    labelNe: "समुदायको सहयोग",
    icon: Users,
  },
];
