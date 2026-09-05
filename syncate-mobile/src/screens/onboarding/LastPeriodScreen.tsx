import {
  type Href,
  router,
} from "expo-router";
import {
  CalendarDays,
  Check,
  Moon,
  Sun,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PeriodCalendar from "@/components/onboarding/PeriodCalendar";
import { useTheme } from "@/contexts/ThemeContext";
import { saveLastPeriod } from "@/services/cycleService";
import { formatDisplayDate } from "@/utils/calendarUtils";

const DASHBOARD_ROUTE =
  "/dashboard" as Href;

function LastPeriodScreen() {
  const {
    isDark,
    toggleDark,
    colors: theme,
  } = useTheme();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string | null>(
    null
  );

  const [
    doesNotKnow,
    setDoesNotKnow,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const canContinue =
    Boolean(selectedDate)
    || doesNotKnow;

  const handleDateSelect = (
    date: string
  ) => {
    if (isSubmitting) {
      return;
    }

    setSelectedDate(date);
    setDoesNotKnow(false);
    setErrorMessage("");
  };

  const handleUnknownSelect =
    () => {
      if (isSubmitting) {
        return;
      }

      setDoesNotKnow(
        (previous) => !previous
      );

      setSelectedDate(null);
      setErrorMessage("");
    };

  const handleContinue =
    async () => {
      if (
        !canContinue
        || isSubmitting
      ) {
        return;
      }

      setErrorMessage("");
      setIsSubmitting(true);

      try {
        if (doesNotKnow) {
          await saveLastPeriod({
            last_period_status:
              "unknown",
            last_period_start_date:
              null,
          });
        } else if (selectedDate) {
          await saveLastPeriod({
            last_period_status:
              "known",
            last_period_start_date:
              selectedDate,
          });
        } else {
          throw new Error(
            "Please select a date or choose “I don’t know”."
          );
        }

        /*
         * Navigation happens only after
         * Django successfully stores the
         * last-period information.
         */
        router.replace(
          DASHBOARD_ROUTE
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : (
                "Could not save your "
                + "period information. "
                + "Please try again."
              )
        );
      } finally {
        setIsSubmitting(false);
      }
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
      <View style={styles.page}>
        <Pressable
          onPress={toggleDark}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={
            "Toggle dark mode"
          }
          hitSlop={12}
          style={({ pressed }) => [
            styles.themeButton,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
            pressed
              && !isSubmitting
              && styles
                .themeButtonPressed,
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
          keyboardShouldPersistTaps={
            "handled"
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={
              styles.headingSection
            }
          >
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
              When did your last
              period start?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Select the first day
              of your most recent
              period.
            </Text>
          </View>

          <PeriodCalendar
            value={selectedDate}
            onSelect={
              handleDateSelect
            }
          />

          <View
            style={
              styles.selectionArea
            }
          >
            {selectedDate
            && !doesNotKnow ? (
              <View
                style={[
                  styles
                    .selectedDateContainer,
                  {
                    backgroundColor:
                      theme.primarySoft,
                    borderColor:
                      theme.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles
                      .selectedDateLabel,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  Selected date
                </Text>

                <Text
                  style={[
                    styles
                      .selectedDateText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {formatDisplayDate(
                    selectedDate
                  )}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.helperText,
                  {
                    color:
                      theme.muted,
                  },
                ]}
              >
                It is okay if you
                are not completely
                sure.
              </Text>
            )}

            <Pressable
              onPress={
                handleUnknownSelect
              }
              disabled={isSubmitting}
              accessibilityRole={
                "checkbox"
              }
              accessibilityLabel={
                "I don't know my last period date"
              }
              accessibilityState={{
                checked:
                  doesNotKnow,
                disabled:
                  isSubmitting,
              }}
              style={({
                pressed,
              }) => [
                styles.unknownOption,
                {
                  backgroundColor:
                    doesNotKnow
                      ? theme
                          .primarySoft
                      : theme.card,
                  borderColor:
                    doesNotKnow
                      ? theme.primary
                      : theme.border,
                },
                pressed
                  && !isSubmitting
                  && styles
                    .unknownOptionPressed,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor:
                      doesNotKnow
                        ? theme.primary
                        : "transparent",
                    borderColor:
                      doesNotKnow
                        ? theme.primary
                        : theme
                            .inputBorder,
                  },
                ]}
              >
                {doesNotKnow ? (
                  <Check
                    size={14}
                    strokeWidth={3}
                    color="#FFFFFF"
                  />
                ) : null}
              </View>

              <Text
                style={[
                  styles.unknownText,
                  {
                    color:
                      doesNotKnow
                        ? theme.primary
                        : theme.text,
                  },
                ]}
              >
                I don&apos;t know
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.bottomSection
            }
          >
            {errorMessage ? (
              <Text
                accessibilityRole={
                  "alert"
                }
                style={[
                  styles.errorText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              onPress={
                handleContinue
              }
              disabled={
                !canContinue
                || isSubmitting
              }
              accessibilityRole={
                "button"
              }
              accessibilityLabel={
                "Continue to dashboard"
              }
              accessibilityState={{
                disabled:
                  !canContinue
                  || isSubmitting,
                busy: isSubmitting,
              }}
              style={({
                pressed,
              }) => [
                styles.continueButton,
                {
                  backgroundColor:
                    theme.primaryButton,
                  shadowColor:
                    theme.shadow,
                },
                pressed
                  && canContinue
                  && !isSubmitting
                  && styles
                    .continueButtonPressed,
                (
                  !canContinue
                  || isSubmitting
                )
                  && styles
                    .continueButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.continueText
                  }
                >
                  Continue
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
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
      transform: [
        {
          scale: 0.96,
        },
      ],
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
      transform: [
        {
          scale: 0.985,
        },
      ],
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

    errorText: {
      marginBottom: 12,
      textAlign: "center",
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "500",
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
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    continueButtonDisabled: {
      opacity: 0.55,
    },

    continueText: {
      color: "#FFFFFF",
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
  });

export default LastPeriodScreen;
