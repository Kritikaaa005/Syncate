import React from "react";
import { StyleSheet, Text, View } from "react-native";

import SyncateLogoMark from "@/components/common/SyncateLogoMark";
import { guestTheme } from "@/constants/guestTheme";

const colors = guestTheme.mode.light;

export default function SplashScreen() {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.markWrapper}>
        <SyncateLogoMark
          size={180}
          primaryColor={colors.primary}
          accentColor={colors.primarySoft}
          animated={true}
        />
      </View>

      <Text style={[styles.wordmark, { color: colors.text }]}>Syncate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  markWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "serif",
    letterSpacing: 0.5,
  },
});