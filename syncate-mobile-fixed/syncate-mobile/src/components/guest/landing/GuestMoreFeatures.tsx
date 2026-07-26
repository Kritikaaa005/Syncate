import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { moreFeatures } from "@/constants/guestLandingData";
import { useTheme } from "@/contexts/ThemeContext";
import GuestFeatureItem from "./GuestFeatureItem";

function GuestMoreFeatures() {
  const { isDark } = useTheme();
  const { t } = useTranslation("guest");

  const textColor = isDark ? "#F3EDF1" : "#1E1730";
  const mutedColor = isDark ? "#B7ACB8" : "#8D8A99";
  const primaryColor = isDark ? "#FF7CA3" : "#F2386A";

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
      <Text style={[styles.heading, { color: textColor }]}>
        {t("more_with")}{" "}
        <Text style={[styles.highlight, { color: primaryColor }]}>Syncate</Text>
      </Text>

      <Text style={[styles.subheading, { color: mutedColor }]}>
        {t("more_subheading")}
      </Text>

      <View style={styles.featureGrid}>
        {moreFeatures.map((feature) => (
          <View key={feature.labelKey} style={styles.featureGridItem}>
            <GuestFeatureItem feature={feature} />
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/signup")}
        style={({ pressed }) => [
          styles.ctaButton,
          {
            backgroundColor: isDark ? "#FF6F98" : "#F4467A",
          },
          pressed && styles.pressedScale,
        ]}
      >
        <Text style={styles.ctaButtonText}>{t("create_free_account")}</Text>
      </Pressable>

      <View style={styles.learnMoreRow}>
        <Pressable
          onPress={() => router.push("/about")}
          style={({ pressed }) => [
            styles.learnMoreLink,
            pressed && styles.learnMorePressed,
          ]}
        >
          <Text style={[styles.learnMoreText, { color: primaryColor }]}>
            {t("learn_more")}
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
    lineHeight: 27,
    fontWeight: "600",
  },

  highlight: {
    fontWeight: "700",
  },

  subheading: {
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 19,
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

    shadowColor: "#F4467A",
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
    lineHeight: 18,
    fontWeight: "600",
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
    lineHeight: 18,
    fontWeight: "500",
  },
});

export default GuestMoreFeatures;