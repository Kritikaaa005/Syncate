import { router } from "expo-router";
import {
  ArrowLeft,
  Check,
  Languages,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

function ProfileLanguageScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

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
          accessibilityLabel="Back to settings"
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

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>Language</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Choose your app language</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
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
          <View style={styles.sectionHeading}>
            <View
              style={[
                styles.headingIcon,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <Languages size={18} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>App language</Text>
          </View>

          <View style={[styles.languageRow, { borderColor: theme.border }]}>
            <View style={styles.languageText}>
              <Text style={[styles.languageTitle, { color: theme.text }]}>English</Text>
              <Text style={[styles.languageSubtitle, { color: theme.muted }]}>Currently selected</Text>
            </View>
            <View
              style={[
                styles.checkmark,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <Check size={18} color={theme.primary} />
            </View>
          </View>
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
  headerText: { flex: 1 },
  title: { fontSize: 21, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 12 },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  card: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  headingIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  languageRow: {
    minHeight: 72,
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
  },
  languageText: { flex: 1 },
  languageTitle: { fontSize: 14, fontWeight: "600" },
  languageSubtitle: { marginTop: 3, fontSize: 12 },
  checkmark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.72 },
});

export default ProfileLanguageScreen;
