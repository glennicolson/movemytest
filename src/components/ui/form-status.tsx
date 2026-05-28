"use client";

import { useActionState } from "react";
import { FormErrorMessage, SubmitButton } from "@/components/forms/form-feedback";
import { initialFormActionState, type FormActionState } from "@/features/crm/form-action-state";

export function LeadUpdateForm({
  action,
  leads,
  statusOptions,
  branches,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  leads: {
    id: string;
    status: string;
    source: string | null;
    preferredBranchId: string | null;
    notes: string | null;
  };
  statusOptions: readonly string[];
  branches: Array<{ id: string; name: string; code: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={leads.id} />
      <label className="block text-sm font-medium text-slate-700">
        Status
        <select
          name="status"
          defaultValue={leads.status}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Source
        <input
          name="source"
          defaultValue={leads.source ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="website, referral, walk-in"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Preferred branch
        <select
          name="preferredBranchId"
          defaultValue={leads.preferredBranchId ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">No preference</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Notes
        <textarea
          name="notes"
          defaultValue={leads.notes ?? ""}
          rows={6}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Record conversion notes, constraints, follow-up actions, and context"
        />
      </label>
      <FormErrorMessage message={state.status === "error" ? state.message : undefined} />
      <SubmitButton pending={pending} idleLabel="Save lead updates" />
    </form>
  );
}
