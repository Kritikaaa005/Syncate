// LOCATION: syncate-mobile/src/components/dashboard/InlinePeriodEditor.tsx
// (replaces the existing file)
//
// === CHANGED: this used to be an inline card that only let someone
// move a period's start date, and it lived in the normal scroll flow
// above the calendar — easy to lose track of once you scrolled down a
// few months. It's now the calendar's sticky bottom bar: the Edit
// toggle and the Save Changes action both live down here, always
// reachable with a thumb, and it supports the actual ask — tapping
// any number of days (not just one) to mark them as period days,
// whether that grows, shrinks, or starts a brand new period log.

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, PencilLine, X } from "lucide-react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";
import { formatShortDate } from "@/utils/calendarUtils";

type CalendarEditBarProps = {
  theme: GuestThemeColors;
  bottomInset: number;

  isEditMode: boolean;
  onToggleEditMode: () => void;

  // Currently staged (unsaved) selection for this edit session.
  pendingCount: number;
  rangeStart: string | null;
  rangeEnd: string | null;
  // Days inside [rangeStart, rangeEnd] that weren't individually
  // tapped but will be saved as period days anyway, since one period
  // log can only be a single continuous range.
  gapCount: number;
  isEditingExisting: boolean;

  isSubmitting: boolean;
  errorMessage: string;
  savedRangeLabel: string | null;

  onSave: () => void;
  onClearSelection: () => void;
};

function CalendarEditBar({
  theme,
  bottomInset,
  isEditMode,
  onToggleEditMode,
  pendingCount,
  rangeStart,
  rangeEnd,
  gapCount,
  isEditingExisting,
  isSubmitting,
  errorMessage,
  savedRangeLabel,
  onSave,
  onClearSelection,
}: CalendarEditBarProps) {
  const hasSelection = pendingCount > 0 && rangeStart !== null;

  const rangeLabel = rangeStart && rangeEnd
    ? rangeStart === rangeEnd
      ? formatShortDate(rangeStart)
      : `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`
    : "";

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
          paddingBottom: bottomInset + 12,
        },
      ]}
    >
      {errorMessage ? (
        <Text
          style={[styles.errorText, { color: theme.primary }]}
        >
          {errorMessage}
        </Text>
      ) : null}

      {!isEditMode ? (
        <Pressable
          onPress={onToggleEditMode}
          accessibilityRole="button"
          accessibilityLabel="Edit period days"
          style={({ pressed }) => [
            styles.editToggle,
            {
              backgroundColor: theme.primaryButton,
              shadowColor: theme.shadow,
            },
            pressed && styles.pressed,
          ]}
        >
          <PencilLine size={17} strokeWidth={2.2} color="#FFFFFF" />
          <Text style={styles.editToggleText}>Edit period days</Text>
        </Pressable>
      ) : (
        <>
          {hasSelection ? (
            <View
              style={[
                styles.selectionCard,
                {
                  backgroundColor: theme.primarySoft,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.selectionTextArea}>
                <Text
                  style={[styles.eyebrow, { color: theme.muted }]}
                >
                  {isEditingExisting
                    ? "UPDATING PERIOD"
                    : "NEW PERIOD"}
                </Text>

                <Text style={[styles.rangeText, { color: theme.text }]}>
                  {rangeLabel}
                </Text>

                {gapCount > 0 ? (
                  <Text style={[styles.gapNote, { color: theme.muted }]}>
                    {`+${gapCount} day${gapCount === 1 ? "" : "s"} in between will be included too`}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={onClearSelection}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Clear selected days"
                hitSlop={10}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && !isSubmitting && styles.pressed,
                ]}
              >
                <X size={17} color={theme.muted} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.hintRow}>
              {savedRangeLabel ? (
                <View style={styles.hintTextArea}>
                  <Check size={14} strokeWidth={2.6} color={theme.primary} />
                  <Text style={[styles.savedText, { color: theme.primary }]}>
                    {`Saved ${savedRangeLabel}`}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.hintText, { color: theme.muted }]}>
                  Tap any past date to mark it as a period day. Tap it
                  again to remove it.
                </Text>
              )}
            </View>
          )}

          <View style={styles.actionRow}>
            {hasSelection ? (
              <Pressable
                onPress={onSave}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Save period changes"
                accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor: theme.primaryButton,
                    shadowColor: theme.shadow,
                  },
                  isSubmitting && styles.saveButtonDisabled,
                  pressed && !isSubmitting && styles.pressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Check size={17} strokeWidth={2.4} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <Pressable
              onPress={onToggleEditMode}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Finish editing calendar"
              style={({ pressed }) => [
                styles.doneButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                !hasSelection && styles.doneButtonWide,
                pressed && !isSubmitting && styles.pressed,
              ]}
            >
              <Text style={[styles.doneButtonText, { color: theme.text }]}>
                Done
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },

  errorText: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  editToggle: {
    minHeight: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  editToggleText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  selectionCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  selectionTextArea: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  rangeText: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  gapNote: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  hintRow: {
    minHeight: 34,
    marginBottom: 10,
    justifyContent: "center",
  },

  hintText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },

  hintTextArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  savedText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },

  saveButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  saveButtonDisabled: {
    opacity: 0.58,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  doneButton: {
    minWidth: 78,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  doneButtonWide: {
    flex: 1,
  },

  doneButtonText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});

export default CalendarEditBar;