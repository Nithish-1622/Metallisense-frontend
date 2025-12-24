/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Green Palette
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Main brand color
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // Secondary/Accent
        accent: {
          500: "#10b981", // Emerald
          600: "#059669",
        },
        // Status Colors
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
        // Dark Theme Base
        dark: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
