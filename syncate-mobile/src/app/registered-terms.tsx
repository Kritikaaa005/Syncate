import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { useLegalDocument } from "@/hooks/useLegalDocument";
import { useRegisteredConsent } from "@/hooks/useRegisteredConsent";
import TermsPrivacyScreen from "@/screens/common/TermsPrivacyScreen";

const NEXT_ROUTE = "/onboarding/nickname" as const;

export default function RegisteredTermsRoute() {
  const router = useRouter();
  const { colors } = useTheme();

  const terms = useLegalDocument(
    "registered_terms"
  );

  const privacy = useLegalDocument(
    "registered_privacy"
  );

  const termsConsent =
    useRegisteredConsent(
      "registered_terms"
    );

  const privacyConsent =
    useRegisteredConsent(
      "registered_privacy"
    );

  const documents = [
    terms.document,
    privacy.document,
  ].filter(
    (
      document
    ): document is NonNullable<
      typeof document
    > => document !== null
  );

  const loading =
    terms.loading || privacy.loading;

  const checked =
    termsConsent.checked
    && privacyConsent.checked;

  const alreadyAgreed =
    Boolean(terms.document)
    && Boolean(privacy.document)
    && termsConsent.hasAgreedToVersion(
      terms.document!.version
    )
    && privacyConsent.hasAgreedToVersion(
      privacy.document!.version
    );

  const stillDeciding =
    !checked || loading;

  useEffect(() => {
    if (
      !stillDeciding
      && alreadyAgreed
    ) {
      router.replace(NEXT_ROUTE);
    }
  }, [
    alreadyAgreed,
    router,
    stillDeciding,
  ]);

  if (
    stillDeciding
    || alreadyAgreed
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            colors.background,
        }}
      />
    );
  }

  const handleAgree = async () => {
    if (terms.document) {
      await termsConsent.recordAgreement();
    }

    if (privacy.document) {
      await privacyConsent.recordAgreement();
    }

    router.replace(NEXT_ROUTE);
  };

  return (
    <TermsPrivacyScreen
      documents={documents}
      loading={loading}
      onAgree={handleAgree}
    />
  );
}
