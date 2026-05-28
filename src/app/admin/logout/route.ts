import { staffLogout } from "@/features/admin/auth";

export async function POST() {
  await staffLogout();
}
