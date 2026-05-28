import { getInstructorDashboardData, InstructorLinkedLearnersSection } from "@/components/movemytest/instructor-dashboard-sections";

export default async function MoveMyTestInstructorLinkedLearnersPage() {
  const data = await getInstructorDashboardData();
  return <InstructorLinkedLearnersSection data={data} />;
}
