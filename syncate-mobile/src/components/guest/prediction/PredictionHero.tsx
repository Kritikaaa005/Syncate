// Destination: components/guest/prediction/PredictionHero.tsx

import { Sparkle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

function PredictionHero() {
  const { isDark, colors } = useTheme();

  const sparkleStrong = `${colors.sparkle}${isDark ? "B3" : "99"}`;
  const sparkleWeak = `${colors.sparkle}${isDark ? "80" : "66"}`;
  const sparkleMed = `${colors.sparkle}${isDark ? "99" : "80"}`;
  const sparkleFaint = `${colors.sparkle}${isDark ? "66" : "59"}`;

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
        Quick Prediction
      </Text>

      <Text style={[styles.titleLine2, { color: colors.primary }]}>
        Log your period
      </Text>

      <Text style={[styles.subtitle, { color: isDark ? "#B7ACB8" : "#8D8A99" }]}>
        Enter your last period details to get accurate predictions and cycle
        insights.
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
