// LOCATION: syncate-mobile/src/screens/dashboard/CycleCalendarScreen.tsx
//
// Continuous registered-user cycle calendar. This screen orchestrates
// virtualized month scrolling, edit mode and inline period saving.
// Month rendering stays in MonthGrid and all phase calculations remain
// backend-owned through GET /me/calendar/?year=.
//
// === CHANGED: editing used to mean "pick one date, move a period's
// start to it" — tapping a day inside a period only let you shift
// where it began. It's now a real multi-day toggle: tap any number of
// past dates to mark (or unmark) them as period days. Tapping into an
// existing logged period seeds the whole thing so it can be grown or
// shrunk, not just nudged. The Edit toggle and Save action also moved
// out of the header/scroll flow into a sticky bottom bar (CalendarEditBar,
// still exported from InlinePeriodEditor.tsx) so they're always within
// thumb reach regardless of scroll position.

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
  type PeriodLogResponse,
  updatePeriod,
} from "@/services/cycleService";
import {
  enumerateDateRange,
  formatShortDate,
} from "@/utils/calendarUtils";

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

function dateFallsInsidePeriod(
  dateValue: string,
  period: PeriodLogResponse
): boolean {
  if (dateValue < period.start_date) {
    return false;
  }

  const periodEnd = period.end_date ?? period.start_date;
  return dateValue <= periodEnd;
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

  // Which existing logged period (if any) the current selection
  // belongs to. Found this way rather than tracked separately so it
  // always stays in sync with whatever's actually in pendingDates.
  const targetPeriod = useMemo(() => {
    if (pendingDates.length === 0) {
      return null;
    }

    return (
      periodLogs.find((period) =>
        pendingDates.some((dateValue) =>
          dateFallsInsidePeriod(dateValue, period)
        )
      ) ?? null
    );
  }, [pendingDates, periodLogs]);

  const rangeStart = pendingDates[0] ?? null;
  const rangeEnd = pendingDates[pendingDates.length - 1] ?? null;

  // One PeriodLog row can only ever be one continuous range, so any
  // gap between tapped days (e.g. tapping the 6th and the 9th) still
  // gets saved as period days too. Surfaced in the edit bar so that's
  // never a silent surprise.
  const gapCount =
    rangeStart && rangeEnd
      ? enumerateDateRange(rangeStart, rangeEnd).length
        - pendingDates.length
      : 0;

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

  const handleDateSelect = useCallback(
    (dateValue: string) => {
      if (!isEditMode || isSubmitting) {
        return;
      }

      setSaveError("");
      setSavedRangeLabel(null);

      // Tapping an already-selected day toggles it back off — this is
      // what lets a period be shrunk, not just grown.
      if (pendingDates.includes(dateValue)) {
        setPendingDates(
          pendingDates.filter((existing) => existing !== dateValue)
        );
        return;
      }

      // First tap of a fresh session: if it lands inside an existing
      // logged period, seed the whole period's saved range so it can
      // be edited freely, instead of only being able to move its
      // start date.
      if (pendingDates.length === 0) {
        const existingPeriod = periodLogs.find((period) =>
          dateFallsInsidePeriod(dateValue, period)
        );

        setPendingDates(
          existingPeriod
            ? enumerateDateRange(
              existingPeriod.start_date,
              existingPeriod.end_date ?? existingPeriod.start_date
            )
            : [dateValue]
        );
        return;
      }

      // Stop two distinct saved periods getting merged into one row
      // by accident — finish (or clear) the current selection first.
      const tappedBelongsTo = periodLogs.find((period) =>
        dateFallsInsidePeriod(dateValue, period)
      );

      if (
        tappedBelongsTo
        && targetPeriod
        && tappedBelongsTo.id !== targetPeriod.id
      ) {
        setSaveError(
          "Finish saving this period before editing another one."
        );
        return;
      }

      setPendingDates([...pendingDates, dateValue].sort());
    },
    [isEditMode, isSubmitting, pendingDates, periodLogs, targetPeriod]
  );

  const handleSave = async () => {
    if (!rangeStart || !rangeEnd || isSubmitting || !isEditMode) {
      return;
    }

    setIsSubmitting(true);
    setSaveError("");

    try {
      if (targetPeriod) {
        await updatePeriod(targetPeriod.id, {
          start_date: rangeStart,
          end_date: rangeEnd,
        });
      } else {
        await logPeriod({
          start_date: rangeStart,
          end_date: rangeEnd,
        });
      }

      // Refresh every year the user has actually loaded. Editing an
      // older period can affect predictions after that date, so only
      // refreshing the current year would leave visible years stale.
      await Promise.all([
        reloadLoadedYears(),
        reloadPeriodLogs(),
      ]);

      setSavedRangeLabel(
        rangeStart === rangeEnd
          ? formatShortDate(rangeStart)
          : `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`
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
        onSelectDate={handleDateSelect}
        editingEnabled={isEditMode}
        disabled={periodsLoading || isSubmitting}
      />
    ),
    [
      daysByDate,
      handleDateSelect,
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
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          gapCount={gapCount}
          isEditingExisting={targetPeriod !== null}
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