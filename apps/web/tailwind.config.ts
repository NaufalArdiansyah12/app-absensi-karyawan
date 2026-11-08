import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
        primary: { DEFAULT: "#0D6838", hover: "#094F2A", subtle: "#E7F3EC" },
        secondary: { DEFAULT: "#68A61C", hover: "#568A16", subtle: "#F0F8E8" },
        accent: { DEFAULT: "#F08B00", hover: "#CC7600", subtle: "#FEF4E6" },
        info: { DEFAULT: "#0284C7", subtle: "#E0F2FE" },
        error: { DEFAULT: "#DC2626", subtle: "#FDF2F2" },
        canvas: "#F8FAF9",
        surface: { DEFAULT: "#FFFFFF", alt: "#F1F5F3" },
        ink: { DEFAULT: "#1A2E22", soft: "#5F7367" },
        line: { DEFAULT: "#E5EBE7", subtle: "#D1DCD5" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
