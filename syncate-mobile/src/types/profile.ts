export type UserProfileSummary = {
  nickname: string;
  email: string;
  is_email_verified: boolean;
  // === NEW: whether the account can currently sign in with a
  // password (Django's has_usable_password()). Drives ProfilePasswordScreen —
  // whether it asks for a current password first.
  has_password: boolean;
};

export type EmailUpdateResponse = {
  email: string;
  is_email_verified: boolean;
  email_verification_sent: boolean;
  message: string;
};

// === NEW: for ProfilePasswordScreen / passwordService.ts.
export type SetPasswordResponse = {
  message: string;
};