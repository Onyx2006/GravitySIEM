import clsx from "clsx";

const STYLES: Record<string, string> = {
  OPEN: "text-severity-high border-severity-high/50",
  INVESTIGATING: "text-neon-cyan border-neon-cyan/50",
  CONTAINED: "text-severity-medium border-severity-medium/50",
  RESOLVED: "text-matrix-500 border-matrix-500/50",
  FALSE_POSITIVE: " border-muted/30",
  NEW: "text-neon-cyan border-neon-cyan/50",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center border bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest",
        STYLES[status] ?? " border-muted/30"
      )}
    >
      [{status.replace("_", " ")}]
    </span>
  );
}