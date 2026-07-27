const DEFAULT_CYCLE_LENGTH = 28;
const ESTIMATED_OVULATION_DAY = 14;

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

export type CyclePhase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal";

export type CyclePhaseDetails = {
  key: CyclePhase;
  name: string;
  estimatedName: string;
  description: string;
};

export type CycleSummary = {
  cycleDay: number;
  cycleLength: number;
  progress: number;
  phase: CyclePhaseDetails;
  currentCycleStartDate: Date;
  nextPeriodDate: Date;
  estimatedOvulationDate: Date;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
};

function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

export function parseISODate(
  value: string
): Date {
  const parts = value
    .split("-")
    .map(Number);

  const [
    year,
    month,
    day,
  ] = parts;

  if (
    !year ||
    !month ||
    !day
  ) {
    throw new Error(
      "Invalid date format."
    );
  }

  return new Date(
    year,
    month - 1,
    day
  );
}

export function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

export function differenceInDays(
  laterDate: Date,
  earlierDate: Date
): number {
  const later =
    startOfDay(laterDate);

  const earlier =
    startOfDay(earlierDate);

  return Math.floor(
    (
      later.getTime()
      - earlier.getTime()
    ) / MILLISECONDS_PER_DAY
  );
}

export function formatShortDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

export function formatLongDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

export function getCyclePhase(
  cycleDay: number
): CyclePhaseDetails {
  if (cycleDay <= 5) {
    return {
      key: "menstrual",
      name: "Menstrual Phase",
      estimatedName:
        "Likely Menstrual Phase",
      description:
        "Your period may be active, and your body may need extra rest and care.",
    };
  }

  if (cycleDay <= 13) {
    return {
      key: "follicular",
      name: "Follicular Phase",
      estimatedName:
        "Likely Follicular Phase",
      description:
        "Your body may be preparing for ovulation.",
    };
  }

  if (cycleDay <= 16) {
    return {
      key: "ovulation",
      name: "Ovulation Window",
      estimatedName:
        "Estimated Ovulation Window",
      description:
        "Ovulation may be approaching or happening around this time.",
    };
  }

  return {
    key: "luteal",
    name: "Luteal Phase",
    estimatedName:
      "Likely Luteal Phase",
    description:
      "Your body may be preparing for your next period.",
  };
}

export function calculateCycleSummary(
  lastPeriodStartDate: string,
  cycleLength = DEFAULT_CYCLE_LENGTH,
  today = new Date()
): CycleSummary {
  const normalizedToday =
    startOfDay(today);

  const recordedStart =
    startOfDay(
      parseISODate(
        lastPeriodStartDate
      )
    );

  const elapsedDays = Math.max(
    0,
    differenceInDays(
      normalizedToday,
      recordedStart
    )
  );

  /*
   * This temporarily assumes a 28-day cycle.
   * Later, cycleLength can come from the user's
   * calculated average stored by the backend.
   */
  const completedCycles =
    Math.floor(
      elapsedDays / cycleLength
    );

  const currentCycleStartDate =
    addDays(
      recordedStart,
      completedCycles
      * cycleLength
    );

  const cycleDay = Math.min(
    cycleLength,
    differenceInDays(
      normalizedToday,
      currentCycleStartDate
    ) + 1
  );

  const nextPeriodDate =
    addDays(
      currentCycleStartDate,
      cycleLength
    );

  const estimatedOvulationDate =
    addDays(
      currentCycleStartDate,
      ESTIMATED_OVULATION_DAY - 1
    );

  const daysUntilNextPeriod =
    Math.max(
      0,
      differenceInDays(
        nextPeriodDate,
        normalizedToday
      )
    );

  const daysUntilOvulation =
    differenceInDays(
      estimatedOvulationDate,
      normalizedToday
    );

  return {
    cycleDay,
    cycleLength,
    progress:
      cycleDay / cycleLength,
    phase:
      getCyclePhase(cycleDay),
    currentCycleStartDate,
    nextPeriodDate,
    estimatedOvulationDate,
    daysUntilNextPeriod,
    daysUntilOvulation,
  };
}

export function getGreeting(): string {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}