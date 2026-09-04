// LOCATION: syncate-mobile/src/utils/periodCalendarEditUtils.ts
//
// Calendar-edit decisions live here instead of inside the screen so the UI
// does not have to guess whether a tap means "new period" or "extend the
// period I am already having". Nothing here changes predictions; it only
// decides which existing PeriodLog a calendar edit should target.

import type { PeriodLogResponse } from "@/services/cycleService";
import { diffInDays, parseDateValue } from "@/utils/calendarUtils";

// CycleProfile currently allows a typical period length up to 10 days.
// An edit within this window is treated as a likely continuation of the
// same period rather than silently creating another cycle anchor.
const MAX_INITIAL_PERIOD_SPAN_DAYS = 10;

function periodEnd(period: PeriodLogResponse): string {
  return period.end_date ?? period.start_date;
}

export function periodOverlapsRange(
  period: PeriodLogResponse,
  rangeStart: string,
  rangeEnd: string
): boolean {
  const end = periodEnd(period);
  return rangeStart <= end && rangeEnd >= period.start_date;
}

function daysBetween(later: string, earlier: string): number {
  return diffInDays(parseDateValue(later), parseDateValue(earlier));
}

export function periodCanExtendToRange(
  period: PeriodLogResponse,
  rangeStart: string,
  rangeEnd: string
): boolean {
  if (periodOverlapsRange(period, rangeStart, rangeEnd)) {
    return true;
  }

  const end = periodEnd(period);

  // Directly before/after a confirmed range is an obvious extension.
  if (daysBetween(rangeStart, end) === 1) {
    return true;
  }

  if (daysBetween(period.start_date, rangeEnd) === 1) {
    return true;
  }

  // Important for the "started Aug 29, still bleeding Sep 3" flow.
  // A newly-started period may only have a start_date saved, while the
  // following menstrual days are still estimates. A later tap within a
  // plausible initial span should extend that row instead of creating a
  // brand-new PeriodLog (which would restart another menstrual estimate).
  const selectionStartsAfterPeriod = rangeStart > period.start_date;
  const daysFromStartToSelectionEnd = daysBetween(
    rangeEnd,
    period.start_date
  );

  return (
    selectionStartsAfterPeriod
    && daysFromStartToSelectionEnd >= 1
    && daysFromStartToSelectionEnd < MAX_INITIAL_PERIOD_SPAN_DAYS
  );
}

export function getPeriodEditCandidates(
  periods: PeriodLogResponse[],
  rangeStart: string,
  rangeEnd: string
): PeriodLogResponse[] {
  const directMatches = periods.filter((period) =>
    periodOverlapsRange(period, rangeStart, rangeEnd)
  );

  if (directMatches.length > 0) {
    return directMatches;
  }

  return periods.filter((period) =>
    periodCanExtendToRange(period, rangeStart, rangeEnd)
  );
}

export function getLatestPeriod(
  periods: PeriodLogResponse[]
): PeriodLogResponse | null {
  if (periods.length === 0) {
    return null;
  }

  return periods.reduce((latest, period) =>
    period.start_date > latest.start_date ? period : latest
  );
}

export function shouldPromptForEarlyPeriodStart({
  selectedDate,
  estimatedNextPeriodDate,
  latestPeriod,
  hasEditTarget,
}: {
  selectedDate: string;
  estimatedNextPeriodDate: string | null | undefined;
  latestPeriod: PeriodLogResponse | null;
  hasEditTarget: boolean;
}): boolean {
  if (
    hasEditTarget
    || !estimatedNextPeriodDate
    || !latestPeriod
  ) {
    return false;
  }

  // Only call this an "early start" when the date is genuinely after the
  // latest known period and before the currently estimated next start.
  return (
    selectedDate > latestPeriod.start_date
    && selectedDate < estimatedNextPeriodDate
  );
}
