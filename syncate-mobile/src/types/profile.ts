export type UserProfileSummary = {
  nickname: string;
  email: string;
  is_email_verified: boolean;
};

export type EmailUpdateResponse = {
  email: string;
  is_email_verified: boolean;
  email_verification_sent: boolean;
  message: string;
};
