import {
  ChevronRight,
  FileText,
  Mail,
  UserRound,
} from "lucide-react-native";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";
import type {
  EmailUpdateResponse,
  UserProfileSummary,
} from "@/types/profile";

type ProfileSummaryCardProps = {
  profile: UserProfileSummary;
  theme: GuestThemeColors;
  savingEmail: boolean;
  onAddOrResendEmail: (
    email: string
  ) => Promise<EmailUpdateResponse>;
  onEmailPress: () => void;
  onTermsPress: () => void;
};

function ProfileSummaryCard({
  profile,
  theme,
  savingEmail,
  onAddOrResendEmail,
  onEmailPress,
  onTermsPress,
}: ProfileSummaryCardProps) {
  const nickname =
    profile.nickname.trim() || "Syncate user";
  const hasEmail =
    Boolean(profile.email.trim());

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <Text
        style={[
          styles.cardTitle,
          { color: theme.text },
        ]}
      >
        User profile
      </Text>

      <View style={styles.identityRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primarySoft },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: theme.primary },
            ]}
          >
            {nickname.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text
            numberOfLines={1}
            style={[
              styles.nickname,
              { color: theme.text },
            ]}
          >
            {nickname}
          </Text>
          <Text
            style={[
              styles.identityHint,
              { color: theme.muted },
            ]}
          >
            Your Syncate profile
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: theme.border },
        ]}
      />

      <View style={styles.detailRow}>
        <View
          style={[
            styles.rowIcon,
            { backgroundColor: theme.primarySoft },
          ]}
        >
          <UserRound size={18} color={theme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text
            style={[
              styles.rowLabel,
              { color: theme.muted },
            ]}
          >
            Nickname
          </Text>
          <Text
            style={[
              styles.rowValue,
              { color: theme.text },
            ]}
          >
            {nickname}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.rowDivider,
          { backgroundColor: theme.border },
        ]}
      />

      <View style={styles.detailRow}>
        <Pressable
          onPress={onEmailPress}
          accessibilityRole="button"
          accessibilityLabel={
            hasEmail
              ? "Edit email address"
              : "Add email address"
          }
          style={({ pressed }) => [
            styles.emailInfoPressable,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.rowIcon,
              { backgroundColor: theme.primarySoft },
            ]}
          >
            <Mail size={18} color={theme.primary} />
          </View>
          <View style={styles.rowText}>
            <Text
              style={[
                styles.rowLabel,
                { color: theme.muted },
              ]}
            >
              Email
            </Text>
            {hasEmail ? (
              <>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowValue,
                    { color: theme.text },
                  ]}
                >
                  {profile.email}
                </Text>
                <View style={styles.emailStatusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          profile.is_email_verified
                            ? "#3FA66A"
                            : theme.primary,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: theme.muted },
                    ]}
                  >
                    {profile.is_email_verified
                      ? "Verified"
                      : "Verification pending"}
                  </Text>
                </View>
              </>
            ) : (
              <Text
                style={[
                  styles.emptyValue,
                  { color: theme.muted },
                ]}
              >
                Add email address
              </Text>
            )}
          </View>
          <ChevronRight
            size={17}
            color={theme.muted}
            opacity={0.45}
          />
        </Pressable>

        {hasEmail && !profile.is_email_verified ? (
          <Pressable
            onPress={() => {
              void onAddOrResendEmail(profile.email).catch(
                (error) => {
                  Alert.alert(
                    "Couldn't send verification",
                    error instanceof Error
                      ? error.message
                      : "Please try again."
                  );
                }
              );
            }}
            disabled={savingEmail}
            accessibilityRole="button"
            accessibilityLabel="Resend verification email"
            style={styles.resendButton}
          >
            <Text
              style={[
                styles.resendText,
                { color: theme.primary },
              ]}
            >
              {savingEmail ? "Sending..." : "Resend"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        style={[
          styles.rowDivider,
          { backgroundColor: theme.border },
        ]}
      />

      <Pressable
        onPress={onTermsPress}
        accessibilityRole="button"
        accessibilityLabel="View Terms and Conditions"
        style={({ pressed }) => [
          styles.detailRow,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.rowIcon,
            { backgroundColor: theme.primarySoft },
          ]}
        >
          <FileText size={18} color={theme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text
            style={[
              styles.rowValue,
              { color: theme.text },
            ]}
          >
            Terms & Conditions
          </Text>
          <Text
            style={[
              styles.rowHint,
              { color: theme.muted },
            ]}
          >
            Read the terms for your Syncate account
          </Text>
        </View>
        <ChevronRight
          size={19}
          color={theme.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 17,
    fontWeight: "700",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
  },
  identityText: {
    flex: 1,
    marginLeft: 13,
  },
  nickname: {
    fontSize: 19,
    fontWeight: "700",
  },
  identityHint: {
    marginTop: 3,
    fontSize: 12.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
    marginVertical: 4,
  },
  detailRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },
  emailInfoPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  rowValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
  },
  rowHint: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
  },
  emptyValue: {
    marginTop: 2,
    fontSize: 13,
  },
  emailStatusRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  resendButton: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  resendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
});

export default ProfileSummaryCard;
