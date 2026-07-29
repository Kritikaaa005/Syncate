import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
} from "react-native-svg";

type CycleProgressRingProps = {
  cycleDay: number;
  cycleLength: number;
  primaryColor: string;
  trackColor: string;
  textColor: string;
  mutedColor: string;
};

function CycleProgressRing({
  cycleDay,
  cycleLength,
  primaryColor,
  trackColor,
  textColor,
  mutedColor,
}: CycleProgressRingProps) {
  const size = 104;
  const strokeWidth = 8;

  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  const safeCycleLength =
    Math.max(cycleLength, 1);

  const progress = Math.min(
    Math.max(
      cycleDay / safeCycleLength,
      0
    ),
    1
  );

  const strokeDashoffset =
    circumference * (1 - progress);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg
        width={size}
        height={size}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={
            strokeDashoffset
          }
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.content}>
        <Text
          style={[
            styles.day,
            {
              color: textColor,
            },
          ]}
        >
          {cycleDay}
        </Text>

        <Text
          style={[
            styles.caption,
            {
              color: mutedColor,
            },
          ]}
        >
          of {cycleLength}
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      position: "relative",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },

    day: {
      fontSize: 25,
      lineHeight: 29,
      fontWeight: "700",
    },

    caption: {
      marginTop: -1,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: "500",
    },
  });

export default CycleProgressRing;