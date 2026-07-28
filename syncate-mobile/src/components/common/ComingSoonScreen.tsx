import { router } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

type ComingSoonScreenProps = {
  title: string;
  description?: string;
};

export default function ComingSoonScreen({ title, description }: ComingSoonScreenProps) {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.primarySoft }]}
        >
          <ArrowLeft size={20} color={theme.primary} />
        </Pressable>

        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <Sparkles size={28} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.muted }]}>
          {description ?? "This feature is coming soon."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", padding: 20 },
  backButton: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 120, marginBottom: 20 },
  title: { textAlign: "center", fontSize: 24, fontWeight: "600", marginBottom: 10 },
  description: { textAlign: "center", fontSize: 15, lineHeight: 23 },
});
