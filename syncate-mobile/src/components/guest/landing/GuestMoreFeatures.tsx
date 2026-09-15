import {
  type Href,
  router,
} from "expo-router";

import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { moreFeatures } from "@/constants/guestLandingData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import GuestFeatureItem from "./GuestFeatureItem";

const LEARN_MORE_ROUTE =
  "/guest/learn-more" as Href;

const COPY = {
  en: {
    headingStart: "More with",
    subheading: "Create a free account to unlock powerful features.",
    createAccount: "Create Free Account",
    learnMore: "Learn more",
  },
  ne: {
    headingStart: "Syncate सँग अझ धेरै",
    subheading: "निःशुल्क खाता बनाएर थप सुविधाहरू प्रयोग गर्नुहोस्।",
    createAccount: "निःशुल्क खाता बनाउनुहोस्",
    learnMore: "थप जान्नुहोस्",
  },
} as const;

function GuestMoreFeatures() {
  const { isDark, colors } = useTheme();
  const { language } = useLanguage();

  const textColor = isDark ? "#F3EDF1" : "#1E1730";
  const mutedColor = isDark ? "#B7ACB8" : "#8D8A99";
  const primaryColor = colors.primary;
  const copy = COPY[language];

  return (
    <View
      style={[
        styles.section,
        {
          borderColor: isDark ? "#3A2A38" : "#E8EEF8",
          backgroundColor: isDark ? "#221A28" : "#FFFFFF",
        },
      ]}
    >
      {language === "ne" ? (
        <Text style={[styles.heading, { color: textColor }]}>
          <Text style={[styles.highlight, { color: primaryColor }]}>
            Syncate
          </Text>
          {" सँग अझ धेरै"}
        </Text>
      ) : (
        <Text style={[styles.heading, { color: textColor }]}>
          {copy.headingStart}{" "}
          <Text style={[styles.highlight, { color: primaryColor }]}>
            Syncate
          </Text>
        </Text>
      )}

      <Text style={[styles.subheading, { color: mutedColor }]}>
        {copy.subheading}
      </Text>

      <View style={styles.featureGrid}>
        {moreFeatures.map((feature) => {
          const displayFeature =
            language === "ne"
              ? {
                  ...feature,
                  label: feature.labelNe,
                }
              : feature;

          return (
            <View key={feature.label} style={styles.featureGridItem}>
              <GuestFeatureItem feature={displayFeature} />
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/signup")}
        accessibilityRole="button"
        accessibilityLabel={copy.createAccount}
        style={({ pressed }) => [
          styles.ctaButton,
          {
            backgroundColor: colors.primaryButton,
            shadowColor: colors.shadow,
          },
          pressed && styles.pressedScale,
        ]}
      >
        <Text style={styles.ctaButtonText}>{copy.createAccount}</Text>
      </Pressable>

      <View style={styles.learnMoreRow}>
        <Pressable
          onPress={() => {
            router.push(LEARN_MORE_ROUTE);
          }}
          accessibilityRole="button"
          accessibilityLabel={copy.learnMore}
          style={({ pressed }) => [
            styles.learnMoreLink,
            pressed && styles.learnMorePressed,
          ]}
        >
          <Text style={[styles.learnMoreText, { color: primaryColor }]}>
            {copy.learnMore}
          </Text>

          <ArrowRight size={14} color={primaryColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },

  heading: {
    marginBottom: 6,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "600",
  },

  highlight: {
    fontWeight: "700",
  },

  subheading: {
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 21,
  },

  featureGrid: {
    marginBottom: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  featureGridItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 10,
  },

  ctaButton: {
    minHeight: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,

    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },

  pressedScale: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },

  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },

  learnMoreRow: {
    marginTop: 12,
    alignItems: "center",
  },

  learnMoreLink: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },

  learnMorePressed: {
    opacity: 0.7,
  },

  learnMoreText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});

export default GuestMoreFeatures;
