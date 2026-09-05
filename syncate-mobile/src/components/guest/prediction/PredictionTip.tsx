// Destination: components/guest/prediction/PredictionTip.tsx

import { Heart } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

function PredictionTip() {
  const { isDark, colors } = useTheme();
  const accent = colors.primary;

  return (
    <View style={[styles.tip, { backgroundColor: colors.primarySoft }]}>
      <Heart size={16} color={accent} fill={accent} style={styles.icon} />
      <Text style={[styles.text, { color: isDark ? "#F3EDF1" : "#1E1730" }]}>
        <Text style={styles.bold}>Tip:</Text> The more accurate your input, the
        more accurate your predictions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18.85,
  },
  bold: {
    fontWeight: "500",
  },
});

export default PredictionTip;
