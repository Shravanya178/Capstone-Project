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
          teal: "#4E8276",
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
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
export default config;
