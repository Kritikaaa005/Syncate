// LOCATION: syncate-mobile/src/components/profile/PasswordForm.tsx
// (new file)
//
// Single job: collect and lightly validate a password change, then
// hand it to whatever onSubmit was given (ProfilePasswordScreen calls
// the real API and owns navigation/success messaging — this file
// doesn't know or care what happens after a successful submit).
//
// Mirrors AddEmailForm.tsx's shape on purpose (same container style,
// same cancel/submit action row) so the two forms feel like the same
// product. The show/hide-password toggle matches RegisterScreen.tsx's
// existing pattern rather than inventing a new one.

import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";
import type { SetPasswordPayload } from "@/services/userService";

type PasswordFormProps = {
  theme: GuestThemeColors;
  // Whether the account can already sign in with a password — decides
  // whether "current password" is asked for at all. Comes from the
  // server (UserProfileSummary.has_password), not guessed client-side.
  hasPassword: boolean;
  submitting: boolean;
  onSubmit: (payload: SetPasswordPayload) => Promise<void>;
};

const MIN_PASSWORD_LENGTH = 8;

function PasswordForm({
  theme,
  hasPassword,
  submitting,
  onSubmit,
}: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): string | null => {
    if (hasPassword && !currentPassword) {
      return "Enter your current password.";
    }

    if (!newPassword) {
      return "Enter a new password.";
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return `Your new password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirmation don't match.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);

    try {
      await onSubmit({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
        confirmPassword,
      });

      // Only clear on success — leaving a rejected attempt in place
      // means the person doesn't have to retype everything just to
      // fix one field.
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save your password. Please try again."
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      {hasPassword ? (
        <PasswordField
          theme={theme}
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          editable={!submitting}
          autoComplete="current-password"
          textContentType="password"
        />
      ) : (
        <Text style={[styles.helper, { color: theme.muted }]}>
          Your account doesn't have a password yet — you're signed in
          on this device only. Adding one lets you sign back in if you
          ever lose access to it.
        </Text>
      )}

      <PasswordField
        theme={theme}
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!submitting}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <PasswordField
        theme={theme}
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!submitting}
        autoComplete="new-password"
        textContentType="newPassword"
      />

      {errorMessage ? (
        <Text style={[styles.error, { color: theme.primary }]}>
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        onPress={() => {
          void handleSubmit();
        }}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel={
          hasPassword ? "Change password" : "Add password"
        }
        accessibilityState={{ disabled: submitting, busy: submitting }}
        style={({ pressed }) => [
          styles.submitButton,
          { backgroundColor: theme.primaryButton, shadowColor: theme.shadow },
          submitting && styles.submitButtonDisabled,
          pressed && !submitting && styles.pressed,
        ]}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>
            {hasPassword ? "Change password" : "Add password"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

type PasswordFieldProps = {
  theme: GuestThemeColors;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable: boolean;
  autoComplete: "current-password" | "new-password";
  textContentType: "password" | "newPassword";
};

// Kept local to this file rather than exported — the show/hide toggle
// and label layout are specific to this form, not a general-purpose
// input meant for reuse elsewhere yet.
function PasswordField({
  theme,
  label,
  value,
  onChangeText,
  editable,
  autoComplete,
  textContentType,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
            },
          ]}
        />

        <Pressable
          onPress={() => setIsVisible((previous) => !previous)}
          hitSlop={10}
          style={styles.visibilityToggle}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? (
            <EyeOff size={19} color={theme.muted} />
          ) : (
            <Eye size={19} color={theme.muted} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },

  helper: {
    marginBottom: 16,
    fontSize: 12.5,
    lineHeight: 19,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 7,
    fontSize: 12.5,
    fontWeight: "600",
  },

  inputRow: {
    position: "relative",
    justifyContent: "center",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingRight: 46,
    fontSize: 14,
  },

  visibilityToggle: {
    position: "absolute",
    right: 14,
  },

  error: {
    marginTop: 2,
    marginBottom: 4,
    fontSize: 12,
    lineHeight: 17,
  },

  submitButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.86,
  },
});

export default PasswordForm;
