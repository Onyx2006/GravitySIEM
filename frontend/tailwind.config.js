/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#02040A",
        panel: "#060B10",
        "panel-raised": "#0A1420",
        border: "#1B3548",
        "border-bright": "#2A5240",
        muted: "#93B0AA",
        "muted-dim": "#6C8B84",
        ink: "#EAFFF4",
        matrix: {
          900: "#001A0D",
          800: "#003318",
          700: "#00521F",
          600: "#00B84A",
          500: "#00FF41",
          400: "#5CFF8F",
          300: "#A8FFC4",
          200: "#D3FFE4",
        },
        neon: {
          cyan: "#00F0FF",
          magenta: "#FF2ED1",
          amber: "#FFB800",
        },
        severity: {
          critical: "#FF2447",
          high: "#FF9F1C",
          medium: "#F5D90A",
          low: "#00F0FF",
        },
      },
      fontFamily: {
        display: ["'JetBrains Mono'", "monospace"],
        body: ["'JetBrains Mono'", "monospace"],
        mono: ["'JetBrains Mono'", "monospace"],
        pixel: ["'VT323'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,255,65,0.25), 0 0 20px rgba(0,255,65,0.15)",
        "glow-strong": "0 0 0 1px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.35), 0 0 80px rgba(0,255,65,0.1)",
        "glow-red": "0 0 0 1px rgba(255,36,71,0.5), 0 0 30px rgba(255,36,71,0.35)",
        "glow-cyan": "0 0 0 1px rgba(0,240,255,0.4), 0 0 24px rgba(0,240,255,0.25)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.6" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.4" },
          "97%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.7", filter: "brightness(1.4)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "border-scan": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-2px,1px)" },
          "40%": { transform: "translate(-1px,-1px)" },
          "60%": { transform: "translate(2px,1px)" },
          "80%": { transform: "translate(1px,-1px)" },
        },
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-glow": {
          "0%": { textShadow: "0 0 20px currentColor" },
          "100%": { textShadow: "0 0 4px currentColor" },
        },
      },
      animation: {
        scanline: "scanline 6s linear infinite",
        flicker: "flicker 6s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        "border-scan": "border-scan 3s linear infinite",
        glitch: "glitch 0.25s steps(2) infinite",
        "fade-slide-in": "fade-slide-in 0.25s ease-out",
        "count-glow": "count-glow 0.4s ease-out",
      },
    },
  },
  plugins: [],
};