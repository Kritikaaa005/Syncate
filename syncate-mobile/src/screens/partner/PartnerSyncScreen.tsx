import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  ArrowLeft,
  Copy,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react-native";
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

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  generatePartnerCode,
  type GeneratedPartnerCode,
  PartnerServiceError,
} from "@/services/partnerService";

function formatExpiration(expiresAt: string): string {
  const expiration = new Date(expiresAt);

  if (Number.isNaN(expiration.getTime())) {
    return "Expiration time unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(expiration);
}

export default function PartnerSyncScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;
  const [generatedCode, setGeneratedCode] = useState<GeneratedPartnerCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requestCode = async () => {
    if (isGenerating) {
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);

    try {
      setGeneratedCode(await generatePartnerCode());
    } catch (error) {
      if (error instanceof PartnerServiceError && error.status === 409) {
        setErrorMessage("You already have a linked partner.");
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not generate a partner code. Please try again.",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmRegeneration = () => {
    Alert.alert(
      "Generate a new code?",
      "Generating a new code will make your current partner code stop working. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate New Code",
          style: "destructive",
          onPress: () => {
            void requestCode();
          },
        },
      ],
    );
  };

  const copyCode = async () => {
    if (!generatedCode) {
      return;
    }

    try {
      await Clipboard.setStringAsync(generatedCode.code);
      Alert.alert("Code copied", "Your partner code was copied to the clipboard.");
    } catch {
      setErrorMessage("Could not copy the partner code. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            disabled={isGenerating}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && !isGenerating && styles.pressed,
            ]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Partner Sync</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.heroIcon, { backgroundColor: theme.primarySoft }]}>
            <Users size={30} color={theme.primary} strokeWidth={1.9} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Share your journey</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Generate a private code and share it with one partner to connect your Syncate accounts.
          </Text>

          <View style={[styles.warningCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ShieldCheck size={21} color={theme.primary} />
            <Text style={[styles.warningText, { color: theme.muted }]}>
              Generating a new code immediately invalidates your previous code.
            </Text>
          </View>

          {generatedCode ? (
            <View style={[styles.codeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.codeLabel, { color: theme.muted }]}>PARTNER CODE</Text>
              <Text selectable style={[styles.code, { color: theme.primary }]}>
                {generatedCode.code}
              </Text>
              <Text style={[styles.validity, { color: theme.text }]}>Valid for 24 hours</Text>
              <Text style={[styles.expiration, { color: theme.muted }]}>
                Expires: {formatExpiration(generatedCode.expires_at)}
              </Text>
              <Text style={[styles.shareHint, { color: theme.muted }]}>
                Share this code with your partner. Generation #{generatedCode.counter}.
              </Text>

              <Pressable
                onPress={() => void copyCode()}
                accessibilityRole="button"
                accessibilityLabel="Copy partner code"
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: theme.primary, backgroundColor: theme.primarySoft },
                  pressed && styles.pressed,
                ]}
              >
                <Copy size={18} color={theme.primary} />
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Copy Code</Text>
              </Pressable>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={[styles.errorCard, { borderColor: theme.primary, backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.errorText, { color: theme.primary }]}>{errorMessage}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={generatedCode ? confirmRegeneration : () => void requestCode()}
            disabled={isGenerating}
            accessibilityRole="button"
            accessibilityState={{ disabled: isGenerating, busy: isGenerating }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.primaryButton, shadowColor: theme.shadow },
              isGenerating && styles.disabled,
              pressed && !isGenerating && styles.pressed,
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : generatedCode ? (
              <RefreshCw size={19} color="#FFFFFF" />
            ) : (
              <KeyRound size={19} color="#FFFFFF" />
            )}
            {!isGenerating ? (
              <Text style={styles.primaryButtonText}>
                {generatedCode ? "Generate New Code" : "Generate Partner Code"}
              </Text>
            ) : null}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" },
  topBar: {
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: { fontSize: 16, fontWeight: "700" },
  topBarSpacer: { width: 40, height: 40 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 44 },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { textAlign: "center", fontSize: 27, lineHeight: 34, fontWeight: "800" },
  subtitle: {
    maxWidth: 350,
    alignSelf: "center",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 19 },
  codeCard: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginTop: 20,
  },
  codeLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  code: { fontSize: 35, lineHeight: 44, fontWeight: "900", letterSpacing: 5, marginTop: 8 },
  validity: { fontSize: 14, fontWeight: "700", marginTop: 8 },
  expiration: { fontSize: 12, lineHeight: 18, marginTop: 3, textAlign: "center" },
  shareHint: { fontSize: 12, lineHeight: 18, marginTop: 13, textAlign: "center" },
  secondaryButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "stretch",
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 20,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "800" },
  errorCard: { borderWidth: 1, borderRadius: 15, padding: 13, marginTop: 18 },
  errorText: { textAlign: "center", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  primaryButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 18,
    marginTop: 22,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.55, shadowOpacity: 0, elevation: 0 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
