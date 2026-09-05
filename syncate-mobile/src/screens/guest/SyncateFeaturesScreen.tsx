import {
  type Href,
  router,
} from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";

const SIGNUP_ROUTE =
  "/signup" as Href;

type FeatureItem = {
  title: string;
  description: string;
  icon: typeof CalendarDays;
};

const features: FeatureItem[] = [
  {
    title: "Save your cycle history",
    description:
      "Keep your period dates and cycle information safely available whenever you return.",
    icon: CalendarDays,
  },
  {
    title: "Track symptoms and moods",
    description:
      "Record changes in pain, energy, mood, flow and other daily symptoms.",
    icon: HeartPulse,
  },
  {
    title: "Personalized insights",
    description:
      "Receive cycle information based on the dates and details you log over time.",
    icon: Sparkles,
  },
  {
    title: "Helpful reminders",
    description:
      "Stay prepared with future period, medication and wellness reminders.",
    icon: Bell,
  },
];

function SyncateFeaturesScreen() {
  const { isDark, colors: theme } = useTheme();

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
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
              pressed &&
                styles.pressed,
            ]}
          >
            <ArrowLeft
              size={20}
              strokeWidth={2}
              color={theme.text}
            />
          </Pressable>

          <Text
            style={[
              styles.topBarTitle,
              {
                color: theme.text,
              },
            ]}
          >
            More with Syncate
          </Text>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.hero}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              Make Syncate yours
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Guest prediction gives you a quick estimate. Creating an account lets Syncate remember your information and support you throughout your cycle.
            </Text>
          </View>

          <View style={styles.featureList}>
            {features.map(
              ({
                title,
                description,
                icon: Icon,
              }) => (
                <View
                  key={title}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor:
                        theme.card,
                      borderColor:
                        theme.border,
                      shadowColor:
                        theme.shadow,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIcon,
                      {
                        backgroundColor:
                          theme.primarySoft,
                      },
                    ]}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.9}
                      color={
                        theme.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.featureText
                    }
                  >
                    <Text
                      style={[
                        styles.featureTitle,
                        {
                          color:
                            theme.text,
                        },
                      ]}
                    >
                      {title}
                    </Text>

                    <Text
                      style={[
                        styles.featureDescription,
                        {
                          color:
                            theme.muted,
                        },
                      ]}
                    >
                      {description}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>

          <View
            style={[
              styles.privacyCard,
              {
                backgroundColor:
                  theme.primarySoft,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <ShieldCheck
              size={24}
              strokeWidth={1.9}
              color={theme.primary}
            />

            <View
              style={styles.privacyText}
            >
              <Text
                style={[
                  styles.privacyTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Your information stays personal
              </Text>

              <Text
                style={[
                  styles.privacyDescription,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                Your health information is linked only to your account and is used to provide your tracking experience.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              router.push(
                SIGNUP_ROUTE
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Create a free account"
            style={({ pressed }) => [
              styles.signupButton,
              {
                backgroundColor:
                  theme.primaryButton,
                shadowColor:
                  theme.shadow,
              },
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.signupButtonText
              }
            >
              Create Free Account
            </Text>

            <ArrowRight
              size={19}
              strokeWidth={2.2}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={[
              styles.footerText,
              {
                color: theme.muted,
              },
            ]}
          >
            You can continue using guest prediction without creating an account.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    page: {
      flex: 1,
      width: "100%",
      maxWidth: 430,
      alignSelf: "center",
    },

    topBar: {
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    topBarTitle: {
      fontSize: 16,
      fontWeight: "700",
    },

    spacer: {
      width: 40,
      height: 40,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },

    hero: {
      alignItems: "center",
      paddingTop: 8,
      marginBottom: 26,
    },



    title: {
      textAlign: "center",
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "800",
      marginBottom: 10,
    },

    subtitle: {
      maxWidth: 355,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
    },

    featureList: {
      gap: 12,
    },

    featureCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },

    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    featureText: {
      flex: 1,
      paddingTop: 1,
    },

    featureTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      marginBottom: 4,
    },

    featureDescription: {
      fontSize: 13,
      lineHeight: 19,
    },

    privacyCard: {
      marginTop: 18,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
    },

    privacyText: {
      flex: 1,
      marginLeft: 12,
    },

    privacyTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: 4,
    },

    privacyDescription: {
      fontSize: 12,
      lineHeight: 18,
    },

    signupButton: {
      minHeight: 54,
      marginTop: 24,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 4,
    },

    signupButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    footerText: {
      marginTop: 14,
      paddingHorizontal: 12,
      textAlign: "center",
      fontSize: 11,
      lineHeight: 17,
    },

    pressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });

export default SyncateFeaturesScreen;
