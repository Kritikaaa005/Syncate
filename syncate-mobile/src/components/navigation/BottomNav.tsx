// Destination: components/guest/BottomNav.tsx

import { router, usePathname } from "expo-router";
import { BarChart2, CalendarDays, Home, Sparkles, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  // NOTE: home now lives at "/guest" (was "/" in the original React Router
  // setup) since this screen is nested under the guest route group here.
  // "/guest/calendar", "/guest/insights", "/guest/profile" don't have screens
  // yet in the converted scope — create them to make these tabs functional.
  path: "/guest" | "/guest/calendar" | "/guest/predict" | "/guest/insights" | "/guest/profile";
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home, path: "/guest" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, path: "/guest/calendar" },
  { id: "predict", label: "Predict", icon: Sparkles, path: "/guest/predict" },
  { id: "insights", label: "Insights", icon: BarChart2, path: "/guest/insights" },
  { id: "profile", label: "Profile", icon: User, path: "/guest/profile" },
];

function BottomNav() {
  const pathname = usePathname();
  const { colors: t } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.navRow}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          if (item.id === "predict") {
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.path)}
                style={styles.navItem}
              >
                <View
                  style={[styles.predictBubble, { backgroundColor: t.primaryButton, shadowColor: t.shadow }]}
                >
                  <Icon size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.navLabel, { color: t.primary }]}>{item.label}</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(item.path)}
              style={styles.navItemPadded}
            >
              <Icon size={22} color={isActive ? t.primary : t.muted} />
              <Text
                style={[styles.navLabel, { color: isActive ? t.primary : t.muted }]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  navRow: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navItem: {
    alignItems: "center",
    gap: 4,
  },
  navItemPadded: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  predictBubble: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});

export default BottomNav;
