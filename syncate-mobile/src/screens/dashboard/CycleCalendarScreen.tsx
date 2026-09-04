import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  type ViewToken,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import CalendarEditBar from "@/components/dashboard/InlinePeriodEditor";
import MonthGrid, {
  MONTH_GRID_HEIGHT,
} from "@/components/dashboard/MonthGrid";
import PhaseLegend from "@/components/dashboard/PhaseLegend";
import UnknownCycleState from "@/components/dashboard/UnknownCycleState";
import {
  cyclePhaseColors,
  guestTheme,
} from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useCycleCalendar from "@/hooks/useCycleCalendar";
import useDashboardCycle from "@/hooks/useDashboardCycle";
import usePeriodLogs from "@/hooks/usePeriodLogs";
import {
  logPeriod,
  updatePeriod,
} from "@/services/cycleService";
import {
  enumerateDateRange,
  formatDisplayDate,
  formatShortDate,
} from "@/utils/calendarUtils";
import {
  getLatestPeriod,
  getPeriodEditCandidates,
  shouldPromptForEarlyPeriodStart,
} from "@/utils/periodCalendarEditUtils";

// Reserves room at the bottom of the scrollable calendar so the last
// month row never sits underneath the sticky CalendarEditBar, whose
// own height flexes between the compact toggle and the expanded
// selection card. Generous on purpose — better a little extra empty
// space than a hidden day.
const BOTTOM_BAR_CLEARANCE = 190;

const MONTH_GAP = 18;
const MONTH_ITEM_HEIGHT = MONTH_GRID_HEIGHT + MONTH_GAP;
const MONTH_LOAD_CHUNK = 24;
const INITIAL_MONTHS_BEFORE = 24;
const INITIAL_MONTHS_AFTER = 24;

type MonthItem = Date;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1
  );
}

