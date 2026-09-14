import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";

type AddEmailFormProps = {
  theme: GuestThemeColors;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (email: string) => Promise<void>;
  initialEmail?: string;
  mode?: "add" | "change";
};

function AddEmailForm({
  theme,
  submitting,
  onCancel,
  onSubmit,
  initialEmail = "",
  mode = "add",
}: AddEmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setEmail(initialEmail);
    setErrorMessage(null);
  }, [initialEmail, mode]);

  const handleSubmit = async () => {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setErrorMessage("Enter your email address.");
      return;
    }

    if (mode === "change" && normalized === initialEmail.trim().toLowerCase()) {
      setErrorMessage("Enter a different email address, or use Resend instead.");
      return;
    }

    setErrorMessage(null);

    try {
      await onSubmit(normalized);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save that email. Please try again."
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primarySoft,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        {mode === "change" ? "Change pending email" : "Add recovery email"}
      </Text>

      <Text style={[styles.helper, { color: theme.muted }]}>
        {mode === "change"
          ? "We'll replace the unverified address and send a new verification link."
          : "We'll send a verification link to this address."}
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="you@example.com"
        placeholderTextColor={theme.muted}
        editable={!submitting}
        accessibilityLabel="Email address"
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.inputBackground,
            borderColor: errorMessage ? theme.primary : theme.inputBorder,
          },
        ]}
      />

      {errorMessage ? (
        <Text style={[styles.error, { color: theme.primary }]}>{errorMessage}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onCancel}
          disabled={submitting}
          style={styles.secondaryButton}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryText, { color: theme.muted }]}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={() => void handleSubmit()}
          disabled={submitting}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.primaryButton },
            pressed && styles.pressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>
              {mode === "change" ? "Save & verify" : "Send verification"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  title: { fontSize: 14, fontWeight: "700" },
  helper: { marginTop: 4, fontSize: 12.5, lineHeight: 18 },
  input: {
    height: 48,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  error: { marginTop: 7, fontSize: 12, lineHeight: 17 },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 13, fontWeight: "600" },
  primaryButton: {
    minHeight: 42,
    minWidth: 132,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.86 },
});

export default AddEmailForm;
