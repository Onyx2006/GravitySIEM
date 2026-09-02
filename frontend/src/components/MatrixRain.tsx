import { useEffect, useRef } from "react";

const CHARS = "01アイウエオカキクケコサシスセソタチツテト日月火水木金土GRAVITY".split("");

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 15;
    let columns = Math.floor(width / fontSize);
    let drops = new Array(columns).fill(1);

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1);
    }
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      return () => window.removeEventListener("resize", resize);
    }

    let animationFrame: number;
    let lastTime = 0;
    const interval = 65;

    function draw(time: number) {
      animationFrame = requestAnimationFrame(draw);
      if (time - lastTime < interval) return;
      lastTime = time;

      ctx!.fillStyle = "rgba(2, 4, 10, 0.12)";
      ctx!.fillRect(0, 0, width, height);

      ctx!.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const isHead = Math.random() > 0.975;
        ctx!.fillStyle = isHead ? "#A8FFC4" : "rgba(0, 255, 65, 0.55)";
        ctx!.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.16]"
      aria-hidden="true"
    />
  );
}