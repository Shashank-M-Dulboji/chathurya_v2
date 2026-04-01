import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon:       "#dcf763",
        "neon-dim": "#8a9e3d",
        slate:      "#3a4448",
        muted:      "#666666",
        light:      "#999999",
        "off-white":"#ebebeb",
        black:      "#0a0a0a",
        dark:       "#0d0d0d",
        surface:    "#161616",
        border:     "#222222",
        "border-light": "#2e2e2e",
      },
      fontFamily: {
        michroma: ["var(--font-michroma)", "sans-serif"],
        ronzino:  ["var(--font-michroma)", "sans-serif"],
        inter:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:     ["JetBrains Mono", "Courier New", "monospace"],
        sans:     ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "logo-flicker": "logoFlicker 5s infinite",
        "scan-h": "scanH 6s linear infinite",
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "ticker": "ticker 25s linear infinite",
      },
      keyframes: {
        logoFlicker: {
          "0%,88%,90%,92%,94%,97%,100%": { opacity: "1" },
          "89%": { opacity: "0.15" },
          "91%": { opacity: "0.8" },
          "93%": { opacity: "0.05" },
          "95%": { opacity: "0.9" },
          "96%": { opacity: "0.3" },
        },
        scanH: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        pulseNeon: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(220,247,99,0)" },
          "50%":     { boxShadow: "0 0 20px 2px rgba(220,247,99,0.12)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
