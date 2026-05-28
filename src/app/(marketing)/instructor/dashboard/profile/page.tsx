import { getInstructorDashboardData, InstructorProfileSection } from "@/components/movemytest/instructor-dashboard-sections";

export default async function MoveMyTestInstructorProfilePage({ searchParams }: { searchParams?: Promise<{ profile?: string }> }) {
  const [data, params] = await Promise.all([getInstructorDashboardData(), searchParams]);
  return <InstructorProfileSection data={data} profileStatus={params?.profile} />;
}
