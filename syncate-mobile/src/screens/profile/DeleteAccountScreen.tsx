import { router } from "expo-router";
import { ArrowLeft, CalendarClock, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { permanentlyDeleteAccount, scheduleAccountDeletion } from "@/services/userService";
import { clearTokens } from "@/utils/tokenStorage";

type Confirmation = "schedule" | "permanent" | null;
const DANGER = "#C62828";

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => {
    if (submitting) return;
    setConfirmation(null);
    setConfirmationText("");
    setError("");
  };

  const finishDeletion = async (action: () => Promise<unknown>) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed. Please try again.");
      setSubmitting(false);
      return;
    }
    setConfirmation(null);
    try { await clearTokens(); } catch { /* Server credentials are already invalid. */ }
    router.replace("/terms");
  };

  const permanentEnabled = confirmationText.trim().toUpperCase() === "DELETE";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.card, borderColor: colors.border }]} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Delete Account</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: colors.text }]}>Choose how to delete your account</Text>
          <Pressable onPress={() => setConfirmation("schedule")} style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.icon}><CalendarClock size={23} color={DANGER} /></View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Delete after 30 days</Text>
              <Text style={[styles.description, { color: colors.muted }]}>Your account will be disabled immediately and permanently deleted after 30 days. You can restore it during the 30-day grace period.</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setConfirmation("permanent")} style={[styles.option, { backgroundColor: colors.card, borderColor: "#E8A5A5" }]}>
            <View style={styles.icon}><Trash2 size={23} color={DANGER} /></View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: DANGER }]}>Delete permanently</Text>
              <Text style={[styles.description, { color: colors.muted }]}>Permanently delete your account and associated data now. This action cannot be undone.</Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>
      <Modal visible={confirmation !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{confirmation === "schedule" ? "Schedule account deletion?" : "Permanently delete your account?"}</Text>
            <Text style={[styles.modalMessage, { color: colors.muted }]}>{confirmation === "schedule" ? "Your account will be disabled immediately and permanently deleted 30 days from today. You can restore it by signing in before the deletion date." : "This will permanently remove your Syncate account and associated data. This action cannot be undone."}</Text>
            {confirmation === "permanent" ? (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Type DELETE to confirm</Text>
                <TextInput value={confirmationText} onChangeText={setConfirmationText} editable={!submitting} autoCapitalize="characters" style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
              </>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <Pressable onPress={closeModal} disabled={submitting} style={[styles.button, { borderColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: "700" }}>Cancel</Text></Pressable>
              <Pressable
                onPress={() => void finishDeletion(confirmation === "schedule" ? scheduleAccountDeletion : permanentlyDeleteAccount)}
                disabled={submitting || (confirmation === "permanent" && !permanentEnabled)}
                style={[styles.button, styles.dangerButton, (submitting || (confirmation === "permanent" && !permanentEnabled)) && styles.disabled]}
              >
                {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                <Text style={styles.dangerButtonText}>{submitting ? "Deleting..." : confirmation === "schedule" ? "Delete in 30 Days" : "Permanently Delete"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" }, topBar: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" }, topTitle: { fontSize: 16, fontWeight: "700" }, spacer: { width: 40 }, content: { padding: 20, paddingBottom: 40, gap: 14 }, heading: { fontSize: 24, lineHeight: 32, fontWeight: "800", marginBottom: 8 }, option: { borderWidth: 1, borderRadius: 21, padding: 17, flexDirection: "row" }, icon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#FDECEC", alignItems: "center", justifyContent: "center", marginRight: 13 }, optionText: { flex: 1 }, optionTitle: { fontSize: 16, lineHeight: 22, fontWeight: "800" }, description: { marginTop: 5, fontSize: 13, lineHeight: 19 }, overlay: { flex: 1, paddingHorizontal: 22, backgroundColor: "rgba(0,0,0,0.58)", alignItems: "center", justifyContent: "center" }, modalCard: { width: "100%", maxWidth: 400, borderWidth: 1, borderRadius: 24, padding: 22 }, modalTitle: { fontSize: 21, lineHeight: 28, fontWeight: "800", textAlign: "center" }, modalMessage: { marginTop: 10, fontSize: 14, lineHeight: 21, textAlign: "center" }, inputLabel: { marginTop: 18, marginBottom: 7, fontSize: 13, fontWeight: "700" }, input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 16, fontWeight: "700", letterSpacing: 1 }, error: { marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: "#FDECEC", color: "#A51D1D", textAlign: "center" }, actions: { marginTop: 20, flexDirection: "row", gap: 10 }, button: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" }, dangerButton: { borderColor: DANGER, backgroundColor: DANGER }, dangerButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", textAlign: "center" }, disabled: { opacity: 0.45 },
});
