import { router } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";
import { updateNickname } from "@/services/userService";

function NicknameScreen() {
  const { isDark, toggleDark, colors: theme } = useTheme();

  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const cleanNickname = nickname.trim();
  const hasForbiddenCharacters = /[\n\r\t]/.test(nickname);

  const canContinue =
    cleanNickname.length >= 2 &&
    cleanNickname.length <= 30 &&
    !hasForbiddenCharacters;

  const handleNicknameChange = (value: string) => {
    setNickname(value);

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleContinue = async () => {
    if (!canContinue || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await updateNickname(cleanNickname);

      router.replace({
        pathname: "/onboarding/preference" as any,
        params: {
          nickname: response.nickname,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save your nickname. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHelperMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }

    if (hasForbiddenCharacters) {
      return "Nickname cannot contain tabs or line breaks.";
    }

    if (cleanNickname.length === 1) {
      return "Nickname must contain at least 2 characters.";
    }

    return "Letters, numbers, symbols and emoji are welcome.";
  };

  const helperHasError =
    Boolean(errorMessage) ||
    hasForbiddenCharacters ||
    cleanNickname.length === 1;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.page}>
          <Pressable
            onPress={toggleDark}
            accessibilityRole="button"
            accessibilityLabel="Toggle dark mode"
            hitSlop={12}
            style={({ pressed }) => [
              styles.themeButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
              pressed && styles.themeButtonPressed,
            ]}
          >
            {isDark ? (
              <Sun size={18} color={theme.primary} />
            ) : (
              <Moon size={18} color={theme.primary} />
            )}
          </Pressable>

          <Text
            style={[
              styles.star,
              styles.starOne,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.star,
              styles.starTwo,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.star,
              styles.starThree,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.star,
              styles.starFour,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.star,
              styles.starFive,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <Text
            style={[
              styles.star,
              styles.starSix,
              { color: theme.sparkle },
            ]}
          >
            ✦
          </Text>

          <View
            style={[
              styles.dot,
              styles.dotOne,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View
            style={[
              styles.dot,
              styles.dotTwo,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View
            style={[
              styles.dot,
              styles.dotThree,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View
            style={[
              styles.dot,
              styles.dotFour,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View
            style={[
              styles.dot,
              styles.dotFive,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View
            style={[
              styles.dot,
              styles.dotSix,
              { backgroundColor: theme.sparkle },
            ]}
          />

          <View style={styles.formSection}>
            <View style={styles.headingSection}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                  },
                ]}
              >
                What should we call you?
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                Choose a nickname that feels like you.
              </Text>
            </View>

            <TextInput
              value={nickname}
              onChangeText={handleNicknameChange}
              editable={!isSubmitting}
              placeholder="Enter your nickname"
              placeholderTextColor={theme.muted}
              maxLength={30}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              selectionColor={theme.primary}
              accessibilityLabel="Nickname"
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: helperHasError
                    ? theme.primary
                    : theme.inputBorder,
                },
              ]}
            />

            <View style={styles.helperRow}>
              <Text
                style={[
                  styles.helperText,
                  {
                    color: helperHasError
                      ? theme.primary
                      : theme.muted,
                  },
                ]}
              >
                {getHelperMessage()}
              </Text>

              <Text
                style={[
                  styles.characterCount,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                {nickname.length}/30
              </Text>
            </View>

            <Pressable
              disabled={!canContinue || isSubmitting}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{
                disabled: !canContinue || isSubmitting,
                busy: isSubmitting,
              }}
              style={({ pressed }) => [
                styles.continueButton,
                {
                  backgroundColor: theme.primaryButton,
                  shadowColor: theme.shadow,
                },
                pressed &&
                  canContinue &&
                  !isSubmitting &&
                  styles.continueButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.continueText}>
                  Continue
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 28,
  },

  themeButton: {
    position: "absolute",
    top: 8,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  themeButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  formSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },

  headingSection: {
    alignItems: "center",
    marginBottom: 32,
  },

  title: {
    marginBottom: 9,
    textAlign: "center",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "600",
  },

  subtitle: {
    maxWidth: 300,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  input: {
    width: "100%",
    minHeight: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingVertical: 0,
    fontSize: 14.5,
    lineHeight: 20,
  },

  helperRow: {
    marginTop: 13,
    marginBottom: 40,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  helperText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 15,
  },

  characterCount: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  continueButton: {
    width: "100%",
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },

  continueButtonPressed: {
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  star: {
    position: "absolute",
    fontWeight: "300",
  },

  starOne: {
    top: 30,
    left: 44,
    fontSize: 20,
  },

  starTwo: {
    top: 31,
    right: 72,
    fontSize: 23,
  },

  starThree: {
    top: 104,
    left: 26,
    fontSize: 10,
    opacity: 0.55,
  },

  starFour: {
    top: 100,
    right: 18,
    fontSize: 10,
    opacity: 0.5,
  },

  starFive: {
    bottom: 72,
    left: 42,
    fontSize: 21,
  },

  starSix: {
    bottom: 74,
    right: 38,
    fontSize: 25,
  },

  dot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.55,
  },

  dotOne: {
    top: 20,
    left: 8,
  },

  dotTwo: {
    top: 185,
    right: 8,
  },

  dotThree: {
    top: 285,
    left: 2,
  },

  dotFour: {
    bottom: 49,
    left: 73,
  },

  dotFive: {
    bottom: 40,
    right: 7,
  },

  dotSix: {
    bottom: 22,
    right: 90,
  },
});

export default NicknameScreen;
