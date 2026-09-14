import { type Href, router } from "expo-router";
import { ArrowLeft, ChevronRight, Trash2, UserX } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { deactivateAccount } from "@/services/userService";
import { clearTokens } from "@/utils/tokenStorage";

const DELETE_ACCOUNT_ROUTE = "/profile/delete-account" as Href;

function ProfileScreen() {
  const { colors: theme } = useTheme();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  const openDeactivateModal = () => {
    if (isDeactivating) return;
    setDeactivateError("");
    setDeactivateModalVisible(true);
  };

  const closeDeactivateModal = () => {
    if (isDeactivating) return;
    setDeactivateError("");
    setDeactivateModalVisible(false);
  };

  const handleDeactivateAccount = async () => {
    if (isDeactivating) return;

    setDeactivateError("");
    setIsDeactivating(true);

    try {
      await deactivateAccount();
    } catch (caught) {
      setDeactivateError(
        caught instanceof Error
          ? caught.message
          : "Could not deactivate your account. Please try again."
      );
      setIsDeactivating(false);
      return;
    }

    setDeactivateModalVisible(false);

    try {
      await clearTokens();
    } catch {
      // The backend has already deactivated the account and invalidated
      // refresh tokens. Local cleanup failure must not keep the user here.
    } finally {
      router.replace("/terms");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to settings"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>

          <View style={styles.headingText}>
            <Text style={[styles.title, { color: theme.text }]}>Account management</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Manage account access and deletion
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Pressable
            onPress={openDeactivateModal}
            disabled={isDeactivating}
            accessibilityRole="button"
            accessibilityLabel="Deactivate account"
            accessibilityState={{ disabled: isDeactivating, busy: isDeactivating }}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.card, borderColor: "#E8A5A5" },
              (pressed || isDeactivating) && styles.pressed,
            ]}
          >
            <View style={styles.dangerIcon}>
              {isDeactivating ? (
                <ActivityIndicator size="small" color="#C62828" />
              ) : (
                <UserX size={21} color="#C62828" />
              )}
            </View>

            <View style={styles.rowText}>
              <Text style={styles.dangerTitle}>Deactivate account</Text>
              <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                Disable account access without deleting stored data
              </Text>
            </View>

            <ChevronRight size={21} color="#C62828" />
          </Pressable>

          <Pressable
            onPress={() => router.push(DELETE_ACCOUNT_ROUTE)}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            style={({ pressed }) => [
              styles.row,
              styles.nextRow,
              { backgroundColor: theme.card, borderColor: "#E8A5A5" },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.dangerIcon}>
              <Trash2 size={21} color="#C62828" />
            </View>

            <View style={styles.rowText}>
              <Text style={styles.dangerTitle}>Delete account</Text>
              <Text style={[styles.rowSubtitle, { color: theme.muted }]}>
                Choose 30-day deletion or permanent deletion
              </Text>
            </View>

            <ChevronRight size={21} color="#C62828" />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={deactivateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeactivateModal}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDeactivateModal}
            accessibilityLabel="Close deactivate account dialog"
          />

          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            accessibilityRole="alert"
          >
            <View style={styles.modalDangerIcon}>
              <UserX size={25} color="#C62828" />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Deactivate your account?
            </Text>
            <Text style={[styles.modalMessage, { color: theme.muted }]}>
              This disables your account and signs you out without permanently deleting your stored data.
            </Text>
            <Text
              style={[
                styles.modalMessage,
                styles.modalSecondMessage,
                { color: theme.muted },
              ]}
            >
              Reactivation is not currently available from the app, so only continue if you intend to stop using this account.
            </Text>

            {deactivateError ? (
              <Text style={styles.modalError} accessibilityRole="alert">
                {deactivateError}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeDeactivateModal}
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
                  styles.deactivateButton,
                  (pressed || isDeactivating) && styles.pressed,
                ]}
              >
                {isDeactivating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : null}
                <Text style={styles.deactivateButtonText}>
                  {isDeactivating ? "Deactivating..." : "Deactivate"}
                </Text>
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
  page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" },
  topBar: {
    minHeight: 72,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headingText: { flex: 1 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: "800" },
  subtitle: { marginTop: 2, fontSize: 12.5, lineHeight: 17 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  row: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  nextRow: { marginTop: 12 },
  dangerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowText: { flex: 1 },
  dangerTitle: { color: "#C62828", fontSize: 16, lineHeight: 22, fontWeight: "700" },
  rowSubtitle: { marginTop: 3, fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  modalRoot: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 390,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 12,
  },
  modalDangerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, lineHeight: 29, fontWeight: "800", textAlign: "center" },
  modalMessage: { marginTop: 10, fontSize: 14, lineHeight: 21, textAlign: "center" },
  modalSecondMessage: { marginTop: 4 },
  modalError: {
    width: "100%",
    marginTop: 16,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FDECEC",
    color: "#A51D1D",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  modalActions: { width: "100%", marginTop: 22, flexDirection: "row", gap: 10 },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  cancelButton: { borderWidth: 1 },
  cancelButtonText: { fontSize: 14, fontWeight: "700" },
  deactivateButton: { backgroundColor: "#C62828" },
  deactivateButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});

export default ProfileScreen;
