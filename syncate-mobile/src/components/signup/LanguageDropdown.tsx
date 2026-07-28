// Destination: src/components/signup/LanguageDropdown.tsx
//
// UI ONLY. No backend field, no persistence, no actual translation
// switching — this is purely local component state so the dropdown
// exists to design/interact with. Wiring this up to real i18n (and
// deciding whether/how a language preference gets stored) is a
// teammate's piece of work, not this one.

import { Check, ChevronDown, Globe } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "ne", label: "नेपाली (Nepali)" },
] as const;

type LanguageDropdownProps = {
  colors: GuestThemeColors;
};

export default function LanguageDropdown({ colors }: LanguageDropdownProps) {
  const [selected, setSelected] = useState<(typeof LANGUAGE_OPTIONS)[number]>(LANGUAGE_OPTIONS[0]);
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>Language</Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <Globe size={18} color={colors.muted} />
        <Text style={[styles.triggerText, { color: colors.text }]}>{selected.label}</Text>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            {LANGUAGE_OPTIONS.map((option) => (
              <Pressable
                key={option.code}
                onPress={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                style={styles.option}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                {selected.code === option.code && <Check size={18} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  triggerText: { flex: 1, fontSize: 15 },
  backdrop: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionText: { fontSize: 16 },
});
