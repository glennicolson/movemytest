"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function SignOutForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <form action={action}>
      <input type="hidden" name="currentPath" value={currentPath} />
      <button type="submit" className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
        Sign out
      </button>
    </form>
  );
}
