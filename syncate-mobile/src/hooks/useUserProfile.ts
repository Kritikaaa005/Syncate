import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  addOrResendEmail,
  getMyProfile,
} from "@/services/userService";
import type {
  EmailUpdateResponse,
  UserProfileSummary,
} from "@/types/profile";

function getMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function useUserProfile() {
  const [profile, setProfile] =
    useState<UserProfileSummary | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [savingEmail, setSavingEmail] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadProfile = useCallback(
    async (asRefresh = false) => {
      if (asRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage(null);

      try {
        const result =
          await getMyProfile();

        setProfile(result);
      } catch (error) {
        setErrorMessage(
          getMessage(error)
        );
      } finally {
        if (asRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const submitEmail = useCallback(
    async (
      email: string
    ): Promise<EmailUpdateResponse> => {
      setSavingEmail(true);

      try {
        const result =
          await addOrResendEmail(email);

        setProfile((current) => ({
          nickname:
            current?.nickname ?? "",
          email: result.email,
          is_email_verified:
            result.is_email_verified,
        }));

        return result;
      } finally {
        setSavingEmail(false);
      }
    },
    []
  );

  return {
    profile,
    loading,
    refreshing,
    savingEmail,
    errorMessage,
    reload: () => loadProfile(false),
    refresh: () => loadProfile(true),
    submitEmail,
  };
}
