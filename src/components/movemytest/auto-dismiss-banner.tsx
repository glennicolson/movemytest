"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type BannerProps = {
  kind: "updated" | "deleted";
  message: string;
  detail: string;
  showCreateButton?: boolean;
};

export function AutoDismissBanner({ kind, message, detail, showCreateButton }: BannerProps) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
// Clean the URL param after the banner fades
      const url = new URL(window.location.href);
      const param = kind === "updated" ? "updated" : "deleted";
      url.searchParams.delete(param);
      router.replace(url.pathname + (url.search || "") as any, { scroll: false });
    }, 5000);
    return () => clearTimeout(timer);
  }, [kind, router]);

  if (!visible) return null;

  const isUpdated = kind === "updated";
  const borderColor = isUpdated ? "border-emerald-200" : "border-blue-200";
  const bgColor = isUpdated ? "bg-emerald-50" : "bg-blue-50";
  const iconColor = isUpdated ? "text-emerald-600" : "text-blue-600";
  const titleColor = isUpdated ? "text-emerald-950" : "text-blue-950";
  const textColor = isUpdated ? "text-emerald-800" : "text-blue-800";

  return (
    <div className={`rounded-3xl border ${borderColor} ${bgColor} p-5 shadow-sm transition-opacity duration-500`}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${titleColor}`}>{message}</h3>
          <p className={`mt-1 text-sm ${textColor}`}>{detail}</p>
          {showCreateButton && (
            <button
              onClick={() => router.push("/start")}
              className="mt-3 inline-flex rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white"
            >
              Create a new test swap listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
