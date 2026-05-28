import { getInstructorDashboardData } from "@/components/movemytest/instructor-dashboard-sections";
import { InstructorMoveMyTestSummary } from "./movemytest-summary-client";

export const dynamic = "force-dynamic";

export default async function InstructorMoveMyTestPage() {
  const data = await getInstructorDashboardData();
  return <InstructorMoveMyTestSummary data={data} />;
}
