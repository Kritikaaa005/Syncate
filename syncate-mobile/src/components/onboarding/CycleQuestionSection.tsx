// LOCATION: syncate-mobile/src/components/onboarding/CycleQuestionSection.tsx
// (new file)
//
// === CHANGED: this used to be a component private to
// CyclePreferencesScreen.tsx (onboarding's cycle-length/period-length
// step). Pulled out here, unchanged in behavior, because
// ProfilePeriodDetailsScreen.tsx (Settings > Change period details)
// needs to ask the exact same two questions later, and duplicating a
// ~160-line bucket-picker would mean two places to keep in sync every
// time the picker's design changes. One component, two screens.

import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { guestTheme } from "@/constants/guestTheme";

export type BucketOption = {
  id: string;
  label: string;
  days: number;
};

// Single source of truth for both cycle-tracking questions — used by
// onboarding's CyclePreferencesScreen AND, later, Settings'
// ProfilePeriodDetailsScreen. Keeping exactly one copy matters here
// specifically: if onboarding and Settings ever offered different
// buckets, "25–30 days" could mean a different representative number
// depending on which screen someone happened to use.
export const CYCLE_LENGTH_OPTIONS: BucketOption[] = [
  {
    id: "short",
    label: "21–24 days",
    days: 23,
  },
  {
    id: "average",
    label: "25–30 days",
    days: 28,
  },
  {
    id: "long",
    label: "31–35 days",
    days: 33,
  },
];

export const PERIOD_LENGTH_OPTIONS: BucketOption[] = [
  {
    id: "short",
    label: "3–4 days",
    days: 4,
  },
  {
    id: "average",
    label: "5–6 days",
    days: 5,
  },
  {
    id: "long",
    label: "7+ days",
    days: 7,
  },
];

type CycleQuestionSectionProps = {
  icon: ReactNode;
  title: string;
  options: BucketOption[];
  selectedId: string | null;
  isUnknown: boolean;
  onSelect: (id: string) => void;
  onToggleUnknown: () => void;
  isSubmitting: boolean;
  theme: (typeof guestTheme.mode)["light"];
};

function CycleQuestionSection({
  icon,
  title,
  options,
  selectedId,
  isUnknown,
  onSelect,
  onToggleUnknown,
  isSubmitting,
  theme,
}: CycleQuestionSectionProps) {
  return (
    <View style={styles.questionSection}>
      <View style={styles.questionHeader}>
        {icon}

        <Text style={[styles.questionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = !isUnknown && selectedId === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.optionPill,
                {
                  backgroundColor: isSelected
                    ? theme.primarySoft
                    : theme.card,
                  borderColor: isSelected
                    ? theme.primary
                    : theme.border,
                },
                pressed && !isSubmitting && styles.optionPillPressed,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? theme.primary : theme.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onToggleUnknown}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityState={{ selected: isUnknown }}
        style={({ pressed }) => [
          styles.unknownOption,
          {
            backgroundColor: isUnknown ? theme.primarySoft : theme.card,
            borderColor: isUnknown ? theme.primary : theme.border,
          },
          pressed && !isSubmitting && styles.unknownOptionPressed,
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isUnknown
                ? theme.primary
                : "transparent",
              borderColor: isUnknown
                ? theme.primary
                : theme.inputBorder,
            },
          ]}
        >
          {isUnknown ? (
            <Check size={12} strokeWidth={3} color="#FFFFFF" />
          ) : null}
        </View>

        <Text
          style={[
            styles.unknownText,
            { color: isUnknown ? theme.primary : theme.text },
          ]}
        >
          I don&apos;t know
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  questionSection: {
    marginBottom: 26,
  },

  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  questionTitle: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },

  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  optionPill: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  optionPillPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  optionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  unknownOption: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  unknownOptionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  checkbox: {
    width: 20,
    height: 20,
    marginRight: 9,
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  unknownText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});

export default CycleQuestionSection;
