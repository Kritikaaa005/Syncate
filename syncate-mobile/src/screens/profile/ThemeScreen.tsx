import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { accentThemeIds, accentThemes } from "@/constants/accentThemes";
import { useTheme } from "@/contexts/ThemeContext";

function ThemeScreen() {
  const { colors, accentThemeId, setAccentTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={({ pressed }) => [styles.back, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.text }]}>Theme</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Choose an accent that feels like you.</Text>
          <View style={styles.options}>
            {accentThemeIds.map((id) => {
              const option = accentThemes[id];
              const selected = id === accentThemeId;
              return (
                <Pressable key={id} onPress={() => setAccentTheme(id)} accessibilityRole="radio" accessibilityState={{ selected }} style={({ pressed }) => [styles.option, { backgroundColor: selected ? colors.primarySoft : colors.card, borderColor: selected ? colors.primary : colors.border }, selected && styles.selected, pressed && styles.pressed]}>
                  <View style={[styles.check, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : "transparent" }]}>{selected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}</View>
                  <Text style={[styles.name, { color: colors.text }]}>{option.name}</Text>
                  <View style={styles.swatches} accessibilityLabel={`${option.name} color preview`}>
                    <View style={[styles.swatch, { backgroundColor: option.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: option.secondary }]} />
                    <View style={[styles.swatch, styles.softSwatch, { backgroundColor: option.soft, borderColor: colors.border }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, page: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center" },
  topBar: { minHeight: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" }, topTitle: { fontSize: 16, fontWeight: "700" }, spacer: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 36 }, title: { maxWidth: 310, alignSelf: "center", textAlign: "center", fontSize: 25, lineHeight: 33, fontWeight: "800", marginBottom: 30 }, options: { gap: 13 }, option: { minHeight: 76, borderRadius: 21, borderWidth: 1.5, paddingHorizontal: 17, flexDirection: "row", alignItems: "center" }, selected: { borderWidth: 2 }, check: { width: 25, height: 25, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginRight: 13 }, name: { flex: 1, fontSize: 16, fontWeight: "700" }, swatches: { flexDirection: "row", gap: 7 }, swatch: { width: 22, height: 22, borderRadius: 11 }, softSwatch: { borderWidth: 1 }, pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
});

export default ThemeScreen;
