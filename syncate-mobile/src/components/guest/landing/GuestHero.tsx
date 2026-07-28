import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

const quickPredictionIllustration = require("../../../../assets/images/quickPredictionIllustration.png");
const quickPredictionIllustrationDark = require("../../../../assets/images/quickPredictionIllustrationDark.png");

function GuestHero() {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text
          style={[
            styles.titleLine1,
            {
              color: isDark ? "#F3EDF1" : "#1E1730",
            },
          ]}
        >
          Welcome to
        </Text>

        <Text
          style={[
            styles.titleLine2,
            {
              color: isDark ? "#FF7CA3" : "#F2386A",
            },
          ]}
        >
          Quick Prediction
        </Text>
      </View>

      <Text
        style={[
          styles.subtitle,
          {
            color: isDark ? "#B7ACB8" : "#8D8A99",
          },
        ]}
      >
        Discover your next period, learn about your cycle, and explore trusted
        reproductive health information — no account required.
      </Text>

      <Image
        source={
          isDark
            ? quickPredictionIllustrationDark
            : quickPredictionIllustration
        }
        accessibilityLabel="Calendar and cycle illustration"
        resizeMode="contain"
        style={styles.illustration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 12,
  },

  titleWrap: {
    alignItems: "center",
    marginBottom: 10,
  },

  titleLine1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "400",
  },

  titleLine2: {
    marginTop: 2,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },

  subtitle: {
    width: "92%",
    maxWidth: 330,
    textAlign: "center",
    fontSize: 14.5,
    lineHeight: 23,
    marginBottom: 18,
  },

  illustration: {
    width: "100%",
    maxWidth: 300,
    height: 170,
  },
});

export default GuestHero;