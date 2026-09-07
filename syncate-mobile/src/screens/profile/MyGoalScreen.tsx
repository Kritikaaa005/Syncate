import { router } from "expo-router";
import { ArrowLeft, CalendarDays, Check, Sprout } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { getTrackingMode, updateTrackingMode, type TrackingMode } from "@/services/userService";

const options: Array<{ value: TrackingMode; title: string; description: string; available: boolean }> = [
  { value: "period", title: "Period Tracking", description: "Track your cycle, periods, symptoms and fertile days.", available: true },
  { value: "pregnancy", title: "Pregnancy Tracking", description: "Follow your pregnancy journey and weekly progress.", available: false },
];

function MyGoalScreen() {
  const { colors: theme } = useTheme();
  const [persistedMode, setPersistedMode] = useState<TrackingMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<TrackingMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadGoal = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrackingMode();
      const mode = data.tracking_mode || null;
      setPersistedMode(mode);
      setSelectedMode(mode);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your goal. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGoal(); }, [loadGoal]);

  const canSave = !loading && !submitting && selectedMode === "period" && selectedMode !== persistedMode;

  const save = async () => {
    if (!canSave || !selectedMode) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await updateTrackingMode(selectedMode);
      setPersistedMode(data.tracking_mode || selectedMode);
      Alert.alert("Goal updated", "Your tracking goal was saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your goal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} disabled={submitting} accessibilityRole="button" accessibilityLabel="Go back" style={({ pressed }) => [styles.back, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.pressed]}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: theme.text }]}>My Goal</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /><Text style={[styles.status, { color: theme.muted }]}>Loading your goal…</Text></View>
        ) : error && persistedMode === null ? (
          <View style={styles.center}><Text style={[styles.error, { color: theme.primary }]}>{error}</Text><Pressable onPress={() => void loadGoal()} style={[styles.retry, { backgroundColor: theme.primaryButton }]}><Text style={styles.buttonText}>Try Again</Text></Pressable></View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: theme.text }]}>What would you like to track?</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>Your current selection comes from your Syncate account.</Text>
            <View style={styles.options}>
              {options.map((option) => {
                const selected = selectedMode === option.value;
                const disabled = !option.available;
                const Icon = option.value === "period" ? CalendarDays : Sprout;
                return (
                  <Pressable key={option.value} onPress={() => { if (option.available && !submitting) { setSelectedMode(option.value); setError(""); } }} disabled={disabled || submitting} accessibilityRole="radio" accessibilityState={{ selected, disabled }} style={[styles.card, { backgroundColor: selected ? theme.primarySoft : theme.card, borderColor: selected ? theme.primary : theme.border }, selected && styles.selectedCard, disabled && !selected && styles.disabledCard]}>
                    <View style={[styles.optionIcon, { backgroundColor: selected ? theme.primary : theme.primarySoft }]}><Icon size={27} color={selected ? "#FFFFFF" : theme.primary} /></View>
                    <View style={styles.optionText}>
                      <View style={styles.optionHeading}><Text style={[styles.optionTitle, { color: theme.text }]}>{option.title}</Text>{!option.available ? <Text style={[styles.badge, { color: theme.primary, backgroundColor: theme.primarySoft }]}>Coming soon</Text> : null}</View>
                      <Text style={[styles.description, { color: theme.muted }]}>{option.description}</Text>
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.primary : "transparent" }]}>{selected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}</View>
                  </Pressable>
                );
              })}
            </View>
            {error ? <Text style={[styles.error, { color: theme.primary }]}>{error}</Text> : null}
            <Pressable onPress={() => void save()} disabled={!canSave} accessibilityRole="button" accessibilityState={{ disabled: !canSave, busy: submitting }} style={({ pressed }) => [styles.save, { backgroundColor: theme.primaryButton }, !canSave && styles.saveDisabled, pressed && canSave && styles.pressed]}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Save Changes</Text>}
            </Pressable>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" },
  topBar: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" }, topTitle: { fontSize: 16, fontWeight: "700" }, spacer: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36 }, title: { textAlign: "center", fontSize: 25, lineHeight: 32, fontWeight: "800" }, subtitle: { textAlign: "center", fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 28 }, options: { gap: 16 },
  card: { minHeight: 142, borderWidth: 1.5, borderRadius: 26, paddingHorizontal: 18, paddingVertical: 20, flexDirection: "row", alignItems: "center" }, selectedCard: { borderWidth: 2 }, disabledCard: { opacity: 0.66 },
  optionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }, optionText: { flex: 1, marginHorizontal: 14 }, optionHeading: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 }, optionTitle: { fontSize: 16, lineHeight: 23, fontWeight: "700" }, badge: { fontSize: 10, lineHeight: 16, fontWeight: "800", paddingHorizontal: 7, borderRadius: 8, overflow: "hidden" }, description: { fontSize: 12.5, lineHeight: 18, marginTop: 6 },
  radio: { width: 25, height: 25, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center" }, center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 }, status: { marginTop: 12, fontSize: 14 }, error: { textAlign: "center", fontSize: 13, lineHeight: 19, fontWeight: "600", marginTop: 18 },
  retry: { minHeight: 46, paddingHorizontal: 28, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 20 }, save: { minHeight: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 28 }, saveDisabled: { opacity: 0.42 }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});

export default MyGoalScreen;
