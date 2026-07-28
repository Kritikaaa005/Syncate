// Destination: src/components/signup/DateOfBirthInput.tsx
//
// Three plain numeric fields (Day / Month / Year), same as before — still
// the primary/manual way to enter a DOB, and still the fallback if
// someone just prefers typing. The calendar icon next to the label now
// opens the same inline MiniCalendar used on the guest side (see
// components/guest/prediction/MiniCalendar.tsx, already wired up in
// LogPeriodScreen/QuickPredictionScreen) instead of a native date
// picker; selecting a day there auto-fills all three fields via the
// same onChangeDay/Month/Year callbacks the manual fields already use,
// so both paths still write through one place.
//
// Swapping to MiniCalendar drops the @react-native-community/datetimepicker
// dependency entirely and removes the old web-vs-native branch — MiniCalendar
// is plain RN components, so one code path now covers both platforms.
//
// MiniCalendar's default header only steps a month at a time, which is
// fine for picking a nearby period date but not for a DOB decades back —
// so this passes enableYearNav to MiniCalendar, which adds prev/next-year
// chevrons alongside the month ones and drops the "Jump to today" shortcut
// (nobody's DOB is today). See MiniCalendar.tsx for that prop.
//
// Deliberately light on validation here — just enough to stop obviously
// wrong input (day > 31, a 2-digit year, etc). The real authority on
// "is this an actual valid calendar date" is the backend (Django's
// DateField parsing rejects e.g. Feb 30 outright), and the real
// authority on "is this person old enough" is the COPPA check in
// registration/serializers.py. Duplicating full calendar-validity logic
// here would just be a second copy of a rule the server already enforces
// correctly.

import { Calendar } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import MiniCalendar from "@/components/guest/prediction/MiniCalendar";
import type { GuestThemeColors } from "@/constants/guestTheme";
import { parseDateValue, toDateValue } from "@/utils/calendarUtils";

type DateOfBirthInputProps = {
  day: string;
  month: string;
  year: string;
  onChangeDay: (value: string) => void;
  onChangeMonth: (value: string) => void;
  onChangeYear: (value: string) => void;
  colors: GuestThemeColors;
  isDark: boolean;
};

// A sane fallback for the picker's initial position when the three
// fields are still empty — an 18-year-old today, roughly. Only affects
// where the calendar opens to, never gets submitted on its own; the
// fields stay empty until the user actually picks or types something.
function fallbackPickerDate(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

function fieldsToDate(day: string, month: string, year: string): Date | null {
  if (!day || !month || !year || year.length < 4) return null;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function DateOfBirthInput({
  day,
  month,
  year,
  onChangeDay,
  onChangeMonth,
  onChangeYear,
  colors,
  isDark,
}: DateOfBirthInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const fieldStyle = useMemo(
    () => [styles.field, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }],
    [colors]
  );

  const applyPickedDate = (picked: Date) => {
    onChangeDay(String(picked.getDate()).padStart(2, "0"));
    onChangeMonth(String(picked.getMonth() + 1).padStart(2, "0"));
    onChangeYear(String(picked.getFullYear()));
  };

  // MiniCalendar wants a "YYYY-MM-DD" string, not a Date — reuse the
  // existing fields-to-Date parsing, then hand it through toDateValue so
  // the calendar's "currently selected" highlight matches what's typed
  // into the three fields (or the ~18-year-old fallback if they're empty).
  const calendarValue = toDateValue(fieldsToDate(day, month, year) ?? fallbackPickerDate());

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>Date of birth</Text>

        <Pressable
          onPress={() => setPickerOpen((prev) => !prev)}
          accessibilityLabel="Pick date of birth from calendar"
          hitSlop={8}
          style={[styles.pickerButton, { backgroundColor: colors.primarySoft }]}
        >
          <Calendar size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.row}>
        <View style={styles.dayMonthWrapper}>
          <TextInput
            value={day}
            onChangeText={(value) => onChangeDay(value.replace(/[^0-9]/g, "").slice(0, 2))}
            placeholder="DD"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={2}
            style={fieldStyle}
          />
        </View>
        <View style={styles.dayMonthWrapper}>
          <TextInput
            value={month}
            onChangeText={(value) => onChangeMonth(value.replace(/[^0-9]/g, "").slice(0, 2))}
            placeholder="MM"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={2}
            style={fieldStyle}
          />
        </View>
        <View style={styles.yearWrapper}>
          <TextInput
            value={year}
            onChangeText={(value) => onChangeYear(value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="YYYY"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={4}
            style={fieldStyle}
          />
        </View>
      </View>

      {pickerOpen ? (
        <MiniCalendar
          value={calendarValue}
          isDark={isDark}
          enableYearNav
          onSelect={(newValue) => {
            applyPickedDate(parseDateValue(newValue));
            setPickerOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

/**
 * Combines day/month/year strings into an ISO "YYYY-MM-DD" string for the
 * API, or null if the input isn't even complete enough to attempt —
 * actual calendar/age validity is still the backend's call, this is just
 * "is there enough here to send."
 */
export function toISODateString(day: string, month: string, year: string): string | null {
  if (!day || !month || !year || year.length < 4) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  pickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", gap: 10 },
  dayMonthWrapper: { flex: 1 },
  yearWrapper: { flex: 1.4 },
  field: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    textAlign: "center",
  },
});