function CycleCalendarScreen() {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const phaseTheme = isDark
    ? cyclePhaseColors.dark
    : cyclePhaseColors.light;

  const {
    loading: dashboardLoading,
    dashboardState,
    lastPeriod,
    reload: reloadDashboard,
  } = useDashboardCycle();

  const nickname = lastPeriod?.nickname?.trim() || "there";
  const anchorMonth = useMemo(() => startOfMonth(new Date()), []);
  const currentYear = anchorMonth.getFullYear();
  const insets = useSafeAreaInsets();

  const {
    loading: calendarLoading,
    errorMessage: calendarError,
    daysByDate,
    ensureYears,
    reloadLoadedYears,
  } = useCycleCalendar(currentYear);

  const {
    loading: periodsLoading,
    errorMessage: periodsError,
    periodLogs,
    reload: reloadPeriodLogs,
  } = usePeriodLogs();

  const [rangeStartOffset, setRangeStartOffset] = useState(
    -INITIAL_MONTHS_BEFORE
  );
  const [rangeEndOffset, setRangeEndOffset] = useState(
    INITIAL_MONTHS_AFTER
  );

  const [isEditMode, setIsEditMode] = useState(false);

  // Every date staged in the current edit session, ascending. This is
  // the whole fix — it used to be a single "proposed start date".
  // Now any number of days can be tapped on and off before saving.
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedRangeLabel, setSavedRangeLabel] = useState<string | null>(
    null
  );

  const prependLockRef = useRef(false);
  const appendLockRef = useRef(false);
  const ensureYearsRef = useRef(ensureYears);

  useEffect(() => {
    ensureYearsRef.current = ensureYears;
  }, [ensureYears]);

  const months = useMemo(
    () =>
      Array.from(
        {
          length: rangeEndOffset - rangeStartOffset + 1,
        },
        (_, index) => addMonths(anchorMonth, rangeStartOffset + index)
      ),
    [anchorMonth, rangeEndOffset, rangeStartOffset]
  );

  // Resolve whether the staged span belongs to an existing period.
  // A tap can target a directly overlapping log or a nearby continuation
  // (for example, Aug 29 start -> Sep 3 still bleeding).
  const editCandidates = useMemo(() => {
    if (pendingDates.length === 0) {
      return [];
    }

    const spanStart = pendingDates[0];
    const spanEnd = pendingDates[pendingDates.length - 1];

    return getPeriodEditCandidates(
      periodLogs,
      spanStart,
      spanEnd
    );
  }, [pendingDates, periodLogs]);

  // If a tap is inside, directly beside, or still plausibly part of one
  // recent period, edit that row instead of creating another cycle start.
  // More than one candidate is ambiguous, so never guess.
  const hasConflict = editCandidates.length > 1;
  const targetPeriod = hasConflict ? null : (editCandidates[0] ?? null);

  const tappedStart = pendingDates[0] ?? null;
  const tappedEnd = pendingDates[pendingDates.length - 1] ?? null;

  // The range that will ACTUALLY be saved — the tapped span, widened
  // to also cover targetPeriod's existing saved days if it has any
  // outside that span (a period log can only ever be one contiguous
  // range, so extending it can't leave a hole in the middle).
  const previewStart = useMemo(() => {
    if (!tappedStart) return null;
    if (targetPeriod && targetPeriod.start_date < tappedStart) {
      return targetPeriod.start_date;
    }
    return tappedStart;
  }, [tappedStart, targetPeriod]);

  const previewEnd = useMemo(() => {
    if (!tappedEnd) return null;
    const targetEnd = targetPeriod?.end_date ?? targetPeriod?.start_date ?? null;
    if (targetEnd && targetEnd > tappedEnd) {
      return targetEnd;
    }
    return tappedEnd;
  }, [tappedEnd, targetPeriod]);

  // Every day this save will mark as a period day that the user did
  // NOT individually tap — either because tapped days weren't
  // consecutive, or because merging with an existing period pulled in
  // more days. Shown as an explicit preview so it's seen before
  // Save, not discovered after.
  const existingLoggedDates = useMemo(() => {
    if (!targetPeriod) {
      return new Set<string>();
    }

    return new Set(
      enumerateDateRange(
        targetPeriod.start_date,
        targetPeriod.end_date ?? targetPeriod.start_date
      )
    );
  }, [targetPeriod]);

  const impliedDates = useMemo(() => {
    if (!previewStart || !previewEnd) {
      return new Set<string>();
    }

    const pendingSet = new Set(pendingDates);
    return new Set(
      enumerateDateRange(previewStart, previewEnd).filter(
        (dateValue) =>
          !pendingSet.has(dateValue)
          && !existingLoggedDates.has(dateValue)
      )
    );
  }, [existingLoggedDates, previewStart, previewEnd, pendingDates]);

  const clearSelection = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setPendingDates([]);
    setSaveError("");
    setSavedRangeLabel(null);
  }, [isSubmitting]);

  const exitEditMode = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    clearSelection();
    setIsEditMode(false);
  }, [clearSelection, isSubmitting]);

  const handleEditToggle = () => {
    if (isSubmitting) {
      return;
    }

    if (isEditMode) {
      exitEditMode();
      return;
    }

    setSaveError("");
    setSavedRangeLabel(null);
    setIsEditMode(true);
  };

  const stageDateToggle = useCallback((dateValue: string) => {
    setSaveError("");
    setSavedRangeLabel(null);

    setPendingDates((current) =>
      current.includes(dateValue)
        ? current.filter((existing) => existing !== dateValue)
        : [...current, dateValue].sort()
    );
  }, []);

  const handleDateSelect = useCallback(
    (dateValue: string) => {
      if (!isEditMode || isSubmitting) {
        return;
      }

      // Untapping a staged date never needs confirmation.
      if (pendingDates.includes(dateValue)) {
        stageDateToggle(dateValue);
        return;
      }

      // Confirmation is only for the FIRST tap that looks like a brand-new
      // period starting before the current estimate. Extending an existing
      // period (e.g. Aug 29 -> Sep 3) deliberately skips this prompt.
      if (pendingDates.length === 0) {
        const singleDateTargets = getPeriodEditCandidates(
          periodLogs,
          dateValue,
          dateValue
        );
        const latestPeriod = getLatestPeriod(periodLogs);

        if (
          shouldPromptForEarlyPeriodStart({
            selectedDate: dateValue,
            estimatedNextPeriodDate: lastPeriod?.next_period_date,
            latestPeriod,
            hasEditTarget: singleDateTargets.length > 0,
          })
        ) {
          const selectedLabel = formatDisplayDate(dateValue);
          const estimatedLabel = formatDisplayDate(
            lastPeriod?.next_period_date ?? ""
          );

          Alert.alert(
            "Update cycle start?",
            `Your next period was estimated to start around ${estimatedLabel}. If it started on ${selectedLabel}, Syncate will use that date as the new cycle start and recalculate the upcoming estimates.`,
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: `Use ${formatShortDate(dateValue)}`,
                onPress: () => stageDateToggle(dateValue),
              },
            ]
          );
          return;
        }
      }

      stageDateToggle(dateValue);
    },
    [
      isEditMode,
      isSubmitting,
      lastPeriod?.next_period_date,
      pendingDates,
      periodLogs,
      stageDateToggle,
    ]
  );

  const handleSave = async () => {
    if (!previewStart || !previewEnd || isSubmitting || !isEditMode) {
      return;
    }

    if (hasConflict) {
      setSaveError(
        "Your selected days overlap more than one existing period. Please adjust your selection."
      );
      return;
    }

    setIsSubmitting(true);
    setSaveError("");

    try {
      if (targetPeriod) {
        await updatePeriod(targetPeriod.id, {
          start_date: previewStart,
          end_date: previewEnd,
        });
      } else if (previewStart === previewEnd) {
        // Day 1 is a fact; the end date is not known yet. Leaving end_date
        // null lets the backend show the user's usual remaining period days
        // as estimates. If bleeding continues, a later tap extends THIS row.
        await logPeriod({
          start_date: previewStart,
        });
      } else {
        await logPeriod({
          start_date: previewStart,
          end_date: previewEnd,
        });
      }

      // Refresh calendar, history AND the dashboard prediction anchor.
      // A newly logged early period changes all three.
      await Promise.all([
        reloadLoadedYears(),
        reloadPeriodLogs(),
        reloadDashboard(),
      ]);

      setSavedRangeLabel(
        previewStart === previewEnd
          ? formatShortDate(previewStart)
          : `${formatShortDate(previewStart)} – ${formatShortDate(previewEnd)}`
      );
      setPendingDates([]);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save your period days. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadOlderMonths = useCallback(() => {
    if (prependLockRef.current) {
      return;
    }

    prependLockRef.current = true;
    setRangeStartOffset((current) => current - MONTH_LOAD_CHUNK);

    setTimeout(() => {
      prependLockRef.current = false;
    }, 350);
  }, []);

  const loadNewerMonths = useCallback(() => {
    if (appendLockRef.current) {
      return;
    }

    appendLockRef.current = true;
    setRangeEndOffset((current) => current + MONTH_LOAD_CHUNK);

    setTimeout(() => {
      appendLockRef.current = false;
    }, 350);
  }, []);

  const handleScroll = useCallback(
    (offsetY: number) => {
      if (offsetY <= MONTH_ITEM_HEIGHT * 2) {
        loadOlderMonths();
      }
    },
    [loadOlderMonths]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const visibleYears = new Set<number>();

      for (const token of viewableItems) {
        if (token.item instanceof Date) {
          visibleYears.add(token.item.getFullYear());
        }
      }

      if (visibleYears.size === 0) {
        return;
      }

      const yearsToLoad = new Set<number>();

      for (const year of visibleYears) {
        yearsToLoad.add(year - 1);
        yearsToLoad.add(year);
        yearsToLoad.add(year + 1);
      }

      void ensureYearsRef.current(Array.from(yearsToLoad));
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
  }).current;

  const pendingDatesSet = useMemo(
    () => new Set(pendingDates),
    [pendingDates]
  );

  const renderMonth = useCallback(
    ({ item }: ListRenderItemInfo<MonthItem>) => (
      <MonthGrid
        monthDate={item}
        daysByDate={daysByDate}
        theme={theme}
        phaseTheme={phaseTheme}
        selectedDates={pendingDatesSet}
        impliedDates={impliedDates}
        onSelectDate={handleDateSelect}
        editingEnabled={isEditMode}
        disabled={periodsLoading || isSubmitting}
      />
    ),
    [
      daysByDate,
      handleDateSelect,
      impliedDates,
      isEditMode,
      isSubmitting,
      pendingDatesSet,
      periodsLoading,
      phaseTheme,
      theme,
    ]
  );

  if (
    !dashboardLoading
    && dashboardState === "awaiting_first_period"
  ) {
    return <UnknownCycleState nickname={nickname} />;
  }

  const pageError = calendarError || periodsError;
  const initialLoading = calendarLoading || periodsLoading;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={20} color={theme.text} />
            </Pressable>
          </View>

          <Text
            style={[
              styles.headerTitle,
              { color: theme.text },
            ]}
          >
            Your calendar
          </Text>

          <View style={[styles.headerSide, styles.headerSideRight]} />
        </View>

        <View style={styles.topContent}>
          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Scroll continuously through your cycle history and estimates.
          </Text>

          <PhaseLegend
            theme={theme}
            phaseTheme={phaseTheme}
          />

          {pageError ? (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: theme.primarySoft,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.errorText,
                  { color: theme.primary },
                ]}
              >
                {pageError}
              </Text>
            </View>
          ) : null}
        </View>

        {initialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text
              style={[
                styles.loadingText,
                { color: theme.muted },
              ]}
            >
              Loading your calendar…
            </Text>
          </View>
        ) : (
          <FlatList
            data={months}
            renderItem={renderMonth}
            keyExtractor={(month) =>
              `${month.getFullYear()}-${month.getMonth()}`
            }
            initialScrollIndex={INITIAL_MONTHS_BEFORE}
            getItemLayout={(_, index) => ({
              length: MONTH_ITEM_HEIGHT,
              offset: MONTH_ITEM_HEIGHT * index,
              index,
            })}
            ItemSeparatorComponent={() => (
              <View style={styles.monthSeparator} />
            )}
            ListFooterComponent={
              <Text
                style={[
                  styles.disclaimer,
                  { color: theme.muted },
                ]}
              >
                Cycle dates and phases are estimates and may change as
                you add more information. Logged period days are based
                on dates you entered.
              </Text>
            }
            contentContainerStyle={[
              styles.calendarContent,
              { paddingBottom: BOTTOM_BAR_CLEARANCE + insets.bottom },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={5}
            maxToRenderPerBatch={6}
            windowSize={7}
            onEndReached={loadNewerMonths}
            onEndReachedThreshold={1.5}
            onScroll={(event) =>
              handleScroll(event.nativeEvent.contentOffset.y)
            }
            scrollEventThrottle={32}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        )}

        <CalendarEditBar
          theme={theme}
          bottomInset={insets.bottom}
          isEditMode={isEditMode}
          onToggleEditMode={handleEditToggle}
          pendingCount={pendingDates.length}
          previewStart={previewStart}
          previewEnd={previewEnd}
          impliedCount={impliedDates.size}
          isEditingExisting={targetPeriod !== null}
          hasConflict={hasConflict}
          isSubmitting={isSubmitting}
          errorMessage={saveError}
          savedRangeLabel={savedRangeLabel}
          onSave={() => {
            void handleSave();
          }}
          onClearSelection={clearSelection}
        />
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

  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerSide: {
    width: 82,
    alignItems: "flex-start",
  },

  headerSideRight: {
    alignItems: "flex-end",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  topContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  subtitle: {
    marginBottom: 2,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },

  errorCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  errorText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    lineHeight: 18,
  },

  calendarContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  monthSeparator: {
    height: MONTH_GAP,
  },

  disclaimer: {
    paddingHorizontal: 28,
    paddingTop: 7,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});

export default CycleCalendarScreen;