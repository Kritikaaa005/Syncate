import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Droplets,
  FileText,
  Heart,
  HeartPulse,
  Pill,
  Smile,
  Thermometer,
  X,
} from "lucide-react-native";

import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import MiniCalendar from "@/components/guest/prediction/MiniCalendar";

import {
  PERIOD_TRACKING_CATEGORIES,
  type TrackingCategory,
  type TrackingCategoryId,
} from "@/constants/trackingCategories";

import { useTheme } from "@/contexts/ThemeContext";
import { useDailyLog } from "@/hooks/useDailyLog";

import {
  parseDateValue,
  toDateValue,
} from "@/utils/calendarUtils";

type CategoryIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type CategoryAccent = {
  main: string;
  light: string;
  dark: string;
};

const CATEGORY_ICONS: Record<
  TrackingCategoryId,
  CategoryIcon
> = {
  flow: Droplet,
  symptoms: HeartPulse,
  mood: Smile,
  discharge: Droplets,
  sexual_health: Heart,
  medication: Pill,
  lifestyle: Activity,
  fertility: Thermometer,
  notes: FileText,
};

const CATEGORY_ACCENTS: Record<
  TrackingCategoryId,
  CategoryAccent
> = {
  flow: {
    main: "#FF5E8E",
    light: "#FFF0F4",
    dark: "#3D1C28",
  },

  symptoms: {
    main: "#A855F7",
    light: "#F8F0FF",
    dark: "#2E1D3D",
  },

  mood: {
    main: "#3B82F6",
    light: "#EEF6FF",
    dark: "#182B42",
  },

  discharge: {
    main: "#14B8A6",
    light: "#EEFCFA",
    dark: "#153633",
  },

  sexual_health: {
    main: "#EC4899",
    light: "#FDF2F8",
    dark: "#3B182B",
  },

  medication: {
    main: "#6366F1",
    light: "#EEF2FF",
    dark: "#1F2347",
  },

  lifestyle: {
    main: "#F59E0B",
    light: "#FFF8E8",
    dark: "#3D2B14",
  },

  fertility: {
    main: "#10B981",
    light: "#ECFDF5",
    dark: "#13352B",
  },

  notes: {
    main: "#8B5CF6",
    light: "#F5F3FF",
    dark: "#2D2340",
  },
};

function prettifyLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function hasLoggedValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.keys(value).length > 0;
  }

  return false;
}

function getCategorySummary(
  category: TrackingCategory,
  value: unknown
): string {
  if (!hasLoggedValue(value)) {
    return "Not logged";
  }

  if (category.id === "notes") {
    if (typeof value !== "string") {
      return "Notes added";
    }

    const clean = value.trim();

    return clean.length > 36
      ? `${clean.slice(0, 36)}…`
      : clean;
  }

  if (Array.isArray(value)) {
    const ids = value.filter(
      (item): item is string =>
        typeof item === "string"
    );

    const labels = ids.map((id) => {
      const matchingOption =
        category.options?.find(
          (option) => option.id === id
        );

      return matchingOption
        ? prettifyLabel(matchingOption.label)
        : prettifyLabel(id);
    });

    if (labels.length === 1) {
      return labels[0];
    }

    if (labels.length === 2) {
      return `${labels[0]}, ${labels[1]}`;
    }

    return `${labels[0]} + ${
      labels.length - 1
    } more`;
  }

  if (typeof value === "string") {
    const matchingOption =
      category.options?.find(
        (option) => option.id === value
      );

    return matchingOption
      ? prettifyLabel(matchingOption.label)
      : prettifyLabel(value);
  }

  return "Logged";
}

