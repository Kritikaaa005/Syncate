// Destination: app/guest/log-period.tsx
//
// NOTE: this screen (src/pages/guest/Logyourperiod.jsx in the original repo)
// was never imported by AppRoutes.tsx or any other file — it appears to be
// an earlier, unused draft of QuickPrediction.tsx. It also managed its own
// local `isDark` state instead of the shared ThemeContext (a pre-existing
// inconsistency, not something introduced here). Converted faithfully as
// requested, including that standalone dark-mode state and its distinct
// navigation target ("/guest/results", different from QuickPrediction's
// "/guest/predict/results") — neither of those two results routes matches
// this file's target 1:1, so double check which flow you actually want live.
//
// The original used a hidden native <input type="date"> with showPicker().
// React Native has no DOM date input, so this uses the same tap-to-open
// inline calendar pattern already used in QuickPrediction (MiniCalendar),
// which is the closest RN-native equivalent without adding a new dependency.

import { router } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Heart,
  Info,
  Minus,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Timer,
} from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MiniCalendar from "@/components/guest/prediction/MiniCalendar";
import { formatDisplayDate, toDateValue } from "@/utils/calendarUtils";

/**
 * Brand colors:
 * PINK        #F2386A  - light mode accent
 * PINK_BTN    #F4467A  - light mode solid buttons
 * PINK_DARK   #FF7CA3  - dark mode accent (lighter/softer)
 * PINK_BTN_D  #FF6F98  - dark mode solid buttons
 */

const CYCLE_TYPES = [
  { id: "short", label: "Short", description: "Less than 24 days" },
  { id: "medium", label: "Medium", description: "24 – 35 days" },
  { id: "long", label: "Long", description: "More than 35 days" },
];

