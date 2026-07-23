import { router } from "expo-router";
import {
  CalendarDays,
  Check,
  Moon,
  Sun,
} from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PeriodCalendar from "@/components/onboarding/PeriodCalendar";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDisplayDate } from "@/utils/calendarUtils";

function LastPeriodScreen() {
  const { isDark, toggleDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const [selectedDate, setSelectedDate] = useState<
    string | null
  >(null);

  const [doesNotKnow, setDoesNotKnow] =
    useState(false);

  const canContinue =
    Boolean(selectedDate) || doesNotKnow;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setDoesNotKnow(false);
  };

  const handleUnknownSelect = () => {
    setDoesNotKnow((previous) => !previous);
    setSelectedDate(null);
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (doesNotKnow) {
      console.log("Last period date: unknown");
    } else {
      console.log(
        "Last period date:",
        selectedDate
      );
    }

    // Temporary destination until the next
    // period-onboarding screen is ready.
    router.replace("/guest");
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.page}>
        <Pressable
          onPress={toggleDark}
          accessibilityRole="button"
          accessibilityLabel="Toggle dark mode"
          hitSlop={12}
          style={({ pressed }) => [
            styles.themeButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && styles.themeButtonPressed,
          ]}
        >
          {isDark ? (
            <Sun
              size={18}
              color={theme.primary}
            />
          ) : (
            <Moon
              size={18}
              color={theme.primary}
            />
          )}
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.headingSection}>
            <View
              style={[
                styles.headingIcon,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <CalendarDays
                size={24}
                strokeWidth={1.8}
                color={theme.primary}
              />
            </View>

            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              When did your last period start?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Select the first day of your most
              recent period.
            </Text>
          </View>

          <PeriodCalendar
            value={selectedDate}
            onSelect={handleDateSelect}
          />

          <View style={styles.selectionArea}>
            {selectedDate && !doesNotKnow ? (
              <View
                style={[
                  styles.selectedDateContainer,
                  {
                    backgroundColor:
                      theme.primarySoft,
                    borderColor: theme.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectedDateLabel,
                    {
                      color: theme.muted,
                    },
                  ]}
                >
                  Selected date
                </Text>

                <Text
                  style={[
                    styles.selectedDateText,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.helperText,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                It is okay if you are not completely
                sure.
              </Text>
            )}

            <Pressable
              onPress={handleUnknownSelect}
              accessibilityRole="checkbox"
              accessibilityLabel="I don't know my last period date"
              accessibilityState={{
                checked: doesNotKnow,
              }}
              style={({ pressed }) => [
                styles.unknownOption,
                {
                  backgroundColor: doesNotKnow
                    ? theme.primarySoft
                    : theme.card,
                  borderColor: doesNotKnow
                    ? theme.primary
                    : theme.border,
                },
                pressed &&
                  styles.unknownOptionPressed,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: doesNotKnow
                      ? theme.primary
                      : "transparent",
                    borderColor: doesNotKnow
                      ? theme.primary
                      : theme.inputBorder,
                  },
                ]}
              >
                {doesNotKnow && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <Text
                style={[
                  styles.unknownText,
                  {
                    color: doesNotKnow
                      ? theme.primary
                      : theme.text,
                  },
                ]}
              >
                I don&apos;t know
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleContinue}
              disabled={!canContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{
                disabled: !canContinue,
              }}
              style={({ pressed }) => [
                styles.continueButton,
                {
                  backgroundColor:
                    theme.primaryButton,
                  shadowColor: theme.shadow,
                },
                pressed &&
                  canContinue &&
                  styles.continueButtonPressed,
              ]}
            >
              <Text style={styles.continueText}>
                Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
  },

  themeButton: {
    position: "absolute",
    top: 8,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  themeButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  headingSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  headingIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    maxWidth: 330,
    marginBottom: 10,
    textAlign: "center",
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "700",
  },

  subtitle: {
    maxWidth: 300,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  selectionArea: {
    marginTop: 20,
  },

  selectedDateContainer: {
    marginBottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
  },

  selectedDateLabel: {
    marginBottom: 3,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "500",
  },

  selectedDateText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  helperText: {
    minHeight: 20,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
  },

  unknownOption: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  unknownOptionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  checkbox: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderWidth: 1.5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  unknownText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "600",
  },

  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 34,
  },

  continueButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },

  continueButtonPressed: {
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
});

export default LastPeriodScreen;