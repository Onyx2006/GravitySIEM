import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import CountUp from "./CountUp";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "critical" | "accent";
}) {
  return (
    <div
      className={clsx(
        "group relative overflow-hidden border bg-panel/80 p-4 transition-colors",
        tone === "critical" ? "border-severity-critical/40 hover:shadow-glow-red" : "border-border hover:border-matrix-500/50 hover:shadow-glow"
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-matrix-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest ">{label}</p>
        <Icon
          size={15}
          strokeWidth={2}
          className={clsx(
            tone === "critical" && "text-severity-critical",
            tone === "accent" && "text-neon-cyan",
            tone === "default" && "text-matrix-500"
          )}
        />
      </div>
      <p
        className={clsx(
          "mt-2 font-mono text-3xl font-bold tabular-nums",
          tone === "critical" && "text-severity-critical",
          tone === "accent" && "text-neon-cyan",
          tone === "default" && "text-matrix-400"
        )}
      >
        <CountUp value={value} />
      </p>
    </div>
  );
}