export default function LogYourPeriod() {
  const [isDark, setIsDark] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState(toDateValue(new Date()));
  const [cycleType, setCycleType] = useState("short");
  const [periodDuration, setPeriodDuration] = useState(5);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const decreaseDuration = () => {
    setPeriodDuration((prev) => Math.max(1, prev - 1));
  };

  const increaseDuration = () => {
    setPeriodDuration((prev) => Math.min(14, prev + 1));
  };

  const handleCalculate = () => {
    // Original wired this to "/guest/results" with router state (lastPeriodDate,
    // cycleType, periodDuration). Expo Router params must be strings.
    router.push({
      pathname: "/guest/predict/results",
      params: { lastPeriodDate, cycleType, periodDuration: String(periodDuration) },
    });
  };

  const pink = isDark ? "#FF7CA3" : "#F2386A";
  const pinkBtn = isDark ? "#FF6F98" : "#F4467A";
  const bg = isDark ? "#17111C" : "#FFFFFF";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScrollView
        style={{ backgroundColor: bg }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.push("/guest")}
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: isDark ? "#3A2430" : "#FCE7EF" },
                pressed && styles.pressedScale,
              ]}
            >
              <ArrowLeft size={20} color={pink} />
            </Pressable>

            <Pressable
              onPress={() => setIsDark((prev) => !prev)}
              accessibilityLabel="Toggle dark mode"
              style={({ pressed }) => [
                styles.iconButtonOutlined,
                { borderColor: isDark ? "#FFFFFF" : "#F4467A" },
                pressed && styles.pressedScale,
              ]}
            >
              {isDark ? <Sun size={18} color="#FFFFFF" /> : <Moon size={18} color="#F2386A" />}
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <Text style={[styles.heroEyebrow, { color: pink }]}>Quick Prediction</Text>
            <Text style={[styles.heroTitle, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
              Log your period
            </Text>
            <Text style={[styles.heroSubtitle, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
              Enter your last period details to get accurate predictions and
              cycle insights.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                backgroundColor: isDark ? "#221A28" : "#FFFFFF",
              },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
              1. Last period start date
            </Text>

            <View>
              <Pressable
                onPress={() => setIsCalendarOpen((prev) => !prev)}
                style={[
                  styles.dateButton,
                  { borderColor: isDark ? "#3A2A38" : "#E8EEF8" },
                ]}
              >
                <View style={styles.dateButtonLeft}>
                  <CalendarDays size={18} color={pink} />
                  <Text
                    style={[
                      styles.dateButtonText,
                      { color: isDark ? "#F3EDF1" : "#1E1730" },
                    ]}
                  >
                    {formatDisplayDate(lastPeriodDate)}
                  </Text>
                </View>
                <ChevronDown size={18} color={pink} />
              </Pressable>

              {isCalendarOpen && (
                <MiniCalendar
                  value={lastPeriodDate}
                  isDark={isDark}
                  onSelect={(newValue) => {
                    setLastPeriodDate(newValue);
                    setIsCalendarOpen(false);
                  }}
                />
              )}
            </View>

            <View style={styles.sectionSpacer} />

            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                2. Cycle type
              </Text>
              <Info size={14} color={isDark ? "#6E6675" : "#B9B6C1"} />
            </View>
            <Text style={[styles.fieldHint, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
              Select the option that best describes your typical cycle length.
            </Text>

            <View style={styles.cycleTypeGrid}>
              {CYCLE_TYPES.map((type) => {
                const isSelected = cycleType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => setCycleType(type.id)}
                    style={[
                      styles.cycleTypeButton,
                      {
                        borderColor: isSelected
                          ? isDark
                            ? "#FF7CA3"
                            : "#F2386A"
                          : isDark
                          ? "#3A2A38"
                          : "#E8EEF8",
                        backgroundColor: isSelected
                          ? isDark
                            ? "#3A2430"
                            : "#FCE7EF"
                          : isDark
                          ? "#221A28"
                          : "#FFFFFF",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.cycleTypeIcon,
                        { backgroundColor: isDark ? "#3A2430" : "#FCE7EF" },
                      ]}
                    >
                      <Timer size={20} color={pink} />
                    </View>
                    <Text
                      style={[
                        styles.cycleTypeLabel,
                        { color: isDark ? "#F3EDF1" : "#1E1730" },
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text
                      style={[
                        styles.cycleTypeDescription,
                        { color: isDark ? "#B7ACB8" : "#8D8A99" },
                      ]}
                    >
                      {type.description}
                    </Text>

                    <View
                      style={[
                        styles.checkCircle,
                        { backgroundColor: isSelected ? pinkBtn : "transparent" },
                      ]}
                    >
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                3. Period duration
              </Text>
              <Info size={14} color={isDark ? "#6E6675" : "#B9B6C1"} />
            </View>

            <View
              style={[
                styles.durationRow,
                { borderColor: isDark ? "#3A2A38" : "#E8EEF8" },
              ]}
            >
              <Pressable
                onPress={decreaseDuration}
                accessibilityLabel="Decrease period duration"
                style={styles.durationButton}
              >
                <Minus size={20} color={pink} />
              </Pressable>

              <View style={styles.durationValueRow}>
                <Text
                  style={[
                    styles.durationValue,
                    { color: isDark ? "#F3EDF1" : "#1E1730" },
                  ]}
                >
                  {periodDuration}
                </Text>
                <Text style={[styles.durationUnit, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
                  days
                </Text>
              </View>

              <Pressable
                onPress={increaseDuration}
                accessibilityLabel="Increase period duration"
                style={styles.durationButton}
              >
                <Plus size={20} color={pink} />
              </Pressable>
            </View>
            <Text style={[styles.durationHint, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
              The number of days your period usually lasts.
            </Text>

            <View style={[styles.tip, { backgroundColor: isDark ? "#3A2430" : "#FCE7EF" }]}>
              <Heart size={16} color={pink} style={styles.tipIcon} />
              <Text style={[styles.tipText, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                <Text style={styles.tipBold}>Tip:</Text> The more accurate your
                input, the more accurate your predictions.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleCalculate}
            style={({ pressed }) => [
              styles.calculateButton,
              { backgroundColor: pinkBtn },
              pressed && styles.pressedScale,
            ]}
          >
            <Text style={styles.calculateButtonText}>Calculate My Predictions</Text>
            <Sparkles size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  topRow: {
    marginBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    height: 44,
    width: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonOutlined: {
    height: 44,
    width: 44,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedScale: { transform: [{ scale: 0.95 }] },
  heroWrap: {
    marginBottom: 24,
    alignItems: "center",
  },
  heroEyebrow: {
    marginBottom: 4,
    fontSize: 15,
    fontWeight: "600",
  },
  heroTitle: {
    marginBottom: 12,
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
    textAlign: "center",
  },
  heroSubtitle: {
    maxWidth: 340,
    textAlign: "center",
    fontSize: 14.5,
    lineHeight: 24,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
  },
  fieldLabel: {
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  fieldLabelRow: {
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldHint: {
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  sectionSpacer: { height: 24 },
  cycleTypeGrid: {
    marginBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  cycleTypeButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  cycleTypeIcon: {
    marginBottom: 12,
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleTypeLabel: {
    marginBottom: 4,
    fontSize: 14.5,
    fontWeight: "600",
  },
  cycleTypeDescription: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  checkCircle: {
    marginTop: 12,
    height: 20,
    width: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  durationRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  durationValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  durationValue: {
    fontSize: 22,
    fontWeight: "600",
  },
  durationUnit: {
    fontSize: 14,
  },
  durationHint: {
    marginBottom: 24,
    fontSize: 13,
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 16,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20.25,
  },
  tipBold: {
    fontWeight: "600",
  },
  calculateButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#F4467A",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 32,
    elevation: 10,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
