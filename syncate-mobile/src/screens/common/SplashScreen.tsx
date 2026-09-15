// LOCATION: syncate-mobile/src/screens/common/SplashScreen.tsx

import {
  StyleSheet,
  View,
} from "react-native";

import SyncateLogo from "@/components/common/SyncateLogo";
import { useTheme } from "@/contexts/ThemeContext";

export default function SplashScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <SyncateLogo
        variant="full"
        width={218}
        height={224}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
});
