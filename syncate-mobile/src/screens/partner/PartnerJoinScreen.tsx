import { type Href, router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Link2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DateOfBirthInput, { toISODateString } from "@/components/signup/DateOfBirthInput";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  PartnerServiceError,
  registerPartner,
  validatePartnerCode,
} from "@/services/partnerService";

type JoinStep = "code" | "registration";
type RegistrationField = "nickname" | "date_of_birth" | "email" | "password";

const INVALID_CODE_MESSAGE =
  "This partner code is invalid or has expired. Ask your partner to generate a new code.";
const PARTNER_DASHBOARD_ROUTE = "/partner-dashboard" as Href;

function fieldError(error: PartnerServiceError, field: RegistrationField): string | null {
  const value = error.fieldErrors[field];
  if (typeof value === "string") return value;
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : null;
}

export default function PartnerJoinScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;
  const [step, setStep] = useState<JoinStep>("code");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleBack = () => {
    if (step === "registration") {
      setStep("code");
      setGeneralError(null);
      return;
    }

    router.back();
  };

  useEffect(() => {
    if (step !== "registration") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setStep("code");
      setGeneralError(null);
      return true;
    });

    return () => subscription.remove();
  }, [step]);

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\s/g, "").toUpperCase().slice(0, 8));
    setCodeError(null);
  };

  const handleValidateCode = async () => {
    if (code.length !== 8 || isSubmitting) return;

    setCodeError(null);
    setIsSubmitting(true);

    try {
      await validatePartnerCode(code);
      setStep("registration");
    } catch (error) {
      setCodeError(
        error instanceof PartnerServiceError && error.status === 400
          ? INVALID_CODE_MESSAGE
          : "Could not validate the partner code. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistration = async () => {
    if (isSubmitting) return;

    const normalizedNickname = nickname.trim();
    const dateOfBirth = toISODateString(day, month, year);
    let hasLocalError = false;

    if (normalizedNickname.length < 2) {
      setNicknameError("Nickname must contain at least 2 characters.");
      hasLocalError = true;
    }
    if (!dateOfBirth) {
      setDateOfBirthError("Enter your full date of birth.");
      hasLocalError = true;
    }
    if (hasLocalError || !dateOfBirth) return;

    setNicknameError(null);
    setDateOfBirthError(null);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      await registerPartner({
        code,
        nickname: normalizedNickname,
        date_of_birth: dateOfBirth,
        email: email.trim() || undefined,
        password: password || undefined,
      });
      router.replace(PARTNER_DASHBOARD_ROUTE);
    } catch (error) {
      if (error instanceof PartnerServiceError) {
        const codeWasRejected =
          error.status === 400 &&
          (!!error.fieldErrors.code || error.message.toLowerCase().includes("partner code"));

        if (codeWasRejected) {
          setStep("code");
          setCodeError(INVALID_CODE_MESSAGE);
          return;
        }

        setNicknameError(fieldError(error, "nickname"));
        setDateOfBirthError(fieldError(error, "date_of_birth"));
        setEmailError(fieldError(error, "email"));
        setPasswordError(fieldError(error, "password"));

        if (
          !error.fieldErrors.nickname &&
          !error.fieldErrors.date_of_birth &&
          !error.fieldErrors.email &&
          !error.fieldErrors.password
        ) {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={step === "registration" ? "Back to partner code" : "Go back"}
            style={[styles.backButton, { backgroundColor: theme.primarySoft }]}
          >
            <ArrowLeft size={20} color={theme.primary} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Partner Sync</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === "code" ? (
            <>
              <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
                <Link2 size={29} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Join as a Partner</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Enter the code shared with you by your partner.
              </Text>

              <View style={styles.codeField}>
                <Text style={[styles.label, { color: theme.text }]}>Partner code</Text>
                <TextInput
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="XXXXXXXX"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={8}
                  returnKeyType="done"
                  onSubmitEditing={() => void handleValidateCode()}
                  style={[
                    styles.codeInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.card,
                      borderColor: codeError ? theme.primary : theme.border,
                    },
                  ]}
                />
                {codeError ? (
                  <Text style={[styles.errorText, { color: theme.primary }]}>{codeError}</Text>
                ) : (
                  <Text style={[styles.helperText, { color: theme.muted }]}>Enter all 8 characters.</Text>
                )}
              </View>

              <SubmitButton
                label="Continue"
                loading={isSubmitting}
                disabled={code.length !== 8 || isSubmitting}
                color={theme.primaryButton}
                onPress={() => void handleValidateCode()}
              />
            </>
          ) : (
            <>
              <Text style={[styles.title, styles.registrationTitle, { color: theme.text }]}>Create your partner account</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>Your date of birth is required. Email and password are optional.</Text>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Nickname</Text>
                <TextInput
                  value={nickname}
                  onChangeText={(value) => {
                    setNickname(value);
                    setNicknameError(null);
                  }}
                  placeholder="What should we call you?"
                  placeholderTextColor={theme.muted}
                  maxLength={30}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                />
                {nicknameError ? <Text style={[styles.errorText, { color: theme.primary }]}>{nicknameError}</Text> : null}
              </View>

              <View style={styles.field}>
                <DateOfBirthInput
                  day={day}
                  month={month}
                  year={year}
                  onChangeDay={(value) => { setDay(value); setDateOfBirthError(null); }}
                  onChangeMonth={(value) => { setMonth(value); setDateOfBirthError(null); }}
                  onChangeYear={(value) => { setYear(value); setDateOfBirthError(null); }}
                  colors={theme}
                  isDark={isDark}
                />
                {dateOfBirthError ? <Text style={[styles.errorText, { color: theme.primary }]}>{dateOfBirthError}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Email (optional)</Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => { setEmail(value); setEmailError(null); }}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                />
                {emailError ? <Text style={[styles.errorText, { color: theme.primary }]}>{emailError}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Password (optional)</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={(value) => { setPassword(value); setPasswordError(null); }}
                    placeholder="Leave blank to skip for now"
                    placeholderTextColor={theme.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((current) => !current)}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={20} color={theme.muted} /> : <Eye size={20} color={theme.muted} />}
                  </Pressable>
                </View>
                {passwordError ? <Text style={[styles.errorText, { color: theme.primary }]}>{passwordError}</Text> : null}
                <Text style={[styles.helperText, { color: theme.muted }]}>Email or a password can help you access this account again later.</Text>
              </View>

              {generalError ? <Text style={[styles.errorText, styles.generalError, { color: theme.primary }]}>{generalError}</Text> : null}

              <SubmitButton
                label="Create Partner Account"
                loading={isSubmitting}
                disabled={isSubmitting}
                color={theme.primaryButton}
                onPress={() => void handleRegistration()}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type SubmitButtonProps = {
  label: string;
  loading: boolean;
  disabled: boolean;
  color: string;
  onPress: () => void;
};

function SubmitButton({ label, loading, disabled, color, onPress }: SubmitButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      style={({ pressed }) => [
        styles.submitButton,
        { backgroundColor: color },
        (pressed || disabled) && styles.submitButtonPressed,
      ]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  topBar: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontSize: 16, fontWeight: "700" },
  topBarSpacer: { width: 40, height: 40 },
  content: { width: "100%", maxWidth: 430, alignSelf: "center", padding: 20, paddingBottom: 42 },
  heroIcon: { width: 62, height: 62, borderRadius: 21, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 12, marginBottom: 18 },
  title: { textAlign: "center", fontSize: 27, lineHeight: 34, fontWeight: "800" },
  registrationTitle: { marginTop: 6 },
  subtitle: { maxWidth: 350, alignSelf: "center", textAlign: "center", fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 28 },
  codeField: { marginTop: 4 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16 },
  codeInput: { borderWidth: 1.5, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 16, textAlign: "center", fontSize: 25, fontWeight: "800", letterSpacing: 5 },
  passwordRow: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 46 },
  passwordToggle: { position: "absolute", right: 12, padding: 4 },
  helperText: { fontSize: 12, lineHeight: 17, marginTop: 7 },
  errorText: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  generalError: { textAlign: "center", marginBottom: 10 },
  submitButton: { minHeight: 52, borderRadius: 30, alignItems: "center", justifyContent: "center", marginTop: 10 },
  submitButtonPressed: { opacity: 0.55 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
