// Destination: app/guest/predict/index.tsx

import { router } from "expo-router";
import {
  Calendar,
  Check,
  ChevronDown,
  Info,
  Minus,
  Plus,
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

import CalculateButton from "@/components/guest/prediction/CalculateButton";
import MiniCalendar from "@/components/guest/prediction/MiniCalendar";
import PredictionHeader from "@/components/guest/prediction/PredictionHeader";
import PredictionHero from "@/components/guest/prediction/PredictionHero";
import PredictionTip from "@/components/guest/prediction/PredictionTip";
import { CYCLE_TYPES } from "@/constants/predictionData";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { formatDisplayDate } from "@/utils/calendarUtils";
import { calculateCyclePrediction } from "@/utils/predictUtils";

export default function QuickPrediction() {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const [lastPeriodDate, setLastPeriodDate] = useState("2025-05-20");
  const [cycleType, setCycleType] = useState("short");
  const [periodDuration, setPeriodDuration] = useState(5);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const decrementDuration = () => {
    setPeriodDuration((prev) => Math.max(1, prev - 1));
  };

  const incrementDuration = () => {
    setPeriodDuration((prev) => Math.min(14, prev + 1));
  };

  const handleSubmit = () => {
    const prediction = calculateCyclePrediction({
      lastPeriodDate,
      cycleType,
      periodDuration,
    });

    // React Router's navigate(..., { state }) has no direct equivalent in
    // Expo Router; params must be serializable strings. We pass the raw
    // inputs and re-derive the prediction on the results screen (same
    // calculateCyclePrediction() call, so the output is identical).
    router.push({
      pathname: "/guest/predict/results",
      params: {
        lastPeriodDate,
        cycleType,
        periodDuration: String(periodDuration),
        nextPeriodStart: prediction.nextPeriodStart,
        nextPeriodEnd: prediction.nextPeriodEnd,
        ovulationDate: prediction.ovulationDate,
        cycleLength: String(prediction.cycleLength),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <PredictionHeader />
          <PredictionHero />

          <View
            style={[
              styles.card,
              {
                borderColor: isDark ? "#3A2A38" : "#E8EEF8",
                backgroundColor: isDark ? "#221A28" : "#FFFFFF",
              },
            ]}
          >
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                1. Last period start date
              </Text>

              <View>
                <Pressable
                  onPress={() => setIsCalendarOpen((prev) => !prev)}
                  style={[
                    styles.dateField,
                    {
                      borderColor: isDark ? "rgba(255,124,163,0.6)" : "rgba(242,56,106,0.5)",
                      backgroundColor: isDark ? "#221A28" : "#FFFFFF",
                    },
                  ]}
                >
                  <Calendar size={18} color={isDark ? "#FF7CA3" : "#F2386A"} />

                  <Text
                    style={[
                      styles.dateFieldText,
                      { color: isDark ? "#F3EDF1" : "#1E1730" },
                    ]}
                  >
                    {formatDisplayDate(lastPeriodDate)}
                  </Text>

                  <View
                    style={{
                      transform: [{ rotate: isCalendarOpen ? "180deg" : "0deg" }],
                    }}
                  >
                    <ChevronDown size={16} color={isDark ? "#FF7CA3" : "#F2386A"} />
                  </View>
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
            </View>

            <View style={styles.fieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                  2. Cycle type
                </Text>
                <Info size={14} color={isDark ? "#B7ACB8" : "#8D8A99"} />
              </View>

              <Text style={[styles.fieldHint, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
                Select the option that best describes your typical cycle length.
              </Text>

              <View style={styles.cycleTypeGrid}>
                {CYCLE_TYPES.map((type) => {
                  const selected = cycleType === type.id;

                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => setCycleType(type.id)}
                      style={[
                        styles.cycleTypeButton,
                        {
                          borderColor: selected
                            ? isDark
                              ? "#FF7CA3"
                              : "#F2386A"
                            : isDark
                              ? "#3A2A38"
                              : "#E8EEF8",
                          backgroundColor: selected
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
                        <Timer size={14} color={isDark ? "#FF7CA3" : "#F2386A"} />
                      </View>

                      <View style={styles.cycleTypeLabelRow}>
                        <Text
                          style={[
                            styles.cycleTypeLabel,
                            { color: isDark ? "#F3EDF1" : "#1E1730" },
                          ]}
                        >
                          {type.label}
                        </Text>
                        {selected && (
                          <View
                            style={[
                              styles.checkBubble,
                              { backgroundColor: isDark ? "#FF6F98" : "#F4467A" },
                            ]}
                          >
                            <Check size={9} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.cycleTypeDetail,
                          { color: isDark ? "#B7ACB8" : "#8D8A99" },
                        ]}
                      >
                        {type.detail}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.durationBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
                  3. Period duration
                </Text>
                <Info size={14} color={isDark ? "#B7ACB8" : "#8D8A99"} />
              </View>

              <View
                style={[
                  styles.durationRow,
                  { borderColor: isDark ? "#3A2A38" : "#E8EEF8" },
                ]}
              >
                <Pressable
                  onPress={decrementDuration}
                  accessibilityLabel="Decrease period duration"
                >
                  <Minus size={20} color={isDark ? "#FF7CA3" : "#F2386A"} />
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
                  <Text
                    style={[styles.durationUnit, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}
                  >
                    days
                  </Text>
                </View>

                <Pressable
                  onPress={incrementDuration}
                  accessibilityLabel="Increase period duration"
                >
                  <Plus size={20} color={isDark ? "#FF7CA3" : "#F2386A"} />
                </Pressable>
              </View>

              <Text style={[styles.durationHint, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
                The number of days your period usually lasts.
              </Text>
            </View>

            <PredictionTip />
          </View>

          <CalculateButton onPress={handleSubmit} />
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
  },
  fieldBlock: {
    marginBottom: 24,
  },
  fieldLabel: {
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
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  cycleTypeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  cycleTypeButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  cycleTypeIcon: {
    marginBottom: 6,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleTypeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cycleTypeLabel: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  checkBubble: {
    height: 14,
    width: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  cycleTypeDetail: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12.5,
    textAlign: "center",
  },
  durationBlock: {
    marginBottom: 20,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  durationValue: {
    fontSize: 20,
    fontWeight: "600",
  },
  durationUnit: {
    fontSize: 14,
  },
  durationHint: {
    marginTop: 8,
    fontSize: 12.5,
  },
});
