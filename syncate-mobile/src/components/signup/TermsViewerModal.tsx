// Destination: src/components/signup/TermsViewerModal.tsx
//
// The "Learn more" counterpart to TermsPrivacyScreen — same document
// fetch, same LegalDocumentBody renderer, but this one is read-only: a
// modal you close, not a gate you agree past. Agreement itself now lives
// on the registration form's checkbox (see RegisterScreen.tsx); this
// component exists purely so someone can actually read what they're
// ticking before they tick it.

import { X } from "lucide-react-native";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LegalDocumentBody from "@/components/common/LegalDocumentBody";
import type { GuestThemeColors } from "@/constants/guestTheme";
import type { BackendLegalDocument } from "@/types/legalDocument";

type TermsViewerModalProps = {
  visible: boolean;
  documents: BackendLegalDocument[];
  loading: boolean;
  colors: GuestThemeColors;
  onClose: () => void;
};

export default function TermsViewerModal({ visible, documents, loading, colors, onClose }: TermsViewerModalProps) {
  const ready = documents.length > 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Terms & Privacy</Text>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            hitSlop={8}
            style={[styles.closeButton, { backgroundColor: colors.primarySoft }]}
          >
            <X size={18} color={colors.primaryButton} />
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {loading && !ready ? (
            <ActivityIndicator color={colors.primaryButton} style={styles.loadingSpinner} />
          ) : (
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
              {documents.map((document, index) => (
                <View
                  key={document.doc_type}
                  style={index > 0 ? [styles.documentSpacing, { borderTopColor: colors.border }] : undefined}
                >
                  <Text style={[styles.documentTitle, { color: colors.text }]}>{document.title}</Text>
                  <LegalDocumentBody content={document.content} headingColor={colors.text} bodyColor={colors.muted} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Full-width close button using theme primaryButton color */}
        <Pressable
          onPress={onClose}
          style={[styles.closeBarButton, { backgroundColor: colors.primaryButton }]}
        >
          <Text style={styles.closeBarButtonText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  card: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  scrollContent: { padding: 18 },
  documentTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  documentSpacing: { marginTop: 28, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth },
  loadingSpinner: { marginTop: 40 },
  closeBarButton: {
    marginTop: 16,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeBarButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});