// Destination: src/screens/signup/RegisterScreen.tsx
//
// Issue #13's registration form. Email and password are both genuinely
// optional here — see registration/serializers.py on the backend for the
// full reasoning (no-password accounts are first-class, not a degraded
// fallback). This screen's only job is: collect DOB + optional
// email/password, call the API, surface whatever error comes back
// per-field, and on success hand off further — it doesn't decide app-wide
// what happens after that.
//
// Terms & Privacy agreement now lives on this form as a required
// checkbox instead of a separate mandatory screen after signup. The
// backend's acceptance endpoint requires an authenticated user though
// (legal_docs/views.py's LegalDocumentAcceptanceView is IsAuthenticated),
// so ticking the box can't itself call that API — there's no account yet.
// What actually happens: the checkbox blocks handleSubmit from firing at
// all (same "show an error, don't proceed" pattern as the DOB field
// above), and only once register() has genuinely succeeded and saved
// real tokens do we call acceptLegalDocument() for both docs. Either way
// we then route to /registered-terms — if acceptance recorded fine, that
// screen sees alreadyAgreed=true and bounces straight past itself; if it
// didn't (e.g. a network blip right after signup), that screen is still
// there as a real fallback gate rather than the person landing in the
// app with consent silently never recorded.

import { useRouter } from "expo-router";
import { Check, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
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
import LanguageDropdown from "@/components/signup/LanguageDropdown";
import TermsViewerModal from "@/components/signup/TermsViewerModal";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLegalDocument } from "@/hooks/useLegalDocument";
import { RegistrationError, register } from "@/services/registrationService";
import { acceptLegalDocument } from "@/services/legalDocsService";
import type { BackendLegalDocument } from "@/types/legalDocument";

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const t = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsAgreementError, setTermsAgreementError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Public endpoint (AllowAny), so these are fetchable before an account
  // exists — used both for the "learn more" viewer's content and to know
  // whether there's actually something live to show yet.
  const termsDoc = useLegalDocument("registered_terms");
  const privacyDoc = useLegalDocument("registered_privacy");
  const viewerDocuments: BackendLegalDocument[] = [termsDoc.document, privacyDoc.document].filter(
    (doc): doc is BackendLegalDocument => doc !== null
  );

  const handleSubmit = async () => {
    const isoDateOfBirth = toISODateString(day, month, year);
    if (!isoDateOfBirth) {
      setDateOfBirthError("Enter your full date of birth.");
      return;
    }

    if (!agreedToTerms) {
      setTermsAgreementError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setDateOfBirthError(null);
    setEmailError(null);
    setPasswordError(null);
    setTermsAgreementError(null);
    setGeneralError(null);
    setSubmitting(true);

    try {
      await register({
        date_of_birth: isoDateOfBirth,
        email: email.trim() || undefined,
        password: password || undefined,
      });

      // Consent was already given via the checkbox above, before this
      // request ever fired — but LegalDocumentAcceptanceView requires an
      // authenticated user, so recording it server-side could only ever
      // happen now, right after register() has saved real tokens. Always
      // fire both, regardless of whether this screen's own document
      // fetch (termsDoc/privacyDoc, used for the Learn More viewer) has
      // resolved yet — the server decides "the current version" itself
      // from doc_type alone, it doesn't need us to have already loaded
      // the document locally. This is best-effort: whether it succeeds
      // or fails, /registered-terms is still the right next stop (see
      // this file's header comment for why routing there either way is
      // correct in both cases).
      try {
        await acceptLegalDocument("registered_terms");
        await acceptLegalDocument("registered_privacy");
      } catch (consentError) {
        console.error("Recording terms/privacy acceptance failed:", consentError);
      }

      router.replace("/registered-terms");
    } catch (error) {
      if (error instanceof RegistrationError) {
        setDateOfBirthError(error.fieldErrors.date_of_birth?.[0] ?? null);
        setEmailError(error.fieldErrors.email?.[0] ?? null);
        setPasswordError(error.fieldErrors.password?.[0] ?? null);
        if (!error.fieldErrors.date_of_birth && !error.fieldErrors.email && !error.fieldErrors.password) {
          setGeneralError(error.fieldErrors.detail ?? "Something went wrong. Please try again.");
        }
      } else {
        // Not a RegistrationError, i.e. not a validation response from
        // the backend — could genuinely be a network failure, but could
        // also be anything else that throws in this try block (it did,
        // in practice: expo-secure-store throwing on web). Log the real
        // cause so it's diagnosable, and don't claim it's a connectivity
        // issue when it might not be.
        console.error("Registration failed unexpectedly:", error);
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: t.text }]}>Create your account</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>
            Just your date of birth to get started — everything else is optional.
          </Text>

          <View style={styles.field}>
            <DateOfBirthInput
              day={day}
              month={month}
              year={year}
              onChangeDay={setDay}
              onChangeMonth={setMonth}
              onChangeYear={setYear}
              colors={t}
              isDark={isDark}
            />
            {dateOfBirthError && <Text style={[styles.errorText, { color: t.primary }]}>{dateOfBirthError}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text }]}>Email (optional)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={t.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: t.background, borderColor: t.border, color: t.text }]}
            />
            {emailError && <Text style={[styles.errorText, { color: t.primary }]}>{emailError}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: t.text }]}>Password (optional)</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to skip for now"
                placeholderTextColor={t.muted}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  styles.passwordInput,
                  { backgroundColor: t.background, borderColor: t.border, color: t.text },
                ]}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.passwordToggle}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} color={t.muted} /> : <Eye size={20} color={t.muted} />}
              </Pressable>
            </View>
            {passwordError && <Text style={[styles.errorText, { color: t.primary }]}>{passwordError}</Text>}
            <Text style={[styles.helperText, { color: t.muted }]}>
              No password or email? You can add either anytime from Settings — just know that
              without one, losing this device means losing this account.
            </Text>
          </View>

          <View style={styles.field}>
            <LanguageDropdown colors={t} />
          </View>

          <View style={styles.field}>
            <Pressable
              onPress={() => {
                setAgreedToTerms((prev) => !prev);
                setTermsAgreementError(null);
              }}
              style={styles.consentRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreedToTerms }}
              accessibilityLabel="I agree to the Terms & Conditions and Privacy Policy"
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: t.border,
                    backgroundColor: agreedToTerms ? t.primaryButton : "transparent",
                  },
                ]}
              >
                {agreedToTerms && <Check size={14} color="#FFFFFF" />}
              </View>
              <Text style={[styles.consentText, { color: t.text }]}>
                I agree to the{" "}
                <Text style={[styles.consentLink, { color: t.primary }]} onPress={() => setViewerOpen(true)}>
                  Terms & Conditions and Privacy Policy
                </Text>
              </Text>
            </Pressable>
            {termsAgreementError && (
              <Text style={[styles.errorText, { color: t.primary }]}>{termsAgreementError}</Text>
            )}
          </View>

          {generalError && <Text style={[styles.errorText, styles.generalError, { color: t.primary }]}>{generalError}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: t.primaryButton },
              (pressed || submitting) && styles.submitButtonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsViewerModal
        visible={viewerOpen}
        documents={viewerDocuments}
        loading={termsDoc.loading || privacyDoc.loading}
        colors={t}
        onClose={() => setViewerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 21, marginBottom: 28 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  passwordRow: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 46 },
  passwordToggle: { position: "absolute", right: 12 },
  helperText: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  consentText: { flex: 1, fontSize: 14, lineHeight: 20 },
  consentLink: { fontWeight: "600", textDecorationLine: "underline" },
  errorText: { fontSize: 13, marginTop: 6 },
  generalError: { textAlign: "center", marginBottom: 12 },
  submitButton: {
    minHeight: 52,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonPressed: { opacity: 0.9 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});