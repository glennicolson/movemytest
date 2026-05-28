import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";
import { getInstructorSentInvites } from "@/features/movemytest/instructor-actions";
import { InviteLearnersClient } from "@/components/movemytest/invite-learners-client";
import { prisma } from "@/lib/db/prisma";

export default async function InviteLearnersPage() {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { firstName: true, lastName: true, adiNumber: true, email: true },
  });
  const invites = await getInstructorSentInvites();

  return (
    <InviteLearnersClient
      assignedInstructor={instructor}
      initialInvites={JSON.parse(JSON.stringify(invites))}
    />
  );
}
