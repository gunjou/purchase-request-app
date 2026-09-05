/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",

  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        brand: {
          900: "#3E0703",
          800: "#660B05",
          600: "#8C1007",
          100: "#FFF0C4",
        },

        light: {
          background: "#FFFFFF",
          surface: "#F8FAFC",
          surfaceAlt: "#F1F5F9",

          textPrimary: "#171717",
          textSecondary: "#52525B",
          textMuted: "#71717A",

          border: "#E4E4E7",
          borderLight: "#F4F4F5",

          on: "#16A34A",
        },

        dark: {
          background: "#0F0F10",
          surface: "#18181B",
          surfaceAlt: "#27272A",

          textPrimary: "#FFFFFF",
          textSecondary: "#A1A1AA",
          textMuted: "#71717A",

          border: "#3F3F46",
          borderLight: "#27272A",

          on: "#4ADE80",
        },

        success: {
          dark: "#166534",
          DEFAULT: "#DCFCE7",
        },

        warning: {
          dark: "#B45309",
          light: "#FEF3C7",
        },

        error: {
          dark: "#B91C1C",
          light: "#FEE2E2",
        },

        info: {
          dark: "#1D4ED8",
          light: "#DBEAFE",
        },

        status: {
          requested: {
            light: "#6B7280",
            dark: "#9CA3AF",
          },

          reviewed: {
            light: "#CA8A04",
            dark: "#FACC15",
          },

          approved: {
            light: "#166534",
            dark: "#4ADE80",
          },

          rejected: {
            light: "#B91C1C",
            dark: "#FCA5A5",
          },

          paid: {
            light: "#0284C7",
            dark: "#7DD3FC",
          },
        },
      },
    },
  },

  plugins: [],
};
