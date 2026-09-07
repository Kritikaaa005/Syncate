import { type Href, router, useFocusEffect } from "expo-router";
import { ChevronRight, Palette, Target, Trash2, UserX } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import { useTheme } from "@/contexts/ThemeContext";
import { deactivateAccount, getTrackingMode } from "@/services/userService";
import { clearTokens } from "@/utils/tokenStorage";

const MY_GOAL_ROUTE = "/profile/my-goal" as Href;
const THEME_ROUTE = "/profile/theme" as Href;
const DELETE_ACCOUNT_ROUTE = "/profile/delete-account" as Href;

function ProfileScreen() {
  const { colors: theme, accentTheme } = useTheme();
  const [goalLabel, setGoalLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadGoal = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrackingMode();
      setGoalLabel(data.tracking_mode_label || "Not selected");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your goal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadGoal(); }, [loadGoal]));

  const confirmDeactivation = () => {
    if (isDeactivating) return;

    setDeleteError("");
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    if (isDeactivating) return;

    setDeleteError("");
    setDeleteModalVisible(false);
  };

  const handleDeactivateAccount = async () => {
    if (isDeactivating) return;

    setDeleteError("");
    setIsDeactivating(true);

    try {
      await deactivateAccount();
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : "Could not deactivate your account. Please try again."
      );
      setIsDeactivating(false);
      return;
    }

    setDeleteModalVisible(false);
    try {
      await clearTokens();
    } catch {
      // The server has already invalidated this account and its refresh tokens.
    } finally {
      router.replace("/terms");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.page}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>SETTINGS</Text>
        <Pressable
          onPress={() => router.push(MY_GOAL_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="My Goal"
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
            <Target size={21} color={theme.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>My Goal</Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
            ) : (
              <Text style={[styles.rowSubtitle, { color: error ? theme.primary : theme.muted }]}>
                {error || goalLabel}
              </Text>
            )}
          </View>
          <ChevronRight size={21} color={theme.muted} />
        </Pressable>
        <Pressable
          onPress={() => router.push(THEME_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Theme"
          style={({ pressed }) => [styles.row, styles.nextRow, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.pressed]}
        >
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}><Palette size={21} color={theme.primary} /></View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: theme.text }]}>Theme</Text>
            <Text style={[styles.rowSubtitle, { color: theme.muted }]}>{accentTheme.name}</Text>
          </View>
          <ChevronRight size={21} color={theme.muted} />
        </Pressable>
        <Pressable
          onPress={confirmDeactivation}
          disabled={isDeactivating}
          accessibilityRole="button"
          accessibilityLabel="Deactivate Account"
          accessibilityState={{ disabled: isDeactivating, busy: isDeactivating }}
          style={({ pressed }) => [
            styles.row,
            styles.nextRow,
            styles.dangerRow,
            { backgroundColor: theme.card },
            (pressed || isDeactivating) && styles.pressed,
          ]}
        >
          <View style={[styles.icon, styles.dangerIcon]}>
            {isDeactivating ? (
              <ActivityIndicator size="small" color="#C62828" />
            ) : (
              <UserX size={21} color="#C62828" />
            )}
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, styles.dangerText]}>Deactivate Account</Text>
            <Text style={[styles.rowSubtitle, { color: theme.muted }]}>Temporarily disable your account</Text>
          </View>
          <ChevronRight size={21} color="#C62828" />
        </Pressable>
        <Pressable
          onPress={() => router.push(DELETE_ACCOUNT_ROUTE)}
          accessibilityRole="button"
          accessibilityLabel="Delete Account"
          style={({ pressed }) => [styles.row, styles.nextRow, styles.dangerRow, { backgroundColor: theme.card }, pressed && styles.pressed]}
        >
          <View style={[styles.icon, styles.dangerIcon]}><Trash2 size={21} color="#C62828" /></View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, styles.dangerText]}>Delete Account</Text>
            <Text style={[styles.rowSubtitle, { color: theme.muted }]}>Delete your account and associated data</Text>
          </View>
          <ChevronRight size={21} color="#C62828" />
        </Pressable>
        {error ? (
          <Pressable onPress={() => void loadGoal()} accessibilityRole="button">
            <Text style={[styles.retry, { color: theme.primary }]}>Tap to retry</Text>
          </Pressable>
        ) : null}
      </View>
      <RegisteredBottomNav activeItem="profile" />
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDeleteModal}
            accessibilityLabel="Close delete account dialog"
          />
          <View
            style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            accessibilityRole="alert"
          >
            <View style={styles.modalDangerIcon}>
              <Trash2 size={25} color="#C62828" />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Deactivate your account?</Text>
            <Text style={[styles.modalMessage, { color: theme.muted }]}>Your account will be deactivated and you will be signed out.</Text>
            <Text style={[styles.modalMessage, styles.modalSecondMessage, { color: theme.muted }]}>You will not be able to log in while your account is inactive.</Text>
            {deleteError ? (
              <Text style={styles.modalError} accessibilityRole="alert">{deleteError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={closeDeleteModal}
                disabled={isDeactivating}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.border },
                  (pressed || isDeactivating) && styles.pressed,
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleDeactivateAccount()}
                disabled={isDeactivating}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDeactivating, busy: isDeactivating }}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.deleteButton,
                  (pressed || isDeactivating) && styles.pressed,
                ]}
              >
                {isDeactivating ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                <Text style={styles.deleteButtonText}>{isDeactivating ? "Deactivating..." : "Deactivate Account"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { width: "100%", maxWidth: 430, alignSelf: "center", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 110 },
  title: { fontSize: 30, lineHeight: 38, fontWeight: "800", marginBottom: 34 },
  sectionTitle: { fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10, marginLeft: 4 },
  row: { minHeight: 82, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  nextRow: { marginTop: 12 },
  dangerRow: { borderColor: "#E8A5A5" },
  dangerIcon: { backgroundColor: "#FDECEC" },
  dangerText: { color: "#C62828" },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, lineHeight: 22, fontWeight: "700" },
  rowSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 18 },
  loader: { alignSelf: "flex-start", marginTop: 5 },
  retry: { textAlign: "center", fontSize: 13, fontWeight: "700", marginTop: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  modalRoot: { flex: 1, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.55)" },
  modalCard: { width: "100%", maxWidth: 390, borderWidth: 1, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 24, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 28, elevation: 12 },
  modalDangerIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#FDECEC", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle: { fontSize: 22, lineHeight: 29, fontWeight: "800", textAlign: "center" },
  modalMessage: { marginTop: 10, fontSize: 14, lineHeight: 21, textAlign: "center" },
  modalSecondMessage: { marginTop: 4 },
  modalError: { width: "100%", marginTop: 16, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FDECEC", color: "#A51D1D", fontSize: 13, lineHeight: 19, textAlign: "center" },
  modalActions: { width: "100%", marginTop: 22, flexDirection: "row", gap: 10 },
  modalButton: { flex: 1, minHeight: 48, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12 },
  cancelButton: { borderWidth: 1 },
  cancelButtonText: { fontSize: 14, fontWeight: "700" },
  deleteButton: { backgroundColor: "#C62828" },
  deleteButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

export default ProfileScreen;
