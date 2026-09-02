import { useEffect, useState } from "react";

/**
 * Console-style typing loop: types `text` out character by character, holds
 * it fully typed for a while, deletes it character by character, holds
 * empty briefly, then repeats — forever. A solid block cursor blinks at
 * the caret position throughout (fast/steady while idle, "solid" while
 * actively typing so it doesn't visually fight the incoming characters).
 */
export default function TypingLoop({
  text,
  typingSpeed = 95,
  deletingSpeed = 45,
  holdFull = 2600,
  holdEmpty = 500,
  className,
}: {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  holdFull?: number;
  holdEmpty?: number;
  className?: string;
}) {
  const [length, setLength] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holdFull" | "deleting" | "holdEmpty">("typing");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (length < text.length) {
        timeout = setTimeout(() => setLength((l) => l + 1), typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("holdFull"), holdFull);
      }
    } else if (phase === "holdFull") {
      timeout = setTimeout(() => setPhase("deleting"), 0);
    } else if (phase === "deleting") {
      if (length > 0) {
        timeout = setTimeout(() => setLength((l) => l - 1), deletingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("holdEmpty"), holdEmpty);
      }
    } else if (phase === "holdEmpty") {
      timeout = setTimeout(() => setPhase("typing"), 0);
    }

    return () => clearTimeout(timeout);
  }, [phase, length, text, typingSpeed, deletingSpeed, holdFull, holdEmpty]);

  const isIdle = phase === "holdFull" || phase === "holdEmpty";

  return (
    <span className={className}>
      {text.slice(0, length)}
      <span
        className={
          isIdle
            ? "animate-blink inline-block h-[1em] w-[0.5em] translate-y-[0.1em] bg-current align-middle"
            : "inline-block h-[1em] w-[0.5em] translate-y-[0.1em] bg-current align-middle opacity-90"
        }
      />
    </span>
  );
}