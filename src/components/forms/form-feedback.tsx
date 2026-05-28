"use client";

export function FormErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-rose-700">{message}</p>;
}

export function SubmitButton({ pending, idleLabel }: { pending: boolean; idleLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Saving..." : idleLabel}
    </button>
  );
}
