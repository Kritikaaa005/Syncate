import { ChevronRight } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  formatShortDate,
  type CycleSummary,
} from "@/utils/cycleCalculations";

import CycleProgressRing from "./CycleProgressRing";

type CycleSummaryCardProps = {
  summary: CycleSummary;
  onLearnMorePress?: () => void;
};

function CycleSummaryCard({
  summary,
  onLearnMorePress,
}: CycleSummaryCardProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const ovulationTiming =
    summary.daysUntilOvulation > 0
      ? `In ${summary.daysUntilOvulation} days`
      : summary.daysUntilOvulation === 0
        ? "Estimated today"
        : "Estimated date";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={styles.mainContent}>
        <View style={styles.phaseSection}>
          <Text
            style={[
              styles.eyebrow,
              {
                color: theme.muted,
              },
            ]}
          >
            You are in
          </Text>

          <Text
            style={[
              styles.phaseName,
              {
                color: theme.primary,
              },
            ]}
          >
            {summary.phase.name}
          </Text>

          <Text
            style={[
              styles.cycleDay,
              {
                color: theme.text,
              },
            ]}
          >
            Day {summary.cycleDay}{" "}
            <Text
              style={[
                styles.cycleDaySuffix,
                {
                  color: theme.muted,
                },
              ]}
            >
              of your cycle
            </Text>
          </Text>

          <Pressable
            onPress={onLearnMorePress}
            disabled={!onLearnMorePress}
            accessibilityRole="button"
            accessibilityLabel={`Learn about the ${summary.phase.name}`}
            style={({ pressed }) => [
              styles.learnButton,
              {
                backgroundColor:
                  theme.primarySoft,
              },
              pressed &&
                Boolean(onLearnMorePress) &&
                styles.learnButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.learnButtonText,
                {
                  color: theme.text,
                },
              ]}
            >
              What does this mean?
            </Text>

            <ChevronRight
              size={16}
              strokeWidth={2}
              color={theme.primary}
            />
          </Pressable>
        </View>

        <CycleProgressRing
          cycleDay={summary.cycleDay}
          cycleLength={summary.cycleLength}
          primaryColor={theme.primary}
          trackColor={theme.primarySoft}
          textColor={theme.text}
          mutedColor={theme.muted}
        />
      </View>

      <View
        style={[
          styles.predictionSection,
          {
            borderTopColor: theme.border,
          },
        ]}
      >
        <View style={styles.predictionItem}>
          <Text
            style={[
              styles.predictionLabel,
              {
                color: theme.text,
              },
            ]}
          >
            Next Period
          </Text>

          <Text
            style={[
              styles.predictionDate,
              {
                color: theme.primary,
              },
            ]}
          >
            {formatShortDate(
              summary.nextPeriodDate
            )}
          </Text>

          <Text
            style={[
              styles.predictionTiming,
              {
                color: theme.muted,
              },
            ]}
          >
            In {summary.daysUntilNextPeriod} days
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.border,
            },
          ]}
        />

        <View style={styles.predictionItem}>
          <Text
            style={[
              styles.predictionLabel,
              {
                color: theme.text,
              },
            ]}
          >
            Ovulation
          </Text>

          <Text
            style={[
              styles.predictionDate,
              {
                color: theme.primary,
              },
            ]}
          >
            {formatShortDate(
              summary.estimatedOvulationDate
            )}
          </Text>

          <Text
            style={[
              styles.predictionTiming,
              {
                color: theme.muted,
              },
            ]}
          >
            {ovulationTiming}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 26,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },

  mainContent: {
    minHeight: 250,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  phaseSection: {
    flex: 1,
    paddingRight: 14,
  },

  eyebrow: {
    marginBottom: 5,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  phaseName: {
    marginBottom: 14,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  cycleDay: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },

  cycleDaySuffix: {
    fontWeight: "500",
  },

  learnButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    marginTop: 22,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  learnButtonPressed: {
    opacity: 0.74,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  learnButtonText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
  },

  predictionSection: {
    minHeight: 122,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  predictionItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  predictionLabel: {
    marginBottom: 7,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },

  predictionDate: {
    marginBottom: 4,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
  },

  predictionTiming: {
    textAlign: "center",
    fontSize: 11.5,
    lineHeight: 16,
  },

  divider: {
    width: 1,
    height: 60,
  },
});

export default CycleSummaryCard;