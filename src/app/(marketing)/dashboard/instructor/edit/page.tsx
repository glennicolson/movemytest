import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { MoveMyTestInstructorForm } from "@/components/movemytest/movemytest-instructor-form";

export default async function MoveMyTestInstructorEditPage() {
  const session = await requireMoveMyTestSession("/dashboard/instructor/edit");
  const listing = await prisma.listing.findFirst({
    where: { accountId: session.accountId, status: { not: "DELETED" } },
    include: { instructorDetails: true },
    orderBy: { createdAt: "desc" },
  });
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">MoveMyTest Instructor</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          {listing.instructorDetails ? "Edit your instructor details" : "Add an instructor"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {listing.instructorDetails
            ? "Update your instructor's details and how they see your test swap listing."
            : "Link your driving instructor to this MoveMyTest listing. You can add details now or later."}
        </p>
      </div>

      <MoveMyTestInstructorForm
        listingId={listing.id}
        existingDetails={listing.instructorDetails}
      />
    </div>
  );
}
