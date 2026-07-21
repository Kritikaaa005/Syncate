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
