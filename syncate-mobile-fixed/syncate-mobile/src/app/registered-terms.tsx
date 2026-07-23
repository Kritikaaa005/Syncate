// Destination: src/app/registered-terms.tsx
//
// The registered-user counterpart to app/terms.tsx. Reached right after
// RegisterScreen's handleSubmit() succeeds — the account exists and
// tokens are saved, but the user hasn't accepted the *registered*
// Terms & Privacy yet (accepting the guest versions earlier doesn't
// count, they're different documents/doc_types).
//
// Structurally identical to terms.tsx's stillDeciding/alreadyAgreed dance,
// just swapping useGuestConsent -> useRegisteredConsent (server-side
// acceptance instead of AsyncStorage) and guest_* -> registered_* doc
// types. See useRegisteredConsent.ts and legal_docs/views.py for why
// recordAgreement() here takes no version argument.

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useLegalDocument } from "@/hooks/useLegalDocument";
import { useRegisteredConsent } from "@/hooks/useRegisteredConsent";
import TermsPrivacyScreen from "@/screens/common/TermsPrivacyScreen";

const colors = guestTheme.mode.light;

export default function RegisteredTermsRoute() {
  const router = useRouter();

  const terms = useLegalDocument("registered_terms");
  const privacy = useLegalDocument("registered_privacy");

  const termsConsent = useRegisteredConsent("registered_terms");
  const privacyConsent = useRegisteredConsent("registered_privacy");

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

  // Same reasoning as terms.tsx: can't answer "does this user still need
  // to see this screen?" until BOTH the acceptance fetch (checked) and
  // the document fetch (loading) have settled.
  const stillDeciding = !checked || loading;

  // TODO: replace "/guest" with the real registered-user home route once
  // it exists (post-onboarding landing screen). Routing here to the guest
  // shell for now just so accepting terms doesn't dead-end — this mirrors
  // the same "coming soon" placeholder pattern already used for
  // guest/insights.tsx etc., not a final decision about where registered
  // users land.
  const nextRoute = "/guest";

  useEffect(() => {
    if (!stillDeciding && alreadyAgreed) {
      router.replace(nextRoute);
    }
  }, [stillDeciding, alreadyAgreed, router]);

  if (stillDeciding || alreadyAgreed) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <TermsPrivacyScreen
      documents={documents}
      loading={loading}
      onAgree={async () => {
        if (terms.document) await termsConsent.recordAgreement();
        if (privacy.document) await privacyConsent.recordAgreement();
        router.replace(nextRoute);
      }}
    />
  );
}
