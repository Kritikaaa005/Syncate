import {
  type Href,
  router,
} from "expo-router";

import {
  ArrowLeft,
  CalendarDays,
  Check,
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

function DashboardCalendarScreen() {
  const { isDark, colors: theme } = useTheme();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<string | null>(
    null
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const handleDateSelect = (
    date: string
  ) => {
    if (isSubmitting) {
      return;
    }

    setSelectedDate(date);
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (
      !selectedDate ||
      isSubmitting
    ) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await saveLastPeriod({
        last_period_status:
          "known",
        last_period_start_date:
          selectedDate,
      });

      /*
       * Replace instead of push so pressing
       * Back from the dashboard does not reopen
       * the completed logging form.
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
              + "period date. "
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
        <View
          style={
            styles.topBar
          }
        >
          <Pressable
            onPress={() => {
              router.back();
            }}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
              pressed &&
                !isSubmitting &&
                styles.buttonPressed,
            ]}
          >
            <ArrowLeft
              size={20}
              strokeWidth={2}
              color={theme.text}
            />
          </Pressable>

          <Text
            style={[
              styles.topBarTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Log Period
          </Text>

          <View
            style={
              styles.topBarSpacer
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
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
                size={25}
                strokeWidth={1.9}
                color={
                  theme.primary
                }
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
              When did your period
              start?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Select the first day of
              your most recent period.
              Your cycle estimates will
              update automatically.
            </Text>
          </View>

          <PeriodCalendar
            value={selectedDate}
            onSelect={
              handleDateSelect
            }
          />

          {selectedDate ? (
            <View
              style={[
                styles.selectedCard,
                {
                  backgroundColor:
                    theme.primarySoft,
                  borderColor:
                    theme.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                ]}
              >
                <Check
                  size={16}
                  strokeWidth={2.5}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.selectedTextArea
                }
              >
                <Text
                  style={[
                    styles.selectedLabel,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  PERIOD START DATE
                </Text>

                <Text
                  style={[
                    styles.selectedDate,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  {formatDisplayDate(
                    selectedDate
                  )}
                </Text>
              </View>
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
              Choose a date above to
              continue.
            </Text>
          )}

          {errorMessage ? (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor:
                    isDark
                      ? "#3A2029"
                      : "#FFF0F4",
                  borderColor:
                    theme.primary,
                },
              ]}
            >
              <Text
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
            </View>
          ) : null}

          <Pressable
            onPress={() => {
              void handleSave();
            }}
            disabled={
              !selectedDate ||
              isSubmitting
            }
            accessibilityRole="button"
            accessibilityLabel="Save period date"
            accessibilityState={{
              disabled:
                !selectedDate ||
                isSubmitting,
              busy: isSubmitting,
            }}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor:
                  theme.primaryButton,
                shadowColor:
                  theme.shadow,
              },
              (
                !selectedDate ||
                isSubmitting
              ) &&
                styles.saveButtonDisabled,
              pressed &&
                selectedDate &&
                !isSubmitting &&
                styles.buttonPressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Check
                  size={19}
                  strokeWidth={2.3}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Save Period Date
                </Text>
              </>
            )}
          </Pressable>

          <Text
            style={[
              styles.disclaimer,
              {
                color: theme.muted,
              },
            ]}
          >
            Cycle dates and phases are
            estimates and may change as
            you add more information.
          </Text>
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

    topBar: {
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    topBarTitle: {
      fontSize: 16,
      fontWeight: "700",
    },

    topBarSpacer: {
      width: 40,
      height: 40,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 42,
    },

    headingSection: {
      alignItems: "center",
      marginBottom: 24,
    },

    headingIcon: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },

    title: {
      maxWidth: 330,
      textAlign: "center",
      fontSize: 25,
      lineHeight: 32,
      fontWeight: "800",
      marginBottom: 9,
    },

    subtitle: {
      maxWidth: 350,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
    },

    selectedCard: {
      minHeight: 76,
      marginTop: 20,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 17,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
    },

    checkCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    selectedTextArea: {
      flex: 1,
    },

    selectedLabel: {
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "700",
      letterSpacing: 0.8,
      marginBottom: 2,
    },

    selectedDate: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "700",
    },

    helperText: {
      marginTop: 18,
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
    },

    errorContainer: {
      marginTop: 16,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderWidth: 1,
      borderRadius: 15,
    },

    errorText: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },

    saveButton: {
      minHeight: 54,
      marginTop: 24,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
    },

    saveButtonDisabled: {
      opacity: 0.45,
      shadowOpacity: 0,
      elevation: 0,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    disclaimer: {
      marginTop: 16,
      paddingHorizontal: 10,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 17,
    },

    buttonPressed: {
      opacity: 0.76,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });

export default DashboardCalendarScreen;
