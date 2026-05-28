import { getInstructorDashboardData, InstructorActionCentreSection } from "@/components/movemytest/instructor-dashboard-sections";

export default async function MoveMyTestInstructorActionCentrePage() {
  const data = await getInstructorDashboardData();
  return <InstructorActionCentreSection data={data} />;
}
