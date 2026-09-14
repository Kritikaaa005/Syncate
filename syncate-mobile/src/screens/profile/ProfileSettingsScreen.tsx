import {
  type Href,
  router,
} from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileSettingsCard from "@/components/profile/ProfileSettingsCard";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

const LANGUAGE_ROUTE =
  "/dashboard/profile/language" as Href;

function ProfileSettingsScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft
            size={20}
            color={theme.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Goals, notifications &amp; more
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <ProfileSettingsCard
          theme={theme}
          onLanguagePress={() =>
            router.push(LANGUAGE_ROUTE)
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

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

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  pressed: {
    opacity: 0.72,
  },
});

export default ProfileSettingsScreen;
