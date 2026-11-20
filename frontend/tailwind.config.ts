import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: "#F5F6F3",
          surface: "#FFFFFF",
          text: "#24343B",
          secondary: "#68777C",
          navy: "#193B4A",
          navyLight: "#234D5F",
          navyDark: "#102631",
          teal: "#4E8276",
          tealLight: "#6BA598",
          tealDark: "#376258",
          border: "#DEE5E1",
          subtleGreen: "#E7F0EA",
          warningAmber: "#B78643",
          warningBg: "#F6EEDC",
          criticalRed: "#B54B4B",
          criticalBg: "#F8E9E7",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "clinical-xs": "0 1px 2px rgba(25, 59, 74, 0.04)",
        "clinical-sm": "0 2px 6px rgba(25, 59, 74, 0.06)",
        "clinical-md": "0 6px 16px rgba(25, 59, 74, 0.08)",
        "clinical-lg": "0 12px 28px rgba(25, 59, 74, 0.10)",
        "clinical-glow": "0 0 20px rgba(78, 130, 118, 0.25)",
        "clinical-alert": "0 0 20px rgba(181, 75, 75, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
export default config;
