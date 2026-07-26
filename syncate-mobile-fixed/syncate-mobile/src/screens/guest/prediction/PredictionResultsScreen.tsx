import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkle,
  Sun,
  Timer,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
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
  addDays,
  diffInDays,
  formatLongDate,
  getCalendarCellsMonFirst,
  parseDateValue,
  toDateValue,
} from "@/utils/calendarUtils";

const CYCLE_TYPE_LABEL: Record<string, string> = {
  short: "Short",
  medium: "Medium",
  long: "Long",
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type PhaseKey = "period" | "ovulation" | "follicular" | "luteal";

type CalendarCell = {
  date: Date;
  inMonth: boolean;
};

type PhaseStyle = {
  dot: string;
  lightCell: string;
  lightText: string;
  darkCell: string;
  darkText: string;
};

const PHASE_LEGEND: { key: PhaseKey; label: string }[] = [
  { key: "period", label: "Period" },
  { key: "ovulation", label: "Ovulation" },
  { key: "follicular", label: "Follicular Phase" },
  { key: "luteal", label: "Luteal Phase" },
];

function chunkIntoWeeks<T>(items: T[]): T[][] {
  const weeks: T[][] = [];

  for (let index = 0; index < items.length; index += 7) {
    weeks.push(items.slice(index, index + 7));
  }

  return weeks;
}

function PredictionResults() {
  const { isDark, toggleDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const params = useLocalSearchParams<{
    lastPeriodDate?: string;
    cycleType?: string;
    periodDuration?: string;
    nextPeriodStart?: string;
    nextPeriodEnd?: string;
    ovulationDate?: string;
    cycleLength?: string;
  }>();

  const lastPeriodDate = params.lastPeriodDate ?? "2025-05-20";
  const cycleType = params.cycleType ?? "medium";

  const periodDuration = params.periodDuration
    ? Number(params.periodDuration)
    : 5;

  const cycleLength = params.cycleLength
    ? Number(params.cycleLength)
    : 28;

  const lastPeriodStart = parseDateValue(lastPeriodDate);

  const nextPeriodStart = params.nextPeriodStart
    ? new Date(params.nextPeriodStart)
    : addDays(lastPeriodStart, cycleLength);

  const nextPeriodEnd = params.nextPeriodEnd
    ? new Date(params.nextPeriodEnd)
    : addDays(nextPeriodStart, periodDuration - 1);

  const ovulationDate = params.ovulationDate
    ? new Date(params.ovulationDate)
    : addDays(nextPeriodStart, -14);

  const currentPeriodEnd = addDays(lastPeriodStart, periodDuration - 1);

  const follicularStart = addDays(currentPeriodEnd, 1);
  const follicularEnd = addDays(ovulationDate, -1);

  const lutealStart = addDays(ovulationDate, 1);
  const lutealEnd = addDays(nextPeriodStart, -1);

  const phaseByDate = useMemo(() => {
    const phaseMap = new Map<string, PhaseKey>();

    const fillPhase = (
      startDate: Date,
      endDate: Date,
      phase: PhaseKey
    ) => {
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        phaseMap.set(toDateValue(cursor), phase);
        cursor = addDays(cursor, 1);
      }
    };

    fillPhase(lastPeriodStart, currentPeriodEnd, "period");

    if (follicularStart <= follicularEnd) {
      fillPhase(follicularStart, follicularEnd, "follicular");
    }

    phaseMap.set(toDateValue(ovulationDate), "ovulation");

    if (lutealStart <= lutealEnd) {
      fillPhase(lutealStart, lutealEnd, "luteal");
    }

    fillPhase(nextPeriodStart, nextPeriodEnd, "period");

    return phaseMap;
  }, [
    lastPeriodDate,
    periodDuration,
    cycleLength,
    params.nextPeriodStart,
    params.nextPeriodEnd,
    params.ovulationDate,
  ]);

  const [viewDate, setViewDate] = useState(
    new Date(nextPeriodStart.getFullYear(), nextPeriodStart.getMonth(), 1)
  );

  const cells = getCalendarCellsMonFirst(viewDate) as CalendarCell[];
  const weeks = chunkIntoWeeks(cells);

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goPrevMonth = () => {
    setViewDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    setViewDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilNextPeriod = diffInDays(nextPeriodStart, today);

  const phaseStyles: Record<PhaseKey, PhaseStyle> = {
    period: {
      dot: isDark ? "#FF7CA3" : "#F2386A",
      lightCell: "#FCE7EF",
      lightText: "#D92A5B",
      darkCell: "#3A2430",
      darkText: "#FF91B2",
    },

    ovulation: {
      dot: isDark ? "#C79CFF" : "#9B6BF2",
      lightCell: "#EEE3FF",
      lightText: "#7443C9",
      darkCell: "#332750",
      darkText: "#D5B8FF",
    },

    follicular: {
      dot: isDark ? "#FFD98A" : "#D9A232",
      lightCell: "#FBEBC5",
      lightText: "#70500A",
      darkCell: "#433719",
      darkText: "#FFE09B",
    },

    luteal: {
      dot: isDark ? "#7FD9D0" : "#4CA868",
      lightCell: "#DDF2E3",
      lightText: "#28673D",
      darkCell: "#1E3A33",
      darkText: "#93E5C3",
    },
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
      <ScrollView
        style={{
          backgroundColor: theme.background,
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.circleButton,
                  {
                    borderColor: isDark ? "#FFFFFF" : "#F4467A",
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <ArrowLeft
                  size={18}
                  color={isDark ? "#FFFFFF" : "#F2386A"}
                />
              </Pressable>

              <Pressable
                onPress={toggleDark}
                accessibilityRole="button"
                accessibilityLabel="Toggle dark mode"
                style={({ pressed }) => [
                  styles.circleButton,
                  {
                    borderColor: isDark ? "#FFFFFF" : "#F4467A",
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                {isDark ? (
                  <Sun size={18} color="#FFFFFF" />
                ) : (
                  <Moon size={18} color="#F2386A" />
                )}
              </Pressable>
            </View>

            <Text
              style={[
                styles.headerTitle,
                {
                  color: isDark ? "#F3EDF1" : "#1E1730",
                },
              ]}
            >
              Your Predictions
            </Text>
          </View>

          <View
            style={[
              styles.nextPeriodCard,
              {
                borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                backgroundColor: isDark ? "#221A28" : "#FCE7EF",
              },
            ]}
          >
            <Text
              style={[
                styles.nextPeriodLabel,
                {
                  color: isDark ? "#FF7CA3" : "#F2386A",
                },
              ]}
            >
              Next period starts on
            </Text>

            <Text
              style={[
                styles.nextPeriodDate,
                {
                  color: isDark ? "#F3EDF1" : "#1E1730",
                },
              ]}
            >
              {formatLongDate(nextPeriodStart)}
            </Text>

            <View
              style={[
                styles.pill,
                {
                  backgroundColor: isDark ? "#3A2430" : "#FFFFFF",
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isDark ? "#FF7CA3" : "#F2386A",
                  },
                ]}
              >
                {daysUntilNextPeriod >= 0
                  ? `That's in ${daysUntilNextPeriod} days`
                  : "This date has passed"}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                {
                  borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                  backgroundColor: isDark ? "#221A28" : "#FFFFFF",
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? "#3A2430" : "#FCE7EF",
                  },
                ]}
              >
                <Timer
                  size={15}
                  color={isDark ? "#FF7CA3" : "#F2386A"}
                />
              </View>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark ? "#B7ACB8" : "#8D8A99",
                  },
                ]}
              >
                Cycle Length
              </Text>

              <Text
                style={[
                  styles.statValue,
                  {
                    color: isDark ? "#F3EDF1" : "#1E1730",
                  },
                ]}
              >
                {cycleLength} days
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                  backgroundColor: isDark ? "#221A28" : "#FFFFFF",
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? "#3A2430" : "#FCE7EF",
                  },
                ]}
              >
                <CalendarDays
                  size={15}
                  color={isDark ? "#FF7CA3" : "#F2386A"}
                />
              </View>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark ? "#B7ACB8" : "#8D8A99",
                  },
                ]}
              >
                Period Duration
              </Text>

              <Text
                style={[
                  styles.statValue,
                  {
                    color: isDark ? "#F3EDF1" : "#1E1730",
                  },
                ]}
              >
                {periodDuration} days
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                  backgroundColor: isDark ? "#221A28" : "#FFFFFF",
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? "#3A2430" : "#FCE7EF",
                  },
                ]}
              >
                <Sparkle
                  size={15}
                  color={isDark ? "#FF7CA3" : "#F2386A"}
                />
              </View>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark ? "#B7ACB8" : "#8D8A99",
                  },
                ]}
              >
                Cycle Type
              </Text>

              <Text
                style={[
                  styles.statValue,
                  {
                    color: isDark ? "#F3EDF1" : "#1E1730",
                  },
                ]}
              >
                {CYCLE_TYPE_LABEL[cycleType] ?? "Regular"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.calendarCard,
              {
                borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                backgroundColor: isDark ? "#221A28" : "#FFFFFF",
              },
            ]}
          >
            <View style={styles.calendarNav}>
              <Pressable
                onPress={goPrevMonth}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={10}
                style={({ pressed }) => [
                  styles.calendarNavButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ChevronLeft
                  size={18}
                  color={isDark ? "#FF7CA3" : "#F2386A"}
                />
              </Pressable>

              <Text
                style={[
                  styles.calendarMonthLabel,
                  {
                    color: isDark ? "#F3EDF1" : "#1E1730",
                  },
                ]}
              >
                {monthLabel}
              </Text>

              <Pressable
                onPress={goNextMonth}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={10}
                style={({ pressed }) => [
                  styles.calendarNavButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ChevronRight
                  size={18}
                  color={isDark ? "#FF7CA3" : "#F2386A"}
                />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_LABELS.map((label) => (
                <Text
                  key={label}
                  style={[
                    styles.weekdayLabel,
                    {
                      color: isDark ? "#B7ACB8" : "#8D8A99",
                    },
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {weeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.calendarRow}>
                  {week.map(({ date, inMonth }, columnIndex) => {
                    const dateKey = toDateValue(date);

                    const phase = inMonth
                      ? phaseByDate.get(dateKey)
                      : undefined;

                    const activePhaseStyle = phase
                      ? phaseStyles[phase]
                      : null;

                    const previousCell =
                      columnIndex > 0 ? week[columnIndex - 1] : null;

                    const nextCell =
                      columnIndex < week.length - 1
                        ? week[columnIndex + 1]
                        : null;

                    const previousPhase =
                      previousCell?.inMonth && previousCell
                        ? phaseByDate.get(toDateValue(previousCell.date))
                        : undefined;

                    const nextPhase =
                      nextCell?.inMonth && nextCell
                        ? phaseByDate.get(toDateValue(nextCell.date))
                        : undefined;

                    const connectsLeft =
                      Boolean(phase) && previousPhase === phase;

                    const connectsRight =
                      Boolean(phase) && nextPhase === phase;

                    const isSinglePhaseDay =
                      Boolean(phase) &&
                      !connectsLeft &&
                      !connectsRight;

                    const isPhaseStart =
                      Boolean(phase) &&
                      !connectsLeft &&
                      connectsRight;

                    const isPhaseEnd =
                      Boolean(phase) &&
                      connectsLeft &&
                      !connectsRight;

                    return (
                      <View
                        key={dateKey}
                        style={styles.calendarCell}
                      >
                        <View
                          style={[
                            styles.calendarCellInner,

                            activePhaseStyle && {
                              backgroundColor: isDark
                                ? activePhaseStyle.darkCell
                                : activePhaseStyle.lightCell,
                            },

                            isSinglePhaseDay &&
                              styles.singlePhaseDay,

                            isPhaseStart &&
                              styles.phaseStart,

                            isPhaseEnd &&
                              styles.phaseEnd,

                            phase &&
                              connectsLeft &&
                              connectsRight &&
                              styles.phaseMiddle,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarCellText,

                              !inMonth
                                ? {
                                    color: isDark
                                      ? "#4A3948"
                                      : "#CAD2DF",
                                  }
                                : activePhaseStyle
                                  ? {
                                      color: isDark
                                        ? activePhaseStyle.darkText
                                        : activePhaseStyle.lightText,
                                      fontWeight: "700",
                                    }
                                  : {
                                      color: isDark
                                        ? "#F3EDF1"
                                        : "#1E1730",
                                    },
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.legendRow}>
              {PHASE_LEGEND.map(({ key, label }) => (
                <View key={key} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: phaseStyles[key].dot,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.legendLabel,
                      {
                        color: isDark ? "#B7ACB8" : "#747D8E",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.aboutCard,
              {
                borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                backgroundColor: isDark ? "#221A28" : "#FCE7EF",
              },
            ]}
          >
            <Text
              style={[
                styles.aboutTitle,
                {
                  color: isDark ? "#FF7CA3" : "#F2386A",
                },
              ]}
            >
              About your cycle
            </Text>

            <Text
              style={[
                styles.aboutText,
                {
                  color: isDark ? "#F3EDF1" : "#1E1730",
                },
              ]}
            >
              Your next period is predicted to start on{" "}
              <Text style={styles.bold}>
                {formatLongDate(nextPeriodStart)}
              </Text>{" "}
              and your ovulation is likely on{" "}
              <Text style={styles.bold}>
                {formatLongDate(ovulationDate)}
              </Text>
              .
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/guest/predict")}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: isDark ? "#FF6F98" : "#F4467A",
              },
              pressed && styles.pressedScale,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Log Period Again
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/guest/articles")}
            style={({ pressed }) => [
              styles.secondaryLink,
              pressed && styles.pressedScale,
            ]}
          >
            <BookOpenText
              size={15}
              color={isDark ? "#FF7CA3" : "#F2386A"}
            />

            <Text
              style={[
                styles.secondaryLinkText,
                {
                  color: isDark ? "#FF7CA3" : "#F2386A",
                },
              ]}
            >
              Go to Educational Content
            </Text>

            <ArrowRight
              size={14}
              color={isDark ? "#FF7CA3" : "#F2386A"}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  header: {
    marginBottom: 36,
  },

  headerRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  circleButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.7,
  },

  headerTitle: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  nextPeriodCard: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },

  nextPeriodLabel: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "500",
  },

  nextPeriodDate: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 29,
  },

  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  pillText: {
    fontSize: 12.5,
    fontWeight: "500",
  },

  statsRow: {
    marginBottom: 20,
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 105,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 14,
  },

  statIcon: {
    marginBottom: 8,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },

  statValue: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  calendarCard: {
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18,
  },

  calendarNav: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  calendarNavButton: {
    minHeight: 34,
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarMonthLabel: {
    minWidth: 140,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },

  weekdayRow: {
    marginBottom: 7,
    flexDirection: "row",
  },

  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.25,
  },

  calendarGrid: {
    gap: 6,
  },

  calendarRow: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
  },

  calendarCell: {
    flex: 1,
    height: 34,
    justifyContent: "center",
  },

  calendarCellInner: {
    height: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  singlePhaseDay: {
    borderRadius: 16,
  },

  phaseStart: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  phaseMiddle: {
    borderRadius: 0,
  },

  phaseEnd: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  calendarCellText: {
    fontSize: 12.5,
    lineHeight: 17,
  },

  legendRow: {
    marginTop: 17,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 14,
    rowGap: 9,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendDot: {
    height: 9,
    width: 9,
    borderRadius: 5,
  },

  legendLabel: {
    fontSize: 11,
    lineHeight: 15,
  },

  aboutCard: {
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },

  aboutTitle: {
    marginBottom: 4,
    fontSize: 13.5,
    fontWeight: "600",
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 19.5,
    textAlign: "center",
  },

  bold: {
    fontWeight: "600",
  },

  primaryButton: {
    marginBottom: 20,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,

    shadowColor: "#F4467A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },

  pressedScale: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  secondaryLink: {
    marginBottom: 16,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },

  secondaryLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default PredictionResults;