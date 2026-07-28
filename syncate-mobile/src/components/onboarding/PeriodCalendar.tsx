import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getCalendarCells,
  isSameDay,
  parseDateValue,
  toDateValue,
  WEEKDAY_LABELS,
  type CalendarCell,
} from "@/utils/calendarUtils";

type PeriodCalendarProps = {
  value: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

function chunkIntoWeeks(
  cells: CalendarCell[]
): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function PeriodCalendar({
  value,
  onSelect,
  disabled = false,
}: PeriodCalendarProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const today = useMemo(
    () => startOfDay(new Date()),
    []
  );

  const selectedDate = value
    ? parseDateValue(value)
    : null;

  const initialViewDate = selectedDate ?? today;

  const [viewDate, setViewDate] = useState(
    new Date(
      initialViewDate.getFullYear(),
      initialViewDate.getMonth(),
      1
    )
  );

  useEffect(() => {
    if (!selectedDate) return;

    setViewDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );
  }, [value]);

  const calendarCells = getCalendarCells(viewDate);
  const weeks = chunkIntoWeeks(calendarCells);

  const monthLabel = viewDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const isViewingCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

  const goToPreviousMonth = () => {
    if (disabled) return;

    setViewDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    if (disabled || isViewingCurrentMonth) return;

    setViewDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  };

  const handleDateSelect = (
    date: Date,
    isInCurrentMonth: boolean
  ) => {
    const normalizedDate = startOfDay(date);

    if (
      disabled ||
      normalizedDate > today ||
      !isInCurrentMonth
    ) {
      return;
    }

    onSelect(toDateValue(normalizedDate));
  };

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
        <Pressable
          onPress={goToPreviousMonth}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Show previous month"
          style={({ pressed }) => [
            styles.navigationButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed &&
              !disabled &&
              styles.navigationButtonPressed,
          ]}
        >
          <ChevronLeft
            size={18}
            strokeWidth={2}
            color={theme.primary}
          />
        </Pressable>

        <View style={styles.monthLabelRow}>
          <Sparkles
            size={13}
            strokeWidth={1.8}
            color={theme.primary}
          />

          <Text
            style={[
              styles.monthLabel,
              {
                color: theme.primary,
              },
            ]}
          >
            {monthLabel}
          </Text>
        </View>

        <Pressable
          onPress={goToNextMonth}
          disabled={
            disabled || isViewingCurrentMonth
          }
          accessibilityRole="button"
          accessibilityLabel="Show next month"
          accessibilityState={{
            disabled:
              disabled || isViewingCurrentMonth,
          }}
          style={({ pressed }) => [
            styles.navigationButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            isViewingCurrentMonth &&
              styles.navigationButtonDisabled,
            pressed &&
              !disabled &&
              !isViewingCurrentMonth &&
              styles.navigationButtonPressed,
          ]}
        >
          <ChevronRight
            size={18}
            strokeWidth={2}
            color={theme.primary}
          />
        </Pressable>
      </View>

      <View style={styles.calendarBody}>
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              style={[
                styles.weekdayLabel,
                {
                  color: theme.muted,
                },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.weeksContainer}>
          {weeks.map((week, weekIndex) => (
            <View
              key={`week-${weekIndex}`}
              style={styles.weekRow}
            >
              {week.map(
                (
                  { date, inMonth },
                  dayIndex
                ) => {
                  const normalizedDate =
                    startOfDay(date);

                  const isFutureDate =
                    normalizedDate > today;

                  const isSelected =
                    selectedDate !== null &&
                    isSameDay(
                      normalizedDate,
                      selectedDate
                    );

                  const isToday =
                    isSameDay(
                      normalizedDate,
                      today
                    ) && !isSelected;

                  const isDateDisabled =
                    disabled ||
                    isFutureDate ||
                    !inMonth;

                  return (
                    <View
                      key={`${weekIndex}-${dayIndex}`}
                      style={styles.dayCell}
                    >
                      <Pressable
                        onPress={() =>
                          handleDateSelect(
                            normalizedDate,
                            inMonth
                          )
                        }
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
                        accessibilityState={{
                          selected: isSelected,
                          disabled: isDateDisabled,
                        }}
                        style={({ pressed }) => [
                          styles.dayButton,
                          isSelected && {
                            backgroundColor:
                              theme.primaryButton,
                            shadowColor:
                              theme.shadow,
                          },
                          isSelected &&
                            styles.selectedDayButton,
                          pressed &&
                            !isDateDisabled &&
                            !isSelected &&
                            {
                              backgroundColor:
                                theme.primarySoft,
                            },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            {
                              color: isSelected
                                ? "#FFFFFF"
                                : isDateDisabled
                                  ? theme.border
                                  : theme.text,
                            },
                            isSelected &&
                              styles.selectedDayText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </Pressable>

                      <View
                        style={[
                          styles.todayDot,
                          {
                            backgroundColor: isToday
                              ? theme.primary
                              : "transparent",
                          },
                        ]}
                      />
                    </View>
                  );
                }
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 26,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 4,
  },

  monthHeader: {
    minHeight: 62,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navigationButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  navigationButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },

  navigationButtonDisabled: {
    opacity: 0.35,
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
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  weeksContainer: {
    gap: 5,
  },

  weekRow: {
    flexDirection: "row",
  },

  dayCell: {
    flex: 1,
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
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },

  dayText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  selectedDayText: {
    fontWeight: "700",
  },

  todayDot: {
    width: 4,
    height: 4,
    marginTop: 1,
    borderRadius: 2,
  },
});

export default PeriodCalendar;