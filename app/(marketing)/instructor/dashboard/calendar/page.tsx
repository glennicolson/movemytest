import { getInstructorDashboardData, InstructorCalendarSection } from "@/components/movemytest/instructor-dashboard-sections";

export default async function MoveMyTestInstructorCalendarPage() {
  const data = await getInstructorDashboardData();
  return <InstructorCalendarSection data={data} />;
}
