import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  Droplet,
  Droplets,
  FileText,
  Heart,
  HeartPulse,
  Pill,
  Search,
  Smile,
  Thermometer,
  X,
} from "lucide-react-native";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  PERIOD_TRACKING_CATEGORIES,
  type TrackingCategoryId,
  type TrackingOption,
} from "@/constants/trackingCategories";

import {
  guestTheme,
} from "@/constants/guestTheme";

import {
  useTheme,
} from "@/contexts/ThemeContext";

import {
  useDailyLog,
} from "@/hooks/useDailyLog";

import {
  formatDisplayDate,
  toDateValue,
} from "@/utils/calendarUtils";

type CategoryIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type CategoryVisual = {
  icon: CategoryIcon;
  accent: string;
  light: string;
  dark: string;
};

const CATEGORY_VISUALS: Record<
  TrackingCategoryId,
  CategoryVisual
> = {
  flow: {
    icon: Droplet,
    accent: "#FF5E8E",
    light: "#FFF0F4",
    dark: "#3D1C28",
  },

  symptoms: {
    icon: HeartPulse,
    accent: "#A855F7",
    light: "#F8F0FF",
    dark: "#2E1D3D",
  },

  mood: {
    icon: Smile,
    accent: "#3B82F6",
    light: "#EEF6FF",
    dark: "#182B42",
  },

  discharge: {
    icon: Droplets,
    accent: "#14B8A6",
    light: "#EEFCFA",
    dark: "#153633",
  },

  sexual_health: {
    icon: Heart,
    accent: "#EC4899",
    light: "#FDF2F8",
    dark: "#3B182B",
  },

  medication: {
    icon: Pill,
    accent: "#6366F1",
    light: "#EEF2FF",
    dark: "#1F2347",
  },

  lifestyle: {
    icon: Activity,
    accent: "#F59E0B",
    light: "#FFF8E8",
    dark: "#3D2B14",
  },

  fertility: {
    icon: Thermometer,
    accent: "#10B981",
    light: "#ECFDF5",
    dark: "#13352B",
  },

  notes: {
    icon: FileText,
    accent: "#8B5CF6",
    light: "#F5F3FF",
    dark: "#2D2340",
  },
};

const FLOW_DESCRIPTIONS: Record<
  string,
  string
> = {
  spotting: "Very small amount",
  light: "Lighter than usual",
  medium: "Typical flow",
  heavy: "Heavier than usual",
  very_heavy: "Very heavy flow",
};

const FLOW_LEVELS: Record<
  string,
  number
> = {
  spotting: 1,
  light: 2,
  medium: 3,
  heavy: 4,
  very_heavy: 5,
};

