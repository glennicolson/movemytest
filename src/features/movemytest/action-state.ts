export type MoveMyTestActionState = { status: "idle" | "success" | "error"; message: string };

export const initialMoveMyTestActionState: MoveMyTestActionState = { status: "idle", message: "" };
