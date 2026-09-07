// Destination: src/screens/signup/YourselfOrPartnerScreen.tsx
//
// First screen after tapping "Create Free Account" (issue #6). Only the
// "For myself" path goes anywhere right now — partner accounts aren't
// built yet, so that card is visibly present (so people know it's coming)
// but disabled rather than hidden entirely.

import { type Href, router } from "expo-router";
import { ArrowLeft, User, Users } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

const PARTNER_JOIN_ROUTE = "/partner/join" as Href;

export default function YourselfOrPartnerScreen() {
  const { isDark } = useTheme();
  const t = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: t.primarySoft }]}
        >
          <ArrowLeft size={20} color={t.primary} />
        </Pressable>

        <Text style={[styles.title, { color: t.text }]}>Who’s this for?</Text>
        <Text style={[styles.subtitle, { color: t.muted }]}>
          Let us know how you’ll be using Syncate.
        </Text>

        <Pressable
          onPress={() => router.push("/signup/register")}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: t.card, borderColor: t.primary },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: t.primarySoft }]}>
            <User size={26} color={t.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: t.text }]}>For myself</Text>
          <Text style={[styles.cardDescription, { color: t.muted }]}>
            Track your own cycle, symptoms, and predictions.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(PARTNER_JOIN_ROUTE)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: t.card, borderColor: t.primary },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: t.primarySoft }]}>
            <Users size={26} color={t.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: t.text }]}>For a partner</Text>
          <Text style={[styles.cardDescription, { color: t.muted }]}>
            Support someone else’s tracking with shared access.
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", padding: 20 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 21, marginBottom: 28 },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  cardDescription: { fontSize: 14, lineHeight: 20 },
});
