export type TrackingCategoryId =
  | "flow"
  | "symptoms"
  | "mood"
  | "discharge"
  | "sexual_health"
  | "medication"
  | "lifestyle"
  | "fertility"
  | "notes";

// Future pregnancy tracking categories can be
// added back when pregnancy mode is implemented.

export type TrackingInputType =
  | "single_select"
  | "multi_select"
  | "text"
  | "structured";

export interface TrackingOption {
  id: string;
  label: string;

  /*
   * Used by the redesigned category screen
   * to divide large option lists into sections.
   *
   * The current category screen can safely
   * ignore this field.
   */
  group?: string;
}

export interface TrackingCategory {
  id: TrackingCategoryId;

  /*
   * TEMPORARY:
   * SymptomsCategoryScreen currently still
   * uses emoji. We'll remove this dependency
   * when that screen is redesigned.
   */
  emoji: string;

  label: string;

  /*
   * Short explanatory text that can be used
   * by the redesigned tracking screens.
   */
  description?: string;

  /*
   * Gives the future UI more information
   * about how this category should behave.
   */
  inputType?: TrackingInputType;

  /*
   * Kept for backwards compatibility with
   * the current SymptomsCategoryScreen.
   */
  multiSelect: boolean;

  options?: TrackingOption[];
}

