// LOCATION: syncate-mobile/src/screens/profile/ProfilePasswordScreen.tsx
// (new file — needs a matching route file, see note at the bottom)
//
// Header/loading/error shell here matches ProfileAccountScreen.tsx and
// ProfileTermsScreen.tsx exactly on purpose — same screen family, same
// feel. The actual form is PasswordForm.tsx; this screen's only job is
// fetching whether the account has a password yet, wiring the submit
// call to userService, and telling the person it worked.

import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PasswordForm from "@/components/profile/PasswordForm";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useUserProfile from "@/hooks/useUserProfile";
import {
  setAccountPassword,
  type SetPasswordPayload,
} from "@/services/userService";

function ProfilePasswordScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const {
    profile,
    loading,
    errorMessage,
    reload,
  } = useUserProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: SetPasswordPayload) => {
    setIsSubmitting(true);

    try {
      const result = await setAccountPassword(payload);

      // Refresh so has_password flips (add -> change) if this was the
      // first password on the account, and so a repeat visit to this
      // screen shows the right form immediately.
      await reload();

      Alert.alert("Success", result.message, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
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

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>
            Password
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {profile?.has_password
              ? "Change your account password"
              : "Add a password to your account"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {loading && !profile ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : errorMessage && !profile ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: theme.text }]}>
              Couldn't load your account
            </Text>
            <Text style={[styles.errorMessage, { color: theme.muted }]}>
              {errorMessage}
            </Text>
            <Pressable
              onPress={() => {
                void reload();
              }}
              accessibilityRole="button"
              style={[
                styles.retryButton,
                { backgroundColor: theme.primaryButton },
              ]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <PasswordForm
            theme={theme}
            hasPassword={profile.has_password}
            submitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
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

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  statusWrap: {
    paddingVertical: 80,
    alignItems: "center",
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  errorMessage: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.72,
  },
});

export default ProfilePasswordScreen;

/*
 * ROUTE FILE NEEDED — add
 * src/app/dashboard/profile/password.tsx with:
 *
 *   export {
 *     default,
 *   } from "@/screens/profile/ProfilePasswordScreen";
 *
 * matching every other file in src/app/dashboard/profile/.
 */
