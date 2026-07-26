import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { MoreFeature } from "@/constants/guestLandingData";
import { useTheme } from "@/contexts/ThemeContext";

type GuestFeatureItemProps = {
  feature: MoreFeature;
};

function GuestFeatureItem({ feature }: GuestFeatureItemProps) {
  const { isDark } = useTheme();
  const { t } = useTranslation("guest");
  const Icon = feature.icon;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDark ? "#3A2430" : "#FCE7EF",
          },
        ]}
      >
        <Icon size={15} color={isDark ? "#FF7CA3" : "#F2386A"} />
      </View>

      <Text
        style={[
          styles.label,
          {
            color: isDark ? "#F3EDF1" : "#1E1730",
          },
        ]}
        numberOfLines={2}
      >
        {t(feature.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    height: 32,
    width: 32,
    flexShrink: 0,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 10,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "500",
  },
});

export default GuestFeatureItem;