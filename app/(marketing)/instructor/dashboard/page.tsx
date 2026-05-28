import { getInstructorDashboardData } from "@/components/movemytest/instructor-dashboard-sections";
import { InstructorHomeDashboard } from "./home-dashboard-client";

export const dynamic = "force-dynamic";

export default async function MoveMyTestInstructorDashboardPage() {
  const data = await getInstructorDashboardData();
  return <InstructorHomeDashboard data={data} />;
}
