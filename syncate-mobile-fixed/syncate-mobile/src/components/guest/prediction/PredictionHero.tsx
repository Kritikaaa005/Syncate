// Destination: components/guest/prediction/PredictionHero.tsx

import { Sparkle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

function PredictionHero() {
  const { isDark } = useTheme();
  const { t } = useTranslation("guest");

  const sparkleStrong = isDark ? "rgba(255,124,163,0.7)" : "rgba(242,56,106,0.6)";
  const sparkleWeak = isDark ? "rgba(255,124,163,0.5)" : "rgba(242,56,106,0.4)";
  const sparkleMed = isDark ? "rgba(255,124,163,0.6)" : "rgba(242,56,106,0.5)";
  const sparkleFaint = isDark ? "rgba(255,124,163,0.4)" : "rgba(242,56,106,0.35)";

  return (
    <View style={styles.container}>
      <View style={[styles.sparkle, { left: 40, top: 4, transform: [{ rotate: "12deg" }] }]}>
        <Sparkle size={14} color={sparkleStrong} />
      </View>
      <View style={[styles.sparkle, { right: 40, top: 20, transform: [{ rotate: "-12deg" }] }]}>
        <Sparkle size={10} color={sparkleWeak} />
      </View>
      <View
        style={[styles.sparkle, { right: 96, top: 86, transform: [{ rotate: "6deg" }] }]}
      >
        <Sparkle size={18} color={sparkleMed} />
      </View>
      <View style={[styles.sparkle, { left: 64, top: 72, transform: [{ rotate: "-6deg" }] }]}>
        <Sparkle size={12} color={sparkleFaint} />
      </View>

      <Text style={[styles.titleLine1, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
        {t("action_quick_prediction_title")} 
      </Text>

      <Text style={[styles.titleLine2, { color: isDark ? "#FF7CA3" : "#F2386A" }]}>
        {t("log_period_title")}
      </Text>

      <Text style={[styles.subtitle, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
        {t("log_period_description")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    alignItems: "center",
  },
  sparkle: {
    position: "absolute",
    zIndex: 1,
  },
  titleLine1: {
    fontSize: 22,
    fontWeight: "400",
    lineHeight: 26,
    textAlign: "center",
  },
  titleLine2: {
    marginTop: 10,
    fontSize: 27,
    fontWeight: "600",
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 16,
    maxWidth: 360,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 24,
  },
});

export default PredictionHero;
