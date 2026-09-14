import {
  type Href,
  router,
} from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard";
import { useTheme } from "@/contexts/ThemeContext";
import useUserProfile from "@/hooks/useUserProfile";

const TERMS_ROUTE =
  "/dashboard/profile/terms" as Href;

function ProfileAccountScreen() {
  const { colors: theme } = useTheme();

  const {
    profile,
    loading,
    refreshing,
    savingEmail,
    errorMessage,
    reload,
    refresh,
    submitEmail,
  } = useUserProfile();

  const handleAddOrResendEmail = async (
    email: string
  ) => {
    const result = await submitEmail(email);

    Alert.alert(
      result.email_verification_sent
        ? "Check your email"
        : "Email saved",
      result.email_verification_sent
        ? "We sent you a verification link. Open it to verify this email for your Syncate account."
        : result.message
    );

    return result;
  };

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
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft
            size={20}
            color={theme.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            User profile
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            Nickname, email &amp; terms
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh();
            }}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {loading && !profile ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator
              size="large"
              color={theme.primary}
            />
          </View>
        ) : errorMessage && !profile ? (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.errorTitle,
                { color: theme.text },
              ]}
            >
              Couldn't load your profile
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: theme.muted },
              ]}
            >
              {errorMessage}
            </Text>
            <Pressable
              onPress={() => {
                void reload();
              }}
              accessibilityRole="button"
              style={[
                styles.retryButton,
                {
                  backgroundColor:
                    theme.primaryButton,
                },
              ]}
            >
              <Text style={styles.retryText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : profile ? (
          <ProfileSummaryCard
            profile={profile}
            theme={theme}
            savingEmail={savingEmail}
            onAddOrResendEmail={
              handleAddOrResendEmail
            }
            onTermsPress={() =>
              router.push(TERMS_ROUTE)
            }
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  statusWrap: {
    paddingVertical: 80,
    alignItems: "center",
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  errorMessage: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.72,
  },
});

export default ProfileAccountScreen;
