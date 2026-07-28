import type { CyclePrediction, CyclePredictionInput } from "@/types/prediction";
import { addDays, parseDateValue, toDateValue } from "@/utils/calendarUtils";

export function getCycleLengthFromType(cycleType: string): number {
  if (cycleType === "short") return 23;
  if (cycleType === "long") return 36;
  return 28;
}

export function calculateCyclePrediction(input: CyclePredictionInput): CyclePrediction {
  const lastPeriod = parseDateValue(input.lastPeriodDate);
  const cycleLength = getCycleLengthFromType(input.cycleType);
  const nextPeriodStart = addDays(lastPeriod, cycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, input.periodDuration - 1);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);

  return {
    ...input,
    cycleLength,
    nextPeriodStart: toDateValue(nextPeriodStart),
    nextPeriodEnd: toDateValue(nextPeriodEnd),
    ovulationDate: toDateValue(ovulationDate),
    fertileWindowStart: toDateValue(fertileWindowStart),
    fertileWindowEnd: toDateValue(ovulationDate),
  };
}