function AnimatedOptionCard({
  option,
  selected,
  multiSelect,
  accent,
  isDark,
  cardColor,
  borderColor,
  textColor,
  mutedColor,
  accentBackground,
  index,
  onPress,
}: {
  option: TrackingOption;
  selected: boolean;
  multiSelect: boolean;
  accent: string;
  isDark: boolean;
  cardColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  accentBackground: string;
  index: number;
  onPress: () => void;
}) {
  const scale =
    useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            scale.value,
        },
      ],
    }));

  const handlePressIn =
    () => {
      scale.value =
        withSpring(
          0.965,
          {
            damping: 18,
            stiffness: 320,
          }
        );
    };

  const handlePressOut =
    () => {
      scale.value =
        withSpring(
          1,
          {
            damping: 14,
            stiffness: 250,
          }
        );
    };

  return (
    <Animated.View
      entering={FadeInDown
        .delay(
          Math.min(
            index * 25,
            250
          )
        )
        .springify()
        .damping(19)}
      style={[
        styles.optionGridItem,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={
          handlePressIn
        }
        onPressOut={
          handlePressOut
        }
        accessibilityRole={
          multiSelect
            ? "checkbox"
            : "radio"
        }
        accessibilityState={{
          checked:
            selected,
        }}
        style={[
          styles.optionCard,
          {
            backgroundColor:
              selected
                ? accentBackground
                : cardColor,

            borderColor:
              selected
                ? accent
                : borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.optionIndicator,
            {
              borderColor:
                selected
                  ? accent
                  : borderColor,

              backgroundColor:
                selected
                  ? accent
                  : isDark
                  ? "#19131D"
                  : "#FFFFFF",
            },
          ]}
        >
          {selected ? (
            <Check
              size={12}
              color="#FFFFFF"
              strokeWidth={3.2}
            />
          ) : multiSelect ? (
            <View />
          ) : (
            <Circle
              size={8}
              color={
                mutedColor
              }
              strokeWidth={2}
            />
          )}
        </View>

        <Text
          style={[
            styles.optionLabel,
            {
              color:
                selected
                  ? textColor
                  : mutedColor,

              fontWeight:
                selected
                  ? "700"
                  : "600",
            },
          ]}
          numberOfLines={2}
        >
          {option.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function FlowOptionCard({
  option,
  selected,
  accent,
  cardColor,
  borderColor,
  textColor,
  mutedColor,
  accentBackground,
  index,
  onPress,
}: {
  option: TrackingOption;
  selected: boolean;
  accent: string;
  cardColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  accentBackground: string;
  index: number;
  onPress: () => void;
}) {
  const scale =
    useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            scale.value,
        },
      ],
    }));

  const level =
    FLOW_LEVELS[
      option.id
    ] ?? 1;

  return (
    <Animated.View
      entering={FadeInDown
        .delay(
          index * 55
        )
        .springify()
        .damping(18)}
      style={[
        styles.flowItem,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value =
            withSpring(
              0.975
            );
        }}
        onPressOut={() => {
          scale.value =
            withSpring(
              1
            );
        }}
        accessibilityRole="radio"
        accessibilityState={{
          checked:
            selected,
        }}
        style={[
          styles.flowCard,
          {
            backgroundColor:
              selected
                ? accentBackground
                : cardColor,

            borderColor:
              selected
                ? accent
                : borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.flowIconWrap,
            {
              backgroundColor:
                selected
                  ? `${accent}22`
                  : `${accent}12`,
            },
          ]}
        >
          <Droplet
            size={
              18 +
              level * 2
            }
            color={accent}
            fill={
              selected
                ? accent
                : "transparent"
            }
            strokeWidth={2}
          />
        </View>

        <View
          style={
            styles.flowTextArea
          }
        >
          <Text
            style={[
              styles.flowLabel,
              {
                color:
                  textColor,
              },
            ]}
          >
            {option.label}
          </Text>

          <Text
            style={[
              styles.flowDescription,
              {
                color:
                  mutedColor,
              },
            ]}
          >
            {FLOW_DESCRIPTIONS[
              option.id
            ] ??
              ""}
          </Text>
        </View>

        <View
          style={[
            styles.flowRadio,
            {
              borderColor:
                selected
                  ? accent
                  : borderColor,
            },
          ]}
        >
          {selected && (
            <Animated.View
              entering={FadeIn}
              style={[
                styles.flowRadioInner,
                {
                  backgroundColor:
                    accent,
                },
              ]}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SymptomsCategoryScreen() {
  const {
    isDark,
  } = useTheme();

  const theme =
    isDark
      ? guestTheme.mode.dark
      : guestTheme.mode.light;

  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<{
      categoryId?: string;
      date?: string;
    }>();

  const categoryId =
    typeof params.categoryId ===
    "string"
      ? params.categoryId
      : undefined;

  const rawDate =
    typeof params.date ===
    "string"
      ? params.date
      : undefined;

  const category =
    PERIOD_TRACKING_CATEGORIES.find(
      (item) =>
        item.id ===
        categoryId
    );

  const todayStr =
    toDateValue(
      new Date()
    );

  const activeDateStr =
    rawDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      rawDate
    )
      ? rawDate
      : todayStr;

  const {
    data,
    loading,
    saving,
    errorMessage,
    updateCategory,
    save,
  } =
    useDailyLog(
      activeDateStr
    );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    dirty,
    setDirty,
  ] = useState(false);

  const isToday =
    activeDateStr ===
    todayStr;

  const formattedDate =
    formatDisplayDate(
      activeDateStr
    );

  const displayDateText =
    isToday
      ? `Today, ${formattedDate}`
      : formattedDate;

  useEffect(() => {
    setDirty(false);
    setSearchQuery("");
  }, [
    categoryId,
    activeDateStr,
  ]);

  const handleBack =
    () => {
      if (
        router.canGoBack()
      ) {
        router.back();
      } else {
        router.replace(
          "/dashboard/symptoms"
        );
      }
    };

  const handleSave =
    async () => {
      const success =
        await save();

      if (success) {
        setDirty(false);

        if (
          router.canGoBack()
        ) {
          router.back();
        } else {
          router.replace(
            "/dashboard/symptoms"
          );
        }
      }
    };

  if (!category) {
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
        <View
          style={
            styles.container
          }
        >
          <View
            style={
              styles.topBar
            }
          >
            <Pressable
              onPress={
                handleBack
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[
                styles.backButton,
                {
                  backgroundColor:
                    theme.card,

                  borderColor:
                    theme.border,
                },
              ]}
            >
              <ArrowLeft
                size={20}
                color={
                  theme.text
                }
              />
            </Pressable>

            <Text
              style={[
                styles.topBarTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Category not found
            </Text>

            <View
              style={
                styles.topBarSpacer
              }
            />
          </View>

          <View
            style={
              styles.errorCenter
            }
          >
            <Text
              style={[
                styles.errorCenterText,
                {
                  color:
                    theme.muted,
                },
              ]}
            >
              This tracking
              category could not
              be found.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const visual =
    CATEGORY_VISUALS[
      category.id
    ];

  const CategoryIcon =
    visual.icon;

  const accentBackground =
    isDark
      ? visual.dark
      : visual.light;

  const rawValue =
    data[
      category.id
    ];

  const isNotesCategory =
    category.id ===
      "notes" ||
    !category.options;

  const isFlowCategory =
    category.id ===
    "flow";

  const noteText =
    typeof rawValue ===
    "string"
      ? rawValue
      : "";

  const selectedArray =
    Array.isArray(
      rawValue
    )
      ? (
          rawValue as string[]
        )
      : [];

  const selectedOption =
    typeof rawValue ===
    "string"
      ? rawValue
      : null;

  const handleToggleOption =
    (
      optionId: string
    ) => {
      const exists =
        selectedArray.includes(
          optionId
        );

      const nextArray =
        exists
          ? selectedArray.filter(
              (id) =>
                id !==
                optionId
            )
          : [
              ...selectedArray,
              optionId,
            ];

      updateCategory(
        category.id,
        nextArray
      );

      setDirty(true);
    };

  const handleSelectOption =
    (
      optionId: string
    ) => {
      const nextValue =
        selectedOption ===
        optionId
          ? null
          : optionId;

      updateCategory(
        category.id,
        nextValue
      );

      setDirty(true);
    };

  const filteredOptions =
    useMemo(() => {
      const options =
        category.options ??
        [];

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return options;
      }

      return options.filter(
        (option) =>
          option.label
            .toLowerCase()
            .includes(query) ||
          option.group
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      category.options,
      searchQuery,
    ]);

  const groupedOptions =
    useMemo(() => {
      const groups: Record<
        string,
        TrackingOption[]
      > = {};

      filteredOptions.forEach(
        (option) => {
          const group =
            option.group ??
            "Options";

          if (!groups[group]) {
            groups[group] =
              [];
          }

          groups[
            group
          ].push(option);
        }
      );

      return groups;
    }, [
      filteredOptions,
    ]);

  const shouldShowSearch =
    !isFlowCategory &&
    !isNotesCategory &&
    (category.options
      ?.length ?? 0) >
      16;

  const selectedCount =
    category.multiSelect
      ? selectedArray.length
      : selectedOption
      ? 1
      : 0;

  const description =
    category.description ??
    (isNotesCategory
      ? "Add anything you'd like to remember."
      : category.multiSelect
      ? "Select all options that apply."
      : "Choose the option that best matches.");

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
      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={
            styles.container
          }
        >
          {/* Header */}
          <View
            style={
              styles.topBar
            }
          >
            <Pressable
              onPress={
                handleBack
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={({
                pressed,
              }) => [
                styles.backButton,

                {
                  backgroundColor:
                    theme.card,

                  borderColor:
                    theme.border,
                },

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <ArrowLeft
                size={20}
                strokeWidth={2}
                color={
                  theme.text
                }
              />
            </Pressable>

            <Text
              style={[
                styles.topBarTitle,
                {
                  color:
                    theme.text,
                },
              ]}
              numberOfLines={1}
            >
              {category.label}
            </Text>

            <View
              style={
                styles.topBarSpacer
              }
            />
          </View>

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom:
                  120 +
                  insets.bottom,
              },
            ]}
          >
            {/* Category heading */}
            <Animated.View
              entering={FadeInDown
                .duration(350)}
              style={
                styles.headingSection
              }
            >
              <View
                style={[
                  styles.headingIconWrap,
                  {
                    backgroundColor:
                      accentBackground,
                  },
                ]}
              >
                <CategoryIcon
                  size={27}
                  color={
                    visual.accent
                  }
                  strokeWidth={2}
                />
              </View>

              <View
                style={
                  styles.headingTextArea
                }
              >
                <Text
                  style={[
                    styles.title,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  {category.label}
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  {description}
                </Text>
              </View>
            </Animated.View>

            {/* Date */}
            <Animated.View
              entering={FadeInDown
                .delay(60)
                .duration(350)}
              style={[
                styles.dateCard,
                {
                  backgroundColor:
                    theme.card,

                  borderColor:
                    theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.dateIcon,
                  {
                    backgroundColor:
                      theme.primarySoft,
                  },
                ]}
              >
                <CalendarDays
                  size={15}
                  color={
                    theme.primary
                  }
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.dateTextArea
                }
              >
                <Text
                  style={[
                    styles.dateLabel,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  LOGGING FOR
                </Text>

                <Text
                  style={[
                    styles.dateValue,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  {
                    displayDateText
                  }
                </Text>
              </View>
            </Animated.View>

            {loading ? (
              <View
                style={
                  styles.loadingArea
                }
              >
                <ActivityIndicator
                  size="large"
                  color={
                    theme.primary
                  }
                />

                <Text
                  style={[
                    styles.loadingText,
                    {
                      color:
                        theme.muted,
                    },
                  ]}
                >
                  Loading your log…
                </Text>
              </View>
            ) : (
              <>
                {/* Notes */}
                {isNotesCategory ? (
                  <Animated.View
                    entering={FadeInDown
                      .delay(100)
                      .duration(350)}
                  >
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          color:
                            theme.text,
                        },
                      ]}
                    >
                      Your notes
                    </Text>

                    <Text
                      style={[
                        styles.sectionSubtitle,
                        {
                          color:
                            theme.muted,
                        },
                      ]}
                    >
                      Add anything
                      useful about how
                      you felt today.
                    </Text>

                    <View
                      style={[
                        styles.notesCard,
                        {
                          backgroundColor:
                            theme.card,

                          borderColor:
                            noteText
                              ? visual.accent
                              : theme.border,
                        },
                      ]}
                    >
                      <TextInput
                        multiline
                        textAlignVertical="top"
                        placeholder="Write anything you'd like to remember about this day..."
                        placeholderTextColor={
                          theme.muted
                        }
                        value={
                          noteText
                        }
                        onChangeText={(
                          text
                        ) => {
                          updateCategory(
                            category.id,
                            text
                          );

                          setDirty(
                            true
                          );
                        }}
                        style={[
                          styles.notesInput,
                          {
                            color:
                              theme.text,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.characterCount,
                          {
                            color:
                              theme.muted,
                          },
                        ]}
                      >
                        {
                          noteText.length
                        }{" "}
                        characters
                      </Text>
                    </View>
                  </Animated.View>
                ) : isFlowCategory ? (
                  /*
                   * FLOW
                   *
                   * Custom full-width
                   * intensity selector.
                   */
                  <View>
                    <View
                      style={
                        styles.sectionHeaderRow
                      }
                    >
                      <View>
                        <Text
                          style={[
                            styles.sectionTitle,
                            {
                              color:
                                theme.text,
                            },
                          ]}
                        >
                          How is your
                          flow?
                        </Text>

                        <Text
                          style={[
                            styles.sectionSubtitle,
                            {
                              color:
                                theme.muted,
                            },
                          ]}
                        >
                          Choose one
                          option.
                        </Text>
                      </View>

                      {selectedOption ? (
                        <View
                          style={[
                            styles.selectionCount,
                            {
                              backgroundColor:
                                accentBackground,
                            },
                          ]}
                        >
                          <Check
                            size={13}
                            color={
                              visual.accent
                            }
                            strokeWidth={3}
                          />

                          <Text
                            style={[
                              styles.selectionCountText,
                              {
                                color:
                                  visual.accent,
                              },
                            ]}
                          >
                            Selected
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View
                      style={
                        styles.flowList
                      }
                    >
                      {category.options?.map(
                        (
                          option,
                          index
                        ) => (
                          <FlowOptionCard
                            key={
                              option.id
                            }
                            option={
                              option
                            }
                            index={
                              index
                            }
                            selected={
                              selectedOption ===
                              option.id
                            }
                            accent={
                              visual.accent
                            }
                            cardColor={
                              theme.card
                            }
                            borderColor={
                              theme.border
                            }
                            textColor={
                              theme.text
                            }
                            mutedColor={
                              theme.muted
                            }
                            accentBackground={
                              accentBackground
                            }
                            onPress={() =>
                              handleSelectOption(
                                option.id
                              )
                            }
                          />
                        )
                      )}
                    </View>
                  </View>
                ) : (
                  /*
                   * ALL OTHER OPTION
                   * CATEGORIES
                   */
                  <View>
                    <View
                      style={
                        styles.sectionHeaderRow
                      }
                    >
                      <View
                        style={
                          styles.sectionHeaderText
                        }
                      >
                        <Text
                          style={[
                            styles.sectionTitle,
                            {
                              color:
                                theme.text,
                            },
                          ]}
                        >
                          {category.multiSelect
                            ? "Select what applies"
                            : "Choose one"}
                        </Text>

                        <Text
                          style={[
                            styles.sectionSubtitle,
                            {
                              color:
                                theme.muted,
                            },
                          ]}
                        >
                          {category.multiSelect
                            ? "You can select more than one."
                            : "Tap again to clear your selection."}
                        </Text>
                      </View>

                      {selectedCount >
                      0 ? (
                        <Animated.View
                          entering={
                            FadeIn
                          }
                          style={[
                            styles.selectionCount,
                            {
                              backgroundColor:
                                accentBackground,
                            },
                          ]}
                        >
                          <Check
                            size={13}
                            color={
                              visual.accent
                            }
                            strokeWidth={3}
                          />

                          <Text
                            style={[
                              styles.selectionCountText,
                              {
                                color:
                                  visual.accent,
                              },
                            ]}
                          >
                            {
                              selectedCount
                            }{" "}
                            selected
                          </Text>
                        </Animated.View>
                      ) : null}
                    </View>

                    {/* Search */}
                    {shouldShowSearch ? (
                      <View
                        style={[
                          styles.searchBar,
                          {
                            backgroundColor:
                              theme.card,

                            borderColor:
                              searchQuery
                                ? visual.accent
                                : theme.border,
                          },
                        ]}
                      >
                        <Search
                          size={17}
                          color={
                            searchQuery
                              ? visual.accent
                              : theme.muted
                          }
                          strokeWidth={2}
                        />

                        <TextInput
                          value={
                            searchQuery
                          }
                          onChangeText={
                            setSearchQuery
                          }
                          placeholder={`Search ${category.label.toLowerCase()}...`}
                          placeholderTextColor={
                            theme.muted
                          }
                          style={[
                            styles.searchInput,
                            {
                              color:
                                theme.text,
                            },
                          ]}
                        />

                        {searchQuery ? (
                          <Pressable
                            onPress={() =>
                              setSearchQuery(
                                ""
                              )
                            }
                            hitSlop={8}
                          >
                            <X
                              size={16}
                              color={
                                theme.muted
                              }
                            />
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}

                    {Object.keys(
                      groupedOptions
                    ).length ===
                    0 ? (
                      <View
                        style={
                          styles.noResults
                        }
                      >
                        <Search
                          size={24}
                          color={
                            theme.muted
                          }
                        />

                        <Text
                          style={[
                            styles.noResultsTitle,
                            {
                              color:
                                theme.text,
                            },
                          ]}
                        >
                          No matches
                        </Text>

                        <Text
                          style={[
                            styles.noResultsText,
                            {
                              color:
                                theme.muted,
                            },
                          ]}
                        >
                          Try searching
                          for something
                          else.
                        </Text>
                      </View>
                    ) : (
                      Object.entries(
                        groupedOptions
                      ).map(
                        ([
                          group,
                          options,
                        ]) => (
                          <View
                            key={
                              group
                            }
                            style={
                              styles.optionGroup
                            }
                          >
                            {/*
                             * Only show
                             * group title
                             * when useful.
                             */}
                            {group !==
                            "Options" ? (
                              <View
                                style={
                                  styles.groupHeader
                                }
                              >
                                <Text
                                  style={[
                                    styles.groupTitle,
                                    {
                                      color:
                                        theme.text,
                                    },
                                  ]}
                                >
                                  {
                                    group
                                  }
                                </Text>

                                <Text
                                  style={[
                                    styles.groupCount,
                                    {
                                      color:
                                        theme.muted,
                                    },
                                  ]}
                                >
                                  {
                                    options.length
                                  }
                                </Text>
                              </View>
                            ) : null}

                            <View
                              style={
                                styles.optionGrid
                              }
                            >
                              {options.map(
                                (
                                  option,
                                  index
                                ) => {
                                  const selected =
                                    category.multiSelect
                                      ? selectedArray.includes(
                                          option.id
                                        )
                                      : selectedOption ===
                                        option.id;

                                  return (
                                    <AnimatedOptionCard
                                      key={
                                        option.id
                                      }
                                      option={
                                        option
                                      }
                                      index={
                                        index
                                      }
                                      selected={
                                        selected
                                      }
                                      multiSelect={
                                        category.multiSelect
                                      }
                                      accent={
                                        visual.accent
                                      }
                                      isDark={
                                        isDark
                                      }
                                      cardColor={
                                        theme.card
                                      }
                                      borderColor={
                                        theme.border
                                      }
                                      textColor={
                                        theme.text
                                      }
                                      mutedColor={
                                        theme.muted
                                      }
                                      accentBackground={
                                        accentBackground
                                      }
                                      onPress={() =>
                                        category.multiSelect
                                          ? handleToggleOption(
                                              option.id
                                            )
                                          : handleSelectOption(
                                              option.id
                                            )
                                      }
                                    />
                                  );
                                }
                              )}
                            </View>
                          </View>
                        )
                      )
                    )}
                  </View>
                )}

                {errorMessage ? (
                  <Animated.View
                    entering={
                      FadeIn
                    }
                    style={[
                      styles.errorContainer,
                      {
                        backgroundColor:
                          isDark
                            ? "#3A2029"
                            : "#FFF0F4",

                        borderColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color:
                            theme.primary,
                        },
                      ]}
                    >
                      {
                        errorMessage
                      }
                    </Text>
                  </Animated.View>
                ) : null}
              </>
            )}
          </ScrollView>

          {/* Sticky Save */}
          <View
            style={[
              styles.saveArea,
              {
                backgroundColor:
                  theme.background,

                borderTopColor:
                  theme.border,

                paddingBottom:
                  Math.max(
                    insets.bottom,
                    12
                  ),
              },
            ]}
          >
            <Pressable
              onPress={() => {
                void handleSave();
              }}
              disabled={
                saving ||
                loading ||
                !dirty
              }
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              accessibilityState={{
                busy: saving,
                disabled:
                  saving ||
                  loading ||
                  !dirty,
              }}
              style={({
                pressed,
              }) => [
                styles.saveButton,

                {
                  backgroundColor:
                    theme.primaryButton,

                  shadowColor:
                    theme.shadow,
                },

                (saving ||
                  loading ||
                  !dirty) &&
                  styles.saveButtonDisabled,

                pressed &&
                  !saving &&
                  !loading &&
                  dirty &&
                  styles.buttonPressed,
              ]}
            >
              {saving ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Saving…
                  </Text>
                </>
              ) : (
                <>
                  <Check
                    size={19}
                    strokeWidth={2.5}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    {dirty
                      ? "Save changes"
                      : "No changes"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    keyboardView: {
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
      justifyContent:
        "center",
    },

    topBarTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      marginHorizontal: 12,
    },

    topBarSpacer: {
      width: 40,
      height: 40,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
    },

    headingSection: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      marginBottom: 18,
    },

    headingIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    headingTextArea: {
      flex: 1,
      paddingTop: 1,
    },

    title: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight: "800",
      letterSpacing: -0.6,
      marginBottom: 5,
    },

    subtitle: {
      fontSize: 13.5,
      lineHeight: 19,
      maxWidth: 310,
    },

    dateCard: {
      minHeight: 61,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 26,
    },

    dateIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    dateTextArea: {
      flex: 1,
    },

    dateLabel: {
      fontSize: 9.5,
      lineHeight: 13,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 2,
    },

    dateValue: {
      fontSize: 13.5,
      lineHeight: 18,
      fontWeight: "700",
    },

    loadingArea: {
      minHeight: 260,
      alignItems: "center",
      justifyContent:
        "center",
      gap: 12,
    },

    loadingText: {
      fontSize: 13.5,
      fontWeight: "500",
    },

    sectionHeaderRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      marginBottom: 17,
    },

    sectionHeaderText: {
      flex: 1,
      paddingRight: 12,
    },

    sectionTitle: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "800",
      letterSpacing: -0.25,
      marginBottom: 3,
    },

    sectionSubtitle: {
      fontSize: 12.5,
      lineHeight: 18,
    },

    selectionCount: {
      minHeight: 30,
      borderRadius: 15,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    selectionCountText: {
      fontSize: 10.5,
      fontWeight: "800",
    },

    searchBar: {
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 24,
    },

    searchInput: {
      flex: 1,
      fontSize: 13.5,
      paddingVertical: 0,
      outlineStyle: "none",
    } as any,

    optionGroup: {
      marginBottom: 27,
    },

    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 11,
      paddingHorizontal: 2,
    },

    groupTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "800",
      letterSpacing: -0.15,
    },

    groupCount: {
      fontSize: 10.5,
      fontWeight: "700",
    },

    optionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -5,
    },

    optionGridItem: {
      width: "50%",
      paddingHorizontal: 5,
      marginBottom: 10,
    },

    optionCard: {
      minHeight: 56,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
    },

    optionIndicator: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 9,
    },

    optionLabel: {
      flex: 1,
      fontSize: 12,
      lineHeight: 16,
    },

    flowList: {
      gap: 10,
      marginBottom: 14,
    },

    flowItem: {
      width: "100%",
    },

    flowCard: {
      minHeight: 76,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 11,
      flexDirection: "row",
      alignItems: "center",
    },

    flowIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    flowTextArea: {
      flex: 1,
    },

    flowLabel: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: 2,
    },

    flowDescription: {
      fontSize: 11.5,
      lineHeight: 16,
    },

    flowRadio: {
      width: 23,
      height: 23,
      borderRadius: 12,
      borderWidth: 1.7,
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 8,
    },

    flowRadioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
    },

    notesCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 15,
      marginTop: 16,
      minHeight: 210,
    },

    notesInput: {
      minHeight: 160,
      fontSize: 14,
      lineHeight: 21,
    },

    characterCount: {
      alignSelf: "flex-end",
      marginTop: 8,
      fontSize: 10.5,
      fontWeight: "500",
    },

    noResults: {
      minHeight: 180,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    noResultsTitle: {
      marginTop: 10,
      fontSize: 15,
      fontWeight: "700",
    },

    noResultsText: {
      marginTop: 4,
      fontSize: 12,
      textAlign: "center",
    },

    errorContainer: {
      marginTop: 4,
      marginBottom: 20,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderWidth: 1,
      borderRadius: 14,
    },

    errorText: {
      textAlign: "center",
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: "600",
    },

    errorCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    errorCenterText: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },

    saveArea: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 10,
      borderTopWidth:
        StyleSheet.hairlineWidth,
    },

    saveButton: {
      minHeight: 54,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
    },

    saveButtonDisabled: {
      opacity: 0.42,
      shadowOpacity: 0,
      elevation: 0,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 14.5,
      fontWeight: "800",
    },

    buttonPressed: {
      opacity: 0.76,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });