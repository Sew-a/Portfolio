import type { AuthMode } from "@/src/store/types";

export const AUTH_TABS: { mode: AuthMode; label: string; title: string }[] = [
  { mode: "signin", label: "Sign in", title: "Welcome back" },
  { mode: "signup", label: "Sign up", title: "Create an account" },
];

export const PASSWORD_MIN_LENGTH = 8;

// Mirrors the backend UpdateProfileDto limits.
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 32;
