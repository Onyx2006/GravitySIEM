import TypingLoop from "./TypingLoop";

export default function GravityMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="shrink-0">
        <rect x="1" y="1" width="24" height="24" stroke="#00FF41" strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="13" cy="13" r="2.2" fill="#00FF41" className="animate-glow-pulse" />
        <circle cx="13" cy="13" r="7" stroke="#00FF41" strokeOpacity="0.5" strokeWidth="1" fill="none" />
        <path d="M13 6 L13 3 M13 20 L13 23 M6 13 L3 13 M20 13 L23 13" stroke="#00FF41" strokeOpacity="0.6" strokeWidth="1" />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className="min-w-[126px] font-mono text-[14px] font-bold tracking-widest text-matrix-500">
            <TypingLoop text="GRAVITY_SIEM" typingSpeed={90} deletingSpeed={40} holdFull={2600} holdEmpty={500} />
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] ">
            root@soc:~#
          </div>
        </div>
      )}
    </div>
  );
}