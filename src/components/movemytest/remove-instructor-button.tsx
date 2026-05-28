"use client";

import { useActionState } from "react";
import { initialMoveMyTestActionState } from "@/features/movemytest/action-state";
import { updateMoveMyTestInstructorAction } from "@/features/movemytest/actions";

export function RemoveInstructorButton({ listingId }: { listingId: string }) {
  const [, action] = useActionState(updateMoveMyTestInstructorAction, initialMoveMyTestActionState);

  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="hasInstructor" value="no" />
      <button
        type="submit"
        className="rounded-full border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        Remove instructor
      </button>
    </form>
  );
}
