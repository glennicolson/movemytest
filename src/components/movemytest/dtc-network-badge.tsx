import { Badge } from "@/components/ui/badge";

interface DtcNetworkBadgeProps {
  className?: string;
}

/**
 * DTC Network Badge
 * 
 * Displays a subtle badge indicating this listing/match originated from
 * The DTC driving school network. Shown on matches and listings in the
 * shared pool to maintain transparency.
 */
export function DtcNetworkBadge({ className = "" }: DtcNetworkBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-semibold px-1.5 py-0.5 ${className}`}
      title="This learner registered via The DTC driving school network"
    >
      DTC Network
    </Badge>
  );
}
