// LOCATION: syncate-mobile/src/components/dashboard/MonthGrid.tsx
//
// One job: render one month in the dashboard calendar. The visual
// language intentionally follows the existing onboarding
// PeriodCalendar (soft month header, rounded card, weekday row and
// circular day buttons) instead of inventing a second calendar style.
// Phase values still come from the backend and cyclePhaseColors.

import { Sparkles } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  CyclePhaseKey,
  GuestThemeColors,
} from "@/constants/guestTheme";
import type { CalendarDay } from "@/services/cycleService";
import {
  getCalendarCells,
  isSameDay,
  toDateValue,
  WEEKDAY_LABELS,
} from "@/utils/calendarUtils";

type PhaseThemeMap = Record<
  CyclePhaseKey,
  {
    color: string;
    soft: string;
    label: string;
  }
>;

type MonthGridProps = {
  monthDate: Date;
  daysByDate: Map<string, CalendarDay>;
  theme: GuestThemeColors;
  phaseTheme: PhaseThemeMap;
  // Every date currently staged in this edit session (not yet saved).
  // A Set, not a single date — the whole point of the rewrite is that
  // more than one day can be marked as a period day before saving.
  selectedDates: ReadonlySet<string>;
  // Days that will ALSO be saved as period days because of how the
  // save will merge with an existing period or fill a gap between
  // tapped dates — but that the user did not personally tap. Shown
  // with a lighter, undashed preview so it's visibly different from
  // "you tapped this" and is never a silent surprise after Save.
  impliedDates: ReadonlySet<string>;
  // Saved period days staged for removal in this edit session. These are
  // shown as neutral/dashed instead of menstrual so the person can see
  // exactly what will disappear before pressing Save.
  removedDates: ReadonlySet<string>;
  onSelectDate: (value: string) => void;
  editingEnabled: boolean;
  disabled?: boolean;
};

// Every month deliberately renders six rows so each virtualized list
// item has the same height. That lets FlatList open directly on the
// current month without first painting January and jumping afterward.
export const MONTH_GRID_HEIGHT = 404;

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function getFixedCalendarCells(monthDate: Date) {
  const cells = [...getCalendarCells(monthDate)];

  while (cells.length < 42) {
    const lastDate = cells[cells.length - 1].date;
    const nextDate = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate() + 1
    );

    cells.push({
      date: nextDate,
      inMonth: false,
    });
  }

  return cells;
}

