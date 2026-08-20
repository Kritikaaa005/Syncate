import {
  type Href,
  router,
} from "expo-router";
import {
  ChevronRight,
  Settings,
  UserRound,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

const ACCOUNT_ROUTE =
  "/dashboard/profile/account" as Href;

const SETTINGS_ROUTE =
  "/dashboard/profile/settings" as Href;

type StatItem = {
  value: string;
  label: string;
};

const STATS: StatItem[] = [
  {
    value: "0",
    label: "Ads shown",
  },
  {
    value: "256-bit",
    label: "Encryption",
  },
  {
    value: "1-tap",
    label: "Delete anytime",
  },
];

function RegisteredProfileScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.headerBlock}>
          <View
            style={[
              styles.headerIconOuter,
              {
                backgroundColor:
                  theme.primarySoft,
              },
            ]}
          >
            <View
              style={[
                styles.headerIconInner,
                {
                  backgroundColor:
                    theme.primaryButton,
                },
              ]}
            >
              <UserRound
                size={26}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Profile
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Your account and preferences
          </Text>
        </View>

        <Text
          style={[
            styles.sectionLabel,
            { color: theme.muted },
          ]}
        >
          Manage
        </Text>

        <View
          style={[
            styles.navCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Pressable
            onPress={() =>
              router.push(ACCOUNT_ROUTE)
            }
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            style={({ pressed }) => [
              styles.navRow,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.navIcon,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <UserRound
                size={24}
                color={theme.primary}
              />
            </View>

            <View style={styles.navText}>
              <Text
                style={[
                  styles.navLabel,
                  { color: theme.text },
                ]}
              >
                User profile
              </Text>
              <Text
                style={[
                  styles.navHint,
                  { color: theme.muted },
                ]}
              >
                Nickname, email &amp; terms
              </Text>
            </View>

            <ChevronRight
              size={20}
              color={theme.muted}
            />
          </Pressable>

          <View
            style={[
              styles.navDivider,
              { backgroundColor: theme.border },
            ]}
          />

          <Pressable
            onPress={() =>
              router.push(SETTINGS_ROUTE)
            }
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={({ pressed }) => [
              styles.navRow,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.navIcon,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <Settings
                size={24}
                color={theme.primary}
              />
            </View>

            <View style={styles.navText}>
              <Text
                style={[
                  styles.navLabel,
                  { color: theme.text },
                ]}
              >
                Settings
              </Text>
              <Text
                style={[
                  styles.navHint,
                  { color: theme.muted },
                ]}
              >
                Goals, notifications &amp; more
              </Text>
            </View>

            <ChevronRight
              size={20}
              color={theme.muted}
            />
          </Pressable>
        </View>

        <Text
          style={[
            styles.sectionLabel,
            { color: theme.muted },
          ]}
        >
          Why people trust Syncate
        </Text>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text
            style={[
              styles.statsHeading,
              { color: theme.text },
            ]}
          >
            Your data, by the numbers
          </Text>
          <Text
            style={[
              styles.statsBody,
              { color: theme.muted },
            ]}
          >
            Syncate only collects what your cycle
            tracking actually needs — nothing gets
            shared, sold, or shown to advertisers.
          </Text>

          <View style={styles.statsRow}>
            {STATS.map((stat, index) => (
              <View
                key={stat.label}
                style={styles.statItem}
              >
                {index > 0 ? (
                  <View
                    style={[
                      styles.statDivider,
                      {
                        backgroundColor:
                          theme.border,
                      },
                    ]}
                  />
                ) : null}

                <Text
                  style={[
                    styles.statValue,
                    { color: theme.primary },
                  ]}
                >
                  {stat.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.muted },
                  ]}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <RegisteredBottomNav
        activeItem="profile"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 124,
  },

  headerBlock: {
    marginBottom: 26,
    alignItems: "center",
  },

  headerIconOuter: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  headerIconInner: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 18,
  },

  sectionLabel: {
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 12.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  navCard: {
    marginBottom: 26,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },

  navRow: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
  },

  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    flex: 1,
    marginLeft: 15,
  },

  navLabel: {
    fontSize: 17.5,
    fontWeight: "700",
  },

  navHint: {
    marginTop: 3,
    fontSize: 12.5,
  },

  navDivider: {
    height: StyleSheet.hairlineWidth,
  },

  statsCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },

  statsHeading: {
    fontSize: 16.5,
    fontWeight: "700",
  },

  statsBody: {
    marginTop: 6,
    fontSize: 12.5,
    lineHeight: 19,
  },

  statsRow: {
    marginTop: 18,
    flexDirection: "row",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statDivider: {
    position: "absolute",
    left: 0,
    top: 4,
    bottom: 4,
    width: StyleSheet.hairlineWidth,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "800",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 10.5,
    fontWeight: "600",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.72,
  },
});

export default RegisteredProfileScreen;