// Destination: src/app/terms.tsx

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useGuestConsent } from "@/hooks/useGuestConsent";
import { useLegalDocument } from "@/hooks/useLegalDocument";
import TermsPrivacyScreen from "@/screens/common/TermsPrivacyScreen";

const colors = guestTheme.mode.light;

export default function TermsRoute() {
  const router = useRouter();

  const terms = useLegalDocument("guest_terms");
  const privacy = useLegalDocument("guest_privacy");

  const termsConsent = useGuestConsent("guest_terms");
  const privacyConsent = useGuestConsent("guest_privacy");

  const documents = [terms.document, privacy.document].filter(
    (doc): doc is NonNullable<typeof doc> => doc !== null
  );
  const loading = terms.loading || privacy.loading;

  const checked = termsConsent.checked && privacyConsent.checked;
  const alreadyAgreed =
    !!terms.document &&
    !!privacy.document &&
    termsConsent.hasAgreedToVersion(terms.document.version) &&
    privacyConsent.hasAgreedToVersion(privacy.document.version);

  // We can't honestly answer "does this guest need to see the Terms
  // screen?" until BOTH of these have settled: the local consent check
  // (checked) AND the document fetch (loading) — alreadyAgreed compares
  // against terms.document/privacy.document, which are still null while
  // loading. If we only waited on `checked`, a returning guest whose
  // consent-check resolves before the network fetch does would briefly
  // see the full Terms screen (with its loading spinner) before flipping
  // to the /guest redirect — exactly the flash this blank frame exists to
  // avoid.
  const stillDeciding = !checked || loading;

  useEffect(() => {
    if (!stillDeciding && alreadyAgreed) {
      router.replace("/guest");
    }
  }, [stillDeciding, alreadyAgreed, router]);

  if (stillDeciding || alreadyAgreed) {
    // Blank frame in the same background color while we decide whether
    // to skip straight to /guest — avoids a flash of terms content for
    // returning guests who already agreed to both documents.
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <TermsPrivacyScreen
      documents={documents}
      loading={loading}
      onAgree={async () => {
        if (terms.document) await termsConsent.recordAgreement(terms.document.version);
        if (privacy.document) await privacyConsent.recordAgreement(privacy.document.version);
        router.replace("/guest");
      }}
    />
  );
}