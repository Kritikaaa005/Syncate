import {
  type Href,
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  CalendarDays,
  Check,
  Moon,
  Sprout,
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
  updateTrackingMode,
  type TrackingMode,
} from "@/services/userService";

type PreferenceOption = {
  value: TrackingMode;
  title: string;
  description: string;
};

const LAST_PERIOD_ROUTE =
  "/onboarding/last-period" as Href;

const preferenceOptions: PreferenceOption[] = [
  {
    value: "period",
    title: "Period Tracking",
    description:
      "Track your cycle, periods, symptoms and fertile days.",
  },
  {
    value: "pregnancy",
    title: "Pregnancy Tracking",
    description:
      "Follow your pregnancy journey and weekly progress.",
  },
];

function PreferenceScreen() {
  const { isDark, toggleDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const params = useLocalSearchParams<{
    nickname?: string | string[];
  }>();

  const nicknameParam = Array.isArray(params.nickname)
    ? params.nickname[0]
    : params.nickname;

  const nickname = nicknameParam?.trim() || "there";

  const [selectedMode, setSelectedMode] =
    useState<TrackingMode | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleSelect = (mode: TrackingMode) => {
    if (isSubmitting) return;

    setSelectedMode(mode);
    setErrorMessage("");
  };

 const goToNextScreen = (mode: TrackingMode) => {
  if (mode === "period") {
    router.replace(LAST_PERIOD_ROUTE);
    return;
  }

  // Temporary until pregnancy onboarding is built.
  router.replace("/guest");
};

const handleContinue = async () => {
  if (!selectedMode || isSubmitting) return;

  setErrorMessage("");
  setIsSubmitting(true);

  try {
    await updateTrackingMode(selectedMode);

    goToNextScreen(selectedMode);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not save your preference. Please try again.";

    const hasNoAccessToken =
      message.includes("No access token") ||
      message.includes("Please sign in again");

    /*
     * The authentication screens are being developed
     * on another branch. Allow UI preview only while
     * running the Expo development build.
     *
     * __DEV__ is false in production builds.
     */
    if (__DEV__ && hasNoAccessToken) {
      console.warn(
        "Tracking preference was not saved because authentication is not connected yet."
      );

      goToNextScreen(selectedMode);
      return;
    }

    setErrorMessage(message);
  } finally {
    setIsSubmitting(false);
  }
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

        <Text
          style={[
            styles.sparkle,
            styles.sparkleOne,
            {
              color: theme.sparkle,
            },
          ]}
        >
          ✦
        </Text>

        <Text
          style={[
            styles.sparkle,
            styles.sparkleTwo,
            {
              color: theme.sparkle,
            },
          ]}
        >
          ✦
        </Text>

        <View
          style={[
            styles.decorativeDot,
            styles.dotOne,
            {
              backgroundColor: theme.sparkle,
            },
          ]}
        />

        <View
          style={[
            styles.decorativeDot,
            styles.dotTwo,
            {
              backgroundColor: theme.sparkle,
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.headingSection}>
            <Text
              style={[
                styles.welcomeText,
                {
                  color: theme.primary,
                },
              ]}
            >
              Welcome, {nickname}
            </Text>

            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              Choose your preference
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Select what you would like Syncate
              to help you track.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {preferenceOptions.map((option) => {
              const isSelected =
                selectedMode === option.value;

              const Icon =
                option.value === "period"
                  ? CalendarDays
                  : Sprout;

              return (
                <Pressable
                  key={option.value}
                  onPress={() =>
                    handleSelect(option.value)
                  }
                  disabled={isSubmitting}
                  accessibilityRole="radio"
                  accessibilityLabel={option.title}
                  accessibilityState={{
                    selected: isSelected,
                    disabled: isSubmitting,
                  }}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? theme.primarySoft
                        : theme.card,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.border,
                      shadowColor: isSelected
                        ? theme.shadow
                        : theme.text,
                    },
                    isSelected &&
                      styles.optionCardSelected,
                    pressed &&
                      !isSubmitting &&
                      styles.optionCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.primarySoft,
                      },
                    ]}
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.9}
                      color={
                        isSelected
                          ? "#FFFFFF"
                          : theme.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.optionTextContainer
                    }
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: theme.muted,
                        },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.selectionIndicator,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : "transparent",
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    {isSelected && (
                      <Check
                        size={15}
                        strokeWidth={3}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.bottomSection}>
            {errorMessage ? (
              <Text
                style={[
                  styles.errorText,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                {errorMessage}
              </Text>
            ) : (
              <Text
                style={[
                  styles.selectionHint,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                You can change this later from
                settings.
              </Text>
            )}

            <Pressable
              onPress={handleContinue}
              disabled={
                !selectedMode || isSubmitting
              }
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{
                disabled:
                  !selectedMode || isSubmitting,
                busy: isSubmitting,
              }}
              style={({ pressed }) => [
                styles.continueButton,
                {
                  backgroundColor:
                    theme.primaryButton,
                  shadowColor: theme.shadow,
                },
                pressed &&
                  selectedMode &&
                  !isSubmitting &&
                  styles.continueButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.continueText}>
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
    paddingTop: 78,
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
    marginBottom: 34,
  },

  welcomeText: {
    marginBottom: 9,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  title: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "700",
  },

  subtitle: {
    maxWidth: 315,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  optionsContainer: {
    gap: 17,
  },

  optionCard: {
    minHeight: 142,
    borderWidth: 1.5,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },

  optionCardSelected: {
    borderWidth: 2,
    shadowOpacity: 0.14,
    elevation: 4,
  },

  optionCardPressed: {
    transform: [{ scale: 0.985 }],
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },

  optionTitle: {
    marginBottom: 7,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },

  optionDescription: {
    fontSize: 12.5,
    lineHeight: 18,
  },

  selectionIndicator: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 38,
  },

  selectionHint: {
    minHeight: 18,
    marginBottom: 14,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
  },

  errorText: {
    minHeight: 18,
    marginBottom: 14,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
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
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  sparkle: {
    position: "absolute",
    zIndex: 1,
    fontWeight: "300",
  },

  sparkleOne: {
    top: 34,
    left: 34,
    fontSize: 18,
  },

  sparkleTwo: {
    top: 108,
    right: 20,
    fontSize: 11,
    opacity: 0.55,
  },

  decorativeDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },

  dotOne: {
    top: 148,
    left: 14,
  },

  dotTwo: {
    bottom: 70,
    right: 16,
  },
});

export default PreferenceScreen;