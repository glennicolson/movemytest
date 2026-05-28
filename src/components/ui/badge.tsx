import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  const toneClass = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  }[tone];

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={cn("inline-flex rounded-full font-semibold", sizeClass, toneClass, className)}>
      {children}
    </span>
  );
}
