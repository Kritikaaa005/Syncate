// LOCATION: syncate-mobile/src/screens/guest/GuestLandingScreen.tsx

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GuestActionCard from "@/components/guest/landing/GuestActionCard";
import GuestMoreFeatures from "@/components/guest/landing/GuestMoreFeatures";

import { guestActions } from "@/constants/guestLandingData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const COPY = {
  en: {
    titleLine1: "Your health,",
    titleLine2: "beautifully simplified.",
    subtitle:
      "Explore essential period insights before creating your account.",
    question: "What would you like to do today?",
  },
  ne: {
    titleLine1: "तपाईंको स्वास्थ्य,",
    titleLine2: "बुझ्न अब अझ सजिलो।",
    subtitle:
      "खाता नबनाई पनि महिनावारी र चक्रसम्बन्धी उपयोगी जानकारी हेर्नुहोस्।",
    question: "आज के गर्न चाहनुहुन्छ?",
  },
} as const;

export default function GuestLanding() {
  const { colors: t } = useTheme();
  const { language } = useLanguage();

  const copy = COPY[language];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: t.background,
        },
      ]}
    >
      <ScrollView
        style={{
          backgroundColor: t.background,
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.introSection}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: t.text,
                },
              ]}
            >
              {copy.titleLine1}
              {"\n"}
              {copy.titleLine2}
            </Text>

            <Text
              style={[
                styles.introSubtitle,
                {
                  color: t.muted,
                },
              ]}
            >
              {copy.subtitle}
            </Text>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: t.text,
              },
            ]}
          >
            {copy.question}
          </Text>

          <View style={styles.actionsList}>
            {guestActions.map((action) => (
              <GuestActionCard
                key={action.title}
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
    lineHeight: 33,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
  },

  introSubtitle: {
    maxWidth: 350,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 23,
  },

  sectionTitle: {
    marginBottom: 18,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
  },

  actionsList: {
    marginBottom: 22,
    gap: 14,
  },
});
