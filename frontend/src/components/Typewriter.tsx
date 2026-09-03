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
    let lineIndex = 0;
    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function run() {
      if (cancelled) return;
      const line = lines[lineIndex];

      if (line === undefined) {
        setOutput((prev) => prev.slice(0, -1));
        onDone?.();
        return;
      }

      if (charIndex < line.length) {
        charIndex += 1;
        setOutput((prev) => [...prev.slice(0, -1), line.slice(0, charIndex)]);
        timer = setTimeout(run, speed);
        return;
      }

      lineIndex += 1;
      charIndex = 0;
      setOutput((prev) => [...prev, ""]);
      timer = setTimeout(run, lineDelay);
    }

    setOutput([""]);
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
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