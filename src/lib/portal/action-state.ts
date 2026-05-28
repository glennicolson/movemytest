export type PortalAcknowledgeState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialPortalAcknowledgeState: PortalAcknowledgeState = { status: "idle" };
