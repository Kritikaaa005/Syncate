import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GuestActionCard from "@/components/guest/landing/GuestActionCard";
import GuestHero from "@/components/guest/landing/GuestHero";
import GuestLandingHeader from "@/components/guest/landing/GuestLandingHeader";
import GuestMoreFeatures from "@/components/guest/landing/GuestMoreFeatures";

import { guestActions } from "@/constants/guestLandingData";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

export default function GuestLanding() {
  const { isDark } = useTheme();
  const t = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

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
          <GuestLandingHeader />

          <GuestHero />

          <Text
            style={[
              styles.sectionTitle,
              {
                color: t.text,
              },
            ]}
          >
            What would you like to do today?
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

  sectionTitle: {
    marginTop: 16,
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