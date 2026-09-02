import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const delta = value - start;
    if (delta === 0) return;
    const startTime = performance.now();

    let frame: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + delta * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        prevValue.current = value;
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="animate-count-glow">{display.toLocaleString()}</span>;
}