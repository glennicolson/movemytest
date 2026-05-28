import type { AuthDeliveryPackage } from "@/lib/auth/delivery";
import type { AuthDeliveryDispatchResult } from "@/lib/auth/transport";

export type AuthLinkActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  linkPath?: string;
  linkUrl?: string;
  delivery?: AuthDeliveryPackage;
  transport?: AuthDeliveryDispatchResult;
};

export type PasswordSetActionState = {
  status: "idle" | "error";
  message?: string;
};

export type RegistrationActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export type PasswordResetEmailRequestActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export type SignInActionState = {
  status: "idle" | "error" | "mfa-required";
  error?: string;
  challengeMessage?: string;
};

export const initialAuthLinkActionState: AuthLinkActionState = { status: "idle" };
export const initialPasswordSetActionState: PasswordSetActionState = { status: "idle" };
export const initialRegistrationActionState: RegistrationActionState = { status: "idle" };
export const initialPasswordResetEmailRequestActionState: PasswordResetEmailRequestActionState = { status: "idle" };
export const initialSignInActionState: SignInActionState = { status: "idle" };
