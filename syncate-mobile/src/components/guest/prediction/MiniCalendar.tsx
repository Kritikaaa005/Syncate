// Destination: components/guest/prediction/MiniCalendar.tsx

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Sparkle } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getCalendarCells,
  isSameDay,
  parseDateValue,
  toDateValue,
  WEEKDAY_LABELS,
} from "@/utils/calendarUtils";

type MiniCalendarProps = {
  value: string;
  onSelect: (value: string) => void;
  isDark: boolean;
  // Off by default — the existing guest screens (log period, quick
  // prediction) only ever need to step a month or two, so they keep the
  // original two-arrow header. A DOB can be decades back, though, so
  // DateOfBirthInput turns this on to add prev/next-year jumps too,
  // rather than making everyone click through ~430 months to reach 1990.
  enableYearNav?: boolean;
};

function chunkIntoWeeks<T>(items: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < items.length; i += 7) {
    weeks.push(items.slice(i, i + 7));
  }
  return weeks;
}

function MiniCalendar({ value, onSelect, isDark, enableYearNav = false }: MiniCalendarProps) {
  const selectedDate = parseDateValue(value);
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = getCalendarCells(viewDate);
  const weeks = chunkIntoWeeks(cells);
  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goNextMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const goPrevYear = () =>
    setViewDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));

  const goNextYear = () =>
    setViewDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));

  const goToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelect(toDateValue(today));
  };

  const accent = isDark ? "#FF7CA3" : "#F2386A";

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isDark ? "#3A2A38" : "#E8EEF8",
          backgroundColor: isDark ? "#221A28" : "#FFFFFF",
        },
      ]}
    >
      <View style={[styles.monthHeader, { backgroundColor: isDark ? "#3A2430" : "#FCE7EF" }]}>
        {enableYearNav ? (
          <Pressable
            onPress={goPrevYear}
            accessibilityLabel="Previous year"
            style={[styles.navButton, { backgroundColor: isDark ? "#221A28" : "#FFFFFF" }]}
          >
            <ChevronsLeft size={14} color={accent} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={goPrevMonth}
          accessibilityLabel="Previous month"
          style={[styles.navButton, { backgroundColor: isDark ? "#221A28" : "#FFFFFF" }]}
        >
          <ChevronLeft size={14} color={accent} />
        </Pressable>

        <View style={styles.monthLabelRow}>
          <Sparkle size={11} color={accent} style={styles.monthLabelIcon} />
          <Text style={[styles.monthLabel, { color: accent }]}>{monthLabel}</Text>
        </View>

        <Pressable
          onPress={goNextMonth}
          accessibilityLabel="Next month"
          style={[styles.navButton, { backgroundColor: isDark ? "#221A28" : "#FFFFFF" }]}
        >
          <ChevronRight size={14} color={accent} />
        </Pressable>

        {enableYearNav ? (
          <Pressable
            onPress={goNextYear}
            accessibilityLabel="Next year"
            style={[styles.navButton, { backgroundColor: isDark ? "#221A28" : "#FFFFFF" }]}
          >
            <ChevronsRight size={14} color={accent} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <Text
              key={i}
              style={[styles.weekdayLabel, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}
            >
              {label}
            </Text>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map(({ date, inMonth }, i) => {
              const disabled = date > today;
              const selected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today) && !selected;

              return (
                <View key={i} style={styles.dayCell}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => onSelect(toDateValue(date))}
                    style={[
                      styles.dayButton,
                      selected && {
                        backgroundColor: isDark ? "#FF6F98" : "#F4467A",
                        shadowColor: isDark ? "#FF6F98" : "#F4467A",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        elevation: 4,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected
                          ? { color: isDark ? "#221A28" : "#FFFFFF", fontWeight: "600" }
                          : disabled || !inMonth
                          ? { color: isDark ? "#3A2A38" : "#F6D9E3" }
                          : { color: isDark ? "#F3EDF1" : "#1E1730" },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>

                  <View
                    style={[
                      styles.todayDot,
                      { backgroundColor: isToday ? accent : "transparent" },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        ))}

        {!enableYearNav ? (
          <Pressable
            onPress={goToday}
            style={[
              styles.todayButton,
              { borderColor: isDark ? "#3A2A38" : "#E8EEF8" },
            ]}
          >
            <Text style={[styles.todayButtonText, { color: accent }]}>Jump to today</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "100%",
    zIndex: 20,
    marginTop: 8,
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#F2386A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 12,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navButton: {
    height: 28,
    width: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  monthLabelIcon: {
    opacity: 0.7,
  },
  monthLabel: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  weekdayRow: {
    marginBottom: 8,
    flexDirection: "row",
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 10.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  dayCell: {
    flex: 1,
    alignItems: "center",
  },
  dayButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 12.5,
  },
  todayDot: {
    marginTop: 2,
    height: 4,
    width: 4,
    borderRadius: 2,
  },
  todayButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
  },
  todayButtonText: {
    fontSize: 11.5,
    fontWeight: "500",
  },
});

export default MiniCalendar;