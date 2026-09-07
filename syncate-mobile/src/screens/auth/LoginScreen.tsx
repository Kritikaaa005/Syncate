import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { login, restoreScheduledAccount, ScheduledDeletionLoginError } from "@/services/authService";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletionDueAt, setDeletionDueAt] = useState<string | null>(null);

  const signIn = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (caught) {
      if (caught instanceof ScheduledDeletionLoginError) setDeletionDueAt(caught.deletionDueAt);
      else setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally { setLoading(false); }
  };

  const restore = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try {
      await restoreScheduledAccount(email.trim(), password);
      setDeletionDueAt(null);
      router.replace("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not restore your account.");
    } finally { setLoading(false); }
  };

  const dueLabel = deletionDueAt ? new Date(deletionDueAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={() => void signIn()} disabled={loading || !email || !password} style={[styles.primary, { backgroundColor: colors.primary }, (loading || !email || !password) && styles.disabled]}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Sign in</Text>}
        </Pressable>
      </View>
      <Modal visible={deletionDueAt !== null} transparent animationType="fade">
        <View style={styles.overlay}><View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Your account is scheduled for deletion</Text>
          <Text style={[styles.message, { color: colors.muted }]}>Your account will be permanently deleted on {dueLabel}. Would you like to restore your account?</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable disabled={loading} onPress={() => { setDeletionDueAt(null); setError(""); }} style={[styles.action, { borderColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: "700" }}>Cancel</Text></Pressable>
            <Pressable disabled={loading} onPress={() => void restore()} style={[styles.action, { backgroundColor: colors.primary, borderColor: colors.primary }]}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Restore Account</Text>}</Pressable>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", justifyContent: "center", padding: 24, gap: 14 }, title: { fontSize: 30, fontWeight: "800", marginBottom: 8 }, input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontSize: 15 }, primary: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontWeight: "800" }, disabled: { opacity: 0.5 }, error: { color: "#A51D1D", backgroundColor: "#FDECEC", padding: 10, borderRadius: 12, textAlign: "center" }, overlay: { flex: 1, padding: 22, backgroundColor: "rgba(0,0,0,0.58)", alignItems: "center", justifyContent: "center" }, modal: { width: "100%", maxWidth: 390, borderWidth: 1, borderRadius: 24, padding: 22 }, modalTitle: { fontSize: 21, lineHeight: 28, fontWeight: "800", textAlign: "center" }, message: { marginTop: 12, fontSize: 14, lineHeight: 21, textAlign: "center" }, actions: { marginTop: 20, flexDirection: "row", gap: 10 }, action: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center", padding: 8 } });
