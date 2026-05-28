import Image from "next/image";
import { appConfig } from "@/lib/config/app";

export function BrandMark({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const wrapperClass = inverted
    ? "inline-flex px-0 py-0"
    : "inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200/80";

  const width = compact ? 220 : 360;
  const height = compact ? 52 : 85;

  return (
    <div className={wrapperClass}>
      <Image
        src="/brand/logo.png"
        alt={appConfig.companyName}
        width={width}
        height={height}
        priority
        className="h-auto max-w-full"
      />
    </div>
  );
}