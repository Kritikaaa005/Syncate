import {
  type Href,
  router,
} from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useUserProfile from "@/hooks/useUserProfile";

function ProfileEmailScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;
  const { profile, savingEmail, submitEmail } =
    useUserProfile();
  const [email, setEmail] = useState(
    profile?.email ?? ""
  );
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (profile?.email !== undefined) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  const handleSave = async () => {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setErrorMessage("Enter your email address.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setErrorMessage(null);

    try {
      await submitEmail(normalized);
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save that email. Please try again."
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to user profile"
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Email address</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]}>Email address</Text>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
            placeholderTextColor={theme.muted}
            editable={!savingEmail}
            accessibilityLabel="Email address"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: errorMessage
                  ? theme.primary
                  : theme.inputBorder,
              },
            ]}
          />

          {errorMessage ? (
            <Text style={[styles.error, { color: theme.primary }]}>
              {errorMessage}
            </Text>
          ) : (
            <Text style={[styles.helper, { color: theme.muted }]}>
              We'll send a verification link to this address.
            </Text>
          )}

          <Pressable
            onPress={() => void handleSave()}
            disabled={savingEmail}
            accessibilityRole="button"
            accessibilityLabel="Save email address"
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: theme.primaryButton },
              pressed && styles.pressed,
            ]}
          >
            {savingEmail ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  title: { fontSize: 21, fontWeight: "700" },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: "700" },
  input: {
    height: 50,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  helper: { marginTop: 8, fontSize: 12.5, lineHeight: 18 },
  error: { marginTop: 8, fontSize: 12.5, lineHeight: 18 },
  saveButton: {
    minHeight: 48,
    marginTop: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.72 },
});

export default ProfileEmailScreen;
