import {
  Bell,
  CalendarClock,
  ChevronRight,
  KeyRound,
  Languages,
  Palette,
  Settings,
  Target,
  Trash2,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";

type PlaceholderItem = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  destructive?: boolean;
};

const ITEMS: PlaceholderItem[] = [
  {
    title: "My goal",
    subtitle: "Change your tracking goal",
    icon: Target,
  },
  {
    title: "Notifications",
    subtitle: "Email and push notification preferences",
    icon: Bell,
  },
  {
    title: "Language",
    subtitle: "Change app language",
    icon: Languages,
  },
  {
    title: "Profile theme",
    subtitle: "Change your Syncate theme",
    icon: Palette,
  },
  {
    title: "Change password",
    subtitle: "Add or change your account password",
    icon: KeyRound,
  },
  {
    title: "Change period details",
    subtitle: "Update your cycle and period information",
    icon: CalendarClock,
  },
  {
    title: "Delete account",
    subtitle: "30-day deletion or permanent deletion",
    icon: Trash2,
    destructive: true,
  },
];

type ProfileSettingsCardProps = {
  theme: GuestThemeColors;
};

function ProfileSettingsCard({
  theme,
}: ProfileSettingsCardProps) {
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
      <View style={styles.headingRow}>
        <View
          style={[
            styles.headingIcon,
            {
              backgroundColor:
                theme.primarySoft,
            },
          ]}
        >
          <Settings
            size={18}
            color={theme.primary}
          />
        </View>
        <Text
          style={[
            styles.cardTitle,
            { color: theme.text },
          ]}
        >
          Settings
        </Text>
      </View>

      {ITEMS.map((item, index) => {
        const Icon = item.icon;
        const itemColor = item.destructive
          ? theme.primary
          : theme.text;

        return (
          <View key={item.title}>
            {index > 0 ? (
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.border,
                  },
                ]}
              />
            ) : null}

            <View
              style={styles.itemRow}
              accessibilityLabel={`${item.title}. Coming soon.`}
            >
              <View
                style={[
                  styles.itemIcon,
                  {
                    backgroundColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <Icon
                  size={18}
                  color={theme.primary}
                />
              </View>

              <View style={styles.itemText}>
                <Text
                  style={[
                    styles.itemTitle,
                    { color: itemColor },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    { color: theme.muted },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.soonBadge,
                  {
                    backgroundColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.soonText,
                    { color: theme.primary },
                  ]}
                >
                  Soon
                </Text>
              </View>

              <ChevronRight
                size={17}
                color={theme.muted}
                opacity={0.45}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
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

  headingRow: {
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headingIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },

  itemRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  itemText: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  itemTitle: {
    fontSize: 13.5,
    fontWeight: "600",
  },

  itemSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
  },

  soonBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  soonText: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default ProfileSettingsCard;