function TrackingCard({
  category,
  summary,
  logged,
  index,
  onPress,
}: {
  category: TrackingCategory;
  summary: string;
  logged: boolean;
  index: number;
  onPress: () => void;
}) {
  const {
    isDark,
    colors: theme,
  } = useTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    })
  );

  const accent =
    CATEGORY_ACCENTS[category.id];

  const Icon =
    CATEGORY_ICONS[category.id];

  const isWide =
    category.id === "notes";

  return (
    <Animated.View
      entering={FadeInDown
        .delay(index * 45)
        .springify()
        .damping(18)}
      style={[
        isWide
          ? styles.gridItemWide
          : styles.gridItem,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, {
            damping: 16,
            stiffness: 280,
          });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {
            damping: 13,
            stiffness: 250,
          });
        }}
        accessibilityRole="button"
        accessibilityLabel={`Log ${category.label}`}
        style={[
          styles.card,
          isWide && styles.cardWide,
          {
            backgroundColor: theme.card,
            borderColor: logged
              ? `${accent.main}66`
              : theme.border,
          },
        ]}
      >
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark
                  ? accent.dark
                  : accent.light,
              },
            ]}
          >
            <Icon
              size={21}
              color={accent.main}
              strokeWidth={2.2}
            />
          </View>

          {logged ? (
            <View
              style={[
                styles.loggedBadge,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <Check
                size={12}
                color={theme.primary}
                strokeWidth={3}
              />
            </View>
          ) : (
            <View
              style={[
                styles.arrowButton,
                {
                  backgroundColor:
                    theme.background,
                },
              ]}
            >
              <ChevronRight
                size={14}
                color={accent.main}
                strokeWidth={2.5}
              />
            </View>
          )}
        </View>

        <View style={styles.cardTextArea}>
          <Text
            style={[
              styles.cardLabel,
              {
                color: theme.text,
              },
            ]}
          >
            {category.label}
          </Text>

          <Text
            style={[
              styles.cardSummary,
              {
                color: logged
                  ? theme.text
                  : theme.muted,
              },
            ]}
            numberOfLines={1}
          >
            {summary}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SymptomsScreen() {
  const {
    isDark,
    colors: theme,
  } = useTheme();

  const insets = useSafeAreaInsets();

  const params =
    useLocalSearchParams<{
      date?: string;
    }>();

  const rawDate =
    typeof params.date === "string"
      ? params.date
      : undefined;

  const todayStr =
    toDateValue(new Date());

  const initialDateStr =
    rawDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : todayStr;

  const [
    selectedDateStr,
    setSelectedDateStr,
  ] = useState(initialDateStr);

  const [
    isCalendarOpen,
    setIsCalendarOpen,
  ] = useState(false);

  const {
    data,
    loading,
    reload,
  } = useDailyLog(selectedDateStr);

  useEffect(() => {
    if (
      rawDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ) {
      setSelectedDateStr(rawDate);
    }
  }, [rawDate]);

  /*
   * Refresh when the user comes back from a
   * category screen so that the main cards
   * immediately show the newly saved values.
   */
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const selectedDate =
    parseDateValue(selectedDateStr);

  const today =
    parseDateValue(todayStr);

  const isToday =
    selectedDateStr === todayStr;

  const differenceInDays =
    Math.round(
      (today.getTime() -
        selectedDate.getTime()) /
        86400000
    );

  const formattedDate =
    selectedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    );

  const relativeDateLabel = isToday
    ? "Today"
    : differenceInDays === 1
    ? "Yesterday"
    : differenceInDays > 1
    ? `${differenceInDays} days ago`
    : "";

  const loggedCount =
    PERIOD_TRACKING_CATEGORIES.filter(
      (category) =>
        hasLoggedValue(
          data[category.id]
        )
    ).length;

  const canGoNext =
    selectedDateStr < todayStr;

  const updateSelectedDate = (
    nextDate: string
  ) => {
    if (nextDate > todayStr) {
      return;
    }

    setSelectedDateStr(nextDate);

    router.setParams({
      date: nextDate,
    });
  };

  const moveDate = (
    amount: number
  ) => {
    const date =
      parseDateValue(
        selectedDateStr
      );

    date.setDate(
      date.getDate() + amount
    );

    const nextDate =
      toDateValue(date);

    updateSelectedDate(nextDate);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(
        "/dashboard" as Href
      );
    }
  };

  const handleCategoryPress = (
    categoryId: string
  ) => {
    router.push({
      pathname:
        `/dashboard/symptoms/${categoryId}`,
      params: {
        date: selectedDateStr,
      },
    } as Href);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
              pressed &&
                styles.standardPressed,
            ]}
          >
            <ArrowLeft
              size={20}
              strokeWidth={2}
              color={theme.text}
            />
          </Pressable>

          <Text
            style={[
              styles.topBarTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Log Symptoms
          </Text>

          <View
            style={styles.topBarSpacer}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <Animated.View
            entering={FadeIn.duration(
              300
            )}
            style={
              styles.headingSection
            }
          >
            <Text
              style={[
                styles.eyebrow,
                {
                  color: theme.primary,
                },
              ]}
            >
              DAILY CHECK-IN
            </Text>

            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              How are you feeling?
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.muted,
                },
              ]}
            >
              Log anything you'd like
              to remember about today.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown
              .delay(70)
              .springify()
              .damping(18)}
            style={[
              styles.dateNavigator,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <Pressable
              onPress={() =>
                moveDate(-1)
              }
              accessibilityRole="button"
              accessibilityLabel="Previous day"
              style={({ pressed }) => [
                styles.dayArrowButton,
                {
                  backgroundColor:
                    theme.background,
                },
                pressed &&
                  styles.standardPressed,
              ]}
            >
              <ChevronLeft
                size={20}
                color={theme.text}
                strokeWidth={2}
              />
            </Pressable>

            <Pressable
              onPress={() =>
                setIsCalendarOpen(true)
              }
              accessibilityRole="button"
              accessibilityLabel="Open calendar"
              style={({ pressed }) => [
                styles.dateCenterButton,
                pressed &&
                  styles.datePressed,
              ]}
            >
              <View
                style={[
                  styles.dateIconWrap,
                  {
                    backgroundColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <CalendarDays
                  size={16}
                  color={theme.primary}
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.dateTextContainer
                }
              >
                <Text
                  style={[
                    styles.datePrimaryText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {formattedDate}
                </Text>

                <Text
                  style={[
                    styles.dateSecondaryText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {relativeDateLabel}
                </Text>
              </View>
            </Pressable>

            <Pressable
              disabled={!canGoNext}
              onPress={() =>
                moveDate(1)
              }
              accessibilityRole="button"
              accessibilityLabel="Next day"
              accessibilityState={{
                disabled: !canGoNext,
              }}
              style={({ pressed }) => [
                styles.dayArrowButton,
                {
                  backgroundColor:
                    theme.background,
                },
                !canGoNext &&
                  styles.disabledArrow,
                pressed &&
                  canGoNext &&
                  styles.standardPressed,
              ]}
            >
              <ChevronRight
                size={20}
                color={
                  canGoNext
                    ? theme.text
                    : theme.muted
                }
                strokeWidth={2}
              />
            </Pressable>
          </Animated.View>

          {!isToday && (
            <Animated.View
              entering={FadeIn.duration(
                220
              )}
              style={[
                styles.historyNotice,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <CalendarDays
                size={13}
                color={theme.primary}
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.historyNoticeText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                Viewing a previous day
              </Text>

              <Pressable
                onPress={() =>
                  updateSelectedDate(
                    todayStr
                  )
                }
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.todayLink,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  Go to today
                </Text>
              </Pressable>
            </Animated.View>
          )}

          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={[
                  styles.sectionEyebrow,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                YOUR LOG
              </Text>

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                What would you like
                to track?
              </Text>
            </View>

            <View
              style={[
                styles.progressBadge,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.primary}
                />
              ) : (
                <Text
                  style={[
                    styles.progressText,
                    {
                      color:
                        theme.primary,
                    },
                  ]}
                >
                  {loggedCount}/
                  {
                    PERIOD_TRACKING_CATEGORIES.length
                  }
                </Text>
              )}
            </View>
          </View>

          <View style={styles.grid}>
            {PERIOD_TRACKING_CATEGORIES.map(
              (category, index) => {
                const value =
                  data[category.id];

                const logged =
                  hasLoggedValue(value);

                const summary =
                  loading
                    ? "Loading…"
                    : getCategorySummary(
                        category,
                        value
                      );

                return (
                  <TrackingCard
                    key={category.id}
                    category={
                      category
                    }
                    index={index}
                    logged={logged}
                    summary={summary}
                    onPress={() =>
                      handleCategoryPress(
                        category.id
                      )
                    }
                  />
                );
              }
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={isCalendarOpen}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() =>
          setIsCalendarOpen(false)
        }
      >
        <View
          style={
            styles.modalContainer
          }
        >
          <Pressable
            style={
              styles.modalBackdrop
            }
            onPress={() =>
              setIsCalendarOpen(false)
            }
          />

          <Animated.View
            entering={SlideInDown
              .springify()
              .damping(19)
              .stiffness(180)}
            style={[
              styles.calendarSheet,
              {
                backgroundColor:
                  theme.card,
                borderColor:
                  theme.border,
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    18
                  ),
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.sheetHeader
              }
            >
              <View>
                <Text
                  style={[
                    styles.sheetTitle,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  Choose a date
                </Text>

                <Text
                  style={[
                    styles.sheetSubtitle,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  Dots show days with
                  saved entries.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setIsCalendarOpen(
                    false
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Close calendar"
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor:
                      theme.background,
                  },
                  pressed &&
                    styles.standardPressed,
                ]}
              >
                <X
                  size={18}
                  color={theme.text}
                />
              </Pressable>
            </View>

            <MiniCalendar
              embedded
              value={
                selectedDateStr
              }
              isDark={isDark}
              showLogDots
              onSelect={(
                newDate
              ) => {
                updateSelectedDate(
                  newDate
                );

                setIsCalendarOpen(
                  false
                );
              }}
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
      width: "100%",
      maxWidth: 430,
      alignSelf: "center",
    },

    topBar: {
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    topBarTitle: {
      fontSize: 16,
      fontWeight: "700",
    },

    topBarSpacer: {
      width: 40,
      height: 40,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 42,
    },

    headingSection: {
      marginBottom: 22,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.4,
      marginBottom: 8,
    },

    title: {
      fontSize: 29,
      lineHeight: 35,
      fontWeight: "800",
      letterSpacing: -0.8,
      marginBottom: 7,
    },

    subtitle: {
      maxWidth: 330,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "400",
    },

    dateNavigator: {
      minHeight: 76,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    dayArrowButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    disabledArrow: {
      opacity: 0.28,
    },

    dateCenterButton: {
      flex: 1,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    datePressed: {
      opacity: 0.72,
    },

    dateIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    dateTextContainer: {
      alignItems: "flex-start",
    },

    datePrimaryText: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },

    dateSecondaryText: {
      fontSize: 11.5,
      lineHeight: 16,
      fontWeight: "600",
      marginTop: 1,
    },

    historyNotice: {
      minHeight: 38,
      borderRadius: 13,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    historyNoticeText: {
      flex: 1,
      fontSize: 11.5,
      fontWeight: "600",
      marginLeft: 7,
    },

    todayLink: {
      fontSize: 11.5,
      fontWeight: "800",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",
      marginTop: 12,
      marginBottom: 14,
    },

    sectionEyebrow: {
      fontSize: 10.5,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: 5,
    },

    sectionTitle: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "700",
      letterSpacing: -0.25,
    },

    progressBadge: {
      minWidth: 42,
      height: 30,
      paddingHorizontal: 10,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    progressText: {
      fontSize: 11.5,
      fontWeight: "800",
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -6,
    },

    gridItem: {
      width: "50%",
      paddingHorizontal: 6,
      marginBottom: 12,
    },

    gridItemWide: {
      width: "100%",
      paddingHorizontal: 6,
      marginBottom: 12,
    },

    card: {
      minHeight: 128,
      padding: 14,
      borderRadius: 21,
      borderWidth: 1,
      justifyContent:
        "space-between",
    },

    cardWide: {
      minHeight: 104,
    },

    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    iconContainer: {
      width: 43,
      height: 43,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    arrowButton: {
      width: 27,
      height: 27,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    loggedBadge: {
      width: 27,
      height: 27,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    cardTextArea: {
      minHeight: 38,
    },

    cardLabel: {
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "700",
      letterSpacing: -0.2,
      marginBottom: 4,
    },

    cardSummary: {
      fontSize: 11.8,
      lineHeight: 16,
      fontWeight: "500",
    },

    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },

    modalBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(9, 6, 12, 0.62)",
    },

    calendarSheet: {
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingTop: 10,
    },

    sheetHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "rgba(150, 140, 150, 0.45)",
      alignSelf: "center",
      marginBottom: 18,
    },

    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 16,
      paddingHorizontal: 2,
    },

    sheetTitle: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: "800",
      letterSpacing: -0.35,
    },

    sheetSubtitle: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 2,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    standardPressed: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },
  });