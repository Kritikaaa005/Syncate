// LOCATION: syncate-mobile/src/screens/profile/ProfilePeriodDetailsScreen.tsx
// (new file — needs a matching route file, see note at the bottom)
//
// Settings > Change period details. Same two questions as onboarding's
// CyclePreferencesScreen (cycle length, period length) via the shared
// CycleQuestionSection component — this screen's own job is just:
// load what's currently saved, prefill the right bucket (or "I don't
// know"), and PATCH whatever changes back. Header/loading/error shell
// matches ProfilePasswordScreen.tsx — same Settings sub-screen family.

import { router } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Droplet,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CycleQuestionSection, {
  CYCLE_LENGTH_OPTIONS,
  PERIOD_LENGTH_OPTIONS,
  type BucketOption,
} from "@/components/onboarding/CycleQuestionSection";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useCycleProfile from "@/hooks/useCycleProfile";
import {
  updateCyclePreferences,
  type CycleProfileResponse,
  type EstimateConfidence,
} from "@/services/cycleService";

// The saved day count won't always land exactly on one of the three
// representative bucket values (e.g. someone's actual average is 27,
// not the "average" bucket's 28) — this picks whichever bucket is
// numerically closest, so the picker opens on a sensible default
// instead of nothing being selected.
function closestBucketId(
  options: BucketOption[],
  days: number
): string {
  return options.reduce((closest, option) =>
    Math.abs(option.days - days) < Math.abs(closest.days - days)
      ? option
      : closest
  ).id;
}

function ProfilePeriodDetailsScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const {
    cycleProfile,
    loading,
    errorMessage: loadError,
    reload,
  } = useCycleProfile();

  const [cycleLengthOption, setCycleLengthOption] =
    useState<string | null>(null);
  const [cycleLengthUnknown, setCycleLengthUnknown] =
    useState(false);
  const [periodLengthOption, setPeriodLengthOption] =
    useState<string | null>(null);
  const [periodLengthUnknown, setPeriodLengthUnknown] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Re-syncs the form to whatever the server actually has, every time
  // cycleProfile changes — on first load, and again after a save
  // (see handleSave's reload() call) so the picker reflects exactly
  // what was just persisted rather than assuming the request matched.
  useEffect(() => {
    if (!cycleProfile) {
      return;
    }

    if (cycleProfile.cycle_length_confidence === "unknown") {
      setCycleLengthUnknown(true);
      setCycleLengthOption(null);
    } else {
      setCycleLengthUnknown(false);
      setCycleLengthOption(
        closestBucketId(
          CYCLE_LENGTH_OPTIONS,
          cycleProfile.cycle_length_days
        )
      );
    }

    if (cycleProfile.period_length_confidence === "unknown") {
      setPeriodLengthUnknown(true);
      setPeriodLengthOption(null);
    } else {
      setPeriodLengthUnknown(false);
      setPeriodLengthOption(
        closestBucketId(
          PERIOD_LENGTH_OPTIONS,
          cycleProfile.period_length_days
        )
      );
    }
  }, [cycleProfile]);

  const canSave =
    (Boolean(cycleLengthOption) || cycleLengthUnknown)
    && (Boolean(periodLengthOption) || periodLengthUnknown);

  const selectCycleLength = (id: string) => {
    if (isSubmitting) return;
    setCycleLengthOption(id);
    setCycleLengthUnknown(false);
    setSaveError("");
  };

  const toggleCycleLengthUnknown = () => {
    if (isSubmitting) return;
    setCycleLengthUnknown((previous) => !previous);
    setCycleLengthOption(null);
    setSaveError("");
  };

  const selectPeriodLength = (id: string) => {
    if (isSubmitting) return;
    setPeriodLengthOption(id);
    setPeriodLengthUnknown(false);
    setSaveError("");
  };

  const togglePeriodLengthUnknown = () => {
    if (isSubmitting) return;
    setPeriodLengthUnknown((previous) => !previous);
    setPeriodLengthOption(null);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!canSave || isSubmitting) {
      return;
    }

    setSaveError("");
    setIsSubmitting(true);

    try {
      const cycleConfidence: EstimateConfidence =
        cycleLengthUnknown ? "unknown" : "estimated";
      const periodConfidence: EstimateConfidence =
        periodLengthUnknown ? "unknown" : "estimated";

      const selectedCycleDays = CYCLE_LENGTH_OPTIONS.find(
        (option) => option.id === cycleLengthOption
      )?.days;
      const selectedPeriodDays = PERIOD_LENGTH_OPTIONS.find(
        (option) => option.id === periodLengthOption
      )?.days;

      const result: CycleProfileResponse =
        await updateCyclePreferences({
          cycle_length_confidence: cycleConfidence,
          cycle_length_days: cycleLengthUnknown
            ? undefined
            : selectedCycleDays,
          period_length_confidence: periodConfidence,
          period_length_days: periodLengthUnknown
            ? undefined
            : selectedPeriodDays,
        });

      // Re-fetch so the form reflects exactly what the server saved
      // (e.g. its own default numbers if either field was left idk).
      await reload();

      const cycleSummary =
        result.cycle_length_confidence === "unknown"
          ? "Cycle length: not set"
          : `Cycle length: ~${result.cycle_length_days} days`;
      const periodSummary =
        result.period_length_confidence === "unknown"
          ? "Period length: not set"
          : `Period length: ~${result.period_length_days} days`;

      Alert.alert(
        "Saved",
        `${cycleSummary}\n${periodSummary}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your period details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to settings"
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>
            Period details
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Update your cycle and period information
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {loading && !cycleProfile ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : loadError && !cycleProfile ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: theme.text }]}>
              Couldn't load your cycle information
            </Text>
            <Text style={[styles.errorMessage, { color: theme.muted }]}>
              {loadError}
            </Text>
            <Pressable
              onPress={() => {
                void reload();
              }}
              accessibilityRole="button"
              style={[
                styles.retryButton,
                { backgroundColor: theme.primaryButton },
              ]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
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
            <Text style={[styles.cardHelper, { color: theme.muted }]}>
              This only changes what Syncate assumes when predicting
              your next cycle — it doesn't rewrite anything you've
              already logged.
            </Text>

            <CycleQuestionSection
              icon={
                <Calendar
                  size={16}
                  strokeWidth={1.8}
                  color={theme.primary}
                />
              }
              title="How long is your usual cycle?"
              options={CYCLE_LENGTH_OPTIONS}
              selectedId={cycleLengthOption}
              isUnknown={cycleLengthUnknown}
              onSelect={selectCycleLength}
              onToggleUnknown={toggleCycleLengthUnknown}
              isSubmitting={isSubmitting}
              theme={theme}
            />

            <CycleQuestionSection
              icon={
                <Droplet
                  size={16}
                  strokeWidth={1.8}
                  color={theme.primary}
                />
              }
              title="How many days do you usually bleed?"
              options={PERIOD_LENGTH_OPTIONS}
              selectedId={periodLengthOption}
              isUnknown={periodLengthUnknown}
              onSelect={selectPeriodLength}
              onToggleUnknown={togglePeriodLengthUnknown}
              isSubmitting={isSubmitting}
              theme={theme}
            />

            {saveError ? (
              <Text style={[styles.errorText, { color: theme.primary }]}>
                {saveError}
              </Text>
            ) : null}

            <Pressable
              onPress={() => {
                void handleSave();
              }}
              disabled={!canSave || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Save period details"
              accessibilityState={{
                disabled: !canSave || isSubmitting,
                busy: isSubmitting,
              }}
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: theme.primaryButton,
                  shadowColor: theme.shadow,
                },
                (!canSave || isSubmitting) && styles.saveButtonDisabled,
                pressed && canSave && !isSubmitting && styles.pressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Save changes</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  statusWrap: {
    paddingVertical: 80,
    alignItems: "center",
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  errorMessage: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  card: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },

  cardHelper: {
    marginBottom: 20,
    fontSize: 12.5,
    lineHeight: 19,
  },

  errorText: {
    marginTop: -6,
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 17,
  },

  saveButton: {
    marginTop: 4,
    minHeight: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.86,
  },
});

export default ProfilePeriodDetailsScreen;

/*
 * ROUTE FILE NEEDED — add
 * src/app/dashboard/profile/period-details.tsx with:
 *
 *   export {
 *     default,
 *   } from "@/screens/profile/ProfilePeriodDetailsScreen";
 *
 * matching every other file in src/app/dashboard/profile/.
 */
