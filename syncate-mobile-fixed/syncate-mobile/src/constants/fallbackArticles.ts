import type { BackendArticle } from "@/types/article";

export const FALLBACK_ARTICLES: BackendArticle[] = [
  {
    id: "understanding-cycle",
    slug: "understanding-cycle",
    title: "Understanding Your Menstrual Cycle",
    category: "Cycle Basics",
    author: "Syncate Team",
    short_description:
      "Explore the different phases of your cycle.",
    content: [
      "Your menstrual cycle is more than just your period. It includes several phases that work together through hormone changes.",
      "The menstrual phase begins when bleeding starts. This is when the uterus sheds its lining.",
      "The follicular phase supports egg development and usually brings rising energy levels.",
      "Ovulation happens around the middle of the cycle, when an egg is released.",
      "The luteal phase happens after ovulation and may bring mood, appetite, or energy changes.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "ovulation",
    slug: "ovulation",
    title: "Ovulation: What Happens?",
    category: "Fertility",
    author: "Syncate Team",
    short_description:
      "Learn about ovulation and your fertile window.",
    content: [
      "Ovulation is the time when an ovary releases an egg. It usually happens around 14 days before the next period.",
      "The fertile window includes the days before ovulation and the day of ovulation.",
      "Some people notice discharge changes, mild cramps, or higher energy.",
      "Cycle tracking can help estimate ovulation, but predictions are not always exact.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "period-care",
    slug: "period-care",
    title: "Period Care Essentials",
    category: "Period Care",
    author: "Syncate Team",
    short_description:
      "Tips for a comfortable and healthy period.",
    content: [
      "Period care means keeping your body comfortable, clean, hydrated, and supported.",
      "Change pads, tampons, or menstrual cups regularly.",
      "Use heat, rest, and gentle movement for cramps.",
      "Drink water and eat balanced meals during your period.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Nutrition for Hormone Balance",
    category: "Wellness",
    author: "Syncate Team",
    short_description:
      "Foods that support your hormones and mood.",
    content: [
      "Food cannot magically balance hormones, but regular meals and nutrients can support your body.",
      "Iron-rich foods may help during or after bleeding.",
      "Protein and fiber can support energy and mood.",
      "Limiting too much caffeine or sugar may help some people with PMS symptoms.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "stress",
    slug: "stress",
    title: "Managing Stress and Mood",
    category: "Mental Wellness",
    author: "Syncate Team",
    short_description:
      "Simple ways to reduce stress and feel your best.",
    content: [
      "Stress can affect sleep, appetite, mood, and sometimes cycle patterns.",
      "Try breathing exercises, journaling, or short walks.",
      "Rest is also productive when your body feels overwhelmed.",
      "If mood changes feel severe, talking to a professional can help.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "hydration",
    slug: "hydration",
    title: "Hydration and Your Cycle",
    category: "Wellness",
    author: "Syncate Team",
    short_description:
      "Why staying hydrated matters every day.",
    content: [
      "Hydration supports energy, digestion, skin, and comfort throughout the cycle.",
      "Drinking enough water may help with bloating and headaches.",
      "Warm drinks can feel soothing during cramps.",
      "Your needs may increase during hot weather or exercise.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "sleep",
    slug: "sleep",
    title: "Sleep and Hormones",
    category: "Lifestyle",
    author: "Syncate Team",
    short_description:
      "How good sleep supports your cycle and energy.",
    content: [
      "Sleep supports hormone regulation, mood, focus, and recovery.",
      "Hormonal changes can affect sleep before your period.",
      "A calming night routine may help your body relax.",
      "Try reducing screens, caffeine, and heavy meals close to bedtime.",
    ].join("\n\n"),
    cover_image_url: null,
  },
  {
    id: "tracking",
    slug: "tracking",
    title: "Tracking Your Cycle: Why It Helps",
    category: "Tracking",
    author: "Syncate Team",
    short_description:
      "Benefits of tracking and understanding patterns.",
    content: [
      "Tracking helps you notice patterns in your period, symptoms, mood, and energy.",
      "You can better prepare for your period.",
      "You may notice symptoms that repeat each cycle.",
      "Tracking can also help when speaking with a healthcare provider.",
    ].join("\n\n"),
    cover_image_url: null,
  },
];

export function findFallbackArticle(
  slug: string
): BackendArticle | undefined {
  return FALLBACK_ARTICLES.find(
    (article) => article.slug === slug
  );
}