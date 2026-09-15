// LOCATION: syncate-mobile/src/components/common/SyncateLogo.tsx
//
// Reusable official Syncate branding.
// The logo stays pink even when the user changes the app accent theme.

import {
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
} from "react-native";

type LogoVariant = "header" | "full" | "mark";

type SyncateLogoProps = {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

const SOURCES = {
  header: require("../../../assets/branding/syncate-logo-header.png"),
  full: require("../../../assets/branding/syncate-logo-full.png"),
  mark: require("../../../assets/branding/syncate-logo-mark.png"),
} as const;

const DEFAULT_SIZE: Record<
  LogoVariant,
  { width: number; height: number }
> = {
  header: {
    width: 108,
    height: 35,
  },
  full: {
    width: 220,
    height: 226,
  },
  mark: {
    width: 42,
    height: 36,
  },
};

export default function SyncateLogo({
  variant = "header",
  width,
  height,
  style,
}: SyncateLogoProps) {
  const defaults = DEFAULT_SIZE[variant];

  return (
    <Image
      source={SOURCES[variant]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Syncate"
      style={[
        styles.image,
        {
          width: width ?? defaults.width,
          height: height ?? defaults.height,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flexShrink: 0,
  },
});
