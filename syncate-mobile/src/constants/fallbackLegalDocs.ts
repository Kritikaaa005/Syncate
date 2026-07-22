// Destination: src/constants/fallbackLegalDocs.ts
//
// Same reasoning as fallbackArticles.ts: if the backend is unreachable,
// the guest should still be able to read *something* and agree — a blank
// or error screen would block onboarding entirely.

import type { BackendLegalDocument } from "@/types/legalDocument";

export const FALLBACK_GUEST_TERMS: BackendLegalDocument = {
  id: "fallback-guest-terms",
  doc_type: "guest_terms",
  title: "Terms of Service",
  version: "1.0",
  effective_date: "",
  content: [
    "Welcome to Syncate. By accessing or using this application, you agree to be bound by these Terms of Service. Please read them carefully before using the app.",
    "Syncate is a personal health companion designed to help you track menstrual cycles, fertility, and general wellness. The information provided within the app is for personal tracking purposes only and does not constitute medical advice.",
    "1. Eligibility\nYou must be at least 13 years of age to use Syncate. If you are under 18, please use the app only with parental or guardian consent.",
    "2. Not Medical Advice\nSyncate provides informational content and tracking tools. None of the content in this application should be interpreted as medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding any health questions or conditions.",
    "3. Guest Mode\nAs a guest, none of your prediction data is stored on our servers — calculations happen locally on your device.",
  ].join("\n\n"),
};

export const FALLBACK_GUEST_PRIVACY: BackendLegalDocument = {
  id: "fallback-guest-privacy",
  doc_type: "guest_privacy",
  title: "Privacy Policy",
  version: "1.0",
  effective_date: "",
  content: [
    "This Privacy Policy explains how Syncate handles information while you use guest mode.",
    "1. What We Don't Collect\nAs a guest, Syncate does not create an account for you and does not store your cycle data on our servers. Predictions are calculated locally on your device.",
    "2. Educational Content\nArticles you read are served from our servers, but reading them isn't tied to any personal identifier.",
  ].join("\n\n"),
};
