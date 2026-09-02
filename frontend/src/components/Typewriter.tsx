import { useEffect, useState } from "react";

export default function Typewriter({
  lines,
  speed = 18,
  lineDelay = 120,
  onDone,
  className,
}: {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const line of lines) {
        if (cancelled) return;
        let current = "";
        for (const char of line) {
          if (cancelled) return;
          current += char;
          setOutput((prev) => [...prev.slice(0, -1), current]);
          await new Promise((r) => setTimeout(r, speed));
        }
        setOutput((prev) => [...prev, ""]);
        await new Promise((r) => setTimeout(r, lineDelay));
      }
      setOutput((prev) => prev.slice(0, -1));
      onDone?.();
    }
    setOutput([""]);
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {output.map((line, idx) => (
        <div key={idx}>
          <span className="text-matrix-500">&gt;</span> {line}
        </div>
      ))}
    </div>
  );
}