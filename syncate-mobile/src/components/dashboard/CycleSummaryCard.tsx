import type { ReactNode } from "react";

import {
  ChevronRight,
  Droplets,
  Heart,
  Plus,
} from "lucide-react-native";
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
  onLogPeriodPress?: () => void;
  onSymptomsPress?: () => void;
  onSexPress?: () => void;
};

type QuickActionProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
};

function QuickAction({
  label,
  icon,
  active = false,
  primaryColor,
  backgroundColor,
  textColor,
  onPress,
}: QuickActionProps) {
  const isDisabled = !onPress;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled: isDisabled,
      }}
      style={({ pressed }) => [
        styles.quickAction,
        pressed &&
          !isDisabled &&
          styles.quickActionPressed,
        isDisabled &&
          styles.quickActionDisabled,
      ]}
    >
      <View
        style={[
          styles.quickActionCircle,
          {
            backgroundColor: active
              ? primaryColor
              : backgroundColor,
          },
        ]}
      >
        {icon}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.quickActionLabel,
          {
            color: active
              ? primaryColor
              : textColor,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CycleSummaryCard({
  summary,
  onLearnMorePress,
  onLogPeriodPress,
  onSymptomsPress,
  onSexPress,
}: CycleSummaryCardProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const periodTiming =
    summary.daysUntilNextPeriod === 0
      ? "Expected today"
      : summary.daysUntilNextPeriod === 1
        ? "Expected in 1 day"
        : `Expected in ${summary.daysUntilNextPeriod} days`;

  const ovulationTiming =
    summary.daysUntilOvulation > 1
      ? `Estimated in ${summary.daysUntilOvulation} days`
      : summary.daysUntilOvulation === 1
        ? "Estimated in 1 day"
        : summary.daysUntilOvulation === 0
          ? "Estimated today"
          : "Estimated date";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.primarySoft,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <Pressable
        onPress={onLearnMorePress}
        disabled={!onLearnMorePress}
        accessibilityRole="button"
        accessibilityLabel={`Read about the ${summary.phase.name}`}
        style={({ pressed }) => [
          styles.phaseArea,
          pressed &&
            Boolean(onLearnMorePress) &&
            styles.phaseAreaPressed,
        ]}
      >
        <View style={styles.phaseTopRow}>
          <View style={styles.ringArea}>
            <CycleProgressRing
              cycleDay={summary.cycleDay}
              cycleLength={summary.cycleLength}
              primaryColor={theme.primary}
              trackColor={theme.primarySoft}
              textColor={theme.text}
              mutedColor={theme.muted}
            />
          </View>

          <View style={styles.phaseContent}>
            <Text
              style={[
                styles.phaseContext,
                {
                  color: theme.primary,
                },
              ]}
            >
              DAY {summary.cycleDay} OF YOUR CYCLE
            </Text>

            <Text
              numberOfLines={2}
              style={[
                styles.phaseName,
                {
                  color: theme.text,
                },
              ]}
            >
              {summary.phase.name}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.educationArea,
            {
              borderTopColor:
                theme.primarySoft,
            },
          ]}
        >
          <Text
            numberOfLines={4}
            style={[
              styles.phaseDescription,
              {
                color: theme.text,
              },
            ]}
          >
            {summary.phase.description}
          </Text>

          <View style={styles.learnRow}>
            <Text
              style={[
                styles.learnText,
                {
                  color: theme.primary,
                },
              ]}
            >
              Read about this phase
            </Text>

            <ChevronRight
              size={17}
              strokeWidth={2.3}
              color={theme.primary}
            />
          </View>
        </View>
      </Pressable>

      <View
        style={[
          styles.predictionSection,
          {
            borderTopColor:
              theme.primarySoft,
          },
        ]}
      >
        <View style={styles.predictionItem}>
          <Text
            style={[
              styles.predictionLabel,
              {
                color: theme.muted,
              },
            ]}
          >
            NEXT PERIOD
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
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
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.predictionTiming,
              {
                color: theme.text,
              },
            ]}
          >
            {periodTiming}
          </Text>
        </View>

        <View
          style={[
            styles.predictionDivider,
            {
              backgroundColor:
                theme.primarySoft,
            },
          ]}
        />

        <View style={styles.predictionItem}>
          <Text
            style={[
              styles.predictionLabel,
              {
                color: theme.muted,
              },
            ]}
          >
            OVULATION
          </Text>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
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
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.predictionTiming,
              {
                color: theme.text,
              },
            ]}
          >
            {ovulationTiming}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.quickActionsSection,
          {
            borderTopColor:
              theme.primarySoft,
          },
        ]}
      >
        <QuickAction
          label="Log period"
          active
          onPress={onLogPeriodPress}
          primaryColor={theme.primary}
          backgroundColor={
            theme.primarySoft
          }
          textColor={theme.text}
          icon={
          <Droplets
  size={20}
  strokeWidth={2}
  color="#FFFFFF"
/>
          }
        />

        <QuickAction
          label="Symptoms"
          onPress={onSymptomsPress}
          primaryColor={theme.primary}
          backgroundColor={
            theme.primarySoft
          }
          textColor={theme.text}
          icon={
          <Plus
  size={22}
  strokeWidth={2}
  color={theme.text}
/>
          }
        />

        <QuickAction
          label="Sex"
          onPress={onSexPress}
          primaryColor={theme.primary}
          backgroundColor={
            theme.primarySoft
          }
          textColor={theme.text}
          icon={
          <Heart
  size={21}
  strokeWidth={2}
  color={theme.text}
/>
          }
        />
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
      height: 7,
    },

    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  phaseArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 17,
  },

  phaseAreaPressed: {
    opacity: 0.78,
  },

  phaseTopRow: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
  },

  ringArea: {
    width: 122,
    flexShrink: 0,
    marginLeft: 5,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  phaseContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 7,
    justifyContent: "center",
  },

  phaseContext: {
    marginBottom: 7,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.85,
  },

  phaseName: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "700",
    letterSpacing: -0.45,
  },

  educationArea: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 16,
  },

  phaseDescription: {
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "500",
  },

  learnRow: {
    minHeight: 37,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  learnText: {
    marginRight: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  predictionSection: {
    minHeight: 116,
    borderTopWidth: 1,
    paddingHorizontal: 19,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  predictionItem: {
    flex: 1,
    minWidth: 0,
  },

  predictionLabel: {
    marginBottom: 7,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  predictionDate: {
    marginBottom: 5,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.35,
  },

  predictionTiming: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "600",
  },

  predictionDivider: {
    width: 1,
    height: 64,
    marginHorizontal: 18,
  },

quickActionsSection: {
  minHeight: 96,
  borderTopWidth: 1,
  paddingHorizontal: 28,
  paddingTop: 13,
  paddingBottom: 12,
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
},


  quickAction: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

quickActionCircle: {
  width: 46,
  height: 46,
  marginBottom: 6,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
},

quickActionLabel: {
  textAlign: "center",
  fontSize: 10.5,
  lineHeight: 14,
  fontWeight: "600",
},
  quickActionPressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  quickActionDisabled: {
    opacity: 0.45,
  },
});

export default CycleSummaryCard;