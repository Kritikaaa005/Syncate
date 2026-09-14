import { type Href, router } from "expo-router";
import { ChevronRight, Settings, UserRound } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import { useTheme } from "@/contexts/ThemeContext";

const ACCOUNT_ROUTE = "/dashboard/profile/account" as Href;
const SETTINGS_ROUTE = "/dashboard/profile/settings" as Href;

function RegisteredProfileScreen() {
  const { colors: theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <View style={[styles.headerIconOuter, { backgroundColor: theme.primarySoft }]}>
            <View style={[styles.headerIconInner, { backgroundColor: theme.primaryButton }]}>
              <UserRound size={26} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Your account and preferences
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.muted }]}>Manage</Text>

        <View
          style={[
            styles.navCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Pressable
            onPress={() => router.push(ACCOUNT_ROUTE)}
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}
          >
            <View style={[styles.navIcon, { backgroundColor: theme.primarySoft }]}>
              <UserRound size={24} color={theme.primary} />
            </View>

            <View style={styles.navText}>
              <Text style={[styles.navLabel, { color: theme.text }]}>User profile</Text>
              <Text style={[styles.navHint, { color: theme.muted }]}>Nickname, email & terms</Text>
            </View>

            <ChevronRight size={20} color={theme.muted} />
          </Pressable>

          <View style={[styles.navDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push(SETTINGS_ROUTE)}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}
          >
            <View style={[styles.navIcon, { backgroundColor: theme.primarySoft }]}>
              <Settings size={24} color={theme.primary} />
            </View>

            <View style={styles.navText}>
              <Text style={[styles.navLabel, { color: theme.text }]}>Settings</Text>
              <Text style={[styles.navHint, { color: theme.muted }]}>Goals, theme, password & account</Text>
            </View>

            <ChevronRight size={20} color={theme.muted} />
          </Pressable>
        </View>
      </ScrollView>

      <RegisteredBottomNav activeItem="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  headerBlock: { alignItems: "center", marginBottom: 34 },
  headerIconOuter: {
    width: 74,
    height: 74,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  headerIconInner: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, lineHeight: 36, fontWeight: "800" },
  subtitle: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  sectionLabel: {
    marginLeft: 4,
    marginBottom: 9,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  navCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  navRow: { minHeight: 82, flexDirection: "row", alignItems: "center" },
  navIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { flex: 1, marginLeft: 13, paddingRight: 8 },
  navLabel: { fontSize: 15.5, fontWeight: "700" },
  navHint: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  navDivider: { height: StyleSheet.hairlineWidth, marginLeft: 59 },
  pressed: { opacity: 0.72 },
});

export default RegisteredProfileScreen;
