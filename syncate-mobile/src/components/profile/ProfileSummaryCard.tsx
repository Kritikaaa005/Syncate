import {
  ChevronRight,
  FileText,
  Mail,
  PencilLine,
  Plus,
  UserRound,
} from "lucide-react-native";
import {
  useState,
} from "react";
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

import AddEmailForm from "./AddEmailForm";

type ProfileSummaryCardProps = {
  profile: UserProfileSummary;
  theme: GuestThemeColors;
  savingEmail: boolean;
  onAddOrResendEmail: (
    email: string
  ) => Promise<EmailUpdateResponse>;
  onTermsPress: () => void;
};

function ProfileSummaryCard({
  profile,
  theme,
  savingEmail,
  onAddOrResendEmail,
  onTermsPress,
}: ProfileSummaryCardProps) {
  const [editingEmail, setEditingEmail] =
    useState(false);

  const nickname =
    profile.nickname.trim() || "Syncate user";
  const hasEmail =
    Boolean(profile.email.trim());

  const handleEmailSubmit = async (
    email: string
  ) => {
    const result =
      await onAddOrResendEmail(email);

    setEditingEmail(false);

    return result;
  };

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
            {
              backgroundColor:
                theme.primarySoft,
            },
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
            {
              backgroundColor:
                theme.primarySoft,
            },
          ]}
        >
          <UserRound
            size={18}
            color={theme.primary}
          />
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
        <View
          style={[
            styles.rowIcon,
            {
              backgroundColor:
                theme.primarySoft,
            },
          ]}
        >
          <Mail
            size={18}
            color={theme.primary}
          />
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
              No email added
            </Text>
          )}
        </View>

        {!hasEmail ? (
          <Pressable
            onPress={() => setEditingEmail(true)}
            accessibilityRole="button"
            accessibilityLabel="Add email address"
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <Plus size={16} color={theme.primary} />
            <Text style={[styles.addButtonText, { color: theme.primary }]}>Add</Text>
          </Pressable>
        ) : !profile.is_email_verified ? (
          <View style={styles.pendingActions}>
            <Pressable
              onPress={() => setEditingEmail(true)}
              disabled={savingEmail}
              accessibilityRole="button"
              accessibilityLabel="Change unverified email address"
              style={({ pressed }) => [
                styles.smallActionButton,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <PencilLine size={14} color={theme.primary} />
              <Text style={[styles.smallActionText, { color: theme.primary }]}>Change</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                void onAddOrResendEmail(profile.email).catch((error) => {
                  Alert.alert(
                    "Couldn't send verification",
                    error instanceof Error ? error.message : "Please try again."
                  );
                });
              }}
              disabled={savingEmail}
              accessibilityRole="button"
              accessibilityLabel="Resend verification email"
              style={styles.resendButton}
            >
              <Text style={[styles.resendText, { color: theme.primary }]}>
                {savingEmail ? "Sending..." : "Resend"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {editingEmail && (!hasEmail || !profile.is_email_verified) ? (
        <AddEmailForm
          theme={theme}
          submitting={savingEmail}
          initialEmail={hasEmail ? profile.email : ""}
          mode={hasEmail ? "change" : "add"}
          onCancel={() => setEditingEmail(false)}
          onSubmit={async (email) => {
            await handleEmailSubmit(email);
          }}
        />
      ) : null}

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
            {
              backgroundColor:
                theme.primarySoft,
            },
          ]}
        >
          <FileText
            size={18}
            color={theme.primary}
          />
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
    shadowOffset: {
      width: 0,
      height: 7,
    },
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

  addButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  addButtonText: {
    fontSize: 12.5,
    fontWeight: "700",
  },

  pendingActions: {
    alignItems: "flex-end",
    gap: 4,
  },

  smallActionButton: {
    minHeight: 32,
    borderRadius: 10,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  smallActionText: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  resendButton: {
    paddingVertical: 6,
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
