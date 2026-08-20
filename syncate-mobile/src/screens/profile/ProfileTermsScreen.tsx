import {
  ArrowLeft,
  FileText,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LegalDocumentBody from "@/components/common/LegalDocumentBody";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLegalDocument } from "@/hooks/useLegalDocument";

function ProfileTermsScreen() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const {
    document,
    loading,
  } = useLegalDocument(
    "registered_terms"
  );

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
            Terms & Conditions
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.muted },
            ]}
          >
            The terms for your Syncate account
          </Text>
        </View>
      </View>

      {loading && !document ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />
        </View>
      ) : document ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={[
              styles.documentCard,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <View style={styles.documentHeading}>
              <View
                style={[
                  styles.documentIcon,
                  {
                    backgroundColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <FileText
                  size={20}
                  color={theme.primary}
                />
              </View>

              <View style={styles.documentTitleWrap}>
                <Text
                  style={[
                    styles.documentTitle,
                    { color: theme.text },
                  ]}
                >
                  {document.title}
                </Text>

                <Text
                  style={[
                    styles.versionText,
                    { color: theme.muted },
                  ]}
                >
                  Version {document.version}
                  {document.effective_date
                    ? ` • Effective ${document.effective_date}`
                    : ""}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.border,
                },
              ]}
            />

            <LegalDocumentBody
              content={document.content}
              headingColor={theme.text}
              bodyColor={theme.muted}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingWrap}>
          <Text
            style={{ color: theme.muted }}
          >
            Terms are unavailable right now.
          </Text>
        </View>
      )}
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

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  documentCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },

  documentHeading: {
    flexDirection: "row",
    alignItems: "center",
  },

  documentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  documentTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },

  documentTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  versionText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
  },

  pressed: {
    opacity: 0.72,
  },
});

export default ProfileTermsScreen;
