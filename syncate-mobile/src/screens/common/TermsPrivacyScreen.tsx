// Destination: src/screens/common/TermsPrivacyScreen.tsx
//
// Light mode only, same reasoning as SplashScreen — this is pre-account
// onboarding, shown before the user has any theme preference to honor.
//
// Doesn't fetch data (documents are passed in) and doesn't decide where
// to navigate after agreeing (onAgree is provided by the caller) — this
// file only owns layout: header, scrollable multi-section body, sticky
// agree button.

import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import LegalDocumentBody from "@/components/common/LegalDocumentBody";
import { guestTheme } from "@/constants/guestTheme";
import type { BackendLegalDocument } from "@/types/legalDocument";

const colors = guestTheme.mode.light;

type TermsPrivacyScreenProps = {
  documents: BackendLegalDocument[];
  loading: boolean;
  onAgree: () => void;
};

export default function TermsPrivacyScreen({ documents, loading, onAgree }: TermsPrivacyScreenProps) {
  const ready = documents.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>BEFORE YOU BEGIN</Text>
        <Text style={[styles.title, { color: colors.text }]}>Terms & Privacy</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Please read and agree to continue using Syncate.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {loading && !ready ? (
          <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
        ) : (
          <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
            {documents.map((document, index) => (
              <View key={document.doc_type} style={index > 0 ? styles.documentSpacing : undefined}>
                <Text style={[styles.documentTitle, { color: colors.text }]}>{document.title}</Text>
                <LegalDocumentBody
                  content={document.content}
                  headingColor={colors.text}
                  bodyColor={colors.muted}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={[styles.agreeButton, { backgroundColor: colors.primaryButton }]}
        onPress={onAgree}
        disabled={!ready}
      >
        <Text style={styles.agreeButtonText}>I Agree & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  scrollContent: {
    padding: 18,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  documentSpacing: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#00000022",
  },
  loadingSpinner: {
    marginTop: 40,
  },
  agreeButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  agreeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});