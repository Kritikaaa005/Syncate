// Destination: src/types/auth.ts

export type RegisterRequest = {
  date_of_birth: string; // "YYYY-MM-DD"
  email?: string;
  password?: string;
};

export type RegisterResponse = {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    is_email_verified: boolean;
    email_verification_sent: boolean;
  };
};

// Shape of a 400 from the backend — DRF returns { field_name: ["msg", ...] }
// for validation errors, so date_of_birth/email/password errors all land
// as arrays under their own key. Kept as a type here so both the service
// and the screen agree on how to read one.
export type RegistrationErrorResponse = {
  date_of_birth?: string[];
  email?: string[];
  password?: string[];
  detail?: string;
};
