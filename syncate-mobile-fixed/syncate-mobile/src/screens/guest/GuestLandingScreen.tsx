import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import GuestActionCard from "@/components/guest/landing/GuestActionCard";
import GuestLandingHeader from "@/components/guest/landing/GuestLandingHeader";
import GuestMoreFeatures from "@/components/guest/landing/GuestMoreFeatures";

import { guestActions } from "@/constants/guestLandingData";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

export default function GuestLanding() {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;
  const { t } = useTranslation("guest");

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        style={{
          backgroundColor: theme.background,
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <GuestLandingHeader />

          <View style={styles.introSection}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {t("landing_title_line1")}
              {"\n"}
              {t("landing_title_line2")} 
            </Text>

            <Text
              style={[
                styles.introSubtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              {t("landing_subtitle")} 
            </Text>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {t("landing_question")}
          </Text>

          <View style={styles.actionsList}>
            {guestActions.map((action) => (
              <GuestActionCard
                key={action.titleKey}
                action={action}
              />
            ))}
          </View>

          <GuestMoreFeatures />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  introSection: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: "center",
    paddingHorizontal: 16,
  },

  introTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
  },

  introSubtitle: {
    maxWidth: 350,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
  },

  sectionTitle: {
    marginBottom: 18,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  actionsList: {
    marginBottom: 22,
    gap: 14,
  },
});