export const PERIOD_TRACKING_CATEGORIES: TrackingCategory[] = [
  // =========================================================
  // FLOW
  // =========================================================
  {
    id: "flow",
    emoji: "🩸",
    label: "Flow",
    description: "Track the intensity of your menstrual flow.",
    inputType: "single_select",
    multiSelect: false,

    options: [
      {
        id: "spotting",
        label: "Spotting",
      },
      {
        id: "light",
        label: "Light",
      },
      {
        id: "medium",
        label: "Medium",
      },
      {
        id: "heavy",
        label: "Heavy",
      },
      {
        id: "very_heavy",
        label: "Very heavy",
      },
    ],
  },

  // =========================================================
  // SYMPTOMS
  // =========================================================
  {
    id: "symptoms",
    emoji: "🤒",
    label: "Symptoms",
    description:
      "Track physical symptoms and changes you notice throughout your cycle.",
    inputType: "multi_select",
    multiSelect: true,

    options: [
      // -------------------------
      // Pain & discomfort
      // -------------------------
      {
        id: "cramps",
        label: "Cramps",
        group: "Pain & discomfort",
      },
      {
        id: "pelvic_pain",
        label: "Pelvic pain",
        group: "Pain & discomfort",
      },
      {
        id: "back_pain",
        label: "Back pain",
        group: "Pain & discomfort",
      },
      {
        id: "breast_tenderness",
        label: "Breast tenderness",
        group: "Pain & discomfort",
      },
      {
        id: "joint_pain",
        label: "Joint pain",
        group: "Pain & discomfort",
      },
      {
        id: "muscle_aches",
        label: "Muscle aches",
        group: "Pain & discomfort",
      },
      {
        id: "body_aches",
        label: "Body aches",
        group: "Pain & discomfort",
      },

      // -------------------------
      // Head & neurological
      // -------------------------
      {
        id: "headache",
        label: "Headache",
        group: "Head & focus",
      },
      {
        id: "migraine",
        label: "Migraine",
        group: "Head & focus",
      },
      {
        id: "dizziness",
        label: "Dizziness",
        group: "Head & focus",
      },
      {
        id: "brain_fog",
        label: "Brain fog",
        group: "Head & focus",
      },
      {
        id: "difficulty_concentrating",
        label: "Difficulty concentrating",
        group: "Head & focus",
      },
      {
        id: "light_sensitivity",
        label: "Light sensitivity",
        group: "Head & focus",
      },

      // -------------------------
      // Digestive
      // -------------------------
      {
        id: "bloating",
        label: "Bloating",
        group: "Digestive",
      },
      {
        id: "nausea",
        label: "Nausea",
        group: "Digestive",
      },
      {
        id: "vomiting",
        label: "Vomiting",
        group: "Digestive",
      },
      {
        id: "constipation",
        label: "Constipation",
        group: "Digestive",
      },
      {
        id: "diarrhea",
        label: "Diarrhea",
        group: "Digestive",
      },
      {
        id: "gas",
        label: "Gas",
        group: "Digestive",
      },
      {
        id: "indigestion",
        label: "Indigestion",
        group: "Digestive",
      },
      {
        id: "heartburn",
        label: "Heartburn",
        group: "Digestive",
      },

      // -------------------------
      // Energy & sleep
      // -------------------------
      {
        id: "fatigue",
        label: "Fatigue",
        group: "Energy & sleep",
      },
      {
        id: "low_energy",
        label: "Low energy",
        group: "Energy & sleep",
      },
      {
        id: "trouble_sleeping",
        label: "Trouble sleeping",
        group: "Energy & sleep",
      },
      {
        id: "restless_sleep",
        label: "Restless sleep",
        group: "Energy & sleep",
      },
      {
        id: "sleeping_more",
        label: "Sleeping more",
        group: "Energy & sleep",
      },
      {
        id: "daytime_sleepiness",
        label: "Daytime sleepiness",
        group: "Energy & sleep",
      },

      // -------------------------
      // Skin & body
      // -------------------------
      {
        id: "acne",
        label: "Acne",
        group: "Skin & body",
      },
      {
        id: "oily_skin",
        label: "Oily skin",
        group: "Skin & body",
      },
      {
        id: "dry_skin",
        label: "Dry skin",
        group: "Skin & body",
      },
      {
        id: "hot_flashes",
        label: "Hot flashes",
        group: "Skin & body",
      },
      {
        id: "chills",
        label: "Chills",
        group: "Skin & body",
      },
      {
        id: "swelling",
        label: "Swelling",
        group: "Skin & body",
      },
      {
        id: "increased_sweating",
        label: "Increased sweating",
        group: "Skin & body",
      },

      // -------------------------
      // Appetite
      // -------------------------
      {
        id: "food_cravings",
        label: "Food cravings",
        group: "Appetite",
      },
      {
        id: "increased_appetite",
        label: "Increased appetite",
        group: "Appetite",
      },
      {
        id: "decreased_appetite",
        label: "Decreased appetite",
        group: "Appetite",
      },

      // -------------------------
      // Other
      // -------------------------
      {
        id: "sensitivity_to_smell",
        label: "Sensitivity to smell",
        group: "Other",
      },
      {
        id: "frequent_urination",
        label: "Frequent urination",
        group: "Other",
      },
      {
        id: "feeling_cold",
        label: "Feeling cold",
        group: "Other",
      },
      {
        id: "feeling_warm",
        label: "Feeling warm",
        group: "Other",
      },
    ],
  },

  // =========================================================
  // MOOD
  // =========================================================
  {
    id: "mood",
    emoji: "😊",
    label: "Mood",
    description:
      "Keep track of emotional changes throughout your cycle.",
    inputType: "multi_select",
    multiSelect: true,

    options: [
      // -------------------------
      // Positive
      // -------------------------
      {
        id: "happy",
        label: "Happy",
        group: "Positive",
      },
      {
        id: "calm",
        label: "Calm",
        group: "Positive",
      },
      {
        id: "energetic",
        label: "Energetic",
        group: "Positive",
      },
      {
        id: "confident",
        label: "Confident",
        group: "Positive",
      },
      {
        id: "motivated",
        label: "Motivated",
        group: "Positive",
      },
      {
        id: "excited",
        label: "Excited",
        group: "Positive",
      },
      {
        id: "affectionate",
        label: "Affectionate",
        group: "Positive",
      },
      {
        id: "hopeful",
        label: "Hopeful",
        group: "Positive",
      },

      // -------------------------
      // Neutral
      // -------------------------
      {
        id: "neutral",
        label: "Neutral",
        group: "Neutral",
      },
      {
        id: "focused",
        label: "Focused",
        group: "Neutral",
      },
      {
        id: "tired",
        label: "Tired",
        group: "Neutral",
      },
      {
        id: "quiet",
        label: "Quiet",
        group: "Neutral",
      },
      {
        id: "disconnected",
        label: "Disconnected",
        group: "Neutral",
      },

      // -------------------------
      // Difficult
      // -------------------------
      {
        id: "irritable",
        label: "Irritable",
        group: "Difficult",
      },
      {
        id: "mood_swings",
        label: "Mood swings",
        group: "Difficult",
      },
      {
        id: "anxious",
        label: "Anxious",
        group: "Difficult",
      },
      {
        id: "stressed",
        label: "Stressed",
        group: "Difficult",
      },
      {
        id: "sad",
        label: "Sad",
        group: "Difficult",
      },
      {
        id: "emotional",
        label: "Emotional",
        group: "Difficult",
      },
      {
        id: "low_motivation",
        label: "Low motivation",
        group: "Difficult",
      },
      {
        id: "overwhelmed",
        label: "Overwhelmed",
        group: "Difficult",
      },
      {
        id: "angry",
        label: "Angry",
        group: "Difficult",
      },
      {
        id: "lonely",
        label: "Lonely",
        group: "Difficult",
      },
      {
        id: "restless",
        label: "Restless",
        group: "Difficult",
      },
      {
        id: "sensitive",
        label: "Sensitive",
        group: "Difficult",
      },
    ],
  },

  // =========================================================
  // DISCHARGE
  // =========================================================
  {
    id: "discharge",
    emoji: "💧",
    label: "Discharge",
    description:
      "Track changes in vaginal discharge throughout your cycle.",

    /*
     * Eventually we'll redesign this into a
     * structured input with texture, colour,
     * amount, etc.
     *
     * For now we keep single_select so the
     * current screen continues working.
     */
    inputType: "single_select",
    multiSelect: false,

    options: [
      {
        id: "none",
        label: "None",
      },
      {
        id: "dry",
        label: "Dry",
      },
      {
        id: "sticky",
        label: "Sticky",
      },
      {
        id: "creamy",
        label: "Creamy",
      },
      {
        id: "watery",
        label: "Watery",
      },
      {
        id: "egg_white",
        label: "Egg white",
      },
      {
        id: "thick",
        label: "Thick",
      },
      {
        id: "clear",
        label: "Clear",
      },
      {
        id: "white",
        label: "White",
      },
      {
        id: "yellow",
        label: "Yellow",
      },
      {
        id: "green",
        label: "Green",
      },
      {
        id: "gray",
        label: "Gray",
      },
      {
        id: "pink",
        label: "Pink",
      },
      {
        id: "brown",
        label: "Brown",
      },
      {
        id: "unusual",
        label: "Unusual",
      },
    ],
  },

  // =========================================================
  // SEXUAL ACTIVITY
  // =========================================================
  {
    id: "sexual_health",
    emoji: "❤️",
    label: "Sexual Activity",
    description:
      "Privately track sexual activity and related changes.",
    inputType: "multi_select",
    multiSelect: true,

    options: [
      {
        id: "had_sex",
        label: "Had sex",
        group: "Activity",
      },
      {
        id: "protected_sex",
        label: "Protected sex",
        group: "Activity",
      },
      {
        id: "unprotected_sex",
        label: "Unprotected sex",
        group: "Activity",
      },
      {
        id: "masturbation",
        label: "Masturbation",
        group: "Activity",
      },

      {
        id: "high_sex_drive",
        label: "High sex drive",
        group: "Sex drive",
      },
      {
        id: "normal_sex_drive",
        label: "Usual sex drive",
        group: "Sex drive",
      },
      {
        id: "low_sex_drive",
        label: "Low sex drive",
        group: "Sex drive",
      },

      {
        id: "orgasm",
        label: "Orgasm",
        group: "Experience",
      },
      {
        id: "no_orgasm",
        label: "No orgasm",
        group: "Experience",
      },
      {
        id: "dryness",
        label: "Dryness",
        group: "Experience",
      },
      {
        id: "pain_during_sex",
        label: "Pain during sex",
        group: "Experience",
      },
      {
        id: "bleeding_after_sex",
        label: "Bleeding after sex",
        group: "Experience",
      },
    ],
  },

  // =========================================================
  // MEDICATION
  // =========================================================
  {
    id: "medication",
    emoji: "💊",
    label: "Medication",
    description:
      "Keep track of medication, contraception and supplements.",
    inputType: "multi_select",
    multiSelect: true,

    options: [
      {
        id: "painkiller",
        label: "Painkiller",
        group: "Medication",
      },
      {
        id: "anti_inflammatory",
        label: "Anti-inflammatory",
        group: "Medication",
      },
      {
        id: "prescription_medication",
        label: "Prescription medication",
        group: "Medication",
      },
      {
        id: "antibiotics",
        label: "Antibiotics",
        group: "Medication",
      },
      {
        id: "antihistamine",
        label: "Antihistamine",
        group: "Medication",
      },

      {
        id: "birth_control",
        label: "Birth control",
        group: "Contraception",
      },
      {
        id: "emergency_contraception",
        label: "Emergency contraception",
        group: "Contraception",
      },

      {
        id: "iron_supplement",
        label: "Iron",
        group: "Supplements",
      },
      {
        id: "magnesium_supplement",
        label: "Magnesium",
        group: "Supplements",
      },
      {
        id: "vitamins",
        label: "Vitamins",
        group: "Supplements",
      },
      {
        id: "other_supplement",
        label: "Other supplement",
        group: "Supplements",
      },

      {
        id: "other",
        label: "Other",
        group: "Other",
      },
    ],
  },

  // =========================================================
  // LIFESTYLE
  // =========================================================
  {
    id: "lifestyle",
    emoji: "🏃",
    label: "Lifestyle",
    description:
      "Track daily habits that may affect how you feel.",

    /*
     * Later this category will use richer
     * controls for water, sleep, exercise
     * and stress instead of simple buttons.
     */
    inputType: "structured",
    multiSelect: true,

    options: [
      {
        id: "water_intake",
        label: "Water intake",
        group: "Wellness",
      },
      {
        id: "sleep_duration",
        label: "Sleep duration",
        group: "Wellness",
      },
      {
        id: "stress_level",
        label: "Stress level",
        group: "Wellness",
      },

      {
        id: "exercise",
        label: "Exercise",
        group: "Activity",
      },
      {
        id: "walking",
        label: "Walking",
        group: "Activity",
      },
      {
        id: "running",
        label: "Running",
        group: "Activity",
      },
      {
        id: "cycling",
        label: "Cycling",
        group: "Activity",
      },
      {
        id: "strength_training",
        label: "Strength training",
        group: "Activity",
      },
      {
        id: "yoga",
        label: "Yoga",
        group: "Activity",
      },
      {
        id: "stretching",
        label: "Stretching",
        group: "Activity",
      },
      {
        id: "rest_day",
        label: "Rest day",
        group: "Activity",
      },

      {
        id: "meditation",
        label: "Meditation",
        group: "Self care",
      },
      {
        id: "self_care",
        label: "Self care",
        group: "Self care",
      },
      {
        id: "time_outdoors",
        label: "Time outdoors",
        group: "Self care",
      },

      {
        id: "caffeine",
        label: "Caffeine",
        group: "Daily habits",
      },
      {
        id: "late_night",
        label: "Late night",
        group: "Daily habits",
      },
      {
        id: "busy_day",
        label: "Busy day",
        group: "Daily habits",
      },
    ],
  },

  // =========================================================
  // FERTILITY
  // =========================================================
  {
    id: "fertility",
    emoji: "🌡️",
    label: "Fertility",
    description:
      "Track fertility signs and ovulation-related observations.",
    inputType: "multi_select",
    multiSelect: true,

    options: [
      {
        id: "ovulation_positive",
        label: "Positive ovulation test",
        group: "Ovulation test",
      },
      {
        id: "ovulation_negative",
        label: "Negative ovulation test",
        group: "Ovulation test",
      },

      {
        id: "high_fertility",
        label: "High fertility",
        group: "Fertility signs",
      },
      {
        id: "peak_fertility",
        label: "Peak fertility",
        group: "Fertility signs",
      },
      {
        id: "ovulation_pain",
        label: "Ovulation pain",
        group: "Fertility signs",
      },

      {
        id: "cervical_mucus",
        label: "Cervical mucus",
        group: "Body signs",
      },
      {
        id: "dry_cervical_mucus",
        label: "Dry",
        group: "Body signs",
      },
      {
        id: "sticky_cervical_mucus",
        label: "Sticky",
        group: "Body signs",
      },
      {
        id: "creamy_cervical_mucus",
        label: "Creamy",
        group: "Body signs",
      },
      {
        id: "egg_white_cervical_mucus",
        label: "Egg white",
        group: "Body signs",
      },

      {
        id: "basal_body_temp",
        label: "Basal body temperature",
        group: "Measurements",
      },
      {
        id: "temperature_rise",
        label: "Temperature rise",
        group: "Measurements",
      },
    ],
  },

  // =========================================================
  // NOTES
  // =========================================================
  {
    id: "notes",
    emoji: "📝",
    label: "Notes",
    description:
      "Add anything else you want to remember about this day.",
    inputType: "text",
    multiSelect: false,
  },
];