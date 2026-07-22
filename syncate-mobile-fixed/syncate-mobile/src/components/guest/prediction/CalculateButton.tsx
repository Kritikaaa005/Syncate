// Destination: components/guest/prediction/CalculateButton.tsx

import { Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

type CalculateButtonProps = {
  onPress: () => void;
};

function CalculateButton({ onPress }: CalculateButtonProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: isDark ? "#FF6F98" : "#F4467A" },
          pressed && styles.pressedScale,
        ]}
      >
        <Text style={styles.buttonText}>Calculate My Predictions</Text>
        <Sparkles size={13} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
    shadowColor: "#F4467A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default CalculateButton;
