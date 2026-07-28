// Destination: components/guest/education/educationData.tsx
// SVG illustrations ported 1:1 (same paths/shapes) from
// src/pages/guest/education/educationData.tsx, using react-native-svg
// instead of raw <svg> DOM elements.

import type { JSX } from "react";
import { Circle, Ellipse, G, Path, Rect, Svg } from "react-native-svg";

export type IllustrationProps = { primary: string; soft: string };

function CycleIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(6,16) scale(1.15)">
        <G transform="translate(38,20)">
          <Path d="M8 -6q0 -6 5 -6t5 6" stroke={primary} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Path d="M28 -6q0 -6 5 -6t5 6" stroke={primary} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Rect x="0" y="0" width="46" height="54" rx="8" fill="#FFFFFF" stroke={primary} strokeWidth="2" />
          <Rect x="0" y="0" width="46" height="14" rx="8" fill={primary} />
          <Path
            d="M23 26c0-2 3-2.5 3.5 0 0.5-2.5 3.5-2 3.5 0 0 3-3.5 4-3.5 6-0-2-3.5-3-3.5-6z"
            fill={primary}
          />
        </G>
      </G>
    </Svg>
  );
}

function UterusIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(6,20) scale(1.15)">
        <G transform="translate(38,28)">
          <Path d="M8 20C0 20 -6 14 -6 6" stroke={primary} strokeWidth="4" fill="none" strokeLinecap="round" />
          <Circle cx="-6" cy="4" r="4" fill={primary} />
          <Path d="M36 20c8 0 14 -6 14 -14" stroke={primary} strokeWidth="4" fill="none" strokeLinecap="round" />
          <Circle cx="50" cy="4" r="4" fill={primary} />
          <Path
            d="M22 8c-9 0-16 6-16 14 0 8 6 13 11 18 2 2 4 5 5 8 1-3 3-6 5-8 5-5 11-10 11-18 0-8-7-14-16-14z"
            fill={primary}
          />
        </G>
      </G>
    </Svg>
  );
}

function PeriodCareIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(4,14) scale(1.12)">
        <Rect
          x="28"
          y="30"
          width="20"
          height="42"
          rx="10"
          fill="#FFFFFF"
          stroke={primary}
          strokeWidth="2"
          transform="rotate(-8 38 51)"
        />
        <G transform="translate(58,26)">
          <Rect x="0" y="4" width="34" height="40" rx="6" fill="#FFFFFF" stroke={primary} strokeWidth="2" />
          <Path d="M6 -2q0 -5 4 -5t4 5" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path d="M20 -2q0 -5 4 -5t4 5" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round" />
          <Path
            d="M10 20c0-2 2.4-2.4 3-0.5 0.6-1.9 3-1.5 3 0.5 0 2.4-3 3.4-3 5-0-1.6-3-2.6-3-5z"
            fill={primary}
          />
          <Path
            d="M18 30c0-2 2.4-2.4 3-0.5 0.6-1.9 3-1.5 3 0.5 0 2.4-3 3.4-3 5-0-1.6-3-2.6-3-5z"
            fill={primary}
          />
        </G>
      </G>
    </Svg>
  );
}

function NutritionIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(-4,10) scale(1.1)">
        <Ellipse cx="60" cy="60" rx="26" ry="14" fill={primary} opacity="0.25" />
        <Path d="M40 40c0-8 8-14 20-14s20 6 20 14-9 12-20 12-20-4-20-12z" fill="#B7D99A" />
        <Circle cx="34" cy="52" r="10" fill="#8FBF6A" />
        <Path d="M34 42c2-3 5-3 6 0" stroke="#5E8A3E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Rect x="78" y="40" width="14" height="20" rx="3" fill="#8B5A3C" />
        <Rect x="78" y="46" width="14" height="2" fill="#6E4429" />
        <Rect x="78" y="52" width="14" height="2" fill="#6E4429" />
        <Path d="M64 66c4-14 10-20 16-22-2 8-2 16 2 22-6 4-14 4-18 0z" fill="#F6D34A" />
      </G>
    </Svg>
  );
}

function StressIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(0,6) scale(1.1)">
        <Circle cx="60" cy="34" r="10" fill={primary} />
        <Path
          d="M42 74c0-14 8-22 18-22s18 8 18 22c-6 4-30 4-36 0z"
          fill={primary}
          opacity="0.85"
        />
        <Path d="M30 66c4-4 8-4 10 0" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
        <Path d="M80 66c-4-4-8-4-10 0" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      </G>
    </Svg>
  );
}

function HydrationIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(4,14) scale(1.1)">
        <G transform="translate(38,24)">
          <Rect x="0" y="10" width="18" height="34" rx="6" fill={primary} opacity="0.85" />
          <Rect x="4" y="0" width="10" height="10" rx="3" fill={primary} />
        </G>
        <G transform="translate(62,30)">
          <Path d="M0 6 L18 6 L15 40 A7 7 0 0 1 3 40 Z" fill="#FFFFFF" stroke={primary} strokeWidth="2" />
          <Rect x="0" y="20" width="18" height="16" fill="#D9CBFA" opacity="0.7" />
        </G>
        <Path
          d="M55 18c0-3 3.6-3.6 4.5-0.8 0.9-2.8 4.5-2.2 4.5 0.8 0 3.6-4.5 5-4.5 7.5-0-2.5-4.5-3.9-4.5-7.5z"
          fill={primary}
          opacity="0.7"
        />
      </G>
    </Svg>
  );
}

function SleepIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(0,8) scale(1.1)">
        <Path
          d="M70 30c-12 0-22 10-22 22s10 22 22 22c8 0 15-4 19-11-3 1-6 2-10 2-12 0-22-10-22-22 0-7 3-13 8-17-1-0-3-0-5-0z"
          fill={primary}
        />
        <Path d="M40 32 l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={primary} opacity="0.7" />
        <Path d="M32 50 l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill={primary} opacity="0.6" />
        <Ellipse cx="42" cy="72" rx="16" ry="6" fill={primary} opacity="0.25" />
        <Ellipse cx="60" cy="76" rx="12" ry="5" fill={primary} opacity="0.2" />
      </G>
    </Svg>
  );
}

function TrackingIllustration({ primary, soft }: IllustrationProps) {
  return (
    <Svg viewBox="0 0 120 120" width="100%" height="100%">
      <Rect x="0" y="0" width="120" height="120" rx="20" fill={soft} />
      <G transform="translate(0,10) scale(1.1)">
        <G transform="translate(30,30)">
          <Path d="M0 4c0-2 2-4 4-4h22v40H4c-2 0-4-2-4-4z" fill="#FFFFFF" stroke={primary} strokeWidth="2" />
          <Path d="M60 4c0-2-2-4-4-4H34v40h22c2 0 4-2 4-4z" fill="#FFFFFF" stroke={primary} strokeWidth="2" />
          <Path
            d="M30 26c0-2 2.4-2.4 3-0.5 0.6-1.9 3-1.5 3 0.5 0 2.4-3 3.4-3 5-0-1.6-3-2.6-3-5z"
            fill={primary}
          />
          <Path d="M50 -6l3 20" stroke={primary} strokeWidth="2.5" strokeLinecap="round" />
        </G>
      </G>
    </Svg>
  );
}

export type Topic = {
  id: string;
  title: string;
  description: string;
  Illustration: (props: IllustrationProps) => JSX.Element;
};

export const TOPICS: Topic[] = [
  {
    id: "understanding-cycle",
    title: "Understanding Your Menstrual Cycle",
    description: "Explore the different phases of your cycle.",
    Illustration: CycleIllustration,
  },
  {
    id: "ovulation",
    title: "Ovulation: What Happens?",
    description: "Learn about ovulation and your fertile window.",
    Illustration: UterusIllustration,
  },
  {
    id: "period-care",
    title: "Period Care Essentials",
    description: "Tips for a comfortable and healthy period.",
    Illustration: PeriodCareIllustration,
  },
  {
    id: "nutrition",
    title: "Nutrition for Hormone Balance",
    description: "Foods that support your hormones and mood.",
    Illustration: NutritionIllustration,
  },
  {
    id: "stress",
    title: "Managing Stress and Mood",
    description: "Simple ways to reduce stress and feel your best.",
    Illustration: StressIllustration,
  },
  {
    id: "hydration",
    title: "Hydration and Your Cycle",
    description: "Why staying hydrated matters every day.",
    Illustration: HydrationIllustration,
  },
  {
    id: "sleep",
    title: "Sleep and Hormones",
    description: "How good sleep supports your cycle and energy.",
    Illustration: SleepIllustration,
  },
  {
    id: "tracking",
    title: "Tracking Your Cycle: Why It Helps",
    description: "Benefits of tracking and understanding patterns.",
    Illustration: TrackingIllustration,
  },
];
