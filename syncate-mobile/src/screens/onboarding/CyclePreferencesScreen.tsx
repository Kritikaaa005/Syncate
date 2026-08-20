// LOCATION: syncate-mobile/src/screens/onboarding/CyclePreferencesScreen.tsx
// (new file — needs a matching route file, see note at the bottom)
//
// Last step of period-tracking onboarding, right after
// LastPeriodScreen. Two questions, each with three rough buckets or
// "I don't know" — matches CycleProfileView on the backend exactly:
// picking a bucket sends confidence "estimated" + a representative
// number of days, picking idk sends confidence "unknown" and no days
// at all (the backend fills in its own default, 28/5 — we don't
// duplicate that fallback number here on purpose, so there's only
// ONE place that decides what the default is).

import {
  type Href,
  router,
} from "expo-router";
import {
  Calendar,
  Check,
  Droplet,
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

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  updateCyclePreferences,
  type EstimateConfidence,
} from "@/services/cycleService";

const DASHBOARD_ROUTE =
  "/dashboard" as Href;

type BucketOption = {
  id: string;
  label: string;
  days: number;
};

// Representative day-count per bucket. These are only used when the
// person actually picks a bucket (confidence: "estimated") — the idk
// path never sends a number at all.
const CYCLE_LENGTH_OPTIONS: BucketOption[] =
  [
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

const PERIOD_LENGTH_OPTIONS: BucketOption[] =
  [
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

function CyclePreferencesScreen() {
  const {
    isDark,
    toggleDark,
  } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const [
    cycleLengthOption,
    setCycleLengthOption,
  ] = useState<
    string | null
  >(null);

  const [
    cycleLengthUnknown,
    setCycleLengthUnknown,
  ] = useState(false);

  const [
    periodLengthOption,
    setPeriodLengthOption,
  ] = useState<
    string | null
  >(null);

  const [
    periodLengthUnknown,
    setPeriodLengthUnknown,
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
    (Boolean(cycleLengthOption)
      || cycleLengthUnknown)
    && (Boolean(periodLengthOption)
      || periodLengthUnknown);

  const selectCycleLength = (
    id: string
  ) => {
    if (isSubmitting) {
      return;
    }

    setCycleLengthOption(id);
    setCycleLengthUnknown(false);
    setErrorMessage("");
  };

  const toggleCycleLengthUnknown =
    () => {
      if (isSubmitting) {
        return;
      }

      setCycleLengthUnknown(
        (previous) => !previous
      );
      setCycleLengthOption(null);
      setErrorMessage("");
    };

  const selectPeriodLength = (
    id: string
  ) => {
    if (isSubmitting) {
      return;
    }

    setPeriodLengthOption(id);
    setPeriodLengthUnknown(false);
    setErrorMessage("");
  };

  const togglePeriodLengthUnknown =
    () => {
      if (isSubmitting) {
        return;
      }

      setPeriodLengthUnknown(
        (previous) => !previous
      );
      setPeriodLengthOption(null);
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
        const cycleConfidence: EstimateConfidence =
          cycleLengthUnknown
            ? "unknown"
            : "estimated";

        const periodConfidence: EstimateConfidence =
          periodLengthUnknown
            ? "unknown"
            : "estimated";

        const selectedCycleDays =
          CYCLE_LENGTH_OPTIONS.find(
            (option) =>
              option.id
              === cycleLengthOption
          )?.days;

        const selectedPeriodDays =
          PERIOD_LENGTH_OPTIONS.find(
            (option) =>
              option.id
              === periodLengthOption
          )?.days;

        await updateCyclePreferences(
          {
            cycle_length_confidence:
              cycleConfidence,
            cycle_length_days:
              cycleLengthUnknown
                ? undefined
                : selectedCycleDays,
            period_length_confidence:
              periodConfidence,
            period_length_days:
              periodLengthUnknown
                ? undefined
                : selectedPeriodDays,
          }
        );

        /*
         * This IS the true terminal step of onboarding now
         * (LastPeriodScreen used to be it, before this screen
         * existed). Same dismissAll reasoning as before: a couple
         * of screens earlier in the flow were reached via
         * router.push, not replace, so without this they'd still
         * be sitting underneath in the stack — letting a fully
         * onboarded user hit "back" into the middle of signup.
         */
        if (router.canDismiss()) {
          router.dismissAll();
        }

        router.replace(
          DASHBOARD_ROUTE
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : (
                "Could not save your "
                + "cycle preferences. "
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
              <Calendar
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
              A couple more
              questions
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              This helps make your
              predictions more
              accurate — it&apos;s
              okay to skip either
              one.
            </Text>
          </View>

          <QuestionSection
            icon={
              <Calendar
                size={16}
                strokeWidth={1.8}
                color={theme.primary}
              />
            }
            title={
              "How long is your usual cycle?"
            }
            options={
              CYCLE_LENGTH_OPTIONS
            }
            selectedId={
              cycleLengthOption
            }
            isUnknown={
              cycleLengthUnknown
            }
            onSelect={
              selectCycleLength
            }
            onToggleUnknown={
              toggleCycleLengthUnknown
            }
            isSubmitting={
              isSubmitting
            }
            theme={theme}
          />

          <QuestionSection
            icon={
              <Droplet
                size={16}
                strokeWidth={1.8}
                color={theme.primary}
              />
            }
            title={
              "How many days do you usually bleed?"
            }
            options={
              PERIOD_LENGTH_OPTIONS
            }
            selectedId={
              periodLengthOption
            }
            isUnknown={
              periodLengthUnknown
            }
            onSelect={
              selectPeriodLength
            }
            onToggleUnknown={
              togglePeriodLengthUnknown
            }
            isSubmitting={
              isSubmitting
            }
            theme={theme}
          />

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

// Small local component — one question block (title + 3 bucket pills
// + an idk pill). Both questions on this screen use it, so the
// picking-a-bucket-vs-idk logic only lives in one place.
type QuestionSectionProps = {
  icon: React.ReactNode;
  title: string;
  options: BucketOption[];
  selectedId: string | null;
  isUnknown: boolean;
  onSelect: (id: string) => void;
  onToggleUnknown: () => void;
  isSubmitting: boolean;
  theme: (typeof guestTheme.mode)["light"];
};

function QuestionSection({
  icon,
  title,
  options,
  selectedId,
  isUnknown,
  onSelect,
  onToggleUnknown,
  isSubmitting,
  theme,
}: QuestionSectionProps) {
  return (
    <View
      style={
        styles.questionSection
      }
    >
      <View
        style={
          styles.questionHeader
        }
      >
        {icon}

        <Text
          style={[
            styles.questionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {title}
        </Text>
      </View>

      <View
        style={
          styles.optionsRow
        }
      >
        {options.map((option) => {
          const isSelected =
            !isUnknown
            && selectedId
              === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() =>
                onSelect(option.id)
              }
              disabled={
                isSubmitting
              }
              accessibilityRole={
                "button"
              }
              accessibilityState={{
                selected:
                  isSelected,
              }}
              style={({
                pressed,
              }) => [
                styles.optionPill,
                {
                  backgroundColor:
                    isSelected
                      ? theme
                          .primarySoft
                      : theme.card,
                  borderColor:
                    isSelected
                      ? theme.primary
                      : theme.border,
                },
                pressed
                  && !isSubmitting
                  && styles
                    .optionPillPressed,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected
                      ? theme.primary
                      : theme.text,
                  },
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
        accessibilityState={{
          selected: isUnknown,
        }}
        style={({ pressed }) => [
          styles.unknownOption,
          {
            backgroundColor:
              isUnknown
                ? theme.primarySoft
                : theme.card,
            borderColor: isUnknown
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
                isUnknown
                  ? theme.primary
                  : "transparent",
              borderColor: isUnknown
                ? theme.primary
                : theme.inputBorder,
            },
          ]}
        >
          {isUnknown ? (
            <Check
              size={12}
              strokeWidth={3}
              color="#FFFFFF"
            />
          ) : null}
        </View>

        <Text
          style={[
            styles.unknownText,
            {
              color: isUnknown
                ? theme.primary
                : theme.text,
            },
          ]}
        >
          I don&apos;t know
        </Text>
      </Pressable>
    </View>
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
      transform: [
        {
          scale: 0.98,
        },
      ],
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
      transform: [
        {
          scale: 0.985,
        },
      ],
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

    bottomSection: {
      marginTop: 8,
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

export default CyclePreferencesScreen;

/*
 * ROUTE FILE NEEDED — this project's app/ folder wasn't in what you
 * uploaded, so this screen isn't wired into expo-router yet. Add a
 * file at app/onboarding/cycle-preferences.tsx that matches whatever
 * your existing app/onboarding/last-period.tsx looks like — almost
 * certainly just:
 *
 *   import CyclePreferencesScreen from "@/screens/onboarding/CyclePreferencesScreen";
 *   export default CyclePreferencesScreen;
 */
