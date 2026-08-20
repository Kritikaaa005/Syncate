// LOCATION: syncate-mobile/src/components/dashboard/PhaseLegend.tsx
// (replaces the existing file)
//
// One job: show what each color on the calendar means. Reads
// entirely from cyclePhaseColors in guestTheme.ts — no colors or
// labels of its own, so if those ever change, this updates for free.
//
// === CHANGED: was a bare centered row of tiny dot+label pairs that
// read like an afterthought under the calendar. Now a labeled card
// with a colored swatch chip per phase, laid out as a clean 2x2 grid
// so it reads as a legend rather than loose text.

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  CyclePhaseKey,
  GuestThemeColors,
} from "@/constants/guestTheme";

type PhaseThemeMap = Record<
  CyclePhaseKey,
  {
    color: string;
    soft: string;
    label: string;
  }
>;

const PHASE_ORDER: CyclePhaseKey[] =
  [
    "menstrual",
    "follicular",
    "ovulation",
    "luteal",
  ];

type PhaseLegendProps = {
  theme: GuestThemeColors;
  phaseTheme: PhaseThemeMap;
};

function PhaseLegend({
  theme,
  phaseTheme,
}: PhaseLegendProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.muted },
        ]}
      >
        CALENDAR COLORS
      </Text>

      <View style={styles.grid}>
        {PHASE_ORDER.map((key) => (
          <View
            key={key}
            style={[
              styles.chip,
              {
                backgroundColor: phaseTheme[key].soft,
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: phaseTheme[key].color },
              ]}
            />

            <Text
              style={[
                styles.label,
                { color: phaseTheme[key].color },
              ]}
              numberOfLines={1}
            >
              {phaseTheme[key].label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  title: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  chip: {
    flexBasis: "46%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: 10,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
});

export default PhaseLegend;