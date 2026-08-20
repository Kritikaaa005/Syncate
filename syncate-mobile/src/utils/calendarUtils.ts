export type CalendarCell = { date: Date; inMonth: boolean };

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function diffInDays(a: Date, b: Date): number {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startA.getTime() - startB.getTime()) / 86_400_000);
}

export function formatDisplayDate(value: string): string {
  if (!value) return "Select a date";
  return parseDateValue(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Compact form for chips/summaries where a full "August 6, 2026" is too
// wide, e.g. inside the sticky calendar edit bar.
export function formatShortDate(value: string): string {
  if (!value) return "";
  return parseDateValue(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Every date string from `start` to `end` inclusive, ascending. Used to
// seed a multi-day selection from a period log's stored start/end so
// the whole thing can be edited (grown or shrunk), not just its start.
export function enumerateDateRange(start: string, end: string): string[] {
  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);
  const dates: string[] = [];

  let cursor = startDate;
  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(toDateValue(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function getCalendarCells(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  for (let day = 1; day <= daysInMonth; day++) cells.push({ date: new Date(year, month, day), inMonth: true });
  let nextDay = 1;
  while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, nextDay++), inMonth: false });
  return cells;
}

export function getCalendarCellsMonFirst(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  for (let day = 1; day <= daysInMonth; day++) cells.push({ date: new Date(year, month, day), inMonth: true });
  let nextDay = 1;
  while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, nextDay++), inMonth: false });
  return cells;
}