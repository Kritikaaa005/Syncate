import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GuestActionCard from "@/components/guest/landing/GuestActionCard";
import GuestLandingHeader from "@/components/guest/landing/GuestLandingHeader";
import GuestMoreFeatures from "@/components/guest/landing/GuestMoreFeatures";

import { guestActions } from "@/constants/guestLandingData";
import { useTheme } from "@/contexts/ThemeContext";

export default function GuestLanding() {
  const { colors: t } = useTheme();

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

          <View style={styles.introSection}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: t.text,
                },
              ]}
            >
              Your health,
              {"\n"}
             beautifully simplified.
            </Text>

            <Text
              style={[
                styles.introSubtitle,
                {
                  color: t.muted,
                },
              ]}
            >
              Explore essential period insights before creating your account.
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
