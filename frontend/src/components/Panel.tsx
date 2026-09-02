import type { ReactNode } from "react";
import clsx from "clsx";

export default function Panel({
  title,
  action,
  children,
  className,
  glow = false,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative border border-border bg-panel/80 backdrop-blur-sm",
        glow && "shadow-glow",
        className
      )}
    >
      <span className="absolute -left-px -top-px h-2 w-2 border-l border-t border-matrix-500/70" />
      <span className="absolute -right-px -top-px h-2 w-2 border-r border-t border-matrix-500/70" />
      <span className="absolute -bottom-px -left-px h-2 w-2 border-b border-l border-matrix-500/70" />
      <span className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-matrix-500/70" />

      {title && (
        <div className="flex items-center justify-between border-b border-border bg-black/30 px-4 py-2.5">
          <h2 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-matrix-500">
            <span className="">$</span> {title}
          </h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}