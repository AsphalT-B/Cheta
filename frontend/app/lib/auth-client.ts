import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [emailOTPClient()],
  fetchOptions: {
    credentials: "include",
  },
});

export const apiBaseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";

export function authErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}
