// Destination: components/guest/prediction/PredictionHeader.tsx

import { router } from "expo-router";
import { ArrowLeft, Moon, Sun } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

function PredictionHeader() {
  const { isDark, toggleDark } = useTheme();
  const borderColor = isDark ? "#FFFFFF" : "#F4467A";

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.circleButton,
          { borderColor },
          pressed && styles.pressedScale,
        ]}
      >
        <ArrowLeft size={18} color={isDark ? "#FFFFFF" : "#F2386A"} />
      </Pressable>

      <Pressable
        onPress={toggleDark}
        accessibilityRole="button"
        accessibilityLabel="Toggle dark mode"
        style={({ pressed }) => [
          styles.circleButton,
          { borderColor },
          pressed && styles.pressedScale,
        ]}
      >
        {isDark ? <Sun size={18} color="#FFFFFF" /> : <Moon size={18} color="#F2386A" />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
});

export default PredictionHeader;
