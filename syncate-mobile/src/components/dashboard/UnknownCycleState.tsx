import type { ReactNode } from "react";

import {
  type Href,
  router,
} from "expo-router";
import {
  Droplets,
  Heart,
  Plus,
} from "lucide-react-native";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";

import DashboardHeader from "./DashboardHeader";
import RegisteredBottomNav from "./RegisteredBottomNav";

const LAST_PERIOD_ROUTE =
  "/onboarding/last-period" as Href;

type UnknownCycleStateProps = {
  nickname: string;
};

type QuickActionProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.quickAction,
        pressed &&
          styles.quickActionPressed,
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

function UnknownCycleState({
  nickname,
}: UnknownCycleStateProps) {
  const { isDark, colors: theme } = useTheme();

  const openPeriodLogger = () => {
    router.push(LAST_PERIOD_ROUTE);
  };

  const openSymptoms = () => {
    Alert.alert(
      "Symptoms",
      "Symptom tracking will be connected here."
    );
  };

  const openSexTracking = () => {
    Alert.alert(
      "Sex",
      "Sex tracking will be connected here."
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <DashboardHeader
          nickname={nickname}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.primarySoft,
              shadowColor:
                theme.shadow,
            },
          ]}
        >
          <View style={styles.setupArea}>
            <View style={styles.setupTopRow}>
              <View
                style={[
                  styles.emptyCycleRing,
                  {
                    borderColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyCycleDay,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  Start
                </Text>

                <Text
                  style={[
                    styles.emptyCycleLabel,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  tracking
                </Text>
              </View>

              <View style={styles.setupContent}>
                <Text
                  style={[
                    styles.setupContext,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  YOUR CYCLE
                </Text>

                <Text
                  style={[
                    styles.setupTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Let’s set up your cycle
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.descriptionArea,
                {
                  borderTopColor:
                    theme.primarySoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.description,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Log your latest period so
                Syncate can calculate your
                cycle day and current phase.
              </Text>

              <Text
                style={[
                  styles.supportingText,
                  {
                    color:
                      theme.muted,
                  },
                ]}
              >
                Your next period and
                estimated ovulation will
                appear here afterward.
              </Text>
            </View>
          </View>

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
                    color:
                      theme.muted,
                  },
                ]}
              >
                NEXT PERIOD
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.emptyPredictionValue,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                We’ll predict it
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.predictionTiming,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                After your first log
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
                    color:
                      theme.muted,
                  },
                ]}
              >
                OVULATION
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.emptyPredictionValue,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                We’ll estimate it
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[
                  styles.predictionTiming,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                After your first log
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
              onPress={
                openPeriodLogger
              }
              primaryColor={
                theme.primary
              }
              backgroundColor={
                theme.primarySoft
              }
              textColor={
                theme.text
              }
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
              onPress={
                openSymptoms
              }
              primaryColor={
                theme.primary
              }
              backgroundColor={
                theme.primarySoft
              }
              textColor={
                theme.text
              }
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
              onPress={
                openSexTracking
              }
              primaryColor={
                theme.primary
              }
              backgroundColor={
                theme.primarySoft
              }
              textColor={
                theme.text
              }
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
      </ScrollView>

      <RegisteredBottomNav
        activeItem="home"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
  },

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

  setupArea: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 17,
  },

  setupTopRow: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyCycleRing: {
    width: 104,
    height: 104,
    marginLeft: 5,
    borderWidth: 8,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCycleDay: {
    marginBottom: 1,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
  },

  emptyCycleLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },

  setupContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 25,
    justifyContent: "center",
  },

  setupContext: {
    marginBottom: 7,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.85,
  },

  setupTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "700",
    letterSpacing: -0.45,
  },

  descriptionArea: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 16,
  },

  description: {
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "500",
  },

  supportingText: {
    marginTop: 8,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "500",
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

  emptyPredictionValue: {
    marginBottom: 5,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  predictionTiming: {
    fontSize: 11,
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
        scale: 0.96,
      },
    ],
  },
});

export default UnknownCycleState;
