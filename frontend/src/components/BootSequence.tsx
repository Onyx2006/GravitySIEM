import { useState } from "react";
import Typewriter from "./Typewriter";

const BOOT_LINES = [
  "INITIALIZING GRAVITY SIEM KERNEL...",
  "MOUNTING /var/log/events...",
  "LOADING DETECTION RULE SET [7 RULES]...OK",
  "ESTABLISHING WEBSOCKET UPLINK /ws/events...",
  "SIMULATION MODE: ENGAGED",
  "ALL SYSTEMS NOMINAL. WELCOME, OPERATOR.",
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);

  function handleDone() {
    setTimeout(() => {
      setLeaving(true);
      setTimeout(onComplete, 400);
    }, 350);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-void grid-backdrop transition-opacity duration-400 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-xl px-6">
        <div className="mb-4 flex items-center gap-2 text-matrix-500">
          <span className="text-xs">[GRAVITY-SIEM v1.0.0]</span>
        </div>
        <Typewriter
          lines={BOOT_LINES}
          speed={14}
          lineDelay={150}
          onDone={handleDone}
          className="space-y-1 font-mono text-sm text-matrix-400"
        />
        <div className="mt-6 h-1 w-full overflow-hidden bg-matrix-900">
          <div className="h-full w-full origin-left animate-[scaleIn_2.2s_ease-out_forwards] bg-matrix-500" />
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}