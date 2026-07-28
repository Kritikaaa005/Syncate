import React, { useEffect } from "react";
import Svg, { Path, Circle, G } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type SyncateLogoMarkProps = {
  size?: number;
  primaryColor: string;
  accentColor: string;
  animated?: boolean;
};

/** Shared hook for vertical sway (wave breathing) */
function useWaveSway(amplitude: number, duration: number, delay: number) {
  const value = useSharedValue(0);

  useEffect(() => {
    if (amplitude === 0) {
      value.value = 0;
      return;
    }
    const swing = { duration, easing: Easing.inOut(Easing.sin) };
    value.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(amplitude, swing), withTiming(-amplitude, swing)),
        -1,
        true
      )
    );
  }, [amplitude, duration, delay, value]);

  return value;
}

export default function SyncateLogoMark({
  size = 140,
  primaryColor,
  accentColor,
  animated = true,
}: SyncateLogoMarkProps) {
  // Vertical sway for opposing wave strands
  const topY = useWaveSway(animated ? 4 : 0, 1400, 0);
  const bottomY = useWaveSway(animated ? -4 : 0, 1400, 200);

  const topProps = useAnimatedProps(() => ({
    transform: [{ translateY: topY.value }],
  }));

  const bottomProps = useAnimatedProps(() => ({
    transform: [{ translateY: bottomY.value }],
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Soft Pink Background Glow Circle */}
      <Circle cx={100} cy={100} r={75} fill={accentColor} opacity={0.7} />

      <G>
        {/* Wave 1 (Bows UP in the middle) */}
        <AnimatedPath
          d="M 25 100
             C 55 60, 85 60, 100 100
             C 115 140, 145 140, 175 100"
          stroke={primaryColor}
          strokeWidth={4.5}
          strokeLinecap="round"
          fill="none"
          animatedProps={topProps}
        />

        {/* Wave 2 (Bows DOWN in the middle - opposing crests) */}
        <AnimatedPath
          d="M 25 100
             C 55 140, 85 140, 100 100
             C 115 60, 145 60, 175 100"
          stroke={primaryColor}
          strokeWidth={4.5}
          strokeLinecap="round"
          fill="none"
          animatedProps={bottomProps}
        />
      </G>
    </Svg>
  );
}
