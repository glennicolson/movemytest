export type MfaSetupActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  secretBase32?: string;
  qrDataUrl?: string;
  backupCodes?: string[];
  hasActiveTotp?: boolean;
  activeFactorLabel?: string | null;
};

export type MfaVerifyActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  backupCodes?: string[];
  hasActiveTotp?: boolean;
  activeFactorLabel?: string | null;
};

export const initialMfaSetupActionState: MfaSetupActionState = { status: "idle" };
export const initialMfaVerifyActionState: MfaVerifyActionState = { status: "idle" };
