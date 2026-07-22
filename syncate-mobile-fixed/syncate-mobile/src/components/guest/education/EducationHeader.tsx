import { router } from "expo-router";
import { ArrowLeft, Moon, Sun } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  primary: string;
  primarySoft: string;
};

function EducationHeader({ primary, primarySoft }: Props) {
  const { isDark, toggleDark } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
onPress={() => router.back()}
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: primarySoft },
          pressed && styles.pressedScale,
        ]}
      >
        <ArrowLeft size={20} color={primary} />
      </Pressable>

      <Text
        style={[
          styles.title,
          {
            color: isDark ? "#F3EDF1" : "#1E1730",
          },
        ]}
      >
        Educational Content
      </Text>

      <Pressable
        onPress={toggleDark}
        accessibilityLabel="Toggle dark mode"
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: primarySoft },
          pressed && styles.pressedScale,
        ]}
      >
        {isDark ? (
          <Sun size={18} color={primary} />
        ) : (
          <Moon size={18} color={primary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    height: 44,
    width: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  pressedScale: {
    transform: [{ scale: 0.95 }],
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "600",
    marginHorizontal: 12,
  },
});

export default EducationHeader;