function MonthGrid({
  monthDate,
  daysByDate,
  theme,
  phaseTheme,
  selectedDates,
  impliedDates,
  removedDates,
  onSelectDate,
  editingEnabled,
  disabled = false,
}: MonthGridProps) {
  const cells = getFixedCalendarCells(monthDate);
  const today = startOfDay(new Date());
  const menstrualTheme = phaseTheme.menstrual;

  const monthLabel = monthDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.monthHeader,
          {
            backgroundColor: theme.primarySoft,
          },
        ]}
      >
        <View style={styles.monthLabelRow}>
          <Sparkles
            size={13}
            strokeWidth={1.8}
            color={theme.primary}
          />

          <Text
            style={[
              styles.monthLabel,
              { color: theme.primary },
            ]}
          >
            {monthLabel}
          </Text>
        </View>
      </View>

      <View style={styles.calendarBody}>
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              style={[
                styles.weekdayLabel,
                { color: theme.muted },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, index) => {
            const normalizedDate = startOfDay(cell.date);
            const dateKey = toDateValue(normalizedDate);
            const dayInfo = daysByDate.get(dateKey);
            const phaseEntry = dayInfo?.phase
              ? phaseTheme[dayInfo.phase]
              : null;

            const isSelected =
              cell.inMonth && selectedDates.has(dateKey);

            const isImplied =
              cell.inMonth && !isSelected && impliedDates.has(dateKey);

            const isRemoved =
              cell.inMonth && removedDates.has(dateKey);

            const isToday =
              cell.inMonth
              && isSameDay(normalizedDate, today);

            const isFuture = normalizedDate > today;
            const isDateDisabled =
              disabled
              || !editingEnabled
              || isFuture
              || !cell.inMonth;

            return (
              <View
                key={`${dateKey}-${index}`}
                style={styles.cellWrapper}
              >
                <Pressable
                  onPress={() => onSelectDate(dateKey)}
                  disabled={isDateDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={normalizedDate.toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                  accessibilityHint={
                    !editingEnabled
                      ? "Use the Edit button to change period dates"
                      : isFuture
                        ? "Future dates cannot be logged as period starts"
                        : "Select this date"
                  }
                  accessibilityState={{
                    disabled: isDateDisabled,
                    selected: isSelected,
                  }}
                  style={({ pressed }) => [
                    styles.dayButton,
                    {
                      backgroundColor:
                        // Pending (unsaved) selections always preview
                        // as the menstrual color, regardless of what
                        // phase the day currently shows — this is the
                        // "tap it and it turns period color" behavior.
                        isRemoved
                          ? "transparent"
                          : cell.inMonth && (isSelected || isImplied)
                            ? menstrualTheme.soft
                            : cell.inMonth && phaseEntry
                            ? phaseEntry.soft
                            : "transparent",
                    },
                    isToday
                    && !isSelected
                    && !isImplied
                    && !isRemoved && {
                      borderWidth: 1.5,
                      borderColor: theme.primary,
                    },
                    isSelected && {
                      borderWidth: 2.5,
                      borderStyle: "dashed",
                      borderColor: menstrualTheme.color,
                      shadowColor: theme.shadow,
                    },
                    isSelected && styles.selectedDayButton,
                    isRemoved && {
                      borderWidth: 2,
                      borderStyle: "dashed",
                      borderColor: theme.muted,
                      opacity: 0.62,
                    },
                    // Implied days get a lighter, dotted outline —
                    // deliberately less confident-looking than a
                    // direct tap, so it reads as "this will also be
                    // included" rather than "you selected this".
                    isImplied && {
                      borderWidth: 1.5,
                      borderStyle: "dotted",
                      borderColor: menstrualTheme.color,
                      opacity: 0.7,
                    },
                    pressed
                    && !isDateDisabled
                    && !isSelected && {
                      opacity: 0.7,
                      transform: [{ scale: 0.94 }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: !cell.inMonth
                          ? theme.muted
                          : isRemoved
                            ? theme.muted
                            : isSelected || isImplied
                              ? menstrualTheme.color
                              : phaseEntry
                              ? phaseEntry.color
                              : theme.text,
                        opacity: !cell.inMonth
                          ? 0.25
                          : isFuture
                            ? 0.62
                            : 1,
                        fontWeight:
                          isSelected || isRemoved || isToday
                            ? "800"
                            : "500",
                      },
                    ]}
                  >
                    {cell.date.getDate()}
                  </Text>

                  {dayInfo?.source === "logged" && cell.inMonth && !isSelected && !isImplied && !isRemoved ? (
                    <View
                      style={[
                        styles.loggedDot,
                        {
                          backgroundColor:
                            phaseTheme.menstrual.color,
                        },
                      ]}
                    />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const CELL_PERCENT_WIDTH = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  calendarCard: {
    width: "100%",
    height: MONTH_GRID_HEIGHT,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 26,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 3,
  },

  monthHeader: {
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  monthLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  monthLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  calendarBody: {
    paddingHorizontal: 14,
    paddingTop: 17,
    paddingBottom: 18,
  },

  weekdayRow: {
    marginBottom: 10,
    flexDirection: "row",
  },

  weekdayLabel: {
    width: CELL_PERCENT_WIDTH,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 5,
  },

  cellWrapper: {
    width: CELL_PERCENT_WIDTH,
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  dayButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDayButton: {
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  dayText: {
    fontSize: 13,
    lineHeight: 18,
  },

  loggedDot: {
    position: "absolute",
    bottom: 3,
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
});

export default MonthGrid;