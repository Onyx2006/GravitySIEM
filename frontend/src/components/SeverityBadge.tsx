import clsx from "clsx";
import type { Severity } from "../types";

const STYLES: Record<string, string> = {
  CRITICAL: "text-severity-critical border-severity-critical/60 shadow-glow-red",
  HIGH: "text-severity-high border-severity-high/50",
  MEDIUM: "text-severity-medium border-severity-medium/50",
  LOW: "text-severity-low border-severity-low/50",
};

export default function SeverityBadge({ severity, className }: { severity: Severity | string; className?: string }) {
  const isCritical = severity === "CRITICAL";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest",
        STYLES[severity] ?? " border-muted/30",
        isCritical && "animate-glow-pulse",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isCritical && (
          <span className="absolute inline-flex h-full w-full animate-ping bg-current opacity-75" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 bg-current" />
      </span>
      {severity}
    </span>
  );
}