"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEST_SWAP_SESSION_COOKIE } from "./session";

export async function logoutMoveMyTestLearnerAction() {
  const cookieStore = await cookies();
// The session cookie is set with path: "/" — delete must match that path.
  cookieStore.set(TEST_SWAP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/" as never);
}
