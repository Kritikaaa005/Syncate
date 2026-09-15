// LOCATION: syncate-mobile/src/components/common/SyncateLogoMark.tsx
//
// Compatibility wrapper for older screens that already use SyncateLogoMark.
// The primary/accent props are intentionally retained so existing imports do
// not break, but the official logo itself now keeps its own brand pink.

import {
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import {
  useEffect,
  useRef,
} from "react";

import SyncateLogo from "@/components/common/SyncateLogo";

type SyncateLogoMarkProps = {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  animated?: boolean;
};

export default function SyncateLogoMark({
  size = 48,
  animated = false,
}: SyncateLogoMarkProps) {
  const opacity = useRef(
    new Animated.Value(animated ? 0 : 1)
  ).current;

  const scale = useRef(
    new Animated.Value(animated ? 0.92 : 1)
  ).current;

  useEffect(() => {
    if (!animated) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <SyncateLogo
        variant="mark"
        width={size}
        height={size}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
